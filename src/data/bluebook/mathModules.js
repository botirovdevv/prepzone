// Math — Module 1 va Module 2 (oson / qiyin).
// Har modulda 22 ta savol, ~25% i grid-in (SPR). Real Digital SAT'dagi
// kabi savollar modul ichida osondan qiyinga qarab joylashgan, domenlar
// aralash: Algebra ~8, Advanced Math ~7, Problem-Solving & Data
// Analysis ~4, Geometry & Trigonometry ~3.
//
// Barcha to'g'ri javoblar scratch tekshiruv skripti bilan mustaqil
// hisoblab tasdiqlangan.
import { buildModule, table, svgFigure } from "./helpers";

const ALG = "algebra";
const ADV = "advanced-math";
const PSDA = "problem-solving-data";
const GEO = "geometry-trig";
const SQ = "<sup>2</sup>";
const CUBE = "<sup>3</sup>";

const rightTriangleFigure = svgFigure(
  320,
  260,
  `<polygon points="40,220 280,220 40,40" fill="none" stroke="#111" stroke-width="2"/>
   <polyline points="40,200 60,200 60,220" fill="none" stroke="#111" stroke-width="1.5"/>
   <text x="160" y="248" text-anchor="middle">12</text>
   <text x="22" y="135" text-anchor="middle">9</text>
   <text x="175" y="118" font-style="italic">x</text>`
);

const arcFigure = svgFigure(
  300,
  270,
  `<circle cx="150" cy="150" r="100" fill="none" stroke="#111" stroke-width="2"/>
   <path d="M 63.4 100 A 100 100 0 0 1 236.6 100" fill="none" stroke="#111" stroke-width="5"/>
   <line x1="150" y1="150" x2="63.4" y2="100" stroke="#111" stroke-width="1.5"/>
   <line x1="150" y1="150" x2="236.6" y2="100" stroke="#111" stroke-width="1.5"/>
   <circle cx="150" cy="150" r="3" fill="#111"/>
   <text x="150" y="172" text-anchor="middle">O</text>
   <text x="48" y="96" text-anchor="middle">A</text>
   <text x="252" y="96" text-anchor="middle">B</text>
   <text x="150" y="135" text-anchor="middle">120°</text>
   <text x="200" y="140" text-anchor="middle">6</text>`
);

