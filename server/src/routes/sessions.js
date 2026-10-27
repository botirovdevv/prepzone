import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { HttpError, forbidden, notFound, parseBody } from "../lib/errors.js";
import {
  eventDoc,
  participantDoc,
  sessionDoc,
  sessionResultDoc,
} from "../lib/serialize.js";
import { emitSessionUpdate, emitToAdmins } from "../lib/realtime.js";
import { maybeUpdateLeaderboard } from "../lib/leaderboard.js";
import { requireAdmin } from "../middleware/auth.js";
import { resultBody } from "./results.js";

// ------------------------------------------------------------------
// Admin tashkil qilgan testlar (kod bilan yoki doimiy ochiq).
//
// XAVFSIZLIK MODELI (avvalgi firestore.rules bilan bir xil):
//   - meta (nom, jadval, holat) — har bir login qilgan foydalanuvchiga;
//     `code` esa faqat adminga ko'rinadi.
//   - content (savollar va to'g'ri javoblar) — faqat admin va sessiyaga
//     rasman qo'shilgan (participant qatori bor) foydalanuvchiga.
//   - "code" turidagi testga qo'shilish uchun to'g'ri kod SHART.
// ------------------------------------------------------------------

const router = Router();

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

async function getSession(id) {
  const s = await one("SELECT * FROM test_sessions WHERE id = $1", [id]);
  if (!s) throw notFound("Test topilmadi.");
  return s;
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
  const isAdmin = req.user.is_admin;
  const { rows } = await query(
    isAdmin
      ? "SELECT * FROM test_sessions ORDER BY scheduled_at DESC NULLS LAST, created_at DESC"
      : `SELECT * FROM test_sessions WHERE access_type = 'open' AND status <> 'closed'
         ORDER BY created_at DESC`
  );
  res.json(rows.map((s) => sessionDoc(s, { includeCode: isAdmin })));
});

// Kod bo'yicha qidirish (JoinSession sahifasi).
router.post("/lookup", async (req, res) => {
  const { code } = parseBody(z.object({ code: z.string().trim().regex(/^\d{6}$/) }), req.body);
  const s = await one("SELECT * FROM test_sessions WHERE code = $1", [code]);
  if (!s) throw notFound("Bunday kod bilan test topilmadi.");
  res.json(sessionDoc(s));
});

router.get("/:id", async (req, res) => {
  const s = await getSession(req.params.id);
  res.json(sessionDoc(s, { includeCode: req.user.is_admin }));
});

// ------------------------------------------------------------------
// Admin: yaratish / tahrirlash / yopish
// ------------------------------------------------------------------

