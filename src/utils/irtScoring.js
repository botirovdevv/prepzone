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

// theta -> 200..800 (10 ga yaxlitlangan). Nuqtalar simulyatsiya bilan
// pastdagi RAW_CURVES'ga moslangan: bir xil javoblar naqshi moslashuvchan
// va oddiy testda taxminan bir xil ball beradi (avvalgi chiziqli
// 510 + 118·theta o'rta darajada ~100 ball past chiqarardi).
const THETA_CURVE = [
  [-2.8, 200], [-2.3, 330], [-1.9, 400], [-1.5, 450], [-0.9, 515],
  [-0.2, 565], [0.7, 625], [1.6, 700], [2.4, 800],
];

export function thetaToScaled(theta) {
  const c = THETA_CURVE;
  let scaled;
  if (theta <= c[0][0]) scaled = c[0][1];
  else if (theta >= c[c.length - 1][0]) scaled = c[c.length - 1][1];
  else {
    let i = 1;
    while (c[i][0] < theta) i++;
    const [x0, y0] = c[i - 1];
    const [x1, y1] = c[i];
    scaled = y0 + ((theta - x0) / (x1 - x0)) * (y1 - y0);
  }
  return Math.round(Math.min(800, Math.max(200, scaled)) / 10) * 10;
}

// Bo'limning ikkala moduli bo'yicha yakuniy bal.
export function scoreSection(responses) {
  return thetaToScaled(estimateTheta(responses));
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