export const mathModule1 = buildModule([
  ["m1-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 3<i>x</i> + 7 = 22, what is the value of <i>x</i>?",
    choices: ["2", "3", "5", "7"], answer: 2, sortNumeric: true,
    explanation: "3x = 22 − 7 = 15, demak x = 5.",
  }],
  ["m1-02", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A store sells notebooks for $2.40 each. What is the cost, in dollars, of 15 notebooks?",
    choices: ["30", "32.40", "36", "40"], answer: 2, sortNumeric: true,
    explanation: "15 × 2.40 = 36 dollar.",
  }],
  ["m1-03", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to (<i>x</i> + 4)(<i>x</i> − 2)?`,
    choices: [`<i>x</i>${SQ} + 2<i>x</i> − 8`, `<i>x</i>${SQ} − 2<i>x</i> − 8`, `<i>x</i>${SQ} + 6<i>x</i> − 8`, `<i>x</i>${SQ} + 2<i>x</i> + 8`], answer: 0,
    explanation: "x·x + x·(−2) + 4·x + 4·(−2) = x² + 2x − 8.",
  }],
  ["m1-04", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 4<i>x</i> − 9. What is the value of <i>f</i>(5)?",
    choices: ["−9", "−4", "1", "11"], answer: 3, sortNumeric: true,
    explanation: "f(5) = 4·5 − 9 = 11.",
  }],
  ["m1-05", {
    domain: GEO, skill: "Area and perimeter", difficulty: "E",
    prompt: "A rectangle has a length of 12 centimeters and a width of 7 centimeters. What is the perimeter, in centimeters, of the rectangle?",
    answers: ["38"],
    explanation: "P = 2(12 + 7) = 38 sm.",
  }],
  ["m1-06", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: "What is the mean of the data set 4, 7, 7, 9, 13?",
    choices: ["7", "7.5", "8", "13"], answer: 2, sortNumeric: true,
    explanation: "(4 + 7 + 7 + 9 + 13) / 5 = 40 / 5 = 8.",
  }],
  ["m1-07", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "E",
    prompt: "A plumber charges a fixed fee of $45 plus $30 for each hour of work. Which equation gives the total charge <i>C</i>, in dollars, for <i>h</i> hours of work?",
    choices: ["<i>C</i> = 30<i>h</i> + 45", "<i>C</i> = 45<i>h</i> + 30", "<i>C</i> = 75<i>h</i>", "<i>C</i> = 30(<i>h</i> + 45)"], answer: 0,
    explanation: "Soatbay to'lov 30h, unga bir martalik 45 qo'shiladi: C = 30h + 45.",
  }],
  ["m1-08", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `What is the positive solution to the equation <i>x</i>${SQ} − 5<i>x</i> − 14 = 0?`,
    answers: ["7"],
    explanation: "x² − 5x − 14 = (x − 7)(x + 2) = 0, musbat yechim x = 7.",
  }],
  ["m1-09", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "2<i>x</i> + <i>y</i> = 11<br><i>x</i> − <i>y</i> = 1<br>What is the value of <i>x</i> in the solution to the system of equations above?",
    choices: ["3", "4", "5", "7"], answer: 1, sortNumeric: true,
    explanation: "Tenglamalarni qo'shsak: 3x = 12, x = 4 (y = 3).",
  }],
  ["m1-10", {
    domain: GEO, skill: "Right triangles", difficulty: "M",
    prompt: "In the right triangle shown, what is the value of <i>x</i>?",
    image: rightTriangleFigure,
    choices: ["15", "17", "21", "225"], answer: 0, sortNumeric: true,
    explanation: "Pifagor teoremasi: x² = 9² + 12² = 225, x = 15.",
  }],
  ["m1-11", {
    domain: PSDA, skill: "Percentages", difficulty: "M",
    prompt: "A shirt originally priced at $40 is on sale for 15% off the original price. What is the sale price, in dollars, of the shirt?",
    choices: ["25", "34", "35", "46"], answer: 1, sortNumeric: true,
    explanation: "40 × (1 − 0.15) = 40 × 0.85 = 34.",
  }],
  ["m1-12", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "A line in the <i>xy</i>-plane passes through the points (2, 5) and (6, 17). What is the slope of the line?",
    answers: ["3"],
    explanation: "Qiyalik = (17 − 5) / (6 − 2) = 12 / 4 = 3.",
  }],
  ["m1-13", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `If <i>f</i>(<i>x</i>) = <i>x</i>${SQ} − 3<i>x</i>, what is the value of <i>f</i>(−2)?`,
    choices: ["−10", "−2", "2", "10"], answer: 3, sortNumeric: true,
    explanation: "f(−2) = (−2)² − 3(−2) = 4 + 6 = 10.",
  }],
  ["m1-14", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    prompt: "Which of the following values of <i>x</i> satisfies the inequality 5 − 2<i>x</i> &lt; −3?",
    choices: ["2", "3", "4", "5"], answer: 3, sortNumeric: true,
    explanation: "−2x < −8 ⇒ x > 4 (manfiyga bo'lganda belgi almashadi). Faqat 5 mos.",
  }],
  ["m1-15", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "If 2<sup><i>x</i> + 1</sup> = 32, what is the value of <i>x</i>?",
    answers: ["4"],
    explanation: "32 = 2⁵, demak x + 1 = 5 va x = 4.",
  }],
  ["m1-16", {
    domain: PSDA, skill: "Inference from sample statistics", difficulty: "H",
    prompt: "In a random sample of 200 students at a school, 38 students said they walk to school. The school has 1,500 students. Based on the sample, which of the following is the best estimate of the number of students at the school who walk to school?",
    choices: ["76", "190", "285", "380"], answer: 2, sortNumeric: true,
    explanation: "Tanlanmadagi ulush 38/200 = 0.19; 0.19 × 1500 = 285.",
  }],
  ["m1-17", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The graph of <i>y</i> = <i>x</i>${SQ} − 6<i>x</i> + 13 in the <i>xy</i>-plane is a parabola. What is the <i>y</i>-coordinate of the vertex of the parabola?`,
    choices: ["−5", "3", "4", "13"], answer: 2, sortNumeric: true,
    explanation: "Uch nuqta x = 6/2 = 3 da; y = 9 − 18 + 13 = 4. (Yoki y = (x − 3)² + 4.)",
  }],
  ["m1-18", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "H",
    prompt: "3<i>x</i> + <i>ky</i> = 8<br>6<i>x</i> + 10<i>y</i> = 16<br>In the system of equations above, <i>k</i> is a constant. If the system has infinitely many solutions, what is the value of <i>k</i>?",
    choices: ["2", "5", "8", "10"], answer: 1, sortNumeric: true,
    explanation: "Ikkinchi tenglama birinchisining 2 barobari bo'lishi kerak: 2k = 10, k = 5.",
  }],
  ["m1-19", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: `The equation <i>x</i>${SQ} + <i>y</i>${SQ} − 8<i>x</i> + 6<i>y</i> = 0 defines a circle in the <i>xy</i>-plane. What is the radius of the circle?`,
    answers: ["5"],
    explanation: "To'liq kvadratga keltiramiz: (x − 4)² + (y + 3)² = 16 + 9 = 25, radius 5.",
  }],
  ["m1-20", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `If <i>x</i> &gt; 3 and (<i>x</i>${SQ} − 9) / (<i>x</i> − 3) = 10, what is the value of <i>x</i>?`,
    choices: ["7", "10", "13", "16"], answer: 0, sortNumeric: true,
    explanation: "(x² − 9)/(x − 3) = x + 3 (x ≠ 3 da), x + 3 = 10 ⇒ x = 7.",
  }],
  ["m1-21", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "H",
    prompt: "In the equation 4(2<i>x</i> − <i>a</i>) = 8<i>x</i> + 12, <i>a</i> is a constant. If the equation has infinitely many solutions, what is the value of <i>a</i>?",
    answers: ["-3"],
    explanation: "8x − 4a = 8x + 12 har qanday x uchun bajarilishi uchun −4a = 12, a = −3.",
  }],
  ["m1-22", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `What is the sum of the solutions to the equation 2<i>x</i>${SQ} − 12<i>x</i> − 7 = 0?`,
    choices: ["−6", "3", "6", "12"], answer: 2, sortNumeric: true,
    explanation: "ax² + bx + c = 0 da ildizlar yig'indisi −b/a = 12/2 = 6.",
  }],
]);

