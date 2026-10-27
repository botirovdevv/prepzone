import { config } from "../config.js";

// Resend orqali email yuborish (avval functions/index.js'da edi).
// RESEND_API_KEY berilmagan bo'lsa (lokal ishlab chiqish), kod
// shunchaki server konsoliga chiqariladi.

const SUBJECTS = {
  verify: (code) => `Prepzone tasdiqlash kodi: ${code}`,
  reset: (code) => `Prepzone parolni tiklash kodi: ${code}`,
};

const INTROS = {
  verify: "Prepzone'ga xush kelibsiz! Tasdiqlash kodingiz:",
  reset: "Parolingizni tiklash uchun kod:",
};

export async function sendCodeEmail(to, code, purpose = "verify") {
  if (!config.resendApiKey) {
    console.log(`[email:dev] ${purpose} kodi ${to} uchun: ${code}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: config.fromEmail,
      to,
      subject: SUBJECTS[purpose](code),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:24px">
          <p style="font-size:15px;color:#12213D">${INTROS[purpose]}</p>
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
