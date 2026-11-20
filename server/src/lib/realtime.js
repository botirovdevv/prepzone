import { Server } from "socket.io";
import { config } from "../config.js";
import { COOKIE_NAME } from "./session.js";
import { userFromToken } from "../middleware/auth.js";
import { hasPerm } from "./permissions.js";
import {
  CODE_RE,
  MAX_PARTICIPANTS,
  MAX_POINTS_PER_STROKE,
  MAX_ROOM_POINTS,
  MAX_STROKES,
  getRoom,
  isTimeUp,
  startRoomClock,
} from "./studyRooms.js";
import {
  DUEL_CODE_RE,
  SECTIONS,
  chatHistory,
  dequeue,
  duelState,
  enqueue,
  getDuel,
  initDuels,
  joinDuel,
  leaveSocket,
  playBot,
  playerFromUser,
  ratingOf,
  resign,
  sendChat,
  submitAnswer,
  voteRematch,
} from "./duels.js";
import { getMode } from "./duelModes.js";

// ------------------------------------------------------------------
// Jonli yangilanishlar (Firestore onSnapshot o'rnini bosadi).
//
// Xonalar:
//   session:{id}        — test sahifasidagi har bir ishtirokchi: sessiya
//                         holati (masalan admin testni yopsa) — kodsiz.
//   session-admin:{id}  — faqat admin: kod bilan meta, ishtirokchilar
//                         holati va proktoring hodisalari.
//   board:{code}        — Study Room doskasi (chiziqlar ikkala talabaga).
//   call:{code}         — Study Room qo'ng'irog'i: WebRTC signal (offer/answer/
//                         ICE), mikrofon/kamera holati. Video P2P boradi.
// ------------------------------------------------------------------

let io = null;

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

// Socket hodisalari uchun oddiy "token bucket": soniyasiga RATE ta, BURST
// tagacha zaxira. Oshib ketgan hodisalar jim tashlab yuboriladi.
const RATE = 40;
const BURST = 120;
function allowEvent(socket) {
  const now = Date.now();
  const b = (socket.data.bucket ||= { tokens: BURST, at: now });
  b.tokens = Math.min(BURST, b.tokens + ((now - b.at) / 1000) * RATE);
  b.at = now;
  if (b.tokens < 1) return false;
  b.tokens -= 1;
  return true;
}

// WebSocket upgrade'da Socket.IO CORS'i ishlamaydi — Origin'ni o'zimiz
// tekshiramiz (originCheck bilan bir xil ro'yxat). Origin yo'q (native
// klient) so'rovlar cookie'siz bo'ladi va baribir autentifikatsiyadan o'tmaydi.
function originAllowed(origin) {
  if (!origin) return true;
  const list = [config.publicUrl, config.clientOrigin].filter(Boolean).map((u) => new URL(u).origin);
  if (!config.isProd) list.push("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173");
  return list.some((o) => {
    const u = new URL(o);
    return origin === o || origin === `${u.protocol}//www.${u.host}`;
  });
}

export function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: config.clientOrigin ? { origin: config.clientOrigin, credentials: true } : undefined,
    allowRequest: (req, cb) => cb(null, originAllowed(req.headers.origin)),
  });

  io.use(async (socket, next) => {
    try {
      const user = await userFromToken(readCookie(socket.handshake.headers.cookie, COOKIE_NAME));
      if (!user || !user.email_verified) return next(new Error("unauthenticated"));
      socket.data.user = user;
      socket.join(`user:${user.id}`);
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    // Har bir kiruvchi hodisa tezlik limitidan o'tadi.
    socket.use((_packet, next) => (allowEvent(socket) ? next() : undefined));
    socket.on("session:watch", (sessionId) => {
      if (typeof sessionId !== "string") return;
      socket.join(`session:${sessionId}`);
      if (hasPerm(socket.data.user, "sessions")) socket.join(`session-admin:${sessionId}`);
    });
    socket.on("session:unwatch", (sessionId) => {
      if (typeof sessionId !== "string") return;
      socket.leave(`session:${sessionId}`);
      socket.leave(`session-admin:${sessionId}`);
    });
    registerBoard(socket);
    registerCall(socket);
    registerDuel(socket);
  });

  initDuels(io);
  return io;
}

