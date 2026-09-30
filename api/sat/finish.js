// POST /api/sat/finish — statik SAT testni serverda baholab saqlaydi.
//   body: { attemptId, testId, attempts: { rw: {module1Answers, module2Answers?}, math: {...} },
//           terminated?, terminationReason? }
//   -> { resultId, results, total, complete, leaderboardUpdated }
//
// Reytingga faqat shu testning BIRINCHI to'liq urinishi tushadi: natija
// sahifasi to'g'ri javoblarni ko'rsatgani uchun qayta topshirish adolatsiz.
import { requireUser, adminDb, FieldValue, HttpError } from "../../server/firebaseAdmin.js";
import { handle, json, readJson, isPlainObject, attemptDocId } from "../../server/http.js";
import { getStaticSections, scoreAttempt } from "../../server/satScoring.js";
import { updateLeaderboard } from "../../server/leaderboard.js";
import { consumeDaily } from "../../server/rateLimit.js";

export const POST = handle(async (request) => {
  const user = await requireUser(request);
  const body = await readJson(request);
  const resultId = attemptDocId(body.attemptId);
  const data = getStaticSections(body.testId);
  if (!data) throw new HttpError(404, "Test topilmadi");
  if (!isPlainObject(body.attempts)) throw new HttpError(400, "Javoblar yo'q");

  const db = adminDb();
  const ref = db.collection("results").doc(resultId);
  const existing = await ref.get();
  if (existing.exists) {
    const d = existing.data();
    if (d.uid !== user.uid) throw new HttpError(409, "attemptId band");
    return json({ resultId, results: d.results, total: d.total, complete: !!d.complete, leaderboardUpdated: false });
  }

  await consumeDaily(user.uid, "satFinish", 15, "Bugun juda ko'p test topshirildi, ertaga davom eting");

  const terminated = !!body.terminated;
  const { results, total, complete } = scoreAttempt(data.sections, body.attempts, { terminated });
  if (!Object.keys(results).length) throw new HttpError(400, "Javoblar yo'q");

  const previous = complete
    ? await db
        .collection("results")
        .where("uid", "==", user.uid)
        .where("testId", "==", body.testId)
        .where("complete", "==", true)
        .limit(1)
        .get()
    : null;

  await ref.set({
    uid: user.uid,
    email: user.email || null,
    testId: body.testId,
    results,
    total,
    complete,
    createdAt: FieldValue.serverTimestamp(),
    ...(terminated
      ? { terminated: true, terminationReason: String(body.terminationReason || "unknown").slice(0, 40) }
      : {}),
  });

  const leaderboardUpdated = complete && previous?.empty ? await updateLeaderboard(user, total) : false;
  return json({ resultId, results, total, complete, leaderboardUpdated });
});
