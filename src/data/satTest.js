// ------------------------------------------------------------------
// To'liq Digital SAT mock testlari (Bluebook formatida).
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
import { t2RwModule1 } from "./bluebook/test2/rwModule1";
import { t2RwModule2Easy, t2RwModule2Hard } from "./bluebook/test2/rwModule2";
import { t2MathModule1, t2MathModule2Easy, t2MathModule2Hard } from "./bluebook/test2/mathModules";

function buildTest(id, testTitle, rw, math) {
  return {
    id,
    testTitle,
    groups: [
      {
        id: "rw",
        sectionNumber: 1,
        title: "Reading and Writing",
        durationMin: 32,
        type: "rw",
        module1: { questions: rw[0] },
        module2Easy: { questions: rw[1] },
        module2Hard: { questions: rw[2] },
      },
      {
        id: "math",
        sectionNumber: 2,
        title: "Math",
        durationMin: 35,
        type: "math",
        calculator: true,
        module1: { questions: math[0] },
        module2Easy: { questions: math[1] },
        module2Hard: { questions: math[2] },
      },
    ],
  };
}

export const SAT_TESTS = {
  "bluebook-1": buildTest(
    "bluebook-1",
    "SAT Practice Test 1",
    [rwModule1, rwModule2Easy, rwModule2Hard],
    [mathModule1, mathModule2Easy, mathModule2Hard]
  ),
  "bluebook-2": buildTest(
    "bluebook-2",
    "SAT Practice Test 2",
    [t2RwModule1, t2RwModule2Easy, t2RwModule2Hard],
    [t2MathModule1, t2MathModule2Easy, t2MathModule2Hard]
  ),
};

export const DEFAULT_TEST_ID = "bluebook-1";

// Noma'lum yoki eski (testId saqlanmagan) natijalar uchun 1-testga qaytadi.
export function getSatTest(id) {
  return SAT_TESTS[id] || SAT_TESTS[DEFAULT_TEST_ID];
}

// Natija sahifasida savollarni ko'rib chiqish uchun: bo'lim, bosqich va
// yo'nalish bo'yicha tegishli savollar ro'yxati.
export function getModuleQuestions(group, stage, route) {
  if (stage === "module1") return group.module1.questions;
  return route === "hard" ? group.module2Hard.questions : group.module2Easy.questions;
}
