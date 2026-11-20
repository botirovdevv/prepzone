import { createHmac } from "node:crypto";
import { Router } from "express";
import { perUserLimit } from "../lib/limiters.js";
import { config } from "../config.js";
import { HttpError, notFound } from "../lib/errors.js";
import { CODE_RE, MAX_PARTICIPANTS, createRoom, getRoom, isTimeUp } from "../lib/studyRooms.js";

// ------------------------------------------------------------------
// /api/study-room — ikki talaba birga dars qiladigan xona.
//   POST /             — yangi xona kodi
//   POST /:code/join   — kirishga ruxsat + ICE serverlar (STUN va TURN).
//                        Xona to'la bo'lsa 409, vaqti tugagan bo'lsa 410.
// Video brauzerlar orasida to'g'ridan-to'g'ri (P2P) — Google Meet'ning ikki
// kishilik qo'ng'iroqlari kabi. To'g'ridan-to'g'ri ulanib bo'lmasa (qattiq
// operator NAT) TURN relay (coturn) ishlaydi. Signal: realtime.js (call:*).
// ------------------------------------------------------------------

const router = Router();

// Foydalanuvchi bo'yicha (IP emas): bitta Wi-Fi ortidagi ko'p talaba
// bir-birining limitini yeb qo'ymasin.
router.use(perUserLimit({ windowMs: 60_000, limit: 30 }));

// coturn "use-auth-secret" (TURN REST API) uchun vaqtinchalik login/parol:
// username = "<tugash vaqti>:<userId>", parol = HMAC-SHA1(secret, username).
function iceServers(userId, ttlSeconds) {
  const servers = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
  if (config.turnSecret && config.turnUrls.length) {
    const username = `${Math.floor(Date.now() / 1000) + ttlSeconds}:${userId}`;
    const credential = createHmac("sha1", config.turnSecret).update(username).digest("base64");
    servers.push({ urls: config.turnUrls, username, credential });
  }
  return servers;
}

// TURN relay sozlanmagan bo'lsa qattiq NAT (mobil operator) ortida video
// ulanmasligi mumkin — lobby shuni ogohlantiradi.
router.get("/config", (_req, res) => {
  res.json({ enabled: Boolean(config.turnSecret && config.turnUrls.length) });
});

router.post("/", (req, res) => {
  const code = createRoom(req.user);
  if (!code) throw new HttpError(429, "resource-exhausted", "Sizda allaqachon 2 ta faol xona bor.");
  res.status(201).json({ code });
});

router.post("/:code/join", (req, res) => {
  const code = String(req.params.code || "").toUpperCase();
  const room = CODE_RE.test(code) ? getRoom(code) : null;
  if (!room) throw notFound("Bunday xona topilmadi yoki muddati tugagan.");
  if (isTimeUp(room)) {
    throw new HttpError(410, "study-room/time-up", `Bu xonaning vaqti (${room.limitMs / 60_000} daqiqa) tugagan.`);
  }
  // O'sha foydalanuvchi qayta kirayotgan bo'lsa (refresh, boshqa tab) — ruxsat.
  const others = new Set([...room.peers.values()].map((p) => p.userId).filter((id) => id !== String(req.user.id)));
  if (others.size >= MAX_PARTICIPANTS) {
    throw new HttpError(409, "study-room/full", "Xona to'la — unda allaqachon 2 kishi bor.");
  }

  room.allowed.add(String(req.user.id));
  const left = room.startedAt ? room.startedAt + room.limitMs - Date.now() : room.limitMs;
  res.json({
    code,
    iceServers: iceServers(req.user.id, Math.ceil(left / 1000) + 600),
    limitMinutes: room.limitMs / 60_000,
  });
});

export default router;
