// ------------------------------------------------------------------
// To'liq SAT mock test — har modulda REAL Digital SAT bilan bir xil
// savollar soni:
//   Reading & Writing -> har modulda 27 ta savol
//   Math               -> har modulda 22 ta savol
//
// Savollar src/data/rwBank.js (Reading & Writing) va
// src/data/mathGenerator.js (Math, hisoblanadigan generator) fayllaridan
// yig'iladi.
// ------------------------------------------------------------------

import { buildRWModule1, buildRWModule2Easy, buildRWModule2Hard } from "./rwBank";
import {
  buildMathModule1,
  buildMathModule2Easy,
  buildMathModule2Hard,
} from "./mathGenerator";

export const satTest = {
  testTitle: "SAT Practice Test 1",
  groups: [
    {
      id: "rw",
      sectionNumber: 1,
      title: "Reading and Writing",
      durationMin: 32,
      type: "rw",
      module1: { questions: buildRWModule1() },
      module2Easy: { questions: buildRWModule2Easy() },
      module2Hard: { questions: buildRWModule2Hard() },
    },
    {
      id: "math",
      sectionNumber: 2,
      title: "Math",
      durationMin: 35,
      type: "math",
      calculator: true,
      module1: { questions: buildMathModule1() },
      module2Easy: { questions: buildMathModule2Easy() },
      module2Hard: { questions: buildMathModule2Hard() },
    },
  ],
};
