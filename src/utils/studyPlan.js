import { MATH_DOMAINS } from "../data/mathDomains";
import { RW_DOMAINS } from "../data/rwPromptTemplates";
import { dayKey } from "./date";

// ------------------------------------------------------------------
// Study Plan: userning sozlamalari va mock natijalaridan kunlik
// vazifalar ro'yxatini tuzadi. `buildWeek` deterministik (bir xil
// ma'lumot -> bir xil reja); AI (Gemini) rejasi bo'lsa, `mergeAiWeek`
// uning kunlarini shu asosga qo'yadi (dam olish/imtihon kunlari o'zgarmaydi).
//
// settings: { examDate: "YYYY-MM-DD", targetScore, dailyMinutes,
//             restDays: [0..6] (Date.getDay), mockDay: 0..6 }
// ------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
export const WEAK_ACCURACY = 0.7;
const MIN_QUESTIONS = 3;
const VOCAB_MINUTES = 10;
const MOCK_MINUTES = 134;

export const DEFAULT_SETTINGS = {
  examDate: "",
  targetScore: 1400,
  dailyMinutes: 60,
  restDays: [0],
  mockDay: 6,
};

const DOMAINS = [
  ...MATH_DOMAINS.map((d) => ({ ...d, subject: "math" })),
  ...RW_DOMAINS.map((d) => ({ ...d, subject: "rw" })),
];
const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d]));

// Math va RW navbatma-navbat keladigan standart tartib (zaif mavzu yo'q bo'lsa).
const DEFAULT_ROTATION = MATH_DOMAINS.flatMap((m, i) => [m.id, RW_DOMAINS[i]?.id]).filter(Boolean);

export function parseDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

export function daysUntil(key, from = new Date()) {
  if (!key) return null;
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((parseDay(key) - today) / DAY_MS);
}

// ---------------- Natijalar tahlili ----------------
// attempts — `results` hujjatlari, yangidan eskiga saralangan.
export function analyzeAttempts(attempts = []) {
  const latest = attempts[0] || null;
  const stats = {};

  // Mavzu tahlili: server har natijaga bo'lim bo'yicha `domains`
  // ({ domainId: [to'g'ri, jami] }) yozadi — oxirgi 3 ta urinish.
  attempts
    .filter((a) => a.results)
    .slice(0, 3)
    .forEach((a) => {
      for (const r of Object.values(a.results)) {
        for (const [domain, [correct, total]] of Object.entries(r?.domains || {})) {
          if (!stats[domain]) stats[domain] = { correct: 0, total: 0 };
          stats[domain].correct += correct;
          stats[domain].total += total;
        }
      }
    });

  const domains = Object.entries(stats)
    .filter(([id]) => DOMAIN_BY_ID[id])
    .map(([id, s]) => ({
      ...DOMAIN_BY_ID[id],
      ...s,
      accuracy: s.total ? s.correct / s.total : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    latestId: latest?.id ?? null,
    current: latest?.total ?? null,
    rw: latest?.results?.rw?.scaledScore ?? null,
    math: latest?.results?.math?.scaledScore ?? null,
    latestResultPath: latest
      ? latest.sessionId
        ? `/session/${latest.sessionId}/results`
        : `/sat/results/${latest.id}`
      : null,
    domains,
    weakDomains: domains.filter((d) => d.total >= MIN_QUESTIONS && d.accuracy < WEAK_ACCURACY),
    hasData: attempts.length > 0,
  };
}

// ---------------- Haftalik reja ----------------
function practiceTask(date, slot, domainId, minutes) {
  const d = DOMAIN_BY_ID[domainId];
  return {
    id: `${dayKey(date)}:practice${slot}`,
    type: "practice",
    title: `${d.subject === "math" ? "Math" : "Reading & Writing"}: ${d.label}`,
    detail: d.hint,
    minutes,
    to: "/practice",
  };
}

export function buildWeek({ settings, analysis, vocabDue = 0, startDate = new Date() }) {
  const s = { ...DEFAULT_SETTINGS, ...settings };
  const exam = s.examDate ? parseDay(s.examDate) : null;
  const daysLeft = s.examDate ? daysUntil(s.examDate, startDate) : null;

  // Imtihonga 2 haftadan kam qolganda — haftada 2 ta mock.
  const mockDays = new Set([s.mockDay]);
  if (daysLeft != null && daysLeft <= 14) mockDays.add((s.mockDay + 4) % 7);

  const rotation = analysis.weakDomains.length
    ? analysis.weakDomains.map((d) => d.id)
    : DEFAULT_ROTATION;

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startDate, i);
    const key = dayKey(date);
    const weekday = date.getDay();
    const base = { key, date, weekday, tasks: [], rest: false, afterExam: false };

    if (exam && date > exam) {
      days.push({ ...base, afterExam: true });
      continue;
    }
    if (exam && key === s.examDate) {
      days.push({
        ...base,
        tasks: [{ id: `${key}:exam`, type: "exam", title: "SAT imtihoni", detail: "Omad! Yaxshi dam oling va vaqtida boring.", minutes: 0, to: null }],
      });
      continue;
    }
    if (s.restDays.includes(weekday)) {
      days.push({ ...base, rest: true });
      continue;
    }

    const tasks = [];
    const dayIndex = Math.floor(date.getTime() / DAY_MS);
    const study = Math.max(15, s.dailyMinutes - VOCAB_MINUTES);

    if (mockDays.has(weekday)) {
      tasks.push({
        id: `${key}:mock`,
        type: "mock",
        title: "To'liq mock test",
        detail: "Real imtihon sharoitida, to'xtamasdan yeching.",
        minutes: MOCK_MINUTES,
        to: "/sat/select",
      });
    } else {
      // Mock'dan keyingi birinchi o'qish kuni (dam olish kunlari o'tkazib yuboriladi).
      let prev = (weekday + 6) % 7;
      for (let k = 0; k < 6 && s.restDays.includes(prev); k++) prev = (prev + 6) % 7;
      if (mockDays.has(prev) && analysis.latestResultPath) {
        tasks.push({
          id: `${key}:review`,
          type: "review",
          title: "Mock xatolari tahlili",
          detail: "Oxirgi testdagi noto'g'ri javoblarni ko'rib chiqing va sababini yozing.",
          minutes: Math.min(30, study),
          to: analysis.latestResultPath,
        });
      }
      const left = study - (tasks[0]?.minutes || 0);
      const first = rotation[dayIndex % rotation.length];
      const second = rotation[(dayIndex + 1) % rotation.length];
      if (left >= 60 && second !== first) {
        tasks.push(practiceTask(date, 1, first, Math.round(left / 2)));
        tasks.push(practiceTask(date, 2, second, left - Math.round(left / 2)));
      } else if (left >= 15) {
        tasks.push(practiceTask(date, 1, first, left));
      }
    }

    tasks.push({
      id: `${key}:vocab`,
      type: "vocab",
      title: "Vocabulary takrorlash",
      detail: i === 0 && vocabDue > 0 ? `${vocabDue} ta so'z takrorlashni kutyapti` : "Yangi set yoki takrorlash",
      minutes: VOCAB_MINUTES,
      to: "/vocabulary",
    });

    days.push({ ...base, tasks });
  }
  return days;
}

