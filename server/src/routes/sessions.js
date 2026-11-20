import crypto from "node:crypto";
import zlib from "node:zlib";
import { Router } from "express";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { HttpError, forbidden, notFound, parseBody } from "../lib/errors.js";
import {
  eventDoc,
  participantDoc,
  resultDoc,
  sessionDoc,
  sessionResultDoc,
} from "../lib/serialize.js";
import { consumeDaily } from "../lib/limits.js";
import { emitSessionUpdate, emitToAdmins } from "../lib/realtime.js";
import { maybeUpdateLeaderboard } from "../lib/leaderboard.js";
import { routeFor, scoreAttempt, stripSections } from "../lib/satScoring.js";
import { requirePerm } from "../middleware/auth.js";
import { hasPerm } from "../lib/permissions.js";
import { perUserLimit } from "../lib/limiters.js";

// 6 xonali kodni taxmin qilib topishga qarshi (lookup va join).
const codeLimit = perUserLimit({ windowMs: 10 * 60 * 1000, limit: 20 });

// ------------------------------------------------------------------
// Admin tashkil qilgan testlar (kod bilan yoki doimiy ochiq).
//
// XAVFSIZLIK MODELI (avvalgi firestore.rules bilan bir xil):
//   - meta (nom, jadval, holat) — har bir login qilgan foydalanuvchiga;
//     `code` esa faqat adminga ko'rinadi.
//   - content (savollar) — faqat admin va sessiyaga rasman qo'shilgan
//     (participant qatori bor) foydalanuvchiga; ishtirokchiga KALITSIZ
//     (to'g'ri javoblar, tushuntirishlar yo'q) va test vaqti kelgandagina.
//   - Module 2 yo'nalishi va ball serverda hisoblanadi (/route, /finish).
//   - "code" turidagi testga qo'shilish uchun to'g'ri kod SHART.
// ------------------------------------------------------------------

const router = Router();
const requireSessions = requirePerm("sessions");

const QUESTION_KEYS = ["module1", "module2Easy", "module2Hard", "module2Mixed"];

const sessionBody = z.object({
  title: z.string().trim().min(1, "Test nomini kiriting.").max(200),
  accessType: z.enum(["open", "code"]),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
  sections: z.array(z.object({ id: z.string() }).passthrough()).max(10),
});

const PARTICIPANT_STATUSES = ["not_started", "active", "paused", "terminated", "finished"];

function randomCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// Savollarni meta'dan ajratib, alohida `content` ustuniga qo'yamiz.
// Meta'da faqat savollar soni qoladi (testlar ro'yxatida ko'rsatish uchun).
function splitSections(sections) {
  const meta = sections.map((s) => {
    const copy = { ...s };
    for (const k of QUESTION_KEYS) delete copy[k];
    const len = (k) => (Array.isArray(s[k]) ? s[k].length : 0);
    const module2 = len("module2Mixed") || Math.max(len("module2Easy"), len("module2Hard"));
    copy.questionCount = len("module1") + module2;
    return copy;
  });
  return { meta, content: { sections } };
}

// Kodli testning vaqti hali kelmagan bo'lsa savollar (to'g'ri javoblar
// bilan) hech kimga — admindan tashqari — berilmaydi.
const notStarted = (s) =>
  s.access_type !== "open" && s.scheduled_at && new Date(s.scheduled_at).getTime() > Date.now();

// Kodli test bir marta topshiriladi; "doimiy ochiq" testni qayta yechish mumkin.
async function hasFinishedOnce(s, userId) {
  if (s.access_type === "open") return false;
  return !!(await one("SELECT 1 FROM session_results WHERE session_id = $1 AND user_id = $2", [
    s.id,
    userId,
  ]));
}

const alreadyFinished = () =>
  new HttpError(409, "already-finished", "Siz bu testni allaqachon topshirgansiz.");

