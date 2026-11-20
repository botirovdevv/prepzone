import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { HttpError, badRequest, parseBody, unauthorized } from "../lib/errors.js";
import {
  setSessionCookie,
  clearSessionCookie,
  startSession,
  endSession,
  endOtherSessions,
} from "../lib/session.js";
import { describeUserAgent } from "../lib/userAgent.js";
import { publicUser } from "../lib/serialize.js";
import { issueCode, consumeCode } from "../lib/otp.js";
import { verifyGoogle } from "../lib/google.js";
import { requireAuth } from "../middleware/auth.js";
import { disconnectUser } from "../lib/realtime.js";

const router = Router();

const tooManyAttempts = (_req, res) =>
  res.status(429).json({
    code: "auth/too-many-requests",
    message: "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.",
  });

// IP bo'yicha umumiy limit. Maktab, o'quv markazi yoki mobil operator
// ortidagi ko'p o'quvchi bitta IP'dan chiqadi: zalda 200 kishi bir vaqtda
// ro'yxatdan o'tsa (register + otp/send + otp/verify) ~600 so'rov bo'ladi.
// Parol/kodni taxmin qilishdan himoya alohida — loginLimiter (IP + email)
// va OTP urinishlar soni (lib/otp.js).
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1500,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: tooManyAttempts,
});

const email = z.string().trim().toLowerCase().email("Email manzili noto'g'ri.").max(254);
const password = z
  .string()
  .min(10, "Parol kamida 10 ta belgidan iborat bo'lishi kerak.")
  .max(128, "Parol juda uzun.");
const displayName = z.string().trim().min(1, "Ismingizni kiriting.").max(80);
const code = z.string().trim().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak.");

const hashPassword = (pw) => bcrypt.hash(pw, 12);

// Bloklangan user kira olmaydi (mavjud sessiyalari userFromToken'da bekor bo'ladi).
function assertNotBlocked(user) {
  if (user?.blocked_at) {
    throw new HttpError(403, "auth/user-disabled", "Hisobingiz bloklangan. Administratorga murojaat qiling.");
  }
}

const findByEmail = (addr) => one("SELECT * FROM users WHERE lower(email) = lower($1)", [addr]);

function sendUser(res, user, status = 200) {
  res.status(status).json({ user: publicUser(user) });
}

// ------------------------------------------------------------------
// Ro'yxatdan o'tish / kirish / chiqish
// ------------------------------------------------------------------

router.get("/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.post("/register", strictLimiter, async (req, res) => {
  const body = parseBody(z.object({ email, password, displayName }), req.body);
  if (await findByEmail(body.email)) {
    throw new HttpError(409, "auth/email-already-in-use", "Bu email allaqachon ro'yxatdan o'tgan.");
  }
  const user = await one(
    `INSERT INTO users (id, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [crypto.randomUUID(), body.email, await hashPassword(body.password), body.displayName]
  );
  await startSession(req, res, user, "password");
  // Tasdiqlash kodi VerifyEmail sahifasi ochilganda (/otp/send) yuboriladi.
  sendUser(res, user, 201);
});

// Parolni taxmin qilishga qarshi: bitta hisobga (IP + email) 15 daqiqada
// 8 ta noto'g'ri urinish. Muvaffaqiyatli kirish hisobga olinmaydi.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) =>
    `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "").trim().toLowerCase().slice(0, 254)}`,
  handler: tooManyAttempts,
});

router.post("/login", strictLimiter, loginLimiter, async (req, res) => {
  const body = parseBody(z.object({ email, password: z.string().min(1).max(128) }), req.body);
  const user = await findByEmail(body.email);
  if (user && !user.password_hash) {
    throw new HttpError(
      401,
      "auth/password-not-set",
      "Bu hisob uchun parol o'rnatilmagan. Google orqali kiring yoki parolni tiklang."
    );
  }
  if (!user || !(await bcrypt.compare(body.password, user.password_hash))) {
    throw new HttpError(401, "auth/invalid-credential", "Email yoki parol noto'g'ri.");
  }
  assertNotBlocked(user);
  await startSession(req, res, user, "password");
  sendUser(res, user);
});

// Google — bitta endpoint ham kirish, ham ro'yxatdan o'tish uchun. Google
// emailni allaqachon tasdiqlagan, shuning uchun foydalanuvchi shu
// tranzaksiyaning o'zida `email_verified = true` bo'ladi (avvalgi Cloud
// Function bilan bo'lgan kechikish/race muammosi shu bilan yo'qoladi).
router.post("/google", strictLimiter, async (req, res) => {
  const body = parseBody(
    z.object({ credential: z.string().optional(), accessToken: z.string().optional() }),
    req.body
  );
  const g = await verifyGoogle(body);
  if (!g.email || !g.emailVerified) {
    throw new HttpError(401, "auth/invalid-credential", "Google hisobidagi email tasdiqlanmagan.");
  }

  const user = await tx(async (client) => {
    const byGoogle = await client.query("SELECT * FROM users WHERE google_id = $1", [g.sub]);
    if (byGoogle.rows[0]) return byGoogle.rows[0];

    const byEmail = await client.query(
      "SELECT * FROM users WHERE lower(email) = lower($1) FOR UPDATE",
      [g.email]
    );
    if (byEmail.rows[0]) {
      // Shu email bilan avval ro'yxatdan o'tgan hisobga Google'ni bog'laymiz.
      // Hisob emaili tasdiqlanmagan bo'lsa, uni boshqa odam (email egasi
      // emas) parol bilan ochgan bo'lishi mumkin — shuning uchun o'sha
      // parol va undagi barcha sessiyalar bekor qilinadi.
      const linked = await client.query(
        `UPDATE users SET google_id = $2,
           password_hash = CASE WHEN email_verified THEN password_hash ELSE NULL END,
           token_version = CASE WHEN email_verified THEN token_version ELSE token_version + 1 END,
           email_verified = TRUE,
           display_name = CASE WHEN display_name = '' THEN $3 ELSE display_name END
         WHERE id = $1 RETURNING *`,
        [byEmail.rows[0].id, g.sub, g.name]
      );
      if (!byEmail.rows[0].email_verified) {
        await client.query("DELETE FROM user_sessions WHERE user_id = $1", [byEmail.rows[0].id]);
      }
      return linked.rows[0];
    }

    const created = await client.query(
      `INSERT INTO users (id, email, google_id, display_name, email_verified)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [crypto.randomUUID(), g.email.toLowerCase(), g.sub, g.name]
    );
    return created.rows[0];
  });

  assertNotBlocked(user);
  await startSession(req, res, user, "google");
  sendUser(res, user);
});