// ------------------------------------------------------------------
// Study Room doskasi. Koordinatalar 0..1 oralig'ida (ekran o'lchamidan
// mustaqil). Chiziq bo'lak-bo'lak keladi: bir xil id bilan kelgan nuqtalar
// mavjud chiziqqa qo'shiladi — sherik chiziqni chizilayotgan paytda ko'radi.
// ------------------------------------------------------------------

const TOOLS = new Set(["pen", "highlighter", "eraser"]);
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_POINTS_PER_MESSAGE = 500;

function validPoints(points) {
  if (!Array.isArray(points) || points.length === 0 || points.length > MAX_POINTS_PER_MESSAGE) return null;
  const out = [];
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2) return null;
    const [x, y] = p;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -0.5 || x > 1.5 || y < -0.5 || y > 1.5) return null;
    out.push([Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000]);
  }
  return out;
}

function registerBoard(socket) {
  // Socket faqat bitta doskaga ulanadi.
  let code = null;
  const room = () => (code ? getRoom(code) : null);

  socket.on("board:join", (raw, ack) => {
    const next = typeof raw === "string" ? raw.toUpperCase() : "";
    const board = CODE_RE.test(next) ? getRoom(next) : null;
    if (!board || !board.allowed.has(String(socket.data.user.id)) || isTimeUp(board)) {
      return typeof ack === "function" && ack({ ok: false });
    }
    if (code) socket.leave(`board:${code}`);
    code = next;
    socket.join(`board:${code}`);
    if (typeof ack === "function") ack({ ok: true, strokes: [...board.strokes.values()] });
  });

  socket.on("board:leave", () => {
    if (code) socket.leave(`board:${code}`);
    code = null;
  });

  socket.on("board:stroke", (msg) => {
    const board = room();
    if (!board || !msg || !ID_RE.test(msg.id)) return;
    const points = validPoints(msg.points);
    if (!points) return;

    if (board.points + points.length > MAX_ROOM_POINTS) return;
    let stroke = board.strokes.get(msg.id);
    if (stroke) {
      if (stroke.points.length + points.length > MAX_POINTS_PER_STROKE) return;
      stroke.points.push(...points);
      board.points += points.length;
      socket.to(`board:${code}`).emit("board:stroke", { id: msg.id, points });
      return;
    }

    const size = Number(msg.size);
    if (board.strokes.size >= MAX_STROKES || !TOOLS.has(msg.tool) || !COLOR_RE.test(msg.color)) return;
    if (!Number.isFinite(size) || size < 0.0005 || size > 0.1) return;
    stroke = { id: msg.id, tool: msg.tool, color: msg.color, size, points };
    board.strokes.set(msg.id, stroke);
    board.points += points.length;
    socket.to(`board:${code}`).emit("board:stroke", stroke);
  });

  socket.on("board:undo", (id) => {
    const board = room();
    if (!board || typeof id !== "string") return;
    const stroke = board.strokes.get(id);
    if (!stroke) return;
    board.strokes.delete(id);
    board.points -= stroke.points.length;
    socket.to(`board:${code}`).emit("board:undo", id);
  });

  socket.on("board:clear", () => {
    const board = room();
    if (!board) return;
    board.strokes.clear();
    board.points = 0;
    socket.to(`board:${code}`).emit("board:clear");
  });
}

// ------------------------------------------------------------------
// Study Room qo'ng'irog'i — WebRTC signal serveri. Media server orqali
// o'tmaydi: brauzerlar to'g'ridan-to'g'ri ulanadi (kerak bo'lsa TURN relay).
// Xonada ko'pi bilan 2 socket; o'sha foydalanuvchi qayta kirsa eski socket
// chiqariladi. Perfect-negotiation rollari socket id'lar bo'yicha (klientda).
// ------------------------------------------------------------------

const SIGNAL_MAX_BYTES = 64 * 1024;
const QUALITY_IDS = new Set(["auto", "medium", "low"]);
const callRoom = (code) => `call:${code}`;

function endCall(code) {
  const room = getRoom(code);
  if (room) room.peers.clear();
  io?.to(callRoom(code)).emit("call:ended");
  io?.in(callRoom(code)).socketsLeave(callRoom(code));
}