// `content` (savollar, rasmlar base64) og'ir — ro'yxat va meta so'rovlari
// uni o'qimaydi. Kerak bo'lganda getContent() orqali olinadi.
const META_COLUMNS = "id, code, access_type, status, scheduled_at, meta, created_at, updated_at";

async function getSession(id) {
  const s = await one(`SELECT ${META_COLUMNS} FROM test_sessions WHERE id = $1`, [id]);
  if (!s) throw notFound("Test topilmadi.");
  return s;
}

// Savollar xotirada keshlanadi (updated_at bo'yicha): test boshlanganda
// yuzlab talaba bir vaqtda /join, /content, /route, /finish chaqiradi —
// har safar bazadan bir necha MB JSON o'qib, kalitlarni olib tashlash
// o'rniga tayyor nusxa ishlatiladi. Tahrirlansa updated_at o'zgaradi.
const contentCache = new Map();

async function getContent(s) {
  const version = new Date(s.updated_at).getTime();
  const hit = contentCache.get(s.id);
  if (hit && hit.version === version) return hit;
  const row = await one("SELECT content, updated_at FROM test_sessions WHERE id = $1", [s.id]);
  if (!row) throw notFound("Test topilmadi.");
  const sections = row.content?.sections || [];
  // Ishtirokchiga beriladigan savollar — to'g'ri javoblar va tushuntirishlarsiz.
  // Rasmlar bilan bir necha MB bo'ladi: JSON va uning gzip nusxasi bir marta
  // tayyorlanadi, har so'rovda qayta stringify/siqish qilinmaydi.
  const publicJson = JSON.stringify({ sections: stripSections(sections) });
  const entry = {
    version: new Date(row.updated_at).getTime(),
    full: row.content,
    publicJson,
    publicGzip: zlib.gzipSync(publicJson, { level: 6 }),
    // Baholash uchun bo'limlar (kalitlar bilan) — barcha modul massivlari mavjud.
    keyed: sections.map((sec) => ({
      id: sec.id,
      module1: sec.module1 || [],
      module2Easy: sec.module2Easy || [],
      module2Hard: sec.module2Hard || [],
      module2Mixed: sec.module2Mixed || [],
    })),
  };
  contentCache.set(s.id, entry);
  return entry;
}

function sendJson(res, json, gzip) {
  res.type("application/json");
  res.set("Cache-Control", "private, no-store");
  if (gzip && res.req.acceptsEncodings("gzip") === "gzip") {
    res.set("Content-Encoding", "gzip");
    res.set("Vary", "Accept-Encoding");
    return res.send(gzip);
  }
  return res.send(json);
}

function broadcast(s) {
  emitSessionUpdate(s.id, sessionDoc(s), sessionDoc(s, { includeCode: true }));
}

async function getParticipant(sessionId, userId) {
  return one("SELECT * FROM session_participants WHERE session_id = $1 AND user_id = $2", [
    sessionId,
    userId,
  ]);
}

async function requireParticipant(req) {
  const p = await getParticipant(req.params.id, req.user.id);
  if (!p) throw forbidden("Avval testga qo'shiling.");
  return p;
}

const studentName = (user) => user.display_name || user.email.split("@")[0] || "Student";

// ------------------------------------------------------------------
// Ro'yxat va meta
// ------------------------------------------------------------------

router.get("/", async (req, res) => {
  const isAdmin = hasPerm(req.user, "sessions");
  const { rows } = await query(
    isAdmin
      ? `SELECT ${META_COLUMNS} FROM test_sessions ORDER BY scheduled_at DESC NULLS LAST, created_at DESC`
      : `SELECT ${META_COLUMNS} FROM test_sessions WHERE access_type = 'open' AND status <> 'closed'
         ORDER BY created_at DESC`
  );
  res.json(rows.map((s) => sessionDoc(s, { includeCode: isAdmin })));
});

