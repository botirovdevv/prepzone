import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { Router } from "express";
import { z } from "zod";
import { one, pool, query, tx } from "../db/index.js";
import { HttpError, notFound, parseBody } from "../lib/errors.js";
import { dayKey } from "../lib/limits.js";
import { planLimitError, planLimits } from "../lib/plans.js";
import { addXp, streakDoc, XP } from "../lib/streaks.js";
import { avatarUrl } from "../lib/serialize.js";

// ------------------------------------------------------------------
// O'qish vositalari: xatolar daftari (spaced repetition), kun savollari,
// streak va XP reytingi.
// ------------------------------------------------------------------

const router = Router();

// ---------------- Xatolar daftari ----------------

// Takrorlash oraliqlari (stage → kun). 3 marta ketma-ket to'g'ri = o'zlashtirildi.
const INTERVAL_DAYS = [1, 3, 7];
const MASTER_STAGE = 3;

const mistakeQuestion = z
  .object({
    id: z.string().max(80).optional(),
    passage: z.string().max(20_000).optional(),
    prompt: z.string().max(10_000),
    type: z.string().max(10).optional(),
    choices: z.array(z.object({ label: z.string().max(4), text: z.string().max(5_000) })).max(6).optional(),
    correctAnswer: z.string().max(40).optional(),
    answers: z.array(z.string().max(40)).max(10).optional(),
    explanation: z.string().max(5_000).optional(),
    skill: z.string().max(200).optional(),
    domain: z.string().max(60).optional(),
    // Faqat base64 rasm yoki saytdagi nisbiy yo'l (tashqi URL/javascript: emas).
    image: z
      .string()
      .max(400_000)
      .regex(/^(data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+|\/(?!\/)[\w\-./]+)$/, "Rasm noto'g'ri.")
      .optional(),
  })
  .passthrough();

function mistakeDoc(m) {
  return {
    key: m.question_key,
    source: m.source,
    section: m.section,
    domain: m.domain,
    question: m.question,
    stage: m.stage,
    dueAt: m.due_at,
    wrongCount: m.wrong_count,
    masteredAt: m.mastered_at,
    createdAt: m.created_at,
  };
}

