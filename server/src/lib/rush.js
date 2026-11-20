import { randomBytes, randomInt } from "node:crypto";
import { one, pool, tx } from "../db/index.js";
import { loadBank } from "./questionBank.js";
import { stripQuestion } from "./satScoring.js";
import { addXp } from "./streaks.js";
import { avatarUrl } from "./serialize.js";

// ------------------------------------------------------------------
// SAT Rush — yakka rejim (chess.com Puzzle Rush kabi). To'g'ri javob = +1,
// 3 ta xato yoki vaqt tugashi = tamom. Qiyinlik ballga qarab oshadi.
// Run'lar xotirada; tugaganda rush_runs'ga yoziladi (+ XP, xatolar daftari).
// Vaqt va kalit faqat serverda.
// ------------------------------------------------------------------

export const RUSH_MODES = {
  rush3: { id: "rush3", ms: 180_000, maxLen: 600 },
  rush5: { id: "rush5", ms: 300_000, maxLen: 600 },
  survival: { id: "survival", ms: null, maxLen: Infinity },
};

const MAX_STRIKES = 3;
const GRACE_MS = 1_500;
const RUN_TTL_MS = 15 * 60_000;
const XP_CAP = 50;

// runId -> run
const runs = new Map();

const qLength = (q) =>
  (q.passage || "").length + (q.prompt || "").length + (q.choices || []).reduce((n, c) => n + (c.text || "").length, 0);

const levelFor = (score) => (score < 5 ? "easy" : score < 12 ? "medium" : "hard");

async function nextQuestion(run) {
  const bank = await loadBank();
  const mode = RUSH_MODES[run.mode];
  const level = levelFor(run.score);
  const fits = (q) => qLength(q) <= mode.maxLen && !run.used.has(q.sourceId || q.prompt);
  // Math ko'proq (tezroq o'qiladi): 60% Math, 40% RW.
  const order = Math.random() < 0.6 ? ["math", "rw"] : ["rw", "math"];
  let pool = [];
  for (const sec of order) {
    pool = bank[sec].filter((q) => q.difficulty === level && fits(q));
    if (pool.length) break;
  }
  if (!pool.length) pool = [...bank.math, ...bank.rw].filter(fits);
  if (!pool.length) {
    run.used.clear();
    pool = [...bank.math, ...bank.rw];
  }
  const q = pool[randomInt(pool.length)];
  run.used.add(q.sourceId || q.prompt);
  run.current = { ...q, id: `rush-${run.served++}` };
  return run.current;
}

const publicQ = (q) => ({ ...stripQuestion(q), section: q.section });

export async function startRun(user, modeId) {
  const mode = RUSH_MODES[modeId];
  // Bir userga bitta faol run — eskisi saqlanib yopiladi.
  for (const r of runs.values()) if (r.userId === String(user.id) && !r.finished) await finishRun(r);
  const id = randomBytes(9).toString("base64url");
  const now = Date.now();
  const run = {
    id,
    userId: String(user.id),
    mode: mode.id,
    startedAt: now,
    endsAt: mode.ms ? now + mode.ms : null,
    score: 0,
    strikes: 0,
    used: new Set(),
    served: 0,
    current: null,
    wrong: [],
    finished: null,
    timer: null,
    touchedAt: now,
  };
  runs.set(id, run);
  if (run.endsAt) {
    run.timer = setTimeout(() => finishRun(run).catch((e) => console.error("[rush]", e)), mode.ms + GRACE_MS);
    run.timer.unref?.();
  }
  const q = await nextQuestion(run);
  return { runId: id, mode: mode.id, question: publicQ(q), endsAt: run.endsAt, serverNow: now, score: 0, strikes: 0 };
}

export function getRun(id, userId) {
  const run = runs.get(id);
  if (!run || run.userId !== String(userId)) return null;
  run.touchedAt = Date.now();
  return run;
}