// Kod bo'yicha qidirish (JoinSession sahifasi).
router.post("/lookup", codeLimit, async (req, res) => {
  const { code } = parseBody(z.object({ code: z.string().trim().regex(/^\d{6}$/) }), req.body);
  const s = await one(`SELECT ${META_COLUMNS} FROM test_sessions WHERE code = $1`, [code]);
  if (!s) throw notFound("Bunday kod bilan test topilmadi.");
  res.json(sessionDoc(s));
});

router.get("/:id", async (req, res) => {
  const s = await getSession(req.params.id);
  res.json(sessionDoc(s, { includeCode: hasPerm(req.user, "sessions") }));
});

// ------------------------------------------------------------------
// Admin: yaratish / tahrirlash / yopish
// ------------------------------------------------------------------

router.post("/", requireSessions, async (req, res) => {
  const body = parseBody(sessionBody, req.body);
  const { meta, content } = splitSections(body.sections);
  const scheduledAt = body.accessType === "open" ? null : body.scheduledAt || null;

  // Kod unikal bo'lishi kerak — to'qnashuv bo'lsa qayta urinamiz.
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const s = await one(
        `INSERT INTO test_sessions (id, code, access_type, status, scheduled_at, meta, content)
         VALUES ($1, $2, $3, 'scheduled', $4, $5, $6) RETURNING ${META_COLUMNS}`,
        [
          crypto.randomUUID(),
          randomCode(),
          body.accessType,
          scheduledAt,
          {
            title: body.title,
            sections: meta,
            createdBy: req.user.id,
            createdByName: req.user.display_name || req.user.email,
          },
          content,
        ]
      );
      return res.status(201).json(sessionDoc(s, { includeCode: true }));
    } catch (err) {
      if (err.code !== "23505") throw err;
    }
  }
  throw new HttpError(500, "internal", "Yagona kod yaratib bo'lmadi. Qaytadan urinib ko'ring.");
});

router.put("/:id", requireSessions, async (req, res) => {
  const body = parseBody(sessionBody, req.body);
  const { meta, content } = splitSections(body.sections);
  const s = await one(
    `UPDATE test_sessions
       SET access_type = $2, scheduled_at = $3,
           meta = meta || $4::jsonb, content = $5, updated_at = now()
     WHERE id = $1 RETURNING ${META_COLUMNS}`,
    [
      req.params.id,
      body.accessType,
      body.accessType === "open" ? null : body.scheduledAt || null,
      { title: body.title, sections: meta },
      content,
    ]
  );
  if (!s) throw notFound("Test topilmadi.");
  broadcast(s);
  res.json(sessionDoc(s, { includeCode: true }));
});

router.patch("/:id/status", requireSessions, async (req, res) => {
  const { status } = parseBody(
    z.object({ status: z.enum(["scheduled", "closed"]) }),
    req.body
  );
  const s = await one(
    `UPDATE test_sessions SET status = $2, updated_at = now() WHERE id = $1 RETURNING ${META_COLUMNS}`,
    [req.params.id, status]
  );
  if (!s) throw notFound("Test topilmadi.");
  broadcast(s);
  res.json(sessionDoc(s, { includeCode: true }));
});

router.post("/:id/regenerate-code", requireSessions, async (req, res) => {
  await getSession(req.params.id);
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const s = await one(
        `UPDATE test_sessions SET code = $2, updated_at = now() WHERE id = $1 RETURNING ${META_COLUMNS}`,
        [req.params.id, randomCode()]
      );
      broadcast(s);
      return res.json(sessionDoc(s, { includeCode: true }));
    } catch (err) {
      if (err.code !== "23505") throw err;
    }
  }
  throw new HttpError(500, "internal", "Yagona kod yaratib bo'lmadi. Qaytadan urinib ko'ring.");
});

router.delete("/:id", requireSessions, async (req, res) => {
  await query("DELETE FROM test_sessions WHERE id = $1", [req.params.id]);
  contentCache.delete(req.params.id);
  res.json({ ok: true });
});

