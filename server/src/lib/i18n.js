// ------------------------------------------------------------------
// Xato xabarlarini foydalanuvchi tilida qaytarish.
//
// Server xabarlarni o'zbekcha yozadi. Brauzer `X-Lang: en` yuborsa,
// pastdagi middleware xato javobidagi `message`ni inglizchasiga
// almashtiradi (kalit — o'zbekcha matnning o'zi). Ro'yxatda yo'q xabar
// o'zgarishsiz qoladi. Admin panel xabarlari o'zbekcha qolgani uchun bu
// yerga kiritilmagan.
// ------------------------------------------------------------------

const EN = {
  // Umumiy
  "Avval tizimga kiring.": "Please log in first.",
  "Bu amal uchun ruxsat yo'q.": "You don't have permission to do this.",
  "Topilmadi.": "Not found.",
  "Ma'lumotlar noto'g'ri.": "The data is invalid.",
  "Bunday API manzili yo'q.": "This API address doesn't exist.",
  "Ma'lumot hajmi juda katta.": "The data is too large.",
  "JSON noto'g'ri.": "Invalid JSON.",
  "Bu ma'lumot allaqachon mavjud.": "This already exists.",
  "Serverda xatolik yuz berdi.": "Something went wrong on the server.",
  "Avval emailingizni tasdiqlang.": "Please confirm your email first.",
  "Bugungi limit tugadi, ertaga qayta urinib ko'ring.": "You've reached today's limit. Please try again tomorrow.",

  // Kirish / hisob
  "Juda ko'p urinish. Birozdan keyin qaytadan urinib ko'ring.": "Too many attempts. Please try again in a little while.",
  "Email manzili noto'g'ri.": "The email address is invalid.",
  "Parol kamida 10 ta belgidan iborat bo'lishi kerak.": "The password must be at least 10 characters long.",
  "Parol juda uzun.": "The password is too long.",
  "Ismingizni kiriting.": "Please enter your name.",
  "Kod 6 ta raqamdan iborat bo'lishi kerak.": "The code must be 6 digits.",
  "Hisobingiz bloklangan. Administratorga murojaat qiling.": "Your account has been blocked. Please contact an administrator.",
  "Bu email allaqachon ro'yxatdan o'tgan.": "This email is already registered.",
  "Bu hisob uchun parol o'rnatilmagan. Google orqali kiring yoki parolni tiklang.":
    "This account doesn't have a password yet. Log in with Google or reset your password.",
  "Email yoki parol noto'g'ri.": "Wrong email or password.",
  "Google hisobidagi email tasdiqlanmagan.": "The email on this Google account isn't verified.",
  "Kod noto'g'ri.": "The code is wrong.",
  "Joriy parol noto'g'ri.": "The current password is wrong.",
  "Email'ni o'zgartirish uchun avval parol o'rnating.": "Set a password before changing your email.",
  "Joriy seansni tugatish uchun hisobdan chiqing.": "To end your current session, log out.",
  "Bu seans topilmadi.": "This session wasn't found.",
  "Bu Google hisobi boshqa Prepzone hisobiga ulangan.": "This Google account is linked to another Prepzone account.",
  "Siz yagona egasiz. Hisobni o'chirishdan oldin boshqa adminni ega qilib tayinlang.":
    "You are the only owner. Make another admin the owner before deleting your account.",
  "Google orqali kirish serverda sozlanmagan.": "Google sign-in isn't available right now.",
  "Google tokeni yaroqsiz.": "The Google sign-in has expired. Please try again.",
  "Juda tez-tez so'ralmoqda. Biroz kuting.": "You're requesting codes too often. Please wait a moment.",
  "Emailni yuborib bo'lmadi. Keyinroq urinib ko'ring.": "Couldn't send the email. Please try again later.",
  "Avval kod so'rang.": "Request a code first.",
  "Juda ko'p noto'g'ri urinish. Yangi kod so'rang.": "Too many wrong attempts. Request a new code.",
  "Kod muddati o'tgan. Yangi kod so'rang.": "The code has expired. Request a new code.",
  "Email o'zgargan. Yangi kod so'rang.": "Your email has changed. Request a new code.",
  "QR so'rovi topilmadi.": "QR request not found.",
  "QR kod eskirgan. Kompyuterdagi yangi QR'ni skanerlang.": "The QR code has expired. Scan the new one on your computer.",

  // Testlar va natijalar
  "Siz bu testni allaqachon topshirgansiz.": "You have already taken this test.",
  "Avval testga qo'shiling.": "Join the test first.",
  "Bunday kod bilan test topilmadi.": "No test was found with this code.",
  "Bu test yakunlangan.": "This test has ended.",
  "Kirish kodi noto'g'ri.": "The access code is wrong.",
  "Test hali boshlanmagan.": "The test hasn't started yet.",
  "Test topilmadi.": "Test not found.",
  "Bo'lim topilmadi.": "Section not found.",
  "Javoblar yo'q.": "No answers were sent.",
  "Bugun juda ko'p test topshirildi, ertaga davom eting.": "You've submitted too many tests today. Please continue tomorrow.",
  "Noto'g'ri id.": "Invalid id.",
  "Bu natija sizga tegishli emas.": "This result doesn't belong to you.",
  "Sessiya natijalari uchun ko'rib chiqish mavjud emas.": "Review isn't available for session results.",
  "Bu natija topilmadi.": "This result wasn't found.",
  "To'plam topilmadi.": "Set not found.",
  "Darslik topilmadi.": "Lesson not found.",

  // Profil, reja, Study Room
  "Sozlamalar juda katta.": "The settings are too large.",
  "Bugungi AI reja limiti tugadi. Ertaga qayta urinib ko'ring.": "You've used today's AI plan limit. Please try again tomorrow.",
  "Avval rejani sozlang.": "Set up your plan first.",
  "AI reja tuza olmadi. Qayta urinib ko'ring.": "The AI couldn't build a plan. Please try again.",
  "AI tekin limiti tugadi. Birozdan keyin qayta urinib ko'ring.": "The AI's free limit has been reached. Please try again later.",
  "AI serverlari hozir band. Bir necha daqiqadan keyin qayta urinib ko'ring.": "The AI servers are busy. Please try again in a few minutes.",
  "AI hozircha mavjud emas.": "AI features aren't available right now.",
  "AI javobini o'qib bo'lmadi. Qayta urinib ko'ring.": "Couldn't read the AI response. Please try again.",
  "Rasm formati noto'g'ri.": "Unsupported image format.",
  "Rasm hajmi juda katta.": "The image is too large.",
  "Bunday xona topilmadi yoki muddati tugagan.": "This room doesn't exist or has expired.",
  "Xona to'la — unda allaqachon 2 kishi bor.": "The room is full — there are already 2 people in it.",
};

const PATTERNS = [
  [/^Bu xonaning vaqti \((\d+) daqiqa\) tugagan\.$/, (m) => `This room's time (${m[1]} minutes) is up.`],
];

export function translateMessage(message, lang) {
  if (lang !== "en" || typeof message !== "string") return message;
  if (EN[message]) return EN[message];
  for (const [re, fn] of PATTERNS) {
    const m = message.match(re);
    if (m) return fn(m);
  }
  return message;
}

// Har bir javobdagi `message`ni so'rov tiliga moslaydi (faqat xato javoblarida).
export function localizeErrors(req, res, next) {
  const lang = req.get("x-lang") === "en" ? "en" : "uz";
  if (lang === "uz") return next();
  const json = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 400 && body && typeof body.message === "string") {
      body = { ...body, message: translateMessage(body.message, lang) };
    }
    return json(body);
  };
  next();
}
