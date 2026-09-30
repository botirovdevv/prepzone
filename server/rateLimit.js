import { adminDb, FieldValue, HttpError } from "./firebaseAdmin.js";

// Oddiy kunlik limit: rateLimits/{kun}_{uid} hujjatida har amal uchun
// hisoblagich (faqat server o'qiydi/yozadi). Kun — Toshkent vaqti bo'yicha.
export function todayKey(date = new Date()) {
  return new Date(date.getTime() + 5 * 3600_000).toISOString().slice(0, 10);
}

export async function consumeDaily(uid, action, limit, message) {
  const ref = adminDb().doc(`rateLimits/${todayKey()}_${uid}`);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const used = snap.exists ? snap.data()[action] || 0 : 0;
    if (used >= limit) throw new HttpError(429, message || "Bugungi limit tugadi, ertaga qayta urinib ko'ring");
    tx.set(ref, { [action]: FieldValue.increment(1), uid }, { merge: true });
  });
}
