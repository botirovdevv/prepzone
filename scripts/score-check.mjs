// ------------------------------------------------------------------
// SAT ball hisoblash tekshiruvi (npm run score:check).
//
// Statik testning haqiqiy savollari bilan sun'iy talabalar simulyatsiya
// qilinadi: javoblar IRT modeli bo'yicha, yo'nalish va ball esa serverdagi
// haqiqiy kod (server/src/lib/satScoring.js) bilan hisoblanadi.
// Tekshiriladi:
//   - monotonlik: yana bitta to'g'ri javob ballni hech qachon kamaytirmaydi;
//   - bir xil Module 2 natijasida qiyin yo'nalish >= oson yo'nalish;
//   - 0 to'g'ri -> 200, hammasi to'g'ri -> 800;
//   - qiyin yo'nalishga tushganlar ulushi 40-60%;
//   - baholash aniqligi (RMSE) va oraliq qamrovi (~68%).
// Xato bo'lsa exit 1.
//
//   node scripts/score-check.mjs              — tekshiruv + jadvallar
//   node scripts/score-check.mjs --calibrate  — theta->ball jadvalini hisoblash
// ------------------------------------------------------------------
import { getStaticSections, scoreSectionAttempt, routeFor, module2For } from "../server/src/lib/satScoring.js";
import { itemParams, pCorrect, rawToScaled, thetaToScaled } from "../src/utils/irtScoring.js";

const TEST_ID = process.env.TEST_ID || "bluebook-3";
const N = Number(process.env.N) || 2000;
const calibrate = process.argv.includes("--calibrate");

// Takrorlanadigan tasodifiy sonlar (har safar bir xil natija).
let seed = 20261120;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const normal = () => Math.sqrt(-2 * Math.log(rand() || 1e-12)) * Math.cos(2 * Math.PI * rand());

const right = (q) => (q.type === "spr" ? q.answers[0] : q.correctAnswer);
const answer = (q, ok) => (ok ? right(q) : null);
const simulate = (questions, theta, stage) =>
  questions.map((q) => answer(q, rand() < pCorrect(theta, itemParams(q, stage))));

const data = getStaticSections(TEST_ID);
if (!data) throw new Error(`Test topilmadi: ${TEST_ID}`);

const failures = [];
const check = (ok, msg) => {
  if (!ok) failures.push(msg);
};

