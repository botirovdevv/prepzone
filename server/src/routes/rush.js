import { Router } from "express";
import { z } from "zod";
import { notFound, parseBody } from "../lib/errors.js";
import { perUserLimit } from "../lib/limiters.js";
import { RUSH_MODES, answerRun, finishRun, getRun, rushLeaderboard, rushStats, startRun } from "../lib/rush.js";

// ------------------------------------------------------------------
// /api/rush — SAT Rush (yakka, Puzzle Rush kabi).
//   POST /start {mode}         — yangi run: birinchi savol, tugash vaqti
//   POST /:id/answer {choice}  — javob → natija + keyingi savol yoki yakun
//   POST /:id/finish           — vaqt tugadi (klient soati) → yakun
//   GET  /me                   — rejimlar bo'yicha rekordlar
//   GET  /leaderboard?mode=    — top 50
// ------------------------------------------------------------------

const router = Router();
const modeEnum = z.enum(Object.keys(RUSH_MODES));

router.post("/start", perUserLimit({ windowMs: 60_000, limit: 15 }), async (req, res) => {
  const { mode } = parseBody(z.object({ mode: modeEnum }), req.body);
  res.json(await startRun(req.user, mode));
});

router.post("/:id/answer", perUserLimit({ windowMs: 60_000, limit: 120 }), async (req, res) => {
  const { choice } = parseBody(z.object({ choice: z.string().max(4) }), req.body);
  const run = getRun(req.params.id, req.user.id);
  if (!run) throw notFound("Run topilmadi.");
  res.json(await answerRun(run, choice));
});

router.post("/:id/finish", async (req, res) => {
  const run = getRun(req.params.id, req.user.id);
  if (!run) throw notFound("Run topilmadi.");
  // Vaqtli rejimda muddatidan oldin yakunlab bo'lmaydi (survival — "To'xtatish").
  if (run.endsAt && Date.now() < run.endsAt - 2_000) return res.json({ finished: null });
  res.json({ finished: await finishRun(run) });
});

router.get("/me", async (req, res) => {
  res.json(await rushStats(String(req.user.id)));
});

router.get("/leaderboard", async (req, res) => {
  const mode = RUSH_MODES[req.query.mode] ? req.query.mode : "rush3";
  res.json(await rushLeaderboard(mode));
});

export default router;