export async function answerRun(run, choice) {
  if (run.finished) return { finished: run.finished, score: run.score, strikes: run.strikes };
  const now = Date.now();
  if (run.endsAt && now > run.endsAt + GRACE_MS) {
    return { finished: await finishRun(run), score: run.score, strikes: run.strikes };
  }
  const q = run.current;
  if (!q.choices.some((c) => c.label === choice)) return { error: "invalid" };
  const correct = choice === q.correctAnswer;
  if (correct) run.score += 1;
  else {
    run.strikes += 1;
    run.wrong.push(q);
  }
  const base = { correct, correctAnswer: q.correctAnswer, score: run.score, strikes: run.strikes };
  if (run.strikes >= MAX_STRIKES) return { ...base, finished: await finishRun(run) };
  const next = await nextQuestion(run);
  return { ...base, question: publicQ(next), serverNow: now };
}

// Vaqt tugaganda (klient so'raydi yoki server taymeri) yoki 3 xatoda.
export async function finishRun(run) {
  if (run.finished) return run.finished;
  if (run.finishing) return run.finishing;
  clearTimeout(run.timer);
  run.finishing = (async () => {
    const prev = await one("SELECT max(score)::int AS best FROM rush_runs WHERE user_id = $1 AND mode = $2", [run.userId, run.mode]);
    const xp = Math.min(run.score, XP_CAP);
    await tx(async (client) => {
      await client.query("INSERT INTO rush_runs (user_id, mode, score, strikes) VALUES ($1, $2, $3, $4)", [
        run.userId,
        run.mode,
        run.score,
        run.strikes,
      ]);
      if (xp > 0) await addXp(client, run.userId, xp);
      for (const q of run.wrong) {
        await client.query(
          `INSERT INTO mistakes (user_id, question_key, source, section, domain, question)
           VALUES ($1, $2, 'rush', $3, $4, $5) ON CONFLICT DO NOTHING`,
          [run.userId, `bank:${q.sourceId || q.prompt.slice(0, 60)}`, q.section, q.domain || "", q]
        );
      }
    });
    const best = prev?.best ?? null;
    run.finished = {
      score: run.score,
      strikes: run.strikes,
      xp,
      best: Math.max(best ?? 0, run.score),
      newBest: run.score > 0 && (best == null || run.score > best),
    };
    return run.finished;
  })();
  try {
    return await run.finishing;
  } finally {
    run.finishing = null;
  }
}

export async function rushStats(userId) {
  const { rows } = await pool.query(
    "SELECT mode, max(score)::int AS best, count(*)::int AS runs FROM rush_runs WHERE user_id = $1 GROUP BY mode",
    [userId]
  );
  const out = {};
  for (const m of Object.keys(RUSH_MODES)) {
    const r = rows.find((x) => x.mode === m);
    out[m] = { best: r?.best ?? 0, runs: r?.runs ?? 0 };
  }
  return out;
}

export async function rushLeaderboard(mode) {
  const { rows } = await pool.query(
    `SELECT b.user_id, b.best, u.display_name, u.email, u.avatar_updated_at FROM (
       SELECT user_id, max(score)::int AS best FROM rush_runs WHERE mode = $1 GROUP BY user_id
     ) b JOIN users u ON u.id = b.user_id
     WHERE u.blocked_at IS NULL AND b.best > 0
     ORDER BY b.best DESC LIMIT 50`,
    [mode]
  );
  return rows.map((r) => ({
    uid: r.user_id,
    name: r.display_name || r.email.split("@")[0],
    best: r.best,
    avatarUrl: avatarUrl(r.user_id, r.avatar_updated_at),
  }));
}

setInterval(() => {
  const cutoff = Date.now() - RUN_TTL_MS;
  for (const [id, r] of runs) {
    if (r.touchedAt < cutoff) {
      clearTimeout(r.timer);
      runs.delete(id);
    }
  }
}, 60_000).unref();
