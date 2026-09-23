// ------------------------------------------------------------------
// To'liq Digital SAT mock testi (Bluebook formatida).
//   Reading & Writing -> 2 modul × 27 savol, har modul 32 daqiqa
//   Math               -> 2 modul × 22 savol, har modul 35 daqiqa
//
// Moslashuvchan (adaptive): Module 1 natijasiga qarab talaba oson yoki
// qiyin Module 2'ga yo'naltiriladi (utils/irtScoring.js). Savollar
// src/data/bluebook/ ichida — rasmiy SAT spetsifikatsiyasi (domenlar,
// qiyinlik taqsimoti, grid-in ulushi) bo'yicha yozilgan original savollar.
// ------------------------------------------------------------------

import { rwModule1 } from "./bluebook/rwModule1";
import { rwModule2Easy, rwModule2Hard } from "./bluebook/rwModule2";
import { mathModule1, mathModule2Easy, mathModule2Hard } from "./bluebook/mathModules";

export const satTest = {
  id: "bluebook-1",
  testTitle: "SAT Practice Test 1",
  groups: [
    {
      id: "rw",
      sectionNumber: 1,
      title: "Reading and Writing",
      durationMin: 32,
      type: "rw",
      module1: { questions: rwModule1 },
      module2Easy: { questions: rwModule2Easy },
      module2Hard: { questions: rwModule2Hard },
    },
    {
      id: "math",
      sectionNumber: 2,
      title: "Math",
      durationMin: 35,
      type: "math",
      calculator: true,
      module1: { questions: mathModule1 },
      module2Easy: { questions: mathModule2Easy },
      module2Hard: { questions: mathModule2Hard },
    },
  ],
};

// Natija sahifasida savollarni ko'rib chiqish uchun: bo'lim, bosqich va
// yo'nalish bo'yicha tegishli savollar ro'yxati.
export function getModuleQuestions(group, stage, route) {
  if (stage === "module1") return group.module1.questions;
  return route === "hard" ? group.module2Hard.questions : group.module2Easy.questions;
}
