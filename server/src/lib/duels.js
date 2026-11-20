import { randomInt } from "node:crypto";
import { one, pool, tx } from "../db/index.js";
import { loadBank } from "./questionBank.js";
import { stripQuestion } from "./satScoring.js";
import { addXp, XP } from "./streaks.js";
import { avatarUrl } from "./serialize.js";

// ------------------------------------------------------------------
// SAT Duel — 1v1 jonli bellashuv. Janglar faqat xotirada (server qayta
// ishga tushsa davom etayotgan janglar yo'qoladi); tugagan jang bazaga
// yoziladi (duel_matches, duel_ratings, XP, xatolar daftari).
//
// Ishonchli mantiq shu yerda: savol kaliti raund yopilmaguncha klientga
// bormaydi, javob vaqti server soatida o'lchanadi, ball server hisoblaydi.
//
// Holatlar: waiting → countdown → round ⇄ reveal → finished (yoki cancelled).
// Socket hodisalari: realtime.js (registerDuel).
// ------------------------------------------------------------------

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const DUEL_CODE_RE = /^[A-HJKMNP-Z2-9]{6}$/;
export const SECTIONS = new Set(["math", "rw", "mix"]);

export const ROUNDS = 7;
export const ROUND_MS = 90_000;
const COUNTDOWN_MS = 3_500;
const REVEAL_MS = 4_500;
// Tarmoq kechikishi uchun: deadline'dan keyin shuncha ichida kelgan javob qabul qilinadi.
const GRACE_MS = 800;
// Uzilgan o'yinchi shuncha ichida qaytmasa — raqib texnik g'alaba oladi.
const RECONNECT_MS = 20_000;
const WAITING_TTL_MS = 30 * 60_000;
const FINISHED_TTL_MS = 15 * 60_000;
// Bir juftlik kuniga shuncha reytingli jang o'ynaydi, keyingilari reytingsiz.
const RATED_PER_PAIR_PER_DAY = 5;
const ELO_K = 32;

export const BOT_ID = "bot";
const BOT_NAME = "PrepBot";
const BOT_ACCURACY = { easy: 0.8, medium: 0.6, hard: 0.4 };

// code -> duel
const duels = new Map();
// section -> [{ userId, socketId, player }]
const queues = new Map([...SECTIONS].map((s) => [s, []]));

let io = null;
export function initDuels(server) {
  io = server;
}

const room = (code) => `duel:${code}`;
const emit = (duel, event, payload) => io?.to(room(duel.code)).emit(event, payload);

function newCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  } while (duels.has(code));
  return code;
}

export function playerFromUser(user) {
  return {
    id: String(user.id),
    name: user.display_name || user.email?.split("@")[0] || "Talaba",
    avatarUrl: avatarUrl(user.id, user.avatar_updated_at),
    bot: false,
  };
}

const botPlayer = () => ({ id: BOT_ID, name: BOT_NAME, avatarUrl: null, bot: true });

function seat(p) {
  return { ...p, score: 0, answers: [], sockets: new Set(), dcTimer: null };
}

// ---------------- Savollar ----------------

const pickRandom = (list, n, used) => {
  const pool = list.filter((q) => !used.has(q.sourceId || q.prompt));
  const out = [];
  while (out.length < n && pool.length) {
    const q = pool.splice(randomInt(pool.length), 1)[0];
    used.add(q.sourceId || q.prompt);
    out.push(q);
  }
  return out;
};

// 7 ta savol: oson → o'rta → qiyin (2 + 3 + 2). "mix" — RW va Math navbatma-navbat.
async function pickQuestions(section) {
  const bank = await loadBank();
  const used = new Set();
  const plan = ["easy", "easy", "medium", "medium", "medium", "hard", "hard"];
  return plan.map((difficulty, i) => {
    const sec = section === "mix" ? (i % 2 === 0 ? "rw" : "math") : section;
    const list = bank[sec].filter((q) => q.difficulty === difficulty);
    const [q] = pickRandom(list.length ? list : bank[sec], 1, used);
    return { ...q, id: `duel-${i}` };
  });
}