router.post("/logout", async (req, res) => {
  await endSession(req.user?.session_id);
  if (req.user) disconnectUser(req.user.id);
  clearSessionCookie(res);
  res.json({ ok: true });
});

// ------------------------------------------------------------------
// Email tasdiqlash (6 xonali kod)
// ------------------------------------------------------------------

router.post("/otp/send", strictLimiter, requireAuth, async (req, res) => {
  if (req.user.email_verified) return res.json({ ok: true, alreadyVerified: true });
  await issueCode(req.user, "verify");
  res.json({ ok: true });
});

router.post("/otp/verify", strictLimiter, requireAuth, async (req, res) => {
  const body = parseBody(z.object({ code }), req.body);
  if (!req.user.email_verified) {
    await consumeCode(req.user, "verify", body.code);
  }
  const user = await one("UPDATE users SET email_verified = TRUE WHERE id = $1 RETURNING *", [
    req.user.id,
  ]);
  sendUser(res, user);
});

// ------------------------------------------------------------------
// Parolni tiklash — Firebase'dan ko'chirilgan foydalanuvchilar ham shu
// orqali yangi parol o'rnatadi (Firebase parol hashlarini ko'chirib
// bo'lmaydi).
// ------------------------------------------------------------------

router.post("/password/forgot", strictLimiter, async (req, res) => {
  const body = parseBody(z.object({ email }), req.body);
  const user = await findByEmail(body.email);
  // Email ro'yxatda bor-yo'qligini oshkor qilmaslik uchun javob har doim bir xil.
  if (user) {
    try {
      await issueCode(user, "reset");
    } catch (err) {
      if (err.code !== "resource-exhausted") throw err;
    }
  }
  res.json({ ok: true });
});

// Kodni taxmin qilishga qarshi qo'shimcha to'siq: bitta email'ga 15 daqiqada
// 10 ta reset urinishi (OTP'ning o'z urinish/kunlik limitlaridan tashqari).
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => `reset:${String(req.body?.email || "").trim().toLowerCase().slice(0, 254)}`,
  handler: tooManyAttempts,
});

