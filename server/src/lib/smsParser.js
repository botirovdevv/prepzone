// ------------------------------------------------------------------
// Bank SMS'idan kirim summasini ajratish (HUMO, Uzcard, banklar; lotin,
// kirill va ruscha translit). Faqat kirim (popolnenie / zachislenie /
// pul tushdi ...) xabarlari hisobga olinadi; xarid, yechib olish va
// balans summalari e'tiborsiz qoldiriladi.
//
// Qaytaradi: { isIncome, amount } — amount butun so'm (tiyinlar tashlanadi).
// ------------------------------------------------------------------

const INCOME = [
  "popolnenie", "popolnen", "zachislenie", "zachisleno", "postuplenie", "perevod na kartu", "prihod", "prixod",
  "пополнение", "пополнен", "зачисление", "зачислено", "поступление", "перевод на карту", "приход",
  "kirim", "tushdi", "tushum", "o'tkazildi", "o‘tkazildi", "otkazildi", "hisobingizga", "kartangizga",
  "кирим", "тушди", "o'tkazma qabul", "qabul qilindi", "credit", "received", "incoming",
];

const OUTGOING = [
  "spisanie", "списание", "oplata", "оплата", "pokupka", "покупка", "snyatie", "снятие", "yechildi", "ечилди",
  "to'lov amalga", "xarid", "debit", "purchase", "withdrawal", "perevod s karty", "перевод с карты",
];

// Shu so'zlardan keyin kelgan summa — balans, kirim emas.
const BALANCE = /(balans|balance|ostatok|dostupno|qoldiq|баланс|остаток|доступно|қолдиқ|limit)\s*[:=]?\s*$/i;

const CURRENCY = "(?<![A-Za-zА-Яа-я])(?:UZS|uzs|sum|so['‘’`]?m|сум|сўм|soum)(?![A-Za-zА-Яа-я])";
// Raqam: 129037 | 129 037 | 129,037 | 129.037 | 129 037.00 | 129.037,00
const NUM = "(\\d{1,3}(?:[ \\u00a0.,]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)";
const AMOUNT_RE = new RegExp(`([+-]?)\\s*${NUM}\\s*${CURRENCY}|${CURRENCY}\\s*([+-]?)\\s*${NUM}`, "gi");

export function parseNumber(raw) {
  // Oxirgi ajratkichdan keyin 1-2 raqam bo'lsa — bu tiyin (tashlanadi),
  // qolgan ajratkichlar minglik.
  const s = raw
    .replace(/[\s ]/g, "")
    .replace(/[.,]\d{1,2}$/, "")
    .replace(/[.,]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function findAmounts(text) {
  const out = [];
  AMOUNT_RE.lastIndex = 0;
  let m;
  while ((m = AMOUNT_RE.exec(text))) {
    const sign = m[1] || m[3] || "";
    const raw = m[2] || m[4];
    const value = parseNumber(raw);
    if (value == null) continue;
    const before = text.slice(Math.max(0, m.index - 25), m.index);
    out.push({ index: m.index, sign, value, isBalance: BALANCE.test(before) });
  }
  return out;
}

const firstIndex = (lower, words) => {
  let best = -1;
  for (const w of words) {
    const i = lower.indexOf(w);
    if (i !== -1 && (best === -1 || i < best)) best = i;
  }
  return best;
};

export function parseBankSms(body) {
  const text = String(body || "");
  const lower = text.toLowerCase();
  const amounts = findAmounts(text).filter((a) => !a.isBalance);
  const incomeAt = firstIndex(lower, INCOME);
  const outAt = firstIndex(lower, OUTGOING);
  const plus = amounts.find((a) => a.sign === "+");

  let isIncome = false;
  if (incomeAt !== -1 && (outAt === -1 || incomeAt < outAt)) isIncome = true;
  else if (plus && outAt === -1) isIncome = true;
  if (!isIncome) return { isIncome: false, amount: null };

  // "+" belgili summa ishonchliroq; aks holda kirim so'zidan keyingi birinchisi.
  const pick = plus || amounts.find((a) => a.index >= incomeAt && a.sign !== "-") || amounts.find((a) => a.sign !== "-");
  return { isIncome: true, amount: pick ? pick.value : null };
}
