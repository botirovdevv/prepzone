// POST /api/session/finish — admin sessiyasi natijasini serverda baholab
// saqlaydi (bir marta). Statik testlar bilan bir xil IRT baholash.
//   body: { sessionId, attempts, terminated?, terminationReason? }
//   -> { results, total, sections }
import { requireUser, adminDb, FieldValue, HttpError, displayName } from "../../server/firebaseAdmin.js";
import { handle, json, readJson, isPlainObject } from "../../server/http.js";
import { scoreAttempt } from "../../server/satScoring.js";
import { loadSessionSections, requireParticipant } from "../../server/sessionContent.js";
import { updateLeaderboard } from "../../server/leaderboard.js";

export const POST = handle(async (request) => {
  const user = await requireUser(request);
  const body = await readJson(request);
  const { sessionId } = body;
  const participant = await requireParticipant(sessionId, user.uid);
  const { meta, sections } = await loadSessionSections(sessionId);
  const sectionsMeta = (meta.sections || []).map((s) => ({ id: s.id, title: s.title }));

  const db = adminDb();
  const resultRef = db.doc(`testSessions/${sessionId}/results/${user.uid}`);
  const existing = await resultRef.get();
  if (existing.exists) {
    const d = existing.data();
    return json({ results: d.results, total: d.total, sections: sectionsMeta, alreadySubmitted: true });
  }
  if (!isPlainObject(body.attempts)) throw new HttpError(400, "Javoblar yo'q");

  // Admin testni yopgan yoki talaba chetlatilgan bo'lsa — natija "to'xtatilgan".
  const pStatus = participant.data().status;
  const terminated = !!body.terminated || meta.status === "closed" || pStatus === "terminated";
  const reason = body.terminationReason || (meta.status === "closed" ? "closed_by_admin" : "unknown");
  const { results, total, complete } = scoreAttempt(sections, body.attempts, { terminated });

  const name = displayName(user);
  const termFields = terminated ? { terminated: true, terminationReason: String(reason).slice(0, 40) } : {};
  const batch = db.batch();
  batch.set(resultRef, {
    uid: user.uid,
    name,
    email: user.email || null,
    results,
    total,
    sessionTitle: meta.title || "",
    finishedAt: FieldValue.serverTimestamp(),
    ...termFields,
  });
  // "Mening natijalarim" (History) ildiz "results" kolleksiyasini o'qiydi.
  batch.set(db.collection("results").doc(), {
    uid: user.uid,
    email: user.email || null,
    results,
    total,
    complete,
    sessionId,
    sessionTitle: meta.title || "",
    createdAt: FieldValue.serverTimestamp(),
    ...termFields,
  });
  batch.set(
    participant.ref,
    {
      totalScore: total,
      ...(terminated
        ? { status: "terminated", terminationReason: termFields.terminationReason, terminatedAt: FieldValue.serverTimestamp() }
        : { status: "finished", finishedAt: FieldValue.serverTimestamp() }),
    },
    { merge: true }
  );
  await batch.commit();

  const fullSat = ["rw", "math"].every((id) => sections.some((s) => s.id === id));
  if (complete && fullSat) await updateLeaderboard(user, total);

  return json({ results, total, sections: sectionsMeta });
});