const publicQuestion = (q) => ({ ...stripQuestion(q), section: q.section });

// ---------------- Holat (klientga) ----------------

function playerDoc(p, duel) {
  return {
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    bot: p.bot,
    score: p.score,
    connected: p.bot || p.sockets.size > 0,
    answered: duel.status === "round" && Boolean(p.answers[duel.round]),
  };
}

// userId berilsa — o'sha o'yinchining joriy raunddagi javobi ham qo'shiladi
// (qayta ulanganda tanlovi ko'rinsin).
export function duelState(duel, userId = null) {
  const me = userId ? duel.players.find((p) => p.id === String(userId)) : null;
  return {
    code: duel.code,
    section: duel.section,
    status: duel.status,
    hostId: duel.hostId,
    players: duel.players.map((p) => playerDoc(p, duel)),
    round: duel.round,
    total: ROUNDS,
    roundMs: ROUND_MS,
    deadline: duel.deadline,
    startsAt: duel.startsAt,
    serverNow: Date.now(),
    question: duel.status === "round" || duel.status === "reveal" ? publicQuestion(duel.questions[duel.round]) : null,
    reveal: duel.status === "reveal" ? duel.lastReveal : null,
    result: duel.result,
    myChoice: me && duel.round >= 0 ? (me.answers[duel.round]?.choice ?? null) : null,
    rematch: [...duel.rematchVotes],
    bot: duel.players.some((p) => p.bot),
  };
}

const broadcastState = (duel) => emit(duel, "duel:state", duelState(duel));

// ---------------- Yaratish / qo'shilish ----------------

function cancelWaitingOf(userId) {
  for (const [code, d] of duels) {
    if (d.hostId === String(userId) && d.status === "waiting" && d.players.length < 2) {
      d.status = "cancelled";
      clearTimeout(d.timer);
      broadcastState(d);
      duels.delete(code);
    }
  }
}

export async function createDuel({ host, section, opponent = null, rematchOf = null }) {
  if (!opponent) cancelWaitingOf(host.id);
  const code = newCode();
  const now = Date.now();
  const duel = {
    code,
    section,
    hostId: host.id,
    createdAt: now,
    touchedAt: now,
    status: "waiting",
    players: [seat(host), ...(opponent ? [seat(opponent)] : [])],
    questions: await pickQuestions(section),
    round: -1,
    deadline: null,
    startsAt: null,
    timer: null,
    botTimer: null,
    lastReveal: null,
    result: null,
    rematchVotes: new Set(),
    rematchCode: null,
    rematchOf,
    // Raqib oldindan belgilangan (revansh, navbat, bot) — o'rin boshqaga ochilmaydi.
    fixed: Boolean(opponent),
    saving: false,
  };
  duels.set(code, duel);
  if (opponent?.bot) maybeStart(duel);
  return duel;
}

export function getDuel(code) {
  const duel = duels.get(code);
  if (duel) duel.touchedAt = Date.now();
  return duel || null;
}

// Socket jangga ulanadi. Bo'sh o'rin bo'lsa (taklif havolasi) — o'tiradi.
export function joinDuel(duel, player, socketId) {
  let p = duel.players.find((x) => x.id === player.id);
  if (!p) {
    if (duel.status !== "waiting" || duel.players.length >= 2) return { ok: false, reason: "full" };
    p = seat(player);
    duel.players.push(p);
  }
  p.sockets.add(socketId);
  if (p.dcTimer) {
    clearTimeout(p.dcTimer);
    p.dcTimer = null;
  }
  maybeStart(duel);
  broadcastState(duel);
  return { ok: true };
}

