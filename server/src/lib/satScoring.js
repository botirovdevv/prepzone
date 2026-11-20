// ------------------------------------------------------------------
// SAT ball hisoblash — serverda, javob kalitlari bilan.
// Statik (content/sat) testlar ham, admin sessiyalari ham bir xil IRT
// mantiqidan o'tadi (src/utils/irtScoring.js).
//
// "Bo'lim" (section) shakli: { id, module1, module2Easy, module2Hard,
// module2Mixed? } — har biri savollar massivi.
// ------------------------------------------------------------------
// Docker image'da ham repo tuzilishi saqlanadi (/repo/server, /repo/content,
// /repo/src/utils) — shuning uchun yo'llar lokal va serverda bir xil.
import { SAT_TESTS } from "../../../content/sat/index.js";
import {
  buildResponses,
  decideRouteIrt,
  hasRawCurve,
  isAnswerCorrect,
  rawToScaled,
  scoreSection,
} from "../../../src/utils/irtScoring.js";

const nonEmpty = (arr) => Array.isArray(arr) && arr.length > 0;

// Javoblar massivi: faqat qisqa satr yoki null, uzunligi savollar soniga teng.
export function cleanAnswers(arr, length) {
  const src = Array.isArray(arr) ? arr : [];
  return Array.from({ length }, (_, i) => {
    const v = src[i];
    return typeof v === "string" && v.length <= 40 ? v : null;
  });
}

// Brauzerga yuboriladigan nusxa — faqat ruxsat etilgan maydonlar (allow-list).
// Kalitlar (correctAnswer, answers, explanation), admin izohlari (aiNote,
// issues) va manba identifikatorlari (sourceId) hech qachon talabaga bormaydi;
// kelajakda qo'shiladigan yangi maydon ham avtomatik yashirin bo'ladi.
const PUBLIC_KEYS = ["id", "type", "html", "passage", "prompt", "image", "domain", "skill", "difficulty"];
const MODULE_KEYS = ["module1", "module2Easy", "module2Hard", "module2Mixed"];

export function stripQuestion(q) {
  const out = {};
  for (const k of PUBLIC_KEYS) if (q[k] !== undefined) out[k] = q[k];
  if (Array.isArray(q.choices)) out.choices = q.choices.map((c) => ({ label: c.label, text: c.text }));
  return out;
}

export function stripSections(sections) {
  return (sections || []).map((s) => {
    const out = { ...s };
    for (const k of MODULE_KEYS) if (Array.isArray(s[k])) out[k] = s[k].map(stripQuestion);
    return out;
  });
}

export function getStaticSections(testId) {
  const test = SAT_TESTS[testId];
  if (!test) return null;
  return {
    test,
    sections: test.groups.map((g) => ({
      id: g.id,
      module1: g.module1.questions,
      module2Easy: g.module2Easy.questions,
      module2Hard: g.module2Hard.questions,
    })),
  };
}

export const hasModule2 = (s) => nonEmpty(s.module2Mixed) || nonEmpty(s.module2Easy) || nonEmpty(s.module2Hard);

// Module 1 javoblaridan Module 2 yo'nalishi. Aralash to'plam yoki Module 2
// yo'q bo'lsa — null (yo'naltirish kerak emas).
export function routeFor(section, module1Answers) {
  if (!hasModule2(section) || nonEmpty(section.module2Mixed)) return null;
  const answers = cleanAnswers(module1Answers, section.module1.length);
  return decideRouteIrt(section.module1, answers);
}

// Tanlangan yo'nalishdagi to'plam bo'sh bo'lsa — mavjud yagona to'plam.
export function module2For(section, route) {
  if (nonEmpty(section.module2Mixed)) return section.module2Mixed;
  const preferred = route === "hard" ? section.module2Hard : section.module2Easy;
  if (nonEmpty(preferred)) return preferred;
  return nonEmpty(section.module2Hard) ? section.module2Hard : section.module2Easy || [];
}

