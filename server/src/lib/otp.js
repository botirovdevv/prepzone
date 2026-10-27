import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { one, query } from "../db/index.js";
import { HttpError } from "./errors.js";
import { sendCodeEmail } from "./email.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 daqiqa
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 soniya
const MAX_ATTEMPTS = 5;

// Yangi 6 xonali kod yaratadi, hash'ini saqlaydi va emailga yuboradi.
// Kod hech qachon klientga qaytarilmaydi.
export async function issueCode(user, purpose) {
  const existing = await one(
    "SELECT created_at FROM otp_codes WHERE user_id = $1 AND purpose = $2",
    [user.id, purpose]
  );
  if (existing && Date.now() - new Date(existing.created_at).getTime() < RESEND_COOLDOWN_MS) {
    throw new HttpError(429, "resource-exhausted", "Juda tez-tez so'ralmoqda. Biroz kuting.");
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 8);
  await query(
    `INSERT INTO otp_codes (user_id, purpose, code_hash, email, attempts, expires_at, created_at)
     VALUES ($1, $2, $3, $4, 0, $5, now())
     ON CONFLICT (user_id, purpose) DO UPDATE
       SET code_hash = EXCLUDED.code_hash, email = EXCLUDED.email, attempts = 0,
           expires_at = EXCLUDED.expires_at, created_at = now()`,
    [user.id, purpose, codeHash, user.email, new Date(Date.now() + OTP_TTL_MS)]
  );

  try {
    await sendCodeEmail(user.email, code, purpose);
  } catch (err) {
    console.error("Email yuborishda xatolik:", err);
    throw new HttpError(502, "internal", "Emailni yuborib bo'lmadi. Keyinroq urinib ko'ring.");
  }
}

// Kodni tekshiradi; to'g'ri bo'lsa o'chiradi. Noto'g'ri bo'lsa xato tashlaydi.
export async function consumeCode(user, purpose, submitted) {
  const row = await one("SELECT * FROM otp_codes WHERE user_id = $1 AND purpose = $2", [
    user.id,
    purpose,
  ]);
  if (!row) throw new HttpError(400, "failed-precondition", "Avval kod so'rang.");
  if (row.attempts >= MAX_ATTEMPTS) {
    throw new HttpError(429, "resource-exhausted", "Juda ko'p noto'g'ri urinish. Yangi kod so'rang.");
  }
  if (Date.now() > new Date(row.expires_at).getTime()) {
    throw new HttpError(400, "deadline-exceeded", "Kod muddati o'tgan. Yangi kod so'rang.");
  }
  // Kod so'ralgandan keyin email o'zgargan bo'lsa — eski kod yaroqsiz.
  if (row.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new HttpError(400, "failed-precondition", "Email o'zgargan. Yangi kod so'rang.");
  }
  if (!(await bcrypt.compare(submitted, row.code_hash))) {
    await query(
      "UPDATE otp_codes SET attempts = attempts + 1 WHERE user_id = $1 AND purpose = $2",
      [user.id, purpose]
    );
    throw new HttpError(400, "invalid-argument", "Kod noto'g'ri.");
  }
  await query("DELETE FROM otp_codes WHERE user_id = $1 AND purpose = $2", [user.id, purpose]);
}
