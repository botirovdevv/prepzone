import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { one, query, pool } from "../db/index.js";
import { HttpError } from "./errors.js";
import { sendCodeEmail } from "./email.js";
import { consumeDaily } from "./limits.js";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 daqiqa
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 soniya
const MAX_ATTEMPTS = 5;
// Kod qayta so'ralganda urinishlar soni yangilanadi, shuning uchun taxmin
// qilishni kunlik limitlar cheklaydi: bir hisobga kuniga ko'pi bilan
// DAILY_CODES ta kod va DAILY_GUESSES ta tekshiruv (≈ 15 / 900 000).
const DAILY_CODES = 6;
const DAILY_GUESSES = 15;
const LIMIT_MSG = "Bugun juda ko'p urinish bo'ldi. Ertaga qayta urinib ko'ring.";

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
  await consumeDaily(pool, user.id, `otp-send:${purpose}`, DAILY_CODES, LIMIT_MSG);

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
    // Yuborilmagan kod saqlanib qolmasin — aks holda qayta so'rash 45 soniya
    // bloklanadi va foydalanuvchi kelmaydigan emailni kutib qoladi.
    await query("DELETE FROM otp_codes WHERE user_id = $1 AND purpose = $2", [user.id, purpose]).catch(() => {});
    console.error("Email yuborishda xatolik:", err);
    throw new HttpError(502, "internal", "Emailni yuborib bo'lmadi. Keyinroq urinib ko'ring.");
  }
}

// Kodni tekshiradi; to'g'ri bo'lsa o'chiradi. Noto'g'ri bo'lsa xato tashlaydi.
export async function consumeCode(user, purpose, submitted) {
  // Urinish taqqoslashdan OLDIN atomik hisoblanadi: parallel so'rovlar
  // ham MAX_ATTEMPTS dan ortiq tekshiruv qila olmaydi.
  const row = await one(
    `UPDATE otp_codes SET attempts = attempts + 1
     WHERE user_id = $1 AND purpose = $2 AND attempts < $3 RETURNING *`,
    [user.id, purpose, MAX_ATTEMPTS]
  );
  if (!row) {
    const exists = await one("SELECT 1 FROM otp_codes WHERE user_id = $1 AND purpose = $2", [user.id, purpose]);
    if (!exists) throw new HttpError(400, "failed-precondition", "Avval kod so'rang.");
    throw new HttpError(429, "resource-exhausted", "Juda ko'p noto'g'ri urinish. Yangi kod so'rang.");
  }
  await consumeDaily(pool, user.id, `otp-guess:${purpose}`, DAILY_GUESSES, LIMIT_MSG);
  if (Date.now() > new Date(row.expires_at).getTime()) {
    throw new HttpError(400, "deadline-exceeded", "Kod muddati o'tgan. Yangi kod so'rang.");
  }
  // Kod so'ralgandan keyin email o'zgargan bo'lsa — eski kod yaroqsiz.
  if (row.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new HttpError(400, "failed-precondition", "Email o'zgargan. Yangi kod so'rang.");
  }
  if (!(await bcrypt.compare(submitted, row.code_hash))) {
    throw new HttpError(400, "invalid-argument", "Kod noto'g'ri.");
  }
  await query("DELETE FROM otp_codes WHERE user_id = $1 AND purpose = $2", [user.id, purpose]);
}
