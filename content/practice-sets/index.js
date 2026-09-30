// ------------------------------------------------------------------
// "Exam questions" bo'limi uchun oylik SAT amaliyot to'plamlari
// (2026-yil imtihon sanalari bo'yicha). Har bir to'plam:
//   - shu papkadagi original savollar (12 RW + 10 Math), rasmiy Digital
//     SAT domen/skill taqsimotiga mos yozilgan;
//   - server/question-bank/ dan har oy uchun alohida (takrorlanmaydigan)
//     tanlangan savollar — scripts/seed-practice-sets.mjs qo'shadi.
// Real imtihon savollari (maxfiy test materiali) bu yerda YO'Q.
// ------------------------------------------------------------------
import * as mar from "./march-2026.js";
import * as may from "./may-2026.js";
import * as jun from "./june-2026.js";
import * as aug from "./august-2026.js";
import * as sep from "./september-2026.js";

const month = (id, examDate, label, mod) => ({
  id,
  examDate,
  title: `SAT ${label} 2026`,
  description: `${examDate} imtihoni uchun amaliyot to'plami — yangi savollar va College Board Question Bank`,
  rw: mod.rw,
  math: mod.math,
});

// Firestore hujjat id'lari barqaror — skriptni qayta ishga tushirish
// dublikat yaratmaydi, faqat shu to'plamlarni yangilaydi.
export const PRACTICE_SETS = [
  month("sat-2026-03", "2026-03-14", "March", mar),
  month("sat-2026-05", "2026-05-02", "May", may),
  month("sat-2026-06", "2026-06-06", "June", jun),
  month("sat-2026-08", "2026-08-22", "August", aug),
  month("sat-2026-09", "2026-09-12", "September", sep),
];

// Har bir to'plamga question bank'dan qo'shiladigan savollar soni (domen bo'yicha).
export const BANK_QUOTA = {
  rw: { "info-ideas": 3, "craft-structure": 3, "expression": 2, "conventions": 2 },
  math: { "algebra": 2, "advanced-math": 2, "problem-solving-data": 2, "geometry-trig": 2 },
};
