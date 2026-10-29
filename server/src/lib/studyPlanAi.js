import { DOMAINS, generateJson } from "./gemini.js";

// ------------------------------------------------------------------
// Study Plan uchun AI (Gemini) haftalik reja. Foydalanuvchi sozlamalari
// (DB'dan) va mock tahlili (clientdan, zod bilan tekshirilgan) asosida
// 7 kunlik vazifalar yoziladi. Javob qat'iy tozalanadi: dam olish
// kunlari, imtihondan keyingi kunlar va oraliqdan tashqari sanalar bo'sh.
// ------------------------------------------------------------------

export const PLAN_DAYS = 7;
const VOCAB_MINUTES = 10;
const MOCK_MINUTES = 134;
const TASK_TYPES = ["mock", "review", "practice", "vocab"];
const ALL_DOMAINS = [...DOMAINS.rw, ...DOMAINS.math];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PLAN_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "2-3 sentences in Uzbek (Latin): this week's focus and why." },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          date: { type: "STRING", description: "YYYY-MM-DD" },
          focus: { type: "STRING", description: "Short theme of the day in Uzbek (max ~8 words)." },
          tasks: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                type: { type: "STRING", enum: TASK_TYPES },
                domain: { type: "STRING", description: `For practice: one of ${ALL_DOMAINS.join(", ")}; otherwise empty.` },
                title: { type: "STRING", description: "Concrete task title in Uzbek." },
                detail: { type: "STRING", description: "One sentence: exactly what to do, in Uzbek." },
                minutes: { type: "INTEGER" },
              },
              required: ["type", "domain", "title", "detail", "minutes"],
            },
          },
        },
        required: ["date", "focus", "tasks"],
      },
    },
  },
  required: ["summary", "days"],
};

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// "YYYY-MM-DD" bilan UTC'da ishlaymiz — server vaqt zonasi ta'sir qilmasin.
const toDate = (key) => new Date(`${key}T00:00:00Z`);
const toKey = (d) => d.toISOString().slice(0, 10);
const shift = (key, n) => toKey(new Date(toDate(key).getTime() + n * 86_400_000));
const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 86_400_000);

function planDays(settings, startDate) {
  return Array.from({ length: PLAN_DAYS }, (_, i) => {
    const key = shift(startDate, i);
    const weekday = toDate(key).getUTCDay();
    let kind = "study";
    if (key > settings.examDate) kind = "after-exam";
    else if (key === settings.examDate) kind = "exam";
    else if ((settings.restDays || []).includes(weekday)) kind = "rest";
    return { key, weekday, kind };
  });
}

function buildPrompt({ settings, analysis, vocabDue, hasLatestResult, days, startDate }) {
  const daysLeft = diffDays(startDate, settings.examDate);
  const domainLines = analysis.domains.length
    ? analysis.domains
        .map((d) => `- ${d.id}: ${d.correct}/${d.total} correct (${d.total ? Math.round((d.correct / d.total) * 100) : 0}%)`)
        .join("\n")
    : "- No mock test data yet.";
  const dayLines = days
    .map((d) => `- ${d.key} (${WEEKDAYS[d.weekday]}): ${d.kind === "study" ? "study day" : d.kind}`)
    .join("\n");

  return `You are an expert Digital SAT coach writing a personal 7-day study plan for a student on an exam-prep platform.

STUDENT
- Exam date: ${settings.examDate} (${daysLeft} days from ${startDate})
- Target score: ${settings.targetScore}
- Latest mock total: ${analysis.current ?? "unknown"} (Reading & Writing: ${analysis.rw ?? "?"}, Math: ${analysis.math ?? "?"})
- Daily study time: ${settings.dailyMinutes} minutes
- Preferred full mock test weekday: ${WEEKDAYS[settings.mockDay]}
- Vocabulary words due for review today: ${vocabDue}
- Has a mock result to review: ${hasLatestResult ? "yes" : "no"}

ACCURACY BY DOMAIN (last 3 mocks)
${domainLines}

DAYS
${dayLines}

RULES
- Return one entry in "days" for every "study day" above, with the exact date. Do not return rest, exam or after-exam days.
- Task types: "mock" (full timed practice test, ${MOCK_MINUTES} min, the platform's SAT mock), "review" (go through mistakes of the latest mock), "practice" (targeted questions on one domain — set "domain"), "vocab" (SAT vocabulary flashcards, ${VOCAB_MINUTES} min).
- On the preferred mock weekday put one "mock" task (plus vocab). If 14 days or fewer remain, add a second mock day in the week.
- On the first study day after a mock day, start with a "review" task${hasLatestResult ? "" : " (only once the student has a mock result; today they have none, so skip review until after this week's mock)"}.
- Every study day ends with a ${VOCAB_MINUTES}-minute "vocab" task.
- Non-mock days: total minutes ≈ ${settings.dailyMinutes}. Spend most practice time on the weakest domains (accuracy below 70%), but keep some variety and alternate Math and Reading & Writing.
- If there is no mock data, plan a full diagnostic mock as early as possible and balance all domains.
- Titles and details must be specific and actionable (e.g. which skill to drill, how many questions), in Uzbek (Latin script). Keep SAT domain names in English and write them readably ("Advanced Math", "Craft and Structure"), never as ids like advanced-math.
- "summary": 2-3 encouraging, concrete sentences in Uzbek explaining the week's priorities based on the data.`;
}

function cleanTask(raw, key, i, settings) {
  const type = TASK_TYPES.includes(raw?.type) ? raw.type : null;
  if (!type) return null;
  const domain = type === "practice" && ALL_DOMAINS.includes(raw?.domain) ? raw.domain : "";
  if (type === "practice" && !domain) return null;
  const fallbackMin = type === "mock" ? MOCK_MINUTES : type === "vocab" ? VOCAB_MINUTES : 30;
  const minutes = Math.round(Math.min(180, Math.max(5, Number(raw?.minutes) || fallbackMin)));
  const title = str(raw?.title, 90);
  if (!title) return null;
  return {
    id: `${key}:ai${i}`,
    type,
    domain,
    title,
    detail: str(raw?.detail, 220),
    minutes: Math.min(minutes, type === "mock" ? 180 : Math.max(settings.dailyMinutes, 15)),
  };
}

export async function generateStudyPlan({ settings, analysis, vocabDue, hasLatestResult, latestId, startDate }) {
  const days = planDays(settings, startDate);
  const raw = await generateJson(
    [{ text: buildPrompt({ settings, analysis, vocabDue, hasLatestResult, days, startDate }) }],
    PLAN_SCHEMA,
    { temperature: 0.5 }
  );

  const byDate = new Map((Array.isArray(raw?.days) ? raw.days : []).map((d) => [str(d?.date, 10), d]));
  const outDays = days
    .filter((d) => d.kind === "study")
    .map((d) => {
      const src = byDate.get(d.key);
      const tasks = (Array.isArray(src?.tasks) ? src.tasks : [])
        .slice(0, 6)
        .map((t, i) => cleanTask(t, d.key, i, settings))
        .filter(Boolean);
      return { date: d.key, focus: str(src?.focus, 80), tasks };
    })
    .filter((d) => d.tasks.length);

  return {
    generatedAt: new Date().toISOString(),
    startDate,
    basedOn: latestId || null,
    summary: str(raw?.summary, 500),
    days: outDays,
  };
}
