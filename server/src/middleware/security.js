import express from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { config } from "../config.js";
import { HttpError } from "../lib/errors.js";

// ------------------------------------------------------------------
// Umumiy himoya qatlamlari: so'rov hajmi, IP bo'yicha limit va CSRF
// (begona saytdan cookie bilan yuborilgan so'rovlarni rad etish).
// ------------------------------------------------------------------

// Rasmli savollar, PDF import va avatar — katta body kerak bo'lgan yo'llar.
const LARGE_BODY = [/^\/api\/admin\//, /^\/api\/question-sets/, /^\/api\/desmos/, /^\/api\/sessions/, /^\/api\/me\/avatar/, /^\/api\/learn\/mistakes\/sync/];

const largeJson = express.json({ limit: "25mb" });
const smallJson = express.json({ limit: "1mb" });

export function jsonBody(req, res, next) {
  const parser = LARGE_BODY.some((re) => re.test(req.path)) ? largeJson : smallJson;
  return parser(req, res, next);
}

// Bitta IP'dan juda ko'p so'rov (skreping, DoS) — 1 daqiqada 600 tagacha.
// 200 talaba bitta o'quv markazi NAT'idan kirishi mumkin, shuning uchun keng.
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skip: (req) => req.path === "/api/health",
  handler: (_req, res) =>
    res.status(429).json({ code: "resource-exhausted", message: "Juda ko'p so'rov. Birozdan keyin urinib ko'ring." }),
});

function allowedOrigins() {
  const list = [config.publicUrl, config.clientOrigin].filter(Boolean).map((u) => new URL(u).origin);
  if (!config.isProd) list.push("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173");
  // www.prep-zone.uz Caddy'da asosiy domenga yo'naltiriladi, lekin baribir ruxsat.
  for (const o of [...list]) {
    const u = new URL(o);
    if (!u.hostname.startsWith("www.")) list.push(`${u.protocol}//www.${u.host}`);
  }
  return new Set(list);
}
let origins = null;

function requestOrigin(req) {
  const origin = req.get("origin");
  if (origin) return origin;
  try {
    return req.get("referer") ? new URL(req.get("referer")).origin : null;
  } catch {
    return "invalid";
  }
}

// CSRF: cookie bilan ishlaydigan o'zgartiruvchi so'rovlar faqat o'z saytimizdan.
// Brauzer cross-site POST'da doim Origin yuboradi; Origin yo'q so'rovlar
// (curl, server-to-server) cookie'siz bo'ladi, ularni sessiya himoya qiladi.
export function originCheck(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = requestOrigin(req);
  if (!origin) return next();
  origins ||= allowedOrigins();
  if (!origins.has(origin)) {
    throw new HttpError(403, "permission-denied", "So'rov boshqa saytdan yuborilgan.");
  }
  next();
}
