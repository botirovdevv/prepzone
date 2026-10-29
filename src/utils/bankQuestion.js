import { newQuestionId } from "./questionId.js";

// ------------------------------------------------------------------
// Admin savollarining umumiy maydonlari: savol banki (server/question-bank)
// va AI importidan kelgan savollarni sessiya formatiga o'tkazish.
// `difficulty` IRT bahosi va Module 2 yo'naltirishi uchun kerak
// (src/utils/irtScoring.js → DIFFICULTY_B).
// ------------------------------------------------------------------

export const DIFFICULTIES = [
  { id: "easy", label: "Oson", short: "E" },
  { id: "medium", label: "O'rta", short: "M" },
  { id: "hard", label: "Qiyin", short: "H" },
];

const LEGACY = { E: "easy", M: "medium", H: "hard" };

// "E"/"M"/"H", "easy"/"oson" va h.k. → easy | medium | hard (noma'lum bo'lsa medium).
export function normalizeDifficulty(value) {
  const v = String(value || "").trim();
  if (LEGACY[v]) return LEGACY[v];
  const lower = v.toLowerCase();
  if (["easy", "oson"].includes(lower)) return "easy";
  if (["hard", "qiyin"].includes(lower)) return "hard";
  return "medium";
}

// Savol banki yozuvi → sessiya savoli.
export function fromBank(q) {
  return {
    id: newQuestionId(),
    passage: q.passage || "",
    prompt: q.prompt,
    choices: q.choices,
    correctAnswer: q.correctAnswer,
    image: null,
    domain: q.domain || "",
    skill: q.skill || "",
    difficulty: normalizeDifficulty(q.difficulty),
    sourceId: q.sourceId,
  };
}