router.get("/:id/participants", requireSessions, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM session_participants WHERE session_id = $1 ORDER BY joined_at ASC",
    [req.params.id]
  );
  res.json(rows.map(participantDoc));
});

router.get("/:id/events", requireSessions, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const { rows } = await query(
    "SELECT * FROM session_events WHERE session_id = $1 ORDER BY at DESC LIMIT $2",
    [req.params.id, limit]
  );
  res.json(rows.map(eventDoc));
});

// ------------------------------------------------------------------
// Ishtirokchi
// ------------------------------------------------------------------

// Qo'shilish: kod tekshiriladi, ishtirokchi qatori yaratiladi va
// savollar (content) darhol qaytariladi.
router.post("/:id/join", codeLimit, async (req, res) => {
  const { code } = parseBody(z.object({ code: z.string().nullable().optional() }), req.body);
  const s = await getSession(req.params.id);
  const isAdmin = hasPerm(req.user, "sessions");

  if (!isAdmin) {
    if (s.status === "closed") {
      throw new HttpError(403, "failed-precondition", "Bu test yakunlangan.");
    }
    if (await hasFinishedOnce(s, req.user.id)) throw alreadyFinished();
    // Allaqachon qo'shilgan ishtirokchi (sahifani yangilasa yoki pauzadan
    // qaytsa) kodni qayta kiritishi shart emas.
    const existing = await getParticipant(s.id, req.user.id);
    if (!existing && s.access_type !== "open" && code !== s.code) {
      throw forbidden("Kirish kodi noto'g'ri.");
    }
  }

  // Ochiq testni qayta yechayotgan bo'lsa — holat boshidan boshlanadi.
  const resetStatus = s.access_type === "open" ? { status: "not_started" } : {};
  const { rows } = await query(
    `INSERT INTO session_participants (session_id, user_id, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (session_id, user_id) DO UPDATE
       SET data = session_participants.data || $4::jsonb,
           updated_at = now()
     RETURNING *`,
    [
      s.id,
      req.user.id,
      { name: studentName(req.user), email: req.user.email, status: "not_started" },
      { name: studentName(req.user), email: req.user.email, ...resetStatus },
    ]
  );
  emitToAdmins(s.id, "participant:update", participantDoc(rows[0]));
  const participant = participantDoc(rows[0]);
  if (isAdmin) return res.json({ participant, content: (await getContent(s)).full });
  if (notStarted(s)) return res.json({ participant, content: null });
  const { publicJson } = await getContent(s);
  sendJson(res, `{"participant":${JSON.stringify(participant)},"content":${publicJson}}`);
});

// Admin — to'liq (tahrirlash uchun, kalitlar bilan); ishtirokchi — kalitsiz.
router.get("/:id/content", async (req, res) => {
  const s = await getSession(req.params.id);
  if (hasPerm(req.user, "sessions")) return res.json((await getContent(s)).full);
  if (!(await getParticipant(s.id, req.user.id))) throw forbidden("Avval testga qo'shiling.");
  if (s.status === "closed") throw new HttpError(403, "failed-precondition", "Bu test yakunlangan.");
  if (notStarted(s)) throw new HttpError(403, "not-started", "Test hali boshlanmagan.");
  const { publicJson, publicGzip } = await getContent(s);
  sendJson(res, publicJson, publicGzip);
});

