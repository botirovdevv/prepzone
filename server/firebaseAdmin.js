// ------------------------------------------------------------------
// Firebase Admin SDK — faqat serverda (Vercel Functions, api/).
// Admin SDK Firestore rules'ni chetlab o'tadi: natija, reyting va boshqa
// ishonchli ma'lumotlar faqat shu yerdan yoziladi.
//
// Env: FIREBASE_SERVICE_ACCOUNT — Firebase Console -> Project settings ->
// Service accounts -> "Generate new private key" JSON fayli (bitta qatorda).
// ------------------------------------------------------------------
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function init() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new HttpError(500, "Server sozlanmagan: FIREBASE_SERVICE_ACCOUNT yo'q");
  const account = JSON.parse(raw);
  // Vercel env'da private_key ichidagi \n lar ba'zan literal bo'lib qoladi.
  if (account.private_key) account.private_key = account.private_key.replace(/\n/g, "\n");
  return initializeApp({ credential: cert(account) });
}

export const adminDb = () => getFirestore(init());
export const adminAuth = () => getAuth(init());
export { FieldValue };

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Authorization: Bearer <Firebase ID token> -> decoded token.
// Natija yozadigan endpointlar uchun emaili tasdiqlangan bo'lishi shart.
export async function requireUser(request, { verified = true } = {}) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Tizimga kiring");
  const auth = adminAuth(); // sozlama xatosi 500 bo'lib chiqsin, 401 emas
  let decoded;
  try {
    decoded = await auth.verifyIdToken(token);
  } catch {
    throw new HttpError(401, "Sessiya muddati tugagan, qaytadan kiring");
  }
  if (verified && !decoded.email_verified) throw new HttpError(403, "Avval emailingizni tasdiqlang");
  return decoded;
}

export async function isAdmin(uid) {
  const snap = await adminDb().doc(`admins/${uid}`).get();
  return snap.exists;
}

export async function requireAdmin(request) {
  const user = await requireUser(request, { verified: false });
  if (!(await isAdmin(user.uid))) throw new HttpError(403, "Faqat admin uchun");
  return user;
}

export function displayName(user) {
  return (user.name || user.email?.split("@")[0] || "Foydalanuvchi").slice(0, 60);
}
