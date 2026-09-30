import { dayKey } from "../utils/date";

// ------------------------------------------------------------------
// Rasmiy imtihon kunlari ("YYYY-MM-DD"). Dashboard'dagi countdown
// bugundan keyingi eng yaqin sanani ko'rsatadi.
//
// SAT — College Board, 2026–27 o'quv yili (xalqaro sanalar AQSh bilan bir xil):
//   https://satsuite.collegeboard.org/sat/dates-deadlines
// IELTS — rasmiy fixed (paper-based) sanalar, 2026:
//   https://ielts.idp.com/news-ielts-test-dates
//   2027 sanalari e'lon qilingach shu ro'yxatga qo'shing.
// ------------------------------------------------------------------

export const TEST_DATES = {
  sat: [
    "2026-10-03",
    "2026-11-07",
    "2026-12-05",
    "2027-03-06",
    "2027-05-01",
    "2027-06-05",
  ],
  ielts: [
    "2026-10-02",
    "2026-10-07",
    "2026-10-16",
    "2026-10-23",
    "2026-10-30",
    "2026-11-04",
    "2026-11-13",
    "2026-11-20",
    "2026-11-27",
    "2026-12-02",
    "2026-12-04",
    "2026-12-11",
  ],
};

// Bugun (yoki undan keyin) bo'ladigan eng yaqin sana; ro'yxat tugagan bo'lsa null.
export function nextTestDate(exam, from = new Date()) {
  const today = dayKey(from);
  return (TEST_DATES[exam] || []).find((d) => d >= today) || null;
}

// "YYYY-MM-DD" sanagacha bugundan necha kun qolgani (mahalliy vaqt bo'yicha).
export function daysLeft(key, from = new Date()) {
  const [y, m, d] = key.split("-").map(Number);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((new Date(y, m - 1, d) - today) / 86400000);
}
