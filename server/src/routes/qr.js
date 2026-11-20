import crypto from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { one, query } from "../db/index.js";
import { HttpError, badRequest, parseBody } from "../lib/errors.js";
import { publicUser } from "../lib/serialize.js";
import { startSession } from "../lib/session.js";
import { describeUserAgent } from "../lib/userAgent.js";
import { requireAuth, requireVerified } from "../middleware/auth.js";

// ------------------------------------------------------------------
// QR orqali kirish (Telegram Web kabi):
//   1. Kompyuter /start → { id, scanCode, pollSecret }. QR'da faqat id va
//      scanCode bo'ladi; pollSecret kompyuterdan chiqmaydi.
//   2. Telefon (tizimga kirgan) QR'ni skanerlaydi → /info (kompyuter
//      ma'lumotlari) → /approve yoki /deny.
//   3. Kompyuter /poll qilib turadi; tasdiqlangach shu javobda unga yangi
//      seans cookie'si beriladi. So'rov bir martalik va 2 daqiqa yashaydi.
// Bazada kodlarning faqat sha256 hashi saqlanadi.
// ------------------------------------------------------------------

const router = Router();

const TTL_MS = 2 * 60 * 1000;
const hash = (v) => crypto.createHash("sha256").update(v).digest("hex");
const random = (bytes) => crypto.randomBytes(bytes).toString("base64url");

const limiter = (limit, windowMs) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, res) =>
      res.status(429).json({
        code: "auth/too-many-requests",
        message: "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.",
      }),
  });
const startLimiter = limiter(20, 10 * 60 * 1000);
const pollLimiter = limiter(90, 60 * 1000);
const approveLimiter = limiter(30, 15 * 60 * 1000);

const id = z.string().regex(/^[0-9a-f]{32}$/, "QR kod yaroqsiz.");
const secret = z.string().min(16).max(100);

const expired = (row) => new Date(row.expires_at).getTime() < Date.now();

// Kompyuter ekranida ko'rsatiladigan 2 xonali tasdiq raqami. Telefonda shu
// raqam kiritilmasa tasdiqlab bo'lmaydi — begona odam yuborgan QR havolasini
// (fishing) bosgan user o'sha kompyuter ekranini ko'rmaydi. poll_hash'dan
// hosil qilinadi, alohida saqlash shart emas.
const confirmFrom = (pollHash) => String((parseInt(pollHash.slice(0, 8), 16) % 90) + 10);

// Telefon tomoni: QR'dagi id + scanCode bo'yicha topadi.
async function findByScan(qrId, scanCode) {
  const row = await one("SELECT * FROM qr_logins WHERE id = $1 AND scan_hash = $2", [qrId, hash(scanCode)]);
  if (!row) throw badRequest("invalid-argument", "QR kod yaroqsiz.");
  return row;
}

router.post("/start", startLimiter, async (req, res) => {
  await query("DELETE FROM qr_logins WHERE expires_at < now() - interval '1 hour'");
  const qrId = crypto.randomBytes(16).toString("hex");
  const scanCode = random(16);
  const pollSecret = random(32);
  const expiresAt = new Date(Date.now() + TTL_MS);
  await query(
    `INSERT INTO qr_logins (id, scan_hash, poll_hash, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      qrId,
      hash(scanCode),
      hash(pollSecret),
      String(req.get("user-agent") || "").slice(0, 300),
      String(req.ip || "").slice(0, 64),
      expiresAt,
    ]
  );
  res.json({ id: qrId, scanCode, pollSecret, expiresAt, confirm: confirmFrom(hash(pollSecret)) });
});

// Kompyuter tomoni. Holatlar: pending | scanned | approved | denied | expired.
router.post("/poll", pollLimiter, async (req, res) => {
  const body = parseBody(z.object({ id, pollSecret: secret }), req.body);
  const row = await one("SELECT * FROM qr_logins WHERE id = $1 AND poll_hash = $2", [
    body.id,
    hash(body.pollSecret),
  ]);
  if (!row) throw new HttpError(404, "not-found", "QR so'rovi topilmadi.");
  if (row.status === "used") return res.json({ status: "expired" });
  if (row.status === "denied") return res.json({ status: "denied" });
  if (row.status !== "approved") return res.json({ status: expired(row) ? "expired" : row.status });

  // Tasdiqlangan — bir martalik: faqat bitta poll seans oladi.
  const used = await one(
    `UPDATE qr_logins SET status = 'used' WHERE id = $1 AND status = 'approved'
       AND expires_at > now() - interval '1 minute'
     RETURNING user_id`,
    [row.id]
  );
  if (!used) return res.json({ status: "expired" });
  const user = await one("SELECT * FROM users WHERE id = $1", [used.user_id]);
  if (!user || user.blocked_at) return res.json({ status: "denied" });
  await startSession(req, res, user, "qr");
  res.json({ status: "approved", user: publicUser(user) });
});

// Telefon: kim (qaysi kompyuter) kirmoqchi ekanini ko'rsatish uchun.
router.get("/info", requireAuth, async (req, res) => {
  const qrId = id.safeParse(req.query.i);
  if (!qrId.success || typeof req.query.c !== "string") throw badRequest("invalid-argument", "QR kod yaroqsiz.");
  const row = await findByScan(qrId.data, req.query.c);
  let status = row.status === "used" ? "approved" : row.status;
  if ((status === "pending" || status === "scanned") && expired(row)) status = "expired";
  if (status === "pending") {
    await query("UPDATE qr_logins SET status = 'scanned' WHERE id = $1 AND status = 'pending'", [row.id]);
    status = "scanned";
  }
  res.json({
    status,
    ...describeUserAgent(row.user_agent),
    ip: row.ip,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  });
});

const decisionBody = z.object({ id, scanCode: secret });

router.post("/approve", approveLimiter, requireVerified, async (req, res) => {
  const body = parseBody(
    decisionBody.extend({ confirm: z.string().regex(/^\d{2}$/, "Kompyuterdagi 2 xonali raqamni kiriting.") }),
    req.body
  );
  const found = await findByScan(body.id, body.scanCode);
  if (body.confirm !== confirmFrom(found.poll_hash)) {
    // Bitta urinish: noto'g'ri raqamdan keyin bu QR yaroqsiz bo'ladi.
    await query("UPDATE qr_logins SET status = 'denied' WHERE id = $1 AND status IN ('pending', 'scanned')", [found.id]);
    throw badRequest("invalid-argument", "Raqam mos kelmadi. Kompyuterdagi yangi QR'ni skanerlang.");
  }
  const row = await one(
    `UPDATE qr_logins SET status = 'approved', user_id = $2
     WHERE id = $1 AND status IN ('pending', 'scanned') AND expires_at > now()
     RETURNING id`,
    [body.id, req.user.id]
  );
  if (!row) throw badRequest("invalid-argument", "QR kod eskirgan. Kompyuterdagi yangi QR'ni skanerlang.");
  res.json({ ok: true });
});

router.post("/deny", approveLimiter, requireAuth, async (req, res) => {
  const body = parseBody(decisionBody, req.body);
  await findByScan(body.id, body.scanCode);
  await query("UPDATE qr_logins SET status = 'denied' WHERE id = $1 AND status IN ('pending', 'scanned')", [
    body.id,
  ]);
  res.json({ ok: true });
});

export default router;
