// ------------------------------------------------------------------
// SAT Duel chati uchun oddiy filtr: so'kinishlar "***" bilan yopiladi,
// havolalar va @username (tashqariga olib chiqish) bloklanadi.
// Ro'yxat to'liq emas — asosiy maqsad o'smirlar uchun xavfsiz muhit.
// ------------------------------------------------------------------

// Ildizlar (so'z ichida ham ushlanadi). uz (lotin/kirill), ru, en.
const ROOTS = [
  // en
  "fuck", "shit", "bitch", "bastard", "dick", "pussy", "cunt", "whore", "slut", "nigg", "fag", "retard", "asshole",
  // ru
  "хуй", "хуе", "хуё", "пизд", "ебат", "ебан", "ёбан", "еблан", "бляд", "блят", "сука", "суки", "мудак", "гандон", "шлюх", "пидор", "пидар", "залуп",
  "xuy", "xuj", "pizd", "eban", "yeban", "blyad", "blyat", "suka", "mudak", "gandon", "pidor", "pidar", "zalup",
  // uz
  "jalab", "qanjiq", "skay", "sikay", "sikaman", "sikish", "kot", "ko't", "qo'taq", "qotaq", "harom", "itvachcha", "dalbayob", "dolbayob", "onangni",
  "жалаб", "қанжиқ", "сикай", "сикиш", "кўт", "қўтоқ", "далбаёб", "онангни",
];

// "kot" kabi qisqa ildizlar boshqa so'zlarni buzmasligi uchun faqat butun so'z sifatida.
const WHOLE_WORD = new Set(["kot", "ko't", "suka", "суки", "сука", "dick", "harom"]);

const LINK_RE = /(https?:\/\/|www\.|t\.me|telegram\.me|\b[\w-]+\.(uz|com|ru|org|net|io|me)\b|@[a-z0-9_]{3,})/i;

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const PARTS = ROOTS.map((r) => (WHOLE_WORD.has(r) ? `(?<![\\p{L}])${escape(r)}(?![\\p{L}])` : `[\\p{L}']*${escape(r)}[\\p{L}']*`));
const BAD_RE = new RegExp(PARTS.join("|"), "giu");

export const CHAT_MAX = 140;
// Boshqaruv va ko'rinmas belgilar (RTL override va h.k.).
const CONTROL_RE = new RegExp("[\\u0000-\\u001f\\u007f\\u200b-\\u200f\\u2028-\\u202e]", "g");

// { ok: true, text } yoki { ok: false, reason: "empty" | "link" }
export function cleanChat(raw) {
  const text = String(raw ?? "")
    .replace(CONTROL_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CHAT_MAX);
  if (!text) return { ok: false, reason: "empty" };
  if (LINK_RE.test(text)) return { ok: false, reason: "link" };
  return { ok: true, text: text.replace(BAD_RE, (m) => "*".repeat(Math.min(m.length, 6))) };
}

// Tayyor iboralar (matni klientda i18n'da).
export const CHAT_PRESETS = new Set(["gl", "nice", "hurry", "gg", "rematch", "wow", "fire", "laugh", "clap", "think"]);