for (const section of data.sections) {
  const id = section.id;
  const m1 = section.module1;
  const total = m1.length + section.module2Hard.length;
  console.log(`\n=== ${id.toUpperCase()} (${m1.length} + ${section.module2Hard.length}) ===`);

  // ---------------- Kalibrlash: theta -> ball ----------------
  if (calibrate) {
    // theta darajasidagi talaba qiyin yo'nalishdagi to'liq testda kutilgan
    // to'g'ri javoblar soni -> Bluebook'ga yaqin raw jadval -> ball.
    const pts = [];
    for (let t = -3; t <= 3.0001; t += 0.25) {
      const exp =
        m1.reduce((s, q) => s + pCorrect(t, itemParams(q, "m1")), 0) +
        section.module2Hard.reduce((s, q) => s + pCorrect(t, itemParams(q, "hard")), 0);
      pts.push([+t.toFixed(2), rawToScaled(id, exp, total)]);
    }
    console.log(`  ${id}: [\n    ${pts.map(([t, v]) => `[${t}, ${v}]`).join(", ")},\n  ],`);
    continue;
  }

  // ---------------- Chegaralar ----------------
  const none = scoreSectionAttempt(section, {
    module1Answers: m1.map(() => null),
    module2Answers: section.module2Easy.map(() => null),
  });
  const all = scoreSectionAttempt(section, {
    module1Answers: m1.map(right),
    module2Answers: section.module2Hard.map(right),
  });
  const m1Only = scoreSectionAttempt(section, { module1Answers: m1.map(right) });
  console.log(`  0 to'g'ri: ${none.scaledScore}   hammasi: ${all.scaledScore}   faqat M1 (to'liq): ${m1Only.scaledScore}`);
  check(none.scaledScore === 200, `${id}: 0 to'g'ri ${none.scaledScore} (200 bo'lishi kerak)`);
  check(all.scaledScore === 800, `${id}: hammasi to'g'ri ${all.scaledScore} (800 bo'lishi kerak)`);
  // Faqat Module 1 (Module 2 boshlanmagan) — Module 2 bo'sh topshirilgandek:
  // "hammasi to'g'ri" dan ancha past bo'lishi kerak.
  check(m1Only.scaledScore <= 650, `${id}: faqat Module 1 bilan ${m1Only.scaledScore} — juda yuqori`);

  // ---------------- Yo'nalish chegarasi ----------------
  // Module 1'da k ta to'g'ri (oson savollar birinchi) — qaysi k dan qiyin yo'nalish.
  const byEase = [...m1.keys()].sort((a, b) => itemParams(m1[a]).b - itemParams(m1[b]).b);
  const m1With = (k, order = byEase) => {
    const set = new Set(order.slice(0, k));
    return m1.map((q, i) => (set.has(i) ? right(q) : null));
  };
  let cut = m1.length + 1;
  for (let k = 0; k <= m1.length; k++) {
    if (routeFor(section, m1With(k)) === "hard") {
      cut = k;
      break;
    }
  }
  // Qiyin savollar birinchi bo'lsa ham chegara bir xil bo'lishi kerak (teskari ishlamaydi).
  const byHard = [...byEase].reverse();
  check(routeFor(section, m1With(cut, byHard)) === "hard", `${id}: qiyin savollar bilan ${cut} ta to'g'ri — oson yo'nalish`);
  check(cut === 0 || routeFor(section, m1With(cut - 1, byHard)) === "easy", `${id}: yo'nalish savol turiga bog'liq`);
  console.log(`  Qiyin yo'nalish: Module 1'da >= ${cut}/${m1.length} to'g'ri`);

  // ---------------- Raw -> ball jadvali (yo'nalish bo'yicha) ----------------
  const rowFor = (m1Correct, route) => {
    const m2 = route === "hard" ? section.module2Hard : section.module2Easy;
    const order = [...m2.keys()].sort((a, b) => itemParams(m2[a]).b - itemParams(m2[b]).b);
    const scores = [];
    for (let k = 0; k <= m2.length; k++) {
      const set = new Set(order.slice(0, k));
      const r = scoreSectionAttempt(section, {
        module1Answers: m1With(m1Correct),
        module2Answers: m2.map((q, i) => (set.has(i) ? right(q) : null)),
      });
      check(r.route === route, `${id}: kutilgan yo'nalish ${route}, chiqdi ${r.route}`);
      scores.push(r.scaledScore);
    }
    return scores;
  };
  const hardRow = rowFor(cut, "hard");
  const easyRow = cut > 0 ? rowFor(cut - 1, "easy") : null;
  const topRow = rowFor(m1.length, "hard");
  console.log(`  M2 to'g'ri:        ${hardRow.map((_, k) => String(k).padStart(4)).join("")}`);
  if (easyRow) console.log(`  oson  (M1=${cut - 1}):    ${easyRow.map((v) => String(v).padStart(4)).join("")}`);
  console.log(`  qiyin (M1=${cut}):    ${hardRow.map((v) => String(v).padStart(4)).join("")}`);
  console.log(`  qiyin (M1=${m1.length}):    ${topRow.map((v) => String(v).padStart(4)).join("")}`);

  for (const row of [hardRow, easyRow, topRow].filter(Boolean)) {
    row.forEach((v, k) => k > 0 && check(v >= row[k - 1], `${id}: +1 to'g'ri javob ballni kamaytirdi (${row[k - 1]} -> ${v})`));
  }
  if (easyRow) {
    easyRow.forEach((v, k) => check(hardRow[k] >= v, `${id}: M2=${k} da qiyin ${hardRow[k]} < oson ${v}`));
  }

  // Tasodifiy tartibda to'g'ri javob qo'shish — ball hech qachon kamaymaydi.
  for (let trial = 0; trial < 30; trial++) {
    const m2 = section.module2Hard;
    const order = [...m2.keys()].sort(() => rand() - 0.5);
    let prev = -1;
    for (let k = 0; k <= m2.length; k++) {
      const set = new Set(order.slice(0, k));
      const r = scoreSectionAttempt(section, {
        module1Answers: m1With(m1.length),
        module2Answers: m2.map((q, i) => (set.has(i) ? right(q) : null)),
      });
      if (r.scaledScore < prev) {
        failures.push(`${id}: tasodifiy tartibda ball kamaydi (${prev} -> ${r.scaledScore})`);
        break;
      }
      prev = r.scaledScore;
    }
  }

  // ---------------- Simulyatsiya: aniqlik va oraliq ----------------
  let sq = 0;
  let inside = 0;
  let hard = 0;
  let width = 0;
  for (let i = 0; i < N; i++) {
    const theta = normal();
    const m1Answers = simulate(m1, theta, "m1");
    const route = routeFor(section, m1Answers);
    if (route === "hard") hard++;
    const m2 = module2For(section, route);
    const r = scoreSectionAttempt(section, { module1Answers: m1Answers, module2Answers: simulate(m2, theta, route) });
    const truth = thetaToScaled(theta, id);
    sq += (r.scaledScore - truth) ** 2;
    if (truth >= r.scoreLow && truth <= r.scoreHigh) inside++;
    width += r.scoreHigh - r.scoreLow;
  }
  const rmse = Math.sqrt(sq / N);
  const coverage = inside / N;
  const hardShare = hard / N;
  console.log(
    `  Simulyatsiya (${N}): RMSE ${rmse.toFixed(1)} · oraliq qamrovi ${(coverage * 100).toFixed(1)}% · ` +
      `o'rtacha kenglik ${(width / N).toFixed(0)} · qiyin yo'nalish ${(hardShare * 100).toFixed(1)}%`
  );
  check(rmse <= 45, `${id}: RMSE ${rmse.toFixed(1)} > 45`);
  check(coverage >= 0.6 && coverage <= 0.85, `${id}: oraliq qamrovi ${(coverage * 100).toFixed(1)}%`);
  check(hardShare >= 0.4 && hardShare <= 0.6, `${id}: qiyin yo'nalish ulushi ${(hardShare * 100).toFixed(1)}%`);
}

if (!calibrate) {
  if (failures.length) {
    console.error(`\n✗ ${failures.length} ta tekshiruv o'tmadi:\n  - ${[...new Set(failures)].join("\n  - ")}`);
    process.exit(1);
  }
  console.log("\n✓ Barcha tekshiruvlar o'tdi.");
}
