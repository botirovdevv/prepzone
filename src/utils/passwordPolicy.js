// ------------------------------------------------------------------
// Parol siyosati (Register va Sozlamalar sahifalari uchun).
//
// Bu tekshiruv brauzerda — userga darhol ko'rsatish uchun. Serverda ham
// majburlash uchun Firebase Console -> Authentication -> Settings ->
// Password policy'da xuddi shu talablarni yoqing (aks holda API orqali
// to'g'ridan-to'g'ri zaif parol bilan ro'yxatdan o'tish mumkin bo'ladi).
// ------------------------------------------------------------------

export const MIN_PASSWORD_LENGTH = 10;

// Eng ko'p tarqalgan / sizib chiqqan parollar (kichik harflarda).
const COMMON = new Set(
  (
    "123456 123456789 12345678 password qwerty123 qwerty 1q2w3e4r 111111 123123 1234567890 1234567 " +
    "qwertyuiop 000000 abc123 password1 iloveyou 1qaz2wsx 654321 666666 987654321 123321 7777777 " +
    "qwe123 zxcvbnm 1q2w3e 121212 aa123456 555555 dragon 112233 monkey sunshine princess football " +
    "baseball welcome welcome1 admin admin123 administrator letmein master login passw0rd p@ssword " +
    "p@ssw0rd password123 password1234 qwerty1234 asdfghjkl asdfgh 1234qwer qazwsx trustno1 superman " +
    "batman shadow michael jennifer hunter killer charlie freedom whatever starwars pokemon computer " +
    "internet samsung google apple mustang access flower hello123 test123 test1234 secret 11111111 " +
    "00000000 88888888 99999999 12341234 11223344 147258369 159753 1q2w3e4r5t 1qaz2wsx3edc zaq12wsx " +
    "q1w2e3r4 q1w2e3r4t5 asd123 qweasd qweasdzxc 123qwe 123abc abcd1234 abcdef 987654 prepzone " +
    "prepzone123 sat123 ielts123 uzbekistan tashkent toshkent parol parol123 salom salom123 " +
    "iloveyou1 football1 baseball1 princess1 sunshine1 welcome123 changeme default guest"
  ).split(/\s+/)
);

const KEYBOARD_RUNS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "0987654321", "abcdefghijklmnopqrstuvwxyz"];

function hasSequence(pw, len = 4) {
  const lower = pw.toLowerCase();
  return KEYBOARD_RUNS.some((run) => {
    for (let i = 0; i + len <= run.length; i++) {
      if (lower.includes(run.slice(i, i + len))) return true;
    }
    return false;
  });
}

// Email yoki ismdan olingan, parolda uchramasligi kerak bo'lgan bo'laklar.
function personalTokens({ email = "", name = "" }) {
  const local = email.split("@")[0] || "";
  return [local, ...name.split(/\s+/), ...local.split(/[._\-+\d]+/)]
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length >= 4);
}

export function checkPassword(password, context = {}) {
  const pw = password || "";
  const lower = pw.toLowerCase();
  const stripped = lower.replace(/[^a-z0-9]/g, "");
  // "Tashkent#2026" -> "tashkent": keng tarqalgan so'z + raqam/belgi qo'shilgani yetarli emas.
  const letters = lower.replace(/[^a-z]/g, "");
  const rules = [
    { id: "length", label: `Kamida ${MIN_PASSWORD_LENGTH} ta belgi`, ok: pw.length >= MIN_PASSWORD_LENGTH },
    { id: "upper", label: "Katta harf (A–Z)", ok: /[A-Z]/.test(pw) },
    { id: "lower", label: "Kichik harf (a–z)", ok: /[a-z]/.test(pw) },
    { id: "digit", label: "Raqam (0–9)", ok: /\d/.test(pw) },
    { id: "symbol", label: "Maxsus belgi (!@#$% ...)", ok: /[^A-Za-z0-9\s]/.test(pw) },
    {
      id: "common",
      label: "Keng tarqalgan yoki oddiy ketma-ketlik emas",
      ok:
        pw.length > 0 &&
        !COMMON.has(lower) &&
        !COMMON.has(stripped) &&
        !(letters.length >= 4 && COMMON.has(letters)) &&
        !hasSequence(pw) &&
        !/(.)\1{3,}/.test(pw),
    },
    {
      id: "personal",
      label: "Email yoki ismingizni o'z ichiga olmaydi",
      ok: pw.length > 0 && !personalTokens(context).some((t) => lower.includes(t)),
    },
  ];

  const passed = rules.filter((r) => r.ok).length;
  const valid = passed === rules.length;
  // 0..4: talablar bajarilmaguncha ko'pi bilan "O'rtacha"; hammasi bajarilsa —
  // uzunlikka qarab "Yaxshi" yoki "Kuchli".
  let score = 0;
  if (valid) score = pw.length >= 14 ? 4 : 3;
  else if (pw.length > 0) score = Math.min(2, Math.floor((passed / rules.length) * 3));
  if (pw.length > 0 && !rules.find((r) => r.id === "common").ok) score = Math.min(score, 1);
  return { valid, rules, score };
}

export const STRENGTH_LABELS = ["Juda zaif", "Zaif", "O'rtacha", "Yaxshi", "Kuchli"];