router.post("/", requireAdmin, async (req, res) => {
  const body = parseBody(sessionBody, req.body);
  const { meta, content } = splitSections(body.sections);
  const scheduledAt = body.accessType === "open" ? null : body.scheduledAt || null;

  // Kod unikal bo'lishi kerak — to'qnashuv bo'lsa qayta urinamiz.
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const s = await one(
        `INSERT INTO test_sessions (id, code, access_type, status, scheduled_at, meta, content)
         VALUES ($1, $2, $3, 'scheduled', $4, $5, $6) RETURNING *`,
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

router.put("/:id", requireAdmin, async (req, res) => {
  const body = parseBody(sessionBody, req.body);
  const { meta, content } = splitSections(body.sections);
  const s = await one(
    `UPDATE test_sessions
       SET access_type = $2, scheduled_at = $3,
           meta = meta || $4::jsonb, content = $5, updated_at = now()
     WHERE id = $1 RETURNING *`,
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

router.patch("/:id/status", requireAdmin, async (req, res) => {
  const { status } = parseBody(
    z.object({ status: z.enum(["scheduled", "closed"]) }),
    req.body
  );
  const s = await one(
    "UPDATE test_sessions SET status = $2, updated_at = now() WHERE id = $1 RETURNING *",
    [req.params.id, status]
  );
  if (!s) throw notFound("Test topilmadi.");
  broadcast(s);
  res.json(sessionDoc(s, { includeCode: true }));
});

router.post("/:id/regenerate-code", requireAdmin, async (req, res) => {
  await getSession(req.params.id);
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      const s = await one(
        "UPDATE test_sessions SET code = $2, updated_at = now() WHERE id = $1 RETURNING *",
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

router.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM test_sessions WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});

router.get("/:id/participants", requireAdmin, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM session_participants WHERE session_id = $1 ORDER BY joined_at ASC",
    [req.params.id]
  );
  res.json(rows.map(participantDoc));
});

router.get("/:id/events", requireAdmin, async (req, res) => {
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
router.post("/:id/join", async (req, res) => {
  const { code } = parseBody(z.object({ code: z.string().nullable().optional() }), req.body);
  const s = await getSession(req.params.id);
  const isAdmin = req.user.is_admin;

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
  const content = isAdmin || !notStarted(s) ? s.content : null;
  res.json({ participant: participantDoc(rows[0]), content });
});

router.get("/:id/content", async (req, res) => {
  const s = await getSession(req.params.id);
  if (!req.user.is_admin) {
    if (!(await getParticipant(s.id, req.user.id))) throw forbidden("Avval testga qo'shiling.");
    if (s.status === "closed") throw new HttpError(403, "failed-precondition", "Bu test yakunlangan.");
    if (notStarted(s)) throw new HttpError(403, "not-started", "Test hali boshlanmagan.");
  }
  res.json(s.content);
});

// Ishtirokchi o'z holatini yangilaydi (admin monitoringi uchun). Faqat
// ruxsat etilgan maydonlar qabul qilinadi, vaqt belgilari serverda qo'yiladi.
router.patch("/:id/participants/me", async (req, res) => {
  await requireParticipant(req);
  const body = parseBody(
    z.object({
      status: z.enum(PARTICIPANT_STATUSES).optional(),
      terminationReason: z.string().max(100).optional(),
      violationCount: z.number().int().min(0).max(1000).optional(),
    }),
    req.body
  );
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

router.post("/:id/events", async (req, res) => {
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

// Natijani saqlash: sessiya natijasi + "Mening natijalarim" uchun nusxa +
// ishtirokchi holati + reyting — hammasi bitta tranzaksiyada.
router.post("/:id/results", async (req, res) => {
  await requireParticipant(req);
  const s = await getSession(req.params.id);
  if (!req.user.is_admin && (await hasFinishedOnce(s, req.user.id))) throw alreadyFinished();
  const { total, ...rest } = parseBody(resultBody, req.body);
  const title = s.meta?.title || "";
  const data = { ...rest, name: studentName(req.user), email: req.user.email, sessionTitle: title };

  const { result, participant } = await tx(async (client) => {
    const r = await client.query(
      `INSERT INTO session_results (session_id, user_id, total, data, finished_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (session_id, user_id) DO UPDATE
         SET total = EXCLUDED.total, data = EXCLUDED.data, finished_at = now()
       RETURNING *`,
      [s.id, req.user.id, total, data]
    );
    await client.query(
      `INSERT INTO results (id, user_id, total, session_id, data) VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), req.user.id, total, s.id, data]
    );
    const participantPatch = rest.terminated
      ? { totalScore: total }
      : { totalScore: total, status: "finished", finishedAt: new Date().toISOString() };
    const p = await client.query(
      `UPDATE session_participants SET data = data || $3::jsonb, updated_at = now()
       WHERE session_id = $1 AND user_id = $2 RETURNING *`,
      [s.id, req.user.id, participantPatch]
    );
    await maybeUpdateLeaderboard(client, req.user, total);
    return { result: r.rows[0], participant: p.rows[0] };
  });

  if (participant) emitToAdmins(s.id, "participant:update", participantDoc(participant));
  res.status(201).json(sessionResultDoc(result));
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
