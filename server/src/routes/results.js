import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { notFound, parseBody } from "../lib/errors.js";
import { leaderboardDoc, resultDoc } from "../lib/serialize.js";
import { maybeUpdateLeaderboard } from "../lib/leaderboard.js";

// ------------------------------------------------------------------
// Statik SAT mock test natijalari + reyting.
// ------------------------------------------------------------------

export const resultsRouter = Router();

export const resultBody = z.object({
  results: z.record(z.string(), z.any()),
  total: z.number().int().min(0).max(1600),
  terminated: z.boolean().optional(),
  terminationReason: z.string().max(100).optional(),
});

resultsRouter.post("/", async (req, res) => {
  const body = parseBody(resultBody, req.body);
  const { total, ...data } = body;
  const row = await tx(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO results (id, user_id, total, data) VALUES ($1, $2, $3, $4) RETURNING *`,
      [crypto.randomUUID(), req.user.id, total, { ...data, email: req.user.email }]
    );
    await maybeUpdateLeaderboard(client, req.user, total);
    return rows[0];
  });
  res.status(201).json(resultDoc(row));
});

resultsRouter.get("/", async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM results WHERE user_id = $1 ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json(rows.map(resultDoc));
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
  const limit = Math.min(Number(req.query.limit) || 15, 100);
  const { rows } = await query(
    "SELECT * FROM leaderboard ORDER BY best_score DESC, updated_at ASC LIMIT $1",
    [limit]
  );
  res.json(rows.map(leaderboardDoc));
});

leaderboardRouter.get("/me", async (req, res) => {
  const row = await one("SELECT * FROM leaderboard WHERE user_id = $1", [req.user.id]);
  res.json(row ? leaderboardDoc(row) : null);
});
