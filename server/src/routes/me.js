import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { one, tx } from "../db/index.js";
import { HttpError, badRequest, parseBody } from "../lib/errors.js";
import { publicUser } from "../lib/serialize.js";
import { DOMAINS } from "../lib/gemini.js";
import { generateStudyPlan } from "../lib/studyPlanAi.js";
import { decodeDataImage } from "../lib/images.js";

// ------------------------------------------------------------------
// Foydalanuvchining o'z profili: onboarding so'rovnomasi va Study Plan.
// Har bir javob yangilangan foydalanuvchini qaytaradi (AuthContext uni
// darhol qo'llaydi).
// ------------------------------------------------------------------

const router = Router();

const SOURCES = ["instagram", "telegram", "friends", "other"];

router.put("/onboarding", async (req, res) => {
  const body = parseBody(
    z.object({
      source: z.enum(SOURCES),
      sourceOther: z.string().max(60).optional().default(""),
      targets: z.object({ sat: z.number().int().min(400).max(1600).multipleOf(10) }),
    }),
    req.body
  );
  const onboarding = {
    source: body.source,
    sourceOther: body.source === "other" ? body.sourceOther.trim() : "",
    targets: body.targets,
    completedAt: new Date().toISOString(),
  };
  // Maqsad ball bitta: Study Plan bo'lsa, undagi maqsad ham yangilanadi.
  const user = await one(
    `UPDATE users SET onboarding = $2,
       study_plan = CASE WHEN study_plan ? 'settings'
         THEN jsonb_set(study_plan, '{settings,targetScore}', to_jsonb($3::int))
         ELSE study_plan END
     WHERE id = $1 RETURNING *`,
    [req.user.id, onboarding, body.targets.sat]
  );
  res.json({ user: publicUser(user) });
});

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Study Plan sozlamalari (imtihon sanasi, maqsad, kunlik vaqt...). Bajarilgan
// vazifalar (`done`) alohida endpoint orqali yangilanadi va saqlanib qoladi.
router.put("/study-plan", async (req, res) => {
  const { settings } = parseBody(
    z.object({
      settings: z
        .object({
          examDate: dateKey,
          targetScore: z.number().int().min(400).max(1600),
        })
        .passthrough()
        .refine((s) => JSON.stringify(s).length <= 4000, "Sozlamalar juda katta."),
    }),
    req.body
  );
  const user = await one(
    `UPDATE users SET study_plan = jsonb_build_object(
        'settings', $2::jsonb,
        'done', COALESCE(study_plan->'done', '{}'::jsonb),
        'updatedAt', to_jsonb(now())),
       -- Maqsad ball bitta: onboarding'dagi maqsad ham yangilanadi (10 ga yaxlitlab).
       onboarding = CASE WHEN onboarding IS NULL THEN NULL
         ELSE jsonb_set(onboarding, '{targets,sat}', to_jsonb(round($3::int / 10.0)::int * 10)) END
     WHERE id = $1 RETURNING *`,
    [req.user.id, settings, settings.targetScore]
  );
  res.json({ user: publicUser(user) });
});

// Bitta kunning bajarilgan vazifalari: { date, done: ["taskId", ...] }.
router.patch("/study-plan/done", async (req, res) => {
  const { date, done } = parseBody(
    z.object({ date: dateKey, done: z.array(z.string().max(60)).max(30) }),
    req.body
  );
  const user = await one(
    `UPDATE users SET study_plan = jsonb_set(
        COALESCE(study_plan, '{}'::jsonb) || jsonb_build_object('done', COALESCE(study_plan->'done', '{}'::jsonb)),
        ARRAY['done', $2::text], $3::jsonb)
     WHERE id = $1 RETURNING *`,
    [req.user.id, date, JSON.stringify(done)]
  );
  res.json({ user: publicUser(user) });
});

