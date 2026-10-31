import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { notFound, parseBody } from "../lib/errors.js";
import { desmosDoc, questionSetDoc } from "../lib/serialize.js";
import { requirePerm } from "../middleware/auth.js";

// ------------------------------------------------------------------
// O'quv kontenti: amaliyot to'plamlari va Desmos darsliklari. Har bir
// login qilgan foydalanuvchi o'qiy oladi, faqat admin o'zgartiradi.
// ------------------------------------------------------------------

const questionSetBody = z.object({
  title: z.string().trim().min(1, "To'plam nomini kiriting.").max(200),
  description: z.string().max(2000).optional().default(""),
  sections: z.array(z.object({ id: z.string() }).passthrough()).max(10),
});

const desmosBody = z.object({
  title: z.string().trim().min(1, "Darslik nomini kiriting.").max(200),
  description: z.string().max(2000).optional().default(""),
  videoUrl: z.string().max(500).optional().default(""),
  order: z.number().int().optional().default(0),
  content: z.string().max(5_000_000).optional().default(""),
});

const authorFields = (user) => ({
  createdBy: user.id,
  createdByName: user.display_name || user.email,
});

export const questionSetsRouter = Router();

// Ro'yxat uchun savollarsiz (rasmlar base64 bo'lgani uchun og'ir) —
// har bir bo'limda faqat savollar soni qaytariladi. Ro'yxat xotirada
// keshlanadi: to'plam qo'shilsa/o'zgarsa/o'chirilsa tozalanadi (API bitta
// jarayon). Shunda har bir talaba sahifani ochganda bazadan barcha
// savollar o'qilmaydi.
let setsListCache = null;
const clearSetsCache = () => {
  setsListCache = null;
};

questionSetsRouter.get("/", async (_req, res) => {
  if (!setsListCache) {
    const { rows } = await query("SELECT * FROM question_sets ORDER BY created_at DESC");
    setsListCache = rows.map((row) => {
      const doc = questionSetDoc(row);
      const sections = (doc.sections || []).map(({ questions, ...sec }) => ({
        ...sec,
        questionCount: Array.isArray(questions) ? questions.length : 0,
      }));
      return { ...doc, sections, questionCount: sections.reduce((n, s) => n + s.questionCount, 0) };
    });
  }
  res.json(setsListCache);
});

questionSetsRouter.get("/:id", async (req, res) => {
  const row = await one("SELECT * FROM question_sets WHERE id = $1", [req.params.id]);
  if (!row) throw notFound("To'plam topilmadi.");
  res.json(questionSetDoc(row));
});

questionSetsRouter.post("/", requirePerm("sets"), async (req, res) => {
  const body = parseBody(questionSetBody, req.body);
  const row = await one("INSERT INTO question_sets (id, data) VALUES ($1, $2) RETURNING *", [
    crypto.randomUUID(),
    { ...body, ...authorFields(req.user) },
  ]);
  clearSetsCache();
  res.status(201).json(questionSetDoc(row));
});

questionSetsRouter.put("/:id", requirePerm("sets"), async (req, res) => {
  const body = parseBody(questionSetBody, req.body);
  const row = await one(
    "UPDATE question_sets SET data = data || $2::jsonb, updated_at = now() WHERE id = $1 RETURNING *",
    [req.params.id, body]
  );
  if (!row) throw notFound("To'plam topilmadi.");
  clearSetsCache();
  res.json(questionSetDoc(row));
});

questionSetsRouter.delete("/:id", requirePerm("sets"), async (req, res) => {
  await query("DELETE FROM question_sets WHERE id = $1", [req.params.id]);
  clearSetsCache();
  res.json({ ok: true });
});

export const desmosRouter = Router();

desmosRouter.get("/", async (_req, res) => {
  const { rows } = await query("SELECT * FROM desmos_tutorials ORDER BY sort_order ASC, created_at ASC");
  // Ro'yxatda matn (HTML) kerak emas — u darslik sahifasida alohida olinadi.
  res.json(rows.map((row) => {
    const { content: _content, ...doc } = desmosDoc(row);
    return doc;
  }));
});

desmosRouter.get("/:id", async (req, res) => {
  const row = await one("SELECT * FROM desmos_tutorials WHERE id = $1", [req.params.id]);
  if (!row) throw notFound("Darslik topilmadi.");
  res.json(desmosDoc(row));
});

desmosRouter.post("/", requirePerm("desmos"), async (req, res) => {
  const { order, ...data } = parseBody(desmosBody, req.body);
  const row = await one(
    "INSERT INTO desmos_tutorials (id, sort_order, data) VALUES ($1, $2, $3) RETURNING *",
    [crypto.randomUUID(), order, { ...data, ...authorFields(req.user) }]
  );
  res.status(201).json(desmosDoc(row));
});

desmosRouter.put("/:id", requirePerm("desmos"), async (req, res) => {
  const { order, ...data } = parseBody(desmosBody, req.body);
  const row = await one(
    `UPDATE desmos_tutorials SET sort_order = $2, data = data || $3::jsonb, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [req.params.id, order, data]
  );
  if (!row) throw notFound("Darslik topilmadi.");
  res.json(desmosDoc(row));
});

desmosRouter.delete("/:id", requirePerm("desmos"), async (req, res) => {
  await query("DELETE FROM desmos_tutorials WHERE id = $1", [req.params.id]);
  res.json({ ok: true });
});
