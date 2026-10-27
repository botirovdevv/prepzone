import { Server } from "socket.io";
import { config } from "../config.js";
import { COOKIE_NAME } from "./session.js";
import { userFromToken } from "../middleware/auth.js";

// ------------------------------------------------------------------
// Jonli yangilanishlar (Firestore onSnapshot o'rnini bosadi).
//
// Xonalar:
//   session:{id}        — test sahifasidagi har bir ishtirokchi: sessiya
//                         holati (masalan admin testni yopsa) — kodsiz.
//   session-admin:{id}  — faqat admin: kod bilan meta, ishtirokchilar
//                         holati va proktoring hodisalari.
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
      if (socket.data.user.is_admin) socket.join(`session-admin:${sessionId}`);
    });
    socket.on("session:unwatch", (sessionId) => {
      if (typeof sessionId !== "string") return;
      socket.leave(`session:${sessionId}`);
      socket.leave(`session-admin:${sessionId}`);
    });
  });

  return io;
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
