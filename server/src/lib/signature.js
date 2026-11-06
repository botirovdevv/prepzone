import { createHmac, timingSafeEqual } from "node:crypto";

// ------------------------------------------------------------------
// SMS-agent so'rovlari imzosi. Token tarmoqda yuborilmaydi: agent har
// so'rovni HMAC-SHA256(token, "<ts>.<METHOD> <path>.<body>") bilan imzolaydi.
// Eski (±5 daqiqadan) yoki o'zgartirilgan so'rov qabul qilinmaydi.
// sms-agent/app/src/main/java/uz/prepzone/smsagent/Api.kt bilan bir xil.
// ------------------------------------------------------------------

export const MAX_SKEW_MS = 5 * 60 * 1000;

export function signPayload(secret, ts, method, path, body = "") {
  return createHmac("sha256", secret).update(`${ts}.${method.toUpperCase()} ${path}.${body}`).digest("hex");
}

// true — imzo to'g'ri va yangi.
export function verifySignature(secret, { ts, signature, method, path, body }, now = Date.now()) {
  if (!secret || !ts || !signature) return false;
  const t = Number(ts);
  if (!Number.isFinite(t) || Math.abs(now - t) > MAX_SKEW_MS) return false;
  if (!/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(signPayload(secret, String(ts), method, path, body), "hex");
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}
