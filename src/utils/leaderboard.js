import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

// Foydalanuvchi to'liq mock testni yakunlaganda chaqiriladi. Faqat
// avvalgi eng yaxshi natijasidan yuqori bo'lsa yozadi — shunday qilib
// "leaderboard" kolleksiyasi har doim har bir foydalanuvchining ENG
// YAXSHI natijasini saqlaydi (batafsil javoblar emas, faqat ism va ball).
export async function maybeUpdateLeaderboard(user, total) {
  if (!user || typeof total !== "number" || Number.isNaN(total)) return;
  try {
    const ref = doc(db, "leaderboard", user.uid);
    const snap = await getDoc(ref);
    const prevBest = snap.exists() ? snap.data().bestScore || 0 : 0;
    if (total <= prevBest) return;
    await setDoc(ref, {
      uid: user.uid,
      name: (user.displayName || user.email?.split("@")[0] || "Foydalanuvchi").slice(0, 60),
      bestScore: total,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Reytingni yangilashda xatolik:", err);
  }
}