function registerCall(socket) {
  let code = null;
  let phone = false;
  const user = socket.data.user;
  const name = user.display_name || user.email?.split("@")[0] || "Talaba";
  const peerInfo = () => ({ id: socket.id, name, phone });

  const leave = () => {
    if (!code) return;
    const room = getRoom(code);
    room?.peers.delete(socket.id);
    socket.to(callRoom(code)).emit("call:peer-left", { id: socket.id });
    socket.leave(callRoom(code));
    code = null;
  };

  socket.on("call:join", (raw, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    // { code, phone } — phone: sherik telefondan (kodek tanlash uchun).
    const next = typeof raw?.code === "string" ? raw.code.toUpperCase() : "";
    phone = Boolean(raw?.phone);
    const room = CODE_RE.test(next) ? getRoom(next) : null;
    if (!room || !room.allowed.has(String(user.id))) return reply({ ok: false, reason: "not-found" });
    if (isTimeUp(room)) return reply({ ok: false, reason: "time-up" });
    if (code) leave();

    // O'sha foydalanuvchining eski socketi (boshqa tab/refresh) — chiqariladi.
    for (const [sid, p] of room.peers) {
      if (p.userId === String(user.id)) {
        room.peers.delete(sid);
        io.to(sid).emit("call:replaced");
        io.in(sid).socketsLeave(callRoom(next));
        socket.to(callRoom(next)).emit("call:peer-left", { id: sid });
      }
    }
    if (room.peers.size >= MAX_PARTICIPANTS) return reply({ ok: false, reason: "full" });

    code = next;
    const endsAt = startRoomClock(room, () => endCall(next));
    const other = [...room.peers.entries()][0];
    room.peers.set(socket.id, { userId: String(user.id), name, phone });
    socket.join(callRoom(code));
    socket.to(callRoom(code)).emit("call:peer-joined", peerInfo());
    reply({
      ok: true,
      self: socket.id,
      peer: other ? { id: other[0], name: other[1].name, phone: other[1].phone } : null,
      endsAt,
      limitMinutes: room.limitMs / 60_000,
    });
  });

  // offer/answer/ICE — faqat xonadagi ikkinchi kishiga.
  socket.on("call:signal", (msg) => {
    if (!code || !msg || typeof msg !== "object") return;
    if (JSON.stringify(msg).length > SIGNAL_MAX_BYTES) return;
    socket.to(callRoom(code)).emit("call:signal", msg);
  });

  socket.on("call:state", (state) => {
    if (!code || !state || typeof state !== "object") return;
    socket.to(callRoom(code)).emit("call:state", {
      mic: Boolean(state.mic),
      cam: Boolean(state.cam),
      screen: Boolean(state.screen),
    });
  });

  // "Menga ko'pi bilan shu sifatda yubor" — sherikning ko'radigan sifati.
  socket.on("call:quality", (q) => {
    if (!code || !QUALITY_IDS.has(q)) return;
    socket.to(callRoom(code)).emit("call:quality", q);
  });

  socket.on("call:leave", leave);
  socket.on("disconnect", leave);
}

// ------------------------------------------------------------------
// SAT Duel (lib/duels.js). Socket bir vaqtda bitta jangda bo'ladi.
//   duel:join(code, ack)              — jangga ulanish / bo'sh o'ringa o'tirish
//   duel:answer({round, choice}, ack) — classic: raund; soatli: savol indeksi,
//                                       choice null = o'tkazib yuborish
//   duel:chat({text} | {preset}, ack)
//   duel:leave({forfeit})             — chiqish (o'yin paytida forfeit: true → texnik mag'lubiyat)
//   duel:resign(ack)                  — taslim (sahifada qolib natijani ko'radi)
//   duel:rematch(ack)                 — revansh ovozi; ikkalasi bossa duel:rematch {code}
//   duel:queue({mode, section}, ack) / duel:unqueue / duel:bot({mode, section}, ack)
// ------------------------------------------------------------------

