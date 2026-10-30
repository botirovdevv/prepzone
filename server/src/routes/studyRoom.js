import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { config } from "../config.js";
import { HttpError, notFound } from "../lib/errors.js";
import { CODE_RE, MAX_PARTICIPANTS, createRoom, getRoom, startRoomClock } from "../lib/studyRooms.js";

// ------------------------------------------------------------------
// /api/study-room — ikki talaba birga dars qiladigan xona.
//   POST /              — yangi xona kodi
//   POST /:code/token   — LiveKit'ga ulanish tokeni (xona to'la bo'lsa 409,
//                         vaqti tugagan bo'lsa 410)
// Xona vaqti (bepul: 40 daqiqa) birinchi kishi kirganda boshlanadi; tugaganda
// server xonani LiveKit'da o'chiradi — ikkala talaba ham uziladi.
// ------------------------------------------------------------------

const router = Router();

router.use(
  rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

const enabled = () => Boolean(config.livekitUrl && config.livekitApiKey && config.livekitApiSecret);

function requireEnabled() {
  if (!enabled()) throw new HttpError(503, "study-room/disabled", "Study Room hozircha o'chiq.");
}

let roomService = null;
function getRoomService() {
  if (!roomService) {
    // Docker ichida API'ga to'g'ridan-to'g'ri (http://livekit:7880); aks holda
    // ommaviy manzil (RoomServiceClient https kutadi, wss emas).
    const host = config.livekitApiHost || config.livekitUrl.replace(/^ws/, "http");
    roomService = new RoomServiceClient(host, config.livekitApiKey, config.livekitApiSecret);
  }
  return roomService;
}

// Xonani LiveKit'da maxParticipants=2 bilan ochadi (LiveKit uchinchi kishini
// o'zi kiritmaydi — bir vaqtda kelgan so'rovlarda ham) va ichidagilarni
// qaytaradi. LiveKit API javob bermasa — kirishni to'xtatmaymiz.
async function prepareRoom(code) {
  const service = getRoomService();
  try {
    await service.createRoom({ name: code, maxParticipants: MAX_PARTICIPANTS, emptyTimeout: 10 * 60 });
    const list = await service.listParticipants(code);
    return list.map((p) => p.identity);
  } catch (err) {
    console.error("[study-room] LiveKit API xatosi:", err?.message || err);
    return [];
  }
}

function endRoom(code) {
  getRoomService()
    .deleteRoom(code)
    .catch((err) => console.error("[study-room] xonani yopib bo'lmadi:", err?.message || err));
}

router.get("/config", (_req, res) => {
  res.json({ enabled: enabled() });
});

router.post("/", (req, res) => {
  requireEnabled();
  res.status(201).json({ code: createRoom(req.user) });
});

router.post("/:code/token", async (req, res) => {
  requireEnabled();
  const code = String(req.params.code || "").toUpperCase();
  const room = CODE_RE.test(code) ? getRoom(code) : null;
  if (!room) throw notFound("Bunday xona topilmadi yoki muddati tugagan.");
  if (room.startedAt && Date.now() >= room.startedAt + room.limitMs) {
    throw new HttpError(410, "study-room/time-up", `Bu xonaning vaqti (${room.limitMs / 60_000} daqiqa) tugagan.`);
  }

  const identity = String(req.user.id);
  const inside = await prepareRoom(code);
  // O'sha foydalanuvchi qayta ulanayotgan bo'lsa (boshqa tab, refresh) — ruxsat.
  if (!inside.includes(identity) && inside.length >= MAX_PARTICIPANTS) {
    throw new HttpError(409, "study-room/full", "Xona to'la — unda allaqachon 2 kishi bor.");
  }

  const endsAt = startRoomClock(room, () => endRoom(code));
  const token = new AccessToken(config.livekitApiKey, config.livekitApiSecret, {
    identity,
    name: req.user.display_name || req.user.email?.split("@")[0] || "Talaba",
    // Token faqat xona vaqti tugaguncha ishlaydi.
    ttl: Math.max(60, Math.ceil((endsAt - Date.now()) / 1000)),
  });
  token.addGrant({
    room: code,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  res.json({ token: await token.toJwt(), url: config.livekitUrl, code, endsAt, limitMinutes: room.limitMs / 60_000 });
});

export default router;
