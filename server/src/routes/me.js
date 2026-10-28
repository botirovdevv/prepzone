import { Router } from "express";
import { z } from "zod";
import { one } from "../db/index.js";
import { parseBody } from "../lib/errors.js";
import { publicUser } from "../lib/serialize.js";

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

export default router;
