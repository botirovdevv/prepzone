import { adminDb, FieldValue, displayName } from "./firebaseAdmin.js";

// Reytingda har userning ENG YAXSHI to'liq SAT natijasi saqlanadi.
// Faqat server yozadi (firestore.rules: client yozuvi yopiq).
export async function updateLeaderboard(user, total) {
  if (typeof total !== "number" || total < 400 || total > 1600) return false;
  const ref = adminDb().doc(`leaderboard/${user.uid}`);
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const prevBest = snap.exists ? snap.data().bestScore || 0 : 0;
    if (total <= prevBest) return false;
    tx.set(ref, {
      uid: user.uid,
      name: displayName(user),
      bestScore: total,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return true;
  });
}
