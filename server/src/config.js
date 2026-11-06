// Barcha muhit o'zgaruvchilari shu yerda o'qiladi (.env.example'ga qarang).
const isProd = process.env.NODE_ENV === "production";

function required(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (!isProd && devFallback !== undefined) return devFallback;
  throw new Error(`Muhit o'zgaruvchisi topilmadi: ${name}`);
}

// Production'da zaif maxfiy kalit. `fatal` — yangi kalitlar uchun (ishga tushmaydi);
// JWT_SECRET uchun faqat ogohlantirish, aks holda mavjud sayt to'xtab qolardi.
function strongSecret(name, value, { min = 32, fatal = true } = {}) {
  if (isProd && value && value.length < min) {
    const msg = `${name} kamida ${min} belgi bo'lishi kerak (uzun tasodifiy satr qo'ying).`;
    if (fatal) throw new Error(msg);
    console.warn(`[config] OGOHLANTIRISH: ${msg}`);
  }
  return value;
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/prepzone"),
  jwtSecret: strongSecret("JWT_SECRET", required("JWT_SECRET", "dev-only-secret-change-me"), { fatal: false }),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "Prepzone <verify@mail.prep-zone.uz>",
  // Google AI Studio kaliti (admin: savollarni PDF/rasm/matndan import qilish va
  // adaptiv test uchun yangi savol yaratish). Bo'sh bo'lsa AI funksiyalari o'chiq.
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  // Asosiy model band bo'lsa (503) navbat bilan sinaladigan modellar.
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.8-flash,gemini-3.1-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean),
  // Frontend boshqa domenda bo'lsa (masalan Vercel) — shu yerga uning
  // manzili yoziladi. Caddy orqali bitta domenda ishlasa bo'sh qoladi.
  clientOrigin: process.env.CLIENT_ORIGIN || "",
  // Study Room: video brauzerlar orasida P2P; to'g'ridan-to'g'ri ulanib
  // bo'lmasa TURN relay (docker-compose "coturn"). TURN_SECRET coturn'dagi
  // static-auth-secret bilan bir xil. Bo'sh bo'lsa faqat STUN (P2P) ishlaydi.
  turnSecret: process.env.TURN_SECRET || "",
  turnUrls: (process.env.TURN_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean),
  // CSRF tekshiruvi uchun saytning asosiy manzili (middleware/security.js).
  publicUrl: process.env.PUBLIC_URL || "https://prep-zone.uz",
};
