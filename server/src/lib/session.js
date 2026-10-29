import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { query } from "../db/index.js";

// ------------------------------------------------------------------
// Sessiya — httpOnly cookie ichidagi JWT. Brauzer JS kodi uni o'qiy
// olmaydi (XSS'dan himoya). `tv` (token version) foydalanuvchi parolni
// o'zgartirganda oshiriladi — shunda barcha eski sessiyalar bekor bo'ladi.
// `sid` — user_sessions qatori: "Faol seanslar" ro'yxati va bitta
// seansni tugatish shu orqali ishlaydi (qator o'chsa token ham yaroqsiz).
// ------------------------------------------------------------------

export const COOKIE_NAME = "pz_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 kun

export function signSession(user, sid) {
  return jwt.sign({ sub: user.id, tv: user.token_version, sid }, config.jwtSecret, {
    expiresIn: Math.floor(MAX_AGE_MS / 1000),
  });
}

export function verifySession(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch {
    return null;
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.isProd,
  // Frontend boshqa domenda bo'lsa cross-site cookie kerak bo'ladi.
  sameSite: config.clientOrigin ? "none" : "lax",
  path: "/",
});

// Mavjud seans uchun cookie'ni qayta beradi (masalan token_version oshgach).
export function setSessionCookie(res, user, sid) {
  res.cookie(COOKIE_NAME, signSession(user, sid), { ...cookieOptions(), maxAge: MAX_AGE_MS });
}

const clientInfo = (req) => [String(req.get("user-agent") || "").slice(0, 300), String(req.ip || "").slice(0, 64)];

// Yangi seans: user_sessions'ga qator yoziladi va cookie beriladi.
// method: password | google | qr | reset | legacy
export async function startSession(req, res, user, method, sid = crypto.randomBytes(16).toString("hex")) {
  const [ua, ip] = clientInfo(req);
  // Muddati o'tgan belgilarni tozalash (token 30 kun yashaydi).
  await query("DELETE FROM user_sessions WHERE revoked AND created_at < now() - interval '31 days'");
  await query(
    `INSERT INTO user_sessions (id, user_id, user_agent, ip, method) VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [sid, user.id, ua, ip, method]
  );
  // Shu brauzer avval boshqa seansda bo'lgan bo'lsa (qayta kirish) — eskisi yopiladi.
  if (req.user?.session_id && req.user.session_id !== sid) await endSession(req.user.session_id);
  setSessionCookie(res, user, sid);
  return sid;
}

// Seansni tugatish. 'legacy' qatori o'rniga belgi qoladi (yuqoridagi izoh).
export async function endSession(sid) {
  if (!sid) return;
  await query("UPDATE user_sessions SET revoked = TRUE WHERE id = $1 AND method = 'legacy'", [sid]);
  await query("DELETE FROM user_sessions WHERE id = $1 AND method <> 'legacy'", [sid]);
}

// Eski tokendan olinadigan barqaror seans id'si.
export const legacySid = (token) => crypto.createHash("sha256").update(token).digest("hex").slice(0, 32);

// Joriy seansdan boshqa barchasini o'chiradi (keepSid bo'lmasa — hammasini).
// Faqat token_version oshirilganda chaqiriladi: u eski tokenlarni ham
// bekor qiladi, shuning uchun bu yerda belgi qoldirish shart emas.
export function endOtherSessions(userId, keepSid = null) {
  return query("DELETE FROM user_sessions WHERE user_id = $1 AND id IS DISTINCT FROM $2", [userId, keepSid]);
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}
