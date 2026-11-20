import { randomInt } from "node:crypto";
import { one, pool, tx } from "../db/index.js";
import { loadBank } from "./questionBank.js";
import { stripQuestion } from "./satScoring.js";
import { addXp, XP } from "./streaks.js";
import { avatarUrl } from "./serialize.js";
import { CATEGORIES, getMode, sectionFor } from "./duelModes.js";
import { CHAT_PRESETS, cleanChat } from "./chatFilter.js";

// ------------------------------------------------------------------
// SAT Duel — 1v1 jonli bellashuv. Janglar faqat xotirada (server qayta
// ishga tushsa davom etayotgan janglar yo'qoladi); tugagan jang bazaga
// yoziladi (duel_matches, duel_ratings, XP, xatolar daftari).
//
// Ikki xil o'yin (rejimlar: duelModes.js):
//   classic — sinxron raundlar: ikkalasi bir savolda, 90 s, keyin natija.
//             Holatlar: waiting → countdown → round ⇄ reveal → finished.
//   soatli  — chess.com kabi: har o'yinchining o'z soati, har kim o'z
//             tezligida yechadi, javobdan keyin +inc. Soat 0 = flag.
//             Holatlar: waiting → countdown → playing → finished.
//
// Ishonchli mantiq shu yerda: savol kaliti javob berilmaguncha (classic'da
// raund yopilmaguncha) klientga bormaydi, vaqt server soatida o'lchanadi.
// Holat har o'yinchiga alohida yuboriladi (o'z savoli, o'z javoblari).
// Socket hodisalari: realtime.js (registerDuel).
// ------------------------------------------------------------------

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const DUEL_CODE_RE = /^[A-HJKMNP-Z2-9]{6}$/;
export const SECTIONS = new Set(["math", "rw", "mix"]);

const COUNTDOWN_MS = 3_500;
const REVEAL_MS = 4_500;
// Tarmoq kechikishi uchun: deadline'dan keyin shuncha ichida kelgan javob qabul qilinadi.
const GRACE_MS = 800;
// Uzilgan o'yinchi shuncha ichida qaytmasa — raqib texnik g'alaba oladi.
const RECONNECT_MS = 20_000;
const WAITING_TTL_MS = 30 * 60_000;
const FINISHED_TTL_MS = 15 * 60_000;
// Bir juftlik kuniga bitta reyting turida shuncha reytingli jang, keyingilari reytingsiz.
const RATED_PER_PAIR_PER_DAY = 10;
const ELO_K = 32;
const CHAT_KEEP = 50;
const CHAT_GAP_MS = 1_500;

export const BOT_ID = "bot";
const BOT_NAME = "PrepBot";
const BOT_ACCURACY = { easy: 0.8, medium: 0.6, hard: 0.4 };

// code -> duel
const duels = new Map();
// "mode:section" -> [{ player, socketId, at }]
const queues = new Map();

let io = null;
export function initDuels(server) {
  io = server;
}

const LIVE = new Set(["countdown", "round", "reveal", "playing"]);

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
  return {
    ...p,
    rating: p.rating ?? null,
    score: 0,
    answers: [],
    sockets: new Set(),
    dcTimer: null,
    // Soatli rejim:
    idx: 0,
    clockMs: 0,
    turnStart: 0,
    done: false,
    flagged: false,
    flagTimer: null,
    botTimer: null,
  };
}

export async function ratingOf(userId, category) {
  if (userId === BOT_ID) return null;
  const r = await one("SELECT rating FROM duel_ratings WHERE user_id = $1 AND category = $2", [userId, category]);
  return r?.rating ?? 1000;
}

// ---------------- Savollar ----------------

const qLength = (q) =>
  (q.passage || "").length + (q.prompt || "").length + (q.choices || []).reduce((n, c) => n + (c.text || "").length, 0);

const pickRandom = (list, used) => {
  const pool = list.filter((q) => !used.has(q.sourceId || q.prompt));
  if (!pool.length) return null;
  const q = pool[randomInt(pool.length)];
  used.add(q.sourceId || q.prompt);
  return q;
};