export function leaveSocket(duel, userId, socketId, { forfeit = false } = {}) {
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p) return;
  p.sockets.delete(socketId);
  const live = ["countdown", "round", "reveal"].includes(duel.status);

  if (duel.status === "waiting" && p.sockets.size === 0 && p.id !== duel.hostId && !duel.fixed) {
    // Taklifni qabul qilib, boshlanmasdan chiqib ketgan — o'rin bo'shaydi.
    duel.players = duel.players.filter((x) => x !== p);
  } else if (live && forfeit) {
    endByForfeit(duel, p);
    return;
  } else if (live && p.sockets.size === 0 && !p.dcTimer) {
    p.dcTimer = setTimeout(() => {
      p.dcTimer = null;
      if (p.sockets.size === 0 && ["countdown", "round", "reveal"].includes(duel.status)) endByForfeit(duel, p);
    }, RECONNECT_MS);
    p.dcTimer.unref?.();
  }
  broadcastState(duel);
}

function maybeStart(duel) {
  if (duel.status !== "waiting" || duel.players.length < 2) return;
  if (!duel.players.every((p) => p.bot || p.sockets.size > 0)) return;
  duel.status = "countdown";
  duel.startsAt = Date.now() + COUNTDOWN_MS;
  clearTimeout(duel.timer);
  duel.timer = setTimeout(() => startRound(duel, 0), COUNTDOWN_MS);
}

// ---------------- Raundlar ----------------

function startRound(duel, index) {
  if (!["countdown", "reveal"].includes(duel.status)) return;
  duel.status = "round";
  duel.round = index;
  duel.roundStartedAt = Date.now();
  duel.deadline = duel.roundStartedAt + ROUND_MS;
  duel.lastReveal = null;
  clearTimeout(duel.timer);
  duel.timer = setTimeout(() => reveal(duel), ROUND_MS + GRACE_MS);
  scheduleBot(duel);
  broadcastState(duel);
}

function scheduleBot(duel) {
  const bot = duel.players.find((p) => p.bot);
  if (!bot) return;
  const q = duel.questions[duel.round];
  const right = Math.random() < (BOT_ACCURACY[q.difficulty] ?? 0.6);
  const wrong = q.choices.map((c) => c.label).filter((l) => l !== q.correctAnswer);
  const choice = right ? q.correctAnswer : wrong[randomInt(wrong.length)];
  const delay = 12_000 + randomInt(45_000);
  clearTimeout(duel.botTimer);
  duel.botTimer = setTimeout(() => submitAnswer(duel, BOT_ID, { round: duel.round, choice }), delay);
  duel.botTimer.unref?.();
}

export function submitAnswer(duel, userId, { round, choice }) {
  if (duel.status !== "round" || round !== duel.round) return { ok: false, reason: "closed" };
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p) return { ok: false, reason: "not-player" };
  if (p.answers[round]) return { ok: false, reason: "already" };
  const now = Date.now();
  if (now > duel.deadline + GRACE_MS) return { ok: false, reason: "late" };
  const q = duel.questions[round];
  if (!q.choices.some((c) => c.label === choice)) return { ok: false, reason: "invalid" };
  p.answers[round] = { choice, ms: Math.min(ROUND_MS, now - duel.roundStartedAt) };
  emit(duel, "duel:answered", { playerId: p.id });
  if (duel.players.every((x) => x.answers[round])) reveal(duel);
  return { ok: true };
}

// To'g'ri javob: 100 + tezlik bonusi (0–50, qolgan vaqtga mutanosib).
function pointsFor(answer, q) {
  if (!answer || answer.choice !== q.correctAnswer) return 0;
  return 100 + Math.round((50 * Math.max(0, ROUND_MS - answer.ms)) / ROUND_MS);
}

