import { Server } from "socket.io";
import { config } from "../config.js";
import { COOKIE_NAME } from "./session.js";
import { userFromToken } from "../middleware/auth.js";
import { hasPerm } from "./permissions.js";
import { CODE_RE, MAX_POINTS_PER_STROKE, MAX_STROKES, getRoom } from "./studyRooms.js";

// ------------------------------------------------------------------
// Jonli yangilanishlar (Firestore onSnapshot o'rnini bosadi).
//
// Xonalar:
//   session:{id}        — test sahifasidagi har bir ishtirokchi: sessiya
//                         holati (masalan admin testni yopsa) — kodsiz.
//   session-admin:{id}  — faqat admin: kod bilan meta, ishtirokchilar
//                         holati va proktoring hodisalari.
//   board:{code}        — Study Room doskasi (chiziqlar ikkala talabaga).
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

export function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: config.clientOrigin ? { origin: config.clientOrigin, credentials: true } : undefined,
  });

  io.use(async (socket, next) => {
    try {
      const user = await userFromToken(readCookie(socket.handshake.headers.cookie, COOKIE_NAME));
      if (!user || !user.email_verified) return next(new Error("unauthenticated"));
      socket.data.user = user;
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
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
  });

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
    if (!board) return typeof ack === "function" && ack({ ok: false });
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

    let stroke = board.strokes.get(msg.id);
    if (stroke) {
      if (stroke.points.length + points.length > MAX_POINTS_PER_STROKE) return;
      stroke.points.push(...points);
      socket.to(`board:${code}`).emit("board:stroke", { id: msg.id, points });
      return;
    }

    const size = Number(msg.size);
    if (board.strokes.size >= MAX_STROKES || !TOOLS.has(msg.tool) || !COLOR_RE.test(msg.color)) return;
    if (!Number.isFinite(size) || size < 0.0005 || size > 0.1) return;
    stroke = { id: msg.id, tool: msg.tool, color: msg.color, size, points };
    board.strokes.set(msg.id, stroke);
    socket.to(`board:${code}`).emit("board:stroke", stroke);
  });

  socket.on("board:undo", (id) => {
    const board = room();
    if (!board || typeof id !== "string" || !board.strokes.delete(id)) return;
    socket.to(`board:${code}`).emit("board:undo", id);
  });

  socket.on("board:clear", () => {
    const board = room();
    if (!board) return;
    board.strokes.clear();
    socket.to(`board:${code}`).emit("board:clear");
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