function addDomainStats(stats, questions, answers) {
  questions.forEach((q, i) => {
    if (!q.domain) return;
    const s = stats[q.domain] || (stats[q.domain] = [0, 0]);
    s[1] += 1;
    if (isAnswerCorrect(q, answers[i])) s[0] += 1;
  });
}

const countCorrect = (questions, answers) =>
  questions.reduce((n, q, i) => n + (isAnswerCorrect(q, answers[i]) ? 1 : 0), 0);

// attempt: { module1Answers, module2Answers? }. Yo'nalishni client'dan
// olmaymiz — Module 1 javoblaridan qayta hisoblanadi.
export function scoreSectionAttempt(section, attempt) {
  const m1Answers = cleanAnswers(attempt?.module1Answers, section.module1.length);
  const multi = hasModule2(section);
  const route = multi ? routeFor(section, m1Answers) : null;
  const m2Questions = multi ? module2For(section, route) : [];
  const reachedM2 = multi && Array.isArray(attempt?.module2Answers);
  const m2Answers = reachedM2 ? cleanAnswers(attempt.module2Answers, m2Questions.length) : null;

  const responses = buildResponses(section.module1, m1Answers);
  if (reachedM2) responses.push(...buildResponses(m2Questions, m2Answers));

  const domains = {};
  addDomainStats(domains, section.module1, m1Answers);
  if (reachedM2) addDomainStats(domains, m2Questions, m2Answers);

  // Moslashuvchan (easy/hard) testda — IRT; bitta Module 2 yoki bitta
  // modulli testda — raw jadval (irtScoring.js dagi izohga qarang).
  const adaptive = multi && route != null;
  const totalQuestions = section.module1.length + m2Questions.length;
  const totalCorrect = responses.reduce((n, r) => n + (r.correct ? 1 : 0), 0);
  const scaledScore =
    !adaptive && hasRawCurve(section.id)
      ? rawToScaled(section.id, totalCorrect, totalQuestions)
      : scoreSection(responses);

  const result = {
    module1Correct: countCorrect(section.module1, m1Answers),
    module1Total: section.module1.length,
    module1Answers: m1Answers,
    scaledScore,
    rawCorrect: totalCorrect,
    rawTotal: totalQuestions,
    domains,
  };
  if (multi) result.route = route ?? "mixed";
  else result.singleModule = true;
  if (reachedM2) {
    result.module2Correct = countCorrect(m2Questions, m2Answers);
    result.module2Total = m2Questions.length;
    result.module2Answers = m2Answers;
  }
  if (multi && !reachedM2) result.incomplete = true;
  return result;
}

// attempts: { [sectionId]: { module1Answers, module2Answers? } }.
// Boshlanmagan bo'limlar natijaga kirmaydi.
export function scoreAttempt(sections, attempts, { terminated = false } = {}) {
  const results = {};
  for (const section of sections) {
    const a = attempts?.[section.id];
    if (!a || !Array.isArray(a.module1Answers)) continue;
    const r = scoreSectionAttempt(section, a);
    if (terminated) r.incomplete = true;
    results[section.id] = r;
  }
  const total = Object.values(results).reduce((s, r) => s + r.scaledScore, 0);
  const complete =
    !terminated &&
    sections.length > 0 &&
    sections.every((s) => results[s.id] && !results[s.id].incomplete);
  return { results, total, complete };
}

// Natija sahifasida ko'rib chiqish uchun kalitlar: { [questionId]: {...} }.
export function reviewKeys(sections) {
  const keys = {};
  for (const s of sections) {
    for (const list of [s.module1, s.module2Easy, s.module2Hard, s.module2Mixed]) {
      for (const q of list || []) {
        keys[q.id] = {
          correctAnswer: q.correctAnswer ?? null,
          ...(q.answers ? { answers: q.answers } : {}),
          ...(q.explanation ? { explanation: q.explanation } : {}),
        };
      }
    }
  }
  return keys;
}
