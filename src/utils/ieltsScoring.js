// ------------------------------------------------------------------
// IELTS Listening / Academic Reading baholash.
// Xom ball (0–40) -> band jadvallari IELTS tomonidan e'lon qilingan
// namunaviy jadvallarga asoslangan (haqiqiy imtihonda test versiyasiga
// qarab 1 ballgacha farq qilishi mumkin — shuning uchun "taxminiy").
// ------------------------------------------------------------------

// [minimal to'g'ri javoblar soni, band] — kamayish tartibida.
const LISTENING_TABLE = [
  [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5],
  [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1],
];

const ACADEMIC_READING_TABLE = [
  [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5],
  [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [2, 2], [1, 1],
];

function fromTable(table, raw) {
  for (const [min, band] of table) if (raw >= min) return band;
  return 0;
}

export const listeningBand = (raw) => fromTable(LISTENING_TABLE, raw);
export const readingBand = (raw) => fromTable(ACADEMIC_READING_TABLE, raw);

// IELTS yaxlitlash: .25 -> .5 ga, .75 -> keyingi butunga, qolgani eng yaqin .5 ga pastga.
export function roundBand(value) {
  const whole = Math.floor(value);
  const frac = value - whole;
  if (frac < 0.25) return whole;
  if (frac < 0.75) return whole + 0.5;
  return whole + 1;
}

export function overallBand(bands) {
  const valid = bands.filter((b) => typeof b === "number");
  if (!valid.length) return null;
  return roundBand(valid.reduce((s, b) => s + b, 0) / valid.length);
}

export function formatBand(b) {
  return typeof b === "number" ? b.toFixed(1) : "—";
}

// ---------------- Javoblarni solishtirish ----------------
const NUMBER_WORDS = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7",
  eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12", fifteen: "15", twenty: "20",
};

export function normalizeAnswer(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[£$€]/g, "")
    .replace(/[.,;:!?"]+$/g, "")
    .replace(/^(a|an|the)\s+/, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => NUMBER_WORDS[w] || w)
    .join(" ");
}

export function wordCount(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

// Tanlov turidagi savollar (MCQ, TFNG, matching) — harf/kalit bo'yicha;
// yozma javoblar — `accept` ro'yxati bo'yicha, so'z limitidan oshsa xato.
export function checkAnswer(group, question, value) {
  if (value == null || String(value).trim() === "") return false;
  if (group.type === "gap") {
    if (group.wordLimit && wordCount(String(value).replace(/\d[\d\s]*/g, "N")) > group.wordLimit) {
      return false;
    }
    const v = normalizeAnswer(value);
    const compact = v.replace(/\s+/g, "");
    return question.accept.some((a) => {
      const n = normalizeAnswer(a);
      return n === v || n.replace(/\s+/g, "") === compact;
    });
  }
  return String(value).trim().toUpperCase() === String(question.answer).toUpperCase();
}

export function correctAnswerText(group, question) {
  if (group.type === "gap") return question.accept[0];
  return question.answer;
}

// Bo'lim (listening/reading) bo'yicha barcha savollarni tekis ro'yxatga.
export function flattenQuestions(parts) {
  const out = [];
  parts.forEach((part, partIndex) => {
    part.groups.forEach((group) => {
      group.questions.forEach((q) => out.push({ partIndex, group, q }));
    });
  });
  return out;
}

export function scoreSection(parts, answers) {
  const items = flattenQuestions(parts).map(({ partIndex, group, q }) => ({
    n: q.n,
    partIndex,
    answer: answers[q.n] ?? null,
    correct: checkAnswer(group, q, answers[q.n]),
    expected: correctAnswerText(group, q),
  }));
  const raw = items.filter((i) => i.correct).length;
  return { raw, total: items.length, items };
}
