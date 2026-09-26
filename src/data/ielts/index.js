import test1 from "./test1";

// Yangi IELTS test qo'shish: test1.js formatida fayl yozib, shu ro'yxatga qo'shing.
export const IELTS_TESTS = [test1];

export function getIeltsTest(id) {
  return IELTS_TESTS.find((t) => t.id === id) || null;
}

// Bo'limlar va ularning vaqti (daqiqa). Listening uchun vaqt audio
// davomiyligiga bog'liq; bu yerda — audio + tekshirish uchun yuqori chegara.
export const IELTS_SECTIONS = {
  listening: { key: "listening", label: "Listening", minutes: 32, questions: 40 },
  reading: { key: "reading", label: "Reading", minutes: 60, questions: 40 },
  writing: { key: "writing", label: "Writing", minutes: 60, questions: 2 },
};

export const SECTION_ORDER = ["listening", "reading", "writing"];

export function sectionsFor(mode) {
  return mode === "full" ? SECTION_ORDER : [mode];
}
