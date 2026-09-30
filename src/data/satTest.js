// ------------------------------------------------------------------
// Digital SAT mock testlari (Bluebook formatida) — brauzer uchun.
//   Reading & Writing -> 2 modul × 27 savol, har modul 32 daqiqa
//   Math               -> 2 modul × 22 savol, har modul 35 daqiqa
//
// Savollar content/sat/ ichida yoziladi; bu yerda esa build paytida
// yaratilgan KALITSIZ nusxa (src/data/generated/sat/*.json) ishlatiladi.
// To'g'ri javoblar, routing (oson/qiyin Module 2) va ball hisoblash
// serverda (api/sat/*). Har test alohida chunk — faqat ochilganda yuklanadi.
// ------------------------------------------------------------------

const loaders = import.meta.glob("./generated/sat/*.json", { import: "default" });

export const DEFAULT_TEST_ID = "bluebook-1";

const path = (id) => `./generated/sat/${id}.json`;

// Noma'lum yoki eski (testId saqlanmagan) natijalar uchun 1-testga qaytadi.
export function loadSatTest(id) {
  const load = loaders[path(id)] || loaders[path(DEFAULT_TEST_ID)];
  return load();
}

// Bo'lim, bosqich va yo'nalish bo'yicha tegishli savollar ro'yxati.
export function getModuleQuestions(group, stage, route) {
  if (stage === "module1") return group.module1.questions;
  return route === "hard" ? group.module2Hard.questions : group.module2Easy.questions;
}