// Bugundan (bugun hali bajarilmagan bo'lsa — kechadan) orqaga ketma-ket
// kamida bitta vazifa bajarilgan kunlar soni. Dam olish kunlari zanjirni
// uzmaydi (lekin sanalmaydi ham).
export function streak(done = {}, restDays = [], today = new Date()) {
  const isDone = (d) => done[dayKey(d)]?.length > 0;
  let date = today;
  if (!isDone(date)) date = addDays(date, -1);
  let count = 0;
  for (let guard = 0; guard < 400; guard++) {
    if (isDone(date)) count += 1;
    else if (!restDays.includes(date.getDay())) break;
    date = addDays(date, -1);
  }
  return count;
}

// ---------------- AI reja ----------------
// ai: { generatedAt, startDate, basedOn, summary, days: [{ date, focus, tasks }] }
const AI_TASK_LINKS = { practice: "/practice", mock: "/sat/select", vocab: "/vocabulary" };

export function mergeAiWeek(week, ai, { latestResultPath } = {}) {
  const byDate = new Map((ai?.days || []).map((d) => [d.date, d]));
  return week.map((day) => {
    const src = byDate.get(day.key);
    if (!src || day.rest || day.afterExam || day.tasks.some((t) => t.type === "exam")) {
      return { ...day, source: "auto" };
    }
    const tasks = src.tasks.map((t) => {
      const d = t.domain ? DOMAIN_BY_ID[t.domain] : null;
      return {
        ...t,
        subject: d?.subject,
        to: t.type === "review" ? latestResultPath || "/sat/history" : AI_TASK_LINKS[t.type],
      };
    });
    return { ...day, tasks, focus: src.focus, source: "ai" };
  });
}

// none — AI reja yo'q; stale — yangi mock natijasi bor yoki reja muddati tugagan.
export function aiStatus(ai, analysis, today = new Date()) {
  if (!ai?.days?.length) return "none";
  if ((analysis.latestId || null) !== (ai.basedOn || null)) return "stale";
  const age = -daysUntil(ai.startDate, today);
  return age >= 7 ? "none" : age >= 5 ? "stale" : "fresh";
}
