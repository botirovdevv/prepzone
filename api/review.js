// GET /api/review?kind=sat|ielts&id=<natija id>
// Natija sahifasida savollarni ko'rib chiqish uchun to'g'ri javoblar.
// Faqat natija egasi (yoki admin) oladi — javob kalitlari brauzer
// bundle'ida yo'q, test topshirilgandan keyingina ochiladi.
import { requireUser, adminDb, isAdmin, HttpError } from "../server/firebaseAdmin.js";
import { handle, json } from "../server/http.js";
import { getStaticSections, reviewKeys } from "../server/satScoring.js";
import { getIeltsTest } from "../content/ielts/index.js";
import { scoreSection } from "../src/utils/ieltsScoring.js";

async function loadOwned(collection, id, uid) {
  if (!id || typeof id !== "string" || id.length > 64) throw new HttpError(400, "Noto'g'ri id");
  const snap = await adminDb().collection(collection).doc(id).get();
  if (!snap.exists) throw new HttpError(404, "Natija topilmadi");
  const data = snap.data();
  if (data.uid !== uid && !(await isAdmin(uid))) throw new HttpError(403, "Bu natija sizga tegishli emas");
  return data;
}

function ieltsReview(parts, answers) {
  return Object.fromEntries(
    scoreSection(parts, answers || {}).items.map((i) => [i.n, { correct: i.correct, expected: i.expected }])
  );
}

export const GET = handle(async (request) => {
  const user = await requireUser(request, { verified: false });
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id");

  if (kind === "sat") {
    const data = await loadOwned("results", id, user.uid);
    if (data.sessionId) throw new HttpError(400, "Sessiya natijalari uchun ko'rib chiqish mavjud emas");
    const test = getStaticSections(data.testId || "bluebook-1");
    if (!test) throw new HttpError(404, "Test topilmadi");
    return json({ keys: reviewKeys(test.sections) });
  }

  if (kind === "ielts") {
    const data = await loadOwned("ieltsResults", id, user.uid);
    const test = getIeltsTest(data.testId);
    if (!test) throw new HttpError(404, "Test topilmadi");
    return json({
      listening: data.listening ? ieltsReview(test.listening.parts, data.listening.answers) : null,
      reading: data.reading ? ieltsReview(test.reading.parts, data.reading.answers) : null,
    });
  }

  throw new HttpError(400, "Noto'g'ri so'rov");
});
