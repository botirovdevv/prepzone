import jwt from "jsonwebtoken";
import { config } from "../config.js";

// ------------------------------------------------------------------
// Sessiya — httpOnly cookie ichidagi JWT. Brauzer JS kodi uni o'qiy
// olmaydi (XSS'dan himoya). `tv` (token version) foydalanuvchi parolni
// o'zgartirganda oshiriladi — shunda barcha eski sessiyalar bekor bo'ladi.
// ------------------------------------------------------------------

export const COOKIE_NAME = "pz_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 kun

export function signSession(user) {
  return jwt.sign({ sub: user.id, tv: user.token_version }, config.jwtSecret, {
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

export function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, signSession(user), { ...cookieOptions(), maxAge: MAX_AGE_MS });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}
