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
// kalibrlashdir. Tekshiruv va kalibrlash: `npm run score:check`
// (scripts/score-check.mjs) — monotonlik, yo'nalishlar tartibi, 200/800
// chegaralari va baholash aniqligi (RMSE) simulyatsiya bilan tekshiriladi.
// ------------------------------------------------------------------

// Savol parametrlari qiyinlik belgisidan (E/M/H yoki easy/medium/hard)
// va savol qaysi modulda turganidan kelib chiqadi. Qiyin Module 2'dagi
// savollar bir xil belgida ham qiyinroq (Bluebook'dagi kabi), oson Module
// 2'dagilar — osonroq. Qiyin savollar talabalarni yaxshiroq ajratadi (a).
const DIFFICULTY_B = { E: -1.0, M: 0.2, H: 1.3, easy: -1.0, medium: 0.2, hard: 1.3 };
const DIFFICULTY_A = { E: 1.0, M: 1.15, H: 1.3, easy: 1.0, medium: 1.15, hard: 1.3 };
const STAGE_SHIFT = { m1: 0, easy: -0.35, hard: 0.35, mixed: 0 };
const D = 1.7;
// 4 variantli savolda "omadli taxmin" ehtimoli. Yaxshi distraktorlar bilan
// real taxmin ehtimoli 0.25 dan past; kichik c qiyin savolni to'g'ri yechgan
// talabaning ballini "tasodif" deb kamaytirib yubormaydi. SPR'da taxmin yo'q.
const GUESS_MCQ = 0.15;
// Prior N(0, PRIOR_SD²): kengroq prior chekka ballarni o'rtaga kamroq tortadi.
const PRIOR_SD = 1.2;

const GRID = [];
for (let t = -4; t <= 4.0001; t += 0.02) GRID.push(+t.toFixed(2));

export function itemParams(q, stage = "m1") {
  return {
    a: DIFFICULTY_A[q.difficulty] ?? 1.15,
    b: (DIFFICULTY_B[q.difficulty] ?? 0.2) + (STAGE_SHIFT[stage] ?? 0),
    c: q.type === "spr" ? 0 : GUESS_MCQ,
  };
}

