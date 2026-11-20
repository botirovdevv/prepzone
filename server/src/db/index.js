import pg from "pg";
import { config } from "../config.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  // Bir vaqtda ~200 talaba: so'rovlar navbatda kutib qolmasin.
  max: Number(process.env.PG_POOL_MAX) || 20,
});

// Bo'sh turgan ulanish uzilsa (Postgres qayta ishga tushdi, tarmoq uzildi)
// pool 'error' chiqaradi — handler bo'lmasa butun API jarayoni yiqiladi.
// Pool o'sha ulanishni o'zi tashlab yuboradi, keyingi so'rov yangisini ochadi.
pool.on("error", (err) => {
  console.error("[db] bo'sh ulanishda xato:", err.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

// Bir nechta so'rovni bitta tranzaksiyada bajarish.
export async function tx(fn) {
  const client = await pool.connect();
  let result;
  try {
    await client.query("BEGIN");
    result = await fn(client);
    await client.query("COMMIT");
  } catch (err) {
    // ROLLBACK ham yiqilsa (ulanish uzilgan) — buzilgan ulanish pool'ga qaytmaydi.
    let broken = null;
    await client.query("ROLLBACK").catch((e) => (broken = e));
    client.release(broken || undefined);
    throw err;
  }
  client.release();
  return result;
}
