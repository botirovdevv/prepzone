import { Router } from "express";
import { z } from "zod";
import { notFound, parseBody } from "../lib/errors.js";
import { perUserLimit } from "../lib/limiters.js";
import { DUEL_CODE_RE, createDuel, duelLeaderboard, duelStats, getDuel, playerFromUser } from "../lib/duels.js";

// ------------------------------------------------------------------
// /api/duel — SAT Duel (1v1). O'yinning o'zi Socket.IO orqali (realtime.js).
//   POST /              — do'stni chaqirish uchun yangi jang kodi
//   GET  /me            — mening Duel reytingim va oxirgi janglarim
//   GET  /leaderboard   — top 50 (ELO)
//   GET  /:code         — taklif sahifasi: kim chaqirdi, bo'lim, o'rin bormi
// ------------------------------------------------------------------

const router = Router();

router.post("/", perUserLimit({ windowMs: 60_000, limit: 10 }), async (req, res) => {
  const { section } = parseBody(z.object({ section: z.enum(["math", "rw", "mix"]).default("mix") }), req.body);
  const duel = await createDuel({ host: playerFromUser(req.user), section });
  res.json({ code: duel.code });
});

router.get("/me", async (req, res) => {
  res.json(await duelStats(String(req.user.id)));
});

router.get("/leaderboard", async (_req, res) => {
  res.json(await duelLeaderboard());
});

router.get("/:code", (req, res) => {
  const code = String(req.params.code).toUpperCase();
  const duel = DUEL_CODE_RE.test(code) ? getDuel(code) : null;
  if (!duel || duel.status === "cancelled") throw notFound("Jang topilmadi yoki muddati o'tgan.");
  const host = duel.players.find((p) => p.id === duel.hostId) || duel.players[0];
  const seated = duel.players.some((p) => p.id === String(req.user.id));
  res.json({
    code,
    section: duel.section,
    status: duel.status,
    host: { id: host.id, name: host.name, avatarUrl: host.avatarUrl },
    seated,
    open: seated || (duel.status === "waiting" && duel.players.length < 2),
  });
});

export default router;
