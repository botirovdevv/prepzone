import { randomInt } from "node:crypto";

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

// Bitta xona (dars) davomiyligi.
export const ROOM_MINUTES = 40;

export const MAX_STROKES = 5000;
export const MAX_POINTS_PER_STROKE = 4000;
// Bitta doskadagi jami nuqtalar — xotirani to'ldirib serverni yiqitmaslik uchun.
export const MAX_ROOM_POINTS = 200_000;
// Bitta foydalanuvchi bir vaqtda yaratgan xonalar soni.
const MAX_ROOMS_PER_USER = 2;

// code -> { createdBy, createdAt, touchedAt, limitMs, startedAt, endTimer,
//           strokes: Map<id, stroke>, points, allowed: Set<userId>,
//           peers: Map<socketId, { userId, name }> }
const rooms = new Map();

export function roomLimitMinutes(_user) {
  return ROOM_MINUTES;
}

function newCode() {
  let code;
  do {
    code = Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  } while (rooms.has(code));
  return code;
}

export function createRoom(user) {
  // Eski bo'sh xonalari o'chiriladi; band xonalar soni limitdan oshmasin.
  const mine = [...rooms].filter(([, r]) => r.createdBy === user.id).sort((a, b) => a[1].createdAt - b[1].createdAt);
  for (const [c, r] of mine) {
    if (mine.length < MAX_ROOMS_PER_USER) break;
    if (r.peers.size === 0) {
      clearTimeout(r.endTimer);
      rooms.delete(c);
      mine.splice(mine.findIndex(([x]) => x === c), 1);
    }
  }
  if (mine.length >= MAX_ROOMS_PER_USER) return null;
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
    points: 0,
    // REST /join orqali ruxsat olgan foydalanuvchilar — socket'da faqat ular
    // doska va qo'ng'iroqqa ulana oladi (kodni socket orqali taxmin qilib bo'lmaydi).
    allowed: new Set([String(user.id)]),
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
