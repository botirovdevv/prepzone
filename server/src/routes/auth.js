import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { one, query, tx } from "../db/index.js";
import { HttpError, badRequest, parseBody, unauthorized } from "../lib/errors.js";
import { setSessionCookie, clearSessionCookie } from "../lib/session.js";
import { publicUser } from "../lib/serialize.js";
import { issueCode, consumeCode } from "../lib/otp.js";
import { verifyGoogle } from "../lib/google.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      code: "auth/too-many-requests",
      message: "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.",
    }),
});

const email = z.string().trim().toLowerCase().email("Email manzili noto'g'ri.").max(254);
const password = z
  .string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak.")
  .max(128, "Parol juda uzun.");
const displayName = z.string().trim().min(1, "Ismingizni kiriting.").max(80);
const code = z.string().trim().regex(/^\d{6}$/, "Kod 6 ta raqamdan iborat bo'lishi kerak.");

const hashPassword = (pw) => bcrypt.hash(pw, 12);

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
  setSessionCookie(res, user);
  // Tasdiqlash kodi VerifyEmail sahifasi ochilganda (/otp/send) yuboriladi.
  sendUser(res, user, 201);
});

router.post("/login", strictLimiter, async (req, res) => {
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
  setSessionCookie(res, user);
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
      return linked.rows[0];
    }

    const created = await client.query(
      `INSERT INTO users (id, email, google_id, display_name, email_verified)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [crypto.randomUUID(), g.email.toLowerCase(), g.sub, g.name]
    );
    return created.rows[0];
  });

  setSessionCookie(res, user);
  sendUser(res, user);
});

router.post("/logout", (_req, res) => {
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

router.post("/password/reset", strictLimiter, async (req, res) => {
  const body = parseBody(z.object({ email, code, password }), req.body);
  const user = await findByEmail(body.email);
  if (!user) throw badRequest("invalid-argument", "Kod noto'g'ri.");
  await consumeCode(user, "reset", body.code);
  // Kodni olgan odam emailga egalik qilishini isbotladi — email ham tasdiqlanadi.
  const updated = await one(
    `UPDATE users SET password_hash = $2, email_verified = TRUE, token_version = token_version + 1
     WHERE id = $1 RETURNING *`,
    [user.id, await hashPassword(body.password)]
  );
  setSessionCookie(res, updated);
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

async function checkCurrentPassword(user, currentPassword) {
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
  const user = await one(
    `UPDATE users SET password_hash = $2, token_version = token_version + 1
     WHERE id = $1 RETURNING *`,
    [req.user.id, await hashPassword(body.newPassword)]
  );
  // Boshqa qurilmalardagi sessiyalar bekor bo'ladi, shu qurilmada yangisi beriladi.
  setSessionCookie(res, user);
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
  const user = await one(
    `UPDATE users SET email = $2, email_verified = FALSE WHERE id = $1 RETURNING *`,
    [req.user.id, body.newEmail]
  );
  await query("DELETE FROM otp_codes WHERE user_id = $1", [user.id]);
  sendUser(res, user);
});

export default router;
