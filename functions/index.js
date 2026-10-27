// ------------------------------------------------------------------
// Prepzone — email OTP tasdiqlash (server tomonida, xavfsiz).
//
// Bu fayl 3 ta funksiyani o'z ichiga oladi:
//   1. sendOtpCode   — 6 xonali kodni SERVERDA yaratadi, Resend orqali
//                      emailga yuboradi. Kod hech qachon клиентга
//                      qaytarilmaydi.
//   2. verifyOtpCode — kiritilgan kodni SERVERDA solishtiradi (5
//                      martadan ko'p noto'g'ri urinishdan keyin
//                      bloklaydi).
//   3. autoVerifyGoogleUsers — Google orqali ro'yxatdan o'tganlarni
//                      avtomatik tasdiqlangan deb belgilaydi (Google
//                      email'ni allaqachon tasdiqlagan).
//
// SOZLASH (README_CLOUD_FUNCTIONS.md faylida batafsil):
//   1. Firebase loyihangizni Blaze (pay-as-you-go) tarifiga o'tkazing
//      (Cloud Functions shuni talab qiladi — bepul kvota yetarli
//      bo'lishi mumkin, lekin karta bog'lash shart).
//   2. Resend.com'da ro'yxatdan o'ting, domeningizni tasdiqlang (SPF/
//      DKIM) — bu spam papkasiga tushmaslik uchun ENG MUHIM qadam.
//   3. `firebase functions:secrets:set RESEND_API_KEY` orqali API
//      kalitingizni saqlang.
//   4. `firebase deploy --only functions` bilan joylashtiring.
// ------------------------------------------------------------------

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const v1 = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const resendApiKey = defineSecret("RESEND_API_KEY");

// !!! Resend'da tasdiqlagan domeningizga mos qilib o'zgartiring !!!
const FROM_EMAIL = "Prepzone <verify@mail.prep-zone.uz>";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 daqiqa
const RESEND_COOLDOWN_MS = 45 * 1000; // 45 soniya
const MAX_ATTEMPTS = 5;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendEmail(apiKey, to, code) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: `Prepzone tasdiqlash kodi: ${code}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <p style="font-size:15px;color:#12213D">Prepzone'ga xush kelibsiz!</p>
          <p style="font-size:15px;color:#12213D">Tasdiqlash kodingiz:</p>
          <p style="font-size:32px;font-weight:800;letter-spacing:6px;color:#087fd1;margin:16px 0">${code}</p>
          <p style="font-size:13px;color:#667">Bu kod 10 daqiqa amal qiladi. Agar siz bu so'rovni yubormagan bo'lsangiz, shunchaki bu xatni e'tiborsiz qoldiring.</p>
        </div>
      `,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend xatosi: ${res.status} ${text}`);
  }
}

exports.sendOtpCode = onCall({ secrets: [resendApiKey] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Avval tizimga kiring.");
  }
  const uid = request.auth.uid;
  const email = request.auth.token.email;
  if (!email) {
    throw new HttpsError("failed-precondition", "Email topilmadi.");
  }

  const ref = admin.firestore().doc(`otpCodes/${uid}`);
  const existing = await ref.get();
  if (existing.exists) {
    const createdMs = existing.data().createdAt?.toMillis?.() || 0;
    if (Date.now() - createdMs < RESEND_COOLDOWN_MS) {
      throw new HttpsError("resource-exhausted", "Juda tez-tez so'ralmoqda. Biroz kuting.");
    }
  }

  const code = generateCode();
  await ref.set({
    code,
    email,
    expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + OTP_TTL_MS),
    createdAt: admin.firestore.Timestamp.now(),
    attempts: 0,
  });

  try {
    await sendEmail(resendApiKey.value(), email, code);
  } catch (err) {
    console.error("Email yuborishda xatolik:", err);
    throw new HttpsError("internal", "Emailni yuborib bo'lmadi. Keyinroq urinib ko'ring.");
  }

  return { ok: true };
});

exports.verifyOtpCode = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Avval tizimga kiring.");
  }
  const uid = request.auth.uid;
  const submitted = String(request.data?.code || "").trim();
  if (!/^\d{6}$/.test(submitted)) {
    throw new HttpsError("invalid-argument", "Kod 6 ta raqamdan iborat bo'lishi kerak.");
  }

  const ref = admin.firestore().doc(`otpCodes/${uid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("failed-precondition", "Avval kod so'rang.");
  }

  const { code, expiresAt, attempts = 0 } = snap.data();

  if (attempts >= MAX_ATTEMPTS) {
    throw new HttpsError("resource-exhausted", "Juda ko'p noto'g'ri urinish. Yangi kod so'rang.");
  }
  if (Date.now() > expiresAt.toMillis()) {
    throw new HttpsError("deadline-exceeded", "Kod muddati o'tgan. Yangi kod so'rang.");
  }
  if (submitted !== code) {
    await ref.update({ attempts: admin.firestore.FieldValue.increment(1) });
    throw new HttpsError("invalid-argument", "Kod noto'g'ri.");
  }

  await admin.firestore().doc(`otpStatus/${uid}`).set({
    verified: true,
    verifiedAt: admin.firestore.Timestamp.now(),
  });
  await ref.delete();

  return { ok: true };
});

// Google orqali ro'yxatdan o'tgan/kirgan foydalanuvchi — Google email'ni
// allaqachon tasdiqlagan, shuning uchun bizning kodimiz shart emas.
exports.autoVerifyGoogleUsers = v1.auth.user().onCreate(async (user) => {
  const isGoogle = (user.providerData || []).some((p) => p.providerId === "google.com");
  if (!isGoogle) return null;
  await admin.firestore().doc(`otpStatus/${user.uid}`).set({
    verified: true,
    verifiedAt: admin.firestore.Timestamp.now(),
  });
  return null;
});