// Qiyinlik rejasi: levels savollar soniga cho'ziladi (oson → qiyin).
function difficultyPlan(mode) {
  if (mode.classic) return ["easy", "easy", "medium", "medium", "medium", "hard", "hard"];
  const { total, levels } = mode;
  return Array.from({ length: total }, (_, i) => levels[Math.min(levels.length - 1, Math.floor((i / total) * levels.length))]);
}

async function pickQuestions(mode, section) {
  const bank = await loadBank();
  const used = new Set();
  return difficultyPlan(mode).map((difficulty, i) => {
    let sec = section === "mix" ? (i % 2 === 0 ? "rw" : "math") : section;
    const fits = (q) => qLength(q) <= mode.maxLen;
    // Tez rejimlarda qisqa RW savol topilmasa — Math.
    let q =
      pickRandom(bank[sec].filter((x) => x.difficulty === difficulty && fits(x)), used) ||
      pickRandom(bank[sec].filter(fits), used);
    if (!q && sec === "rw") {
      sec = "math";
      q = pickRandom(bank.math.filter((x) => x.difficulty === difficulty && fits(x)), used) || pickRandom(bank.math.filter(fits), used);
    }
    if (!q) q = pickRandom(bank[sec], used);
    return { ...q, id: `duel-${i}` };
  });
}

const publicQuestion = (q) => ({ ...stripQuestion(q), section: q.section });

// ---------------- Holat (klientga) ----------------

const remaining = (p, now = Date.now()) => (p.done || !p.turnStart ? p.clockMs : Math.max(0, p.clockMs - (now - p.turnStart)));
const correctCount = (duel, p) => p.answers.filter((a, i) => a && a.choice === duel.questions[i].correctAnswer).length;

function playerDoc(p, duel, now) {
  const doc = {
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    bot: p.bot,
    rating: p.rating,
    score: p.score,
    connected: p.bot || p.sockets.size > 0,
  };
  if (duel.mode.classic) {
    doc.answered = duel.status === "round" && Boolean(p.answers[duel.round]);
  } else {
    doc.idx = p.idx;
    doc.correct = correctCount(duel, p);
    // Har savol bo'yicha: true / false (o'tkazilgan ham false); kalitsiz.
    doc.marks = p.answers.map((a, i) => (a ? a.choice === duel.questions[i].correctAnswer : null));
    doc.clockMs = remaining(p, now);
    doc.running = duel.status === "playing" && !p.done;
    doc.done = p.done;
    doc.flagged = p.flagged;
  }
  return doc;
}

// Har o'yinchiga alohida: o'z savoli (soatli) yoki o'z tanlovi (classic).
export function duelState(duel, userId = null) {
  const now = Date.now();
  const me = userId ? duel.players.find((p) => p.id === String(userId)) : null;
  const mode = duel.mode;
  const base = {
    code: duel.code,
    mode: mode.id,
    section: duel.section,
    status: duel.status,
    hostId: duel.hostId,
    players: duel.players.map((p) => playerDoc(p, duel, now)),
    total: mode.total,
    startsAt: duel.startsAt,
    serverNow: now,
    result: duel.result,
    rematch: [...duel.rematchVotes],
    bot: duel.players.some((p) => p.bot),
    chatMode: duel.origin === "invite" ? "text" : "preset",
  };
  if (mode.classic) {
    return {
      ...base,
      round: duel.round,
      roundMs: mode.roundMs,
      deadline: duel.deadline,
      question: duel.status === "round" || duel.status === "reveal" ? publicQuestion(duel.questions[duel.round]) : null,
      reveal: duel.status === "reveal" ? duel.lastReveal : null,
      myChoice: me && duel.round >= 0 ? (me.answers[duel.round]?.choice ?? null) : null,
    };
  }
  return {
    ...base,
    clockMs: mode.clockMs,
    incMs: mode.incMs,
    question: me && duel.status === "playing" && !me.done ? publicQuestion(duel.questions[me.idx]) : null,
    // O'z javoblarim: kalit faqat javob berilgan savollar uchun.
    myAnswers: me
      ? me.answers.map((a, i) => ({ choice: a?.choice ?? null, correct: a?.choice === duel.questions[i].correctAnswer, correctAnswer: duel.questions[i].correctAnswer }))
      : [],
  };
}

