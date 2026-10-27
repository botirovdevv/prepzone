// Barcha muhit o'zgaruvchilari shu yerda o'qiladi (.env.example'ga qarang).
const isProd = process.env.NODE_ENV === "production";

function required(name, devFallback) {
  const value = process.env[name];
  if (value) return value;
  if (!isProd && devFallback !== undefined) return devFallback;
  throw new Error(`Muhit o'zgaruvchisi topilmadi: ${name}`);
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/prepzone"),
  jwtSecret: required("JWT_SECRET", "dev-only-secret-change-me"),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.FROM_EMAIL || "Prepzone <verify@mail.prep-zone.uz>",
  // Frontend boshqa domenda bo'lsa (masalan Vercel) — shu yerga uning
  // manzili yoziladi. Caddy orqali bitta domenda ishlasa bo'sh qoladi.
  clientOrigin: process.env.CLIENT_ORIGIN || "",
};