function reveal(duel) {
  if (duel.status !== "round") return;
  clearTimeout(duel.timer);
  clearTimeout(duel.botTimer);
  const q = duel.questions[duel.round];
  const answers = duel.players.map((p) => {
    const a = p.answers[duel.round] || null;
    const points = pointsFor(a, q);
    p.score += points;
    if (a) a.points = points;
    return { playerId: p.id, choice: a?.choice ?? null, ms: a?.ms ?? null, correct: a?.choice === q.correctAnswer, points };
  });
  duel.status = "reveal";
  duel.lastReveal = { round: duel.round, correctAnswer: q.correctAnswer, explanation: q.explanation || "", answers };
  broadcastState(duel);
  const last = duel.round >= ROUNDS - 1;
  duel.timer = setTimeout(() => (last ? finish(duel) : startRound(duel, duel.round + 1)), REVEAL_MS);
}

// ---------------- Yakun ----------------

function stopTimers(duel) {
  clearTimeout(duel.timer);
  clearTimeout(duel.botTimer);
  for (const p of duel.players) {
    clearTimeout(p.dcTimer);
    p.dcTimer = null;
  }
}

function endByForfeit(duel, loser) {
  if (!["countdown", "round", "reveal"].includes(duel.status)) return;
  // Hali birorta raund o'ynalmagan bo'lsa — jang bekor (bazaga yozilmaydi).
  if (duel.status === "countdown") {
    stopTimers(duel);
    duel.status = "cancelled";
    broadcastState(duel);
    return;
  }
  finish(duel, { forfeitBy: loser.id });
}

async function finish(duel, { forfeitBy = null } = {}) {
  if (duel.status === "finished" || duel.saving) return;
  duel.saving = true;
  stopTimers(duel);
  const [a, b] = duel.players;
  let winner;
  if (forfeitBy) winner = forfeitBy === a.id ? "b" : "a";
  else winner = a.score === b.score ? "draw" : a.score > b.score ? "a" : "b";

  let saved = null;
  try {
    saved = await saveMatch(duel, winner, Boolean(forfeitBy));
  } catch (err) {
    console.error("[duel] saqlashda xato", err);
  }
  duel.saving = false;
  duel.status = "finished";
  duel.touchedAt = Date.now();
  duel.deadline = null;
  duel.result = {
    winner: winner === "draw" ? null : (winner === "a" ? a : b).id,
    forfeitBy,
    rated: saved?.rated ?? false,
    players: duel.players.map((p, i) => ({
      id: p.id,
      score: p.score,
      correct: p.answers.filter((x, r) => x && x.choice === duel.questions[r].correctAnswer).length,
      rating: saved?.ratings?.[i] ?? null,
      xp: saved?.xp?.[i] ?? 0,
    })),
    // Tugagandan keyin — savollar kalit bilan (ko'rib chiqish uchun).
    questions: duel.questions.map(({ sourceId: _s, ...q }) => q),
    answers: duel.players.map((p) => p.answers.map((x) => x?.choice ?? null)),
  };
  broadcastState(duel);
}

function expected(ra, rb) {
  return 1 / (1 + 10 ** ((rb - ra) / 400));
}

