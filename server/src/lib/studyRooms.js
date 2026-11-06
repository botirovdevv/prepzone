import { randomInt } from "node:crypto";
import { planLimits } from "./plans.js";

// ------------------------------------------------------------------
// Study Room xonalari, ularning doskasi va qo'ng'iroq ishtirokchilari — faqat
// xotirada saqlanadi (server qayta ishga tushsa xonalar yo'qoladi).
// Video/ovoz brauzerlar orasida to'g'ridan-to'g'ri (WebRTC P2P, kerak bo'lsa
// TURN relay); signal va doska Socket.IO orqali (realtime.js).
// ------------------------------------------------------------------

// Bir-biriga o'xshash belgilar (0/O, 1/I/L) yo'q — kodni og'zaki aytish oson.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
export const CODE_RE = /^[A-HJKMNP-Z2-9]{6}$/;

// Oxirgi faollikdan keyin xona shuncha vaqt saqlanadi.
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;
export const MAX_PARTICIPANTS = 2;

// Bitta xona (dars) davomiyligi xona ochgan foydalanuvchining tarifiga
// bog'liq (lib/plans.js: roomMinutes — 40 yoki 90 daqiqa).

export const MAX_STROKES = 5000;
export const MAX_POINTS_PER_STROKE = 4000;

// code -> { createdBy, createdAt, touchedAt, limitMs, startedAt, endTimer,
//           strokes: Map<id, stroke>, peers: Map<socketId, { userId, name }> }
const rooms = new Map();

export function roomLimitMinutes(user) {
  return planLimits(user).roomMinutes;
}

function newCode() {
  let code;
  do {
    code = Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  } while (rooms.has(code));
  return code;
}

export function createRoom(user) {
  const code = newCode();
  const now = Date.now();
  rooms.set(code, {
    createdBy: user.id,
    createdAt: now,
    touchedAt: now,
    limitMs: roomLimitMinutes(user) * 60_000,
    startedAt: null, // birinchi kishi kirganda boshlanadi
    endTimer: null,
    strokes: new Map(),
    peers: new Map(),
  });
  return code;
}

export function isTimeUp(room) {
  return Boolean(room.startedAt) && Date.now() >= room.startedAt + room.limitMs;
}

// Xona vaqtini birinchi kirishda boshlaydi va tugash vaqtida onEnd'ni chaqiradi.
// Tugash vaqtini (ms) qaytaradi.
export function startRoomClock(room, onEnd) {
  if (!room.startedAt) {
    room.startedAt = Date.now();
    room.endTimer = setTimeout(onEnd, room.limitMs);
    room.endTimer.unref?.();
  }
  return room.startedAt + room.limitMs;
}

export function getRoom(code) {
  const room = rooms.get(code);
  if (!room) return null;
  room.touchedAt = Date.now();
  return room;
}

// Muddati o'tgan xonalarni (doskasi bilan) tozalaydi.
setInterval(() => {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of rooms) {
    if (room.touchedAt < cutoff) {
      clearTimeout(room.endTimer);
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000).unref();
