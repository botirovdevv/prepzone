import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { parseBody } from "../lib/errors.js";
import { DOMAINS, QUESTION_SCHEMA, generateJson } from "../lib/gemini.js";

// ------------------------------------------------------------------
// /api/admin/ai — admin (Testlar yoki To'plamlar ruxsati bilan, index.js):
//   POST /parse-questions    — matn / PDF / rasmdan savollarni ajratish
//                              (katta PDF'ni client bo'laklab, parallel yuboradi)
//   POST /parse-answer-key   — PDF oxiridagi javoblar kalitini o'qish
//   POST /generate-questions — adaptiv test uchun yangi savollar yaratish
// AI natijasi to'g'ridan-to'g'ri saqlanmaydi: frontend uni admin ko'rib
// chiqishi uchun qaytaradi (kalitsiz yoki shubhali savollar belgilanadi).
// ------------------------------------------------------------------

const router = Router();

// Tekin Gemini limitini va serverni himoya qilish uchun. Bitta katta PDF
// ~15 ta so'rov (bo'laklar + kalit) bo'ladi.
router.use(
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 300,
    keyGenerator: (req) => req.user.id,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({ code: "ai/rate-limited", message: "Bir soatlik AI so'rovlar limiti tugadi." }),
  })
);

const subject = z.enum(["rw", "math"]);
// "auto" — butun test (RW + Math) bitta PDF'da: bo'limni AI har savol uchun aniqlaydi.
const parseSubject = z.enum(["rw", "math", "auto"]);
const SECTIONS = ["rw", "math"];
const difficulty = z.enum(["easy", "medium", "hard"]);
const LABELS = ["A", "B", "C", "D"];
const MIME = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// AI javobidagi bitta savolni tozalaydi va ko'rib chiqish belgilarini qo'shadi.
function cleanQuestion(raw, requested) {
  const subj = requested === "auto" ? (raw?.section === "math" ? "math" : "rw") : requested;
  const type = raw?.type === "spr" && subj === "math" ? "spr" : "mcq";
  const issues = [];
  const choices = (Array.isArray(raw?.choices) ? raw.choices : [])
    .slice(0, 4)
    .map((c) => str(c, 1000).replace(/^\(?[A-D][).:]\s*/, ""));
  const correct = str(raw?.correctAnswer, 4).toUpperCase().replace(/[^A-D]/g, "").slice(0, 1);
  const answers = (Array.isArray(raw?.answers) ? raw.answers : []).map((a) => str(a, 40)).filter(Boolean).slice(0, 8);
  const confidence = Math.min(1, Math.max(0, Number(raw?.confidence) || 0));

  if (type === "mcq" && (choices.length !== 4 || choices.some((c) => !c))) issues.push("4 ta variant to'liq emas");
  if (type === "mcq" && !correct) issues.push("To'g'ri javob topilmadi");
  if (type === "spr" && answers.length === 0) issues.push("Qabul qilinadigan javob yo'q");
  if (confidence < 0.7) issues.push("AI ishonchi past — matnni tekshiring");
  if (raw?.hasFigure) issues.push("Grafik/rasm bor — rasmni qo'lda qo'shing");

  return {
    passage: str(raw?.passage, 6000),
    prompt: str(raw?.prompt, 3000),
    type,
    choices: type === "mcq" ? LABELS.map((label, i) => ({ label, text: choices[i] || "" })) : [],
    correctAnswer: type === "mcq" ? correct : null,
    ...(type === "spr" ? { answers } : {}),
    domain: DOMAINS[subj].includes(raw?.domain) ? raw.domain : "",
    skill: str(raw?.skill, 80),
    difficulty: difficulty.safeParse(raw?.difficulty).success ? raw.difficulty : "medium",
    explanation: str(raw?.explanation, 2000),
    confidence,
    number: Math.max(0, Math.min(999, Math.trunc(Number(raw?.number)) || 0)),
    module: str(raw?.module, 8).replace(/\D/g, ""),
    section: subj,
    variant: ["easy", "hard"].includes(raw?.variant) ? raw.variant : "",
    issues,
  };
}

const LIST_SCHEMA = { type: "ARRAY", items: QUESTION_SCHEMA };

// AI to'g'ri javobni ko'pincha A ga qo'yadi — yaratilgan savollarda variantlar
// aralashtiriladi (son variantlar real SAT'dagidek o'sish tartibida qoladi).
function shuffleChoices(q) {
  if (q.type !== "mcq" || !q.correctAnswer) return q;
  const texts = q.choices.map((c) => c.text);
  const correctText = texts[LABELS.indexOf(q.correctAnswer)];
  const num = (t) => Number(String(t).replace(/[−–]/g, "-").replace(/[,$%\s]/g, ""));
  let order;
  if (texts.every((t) => Number.isFinite(num(t)))) order = [...texts].sort((a, b) => num(a) - num(b));
  else {
    order = [...texts];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  }
  return {
    ...q,
    choices: LABELS.map((label, i) => ({ label, text: order[i] })),
    correctAnswer: LABELS[order.indexOf(correctText)],
  };
}

