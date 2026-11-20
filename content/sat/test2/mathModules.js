// Practice Test 2 — Math, Module 1 va Module 2 (oson / qiyin).
// Tuzilma Test 1 bilan bir xil: har modulda 22 ta savol, 6 tasi grid-in,
// savollar osondan qiyinga qarab joylashgan. Barcha javoblar tekshiruv
// skripti bilan mustaqil hisoblab tasdiqlangan.
import { buildModule, svgFigure } from "../helpers.js";

const ALG = "algebra";
const ADV = "advanced-math";
const PSDA = "problem-solving-data";
const GEO = "geometry-trig";
const SQ = "<sup>2</sup>";
const CUBE = "<sup>3</sup>";

const ladderFigure = svgFigure(
  300,
  260,
  `<line x1="60" y1="20" x2="60" y2="230" stroke="#111" stroke-width="3"/>
   <line x1="30" y1="230" x2="270" y2="230" stroke="#111" stroke-width="3"/>
   <line x1="60" y1="50" x2="135" y2="230" stroke="#111" stroke-width="2"/>
   <polyline points="60,212 78,212 78,230" fill="none" stroke="#111" stroke-width="1.5"/>
   <text x="108" y="135" font-style="italic">13 ft</text>
   <text x="97" y="250" text-anchor="middle">5 ft</text>
   <text x="42" y="145" text-anchor="middle" font-style="italic">h</text>`
);

