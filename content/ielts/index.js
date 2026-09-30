// To'liq IELTS testlari (javob kalitlari bilan) — FAQAT server va build
// skripti uchun. Brauzer bundle'iga kirmaydi: client
// src/data/generated/ ichidagi kalitsiz nusxadan foydalanadi.
// Yangi test: test1.js formatida fayl yozib, shu ro'yxatga qo'shing.
import test1 from "./test1.js";

export const IELTS_TESTS = [test1];

export function getIeltsTest(id) {
  return IELTS_TESTS.find((t) => t.id === id) || null;
}