async function saveMatch(duel, winner, forfeit) {
  const [a, b] = duel.players;
  const humans = duel.players.filter((p) => !p.bot);
  return tx(async (client) => {
    let rated = humans.length === 2 && a.id !== b.id;
    if (rated) {
      const { rows } = await client.query(
        `SELECT count(*)::int AS n FROM duel_matches
         WHERE rated AND created_at > now() - interval '24 hours'
           AND ((player_a = $1 AND player_b = $2) OR (player_a = $2 AND player_b = $1))`,
        [a.id, b.id]
      );
      rated = rows[0].n < RATED_PER_PAIR_PER_DAY;
    }

    // Reytinglar (botga qarshi jang reytingsiz).
    const ratings = [null, null];
    let delta = 0;
    if (rated) {
      const cur = [];
      for (const p of [a, b]) {
        await client.query("INSERT INTO duel_ratings (user_id) VALUES ($1) ON CONFLICT DO NOTHING", [p.id]);
        const { rows } = await client.query("SELECT rating FROM duel_ratings WHERE user_id = $1 FOR UPDATE", [p.id]);
        cur.push(rows[0].rating);
      }
      const sa = winner === "a" ? 1 : winner === "draw" ? 0.5 : 0;
      delta = Math.round(ELO_K * (sa - expected(cur[0], cur[1])));
      const deltas = [delta, -delta];
      const col = (i) => (winner === "draw" ? "draws" : (winner === "a") === (i === 0) ? "wins" : "losses");
      for (let i = 0; i < 2; i++) {
        const { rows } = await client.query(
          `UPDATE duel_ratings SET rating = rating + $2, ${col(i)} = ${col(i)} + 1,
             best = GREATEST(best, rating + $2), updated_at = now()
           WHERE user_id = $1 RETURNING rating`,
          [duel.players[i].id, deltas[i]]
        );
        ratings[i] = { before: cur[i], after: rows[0].rating, delta: deltas[i] };
      }
    }

    await client.query(
      `INSERT INTO duel_matches (code, section, player_a, player_b, score_a, score_b, winner, rating_delta, rated, forfeit, questions, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        duel.code,
        duel.section,
        a.bot ? null : a.id,
        b.bot ? null : b.id,
        a.score,
        b.score,
        winner,
        delta,
        rated,
        forfeit,
        JSON.stringify(duel.questions.map((q) => q.sourceId || q.id)),
        JSON.stringify(duel.players.map((p) => p.answers.map((x) => x || null))),
      ]
    );

    // XP: o'ynagani uchun + g'alaba. Botga qarshi — faqat o'ynagani uchun.
    // Texnik mag'lubiyat (chiqib ketgan) — XP yo'q.
    const xp = [0, 0];
    for (let i = 0; i < 2; i++) {
      const p = duel.players[i];
      if (p.bot) continue;
      const side = i === 0 ? "a" : "b";
      const left = forfeit && winner !== side;
      if (left) continue;
      xp[i] = XP.duelPlay + (winner === side && rated ? XP.duelWin : 0);
      await addXp(client, p.id, xp[i]);

      // Noto'g'ri / javobsiz savollar — xatolar daftariga.
      for (let r = 0; r < duel.questions.length; r++) {
        if (r > duel.round) break;
        const q = duel.questions[r];
        if (p.answers[r]?.choice === q.correctAnswer) continue;
        await client.query(
          `INSERT INTO mistakes (user_id, question_key, source, section, domain, question)
           VALUES ($1, $2, 'duel', $3, $4, $5) ON CONFLICT DO NOTHING`,
          [p.id, `bank:${q.sourceId || q.prompt.slice(0, 60)}`, q.section, q.domain || "", q]
        );
      }
    }
    return { rated, ratings, xp };
  });
}

// ---------------- Revansh ----------------

export async function voteRematch(duel, userId) {
  if (duel.status !== "finished") return null;
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p) return null;
  if (duel.rematchCode) return duel.rematchCode;
  duel.rematchVotes.add(p.id);
  const bot = duel.players.find((x) => x.bot);
  if (bot) duel.rematchVotes.add(bot.id);
  if (duel.rematchVotes.size < 2) {
    broadcastState(duel);
    return null;
  }
  const [a, b] = duel.players;
  const strip = ({ id, name, avatarUrl, bot }) => ({ id, name, avatarUrl, bot });
  // Revanshda tomonlar almashadi — avval kim chaqirilgan bo'lsa, endi u "host".
  const next = await createDuel({ host: strip(b.bot ? a : b), opponent: strip(b.bot ? b : a), section: duel.section, rematchOf: duel.code });
  duel.rematchCode = next.code;
  emit(duel, "duel:rematch", { code: next.code });
  return next.code;
}

// ---------------- Tasodifiy raqib ----------------

export async function enqueue(section, player, socketId) {
  dequeue(player.id);
  const q = queues.get(section);
  const idx = q.findIndex((x) => x.player.id !== player.id);
  if (idx === -1) {
    q.push({ player, socketId, at: Date.now() });
    return null;
  }
  const [other] = q.splice(idx, 1);
  const duel = await createDuel({ host: other.player, opponent: player, section });
  io?.to(other.socketId).emit("duel:matched", { code: duel.code });
  io?.to(socketId).emit("duel:matched", { code: duel.code });
  return duel.code;
}

export function dequeue(userId) {
  for (const q of queues.values()) {
    const i = q.findIndex((x) => x.player.id === String(userId));
    if (i !== -1) q.splice(i, 1);
  }
}

export function queueSize(section) {
  return queues.get(section)?.length ?? 0;
}

// Navbatda raqib topilmasa — PrepBot bilan (reytingsiz) o'ynash.
export async function playBot(section, player) {
  dequeue(player.id);
  const duel = await createDuel({ host: player, opponent: botPlayer(), section });
  return duel.code;
}

// ---------------- Statistika (REST) ----------------

export async function duelStats(userId) {
  const r = await one("SELECT * FROM duel_ratings WHERE user_id = $1", [userId]);
  const rank = r ? (await one("SELECT count(*)::int + 1 AS r FROM duel_ratings WHERE rating > $1", [r.rating])).r : null;
  const { rows } = await pool.query(
    `SELECT m.*, ua.display_name AS a_name, ua.email AS a_email, ub.display_name AS b_name, ub.email AS b_email
     FROM duel_matches m
     LEFT JOIN users ua ON ua.id = m.player_a
     LEFT JOIN users ub ON ub.id = m.player_b
     WHERE m.player_a = $1 OR m.player_b = $1
     ORDER BY m.created_at DESC LIMIT 10`,
    [userId]
  );
  const nameOf = (n, e) => (e ? n || e.split("@")[0] : BOT_NAME);
  return {
    rating: r?.rating ?? 1000,
    best: r?.best ?? 1000,
    wins: r?.wins ?? 0,
    losses: r?.losses ?? 0,
    draws: r?.draws ?? 0,
    rank,
    recent: rows.map((m) => {
      const mine = m.player_a === userId ? "a" : "b";
      const opp = mine === "a" ? nameOf(m.b_name, m.b_email) : nameOf(m.a_name, m.a_email);
      return {
        id: m.id,
        section: m.section,
        opponent: opp,
        myScore: mine === "a" ? m.score_a : m.score_b,
        oppScore: mine === "a" ? m.score_b : m.score_a,
        outcome: m.winner === "draw" ? "draw" : m.winner === mine ? "win" : "loss",
        delta: m.rated ? (mine === "a" ? m.rating_delta : -m.rating_delta) : null,
        at: m.created_at,
      };
    }),
  };
}

export async function duelLeaderboard() {
  const { rows } = await pool.query(
    `SELECT d.*, u.display_name, u.email, u.avatar_updated_at
     FROM duel_ratings d JOIN users u ON u.id = d.user_id
     WHERE u.blocked_at IS NULL AND (d.wins + d.losses + d.draws) > 0
     ORDER BY d.rating DESC, d.wins DESC LIMIT 50`
  );
  return rows.map((r) => ({
    uid: r.user_id,
    name: r.display_name || r.email.split("@")[0],
    rating: r.rating,
    wins: r.wins,
    losses: r.losses,
    avatarUrl: avatarUrl(r.user_id, r.avatar_updated_at),
  }));
}

// ---------------- Tozalash ----------------

setInterval(() => {
  const now = Date.now();
  for (const [code, d] of duels) {
    const ttl = d.status === "waiting" ? WAITING_TTL_MS : d.status === "finished" || d.status === "cancelled" ? FINISHED_TTL_MS : null;
    if (ttl && d.touchedAt < now - ttl) {
      stopTimers(d);
      duels.delete(code);
    }
  }
  for (const q of queues.values()) {
    for (let i = q.length - 1; i >= 0; i--) if (q[i].at < now - 10 * 60_000) q.splice(i, 1);
  }
}, 60_000).unref();