// AI (Gemini) haftalik reja. Sozlamalar DB'dan olinadi; client faqat mock
// tahlilini (raqamlar va mavzu id'lari) yuboradi. Natija `study_plan.ai` ga
// yoziladi — sozlamalar o'zgarganda (PUT /study-plan) u tushib qoladi.
const aiPlanLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 6,
  keyGenerator: (req) => req.user.id,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ code: "ai/rate-limited", message: "Bugungi AI reja limiti tugadi. Ertaga qayta urinib ko'ring." }),
});

const score = (min, max) => z.number().int().min(min).max(max).nullable();

router.post("/study-plan/ai", aiPlanLimit, async (req, res) => {
  const body = parseBody(
    z.object({
      startDate: dateKey,
      lang: z.enum(["uz", "en"]).default("uz"),
      vocabDue: z.number().int().min(0).max(10_000).default(0),
      latestId: z.string().max(80).nullable().optional(),
      analysis: z.object({
        current: score(0, 1600),
        rw: score(0, 800),
        math: score(0, 800),
        domains: z
          .array(
            z.object({
              id: z.enum([...DOMAINS.rw, ...DOMAINS.math]),
              correct: z.number().int().min(0).max(10_000),
              total: z.number().int().min(0).max(10_000),
            })
          )
          .max(8),
      }),
    }),
    req.body
  );

  const current = await one("SELECT study_plan FROM users WHERE id = $1", [req.user.id]);
  const settings = current?.study_plan?.settings;
  if (!settings?.examDate) throw badRequest("failed-precondition", "Avval rejani sozlang.");

  const ai = await generateStudyPlan({
    settings: {
      examDate: settings.examDate,
      targetScore: settings.targetScore,
      dailyMinutes: Number(settings.dailyMinutes) || 60,
      restDays: Array.isArray(settings.restDays) ? settings.restDays : [],
      mockDay: Number.isInteger(settings.mockDay) ? settings.mockDay : 6,
    },
    analysis: body.analysis,
    vocabDue: body.vocabDue,
    hasLatestResult: !!body.latestId,
    latestId: body.latestId,
    startDate: body.startDate,
    lang: body.lang,
  });
  if (!ai.days.length) throw new HttpError(502, "ai/empty", "AI reja tuza olmadi. Qayta urinib ko'ring.");

  const user = await one(
    "UPDATE users SET study_plan = COALESCE(study_plan, '{}'::jsonb) || jsonb_build_object('ai', $2::jsonb) WHERE id = $1 RETURNING *",
    [req.user.id, JSON.stringify(ai)]
  );
  res.json({ user: publicUser(user) });
});

// ------------------------------------------------------------------
// Profil rasmi. Brauzer rasmni 256x256 JPEG qilib siqib, data URL
// ko'rinishida yuboradi; serverda haqiqatan rasm ekanini tekshiramiz.
// ------------------------------------------------------------------

const AVATAR_MAX_BYTES = 300 * 1024;

const decodeAvatar = (dataUrl) => decodeDataImage(dataUrl, AVATAR_MAX_BYTES);

router.put("/avatar", async (req, res) => {
  const { dataUrl } = parseBody(z.object({ dataUrl: z.string().max(500_000) }), req.body);
  const { mime, data } = decodeAvatar(dataUrl);
  const user = await tx(async (client) => {
    await client.query(
      `INSERT INTO user_avatars (user_id, mime, data, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (user_id) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data, updated_at = now()`,
      [req.user.id, mime, data]
    );
    const { rows } = await client.query(
      "UPDATE users SET avatar_updated_at = now() WHERE id = $1 RETURNING *",
      [req.user.id]
    );
    return rows[0];
  });
  res.json({ user: publicUser(user) });
});

router.delete("/avatar", async (req, res) => {
  const user = await tx(async (client) => {
    await client.query("DELETE FROM user_avatars WHERE user_id = $1", [req.user.id]);
    const { rows } = await client.query(
      "UPDATE users SET avatar_updated_at = NULL WHERE id = $1 RETURNING *",
      [req.user.id]
    );
    return rows[0];
  });
  res.json({ user: publicUser(user) });
});

export default router;
