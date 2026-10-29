// ------------------------------------------------------------------
// Tayyor (statik) mock testlar ro'yxati. Bular admin panelidan
// qo'shiladigan "Doimiy ochiq" testlar bilan birga TestSelect
// sahifasida ko'rsatiladi. `id` — content/sat/index.js dagi SAT_TESTS kaliti.
// Hozircha bo'sh: barcha testlar admin panelidan qo'shiladi.
// ------------------------------------------------------------------

export const testsCatalog = [];

// Olib tashlangan statik testlar — eski natijalar nomi bilan ko'rinsin.
const RETIRED_TITLES = {
  "bluebook-1": "SAT Practice Test 1",
  "bluebook-2": "SAT Practice Test 2",
};

// Faqat nom kerak bo'lgan joylar uchun (Dashboard, History, Results) — og'ir
// test ma'lumotlarini (data/satTest.js) yuklamaslik uchun. testId saqlanmagan
// eski natijalar birinchi testniki edi.
export function getSatTestTitle(id) {
  return testsCatalog.find((t) => t.id === id)?.title || RETIRED_TITLES[id || "bluebook-1"] || "SAT mock test";
}
