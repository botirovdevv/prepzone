import { dayKey } from "../utils/date";

// ------------------------------------------------------------------
// Rasmiy imtihon kunlari ("YYYY-MM-DD"). Dashboard'dagi countdown
// bugundan keyingi eng yaqin sanani ko'rsatadi.
//
// SAT — College Board, 2026–27 o'quv yili (xalqaro sanalar AQSh bilan bir xil):
//   https://satsuite.collegeboard.org/sat/dates-deadlines
//   Yangi sanalar e'lon qilingach shu ro'yxatga qo'shing.
// ------------------------------------------------------------------

export const SAT_TEST_DATES = [
  "2026-10-03",
  "2026-11-07",
  "2026-12-05",
  "2027-03-06",
  "2027-05-01",
  "2027-06-05",
];

// Bugun (yoki undan keyin) bo'ladigan eng yaqin sana; ro'yxat tugagan bo'lsa null.
export function nextTestDate(from = new Date()) {
  const today = dayKey(from);
  return SAT_TEST_DATES.find((d) => d >= today) || null;
}

// "YYYY-MM-DD" sanagacha bugundan necha kun qolgani (mahalliy vaqt bo'yicha).
export function daysLeft(key, from = new Date()) {
  const [y, m, d] = key.split("-").map(Number);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}
