import { HttpError } from "./errors.js";

// Kun kaliti "YYYY-MM-DD" — Toshkent vaqti (UTC+5) bo'yicha, server UTC'da ishlaydi.
export function dayKey(date = new Date()) {
  return new Date(date.getTime() + 5 * 3600_000).toISOString().slice(0, 10);
}

// Oddiy kunlik limit: shu kunda amal `limit` martadan oshsa — 429.
// `client` — tranzaksiya ichida ishlatish uchun (pool yoki tx client).
export async function consumeDaily(client, userId, action, limit, message) {
  const { rows } = await client.query(
    `INSERT INTO rate_limits (day, user_id, action, count) VALUES ($1, $2, $3, 1)
     ON CONFLICT (day, user_id, action) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [dayKey(), userId, action]
  );
  if (rows[0].count > limit) {
    throw new HttpError(429, "resource-exhausted", message || "Bugungi limit tugadi, ertaga qayta urinib ko'ring.");
  }
}
