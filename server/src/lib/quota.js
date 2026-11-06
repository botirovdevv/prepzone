import { dayKey } from "./limits.js";
import { HttpError } from "./errors.js";

// ------------------------------------------------------------------
// AI tutor uchun kunlik adolatli limit (hamma uchun bir xil). Gemini
// so'rovlari pullik/kvotali, shuning uchun bitta foydalanuvchi butun
// kunlik kvotani sarflab qo'ymasin. Hisob Toshkent kuni bo'yicha.
// ------------------------------------------------------------------

export const AI_PER_DAY = 30;

export async function aiQuota(client, user) {
  const { rows } = await client.query(
    "SELECT count FROM rate_limits WHERE day = $1 AND user_id = $2 AND action = 'aiTutor'",
    [dayKey(), user.id]
  );
  const used = rows[0]?.count || 0;
  return { limit: AI_PER_DAY, used, remaining: Math.max(AI_PER_DAY - used, 0) };
}

// Limit tugagan bo'lsa 429, aks holda hisoblagichni oshiradi.
export async function consumeAi(client, user) {
  const { rows } = await client.query(
    `INSERT INTO rate_limits (day, user_id, action, count) VALUES ($1, $2, 'aiTutor', 1)
     ON CONFLICT (day, user_id, action) DO UPDATE SET count = rate_limits.count + 1
     RETURNING count`,
    [dayKey(), user.id]
  );
  if (rows[0].count > AI_PER_DAY) {
    await client.query(
      "UPDATE rate_limits SET count = count - 1 WHERE day = $1 AND user_id = $2 AND action = 'aiTutor'",
      [dayKey(), user.id]
    );
    throw new HttpError(429, "resource-exhausted", "Bugungi AI tushuntirishlar limiti tugadi, ertaga davom eting.");
  }
}