export const mathModule2Easy = buildModule([
  ["m2e-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If <i>x</i>/4 = 9, what is the value of <i>x</i>?",
    choices: ["2.25", "5", "13", "36"], answer: 3, sortNumeric: true,
    explanation: "x = 9 × 4 = 36.",
  }],
  ["m2e-02", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A car travels 180 miles in 3 hours at a constant speed. What is the car's speed, in miles per hour?",
    choices: ["50", "60", "90", "540"], answer: 1, sortNumeric: true,
    explanation: "180 / 3 = 60 mil/soat.",
  }],
  ["m2e-03", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "What value of <i>n</i> satisfies the equation <i>n</i> − 13 = 29?",
    answers: ["42"],
    explanation: "n = 29 + 13 = 42.",
  }],
  ["m2e-04", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to 3(<i>x</i>${SQ} + 2<i>x</i>) − <i>x</i>${SQ}?`,
    choices: [`2<i>x</i>${SQ} + 6<i>x</i>`, `3<i>x</i>${SQ} + 6<i>x</i>`, `2<i>x</i>${SQ} + 2<i>x</i>`, `4<i>x</i>${SQ} + 6<i>x</i>`], answer: 0,
    explanation: "3x² + 6x − x² = 2x² + 6x.",
  }],
  ["m2e-05", {
    domain: GEO, skill: "Area and perimeter", difficulty: "E",
    prompt: "A square has a side length of 9 inches. What is the area, in square inches, of the square?",
    choices: ["18", "81", "90", "162"], answer: 1, sortNumeric: true,
    explanation: "Yuza = 9² = 81.",
  }],
  ["m2e-06", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: table("Number of Pets Owned by 20 Students", ["Number of pets", "Number of students"], [["0", "6"], ["1", "8"], ["2", "4"], ["3", "2"]]) +
      "According to the table, how many of the students own at least 2 pets?",
    choices: ["2", "4", "6", "14"], answer: 2, sortNumeric: true,
    explanation: "\"Kamida 2\" — 2 ta yoki 3 ta: 4 + 2 = 6 talaba.",
  }],
  ["m2e-07", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "E",
    prompt: "Which of the following points lies on the line <i>y</i> = 2<i>x</i> + 1?",
    choices: ["(3, 7)", "(2, 4)", "(1, 2)", "(0, 2)"], answer: 0,
    explanation: "x = 3 da y = 2·3 + 1 = 7. Qolganlari tenglamani qanoatlantirmaydi.",
  }],
  ["m2e-08", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: `If <i>f</i>(<i>x</i>) = <i>x</i>${SQ} + 1, what is the value of <i>f</i>(3)?`,
    answers: ["10"],
    explanation: "f(3) = 9 + 1 = 10.",
  }],
  ["m2e-09", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "Maria has $50 in a savings account and deposits $12 into the account each week. Which expression represents the amount of money, in dollars, in the account after <i>w</i> weeks, assuming she makes no withdrawals?",
    choices: ["50 + 12<i>w</i>", "12 + 50<i>w</i>", "62<i>w</i>", "50 − 12<i>w</i>"], answer: 0,
    explanation: "Boshlang'ich 50 ga har hafta 12 qo'shiladi: 50 + 12w.",
  }],
  ["m2e-10", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "E",
    prompt: "In a triangle, two of the angles measure 50° and 60°. What is the measure, in degrees, of the third angle?",
    choices: ["70", "80", "110", "130"], answer: 0, sortNumeric: true,
    explanation: "180 − 50 − 60 = 70.",
  }],
  ["m2e-11", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "What is 30% of 250?",
    answers: ["75"],
    explanation: "0.30 × 250 = 75.",
  }],
  ["m2e-12", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "M",
    prompt: "What is the <i>y</i>-intercept of the graph of 3<i>x</i> + 2<i>y</i> = 12 in the <i>xy</i>-plane?",
    choices: ["(0, 6)", "(0, 4)", "(4, 0)", "(0, 12)"], answer: 0,
    explanation: "x = 0 da 2y = 12, y = 6: nuqta (0, 6). (4, 0) — x o'qi bilan kesishish nuqtasi.",
  }],
  ["m2e-13", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which of the following is a factor of <i>x</i>${SQ} − 16?`,
    choices: ["<i>x</i> + 4", "<i>x</i> + 8", "<i>x</i> − 16", "<i>x</i> + 16"], answer: 0,
    explanation: "Kvadratlar ayirmasi: x² − 16 = (x − 4)(x + 4).",
  }],
  ["m2e-14", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "M",
    prompt: "If 5(<i>x</i> − 2) = 3<i>x</i> + 4, what is the value of <i>x</i>?",
    answers: ["7"],
    explanation: "5x − 10 = 3x + 4 ⇒ 2x = 14 ⇒ x = 7.",
  }],
  ["m2e-15", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to (2<i>x</i>)${CUBE}?`,
    choices: [`2<i>x</i>${CUBE}`, `6<i>x</i>${CUBE}`, `8<i>x</i>${CUBE}`, "8<i>x</i>"], answer: 2,
    explanation: "(2x)³ = 2³·x³ = 8x³.",
  }],
  ["m2e-16", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `The functions <i>f</i> and <i>g</i> are defined by <i>f</i>(<i>x</i>) = 3<i>x</i> − 5 and <i>g</i>(<i>x</i>) = <i>x</i>${SQ}. What is the value of <i>f</i>(<i>g</i>(2))?`,
    choices: ["1", "4", "7", "11"], answer: 2, sortNumeric: true,
    explanation: "g(2) = 4, f(4) = 12 − 5 = 7.",
  }],
  ["m2e-17", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>x</i> + <i>y</i> = 10<br><i>x</i> − <i>y</i> = 4<br>If (<i>x</i>, <i>y</i>) is the solution to the system of equations above, what is the value of <i>xy</i>?",
    choices: ["10", "21", "24", "28"], answer: 1, sortNumeric: true,
    explanation: "Qo'shsak 2x = 14, x = 7; y = 3; xy = 21.",
  }],
  ["m2e-18", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `What are the solutions to the equation <i>x</i>${SQ} − 9<i>x</i> + 20 = 0?`,
    choices: ["4 and 5", "−4 and −5", "2 and 10", "−2 and −10"], answer: 0,
    explanation: "x² − 9x + 20 = (x − 4)(x − 5), yechimlar 4 va 5.",
  }],
  ["m2e-19", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "A line in the <i>xy</i>-plane has a slope of 2 and passes through the point (1, 3). What is the <i>y</i>-coordinate of the <i>y</i>-intercept of the line?",
    answers: ["1"],
    explanation: "y = 2x + b; 3 = 2·1 + b ⇒ b = 1.",
  }],
  ["m2e-20", {
    domain: GEO, skill: "Area and volume", difficulty: "H",
    prompt: "A right circular cylinder has a radius of 3 units and a height of 5 units. The volume of the cylinder is <i>k</i>π cubic units. What is the value of <i>k</i>?",
    answers: ["45"],
    explanation: "V = πr²h = π·9·5 = 45π, demak k = 45.",
  }],
  ["m2e-21", {
    domain: PSDA, skill: "One-variable data", difficulty: "H",
    prompt: "The mean of a list of five numbers is 12. When a sixth number is added to the list, the mean of the six numbers is 13. What is the sixth number?",
    choices: ["13", "18", "25", "78"], answer: 1, sortNumeric: true,
    explanation: "Beshta son yig'indisi 60, oltitasi 78; oltinchi son 78 − 60 = 18.",
  }],
  ["m2e-22", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 2<sup><i>x</i></sup>. What is the value of <i>f</i>(5) − <i>f</i>(3)?",
    choices: ["4", "24", "32", "40"], answer: 1, sortNumeric: true,
    explanation: "2⁵ − 2³ = 32 − 8 = 24.",
  }],
]);

export const mathModule2Hard = buildModule([
  ["m2h-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 7<i>x</i> − 4 = 3<i>x</i> + 20, what is the value of <i>x</i>?",
    choices: ["2", "4", "6", "8"], answer: 2, sortNumeric: true,
    explanation: "4x = 24 ⇒ x = 6.",
  }],
  ["m2h-02", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 2(<i>x</i> + 3) = 20, what is the value of <i>x</i>?",
    choices: ["7", "8.5", "10", "14"], answer: 0, sortNumeric: true,
    explanation: "x + 3 = 10 ⇒ x = 7.",
  }],
  ["m2h-03", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "E",
    prompt: `If 3<i>x</i>${SQ} = 75 and <i>x</i> &gt; 0, what is the value of <i>x</i>?`,
    choices: ["5", "15", "25", "75"], answer: 0, sortNumeric: true,
    explanation: "x² = 25, x > 0 ⇒ x = 5.",
  }],
  ["m2h-04", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "Line <i>ℓ</i> in the <i>xy</i>-plane passes through the point (−2, 3) and is perpendicular to the line <i>y</i> = 2<i>x</i> − 7. Which equation defines line <i>ℓ</i>?",
    choices: ["<i>y</i> = −(1/2)<i>x</i> + 2", "<i>y</i> = (1/2)<i>x</i> + 4", "<i>y</i> = −(1/2)<i>x</i> + 4", "<i>y</i> = 2<i>x</i> + 7"], answer: 0,
    explanation: "Perpendikulyar qiyalik −1/2. y − 3 = −(1/2)(x + 2) ⇒ y = −(1/2)x + 2.",
  }],
  ["m2h-05", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to (<i>x</i>${SQ} − 25) / (<i>x</i>${SQ} + 3<i>x</i> − 10), for <i>x</i> ≠ −5 and <i>x</i> ≠ 2?`,
    choices: ["(<i>x</i> − 5) / (<i>x</i> − 2)", "(<i>x</i> + 5) / (<i>x</i> − 2)", "(<i>x</i> − 5) / (<i>x</i> + 2)", "−25 / (3<i>x</i> − 10)"], answer: 0,
    explanation: "(x − 5)(x + 5) / ((x + 5)(x − 2)) = (x − 5)/(x − 2).",
  }],
  ["m2h-06", {
    domain: PSDA, skill: "One-variable data", difficulty: "M",
    prompt: "Data set A: 10, 20, 30, 40, 50<br>Data set B: 28, 29, 30, 31, 32<br>Which of the following statements about the two data sets is true?",
    choices: [
      "The means are equal, and the standard deviation of data set A is greater.",
      "The means are equal, and the standard deviation of data set B is greater.",
      "The mean of data set A is greater, and the standard deviations are equal.",
      "The means are equal, and the standard deviations are equal.",
    ], answer: 0,
    explanation: "Ikkala o'rtacha 30. A qiymatlari o'rtachadan ancha uzoq tarqalgan — standart chetlanishi katta.",
  }],
  ["m2h-07", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    prompt: "In right triangle <i>ABC</i>, angle <i>C</i> is a right angle and sin <i>A</i> = 3/5. What is the value of cos <i>A</i>?",
    answers: ["4/5", ".8", "0.8"],
    explanation: "Qarama-qarshi katet 3, gipotenuza 5 ⇒ yopishgan katet 4; cos A = 4/5.",
  }],
  ["m2h-08", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "A theater sells adult tickets for $12 each and child tickets for $7 each. On one night, the theater sold 40 tickets for a total of $380. How many adult tickets were sold that night?",
    answers: ["20"],
    explanation: "a + c = 40, 12a + 7c = 380 ⇒ 12a + 7(40 − a) = 380 ⇒ 5a = 100 ⇒ a = 20.",
  }],
  ["m2h-09", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = <i>a</i>(<i>x</i> − 1)(<i>x</i> − 5), where <i>a</i> is a constant. The maximum value of <i>f</i> is 8. What is the value of <i>a</i>?",
    choices: ["−4", "−2", "2", "4"], answer: 1, sortNumeric: true,
    explanation: "Uch nuqta ildizlar o'rtasida, x = 3 da: f(3) = a(2)(−2) = −4a = 8 ⇒ a = −2.",
  }],
  ["m2h-10", {
    domain: PSDA, skill: "Percentages", difficulty: "M",
    prompt: "The value of a car is $25,000 and decreases by 12% each year. Which expression gives the value of the car, in dollars, after <i>t</i> years?",
    choices: ["25,000(0.88)<sup><i>t</i></sup>", "25,000(0.12)<sup><i>t</i></sup>", "25,000(1.12)<sup><i>t</i></sup>", "25,000 − 0.12<i>t</i>"], answer: 0,
    explanation: "Har yili qiymatning 88% i qoladi: 25,000·(0.88)^t.",
  }],
  ["m2h-11", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>y</i> = 3<i>x</i> + 2<br><i>y</i> = <i>cx</i> − 5<br>In the system of equations above, <i>c</i> is a constant. For what value of <i>c</i> does the system have no solution?",
    choices: ["−3", "2", "3", "5"], answer: 2, sortNumeric: true,
    explanation: "Parallel (qiyaliklari teng, kesishmalari har xil) bo'lishi kerak: c = 3.",
  }],
  ["m2h-12", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `What is the sum of all solutions to the equation (<i>x</i> − 3)${SQ} = 4<i>x</i> − 12?`,
    answers: ["10"],
    explanation: "x² − 6x + 9 = 4x − 12 ⇒ x² − 10x + 21 = 0 ⇒ (x − 3)(x − 7) = 0; 3 + 7 = 10.",
  }],
  ["m2h-13", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: "In the circle shown, point <i>O</i> is the center, the radius is 6, and the measure of central angle <i>AOB</i> is 120°. What is the length of the bold arc <i>AB</i>?",
    image: arcFigure,
    choices: ["2π", "4π", "6π", "12π"], answer: 1, rotate: 0,
    explanation: "Yoy uzunligi = (120/360)·2π·6 = 4π.",
  }],
  ["m2h-14", {
    domain: PSDA, skill: "Probability and conditional probability", difficulty: "H",
    prompt: table("Students Who Play a Sport, by Grade", ["", "Plays a sport", "Does not play a sport", "Total"], [["Grade 9", "45", "35", "80"], ["Grade 10", "60", "60", "120"], ["Total", "105", "95", "200"]]) +
      "If a student who plays a sport is selected at random from these students, what is the probability that the student is in grade 10?",
    choices: ["3/7", "1/2", "4/7", "3/5"], answer: 2, rotate: 0,
    explanation: "Sport bilan shug'ullanuvchilar 105 ta, ulardan 10-sinf 60 ta: 60/105 = 4/7.",
  }],
  ["m2h-15", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "H",
    prompt: "If <i>x</i> &gt; 0 and <i>x</i><sup>2/3</sup> = 16, what is the value of <i>x</i>?",
    choices: ["8", "24", "64", "256"], answer: 2, sortNumeric: true,
    explanation: "x = 16^(3/2) = (√16)³ = 4³ = 64.",
  }],
  ["m2h-16", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "H",
    prompt: "3<i>x</i> + 4<i>y</i> = 18<br>5<i>x</i> − 2<i>y</i> = 4<br>If (<i>x</i>, <i>y</i>) is the solution to the system of equations above, what is the value of <i>x</i> + <i>y</i>?",
    answers: ["5"],
    explanation: "Ikkinchisini 2 ga ko'paytirib qo'shsak: 13x = 26, x = 2; 4y = 12, y = 3; x + y = 5.",
  }],
  ["m2h-17", {
    domain: ALG, skill: "Linear inequalities", difficulty: "H",
    prompt: "A company's profit <i>P</i>, in dollars, from selling <i>n</i> units of a product is given by <i>P</i> = 45<i>n</i> − 1,200. What is the minimum number of units the company must sell to earn a profit of at least $600?",
    choices: ["27", "40", "45", "67"], answer: 1, sortNumeric: true,
    explanation: "45n − 1200 ≥ 600 ⇒ 45n ≥ 1800 ⇒ n ≥ 40.",
  }],
  ["m2h-18", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The polynomial <i>p</i> is defined by <i>p</i>(<i>x</i>) = <i>x</i>${CUBE} − 2<i>x</i>${SQ} − 5<i>x</i> + 6. Which of the following is a factor of <i>p</i>(<i>x</i>)?`,
    choices: ["<i>x</i> − 3", "<i>x</i> + 3", "<i>x</i> − 2", "<i>x</i> + 1"], answer: 0,
    explanation: "p(3) = 27 − 18 − 15 + 6 = 0, demak (x − 3) ko'paytuvchi. p(x) = (x − 1)(x − 3)(x + 2).",
  }],
  ["m2h-19", {
    domain: PSDA, skill: "One-variable data", difficulty: "H",
    prompt: "The mean score of 20 students on a test was 78. The mean score of the 8 boys in the group was 72. What was the mean score of the 12 girls in the group?",
    answers: ["82"],
    explanation: "Jami ball 20·78 = 1560; o'g'il bolalar 8·72 = 576; qizlar (1560 − 576)/12 = 82.",
  }],
  ["m2h-20", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "H",
    prompt: "A line in the <i>xy</i>-plane has an <i>x</i>-intercept at (4, 0) and a <i>y</i>-intercept at (0, −6). Which of the following is an equation of the line?",
    choices: ["3<i>x</i> − 2<i>y</i> = 12", "2<i>x</i> − 3<i>y</i> = 12", "3<i>x</i> + 2<i>y</i> = 12", "2<i>x</i> + 3<i>y</i> = −12"], answer: 0,
    explanation: "(4, 0): 3·4 − 0 = 12 ✓; (0, −6): 0 + 12 = 12 ✓. Boshqa variantlar kamida bitta nuqtada bajarilmaydi.",
  }],
  ["m2h-21", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The graph of <i>y</i> = <i>x</i>${SQ} + <i>bx</i> + 16, where <i>b</i> is a positive constant, intersects the <i>x</i>-axis at exactly one point. What is the value of <i>b</i>?`,
    choices: ["4", "8", "16", "32"], answer: 1, sortNumeric: true,
    explanation: "Bitta kesishish ⇒ diskriminant 0: b² − 64 = 0, b > 0 ⇒ b = 8.",
  }],
  ["m2h-22", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: `The point (5, <i>k</i>) lies on the circle defined by (<i>x</i> − 2)${SQ} + (<i>y</i> + 1)${SQ} = 25 in the <i>xy</i>-plane. If <i>k</i> &gt; 0, what is the value of <i>k</i>?`,
    answers: ["3"],
    explanation: "9 + (k + 1)² = 25 ⇒ (k + 1)² = 16 ⇒ k = 3 yoki k = −5; k > 0 ⇒ k = 3.",
  }],
]);