// Ishtirokchi o'z holatini yangilaydi (admin monitoringi uchun). Faqat
// ruxsat etilgan maydonlar qabul qilinadi, vaqt belgilari serverda qo'yiladi.
router.patch("/:id/participants/me", async (req, res) => {
  const current = await requireParticipant(req);
  const session = await getSession(req.params.id);
  const body = parseBody(
    z.object({
      status: z.enum(PARTICIPANT_STATUSES).optional(),
      terminationReason: z.string().max(100).optional(),
      violationCount: z.number().int().min(0).max(1000).optional(),
    }),
    req.body
  );
  // Kodli (bir martalik) testda chetlatilgan talaba o'zini qayta "active"
  // qila olmaydi va qoidabuzarliklar soni faqat oshadi. Doimiy ochiq testni
  // qayta topshirishda esa holat yangidan boshlanadi.
  if (session.access_type !== "open") {
    if (current.data?.status === "terminated" && body.status && body.status !== "terminated") {
      throw new HttpError(409, "failed-precondition", "Siz bu testdan chetlatilgansiz.");
    }
    if (body.violationCount != null) {
      body.violationCount = Math.max(body.violationCount, Number(current.data?.violationCount) || 0);
    }
  }
  const now = new Date().toISOString();
  const patch = { ...body };
  if (body.status === "active") patch.startedAt = now;
  if (body.status === "terminated") patch.terminatedAt = now;
  if (body.status === "finished") patch.finishedAt = now;

  const p = await one(
    `UPDATE session_participants SET data = data || $3::jsonb, updated_at = now()
     WHERE session_id = $1 AND user_id = $2 RETURNING *`,
    [req.params.id, req.user.id, patch]
  );
  emitToAdmins(req.params.id, "participant:update", participantDoc(p));
  res.json(participantDoc(p));
});

router.post("/:id/events", perUserLimit({ windowMs: 60_000, limit: 30 }), async (req, res) => {
  await requireParticipant(req);
  const body = parseBody(
    z.object({ type: z.string().max(60), message: z.string().max(500).optional() }),
    req.body
  );
  const e = await one(
    `INSERT INTO session_events (id, session_id, user_id, data) VALUES ($1, $2, $3, $4) RETURNING *`,
    [crypto.randomUUID(), req.params.id, req.user.id, { ...body, name: studentName(req.user) }]
  );
  emitToAdmins(req.params.id, "event:new", eventDoc(e));
  res.status(201).json(eventDoc(e));
});

const answers = z.array(z.string().max(40).nullable()).max(200);

// Module 1 javoblaridan Module 2 yo'nalishi — kalitlar serverda.
router.post("/:id/route", async (req, res) => {
  await requireParticipant(req);
  const s = await getSession(req.params.id);
  const body = parseBody(z.object({ sectionId: z.string().max(20), module1Answers: answers }), req.body);
  const section = (await getContent(s)).keyed.find((sec) => sec.id === body.sectionId);
  if (!section) throw notFound("Bo'lim topilmadi.");
  res.json({ route: routeFor(section, body.module1Answers) });
});