router.post("/password/reset", strictLimiter, resetLimiter, async (req, res) => {
  const body = parseBody(z.object({ email, code, password }), req.body);
  const user = await findByEmail(body.email);
  if (!user) throw badRequest("invalid-argument", "Kod noto'g'ri.");
  assertNotBlocked(user);
  await consumeCode(user, "reset", body.code);
  // Kodni olgan odam emailga egalik qilishini isbotladi — email ham tasdiqlanadi.
  const updated = await one(
    `UPDATE users SET password_hash = $2, email_verified = TRUE, token_version = token_version + 1
     WHERE id = $1 RETURNING *`,
    [user.id, await hashPassword(body.password)]
  );
  await endOtherSessions(user.id);
  disconnectUser(user.id);
  await startSession(req, res, updated, "reset");
  sendUser(res, updated);
});

// ------------------------------------------------------------------
// Hisob sozlamalari
// ------------------------------------------------------------------

router.patch("/profile", requireAuth, async (req, res) => {
  const body = parseBody(z.object({ displayName }), req.body);
  const user = await one("UPDATE users SET display_name = $2 WHERE id = $1 RETURNING *", [
    req.user.id,
    body.displayName,
  ]);
  await query("UPDATE leaderboard SET name = $2 WHERE user_id = $1", [user.id, body.displayName]);
  sendUser(res, user);
});

// Xavfli amallarni (hisobni o'chirish, progressni tiklash) tasdiqlash so'zi.
export const CONFIRM_WORD = "O'CHIRISH";

// Paroli yo'q (faqat Google) foydalanuvchida tekshiruv o'tkazib yuboriladi.
export async function checkCurrentPassword(user, currentPassword) {
  if (!user.password_hash) return;
  if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password_hash))) {
    throw new HttpError(401, "auth/wrong-password", "Joriy parol noto'g'ri.");
  }
}

// Google orqali ro'yxatdan o'tgan (paroli yo'q) foydalanuvchi joriy
// parolsiz yangi parol o'rnata oladi.
router.post("/password/change", requireAuth, async (req, res) => {
  const body = parseBody(
    z.object({ currentPassword: z.string().max(128).optional(), newPassword: password }),
    req.body
  );
  await checkCurrentPassword(req.user, body.currentPassword);
  // Paroli yo'q (Google) hisobga QR orqali ochilgan seansdan birinchi parolni
  // o'rnatib bo'lmaydi — bu hisobni egallab olish yo'li bo'lardi. Email
  // orqali "Parolni tiklash" (OTP) ishlatiladi.
  if (!req.user.password_hash) {
    const s = await one("SELECT method FROM user_sessions WHERE id = $1", [req.user.session_id]);
    if (s?.method === "qr") {
      throw new HttpError(
        403,
        "permission-denied",
        "Xavfsizlik uchun parolni \"Parolni unutdingizmi?\" orqali email kodi bilan o'rnating."
      );
    }
  }
  const user = await one(
    `UPDATE users SET password_hash = $2, token_version = token_version + 1
     WHERE id = $1 RETURNING *`,
    [req.user.id, await hashPassword(body.newPassword)]
  );
  // Boshqa qurilmalardagi sessiyalar bekor bo'ladi, shu qurilmadagisi qoladi.
  await endOtherSessions(user.id, req.user.session_id);
  setSessionCookie(res, user, req.user.session_id);
  disconnectUser(user.id);
  sendUser(res, user);
});

router.post("/email/change", requireAuth, async (req, res) => {
  const body = parseBody(
    z.object({ currentPassword: z.string().max(128).optional(), newEmail: email }),
    req.body
  );
  if (!req.user.password_hash) {
    throw unauthorized("Email'ni o'zgartirish uchun avval parol o'rnating.");
  }
  await checkCurrentPassword(req.user, body.currentPassword);
  const taken = await findByEmail(body.newEmail);
  if (taken && taken.id !== req.user.id) {
    throw new HttpError(409, "auth/email-already-in-use", "Bu email allaqachon ro'yxatdan o'tgan.");
  }
  // Boshqa qurilmalardagi seanslar bekor qilinadi (hisob egasi o'zgargan bo'lishi mumkin).
  const user = await one(
    `UPDATE users SET email = $2, email_verified = FALSE, token_version = token_version + 1
     WHERE id = $1 RETURNING *`,
    [req.user.id, body.newEmail]
  );
  await query("DELETE FROM otp_codes WHERE user_id = $1", [user.id]);
  await endOtherSessions(user.id, req.user.session_id);
  setSessionCookie(res, user, req.user.session_id);
  disconnectUser(user.id);
  sendUser(res, user);
});

// ------------------------------------------------------------------
// Faol seanslar
// ------------------------------------------------------------------

