// ------------------------------------------------------------------
// Statik (repo ichidagi) Digital SAT mock testlari — FAQAT server (api/) va
// scripts/build-content.mjs uchun; brauzerga kirmaydi.
//   Reading & Writing -> 2 modul × 27 savol, har modul 32 daqiqa
//   Math               -> 2 modul × 22 savol, har modul 35 daqiqa
//
// Moslashuvchan (adaptive): Module 1 natijasiga qarab talaba oson yoki
// qiyin Module 2'ga yo'naltiriladi. "SAT Practice Test 1/2" (bluebook-1/2)
// olib tashlangan; boshqa to'liq testlar admin panelidan "Doimiy ochiq"
// sessiya sifatida qo'shiladi.
//
// Practice Mock 3 (test3/) — savol turlari, tartibi va qiyinligi March 2026
// testi tuzilishiga mos; matnlar, sonlar va shartlar o'zgartirilgan.
// ------------------------------------------------------------------

import { t3RwModule1 } from "./test3/rwModule1.js";
import { t3RwModule2Easy, t3RwModule2Hard } from "./test3/rwModule2.js";
import { t3MathModule1, t3MathModule2Easy, t3MathModule2Hard } from "./test3/mathModules.js";

function buildTest(id, testTitle, rw, math) {
  const group = (gid, sectionNumber, title, durationMin, mods, extra = {}) => ({
    id: gid,
    sectionNumber,
    title,
    durationMin,
    type: gid,
    ...extra,
    module1: { questions: mods[0] },
    module2Easy: { questions: mods[1] },
    module2Hard: { questions: mods[2] },
  });
  return {
    id,
    testTitle,
    groups: [
      group("rw", 1, "Reading and Writing", 32, rw),
      group("math", 2, "Math", 35, math, { calculator: true }),
    ],
  };
}

export const SAT_TESTS = {
  "bluebook-3": buildTest(
    "bluebook-3",
    "SAT Practice Test 3",
    [t3RwModule1, t3RwModule2Easy, t3RwModule2Hard],
    [t3MathModule1, t3MathModule2Easy, t3MathModule2Hard]
  ),
};

// Natija sahifasida savollarni ko'rib chiqish uchun: bo'lim, bosqich va
// yo'nalish bo'yicha tegishli savollar ro'yxati.
export function getModuleQuestions(group, stage, route) {
  if (stage === "module1") return group.module1.questions;
  return route === "hard" ? group.module2Hard.questions : group.module2Easy.questions;
}