function registerDuel(socket) {
  let code = null;
  const user = socket.data.user;
  const reply = (ack) => (typeof ack === "function" ? ack : () => {});
  const current = () => (code ? getDuel(code) : null);
  const modeArgs = (raw) => {
    const mode = getMode(raw?.mode);
    return mode && SECTIONS.has(raw?.section) ? { mode: mode.id, section: raw.section } : null;
  };

  const leave = (opts) => {
    const duel = current();
    if (duel) leaveSocket(duel, user.id, socket.id, opts);
    if (code) socket.leave(`duel:${code}`);
    code = null;
  };

  socket.on("duel:join", async (raw, ack) => {
    const next = typeof raw === "string" ? raw.toUpperCase() : "";
    const duel = DUEL_CODE_RE.test(next) ? getDuel(next) : null;
    if (!duel || duel.status === "cancelled") return reply(ack)({ ok: false, reason: "not-found" });
    if (code && code !== next) leave();
    const player = playerFromUser(user);
    try {
      player.rating = await ratingOf(player.id, duel.mode.category);
    } catch {
      player.rating = null;
    }
    // Avval xonaga — joinDuel yuboradigan holatni shu socket ham olsin.
    socket.join(`duel:${next}`);
    const res = joinDuel(duel, player, socket.id);
    if (!res.ok) {
      socket.leave(`duel:${next}`);
      return reply(ack)(res);
    }
    code = next;
    reply(ack)({ ok: true, state: duelState(duel, user.id), chat: chatHistory(duel) });
  });

  socket.on("duel:answer", (msg, ack) => {
    const duel = current();
    const choice = msg?.choice === null ? null : typeof msg?.choice === "string" ? msg.choice.slice(0, 4) : undefined;
    if (!duel || !Number.isInteger(msg?.round) || choice === undefined) return reply(ack)({ ok: false });
    reply(ack)(submitAnswer(duel, user.id, { round: msg.round, choice }));
  });

  socket.on("duel:chat", (msg, ack) => {
    const duel = current();
    if (!duel || !msg || typeof msg !== "object") return reply(ack)({ ok: false });
    reply(ack)(sendChat(duel, user.id, msg));
  });

  socket.on("duel:leave", (msg) => leave({ forfeit: Boolean(msg?.forfeit) }));

  socket.on("duel:resign", (ack) => {
    const duel = current();
    reply(ack)(duel ? resign(duel, user.id) : { ok: false });
  });

  socket.on("duel:rematch", async (ack) => {
    const duel = current();
    if (!duel) return reply(ack)({ ok: false });
    try {
      reply(ack)({ ok: true, code: await voteRematch(duel, user.id) });
    } catch (err) {
      console.error("[duel] revansh", err);
      reply(ack)({ ok: false });
    }
  });

  socket.on("duel:queue", async (raw, ack) => {
    const args = modeArgs(raw);
    if (!args) return reply(ack)({ ok: false });
    try {
      reply(ack)({ ok: true, code: await enqueue(args.mode, args.section, playerFromUser(user), socket.id) });
    } catch (err) {
      console.error("[duel] navbat", err);
      reply(ack)({ ok: false });
    }
  });

  socket.on("duel:unqueue", () => dequeue(user.id));

  socket.on("duel:bot", async (raw, ack) => {
    const args = modeArgs(raw);
    if (!args) return reply(ack)({ ok: false });
    try {
      reply(ack)({ ok: true, code: await playBot(args.mode, args.section, playerFromUser(user)) });
    } catch (err) {
      console.error("[duel] bot", err);
      reply(ack)({ ok: false });
    }
  });

  socket.on("disconnect", () => {
    dequeue(user.id);
    leave();
  });
}

export function emitSessionUpdate(sessionId, publicDoc, adminDoc) {
  if (!io) return;
  io.to(`session:${sessionId}`).except(`session-admin:${sessionId}`).emit("session:update", publicDoc);
  io.to(`session-admin:${sessionId}`).emit("session:update", adminDoc);
}

export function emitToAdmins(sessionId, event, payload) {
  if (!io) return;
  io.to(`session-admin:${sessionId}`).emit(event, payload);
}

// Logout, bloklash yoki huquq o'zgarganda — foydalanuvchining barcha ochiq
// socketlari uziladi (huquqlar faqat ulanishda tekshiriladi).
export function disconnectUser(userId) {
  io?.in(`user:${userId}`).disconnectSockets(true);
}