router.get("/mistakes", async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM mistakes WHERE user_id = $1
     ORDER BY (mastered_at IS NOT NULL), due_at LIMIT 500`,
    [req.user.id]
  );
  const now = Date.now();
  res.json({
    items: rows.map(mistakeDoc),
    due: rows.filter((m) => !m.mastered_at && new Date(m.due_at).getTime() <= now).length,
    open: rows.filter((m) => !m.mastered_at).length,
    mastered: rows.filter((m) => m.mastered_at).length,
    canReview: planLimits(req.user).mistakeReview,
  });
});

// Natija/practice sahifasidan noto'g'ri javoblar. Takroriy yuborish xavfsiz:
// mavjud xato qayta "ochiladi" faqat u o'zlashtirilgan bo'lsa.
router.post("/mistakes/sync", async (req, res) => {
  const body = parseBody(
    z.object({
      source: z.string().max(120),
      items: z
        .array(
          z.object({
            key: z.string().min(1).max(160),
            section: z.string().max(20).optional().default(""),
            domain: z.string().max(60).optional().default(""),
            question: mistakeQuestion,
          })
        )
        .max(150),
    }),
    req.body
  );
  // Bir natija ikki marta sinxronlansa wrong_count oshib ketmasin.
  const marker = `mistakeSync:${createHash("sha1").update(body.source).digest("hex").slice(0, 16)}`;
  const first = await one(
    `INSERT INTO rate_limits (day, user_id, action, count) VALUES ('sync', $1, $2, 1)
     ON CONFLICT DO NOTHING RETURNING 1`,
    [req.user.id, marker]
  );
  if (!first) return res.json({ added: 0 });
  let added = 0;
  await tx(async (client) => {
    for (const it of body.items) {
      const { rowCount } = await client.query(
        `INSERT INTO mistakes (user_id, question_key, source, section, domain, question)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, question_key) DO UPDATE SET
           wrong_count = mistakes.wrong_count + 1,
           stage = 0, due_at = now(), mastered_at = NULL, updated_at = now()`,
        [req.user.id, it.key, body.source, it.section, it.domain, it.question]
      );
      added += rowCount;
    }
  });
  res.json({ added });
});

router.post("/mistakes/review", async (req, res) => {
  const body = parseBody(z.object({ key: z.string().min(1).max(160), correct: z.boolean() }), req.body);
  if (!planLimits(req.user).mistakeReview) {
    throw planLimitError("Xatolarni takrorlash rejimi Sprint va undan yuqori tariflarda.", "mistakes");
  }
  const out = await tx(async (client) => {
    const { rows } = await client.query(
      "SELECT * FROM mistakes WHERE user_id = $1 AND question_key = $2 FOR UPDATE",
      [req.user.id, body.key]
    );
    const m = rows[0];
    if (!m) throw notFound("Savol topilmadi.");
    let stage = body.correct ? m.stage + 1 : 0;
    const mastered = stage >= MASTER_STAGE;
    stage = Math.min(stage, MASTER_STAGE);
    const days = body.correct ? INTERVAL_DAYS[Math.min(stage, INTERVAL_DAYS.length) - 1] || 7 : 0;
    const { rows: upd } = await client.query(
      `UPDATE mistakes SET stage = $3, due_at = now() + $4 * interval '1 day',
         mastered_at = CASE WHEN $5 THEN now() ELSE NULL END,
         wrong_count = wrong_count + CASE WHEN $6 THEN 0 ELSE 1 END, updated_at = now()
       WHERE user_id = $1 AND question_key = $2 RETURNING *`,
      [req.user.id, body.key, stage, days, mastered, body.correct]
    );
    const streak = body.correct ? await addXp(client, req.user.id, XP.mistakeFixed) : null;
    return { mistake: mistakeDoc(upd[0]), streak };
  });
  res.json(out);
});

router.delete("/mistakes/:key", async (req, res) => {
  await query("DELETE FROM mistakes WHERE user_id = $1 AND question_key = $2", [req.user.id, req.params.key]);
  res.json({ ok: true });
});

// ---------------- Kun savollari ----------------

let bank = null;
async function loadBank() {
  if (bank) return bank;
  const dir = new URL("../../question-bank/", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const all = [];
  for (const f of files) {
    const section = f.startsWith("math") ? "math" : "rw";
    const items = JSON.parse(await readFile(new URL(f, dir), "utf8"));
    for (const q of items) {
      if (!Array.isArray(q.choices) || q.choices.length !== 4 || !q.correctAnswer || q.image) continue;
      all.push({ ...q, section });
    }
  }
  bank = { math: all.filter((q) => q.section === "math"), rw: all.filter((q) => q.section === "rw") };
  return bank;
}

// Kun bo'yicha hamma uchun bir xil 5 ta savol (3 RW + 2 Math) — do'stlar bilan solishtirish mumkin.
async function dailySet(day) {
  const b = await loadBank();
  const pick = (list, n, salt) => {
    const out = [];
    const used = new Set();
    for (let i = 0; out.length < Math.min(n, list.length); i++) {
      const h = createHash("sha256").update(`${day}:${salt}:${i}`).digest().readUInt32BE(0);
      const idx = h % list.length;
      if (used.has(idx)) continue;
      used.add(idx);
      out.push(list[idx]);
    }
    return out;
  };
  return [...pick(b.rw, 3, "rw"), ...pick(b.math, 2, "math")].map((q, i) => ({ ...q, id: `${day}-${i}` }));
}

const publicQ = ({ correctAnswer: _c, explanation: _e, ...q }) => q;

router.get("/daily", async (req, res) => {
  const day = dayKey();
  const qs = await dailySet(day);
  const done = await one(
    "SELECT count FROM rate_limits WHERE day = $1 AND user_id = $2 AND action = 'daily'",
    [day, req.user.id]
  );
  res.json({ day, questions: done ? qs : qs.map(publicQ), done: done ? { correct: done.count - 1 } : null });
});

router.post("/daily", async (req, res) => {
  const body = parseBody(z.object({ answers: z.array(z.string().max(4).nullable()).length(5) }), req.body);
  const day = dayKey();
  const qs = await dailySet(day);
  const results = qs.map((q, i) => body.answers[i] === q.correctAnswer);
  const correct = results.filter(Boolean).length;
  const out = await tx(async (client) => {
    // count = correct + 1 (0 to'g'ri bo'lsa ham qator bo'lsin).
    const { rows } = await client.query(
      `INSERT INTO rate_limits (day, user_id, action, count) VALUES ($1, $2, 'daily', $3)
       ON CONFLICT DO NOTHING RETURNING 1`,
      [day, req.user.id, correct + 1]
    );
    if (!rows.length) throw new HttpError(409, "already-exists", "Bugungi savollar allaqachon yechilgan.");
    const xp = correct * XP.dailyCorrect + XP.dailyDone;
    const streak = await addXp(client, req.user.id, xp);
    // Noto'g'rilari — xatolar daftariga.
    for (let i = 0; i < qs.length; i++) {
      if (results[i]) continue;
      const q = qs[i];
      await client.query(
        `INSERT INTO mistakes (user_id, question_key, source, section, domain, question)
         VALUES ($1, $2, 'daily', $3, $4, $5) ON CONFLICT DO NOTHING`,
        [req.user.id, `bank:${q.sourceId || q.id}`, q.section, q.domain || "", q]
      );
    }
    return { xp, streak };
  });
  res.json({ correct, results, questions: qs, ...out });
});

// ---------------- Streak / XP ----------------

router.get("/streak", async (req, res) => {
  const row = await one("SELECT * FROM user_streaks WHERE user_id = $1", [req.user.id]);
  const doc = streakDoc(row);
  const rank = row
    ? (await one("SELECT count(*)::int + 1 AS r FROM user_streaks WHERE xp > $1", [row.xp])).r
    : null;
  const daily = await one(
    "SELECT 1 FROM rate_limits WHERE day = $1 AND user_id = $2 AND action = 'daily'",
    [dayKey(), req.user.id]
  );
  res.json({ ...doc, rank, dailyDone: !!daily });
});

router.get("/xp-leaderboard", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT s.user_id, s.xp, s.current, s.last_day, u.display_name, u.email, u.avatar_updated_at
     FROM user_streaks s JOIN users u ON u.id = s.user_id
     WHERE u.blocked_at IS NULL ORDER BY s.xp DESC LIMIT 50`
  );
  res.json(
    rows.map((r) => ({
      uid: r.user_id,
      name: r.display_name || r.email.split("@")[0],
      xp: r.xp,
      streak: streakDoc(r).current,
      avatarUrl: avatarUrl(r.user_id, r.avatar_updated_at),
    }))
  );
});

export default router;