// Sayt LaTeX'ni ko'rsatmaydi — matematika oddiy matn + <sup>/<sub>/<i> bilan.
const FORMAT_RULE =
  "Formatting: NEVER use LaTeX, $...$ or \\( \\) delimiters. Write math as plain text with HTML tags: x<sup>2</sup>, a<sub>1</sub>, <i>x</i> for variables, √ for roots, − for minus, ≤ ≥ ≠ π °. Use <u>...</u> for underlined text.";

const RW_RULE = `Digital SAT Reading and Writing. Allowed domain values: ${DOMAINS.rw.join(", ")}.`;
const MATH_RULE = `Digital SAT Math. Allowed domain values: ${DOMAINS.math.join(", ")}. Use "spr" type for student-produced (grid-in) answers.`;

const subjectRules = (subj) =>
  (subj === "auto"
    ? `The material is a full Digital SAT practice test that may contain both sections.
For every question set "section": "rw" for Reading and Writing (${RW_RULE}) or "math" for Math (${MATH_RULE}).
Use the section/module headers on the pages (e.g. "Section 1, Module 2: Reading and Writing", "Math Module 1") and the question content to decide. Question numbers restart at 1 in every module.
"variant": "easy" or "hard" only if the page explicitly labels the module as easier/harder; otherwise empty.`
    : `Section: ${subj === "rw" ? RW_RULE : MATH_RULE}`) + `\n${FORMAT_RULE}`;

router.post("/parse-questions", async (req, res) => {
  const body = parseBody(
    z
      .object({
        subject: parseSubject,
        text: z.string().max(200_000).optional(),
        files: z
          .array(z.object({ mimeType: z.enum(MIME, "Faqat PDF, PNG, JPEG yoki WEBP."), data: z.string().max(21_000_000) }))
          .max(10)
          .optional(),
        // Katta PDF'ning bir bo'lagi (client tomonida ajratilgan sahifalar).
        chunk: z
          .object({ index: z.number().int().min(0), total: z.number().int().min(1).max(200), firstPage: z.number().int().min(1) })
          .optional(),
      })
      .refine((b) => b.text?.trim() || b.files?.length, "Matn yoki fayl yuboring."),
    req.body
  );

  const instructions = `You extract SAT practice questions from the provided material for an exam-prep admin panel.
${subjectRules(body.subject)}
Rules:
- Extract every complete question exactly as written (keep passages verbatim; convert any math notation to the formatting rule above).
- Do not invent questions, passages or choices that are not in the material.
- correctAnswer: take it from an answer key in the material if present; otherwise solve the question yourself and lower confidence to at most 0.6. If you cannot determine it, return an empty string.
- difficulty: estimate easy / medium / hard relative to the real Digital SAT.
- domain: choose the closest allowed value; skill: the official SAT skill name.
- explanation: one or two sentences in Uzbek (Latin script).
- number / module: copy the printed question number and module (e.g. "Module 1", "M2") if visible.
- hasFigure: true when a graph, chart or picture is needed that you cannot reproduce as text or an HTML table.${
    body.chunk
      ? `
- This is part ${body.chunk.index + 1} of ${body.chunk.total} of a larger document (starting at page ${body.chunk.firstPage}). Skip a question cut off at the very start or end of this part (missing its stem or choices) — it is extracted from the neighbouring part. Do not extract answer-key tables as questions.`
      : ""
  }
Return a JSON array (possibly empty).`;

  const parts = [{ text: instructions }];
  for (const f of body.files || []) parts.push({ inline_data: { mime_type: f.mimeType, data: f.data } });
  if (body.text?.trim()) parts.push({ text: `MATERIAL:\n${body.text}` });

  // Bo'lak: tez rejim, qisqa timeout — xato bo'lsa client faqat shu bo'lakni
  // qayta yuboradi.
  const raw = await generateJson(
    parts,
    LIST_SCHEMA,
    body.chunk ? { fast: true, timeoutMs: 90_000, maxModels: 3 } : {}
  );
  const items = (Array.isArray(raw) ? raw : []).slice(0, 150).map((q) => cleanQuestion(q, body.subject)).filter((q) => q.prompt);
  res.json({ items });
});

const FILES = z.array(
  z.object({ mimeType: z.enum(MIME, "Faqat PDF, PNG, JPEG yoki WEBP."), data: z.string().max(21_000_000) })
);

