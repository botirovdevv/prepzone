import { rateLimit, ipKeyGenerator } from "express-rate-limit";

// Login qilgan foydalanuvchi bo'yicha (bo'lmasa IP bo'yicha) so'rov limiti.
// Xabar o'zbekcha — X-Lang: en bo'lsa lib/i18n.js tarjima qiladi.
export function perUserLimit({ windowMs, limit }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => (req.user?.id ? `u:${req.user.id}` : `ip:${ipKeyGenerator(req.ip)}`),
    handler: (_req, res) =>
      res.status(429).json({
        code: "resource-exhausted",
        message: "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.",
      }),
  });
}