export function pCorrect(theta, { a, b, c }) {
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
// Qobiliyatni baholash (EAP) va uning xatoligi (posterior SD)
// ------------------------------------------------------------------

// responses: [{ q, correct: boolean, stage? }] -> { theta, se }
export function estimateTheta(responses) {
  const items = responses.map((r) => ({ p: itemParams(r.q, r.stage), correct: r.correct }));
  const logs = GRID.map((theta) => {
    let logL = (-0.5 * theta * theta) / (PRIOR_SD * PRIOR_SD);
    for (const { p, correct } of items) {
      const pc = pCorrect(theta, p);
      logL += Math.log(correct ? pc : 1 - pc);
    }
    return logL;
  });
  const max = Math.max(...logs);
  let w0 = 0;
  let w1 = 0;
  let w2 = 0;
  GRID.forEach((theta, i) => {
    const w = Math.exp(logs[i] - max);
    w0 += w;
    w1 += w * theta;
    w2 += w * theta * theta;
  });
  const theta = w1 / w0;
  return { theta, se: Math.sqrt(Math.max(0, w2 / w0 - theta * theta)) };
}

// stage: "m1" | "easy" | "hard" | "mixed" — savol parametrlari uchun.
export function buildResponses(questions, answers, stage = "m1") {
  return questions.map((q, i) => ({ q, stage, correct: isAnswerCorrect(q, answers[i]) }));
}

// Module 2 yo'nalishi Module 1'dagi to'g'ri javoblar ULUSHI bo'yicha:
// qaysi savollar emas, nechta savol to'g'riligi hal qiladi — tushunarli
// va hech qachon teskari ishlamaydi (qiyin savolni yechish zarar qilmaydi).
// Chegaralar talabalarning taxminan yuqori yarmini qiyin modulga yuboradi.
export const ROUTING_SHARE = { rw: 0.5, math: 0.55 };

export function decideRouteIrt(module1Questions, module1Answers, sectionId) {
  const total = module1Questions.length;
  if (!total) return "easy";
  const correct = buildResponses(module1Questions, module1Answers).filter((r) => r.correct).length;
  const share = ROUTING_SHARE[sectionId] ?? 0.55;
  return correct >= Math.ceil(share * total - 1e-9) ? "hard" : "easy";
}

// theta -> 200..800, har bo'lim uchun alohida. SAT shkalasi qanday
// aniqlangan bo'lsa shunday: o'rtadagi qism — College Board e'lon qilgan
// o'rtacha va standart og'ish (RW ≈ 519 ± 104, Math ≈ 505 ± 115; theta
// test topshiruvchilar uchun ~N(0,1)). Chetlari — hamma savol noto'g'ri
// (theta ≈ −2.9) 200 ga, hammasi to'g'ri (theta ≈ 2.9–3.1) 800 ga bog'langan.
// Tekshiruv: npm run score:check.
const THETA_CURVES = {
  rw: [[-2.9, 200], [-2, 311], [-1, 415], [0, 519], [1, 623], [2, 727], [3.1, 800]],
  math: [[-2.9, 200], [-2, 275], [-1, 390], [0, 505], [1, 620], [2, 735], [2.9, 800]],
};
// Oson Module 2 yo'nalishidagi eng yuqori ball (Bluebook'dagi kabi
// cheklangan): oson modulni mukammal yechish qiyin yo'nalish darajasini bermaydi.
export const EASY_ROUTE_CAP = { rw: 640, math: 660 };

const round10 = (x) => Math.round(Math.min(800, Math.max(200, x)) / 10) * 10;

function interp(curve, x) {
  if (x <= curve[0][0]) return curve[0][1];
  if (x >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
  let i = 1;
  while (curve[i][0] < x) i++;
  const [x0, y0] = curve[i - 1];
  const [x1, y1] = curve[i];
  return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
}

export function thetaToScaled(theta, sectionId = "rw") {
  return round10(interp(THETA_CURVES[sectionId] || THETA_CURVES.rw, theta));
}

// Ball oralig'i: ±1 xatolik (taxminan 68% ishonch), 10 ga yaxlitlangan,
// ±20 dan tor va ±60 dan keng emas.
function rangeAround(score, low, high) {
  const lo = Math.min(score - 20, Math.max(score - 60, low));
  const hi = Math.max(score + 20, Math.min(score + 60, high));
  return { scoreLow: round10(lo), scoreHigh: round10(hi) };
}

// Bo'limning ikkala moduli bo'yicha yakuniy bal va ehtimoliy oraliq.
export function scoreSection(responses, sectionId = "rw", route = null) {
  // Real SAT'dagi kabi: hamma savol to'g'ri — 800, birortasi ham to'g'ri
  // emas — 200 (savollar to'plamidan qat'i nazar).
  const correct = responses.filter((r) => r.correct).length;
  if (responses.length && correct === responses.length && route !== "easy") {
    return { scaledScore: 800, scoreLow: 780, scoreHigh: 800, theta: 4, se: 0 };
  }
  if (responses.length && correct === 0) {
    return { scaledScore: 200, scoreLow: 200, scoreHigh: 220, theta: -4, se: 0 };
  }
  const { theta, se } = estimateTheta(responses);
  const cap = route === "easy" ? EASY_ROUTE_CAP[sectionId] ?? 800 : 800;
  const scale = (t) => Math.min(cap, thetaToScaled(t, sectionId));
  const scaledScore = scale(theta);
  return { scaledScore, theta, se, ...rangeAround(scaledScore, scale(theta - se), scale(theta + se)) };
}

// ------------------------------------------------------------------
// Moslashuvchan bo'lmagan (Module 2 bitta, "mixed") testlar uchun
// raw -> 200..800 jadvali.
//
// PDF'dan import qilingan real imtihon testlarida Module 2 yo'nalishi yo'q
// va savol qiyinligi AI taxmini — IRT bunday testda ballni ~100 ga past
// chiqarardi. O'rniga College Board'ning Bluebook practice testlaridagi
// konversiya jadvallariga yaqin egri chiziq ishlatiladi (taxminiy, rasmiy
// emas — har bir testning jadvali biroz farq qiladi). Savollar soni
// standartdan farq qilsa, to'g'ri javoblar ulushi bo'yicha o'lchanadi.
// ------------------------------------------------------------------
const RAW_CURVES = {
  // 54 savol (27 + 27)
  rw: [
    [0, 200], [3, 210], [5, 230], [10, 300], [15, 360], [20, 410], [25, 450],
    [30, 500], [35, 540], [40, 590], [45, 640], [48, 680], [50, 710],
    [52, 750], [53, 770], [54, 800],
  ],
  // 44 savol (22 + 22)
  math: [
    [0, 200], [3, 220], [5, 260], [10, 350], [15, 420], [20, 470], [25, 520],
    [30, 570], [35, 630], [38, 670], [40, 700], [42, 740], [43, 770], [44, 800],
  ],
};

export const hasRawCurve = (sectionId) => !!RAW_CURVES[sectionId];

// Raw jadval bo'yicha ball oralig'i: to'g'ri javoblar sonining binomial
// xatoligi (sqrt(n·p·(1−p))) jadval orqali ballga o'tkaziladi.
export function rawScoreRange(sectionId, correct, total) {
  const score = rawToScaled(sectionId, correct, total);
  if (!total) return { scoreLow: score, scoreHigh: score };
  const p = Math.min(0.97, Math.max(0.03, correct / total));
  const sd = Math.sqrt(total * p * (1 - p));
  return rangeAround(score, rawToScaled(sectionId, correct - sd, total), rawToScaled(sectionId, correct + sd, total));
}

export function rawToScaled(sectionId, correct, total) {
  const curve = RAW_CURVES[sectionId];
  if (!curve || !total) return 200;
  const full = curve[curve.length - 1][0];
  const raw = (Math.max(0, Math.min(correct, total)) / total) * full;
  let i = 1;
  while (i < curve.length - 1 && curve[i][0] < raw) i++;
  const [x0, y0] = curve[i - 1];
  const [x1, y1] = curve[i];
  const scaled = y0 + ((raw - x0) / (x1 - x0)) * (y1 - y0);
  return Math.round(Math.min(800, Math.max(200, scaled)) / 10) * 10;
}
