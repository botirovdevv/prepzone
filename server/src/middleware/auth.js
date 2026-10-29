import { one, query } from "../db/index.js";
import { COOKIE_NAME, verifySession, startSession, legacySid } from "../lib/session.js";
import { forbidden, unauthorized, HttpError } from "../lib/errors.js";
import { hasPerm } from "../lib/permissions.js";

// Token'dan foydalanuvchini topadi. Har so'rovda DB'dan o'qiladi —
// admin huquqi olib tashlansa, user bloklansa yoki parol o'zgarsa darhol
// kuchga kiradi.
//
// `sid` bo'lsa seans qatori ham bo'lishi shart — u "Faol seanslar"dan
// tugatilgan bo'lsa token yaroqsiz. `sid`siz eski tokenlar (sessiyalar
// jadvalidan oldingi) hali ham ishlaydi; loadUser ularni yangilab qo'yadi.
const SEEN_EVERY_MS = 5 * 60 * 1000;

export async function userFromToken(token) {
  const payload = token && verifySession(token);
  if (!payload) return null;
  const user = payload.sid
    ? await one(
        `SELECT u.*, s.id AS session_id, s.last_seen_at AS session_seen_at
         FROM users u JOIN user_sessions s ON s.user_id = u.id AND s.id = $2 AND NOT s.revoked
         WHERE u.id = $1`,
        [payload.sub, payload.sid]
      )
    : await one(
        `SELECT u.* FROM users u
         WHERE u.id = $1 AND NOT EXISTS (SELECT 1 FROM user_sessions WHERE id = $2 AND revoked)`,
        [payload.sub, legacySid(token)]
      );
  if (!user || user.token_version !== payload.tv || user.blocked_at) return null;
  if (user.session_id && Date.now() - new Date(user.session_seen_at).getTime() > SEEN_EVERY_MS) {
    query("UPDATE user_sessions SET last_seen_at = now() WHERE id = $1", [user.session_id]).catch(() => {});
  }
  return user;
}

export async function loadUser(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  req.user = await userFromToken(token);
  if (req.user && !req.user.session_id) {
    // Eski token: bir martalik seans qatori yaratib, yangi cookie beramiz.
    // sid tokendan olinadi — parallel so'rovlar bitta qator yaratadi.
    req.user.session_id = await startSession(req, res, req.user, "legacy", legacySid(token));
  }
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

// Admin bo'limi ruxsati: sanab o'tilganlardan kamida bittasi bo'lsa yetadi.
export function requirePerm(...perms) {
  return (req, _res, next) => {
    if (!req.user) throw unauthorized();
    if (!perms.some((p) => hasPerm(req.user, p))) throw forbidden();
    next();
  };
}

export function requireOwner(req, _res, next) {
  if (!req.user) throw unauthorized();
  if (!req.user.is_owner) throw forbidden();
  next();
}