router.get("/sessions", requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT id, user_agent, ip, method, created_at, last_seen_at FROM user_sessions
     WHERE user_id = $1 AND NOT revoked ORDER BY last_seen_at DESC`,
    [req.user.id]
  );
  const items = rows.map((s) => ({
    id: s.id,
    ...describeUserAgent(s.user_agent),
    ip: s.ip,
    method: s.method,
    createdAt: s.created_at,
    lastSeenAt: s.last_seen_at,
    current: s.id === req.user.session_id,
  }));
  items.sort((a, b) => Number(b.current) - Number(a.current));
  res.json({ items });
});

router.delete("/sessions/:id", requireAuth, async (req, res) => {
  if (req.params.id === req.user.session_id) {
    throw badRequest("invalid-argument", "Joriy seansni tugatish uchun hisobdan chiqing.");
  }
  const row = await one("SELECT id FROM user_sessions WHERE id = $1 AND user_id = $2 AND NOT revoked", [
    req.params.id,
    req.user.id,
  ]);
  if (!row) throw new HttpError(404, "not-found", "Bu seans topilmadi.");
  await endSession(row.id);
  res.json({ ok: true });
});

// Boshqa barcha qurilmalardagi seanslarni bekor qilish (shu qurilma qoladi).
// token_version ham oshadi — sid'siz eski tokenlar ham bekor bo'ladi.
router.post("/sessions/revoke-all", requireAuth, async (req, res) => {
  const user = await one(
    "UPDATE users SET token_version = token_version + 1 WHERE id = $1 RETURNING *",
    [req.user.id]
  );
  await endOtherSessions(user.id, req.user.session_id);
  setSessionCookie(res, user, req.user.session_id);
  disconnectUser(user.id);
  sendUser(res, user);
});

// Mavjud hisobga Google'ni ulash (keyin Google orqali ham kirish mumkin).
router.post("/google/link", strictLimiter, requireAuth, async (req, res) => {
  const body = parseBody(
    z.object({ credential: z.string().optional(), accessToken: z.string().optional() }),
    req.body
  );
  const g = await verifyGoogle(body);
  if (!g.email || !g.emailVerified) {
    throw new HttpError(401, "auth/invalid-credential", "Google hisobidagi email tasdiqlanmagan.");
  }
  const other = await one("SELECT id FROM users WHERE google_id = $1", [g.sub]);
  if (other && other.id !== req.user.id) {
    throw new HttpError(
      409,
      "auth/credential-already-in-use",
      "Bu Google hisobi boshqa Prepzone hisobiga ulangan."
    );
  }
  const user = await one("UPDATE users SET google_id = $2 WHERE id = $1 RETURNING *", [
    req.user.id,
    g.sub,
  ]);
  sendUser(res, user);
});

// Progressni tiklash: test natijalari, reytingdagi o'rin va Study Plan
// o'chiriladi. Hisob, onboarding va admin sessiyalari natijalari qoladi.
router.post("/progress/reset", strictLimiter, requireAuth, async (req, res) => {
  const body = parseBody(
    z.object({ currentPassword: z.string().max(128).optional(), confirm: z.literal(CONFIRM_WORD) }),
    req.body
  );
  await checkCurrentPassword(req.user, body.currentPassword);
  const user = await tx(async (client) => {
    await client.query("DELETE FROM results WHERE user_id = $1", [req.user.id]);
    await client.query("DELETE FROM leaderboard WHERE user_id = $1", [req.user.id]);
    const { rows } = await client.query(
      "UPDATE users SET study_plan = NULL WHERE id = $1 RETURNING *",
      [req.user.id]
    );
    return rows[0];
  });
  res.json({ user: publicUser(user) });
});

// Hisobni butunlay o'chirish. Barcha bog'liq ma'lumotlar (natijalar,
// reyting, sessiya ishtiroki...) ON DELETE CASCADE orqali o'chadi.
router.post("/account/delete", strictLimiter, requireAuth, async (req, res) => {
  const body = parseBody(
    z.object({ currentPassword: z.string().max(128).optional(), confirm: z.literal(CONFIRM_WORD) }),
    req.body
  );
  await checkCurrentPassword(req.user, body.currentPassword);
  if (req.user.is_owner) {
    const owners = await one("SELECT count(*)::int AS n FROM users WHERE is_owner", []);
    if (owners.n <= 1) {
      throw new HttpError(
        403,
        "permission-denied",
        "Siz yagona egasiz. Hisobni o'chirishdan oldin boshqa adminni ega qilib tayinlang."
      );
    }
  }
  await query("DELETE FROM users WHERE id = $1", [req.user.id]);
  disconnectUser(req.user.id);
  clearSessionCookie(res);
  res.json({ ok: true });
});

export default router;
