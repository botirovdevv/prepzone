import { createHash } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { one, pool, query } from "../db/index.js";
import { parseBody } from "../lib/errors.js";
import { generateJson } from "../lib/gemini.js";
import { consumeAi, aiQuota } from "../lib/quota.js";
import { perUserLimit } from "../lib/limiters.js";
import { dayKey } from "../lib/limits.js";

// ------------------------------------------------------------------
// AI Tutor "Nega xato?": savolni bosqichma-bosqich tushuntiradi (o'zbek
// yoki ingliz tilida). Javob savol + til bo'yicha keshlanadi — bitta savol
// AI'ga faqat bir marta yuboriladi, keyingi talabalar keshdan oladi.
// ------------------------------------------------------------------

const router = Router();

const SCHEMA = {
  type: "OBJECT",
  properties: {
    answer: { type: "STRING", description: "Correct choice letter (A-D) or the numeric answer." },
    summary: { type: "STRING", description: "One-sentence key idea." },
    steps: { type: "ARRAY", items: { type: "STRING" }, description: "3-6 short solution steps." },
    trap: { type: "STRING", description: "Why the most tempting wrong answer is wrong." },
    tip: { type: "STRING", description: "A reusable SAT strategy tip for similar questions." },
    skill: { type: "STRING", description: "Skill being tested." },
  },
  required: ["answer", "summary", "steps", "tip"],
};

const stripHtml = (s) =>
  String(s || "")
    .replace(/<img[^>]*>/gi, "[figure]")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

router.get("/quota", async (req, res) => {
  res.json(await aiQuota(pool, req.user));
});

router.post("/explain", perUserLimit({ windowMs: 60_000, limit: 12 }), async (req, res) => {
  const body = parseBody(
    z.object({
      lang: z.enum(["uz", "en"]).default("uz"),
      question: z.object({
        passage: z.string().max(20_000).optional().default(""),
        prompt: z.string().min(1).max(10_000),
        choices: z.array(z.object({ label: z.string().max(4), text: z.string().max(5_000) })).max(6).optional().default([]),
        correctAnswer: z.string().max(80).optional().default(""),
      }),
      userAnswer: z.string().max(40).nullable().optional(),
    }),
    req.body
  );
  const q = body.question;
  const text = [
    q.passage && `Passage/context: ${stripHtml(q.passage)}`,
    `Question: ${stripHtml(q.prompt)}`,
    q.choices.length && `Choices:\n${q.choices.map((c) => `${c.label}) ${stripHtml(c.text)}`).join("\n")}`,
    q.correctAnswer && `Official correct answer: ${q.correctAnswer}`,
  ]
    .filter(Boolean)
    .join("\n\n");
  const hash = createHash("sha256").update(text).digest("hex");

  const cached = await one("SELECT data FROM question_explanations WHERE question_hash = $1 AND lang = $2", [hash, body.lang]);
  // Kesh ham limitga kiradi (tarif qiymati — tushuntirishlar soni).
  await consumeAi(pool, req.user);
  if (cached) return res.json({ ...cached.data, cached: true, quota: await aiQuota(pool, req.user) });

  const language =
    body.lang === "uz"
      ? "Uzbek (Latin script). Keep math notation and English SAT terms where natural."
      : "English.";
  const prompt =
    `You are an expert SAT tutor for students in Uzbekistan. Explain the following Digital SAT question ` +
    `clearly and briefly, the way a top tutor would. Write in ${language} ` +
    `If an official correct answer is given, explain why it is correct; do not contradict it. ` +
    `Steps must be concrete (show the actual calculation or the exact evidence from the text). ` +
    `"trap" explains the most common wrong choice.\n\n${text}`;
  let data;
  try {
    data = await generateJson([{ text: prompt }], SCHEMA, { temperature: 0.2, timeoutMs: 45_000, maxModels: 3 });
  } catch (err) {
    // AI javob bermadi — urinish limitdan qaytariladi.
    await query(
      "UPDATE rate_limits SET count = count - 1 WHERE day = $1 AND user_id = $2 AND action = 'aiTutor' AND count > 0",
      [dayKey(), req.user.id]
    );
    throw err;
  }
  const clean = {
    answer: String(data.answer || "").slice(0, 80),
    summary: String(data.summary || "").slice(0, 600),
    steps: (Array.isArray(data.steps) ? data.steps : []).slice(0, 8).map((s) => String(s).slice(0, 800)),
    trap: String(data.trap || "").slice(0, 800),
    tip: String(data.tip || "").slice(0, 600),
    skill: String(data.skill || "").slice(0, 120),
  };
  await query(
    `INSERT INTO question_explanations (question_hash, lang, data) VALUES ($1, $2, $3)
     ON CONFLICT DO NOTHING`,
    [hash, body.lang, clean]
  );
  res.json({ ...clean, cached: false, quota: await aiQuota(pool, req.user) });
});

export default router;