// Holatni har o'yinchining socketlariga alohida yuboradi.
function broadcastState(duel) {
  if (!io) return;
  for (const p of duel.players) {
    if (p.bot || !p.sockets.size) continue;
    const doc = duelState(duel, p.id);
    for (const sid of p.sockets) io.to(sid).emit("duel:state", doc);
  }
}

const emitRoom = (duel, event, payload) => io?.to(`duel:${duel.code}`).emit(event, payload);

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

// origin: "invite" (do'st linki va uning revanshlari) | "queue" | "bot".
export async function createDuel({ host, section, modeId = "classic", opponent = null, rematchOf = null, origin = "invite" }) {
  const mode = getMode(modeId) || getMode("classic");
  section = sectionFor(mode, section);
  if (!opponent) cancelWaitingOf(host.id);
  const players = [host, ...(opponent ? [opponent] : [])];
  for (const p of players) if (p.rating == null && !p.bot) p.rating = await ratingOf(p.id, mode.category);
  const code = newCode();
  const now = Date.now();
  const duel = {
    code,
    mode,
    section,
    origin,
    hostId: host.id,
    createdAt: now,
    touchedAt: now,
    status: "waiting",
    players: players.map(seat),
    questions: await pickQuestions(mode, section),
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
    chat: [],
    chatAt: new Map(),
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
  const live = LIVE.has(duel.status);

  if (duel.status === "waiting" && p.sockets.size === 0 && p.id !== duel.hostId && !duel.fixed) {
    // Taklifni qabul qilib, boshlanmasdan chiqib ketgan — o'rin bo'shaydi.
    duel.players = duel.players.filter((x) => x !== p);
  } else if (live && forfeit) {
    endByForfeit(duel, p);
    return;
  } else if (live && p.sockets.size === 0 && !p.dcTimer) {
    p.dcTimer = setTimeout(() => {
      p.dcTimer = null;
      if (p.sockets.size === 0 && LIVE.has(duel.status)) endByForfeit(duel, p);
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
  duel.timer = setTimeout(() => (duel.mode.classic ? startRound(duel, 0) : startClock(duel)), COUNTDOWN_MS);
  if (duel.players.some((p) => p.bot) && Math.random() < 0.6) {
    setTimeout(() => botChat(duel, "gl"), 1200 + randomInt(1500)).unref?.();
  }
}

// ---------------- Classic: sinxron raundlar ----------------

function startRound(duel, index) {
  if (!["countdown", "reveal"].includes(duel.status)) return;
  const roundMs = duel.mode.roundMs;
  duel.status = "round";
  duel.round = index;
  duel.roundStartedAt = Date.now();
  duel.deadline = duel.roundStartedAt + roundMs;
  duel.lastReveal = null;
  clearTimeout(duel.timer);
  duel.timer = setTimeout(() => reveal(duel), roundMs + GRACE_MS);
  scheduleClassicBot(duel);
  broadcastState(duel);
}

function botChoice(q) {
  const right = Math.random() < (BOT_ACCURACY[q.difficulty] ?? 0.6);
  const wrong = q.choices.map((c) => c.label).filter((l) => l !== q.correctAnswer);
  return right ? q.correctAnswer : wrong[randomInt(wrong.length)];
}

function scheduleClassicBot(duel) {
  const bot = duel.players.find((p) => p.bot);
  if (!bot) return;
  const choice = botChoice(duel.questions[duel.round]);
  const delay = 12_000 + randomInt(45_000);
  clearTimeout(duel.botTimer);
  duel.botTimer = setTimeout(() => submitAnswer(duel, BOT_ID, { round: duel.round, choice }), delay);
  duel.botTimer.unref?.();
}

export function submitAnswer(duel, userId, { round, choice }) {
  if (!duel.mode.classic) return submitClock(duel, userId, { index: round, choice });
  if (duel.status !== "round" || round !== duel.round) return { ok: false, reason: "closed" };
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p) return { ok: false, reason: "not-player" };
  if (p.answers[round]) return { ok: false, reason: "already" };
  const now = Date.now();
  if (now > duel.deadline + GRACE_MS) return { ok: false, reason: "late" };
  const q = duel.questions[round];
  if (!q.choices.some((c) => c.label === choice)) return { ok: false, reason: "invalid" };
  p.answers[round] = { choice, ms: Math.min(duel.mode.roundMs, now - duel.roundStartedAt) };
  emitRoom(duel, "duel:answered", { playerId: p.id });
  if (duel.players.every((x) => x.answers[round])) reveal(duel);
  return { ok: true };
}

// To'g'ri javob: 100 + tezlik bonusi (0–50, qolgan vaqtga mutanosib).
function pointsFor(answer, q, roundMs) {
  if (!answer || answer.choice !== q.correctAnswer) return 0;
  return 100 + Math.round((50 * Math.max(0, roundMs - answer.ms)) / roundMs);
}

function reveal(duel) {
  if (duel.status !== "round") return;
  clearTimeout(duel.timer);
  clearTimeout(duel.botTimer);
  const q = duel.questions[duel.round];
  const answers = duel.players.map((p) => {
    const a = p.answers[duel.round] || null;
    const points = pointsFor(a, q, duel.mode.roundMs);
    p.score += points;
    if (a) a.points = points;
    return { playerId: p.id, choice: a?.choice ?? null, ms: a?.ms ?? null, correct: a?.choice === q.correctAnswer, points };
  });
  duel.status = "reveal";
  duel.lastReveal = { round: duel.round, correctAnswer: q.correctAnswer, explanation: q.explanation || "", answers };
  broadcastState(duel);
  const last = duel.round >= duel.mode.total - 1;
  duel.timer = setTimeout(() => (last ? finish(duel) : startRound(duel, duel.round + 1)), REVEAL_MS);
}

// ---------------- Soatli rejimlar ----------------

function startClock(duel) {
  if (duel.status !== "countdown") return;
  duel.status = "playing";
  const now = Date.now();
  for (const p of duel.players) {
    p.idx = 0;
    p.clockMs = duel.mode.clockMs;
    p.turnStart = now;
    armFlag(duel, p);
    scheduleClockBot(duel, p);
  }
  broadcastState(duel);
}

function armFlag(duel, p) {
  clearTimeout(p.flagTimer);
  p.flagTimer = setTimeout(() => flag(duel, p), remaining(p) + GRACE_MS);
  p.flagTimer.unref?.();
}

function flag(duel, p) {
  if (duel.status !== "playing" || p.done) return;
  if (remaining(p) > 0) return armFlag(duel, p);
  p.clockMs = 0;
  p.done = true;
  p.flagged = true;
  clearTimeout(p.botTimer);
  afterMove(duel);
}

// Bot: o'rtacha vaqt = soat / savollar soni, ±.
function scheduleClockBot(duel, p) {
  if (!p.bot || p.done) return;
  const avg = (duel.mode.clockMs + duel.mode.incMs * duel.mode.total) / duel.mode.total;
  const delay = Math.round(avg * (0.45 + Math.random() * 0.75));
  const index = p.idx;
  clearTimeout(p.botTimer);
  p.botTimer = setTimeout(() => submitClock(duel, BOT_ID, { index, choice: botChoice(duel.questions[index]) }), delay);
  p.botTimer.unref?.();
}

// choice === null — savol o'tkazib yuborildi (xato hisoblanadi).
export function submitClock(duel, userId, { index, choice }) {
  if (duel.status !== "playing") return { ok: false, reason: "closed" };
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p) return { ok: false, reason: "not-player" };
  if (p.done) return { ok: false, reason: "done" };
  if (index !== p.idx) return { ok: false, reason: "already" };
  const q = duel.questions[index];
  if (choice !== null && !q.choices.some((c) => c.label === choice)) return { ok: false, reason: "invalid" };
  const now = Date.now();
  const elapsed = now - p.turnStart;
  // Soat tugagan (flag hali ishlamagan bo'lsa ham) — kech.
  if (elapsed > p.clockMs + GRACE_MS) {
    flag(duel, p);
    return { ok: false, reason: "late" };
  }
  p.clockMs = Math.max(0, p.clockMs - elapsed);
  const correct = choice === q.correctAnswer;
  p.answers[index] = { choice, ms: elapsed, skipped: choice === null };
  p.idx += 1;
  if (p.idx >= duel.mode.total) {
    p.done = true;
    clearTimeout(p.flagTimer);
  } else {
    p.clockMs += duel.mode.incMs;
    p.turnStart = now;
    armFlag(duel, p);
    scheduleClockBot(duel, p);
  }
  emitRoom(duel, "duel:move", { playerId: p.id, index, correct });
  afterMove(duel);
  return { ok: true, correct, correctAnswer: q.correctAnswer };
}

function afterMove(duel) {
  for (const p of duel.players) p.score = correctCount(duel, p) * 100 + (p.done && !p.flagged ? Math.floor(p.clockMs / 1000) : 0);
  if (duel.players.every((p) => p.done)) finish(duel);
  else broadcastState(duel);
}

// ---------------- Chat ----------------

function pushChat(duel, msg) {
  duel.chat.push(msg);
  if (duel.chat.length > CHAT_KEEP) duel.chat.shift();
  emitRoom(duel, "duel:chat", msg);
}

// { text } yoki { preset }. Erkin matn faqat do'st chaqiruvi janglarida.
export function sendChat(duel, userId, raw) {
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p || duel.status === "cancelled") return { ok: false, reason: "not-player" };
  const now = Date.now();
  if (now - (duel.chatAt.get(p.id) || 0) < CHAT_GAP_MS) return { ok: false, reason: "slow" };
  const msg = { id: `${now}-${randomInt(1e6)}`, from: p.id, at: now };
  if (typeof raw?.preset === "string") {
    if (!CHAT_PRESETS.has(raw.preset)) return { ok: false, reason: "invalid" };
    msg.preset = raw.preset;
  } else {
    if (duel.origin !== "invite") return { ok: false, reason: "preset-only" };
    const clean = cleanChat(raw?.text);
    if (!clean.ok) return { ok: false, reason: clean.reason };
    msg.text = clean.text;
  }
  duel.chatAt.set(p.id, now);
  pushChat(duel, msg);
  return { ok: true };
}

function botChat(duel, preset) {
  if (duel.status === "cancelled" || !duels.has(duel.code)) return;
  pushChat(duel, { id: `${Date.now()}-bot`, from: BOT_ID, at: Date.now(), preset });
}

export const chatHistory = (duel) => duel.chat;

// ---------------- Yakun ----------------

function stopTimers(duel) {
  clearTimeout(duel.timer);
  clearTimeout(duel.botTimer);
  for (const p of duel.players) {
    clearTimeout(p.dcTimer);
    clearTimeout(p.flagTimer);
    clearTimeout(p.botTimer);
    p.dcTimer = null;
  }
}

// Taslim bo'lish: jang tugaydi, lekin o'yinchi sahifada qolib natijani ko'radi.
export function resign(duel, userId) {
  const p = duel.players.find((x) => x.id === String(userId));
  if (!p || !LIVE.has(duel.status)) return { ok: false };
  endByForfeit(duel, p);
  return { ok: true };
}

function endByForfeit(duel, loser) {
  if (!LIVE.has(duel.status)) return;
  // Hali o'yin boshlanmagan bo'lsa — jang bekor (bazaga yozilmaydi).
  if (duel.status === "countdown") {
    stopTimers(duel);
    duel.status = "cancelled";
    broadcastState(duel);
    return;
  }
  finish(duel, { forfeitBy: loser.id });
}

function decideWinner(duel) {
  const [a, b] = duel.players;
  if (duel.mode.classic) return a.score === b.score ? "draw" : a.score > b.score ? "a" : "b";
  // Soatli: ko'proq to'g'ri; teng bo'lsa — soatida ko'proq vaqt qolgan.
  const ca = correctCount(duel, a);
  const cb = correctCount(duel, b);
  if (ca !== cb) return ca > cb ? "a" : "b";
  const ra = a.flagged ? 0 : Math.floor(a.clockMs / 1000);
  const rb = b.flagged ? 0 : Math.floor(b.clockMs / 1000);
  return ra === rb ? "draw" : ra > rb ? "a" : "b";
}

async function finish(duel, { forfeitBy = null } = {}) {
  if (duel.status === "finished" || duel.saving) return;
  duel.saving = true;
  stopTimers(duel);
  // Soatli rejimda tugatilmagan soatlarni to'xtatamiz.
  if (!duel.mode.classic) for (const p of duel.players) if (!p.done) { p.clockMs = remaining(p); p.done = true; }
  const [a, b] = duel.players;
  const winner = forfeitBy ? (forfeitBy === a.id ? "b" : "a") : decideWinner(duel);

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
  duel.players.forEach((p, i) => {
    if (saved?.ratings?.[i]) p.rating = saved.ratings[i].after;
  });
  duel.result = {
    winner: winner === "draw" ? null : (winner === "a" ? a : b).id,
    forfeitBy,
    rated: saved?.rated ?? false,
    category: duel.mode.category,
    players: duel.players.map((p, i) => ({
      id: p.id,
      score: p.score,
      correct: correctCount(duel, p),
      clockMs: duel.mode.classic ? null : p.clockMs,
      flagged: p.flagged,
      rating: saved?.ratings?.[i] ?? null,
      xp: saved?.xp?.[i] ?? 0,
    })),
    // Tugagandan keyin — savollar kalit bilan (ko'rib chiqish uchun).
    questions: duel.questions.map(({ sourceId: _s, ...q }) => q),
    answers: duel.players.map((p) => duel.questions.map((_, r) => p.answers[r]?.choice ?? null)),
    times: duel.players.map((p) => duel.questions.map((_, r) => p.answers[r]?.ms ?? null)),
  };
  broadcastState(duel);
  if (duel.players.some((p) => p.bot)) setTimeout(() => botChat(duel, "gg"), 1500).unref?.();
}

function expected(ra, rb) {
  return 1 / (1 + 10 ** ((rb - ra) / 400));
}

async function saveMatch(duel, winner, forfeit) {
  const [a, b] = duel.players;
  const humans = duel.players.filter((p) => !p.bot);
  const category = duel.mode.category;
  return tx(async (client) => {
    let rated = humans.length === 2 && a.id !== b.id;
    if (rated) {
      const { rows } = await client.query(
        `SELECT count(*)::int AS n FROM duel_matches
         WHERE rated AND mode = ANY($3) AND created_at > now() - interval '24 hours'
           AND ((player_a = $1 AND player_b = $2) OR (player_a = $2 AND player_b = $1))`,
        [a.id, b.id, modesOf(category)]
      );
      rated = rows[0].n < RATED_PER_PAIR_PER_DAY;
    }

    // Reytinglar (botga qarshi jang reytingsiz).
    const ratings = [null, null];
    let delta = 0;
    if (rated) {
      const cur = [];
      for (const p of [a, b]) {
        await client.query("INSERT INTO duel_ratings (user_id, category) VALUES ($1, $2) ON CONFLICT DO NOTHING", [p.id, category]);
        const { rows } = await client.query("SELECT rating FROM duel_ratings WHERE user_id = $1 AND category = $2 FOR UPDATE", [p.id, category]);
        cur.push(rows[0].rating);
      }
      const sa = winner === "a" ? 1 : winner === "draw" ? 0.5 : 0;
      delta = Math.round(ELO_K * (sa - expected(cur[0], cur[1])));
      const deltas = [delta, -delta];
      const col = (i) => (winner === "draw" ? "draws" : (winner === "a") === (i === 0) ? "wins" : "losses");
      for (let i = 0; i < 2; i++) {
        const { rows } = await client.query(
          `UPDATE duel_ratings SET rating = rating + $3, ${col(i)} = ${col(i)} + 1,
             best = GREATEST(best, rating + $3), updated_at = now()
           WHERE user_id = $1 AND category = $2 RETURNING rating`,
          [duel.players[i].id, category, deltas[i]]
        );
        ratings[i] = { before: cur[i], after: rows[0].rating, delta: deltas[i] };
      }
    }

    await client.query(
      `INSERT INTO duel_matches (code, section, mode, player_a, player_b, score_a, score_b, winner, rating_delta, rated, forfeit, questions, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        duel.code,
        duel.section,
        duel.mode.id,
        a.bot ? null : a.id,
        b.bot ? null : b.id,
        // Soatli rejimda tarixda to'g'ri javoblar soni ko'rsatiladi.
        duel.mode.classic ? a.score : correctCount(duel, a),
        duel.mode.classic ? b.score : correctCount(duel, b),
        winner,
        delta,
        rated,
        forfeit,
        JSON.stringify(duel.questions.map((q) => q.sourceId || q.id)),
        JSON.stringify(duel.players.map((p) => p.answers.map((x) => x || null))),
      ]
    );

    // XP: o'ynagani uchun + g'alaba (reytingli jangda). Texnik mag'lubiyat — XP yo'q.
    const xp = [0, 0];
    for (let i = 0; i < 2; i++) {
      const p = duel.players[i];
      if (p.bot) continue;
      const side = i === 0 ? "a" : "b";
      if (forfeit && winner !== side) continue;
      xp[i] = XP.duelPlay + (winner === side && rated ? XP.duelWin : 0);
      await addXp(client, p.id, xp[i]);

      // Noto'g'ri / o'tkazilgan savollar — xatolar daftariga (faqat ko'rilganlari).
      const seen = duel.mode.classic ? duel.round + 1 : p.answers.length;
      for (let r = 0; r < Math.min(seen, duel.questions.length); r++) {
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

const modesOf = (category) =>
  ({ bullet: ["bullet1", "bullet2"], blitz: ["blitz3", "blitz5"], rapid: ["rapid10"], classic: ["classic"] })[category] || [];

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
  const strip = ({ id, name, avatarUrl, bot, rating }) => ({ id, name, avatarUrl, bot, rating });
  // Revanshda tomonlar almashadi — avval kim chaqirilgan bo'lsa, endi u "host".
  const next = await createDuel({
    host: strip(b.bot ? a : b),
    opponent: strip(b.bot ? b : a),
    section: duel.section,
    modeId: duel.mode.id,
    rematchOf: duel.code,
    origin: duel.origin,
  });
  duel.rematchCode = next.code;
  emitRoom(duel, "duel:rematch", { code: next.code });
  return next.code;
}

// ---------------- Tasodifiy raqib ----------------

export async function enqueue(modeId, section, player, socketId) {
  const mode = getMode(modeId);
  if (!mode) return null;
  section = sectionFor(mode, section);
  dequeue(player.id);
  const key = `${mode.id}:${section}`;
  if (!queues.has(key)) queues.set(key, []);
  const q = queues.get(key);
  const idx = q.findIndex((x) => x.player.id !== player.id);
  if (idx === -1) {
    q.push({ player, socketId, at: Date.now() });
    return null;
  }
  const [other] = q.splice(idx, 1);
  const duel = await createDuel({ host: other.player, opponent: player, section, modeId: mode.id, origin: "queue" });
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

// Navbatda raqib topilmasa — PrepBot bilan (reytingsiz) o'ynash.
export async function playBot(modeId, section, player) {
  dequeue(player.id);
  const duel = await createDuel({ host: player, opponent: botPlayer(), section, modeId, origin: "bot" });
  return duel.code;
}

// ---------------- Statistika (REST) ----------------

export async function duelStats(userId) {
  const { rows: ratingRows } = await pool.query("SELECT * FROM duel_ratings WHERE user_id = $1", [userId]);
  const ratings = {};
  for (const c of CATEGORIES) {
    const r = ratingRows.find((x) => x.category === c);
    ratings[c] = { rating: r?.rating ?? 1000, best: r?.best ?? 1000, wins: r?.wins ?? 0, losses: r?.losses ?? 0, draws: r?.draws ?? 0 };
  }
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
    ratings,
    recent: rows.map((m) => {
      const mine = m.player_a === userId ? "a" : "b";
      const opp = mine === "a" ? nameOf(m.b_name, m.b_email) : nameOf(m.a_name, m.a_email);
      return {
        id: m.id,
        mode: m.mode,
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

export async function duelLeaderboard(category = "classic") {
  const { rows } = await pool.query(
    `SELECT d.*, u.display_name, u.email, u.avatar_updated_at
     FROM duel_ratings d JOIN users u ON u.id = d.user_id
     WHERE d.category = $1 AND u.blocked_at IS NULL AND (d.wins + d.losses + d.draws) > 0
     ORDER BY d.rating DESC, d.wins DESC LIMIT 50`,
    [category]
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