const KEY_SCHEMA = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      section: { type: "STRING", enum: ["rw", "math"], description: "rw = Reading and Writing, math = Math." },
      module: { type: "STRING", description: "Module/part number as printed (\"1\", \"2\"); empty if the key is one list." },
      number: { type: "INTEGER" },
      answer: { type: "STRING", description: "A-D for multiple choice, or the written answer." },
    },
    required: ["section", "module", "number", "answer"],
  },
};

// PDF oxiridagi javoblar kaliti (jadval). Kalit topilmasa — bo'sh ro'yxat.
router.post("/parse-answer-key", async (req, res) => {
  const body = parseBody(z.object({ subject: parseSubject, files: FILES.min(1).max(4) }), req.body);
  const name = { rw: "Reading and Writing", math: "Math", auto: "full (Reading and Writing + Math)" }[body.subject];
  const prompt = `These are the last pages of an SAT ${name} practice document.
If they contain an answer key, return every entry as { section, module, number, answer }: section "rw" or "math", module = the module/part number ("1", "2").
If the key table covers several different tests, include only the FIRST test's columns${body.subject === "auto" ? "" : ` for ${name}`}.
If there is no answer key, return an empty array.`;
  const parts = [{ text: prompt }, ...body.files.map((f) => ({ inline_data: { mime_type: f.mimeType, data: f.data } }))];
  const raw = await generateJson(parts, KEY_SCHEMA, { fast: true, timeoutMs: 90_000, maxModels: 3 });
  const keys = (Array.isArray(raw) ? raw : [])
    .map((k) => ({
      section: SECTIONS.includes(k?.section) ? k.section : body.subject === "auto" ? "" : body.subject,
      module: str(k?.module, 8).replace(/\D/g, ""),
      number: Math.trunc(Number(k?.number)) || 0,
      answer: str(k?.answer, 40),
    }))
    .filter((k) => k.number > 0 && k.answer)
    .slice(0, 400);
  res.json({ keys });
});

const example = z.object({
  passage: z.string().max(6000).optional(),
  prompt: z.string().max(3000),
  choices: z.array(z.object({ label: z.string(), text: z.string().max(1000) })).max(4).optional(),
  correctAnswer: z.string().max(4).nullable().optional(),
});

router.post("/generate-questions", async (req, res) => {
  const body = parseBody(
    z.object({
      subject,
      items: z
        .array(z.object({ domain: z.string().max(40), skill: z.string().max(80).optional(), difficulty }))
        .min(1)
        .max(12),
      examples: z.array(example).max(3).optional(),
    }),
    req.body
  );

  const examples = (body.examples || [])
    .map((e, i) => {
      const choices = (e.choices || []).map((c) => `${c.label}) ${c.text}`).join("\n");
      return `Example ${i + 1}:\n${e.passage ? `Passage: ${e.passage}\n` : ""}Question: ${e.prompt}\n${choices}\nAnswer: ${e.correctAnswer || "?"}`;
    })
    .join("\n\n");

  const prompt = `You write ORIGINAL Digital SAT practice questions for an exam-prep platform.
${subjectRules(body.subject)}
Write exactly ${body.items.length} new multiple-choice questions, one for each spec below, in the same order:
${body.items.map((it, i) => `${i + 1}. domain=${it.domain}${it.skill ? `, skill=${it.skill}` : ""}, difficulty=${it.difficulty}`).join("\n")}

Requirements:
- Match the real Digital SAT style, length and difficulty level. ${body.subject === "rw" ? "Each question has its own short passage (25-150 words)." : "Passage may be empty."}
- Do not copy real College Board or published test questions; write new content.
- Exactly one choice is correct; the three distractors must be plausible but clearly wrong.
- Before answering, solve each question yourself and make sure correctAnswer is right. Set confidence honestly.
- explanation: one or two sentences in Uzbek (Latin script).
${examples ? `\nMatch the style of these questions from the same test:\n${examples}` : ""}
Return a JSON array.`;

  const raw = await generateJson([{ text: prompt }], LIST_SCHEMA, { temperature: 0.8 });
  const items = (Array.isArray(raw) ? raw : [])
    .slice(0, body.items.length)
    .map((q, i) => ({
      ...shuffleChoices(cleanQuestion({ ...q, type: "mcq" }, body.subject)),
      // So'ralgan spetsifikatsiya ustun: adaptiv yig'ish shu qiyinlikka tayanadi.
      domain: body.items[i].domain,
      difficulty: body.items[i].difficulty,
      aiGenerated: true,
    }))
    .filter((q) => q.prompt);
  res.json({ items });
});

export default router;
