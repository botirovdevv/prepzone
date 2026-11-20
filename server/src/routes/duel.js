import { Router } from "express";
import { z } from "zod";
import { notFound, parseBody } from "../lib/errors.js";
import { perUserLimit } from "../lib/limiters.js";
import { DUEL_CODE_RE, createDuel, duelLeaderboard, duelStats, getDuel, playerFromUser } from "../lib/duels.js";
import { CATEGORIES, DUEL_MODES } from "../lib/duelModes.js";

// ------------------------------------------------------------------
// /api/duel — SAT Duel (1v1). O'yinning o'zi Socket.IO orqali (realtime.js).
//   POST /              — do'stni chaqirish uchun yangi jang kodi
//   GET  /me            — mening Duel reytingim va oxirgi janglarim
//   GET  /leaderboard   — top 50 (ELO)
//   GET  /:code         — taklif sahifasi: kim chaqirdi, bo'lim, o'rin bormi
// ------------------------------------------------------------------

const router = Router();

router.post("/", perUserLimit({ windowMs: 60_000, limit: 10 }), async (req, res) => {
  const { section, mode } = parseBody(
    z.object({
      section: z.enum(["math", "rw", "mix"]).default("mix"),
      mode: z.enum(Object.keys(DUEL_MODES)).default("classic"),
    }),
    req.body
  );
  const duel = await createDuel({ host: playerFromUser(req.user), section, modeId: mode, origin: "invite" });
  res.json({ code: duel.code });
});

router.get("/me", async (req, res) => {
  res.json(await duelStats(String(req.user.id)));
});

router.get("/leaderboard", async (req, res) => {
  const category = CATEGORIES.includes(req.query.category) ? req.query.category : "classic";
  res.json(await duelLeaderboard(category));
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
    mode: duel.mode.id,
    status: duel.status,
    host: { id: host.id, name: host.name, avatarUrl: host.avatarUrl, rating: host.rating },
    seated,
    open: seated || (duel.status === "waiting" && duel.players.length < 2),
  });
});

export default router;