export const t2MathModule1 = buildModule([
  ["t2-m1-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 5<i>x</i> − 3 = 27, what is the value of <i>x</i>?",
    choices: ["2", "4.8", "5", "6"], answer: 3, sortNumeric: true,
    explanation: "5x = 30, x = 6.",
  }],
  ["t2-m1-02", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A recipe uses 4 eggs to make 12 muffins. At this rate, how many eggs are needed to make 30 muffins?",
    choices: ["10", "12", "15", "26"], answer: 0, sortNumeric: true,
    explanation: "Har bir muffin uchun 4/12 = 1/3 tuxum; 30 × 1/3 = 10.",
  }],
  ["t2-m1-03", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: "Which expression is equivalent to 2<i>x</i>(<i>x</i> + 5)?",
    choices: [`2<i>x</i>${SQ} + 10<i>x</i>`, `2<i>x</i>${SQ} + 5<i>x</i>`, `2<i>x</i>${SQ} + 10`, "3<i>x</i> + 5"], answer: 0,
    explanation: "2x·x + 2x·5 = 2x² + 10x.",
  }],
  ["t2-m1-04", {
    domain: ALG, skill: "Linear expressions", difficulty: "E",
    prompt: "What is the value of 3<i>a</i> + <i>b</i> when <i>a</i> = 4 and <i>b</i> = −2?",
    answers: ["10"],
    explanation: "3·4 + (−2) = 12 − 2 = 10.",
  }],
  ["t2-m1-05", {
    domain: GEO, skill: "Circles", difficulty: "E",
    prompt: "A circle has a radius of 5 centimeters. What is the circumference, in centimeters, of the circle?",
    choices: ["5π", "10π", "25π", "100π"], answer: 1, rotate: 0,
    explanation: "C = 2πr = 2π·5 = 10π.",
  }],
  ["t2-m1-06", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: "What is the median of the data set 3, 8, 5, 12, 9?",
    choices: ["5", "7.4", "8", "9"], answer: 2, sortNumeric: true,
    explanation: "Tartiblaymiz: 3, 5, 8, 9, 12. O'rtadagi qiymat 8. (7.4 — o'rtacha qiymat.)",
  }],
  ["t2-m1-07", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "The total cost <i>C</i>, in dollars, of renting a bike for <i>h</i> hours is given by <i>C</i> = 8<i>h</i> + 5. What does 8 represent in this equation?",
    choices: [
      "The cost, in dollars, per hour of renting the bike",
      "The fixed fee, in dollars, for renting the bike",
      "The total cost, in dollars, of renting the bike for 5 hours",
      "The number of hours the bike is rented",
    ], answer: 0,
    explanation: "8 soatlar soni h ga ko'paytiriladi — bu har soat uchun narx. 5 — bir martalik to'lov.",
  }],
  ["t2-m1-08", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>x</i> + 2<i>y</i> = 14<br>3<i>x</i> − 2<i>y</i> = 2<br>What is the value of <i>y</i> in the solution to the system of equations above?",
    answers: ["5"],
    explanation: "Qo'shsak: 4x = 16, x = 4; 4 + 2y = 14 ⇒ y = 5.",
  }],
  ["t2-m1-09", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `If <i>f</i>(<i>x</i>) = 2<i>x</i>${SQ} − 3, what is the value of <i>f</i>(3)?`,
    choices: ["9", "15", "18", "33"], answer: 1, sortNumeric: true,
    explanation: "f(3) = 2·9 − 3 = 15.",
  }],
  ["t2-m1-10", {
    domain: PSDA, skill: "Percentages", difficulty: "M",
    prompt: "The price of a jacket increased from $50 to $65. By what percent did the price increase?",
    choices: ["15%", "23%", "30%", "65%"], answer: 2, rotate: 0,
    explanation: "O'sish 15 dollar; 15/50 = 0.30 = 30%.",
  }],
  ["t2-m1-11", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "M",
    prompt: "In a right triangle, one of the acute angles measures 35°. What is the measure, in degrees, of the other acute angle?",
    choices: ["25", "35", "45", "55"], answer: 3, sortNumeric: true,
    explanation: "O'tkir burchaklar yig'indisi 90°: 90 − 35 = 55.",
  }],
  ["t2-m1-12", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `If (<i>x</i> − 3)${SQ} = 49 and <i>x</i> &gt; 0, what is the value of <i>x</i>?`,
    answers: ["10"],
    explanation: "x − 3 = 7 yoki x − 3 = −7 ⇒ x = 10 yoki x = −4; x > 0 ⇒ x = 10.",
  }],
  ["t2-m1-13", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    prompt: "Which of the following is equivalent to the inequality −3<i>x</i> + 7 ≥ 1?",
    choices: ["<i>x</i> ≤ 2", "<i>x</i> ≥ 2", "<i>x</i> ≤ −2", "<i>x</i> ≥ −2"], answer: 0,
    explanation: "−3x ≥ −6; manfiy songa bo'lganda belgi almashadi: x ≤ 2.",
  }],
  ["t2-m1-14", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "A line in the <i>xy</i>-plane has a slope of −2 and a <i>y</i>-intercept at (0, 6). What is the <i>x</i>-coordinate of the point where the line crosses the <i>x</i>-axis?",
    choices: ["−6", "−3", "2", "3"], answer: 3, sortNumeric: true,
    explanation: "y = −2x + 6; y = 0 da x = 3.",
  }],
  ["t2-m1-15", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "If 3<sup>2<i>x</i></sup> = 81, what is the value of <i>x</i>?",
    answers: ["2"],
    explanation: "81 = 3⁴, demak 2x = 4 va x = 2.",
  }],
  ["t2-m1-16", {
    domain: PSDA, skill: "Inference from sample statistics", difficulty: "H",
    prompt: "A survey of 400 randomly selected voters found that 56% support a proposal. The margin of error for the survey is 4 percentage points. Which of the following is the most plausible range for the percentage of all voters who support the proposal?",
    choices: ["52% to 60%", "54% to 58%", "56% to 60%", "4% to 56%"], answer: 0,
    explanation: "56% ± 4 foiz punkt: 52% dan 60% gacha.",
  }],
  ["t2-m1-17", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = (<i>x</i> − 2)(<i>x</i> + 4). For what value of <i>x</i> does <i>f</i>(<i>x</i>) reach its minimum?",
    choices: ["−4", "−1", "1", "2"], answer: 1, sortNumeric: true,
    explanation: "Parabola uchi ildizlar (2 va −4) o'rtasida: (2 + (−4))/2 = −1.",
  }],
  ["t2-m1-18", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "H",
    prompt: "2<i>x</i> − 3<i>y</i> = 7<br>4<i>x</i> + <i>ky</i> = 10<br>In the system of equations above, <i>k</i> is a constant. For what value of <i>k</i> does the system have no solution?",
    choices: ["−6", "−3", "3", "6"], answer: 0, sortNumeric: true,
    explanation: "Parallel bo'lishi uchun 4/2 = k/(−3) ⇒ k = −6; o'ngdagi sonlar 14 ≠ 10, demak yechim yo'q.",
  }],
  ["t2-m1-19", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: "In the <i>xy</i>-plane, a circle has its center at (3, −2) and passes through the point (7, 1). What is the radius of the circle?",
    answers: ["5"],
    explanation: "r = √((7 − 3)² + (1 − (−2))²) = √(16 + 9) = 5.",
  }],
  ["t2-m1-20", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "H",
    prompt: `Which expression is equivalent to (4<i>x</i>${SQ} − 9) / (2<i>x</i> + 3), for <i>x</i> ≠ −3/2?`,
    choices: ["2<i>x</i> − 3", "2<i>x</i> + 3", "4<i>x</i> − 3", "2<i>x</i> − 9"], answer: 0,
    explanation: "4x² − 9 = (2x − 3)(2x + 3), qisqartirsak 2x − 3.",
  }],
  ["t2-m1-21", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "H",
    prompt: "In the equation <i>ax</i> + 6 = 3(2<i>x</i> + 2), <i>a</i> is a constant. If the equation has infinitely many solutions, what is the value of <i>a</i>?",
    answers: ["6"],
    explanation: "O'ng tomon 6x + 6; cheksiz yechim uchun ax + 6 = 6x + 6 ⇒ a = 6.",
  }],
  ["t2-m1-22", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The function <i>g</i> is defined by <i>g</i>(<i>x</i>) = 3(2)<sup><i>x</i></sup>. What is the value of <i>g</i>(4) / <i>g</i>(1)?",
    choices: ["2", "8", "16", "48"], answer: 1, sortNumeric: true,
    explanation: "g(4) = 48, g(1) = 6; 48/6 = 8 (yoki 2⁴⁻¹ = 8).",
  }],
]);

