import { Router } from "express";
import { one, query } from "../db/index.js";
import { notFound } from "../lib/errors.js";
import { leaderboardDoc, resultDoc } from "../lib/serialize.js";

// ------------------------------------------------------------------
// "Mening natijalarim" va reyting. Natijalar faqat serverda baholanib
// yoziladi: statik testlar — routes/sat.js, sessiyalar — routes/sessions.js.
// ------------------------------------------------------------------

export const resultsRouter = Router();

// Yangidan eskiga, sahifalab: ?limit=20&before=<createdAt ISO>.
resultsRouter.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const before = req.query.before ? new Date(String(req.query.before)) : null;
  const { rows } = await query(
    `SELECT * FROM results WHERE user_id = $1 ${before && !Number.isNaN(before.getTime()) ? "AND created_at < $3" : ""}
     ORDER BY created_at DESC LIMIT $2`,
    before && !Number.isNaN(before.getTime()) ? [req.user.id, limit + 1, before] : [req.user.id, limit + 1]
  );
  const items = rows.slice(0, limit).map(resultDoc);
  res.json({ items, hasMore: rows.length > limit });
});

resultsRouter.get("/count", async (req, res) => {
  const row = await one("SELECT count(*)::int AS count FROM results WHERE user_id = $1", [req.user.id]);
  res.json({ count: row.count });
});

resultsRouter.get("/:id", async (req, res) => {
  const row = await one("SELECT * FROM results WHERE id = $1 AND user_id = $2", [
    req.params.id,
    req.user.id,
  ]);
  if (!row) throw notFound("Bu natija topilmadi.");
  res.json(resultDoc(row));
});

export const leaderboardRouter = Router();

leaderboardRouter.get("/", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 15, 1), 100);
  const { rows } = await query(
    `SELECT l.*, u.avatar_updated_at FROM leaderboard l JOIN users u ON u.id = l.user_id
     WHERE u.blocked_at IS NULL
     ORDER BY l.best_score DESC, l.updated_at ASC LIMIT $1`,
    [limit]
  );
  res.json(rows.map(leaderboardDoc));
});

leaderboardRouter.get("/me", async (req, res) => {
  const row = await one(
    `SELECT l.*, u.avatar_updated_at FROM leaderboard l JOIN users u ON u.id = l.user_id
     WHERE l.user_id = $1`,
    [req.user.id]
  );
  res.json(row ? leaderboardDoc(row) : null);
});