// Natijani serverda baholab saqlaydi: sessiya natijasi + "Mening
// natijalarim" uchun nusxa + ishtirokchi holati + reyting — bitta
// tranzaksiyada. Kodli test bir marta (takroriy so'rov avvalgi natijani
// qaytaradi), "doimiy ochiq" testni qayta topshirish mumkin.
router.post("/:id/finish", async (req, res) => {
  const participant = await requireParticipant(req);
  const s = await getSession(req.params.id);
  const body = parseBody(
    z.object({
      attempts: z.record(
        z.string().max(20),
        z.object({ module1Answers: answers, module2Answers: answers.optional() })
      ),
      terminated: z.boolean().optional(),
      terminationReason: z.string().max(40).optional(),
      // Tarmoq xatosidan keyin qayta yuborilgan so'rov dublikat yaratmasin.
      attemptId: z.string().regex(/^[A-Za-z0-9-]{16,64}$/).optional(),
    }),
    req.body
  );
  const sectionsMeta = (s.meta?.sections || []).map((sec) => ({ id: sec.id, title: sec.title }));

  if (s.access_type !== "open") {
    const existing = await one(
      "SELECT * FROM session_results WHERE session_id = $1 AND user_id = $2",
      [s.id, req.user.id]
    );
    if (existing) {
      const doc = sessionResultDoc(existing);
      return res.json({ results: doc.results, total: doc.total, sections: sectionsMeta, alreadySubmitted: true });
    }
  }

  // Admin testni yopgan yoki talaba chetlatilgan bo'lsa — natija "to'xtatilgan".
  const terminated = !!body.terminated || s.status === "closed" || participant.data?.status === "terminated";
  const reason = body.terminationReason || (s.status === "closed" ? "closed_by_admin" : "unknown");
  const { keyed: sections } = await getContent(s);
  const { results, total, complete, totalLow, totalHigh } = scoreAttempt(sections, body.attempts, { terminated });
  const termFields = terminated ? { terminated: true, terminationReason: String(reason).slice(0, 40) } : {};
  const title = s.meta?.title || "";
  const data = {
    results,
    totalLow,
    totalHigh,
    name: studentName(req.user),
    email: req.user.email,
    sessionTitle: title,
    ...termFields,
  };

  const p = await tx(async (client) => {
    if (body.attemptId) {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [body.attemptId]);
      const { rows: dup } = await client.query("SELECT user_id FROM results WHERE attempt_id = $1", [body.attemptId]);
      if (dup.length) {
        if (dup[0].user_id !== req.user.id) throw new HttpError(409, "already-exists", "attemptId band.");
        return { duplicate: true };
      }
    }
    await consumeDaily(client, req.user.id, "sessionFinish", 30, "Bugun juda ko'p test topshirildi, ertaga davom eting.");
    // Reytingga shu testning faqat BIRINCHI to'liq urinishi tushadi — ochiq
    // testni qayta-qayta topshirib kalitni "teshib" olish foyda bermaydi.
    const { rowCount: earlier } = await client.query(
      "SELECT 1 FROM results WHERE user_id = $1 AND session_id = $2 AND complete LIMIT 1",
      [req.user.id, s.id]
    );
    await client.query(
      `INSERT INTO session_results (session_id, user_id, total, data, finished_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (session_id, user_id) DO UPDATE
         SET total = EXCLUDED.total, data = EXCLUDED.data, finished_at = now()`,
      [s.id, req.user.id, total, data]
    );
    await client.query(
      `INSERT INTO results (id, user_id, total, session_id, complete, attempt_id, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), req.user.id, total, s.id, complete, body.attemptId || null, data]
    );
    const now = new Date().toISOString();
    const participantPatch = terminated
      ? { totalScore: total, status: "terminated", terminationReason: termFields.terminationReason, terminatedAt: now }
      : { totalScore: total, status: "finished", finishedAt: now };
    const updated = await client.query(
      `UPDATE session_participants SET data = data || $3::jsonb, updated_at = now()
       WHERE session_id = $1 AND user_id = $2 RETURNING *`,
      [s.id, req.user.id, participantPatch]
    );
    // Reytingga faqat to'liq SAT (ikkala bo'lim) tushadi.
    const fullSat = ["rw", "math"].every((id) => sections.some((sec) => sec.id === id));
    if (complete && fullSat && earlier === 0) await maybeUpdateLeaderboard(client, req.user, total);
    return updated.rows[0];
  });

  if (p?.duplicate) {
    const prev = await one("SELECT * FROM results WHERE attempt_id = $1", [body.attemptId]);
    const doc = resultDoc(prev);
    return res.json({
      results: doc.results,
      total: doc.total,
      totalLow: doc.totalLow,
      totalHigh: doc.totalHigh,
      sections: sectionsMeta,
      alreadySubmitted: true,
    });
  }
  if (p) emitToAdmins(s.id, "participant:update", participantDoc(p));
  res.status(201).json({ results, total, totalLow, totalHigh, sections: sectionsMeta });
});

router.get("/:id/results/me", async (req, res) => {
  const r = await one("SELECT * FROM session_results WHERE session_id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  if (!r) throw notFound("Natija topilmadi.");
  res.json(sessionResultDoc(r));
});

export default router;
