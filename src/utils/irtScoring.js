// ------------------------------------------------------------------
// Digital SAT uslubidagi IRT (Item Response Theory) baholash.
//
// Real SAT'da bal "nechta to'g'ri" emas, balki "qaysi savollarga to'g'ri
// javob berildi" asosida hisoblanadi: har bir savolning o'z qiyinligi
// (b), farqlash kuchi (a) va taxmin qilish ehtimoli (c) bor (3PL
// model). Talabaning qobiliyati (theta) shu javoblar naqshidan baholanadi
// va 200-800 shkalaga o'tkaziladi. Shuning uchun qiyin Module 2'dagi
// to'g'ri javob osonidagidan ko'proq bal beradi, oson Module 2'ga
// tushgan talabaning bali esa tabiiy ravishda cheklanadi.
//
// College Board item parametrlarini e'lon qilmaydi — quyidagi qiymatlar
// savol qiyinlik belgisidan (E/M/H) kelib chiqadigan TAXMINIY
// kalibrlashdir (simulyatsiya bilan sozlangan: mukammal javob — 800,
// oson Module 2 yo'nalishida bal ~580 atrofida cheklanadi).
// ------------------------------------------------------------------

// E/M/H — statik testlar; easy/medium/hard — admin savol bankidan.
const DIFFICULTY_B = { E: -1.4, M: 0, H: 1.4, easy: -1.4, medium: 0, hard: 1.4 };
const DISCRIMINATION = 1.1;
const D = 1.7;
// 4 variantli savolda tasodifiy taxmin ehtimoli; SPR (javobni yozish)
// savolida taxmin deyarli imkonsiz.
const GUESS_MCQ = 0.2;

// Module 1'dan keyingi theta shu qiymatdan yuqori bo'lsa — qiyin Module 2.
export const ROUTING_THETA = 0.1;

const GRID = [];
for (let t = -4; t <= 4.0001; t += 0.05) GRID.push(+t.toFixed(2));

function itemParams(q) {
  return {
    a: DISCRIMINATION,
    b: DIFFICULTY_B[q.difficulty] ?? 0,
    c: q.type === "spr" ? 0 : GUESS_MCQ,
  };
}

function pCorrect(theta, { a, b, c }) {
  return c + (1 - c) / (1 + Math.exp(-D * a * (theta - b)));
}

// ------------------------------------------------------------------
// Javobni tekshirish (MCQ va SPR)
// ------------------------------------------------------------------

// "3/4", ".75", "0.75", "-2", "1.5" kabi yozuvlarni songa aylantiradi.
// Aralash kasr ("1 1/2") SAT qoidasi bo'yicha qabul qilinmaydi.
export function parseSprValue(raw) {
  if (raw == null) return null;
  const s = String(raw).trim().replace(/\s+/g, "");
  if (!s) return null;
  if (/^-?\d+\/\d+$/.test(s)) {
    const [n, d] = s.split("/").map(Number);
    return d === 0 ? null : n / d;
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s);
  return null;
}

// SPR savolda `answers` — qabul qilinadigan javoblar ro'yxati (masalan
// ["2/3", ".6666", ".6667", "0.666", "0.667"]). Bluebook'dagi kabi,
// yozilgan qiymat ro'yxatdagi biror javobga son sifatida teng bo'lsa
// (kasr/o'nli farqi muhim emas) to'g'ri hisoblanadi.
export function isAnswerCorrect(q, answer) {
  if (answer == null || answer === "") return false;
  if (q.type !== "spr") return answer === q.correctAnswer;
  const value = parseSprValue(answer);
  if (value == null) return false;
  return (q.answers || []).some((acc) => {
    const accValue = parseSprValue(acc);
    return accValue != null && Math.abs(accValue - value) < 1e-9;
  });
}

// ------------------------------------------------------------------
// Qobiliyatni baholash (EAP — standart normal prior bilan)
// ------------------------------------------------------------------

// responses: [{ q, correct: boolean }]
export function estimateTheta(responses) {
  let num = 0;
  let den = 0;
  for (const theta of GRID) {
    let logL = -0.5 * theta * theta;
    for (const { q, correct } of responses) {
      const p = pCorrect(theta, itemParams(q));
      logL += Math.log(correct ? p : 1 - p);
    }
    const w = Math.exp(logL);
    num += theta * w;
    den += w;
  }
  return den > 0 ? num / den : 0;
}

export function buildResponses(questions, answers) {
  return questions.map((q, i) => ({ q, correct: isAnswerCorrect(q, answers[i]) }));
}

export function decideRouteIrt(module1Questions, module1Answers) {
  const theta = estimateTheta(buildResponses(module1Questions, module1Answers));
  return theta >= ROUTING_THETA ? "hard" : "easy";
}

// theta -> 200..800 (10 ga yaxlitlangan)
export function thetaToScaled(theta) {
  const scaled = 510 + 118 * theta;
  return Math.round(Math.min(800, Math.max(200, scaled)) / 10) * 10;
}

// Bo'limning ikkala moduli bo'yicha yakuniy bal.
export function scoreSection(responses) {
  return thetaToScaled(estimateTheta(responses));
}
