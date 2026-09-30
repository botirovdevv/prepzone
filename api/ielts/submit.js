// POST /api/ielts/submit — IELTS testni serverda baholab saqlaydi.
//   body: { attemptId, testId, mode, answers: { listening: {n: str}, reading: {n: str},
//           writing: { task1, task2 } }, terminated?, terminationReason? }
//   -> { id, result }
// Writing: ANTHROPIC_API_KEY sozlangan bo'lsa — AI examiner (kuniga 3 ta),
// aks holda yoki xato bo'lsa — avtomatik taxminiy baholash.
import { requireUser, adminDb, FieldValue, HttpError } from "../../server/firebaseAdmin.js";
import { handle, json, readJson, isPlainObject, attemptDocId } from "../../server/http.js";
import { consumeDaily } from "../../server/rateLimit.js";
import { aiConfigured, gradeWritingWithAi } from "../../server/aiWriting.js";
import { getIeltsTest } from "../../content/ielts/index.js";
import { scoreSection, listeningBand, readingBand, overallBand } from "../../src/utils/ieltsScoring.js";
import { assessWriting } from "../../src/utils/ieltsWriting.js";

const MODES = { full: ["listening", "reading", "writing"], listening: ["listening"], reading: ["reading"], writing: ["writing"] };
// AI examiner baholash hozircha o'chiq — tez orada qo'shiladi.
const AI_WRITING_ENABLED = false;
const AI_DAILY_LIMIT = 3;
const MAX_ESSAY = 6000;

function cleanObjective(raw) {
  const out = {};
  if (!isPlainObject(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    const n = Number(k);
    if (Number.isInteger(n) && n >= 1 && n <= 40 && typeof v === "string" && v.trim()) out[n] = v.slice(0, 60);
  }
  return out;
}

async function gradeWriting(user, test, texts) {
  const heuristic = assessWriting(test.writing, texts);
  const base = {
    task1Text: texts.task1,
    task2Text: texts.task2,
    task1: { band: heuristic.task1.band, criteria: heuristic.task1.criteria, wordCount: heuristic.task1.wordCount },
    task2: { band: heuristic.task2.band, criteria: heuristic.task2.criteria, wordCount: heuristic.task2.wordCount },
    band: heuristic.band,
  };
  if (!AI_WRITING_ENABLED || !aiConfigured() || !(texts.task1.trim() || texts.task2.trim())) return base;

  try {
    await consumeDaily(user.uid, "aiWriting", AI_DAILY_LIMIT);
  } catch (err) {
    if (err instanceof HttpError && err.status === 429) return { ...base, aiError: "limit" };
    throw err;
  }
  try {
    const ai = await gradeWritingWithAi(test.writing, texts);
    return {
      ...base,
      task1: { ...base.task1, band: ai.task1.band, criteria: ai.task1.criteria },
      task2: { ...base.task2, band: ai.task2.band, criteria: ai.task2.criteria },
      band: ai.band,
      ai,
    };
  } catch (err) {
    console.error("AI writing baholashda xatolik:", err);
    return { ...base, aiError: "failed" };
  }
}

export const POST = handle(async (request) => {
  const user = await requireUser(request);
  const body = await readJson(request, 100_000);
  const test = getIeltsTest(body.testId);
  if (!test) throw new HttpError(404, "Test topilmadi");
  const sections = MODES[body.mode];
  if (!sections) throw new HttpError(400, "Noto'g'ri rejim");
  const answers = isPlainObject(body.answers) ? body.answers : {};

  const ref = adminDb().collection("ieltsResults").doc(attemptDocId(body.attemptId));
  const existing = await ref.get();
  if (existing.exists) {
    if (existing.data().uid !== user.uid) throw new HttpError(409, "attemptId band");
    return json({ id: ref.id, result: { id: ref.id, ...existing.data() } });
  }

  await consumeDaily(user.uid, "ieltsSubmit", 15, "Bugun juda ko'p test topshirildi, ertaga davom eting");

  const result = { uid: user.uid, email: user.email || null, testId: test.id, testTitle: test.title, mode: body.mode };
  const bands = [];
  if (sections.includes("listening")) {
    const a = cleanObjective(answers.listening);
    const raw = scoreSection(test.listening.parts, a).raw;
    result.listening = { raw, band: listeningBand(raw), answers: a };
    bands.push(result.listening.band);
  }
  if (sections.includes("reading")) {
    const a = cleanObjective(answers.reading);
    const raw = scoreSection(test.reading.parts, a).raw;
    result.reading = { raw, band: readingBand(raw), answers: a };
    bands.push(result.reading.band);
  }
  if (sections.includes("writing")) {
    const w = isPlainObject(answers.writing) ? answers.writing : {};
    const texts = {
      task1: String(w.task1 || "").slice(0, MAX_ESSAY),
      task2: String(w.task2 || "").slice(0, MAX_ESSAY),
    };
    result.writing = await gradeWriting(user, test, texts);
    bands.push(result.writing.band);
  }
  result.overall = overallBand(bands);
  if (body.terminated) {
    result.terminated = true;
    result.terminationReason = String(body.terminationReason || "unknown").slice(0, 40);
  }

  await ref.set({ ...result, createdAt: FieldValue.serverTimestamp() });
  return json({ id: ref.id, result: { id: ref.id, ...result } });
});
