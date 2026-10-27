import { one } from "../db/index.js";
import { COOKIE_NAME, verifySession } from "../lib/session.js";
import { forbidden, unauthorized, HttpError } from "../lib/errors.js";

// Token'dan foydalanuvchini topadi. Har so'rovda DB'dan o'qiladi —
// admin huquqi olib tashlansa yoki parol o'zgarsa darhol kuchga kiradi.
export async function userFromToken(token) {
  const payload = token && verifySession(token);
  if (!payload) return null;
  const user = await one("SELECT * FROM users WHERE id = $1", [payload.sub]);
  if (!user || user.token_version !== payload.tv) return null;
  return user;
}

export async function loadUser(req, _res, next) {
  req.user = await userFromToken(req.cookies?.[COOKIE_NAME]);
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) throw unauthorized();
  next();
}

// Ilova ma'lumotlariga faqat emailni tasdiqlagan foydalanuvchi kira oladi
// (avval bu faqat frontenddagi ProtectedRoute'da tekshirilardi).
export function requireVerified(req, _res, next) {
  if (!req.user) throw unauthorized();
  if (!req.user.email_verified) {
    throw new HttpError(403, "auth/email-not-verified", "Avval emailingizni tasdiqlang.");
  }
  next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user) throw unauthorized();
  if (!req.user.is_admin) throw forbidden();
  next();
}