export const t2MathModule2Easy = buildModule([
  ["t2-m2e-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If <i>x</i> + 15 = 42, what is the value of <i>x</i>?",
    choices: ["27", "37", "42", "57"], answer: 0, sortNumeric: true,
    explanation: "x = 42 − 15 = 27.",
  }],
  ["t2-m2e-02", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A car uses 1 gallon of gas for every 30 miles it travels. How many gallons of gas does the car use to travel 150 miles?",
    choices: ["3", "4", "5", "120"], answer: 2, sortNumeric: true,
    explanation: "150 / 30 = 5 gallon.",
  }],
  ["t2-m2e-03", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 4<i>n</i> = 52, what is the value of <i>n</i>?",
    answers: ["13"],
    explanation: "n = 52 / 4 = 13.",
  }],
  ["t2-m2e-04", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to (<i>x</i> + 3)${SQ}?`,
    choices: [`<i>x</i>${SQ} + 6<i>x</i> + 9`, `<i>x</i>${SQ} + 9`, `<i>x</i>${SQ} + 3<i>x</i> + 9`, `<i>x</i>${SQ} + 6<i>x</i> + 6`], answer: 0,
    explanation: "(x + 3)² = x² + 2·3·x + 9 = x² + 6x + 9.",
  }],
  ["t2-m2e-05", {
    domain: GEO, skill: "Area and perimeter", difficulty: "E",
    prompt: "A triangle has a base of 10 inches and a height of 6 inches. What is the area, in square inches, of the triangle?",
    choices: ["16", "20", "30", "60"], answer: 2, sortNumeric: true,
    explanation: "Yuza = (1/2)·10·6 = 30.",
  }],
  ["t2-m2e-06", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "In a class of 25 students, 15 are girls. What percent of the students in the class are girls?",
    choices: ["15%", "40%", "60%", "75%"], answer: 2, rotate: 0,
    explanation: "15/25 = 0.6 = 60%.",
  }],
  ["t2-m2e-07", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "Which equation represents the statement \"six more than twice a number <i>n</i> is 20\"?",
    choices: ["2<i>n</i> + 6 = 20", "6<i>n</i> + 2 = 20", "2(<i>n</i> + 6) = 20", "<i>n</i> + 12 = 20"], answer: 0,
    explanation: "\"Twice a number\" — 2n, \"six more than\" — +6: 2n + 6 = 20.",
  }],
  ["t2-m2e-08", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: "The function <i>g</i> is defined by <i>g</i>(<i>x</i>) = 5<i>x</i> − 1. What is the value of <i>g</i>(4)?",
    answers: ["19"],
    explanation: "g(4) = 20 − 1 = 19.",
  }],
  ["t2-m2e-09", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "A line in the <i>xy</i>-plane passes through the points (0, 2) and (1, 5). What is the slope of the line?",
    choices: ["2", "3", "5", "7"], answer: 1, sortNumeric: true,
    explanation: "(5 − 2)/(1 − 0) = 3.",
  }],
  ["t2-m2e-10", {
    domain: GEO, skill: "Area and perimeter", difficulty: "E",
    prompt: "A rectangle has a length of 8 meters and a perimeter of 26 meters. What is the width, in meters, of the rectangle?",
    choices: ["5", "9", "10", "18"], answer: 0, sortNumeric: true,
    explanation: "2(8 + w) = 26 ⇒ 8 + w = 13 ⇒ w = 5.",
  }],
  ["t2-m2e-11", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: "The mean of the three numbers 6, 10, and <i>x</i> is 9. What is the value of <i>x</i>?",
    answers: ["11"],
    explanation: "Yig'indi 3·9 = 27; x = 27 − 6 − 10 = 11.",
  }],
  ["t2-m2e-12", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>y</i> = <i>x</i> + 1<br><i>y</i> = 2<i>x</i> − 3<br>What is the solution (<i>x</i>, <i>y</i>) to the system of equations above?",
    choices: ["(4, 5)", "(2, 3)", "(5, 4)", "(1, 2)"], answer: 0,
    explanation: "x + 1 = 2x − 3 ⇒ x = 4, y = 5.",
  }],
  ["t2-m2e-13", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `Which of the following is a solution to the equation <i>x</i>${SQ} − 7<i>x</i> + 10 = 0?`,
    choices: ["−5", "−2", "5", "7"], answer: 2, sortNumeric: true,
    explanation: "x² − 7x + 10 = (x − 2)(x − 5); yechimlar 2 va 5.",
  }],
  ["t2-m2e-14", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "M",
    prompt: "If 3(<i>x</i> + 4) = <i>x</i> + 30, what is the value of <i>x</i>?",
    answers: ["9"],
    explanation: "3x + 12 = x + 30 ⇒ 2x = 18 ⇒ x = 9.",
  }],
  ["t2-m2e-15", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to <i>x</i>${SQ} − 9?`,
    choices: ["(<i>x</i> − 3)(<i>x</i> + 3)", `(<i>x</i> − 3)${SQ}`, `(<i>x</i> + 3)${SQ}`, "(<i>x</i> − 9)(<i>x</i> + 1)"], answer: 0,
    explanation: "Kvadratlar ayirmasi: x² − 9 = (x − 3)(x + 3).",
  }],
  ["t2-m2e-16", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `The function <i>h</i> is defined by <i>h</i>(<i>x</i>) = <i>x</i>${SQ} − 2<i>x</i>. What is the value of <i>h</i>(−3)?`,
    choices: ["−15", "−3", "3", "15"], answer: 3, sortNumeric: true,
    explanation: "h(−3) = 9 − 2(−3) = 9 + 6 = 15.",
  }],
  ["t2-m2e-17", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "The number of books <i>B</i> in a store <i>t</i> days after a delivery is modeled by <i>B</i> = 500 − 35<i>t</i>. According to the model, how many books are in the store 8 days after the delivery?",
    choices: ["220", "280", "465", "535"], answer: 0, sortNumeric: true,
    explanation: "B = 500 − 35·8 = 500 − 280 = 220.",
  }],
  ["t2-m2e-18", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to (3<i>x</i>${SQ})${SQ}?`,
    choices: ["3<i>x</i><sup>4</sup>", "6<i>x</i><sup>4</sup>", "9<i>x</i><sup>4</sup>", `9<i>x</i>${SQ}`], answer: 2,
    explanation: "(3x²)² = 3²·(x²)² = 9x⁴.",
  }],
  ["t2-m2e-19", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "The lines <i>y</i> = 3<i>x</i> − 2 and <i>y</i> = −<i>x</i> + 10 intersect at the point (<i>a</i>, <i>b</i>). What is the value of <i>a</i>?",
    answers: ["3"],
    explanation: "3x − 2 = −x + 10 ⇒ 4x = 12 ⇒ x = 3.",
  }],
  ["t2-m2e-20", {
    domain: GEO, skill: "Area and volume", difficulty: "H",
    prompt: "The volume of a sphere is 36π cubic centimeters. What is the radius, in centimeters, of the sphere? (The volume of a sphere is <i>V</i> = (4/3)π<i>r</i><sup>3</sup>.)",
    answers: ["3"],
    explanation: "(4/3)πr³ = 36π ⇒ r³ = 27 ⇒ r = 3.",
  }],
  ["t2-m2e-21", {
    domain: PSDA, skill: "One-variable data", difficulty: "H",
    prompt: "A data set of five numbers has a mean of 20. When the number 40 is removed from the data set, what is the mean of the remaining four numbers?",
    choices: ["15", "16", "20", "25"], answer: 0, sortNumeric: true,
    explanation: "Beshta son yig'indisi 100; 40 ni olib tashlasak 60; 60/4 = 15.",
  }],
  ["t2-m2e-22", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The population <i>P</i> of a species of fish in a lake <i>t</i> years after it was introduced is modeled by <i>P</i> = 200(1.5)<sup><i>t</i></sup>. What is the population 2 years after the fish were introduced?",
    choices: ["225", "300", "400", "450"], answer: 3, sortNumeric: true,
    explanation: "P = 200·(1.5)² = 200·2.25 = 450.",
  }],
]);

export const t2MathModule2Hard = buildModule([
  ["t2-m2h-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 9 − 2<i>x</i> = 1, what is the value of <i>x</i>?",
    choices: ["−4", "4", "5", "8"], answer: 1, sortNumeric: true,
    explanation: "−2x = −8 ⇒ x = 4.",
  }],
  ["t2-m2h-02", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to 4<i>x</i>${SQ} − 2<i>x</i> + <i>x</i>${SQ} + 7<i>x</i>?`,
    choices: [`5<i>x</i>${SQ} + 5<i>x</i>`, `5<i>x</i>${SQ} + 9<i>x</i>`, `3<i>x</i>${SQ} + 5<i>x</i>`, "5<i>x</i><sup>4</sup> + 5<i>x</i>"], answer: 0,
    explanation: "4x² + x² = 5x²; −2x + 7x = 5x.",
  }],
  ["t2-m2h-03", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If <i>x</i>/3 + 4 = 9, what is the value of <i>x</i>?",
    choices: ["5", "13", "15", "39"], answer: 2, sortNumeric: true,
    explanation: "x/3 = 5 ⇒ x = 15.",
  }],
  ["t2-m2h-04", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "Line <i>ℓ</i> in the <i>xy</i>-plane passes through the point (1, 4) and is parallel to the line <i>y</i> = −3<i>x</i> + 2. Which equation defines line <i>ℓ</i>?",
    choices: ["<i>y</i> = −3<i>x</i> + 7", "<i>y</i> = −3<i>x</i> + 4", "<i>y</i> = (1/3)<i>x</i> + 11/3", "<i>y</i> = 3<i>x</i> + 1"], answer: 0,
    explanation: "Parallel ⇒ qiyalik −3; 4 = −3·1 + b ⇒ b = 7.",
  }],
  ["t2-m2h-05", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = <i>x</i>${SQ} + <i>kx</i> − 12, where <i>k</i> is a constant. If <i>f</i>(2) = 0, what is the value of <i>k</i>?`,
    answers: ["4"],
    explanation: "4 + 2k − 12 = 0 ⇒ 2k = 8 ⇒ k = 4.",
  }],
  ["t2-m2h-06", {
    domain: GEO, skill: "Right triangles", difficulty: "M",
    prompt: "A 13-foot ladder leans against a vertical wall, as shown. The base of the ladder is 5 feet from the wall. How high up the wall, in feet, does the top of the ladder reach?",
    image: ladderFigure,
    choices: ["5", "8", "10", "12"], answer: 3, sortNumeric: true,
    explanation: "h² + 5² = 13² ⇒ h² = 144 ⇒ h = 12.",
  }],
  ["t2-m2h-07", {
    domain: PSDA, skill: "Two-variable data", difficulty: "M",
    prompt: "The line of best fit for a scatterplot relating hours studied, <i>x</i>, and test score, <i>y</i>, is <i>y</i> = 2.5<i>x</i> + 40. Based on the line of best fit, what is the predicted test score for a student who studied for 12 hours?",
    choices: ["52.5", "70", "72.5", "82"], answer: 1, sortNumeric: true,
    explanation: "y = 2.5·12 + 40 = 30 + 40 = 70.",
  }],
  ["t2-m2h-08", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "A school play sold student tickets for $5 each and adult tickets for $9 each. A total of 120 tickets were sold for $760. How many adult tickets were sold?",
    answers: ["40"],
    explanation: "s + a = 120, 5s + 9a = 760 ⇒ 5(120 − a) + 9a = 760 ⇒ 4a = 160 ⇒ a = 40.",
  }],
  ["t2-m2h-09", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `Which of the following is an <i>x</i>-intercept of the graph of <i>y</i> = 2<i>x</i>${SQ} − 8 in the <i>xy</i>-plane?`,
    choices: ["(2, 0)", "(4, 0)", "(0, −8)", "(8, 0)"], answer: 0,
    explanation: "2x² − 8 = 0 ⇒ x² = 4 ⇒ x = ±2; (2, 0). (0, −8) — y o'qi bilan kesishish.",
  }],
  ["t2-m2h-10", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>x</i> + <i>y</i> = 5<br>2<i>x</i> + 2<i>y</i> = <i>k</i><br>In the system of equations above, <i>k</i> is a constant. For what value of <i>k</i> does the system have infinitely many solutions?",
    choices: ["5", "7", "10", "20"], answer: 2, sortNumeric: true,
    explanation: "Ikkinchi tenglama birinchisining 2 barobari bo'lishi kerak: k = 10.",
  }],
  ["t2-m2h-11", {
    domain: PSDA, skill: "Percentages", difficulty: "M",
    prompt: "A town's population of 8,000 increases by 5% each year. Which expression gives the town's population <i>t</i> years from now?",
    choices: ["8,000(1.05)<sup><i>t</i></sup>", "8,000(0.05)<sup><i>t</i></sup>", "8,000(1.5)<sup><i>t</i></sup>", "8,000 + 0.05<i>t</i>"], answer: 0,
    explanation: "Har yili 105% ga ko'payadi: 8,000·(1.05)^t.",
  }],
  ["t2-m2h-12", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `What is the product of the solutions to the equation 3<i>x</i>${SQ} − 12<i>x</i> + 5 = 0?`,
    answers: ["5/3", "1.666", "1.667"],
    explanation: "ax² + bx + c = 0 da ildizlar ko'paytmasi c/a = 5/3.",
  }],
  ["t2-m2h-13", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: "A circle has a radius of 9. What is the area of a sector of the circle with a central angle of 60°?",
    choices: ["3π", "9π", "13.5π", "27π"], answer: 2, rotate: 0,
    explanation: "Sektor yuzasi = (60/360)·π·9² = 81π/6 = 13.5π.",
  }],
  ["t2-m2h-14", {
    domain: PSDA, skill: "One-variable data", difficulty: "H",
    prompt: "The data set 3, 5, 5, 7, 20 is changed by replacing 20 with 10. Which of the following statements about the new data set is true?",
    choices: [
      "The mean decreases, and the median stays the same.",
      "The mean stays the same, and the median decreases.",
      "Both the mean and the median decrease.",
      "Both the mean and the median stay the same.",
    ], answer: 0,
    explanation: "O'rtacha 8 dan 6 ga tushadi; mediana (o'rtadagi qiymat) 5 bo'lib qoladi.",
  }],
  ["t2-m2h-15", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: "If 2<sup><i>x</i> + 3</sup> = 8<sup><i>x</i> − 1</sup>, what is the value of <i>x</i>?",
    choices: ["1", "2", "3", "6"], answer: 2, sortNumeric: true,
    explanation: "8^(x−1) = 2^(3x−3); x + 3 = 3x − 3 ⇒ x = 3.",
  }],
  ["t2-m2h-16", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "H",
    prompt: "2<i>x</i> − 5<i>y</i> = −4<br>3<i>x</i> + 2<i>y</i> = 13<br>If (<i>x</i>, <i>y</i>) is the solution to the system of equations above, what is the value of <i>x</i> − <i>y</i>?",
    answers: ["1"],
    explanation: "Birinchisini 2 ga, ikkinchisini 5 ga ko'paytirib qo'shsak: 19x = 57, x = 3; y = 2; x − y = 1.",
  }],
  ["t2-m2h-17", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "H",
    prompt: "A right triangle has legs of lengths 7 and 24. What is the sine of the angle opposite the side of length 7?",
    choices: ["7/24", "7/25", "24/25", "24/7"], answer: 1, rotate: 0,
    explanation: "Gipotenuza √(49 + 576) = 25; sin = qarama-qarshi/gipotenuza = 7/25.",
  }],
  ["t2-m2h-18", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The polynomial <i>p</i> is defined by <i>p</i>(<i>x</i>) = <i>x</i>${CUBE} − 4<i>x</i>${SQ} + <i>x</i> + 6. Which of the following is a factor of <i>p</i>(<i>x</i>)?`,
    choices: ["<i>x</i> − 2", "<i>x</i> + 2", "<i>x</i> − 1", "<i>x</i> + 3"], answer: 0,
    explanation: "p(2) = 8 − 16 + 2 + 6 = 0, demak (x − 2) ko'paytuvchi. p(x) = (x + 1)(x − 2)(x − 3).",
  }],
  ["t2-m2h-19", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "H",
    prompt: "A 20-liter mixture is 30% juice and 70% water. How many liters of pure juice must be added so that the new mixture is 50% juice?",
    answers: ["8"],
    explanation: "(6 + j)/(20 + j) = 0.5 ⇒ 12 + 2j = 20 + j ⇒ j = 8.",
  }],
  ["t2-m2h-20", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "H",
    prompt: "A phone plan costs $30 per month plus $0.10 for each text message over 200 texts. One month, the bill was $42.50. How many text messages were sent that month?",
    choices: ["125", "200", "325", "425"], answer: 2, sortNumeric: true,
    explanation: "Qo'shimcha 12.50 dollar ÷ 0.10 = 125 ta ortiqcha xabar; jami 200 + 125 = 325.",
  }],
  ["t2-m2h-21", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = −(<i>x</i> − 4)${SQ} + 9. For how many integer values of <i>x</i> is <i>f</i>(<i>x</i>) &gt; 0?`,
    choices: ["5", "6", "7", "9"], answer: 0, sortNumeric: true,
    explanation: "(x − 4)² < 9 ⇒ 1 < x < 7 ⇒ x = 2, 3, 4, 5, 6 — 5 ta.",
  }],
  ["t2-m2h-22", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "H",
    prompt: "What value of <i>x</i> satisfies the equation (2<i>x</i> + 1)/3 = (<i>x</i> + 4)/2?",
    answers: ["10"],
    explanation: "2(2x + 1) = 3(x + 4) ⇒ 4x + 2 = 3x + 12 ⇒ x = 10.",
  }],
]);
