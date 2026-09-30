import { adminDb, HttpError } from "./firebaseAdmin.js";

// Sessiya savollari kalitlari bilan: secure/answers (yangi), eski
// testlarda secure/content yoki asosiy hujjatning o'zi.
export async function loadSessionSections(sessionId) {
  if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
    throw new HttpError(400, "Noto'g'ri sessiya");
  }
  const base = adminDb().doc(`testSessions/${sessionId}`);
  const [meta, answers, content] = await Promise.all([
    base.get(),
    base.collection("secure").doc("answers").get(),
    base.collection("secure").doc("content").get(),
  ]);
  if (!meta.exists) throw new HttpError(404, "Test topilmadi");
  const source = answers.exists ? answers.data() : content.exists ? content.data() : meta.data();
  const sections = (source.sections || []).map((s) => ({
    id: s.id,
    module1: s.module1 || [],
    module2Easy: s.module2Easy || [],
    module2Hard: s.module2Hard || [],
    module2Mixed: s.module2Mixed || [],
  }));
  return { meta: { id: meta.id, ...meta.data() }, sections };
}

export async function requireParticipant(sessionId, uid) {
  const snap = await adminDb().doc(`testSessions/${sessionId}/participants/${uid}`).get();
  if (!snap.exists) throw new HttpError(403, "Siz bu testga qo'shilmagansiz");
  return snap;
}
