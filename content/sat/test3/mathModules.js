// Practice Test 3 — Math, Module 1 va Module 2 (oson / qiyin).
// Module 1 va qiyin Module 2 savol turlari March 2026 testi tuzilishiga mos;
// sonlar, vaziyatlar va chizmalar yangi. Har modulda 22 ta savol.
import { buildModule, table, svgFigure } from "../helpers.js";

const ALG = "algebra";
const ADV = "advanced-math";
const PSDA = "problem-solving-data";
const GEO = "geometry-trig";
const SQ = "<sup>2</sup>";
const frac = (a, b) => `<sup>${a}</sup>&frasl;<sub>${b}</sub>`;

// Koordinata to'ri: [x0, x1] × [y0, y1], `s` px/birlik, chap-yuqori bo'sh joy `pad`.
function plane({ x0, x1, y0, y1, s, pad = 30, xStep = 1, yStep = 1, xLabelStep, yLabelStep }) {
  const W = (x1 - x0) * s + pad * 2;
  const H = (y1 - y0) * s + pad * 2;
  const px = (x) => pad + (x - x0) * s;
  const py = (y) => pad + (y1 - y) * s;
  let g = "";
  for (let x = x0; x <= x1; x += xStep) g += `<line x1="${px(x)}" y1="${py(y0)}" x2="${px(x)}" y2="${py(y1)}" stroke="#ccc" stroke-width="1"/>`;
  for (let y = y0; y <= y1; y += yStep) g += `<line x1="${px(x0)}" y1="${py(y)}" x2="${px(x1)}" y2="${py(y)}" stroke="#ccc" stroke-width="1"/>`;
  const ax = Math.min(Math.max(0, x0), x1);
  const ay = Math.min(Math.max(0, y0), y1);
  g += `<line x1="${px(x0)}" y1="${py(ay)}" x2="${px(x1) + 8}" y2="${py(ay)}" stroke="#111" stroke-width="1.5"/>`;
  g += `<line x1="${px(ax)}" y1="${py(y0)}" x2="${px(ax)}" y2="${py(y1) - 8}" stroke="#111" stroke-width="1.5"/>`;
  g += `<text x="${px(x1) + 12}" y="${py(ay) + 5}" font-style="italic" font-size="15">x</text>`;
  g += `<text x="${px(ax) - 4}" y="${py(y1) - 12}" font-style="italic" font-size="15">y</text>`;
  if (xLabelStep) for (let x = x0; x <= x1; x += 1) if (x !== 0 && x % xLabelStep === 0) g += `<text x="${px(x)}" y="${py(ay) + 16}" font-size="12" text-anchor="middle">${x < 0 ? "−" + -x : x}</text>`;
  if (yLabelStep) for (let y = y0; y <= y1; y += 1) if (y !== 0 && y % yLabelStep === 0) g += `<text x="${px(ax) - 5}" y="${py(y) + 4}" font-size="12" text-anchor="end">${y < 0 ? "−" + -y : y}</text>`;
  g += `<text x="${px(ax) - 5}" y="${py(ay) + 15}" font-size="12" text-anchor="end" font-style="italic">O</text>`;
  return { W, H, px, py, g };
}

// ---------------- Module 1 chizmalari ----------------

// 12-savol: to'g'ri burchakli uchburchak, to'g'ri burchak B da.
const triangleFigure = svgFigure(
  320,
  270,
  `<polygon points="60,40 60,210 280,210" fill="none" stroke="#111" stroke-width="2"/>
   <polyline points="60,192 78,192 78,210" fill="none" stroke="#111" stroke-width="1.5"/>
   <text x="52" y="34" text-anchor="end" font-style="italic">A</text>
   <text x="50" y="226" text-anchor="end" font-style="italic">B</text>
   <text x="288" y="226" font-style="italic">C</text>
   <text x="44" y="130" text-anchor="end">20</text>
   <text x="180" y="114">29</text>
   <text x="160" y="258" text-anchor="middle" font-size="13">Note: Figure not drawn to scale.</text>`
);

// 18-savol: parallel m va n chiziqlar, AE va CD B nuqtada kesishadi.
const crossFigure = svgFigure(
  400,
  270,
  `<line x1="40" y1="60" x2="360" y2="60" stroke="#111" stroke-width="2"/>
   <line x1="40" y1="180" x2="360" y2="180" stroke="#111" stroke-width="2"/>
   <text x="368" y="64" font-style="italic">m</text>
   <text x="368" y="184" font-style="italic">n</text>
   <line x1="86.7" y1="200" x2="273.3" y2="40" stroke="#111" stroke-width="2"/>
   <line x1="313.3" y1="200" x2="126.7" y2="40" stroke="#111" stroke-width="2"/>
   <text x="142" y="52" text-anchor="middle" font-style="italic">D</text>
   <text x="258" y="52" text-anchor="middle" font-style="italic">E</text>
   <text x="200" y="125" text-anchor="middle" font-style="italic">B</text>
   <text x="100" y="200" text-anchor="middle" font-style="italic">A</text>
   <text x="300" y="200" text-anchor="middle" font-style="italic">C</text>
   <text x="200" y="250" text-anchor="middle" font-size="13">Note: Figure not drawn to scale.</text>`
);

// 22-savol: sochilish diagrammasi va eng yaxshi mos chiziq y = 12.5 − 0.75x.
const scatter = (() => {
  const p = plane({ x0: 0, x1: 15, y0: 0, y1: 15, s: 18, xLabelStep: 2, yLabelStep: 2 });
  const pts = [[1, 13], [2, 11], [4, 10], [5, 8], [6, 9.5], [7, 6], [8, 7], [10, 5], [11, 3], [13, 3], [14, 2]];
  const dots = pts.map(([x, y]) => `<circle cx="${p.px(x)}" cy="${p.py(y)}" r="4" fill="#111"/>`).join("");
  const line = `<line x1="${p.px(0)}" y1="${p.py(12.5)}" x2="${p.px(15)}" y2="${p.py(1.25)}" stroke="#111" stroke-width="2"/>`;
  return svgFigure(p.W + 10, p.H, p.g + dots + line);
})();

// ---------------- Module 2 (qiyin) chizmalari ----------------

// 3-savol: chiziqli funksiya grafigi (v, yuzlab tashrif), 0 ≤ x ≤ 30.
const visitsFigure = (() => {
  const ox = 90, oy = 250, sx = 10, sy = 1.75;
  const X = (x) => ox + x * sx;
  const Y = (y) => oy - y * sy;
  let g = "";
  for (let x = 0; x <= 30; x += 5) g += `<line x1="${X(x)}" y1="${Y(0)}" x2="${X(x)}" y2="${Y(120)}" stroke="#ccc"/>`;
  for (let y = 0; y <= 120; y += 20) g += `<line x1="${X(0)}" y1="${Y(y)}" x2="${X(30)}" y2="${Y(y)}" stroke="#ccc"/>`;
  g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(30) + 10}" y2="${Y(0)}" stroke="#111" stroke-width="1.5"/>`;
  g += `<line x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(120) - 10}" stroke="#111" stroke-width="1.5"/>`;
  for (let x = 5; x <= 30; x += 5) g += `<text x="${X(x)}" y="${Y(0) + 17}" font-size="12" text-anchor="middle">${x}</text>`;
  for (let y = 20; y <= 120; y += 20) g += `<text x="${X(0) - 6}" y="${Y(y) + 4}" font-size="12" text-anchor="end">${y}</text>`;
  g += `<text x="${X(0) - 6}" y="${Y(0) + 15}" font-size="12" text-anchor="end" font-style="italic">O</text>`;
  g += `<text x="${X(15)}" y="${Y(0) + 36}" font-size="13" text-anchor="middle">Months since January 2020</text>`;
  g += `<text x="30" y="${Y(60)}" font-size="13" text-anchor="middle" transform="rotate(-90 30 ${Y(60)})">Daily visits (hundreds)</text>`;
  g += `<line x1="${X(0)}" y1="${Y(110)}" x2="${X(30)}" y2="${Y(35)}" stroke="#111" stroke-width="2.5"/>`;
  return svgFigure(420, 300, g);
})();

// 5-savol: y < 3x − 2 (shtrix chiziq, pastki o'ng tomoni bo'yalgan).
const inequalityFigure = (() => {
  const p = plane({ x0: -5, x1: 7, y0: -4, y1: 14, s: 20, xLabelStep: 2, yLabelStep: 4 });
  const shade = `<polygon points="${p.px(-2 / 3)},${p.py(-4)} ${p.px(16 / 3)},${p.py(14)} ${p.px(7)},${p.py(14)} ${p.px(7)},${p.py(-4)}" fill="#999" fill-opacity="0.45"/>`;
  const line = `<line x1="${p.px(-2 / 3)}" y1="${p.py(-4)}" x2="${p.px(16 / 3)}" y2="${p.py(14)}" stroke="#111" stroke-width="2.5" stroke-dasharray="9 6"/>`;
  return svgFigure(p.W + 10, p.H, shade + p.g + line);
})();

// 7-savol: ichma-ich uchburchaklar, BD ∥ AE, D va E da to'g'ri burchak.
const nestedFigure = svgFigure(
  280,
  280,
  `<polygon points="40,230 220,230 220,30" fill="none" stroke="#111" stroke-width="2"/>
   <line x1="130" y1="130" x2="220" y2="130" stroke="#111" stroke-width="2"/>
   <polyline points="204,130 204,114 220,114" fill="none" stroke="#111" stroke-width="1.5"/>
   <polyline points="204,230 204,214 220,214" fill="none" stroke="#111" stroke-width="1.5"/>
   <text x="228" y="30" font-style="italic">C</text>
   <text x="118" y="128" text-anchor="end" font-style="italic">B</text>
   <text x="228" y="135" font-style="italic">D</text>
   <text x="32" y="246" text-anchor="end" font-style="italic">A</text>
   <text x="228" y="246" font-style="italic">E</text>
   <text x="140" y="270" text-anchor="middle" font-size="13">Note: Figure not drawn to scale.</text>`
);

// 11-savol: y = 4x² + 8x − 4 parabola, belgilangan nuqtalar (−2, −4), (−1, −8), (0, −4).
const parabolaFigure = (() => {
  const p = plane({ x0: -4, x1: 3, y0: -10, y1: 4, s: 25, xLabelStep: 2, yLabelStep: 2 });
  const pts = [];
  for (let x = -2.62; x <= 0.621; x += 0.04) pts.push(`${p.px(x).toFixed(1)},${p.py(4 * x * x + 8 * x - 4).toFixed(1)}`);
  const curve = `<polyline points="${pts.join(" ")}" fill="none" stroke="#111" stroke-width="2.5"/>`;
  const dots = [[-2, -4], [-1, -8], [0, -4]].map(([x, y]) => `<circle cx="${p.px(x)}" cy="${p.py(y)}" r="5" fill="#111"/>`).join("");
  return svgFigure(p.W + 10, p.H, p.g + curve + dots);
})();

export const t3MathModule1 = buildModule([
  ["t3-m1-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 5<i>x</i> = 45, what is the value of 4<i>x</i> + 2?",
    choices: ["20", "36", "38", "47"], answer: 2, sortNumeric: true,
    explanation: "x = 9; 4·9 + 2 = 38.",
  }],
  ["t3-m1-02", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "E",
    prompt: "4<i>x</i> + 7<i>y</i> = 71<br><i>y</i> = 5<br>The solution to the given system of equations is (<i>x</i>, <i>y</i>). What is the value of <i>x</i>?",
    answers: ["9"],
    explanation: "4x + 35 = 71 ⇒ 4x = 36 ⇒ x = 9.",
  }],
  ["t3-m1-03", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: table("", ["Hours spent reading per week", "Number of students"], [
      ["At least 0 but less than 2", "6"],
      ["At least 2 but less than 4", "13"],
      ["At least 4 but less than 6", "8"],
      ["At least 6 but less than 8", "3"],
    ]) + "The table summarizes the number of hours per week that each of 30 students in a class spent reading. According to the table, how many students spent at least 2 hours but less than 4 hours reading per week?",
    choices: ["13", "8", "6", "3"], answer: 0, rotate: 0,
    explanation: "Jadvalning ikkinchi qatori: 13 ta talaba.",
  }],
  ["t3-m1-04", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 4 · 2<sup><i>x</i></sup>. What is the value of <i>f</i>(<i>x</i>) when <i>x</i> = 5?",
    choices: ["40", "64", "128", "256"], answer: 2, sortNumeric: true,
    explanation: "f(5) = 4 · 32 = 128.",
  }],
  ["t3-m1-05", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "In the <i>xy</i>-plane, line <i>k</i> is parallel to line <i>j</i>. Line <i>j</i> has a slope of 6, and line <i>k</i> passes through the point (0, −4). Which equation defines line <i>k</i>?",
    choices: ["<i>y</i> = 6<i>x</i> − 4", `<i>y</i> = 6<i>x</i> − ${frac(1, 4)}`, "<i>y</i> = 6<i>x</i> + 4", `<i>y</i> = 6<i>x</i> + ${frac(1, 4)}`], answer: 0,
    explanation: "Parallel ⇒ qiyalik 6; (0, −4) — y bilan kesishish: y = 6x − 4.",
  }],
  ["t3-m1-06", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "M",
    prompt: "A pharmacist mixed <i>x</i> milliliters of a 5% salt solution with <i>y</i> milliliters of a 12% salt solution to produce a 9% salt solution. Which equation best represents this situation? (Assume the volumes of the solutions are additive.)",
    choices: [
      "0.05<i>x</i> + 0.12<i>y</i> = 0.09(<i>x</i> + <i>y</i>)",
      "0.5<i>x</i> + 1.2<i>y</i> = 0.9(<i>x</i> + <i>y</i>)",
      "0.5<i>x</i> + 1.2<i>y</i> = 9(<i>x</i> + <i>y</i>)",
      "0.05<i>x</i> + 0.12<i>y</i> = 9(<i>x</i> + <i>y</i>)",
    ], answer: 0,
    explanation: "Tuz miqdori: 5% → 0.05x, 12% → 0.12y; aralashmada 9% → 0.09(x + y).",
  }],
  ["t3-m1-07", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    prompt: "The length of a rectangle's diagonal is √113, and the length of one of the rectangle's sides is 7. What is the perimeter of the rectangle?",
    choices: ["15", "30", "56", "113"], answer: 1, sortNumeric: true,
    explanation: "Ikkinchi tomon √(113 − 49) = √64 = 8; perimetr 2(7 + 8) = 30.",
  }],
  ["t3-m1-08", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: "The expression 9<i>x</i><sup>4</sup> − 3<i>x</i><sup>4</sup> + 5<i>x</i><sup>4</sup> is equivalent to <i>bx</i><sup>4</sup>, where <i>b</i> is a constant. What is the value of <i>b</i>?",
    answers: ["11"],
    explanation: "9 − 3 + 5 = 11.",
  }],
  ["t3-m1-09", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "E",
    prompt: `<i>x</i>${SQ} − 12<i>x</i> = 0<br>Which of the following is a solution to the given equation?`,
    choices: ["24", "12", "6", "√12"], answer: 1, rotate: 0,
    explanation: "x(x − 12) = 0 ⇒ x = 0 yoki x = 12.",
  }],
  ["t3-m1-10", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "M",
    prompt: "A chemist is analyzing a sample of soil. The equation 2.50<i>x</i> + 5.00<i>y</i> = 75.0 gives the relationship between the estimated masses of sand and clay in the sample, where <i>x</i> is the estimated mass, in grams, of sand and <i>y</i> is the estimated mass, in grams, of clay. If the estimated mass of clay in the sample is 9.6 grams, what is the estimated mass, in grams, of sand in the sample?",
    answers: ["10.8", "54/5"],
    explanation: "2.50x + 48.0 = 75.0 ⇒ 2.50x = 27.0 ⇒ x = 10.8.",
  }],
  ["t3-m1-11", {
    domain: PSDA, skill: "One-variable data", difficulty: "M",
    prompt: "In each of the following data sets of 5 values, <i>p</i> is a constant. Which of these data sets has the largest standard deviation?",
    choices: [
      "<i>p</i> − 6, <i>p</i> − 5, <i>p</i>, <i>p</i> + 5, <i>p</i> + 6",
      "<i>p</i> − 3, <i>p</i>, <i>p</i>, <i>p</i>, <i>p</i> + 3",
      "<i>p</i> − 1, <i>p</i> − 1, <i>p</i>, <i>p</i> + 1, <i>p</i> + 1",
      "<i>p</i>, <i>p</i>, <i>p</i>, <i>p</i>, <i>p</i>",
    ], answer: 0,
    explanation: "Qiymatlar o'rtachadan (p) eng uzoq tarqalgan to'plam — p ± 6, p ± 5.",
  }],
  ["t3-m1-12", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    image: triangleFigure,
    prompt: "In the right triangle shown, what is the value of cos <i>A</i>?",
    choices: [frac(1, 29), frac(1, 20), frac(20, 29), frac(29, 20)], answer: 2, rotate: 0,
    explanation: "cos A = yondosh katet / gipotenuza = AB / AC = 20/29.",
  }],
  ["t3-m1-13", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "An object is launched from a height of 96 feet above the ground. A quadratic function <i>f</i> models the height above the ground, in feet, of the object <i>t</i> seconds after it is launched. According to the model, 3 seconds after the object is launched, it reaches its maximum height of 240 feet above the ground. Which equation defines <i>f</i>?",
    choices: [
      `<i>f</i>(<i>t</i>) = −16(<i>t</i> − 3)${SQ} + 240`,
      `<i>f</i>(<i>t</i>) = −16(<i>t</i> + 3)${SQ} − 240`,
      `<i>f</i>(<i>t</i>) = −16(<i>t</i> − 240)${SQ} + 3`,
      `<i>f</i>(<i>t</i>) = −16(<i>t</i> + 240)${SQ} − 3`,
    ], answer: 0,
    explanation: "Uch (3, 240) ⇒ f(t) = −16(t − 3)² + 240. Tekshiruv: f(0) = −144 + 240 = 96.",
  }],
  ["t3-m1-14", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = (<i>x</i> − 3)(<i>x</i> − 5)(<i>x</i> + 2). In the <i>xy</i>-plane, the graph of <i>y</i> = <i>h</i>(<i>x</i>) is the result of translating the graph of <i>y</i> = <i>f</i>(<i>x</i>) up 4 units. What is the <i>y</i>-coordinate of the <i>y</i>-intercept of the graph of <i>y</i> = <i>h</i>(<i>x</i>)?",
    choices: ["0", "4", "30", "34"], answer: 3, sortNumeric: true,
    explanation: "f(0) = (−3)(−5)(2) = 30; 4 birlik yuqoriga ⇒ h(0) = 34.",
  }],
  ["t3-m1-15", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "M",
    prompt: "The ratio <i>x</i> to <i>y</i> is equivalent to the ratio 3 to 8. If <i>x</i> = 5<i>t</i>, what is the value of <i>y</i> in terms of <i>t</i>?",
    choices: [`${frac(40, 3)}<i>t</i>`, `${frac(3, 40)}<i>t</i>`, `${frac(8, 15)}<i>t</i>`, `${frac(15, 8)}<i>t</i>`], answer: 0,
    explanation: "x/y = 3/8 ⇒ y = 8x/3 = 8·5t/3 = 40t/3.",
  }],
  ["t3-m1-16", {
    domain: PSDA, skill: "Percentages", difficulty: "H",
    prompt: "For the positive quantities <i>m</i>, <i>q</i>, and <i>r</i>, <i>m</i> is 25% of <i>m</i> + <i>q</i> + <i>r</i>, <i>q</i> is 40% of <i>q</i> + <i>r</i>, and the value of <i>r</i> is 1,170. What is the value of <i>m</i>?",
    answers: ["650"],
    explanation: "q = 0.4(q + 1170) ⇒ 0.6q = 468 ⇒ q = 780. m = 0.25(m + 1950) ⇒ 0.75m = 487.5 ⇒ m = 650.",
  }],
  ["t3-m1-17", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `<i>P</i>(<i>t</i>) = 52(${frac(7, 5)})<sup><i>t</i></sup><br>A population of rabbits was introduced onto an island and studied for 12 years. Function <i>P</i> models this rabbit population <i>t</i> years after the population was introduced onto the island. Which statement is the best interpretation of ${frac(7, 5)} in this context?`,
    choices: [
      "For every 5 rabbits there were in this population in a certain year, it is predicted that there were 7 rabbits the next year.",
      "For every 7 rabbits there were in this population in a certain year, it is predicted that there were 5 rabbits the next year.",
      "It is predicted that this rabbit population grew by 5 rabbits every 7 years.",
      "It is predicted that this rabbit population grew by 7 rabbits every 5 years.",
    ], answer: 0,
    explanation: "Har yili soni 7/5 marta ortadi: har 5 ta quyonga keyingi yili 7 ta.",
  }],
  ["t3-m1-18", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "H",
    image: crossFigure,
    prompt: "In the figure, line <i>m</i> is parallel to line <i>n</i>, and lines <i>AE</i> and <i>CD</i> intersect at point <i>B</i>. Which additional piece of information is sufficient to prove that triangle <i>ABC</i> is congruent to triangle <i>EBD</i>?",
    choices: [
      "<i>AB</i> = 12 and <i>EB</i> = 12",
      "<i>AB</i> = 12 and <i>DB</i> = 12",
      "Triangles <i>ABC</i> and <i>EBD</i> are isosceles.",
      "No additional information is necessary to determine that the two triangles are congruent.",
    ], answer: 0,
    explanation: "Vertikal burchaklar (B) va ichki almashinuvchi burchaklar (A va E) teng. Bir juft mos tomon kerak: AB ↔ EB. AB = EB bo'lsa — ASA.",
  }],
  ["t3-m1-19", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "What value of <i>n</i> is the solution to the equation 9<i>n</i> − 5 = 4<i>n</i> + 20?",
    choices: ["3", "5", "15", "25"], answer: 1, sortNumeric: true,
    explanation: "5n = 25 ⇒ n = 5.",
  }],
  ["t3-m1-20", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "<i>y</i> = 25<i>x</i> + 150<br>The equation gives the total cost <i>y</i>, in dollars, for a print shop to produce <i>x</i> posters. How many posters can the print shop produce for a total cost of $900?",
    choices: ["6", "30", "36", "42"], answer: 1, sortNumeric: true,
    explanation: "25x + 150 = 900 ⇒ 25x = 750 ⇒ x = 30.",
  }],
  ["t3-m1-21", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "M",
    prompt: "A robot moved 0.60 meters for every 4.0 seconds it was in motion. If the robot was in motion for 22 seconds, what is the total distance, in meters, the robot moved?",
    answers: ["3.3", "33/10"],
    explanation: "Tezlik 0.60/4.0 = 0.15 m/s; 0.15 · 22 = 3.3 m.",
  }],
  ["t3-m1-22", {
    domain: PSDA, skill: "Two-variable data", difficulty: "M",
    image: scatter,
    prompt: "The scatterplot shows the relationship between two variables, <i>x</i> and <i>y</i>. A line of best fit is also shown. Which of the following equations best represents the line of best fit shown?",
    choices: ["<i>y</i> = 12.5 − 0.75<i>x</i>", "<i>y</i> = 12.5 + 0.75<i>x</i>", "<i>y</i> = −12.5 + 0.75<i>x</i>", "<i>y</i> = −12.5 − 0.75<i>x</i>"], answer: 0,
    explanation: "Chiziq y o'qini 12.5 atrofida kesadi (musbat) va pasayadi (manfiy qiyalik): y = 12.5 − 0.75x.",
  }],
]);

export const t3MathModule2Easy = buildModule([
  ["t3-m2e-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If <i>x</i> − 8 = 19, what is the value of <i>x</i>?",
    choices: ["11", "19", "27", "152"], answer: 2, sortNumeric: true,
    explanation: "x = 19 + 8 = 27.",
  }],
  ["t3-m2e-02", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A printer prints 18 pages per minute. At this rate, how many pages does the printer print in 6 minutes?",
    choices: ["3", "24", "108", "118"], answer: 2, sortNumeric: true,
    explanation: "18 · 6 = 108.",
  }],
  ["t3-m2e-03", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: "The graph of the function <i>f</i> in the <i>xy</i>-plane, where <i>y</i> = <i>f</i>(<i>x</i>), passes through the point (4, 11). Which of the following must be true?",
    choices: ["<i>f</i>(4) = 11", "<i>f</i>(11) = 4", "<i>f</i>(0) = 11", "<i>f</i>(4) = 0"], answer: 0,
    explanation: "(4, 11) nuqta: x = 4 da y = 11, ya'ni f(4) = 11.",
  }],
  ["t3-m2e-04", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 7<i>w</i> = 84, what is the value of <i>w</i>?",
    answers: ["12"],
    explanation: "w = 84 / 7 = 12.",
  }],
  ["t3-m2e-05", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: "Which expression is equivalent to 3<i>x</i>(<i>x</i> − 4)?",
    choices: [`3<i>x</i>${SQ} − 12<i>x</i>`, `3<i>x</i>${SQ} − 4<i>x</i>`, `3<i>x</i>${SQ} − 12`, "4<i>x</i> − 4"], answer: 0,
    explanation: "3x·x − 3x·4 = 3x² − 12x.",
  }],
  ["t3-m2e-06", {
    domain: GEO, skill: "Area and volume", difficulty: "E",
    prompt: "A rectangular garden has a length of 12 feet and a width of 7 feet. What is the area, in square feet, of the garden?",
    choices: ["19", "38", "84", "168"], answer: 2, sortNumeric: true,
    explanation: "12 · 7 = 84.",
  }],
  ["t3-m2e-07", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "A store sells a backpack for $40. During a sale, the price is reduced by 25%. What is the sale price, in dollars, of the backpack?",
    choices: ["10", "15", "30", "35"], answer: 2, sortNumeric: true,
    explanation: "40 ning 25% i — 10; 40 − 10 = 30.",
  }],
  ["t3-m2e-08", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "A line in the <i>xy</i>-plane passes through the points (0, 3) and (2, 11). What is the slope of the line?",
    answers: ["4"],
    explanation: "(11 − 3)/(2 − 0) = 8/2 = 4.",
  }],
  ["t3-m2e-09", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: "What is the mean of the data set 4, 7, 9, 12, 13?",
    choices: ["7", "9", "10", "45"], answer: 1, sortNumeric: true,
    explanation: "(4 + 7 + 9 + 12 + 13)/5 = 45/5 = 9.",
  }],
  ["t3-m2e-10", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "A gym charges a one-time membership fee plus a monthly fee. The total cost <i>C</i>, in dollars, for <i>m</i> months is given by <i>C</i> = 35<i>m</i> + 60. What does 60 represent in this equation?",
    choices: [
      "The one-time membership fee, in dollars",
      "The monthly fee, in dollars",
      "The total cost, in dollars, for 35 months",
      "The number of months of membership",
    ], answer: 0,
    explanation: "60 m ga bog'liq emas — bir martalik to'lov. 35 — oylik to'lov.",
  }],
  ["t3-m2e-11", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `The function <i>g</i> is defined by <i>g</i>(<i>x</i>) = <i>x</i>${SQ} + 3. What is the value of <i>g</i>(5)?`,
    answers: ["28"],
    explanation: "g(5) = 25 + 3 = 28.",
  }],
  ["t3-m2e-12", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>y</i> = 2<i>x</i><br><i>x</i> + <i>y</i> = 18<br>What is the solution (<i>x</i>, <i>y</i>) to the system of equations above?",
    choices: ["(6, 12)", "(9, 9)", "(12, 6)", "(4, 14)"], answer: 0,
    explanation: "x + 2x = 18 ⇒ x = 6, y = 12.",
  }],
  ["t3-m2e-13", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    prompt: "Which of the following is equivalent to the inequality 2<i>x</i> − 5 &lt; 9?",
    choices: ["<i>x</i> &lt; 7", "<i>x</i> &gt; 7", "<i>x</i> &lt; 2", "<i>x</i> &gt; 2"], answer: 0,
    explanation: "2x < 14 ⇒ x < 7.",
  }],
  ["t3-m2e-14", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "M",
    prompt: "Two angles of a triangle measure 48° and 67°. What is the measure, in degrees, of the third angle of the triangle?",
    answers: ["65"],
    explanation: "180 − 48 − 67 = 65.",
  }],
  ["t3-m2e-15", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `Which of the following is a solution to the equation <i>x</i>${SQ} − 9<i>x</i> + 14 = 0?`,
    choices: ["−7", "−2", "2", "9"], answer: 2, sortNumeric: true,
    explanation: "x² − 9x + 14 = (x − 2)(x − 7); yechimlar 2 va 7.",
  }],
  ["t3-m2e-16", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "M",
    prompt: "There are 12 inches in 1 foot. A board is 7.5 feet long. What is the length of the board, in inches?",
    choices: ["19.5", "62.5", "84", "90"], answer: 3, sortNumeric: true,
    explanation: "7.5 · 12 = 90.",
  }],
  ["t3-m2e-17", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "M",
    prompt: "If 4(<i>x</i> − 2) = 2<i>x</i> + 6, what is the value of <i>x</i>?",
    answers: ["7"],
    explanation: "4x − 8 = 2x + 6 ⇒ 2x = 14 ⇒ x = 7.",
  }],
  ["t3-m2e-18", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to <i>x</i>${SQ} − 25?`,
    choices: ["(<i>x</i> − 5)(<i>x</i> + 5)", `(<i>x</i> − 5)${SQ}`, `(<i>x</i> + 5)${SQ}`, "(<i>x</i> − 25)(<i>x</i> + 1)"], answer: 0,
    explanation: "Kvadratlar ayirmasi: x² − 25 = (x − 5)(x + 5).",
  }],
  ["t3-m2e-19", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "The amount of water <i>W</i>, in liters, in a tank <i>t</i> minutes after it starts draining is modeled by <i>W</i> = 600 − 15<i>t</i>. According to the model, how many liters of water are in the tank 20 minutes after it starts draining?",
    choices: ["300", "315", "585", "900"], answer: 0, sortNumeric: true,
    explanation: "W = 600 − 15·20 = 600 − 300 = 300.",
  }],
  ["t3-m2e-20", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: "A circle has an area of 49π square inches. What is the diameter, in inches, of the circle?",
    choices: ["7", "14", "24.5", "49"], answer: 1, sortNumeric: true,
    explanation: "πr² = 49π ⇒ r = 7; diametr 2r = 14.",
  }],
  ["t3-m2e-21", {
    domain: PSDA, skill: "Probability and conditional probability", difficulty: "H",
    prompt: "A bag contains 6 red marbles, 9 blue marbles, and 5 green marbles. If one marble is selected at random from the bag, what is the probability that it is blue?",
    answers: ["9/20", ".45", "0.45"],
    explanation: "Jami 20 ta; ko'k 9 ta ⇒ 9/20 = 0.45.",
  }],
  ["t3-m2e-22", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "The value <i>V</i>, in dollars, of a laptop <i>t</i> years after it was purchased is modeled by <i>V</i> = 1,200(0.8)<sup><i>t</i></sup>. What is the value, in dollars, of the laptop 2 years after it was purchased?",
    choices: ["720", "768", "960", "1,152"], answer: 1, sortNumeric: true,
    explanation: "V = 1,200 · 0.64 = 768.",
  }],
]);

export const t3MathModule2Hard = buildModule([
  ["t3-m2h-01", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: "The graph of the polynomial function <i>f</i> in the <i>xy</i>-plane, where <i>y</i> = <i>f</i>(<i>x</i>), passes through the point (7, 3). Which of the following must be true?",
    choices: ["<i>f</i>(0) = 3", "<i>f</i>(3) = 7", "<i>f</i>(7) = 0", "<i>f</i>(7) = 3"], answer: 3, rotate: 0,
    explanation: "(7, 3) grafikda ⇒ f(7) = 3.",
  }],
  ["t3-m2h-02", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: "For the exponential function <i>g</i>, the value of <i>g</i>(<i>x</i>) triples for every increase of 3 in the value of <i>x</i>. If <i>g</i>(5) = 4, what is the value of <i>g</i>(8)?",
    answers: ["12"],
    explanation: "x 5 dan 8 ga (3 ga) ortadi ⇒ qiymat 3 marta: 4 · 3 = 12.",
  }],
  ["t3-m2h-03", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    image: visitsFigure,
    prompt: "A state park tracks the number of visits to its website. The linear function <i>v</i> models the average number of daily visits to the website, in hundreds, as a function of the number of months, <i>x</i>, since January 2020, where 0 ≤ <i>x</i> ≤ 30. The graph of <i>y</i> = <i>v</i>(<i>x</i>) is shown. Which of the following is the best estimate for the average number of daily visits, in hundreds, in January 2021?",
    choices: ["60", "70", "80", "90"], answer: 2, sortNumeric: true,
    explanation: "Yanvar 2021 — x = 12. Chiziq (0, 110) dan (30, 35) ga: v(12) = 110 − 2.5·12 = 80.",
  }],
  ["t3-m2h-04", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: `What is the <i>x</i>-intercept of a line in the <i>xy</i>-plane that has a slope of −${frac(3, 5)} and passes through the point (0, 9)?`,
    choices: ["(−15, 0)", "(−9, 0)", "(9, 0)", "(15, 0)"], answer: 3, rotate: 0,
    explanation: "y = −(3/5)x + 9 = 0 ⇒ x = 15.",
  }],
  ["t3-m2h-05", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    image: inequalityFigure,
    prompt: "The shaded region shown represents the solutions to which inequality?",
    choices: [
      `<i>y</i> &lt; ${frac(1, 3)}<i>x</i> − 2`,
      "<i>y</i> &lt; 3<i>x</i> − 2",
      `<i>y</i> &gt; ${frac(1, 3)}<i>x</i> − 2`,
      "<i>y</i> &gt; 3<i>x</i> − 2",
    ], answer: 1, rotate: 0,
    explanation: "Chiziq (0, −2) va (2, 4) dan o'tadi ⇒ qiyalik 3. Chiziqdan pastki (o'ng) tomon bo'yalgan, chiziq shtrix ⇒ y < 3x − 2.",
  }],
  ["t3-m2h-06", {
    domain: ALG, skill: "Systems of linear equations", difficulty: "M",
    prompt: "<i>y</i> = 3<i>x</i> + 7<br><i>y</i> = 3<i>x</i> − 7<br>How many solutions does the given system of equations have?",
    choices: ["Zero", "Exactly one", "Exactly two", "Infinitely many"], answer: 0, rotate: 0,
    explanation: "Qiyaliklar teng, y bilan kesishishlar har xil — parallel chiziqlar, yechim yo'q.",
  }],
  ["t3-m2h-07", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    image: nestedFigure,
    prompt: "In the figure, segment <i>BD</i> is parallel to segment <i>AE</i>. If cos <i>A</i> = 0.6, what is the value of sin <i>C</i>?",
    choices: ["0.2", "0.4", "0.6", "0.8"], answer: 2, sortNumeric: true,
    explanation: "ACE uchburchagi E da to'g'ri burchakli; A va C o'tkir burchaklar bir-birini 90° ga to'ldiradi ⇒ sin C = cos A = 0.6.",
  }],
  ["t3-m2h-08", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: `The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 4<i>x</i> − 5 and <i>f</i>(<i>b</i>) = ${frac(2, 3)}. What is the value of <i>b</i>?`,
    answers: ["17/12", "1.416", "1.417"],
    explanation: "4b − 5 = 2/3 ⇒ 4b = 17/3 ⇒ b = 17/12.",
  }],
  ["t3-m2h-09", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "50 − |<i>x</i> − 7| = 47<br>What is the sum of the solutions to the given equation?",
    choices: ["−14", "3", "10", "14"], answer: 3, sortNumeric: true,
    explanation: "|x − 7| = 3 ⇒ x = 10 yoki x = 4; yig'indi 14.",
  }],
  ["t3-m2h-10", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "H",
    prompt: `<i>f</i>(<i>x</i>) = <i>x</i>${SQ} − 6<i>x</i> − 391<br>The function <i>f</i> is defined by the given equation. Which of the following equivalent forms of the equation displays the minimum value of the function as a constant or coefficient?`,
    choices: [
      `<i>f</i>(<i>x</i>) = (<i>x</i> − 3)${SQ} + (−400)`,
      `<i>f</i>(<i>x</i>) = <i>x</i>${SQ} − 6<i>x</i> + 9 − 400`,
      "<i>f</i>(<i>x</i>) = <i>x</i>(<i>x</i> − 6) + (−391)",
      "<i>f</i>(<i>x</i>) = (<i>x</i> + 17)(<i>x</i> − 23)",
    ], answer: 0,
    explanation: "Uch shakli (x − h)² + k minimal qiymat k = −400 ni ko'rsatadi.",
  }],
  ["t3-m2h-11", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    image: parabolaFigure,
    prompt: `The graph of <i>y</i> = 4<i>x</i>${SQ} + <i>bx</i> + <i>c</i> is shown, where <i>b</i> and <i>c</i> are constants. What is the value of <i>bc</i>?`,
    answers: ["-32"],
    explanation: "Grafik (0, −4) dan o'tadi ⇒ c = −4. Uch x = −1 da ⇒ −b/(2·4) = −1 ⇒ b = 8. bc = −32.",
  }],
  ["t3-m2h-12", {
    domain: ALG, skill: "Linear functions", difficulty: "H",
    prompt: "A line in the <i>xy</i>-plane passes through the points (5, 3), (0, 10), and (<i>c</i>, 0). What is the value of <i>c</i>?",
    answers: ["50/7", "7.142", "7.143"],
    explanation: "Qiyalik (3 − 10)/5 = −7/5; y = −(7/5)x + 10 = 0 ⇒ x = 50/7.",
  }],
  ["t3-m2h-13", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "H",
    prompt: "One can of wood stain costs $24 and will cover 400 square feet of a surface. A fence has a total surface area of <i>a</i> square feet. Which equation represents the cost <i>c</i>, in dollars, of the stain needed to cover the fence twice?",
    choices: [
      `<i>c</i> = 24 · ${frac("<i>a</i>", 200)}`,
      `<i>c</i> = 24 · ${frac("<i>a</i>", 400)}`,
      `<i>c</i> = ${frac("400<i>a</i>", 24)}`,
      `<i>c</i> = ${frac("800<i>a</i>", 24)}`,
    ], answer: 0,
    explanation: "Ikki qatlam — 2a kv. fut; banka soni 2a/400 = a/200; narx 24 · a/200.",
  }],
  ["t3-m2h-14", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `The expression (2<i>x</i> + 3)(5<i>x</i> − 4) can be written in the form <i>ax</i>${SQ} + <i>bx</i> + <i>c</i>, where <i>a</i>, <i>b</i>, and <i>c</i> are constants. What is the value of <i>a</i> + <i>b</i>?`,
    answers: ["17"],
    explanation: "10x² − 8x + 15x − 12 = 10x² + 7x − 12; a + b = 10 + 7 = 17.",
  }],
  ["t3-m2h-15", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "A rectangle has a length of <i>x</i> units and a width of <i>x</i> − 4 units. If the rectangle has an area of 45 square units, what is the value of <i>x</i>?",
    choices: ["5", "9", "13", "45"], answer: 1, sortNumeric: true,
    explanation: "x(x − 4) = 45 ⇒ x² − 4x − 45 = 0 ⇒ (x − 9)(x + 5) = 0 ⇒ x = 9.",
  }],
  ["t3-m2h-16", {
    domain: PSDA, skill: "Inference from sample statistics", difficulty: "H",
    prompt: "A quality inspector checked a sample of 400 batteries selected at random from a shipment of 10,000 batteries to estimate what percentage of the batteries in the shipment were defective. From this sample, the inspector estimated that 6% of the 10,000 batteries were defective, with an associated margin of error of 2.5%. Which of the following is the most appropriate conclusion?",
    choices: [
      "It is plausible that between 350 and 850 of the batteries in the shipment are defective.",
      "It is plausible that fewer than 350 of the batteries in the shipment are defective.",
      "Exactly 600 of the batteries in the shipment are defective.",
      "It is plausible that more than 850 of the batteries in the shipment are defective.",
    ], answer: 0,
    explanation: "6% ± 2.5% = 3.5% … 8.5%; 10,000 dan: 350 … 850.",
  }],
  ["t3-m2h-17", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `${frac(1, "<i>x</i> − 2")} = ${frac("<i>x</i> − 3", "−<i>x</i> + 2.25")}<br>Which of the following is a solution to the given equation?`,
    choices: ["0.25", "2.5", "3", "4"], answer: 1, sortNumeric: true,
    explanation: "−x + 2.25 = (x − 2)(x − 3) = x² − 5x + 6 ⇒ x² − 4x + 3.75 = 0 ⇒ x = 1.5 yoki 2.5. Variantlarda 2.5.",
  }],
  ["t3-m2h-18", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "H",
    prompt: table("", ["Number of buses", "Maximum number of riders"], [["2", "90"], ["5", "216"], ["10", "426"]]) +
      "The table shows the linear relationship between the number of buses, <i>c</i>, in a school's fleet and the maximum number of riders, <i>p</i>, that the fleet can carry. Which equation represents the linear relationship between <i>c</i> and <i>p</i>?",
    choices: ["42<i>c</i> − <i>p</i> = −6", "42<i>c</i> − <i>p</i> = 6", "42<i>p</i> − <i>c</i> = −6", "42<i>p</i> − <i>c</i> = 6"], answer: 0,
    explanation: "Qiyalik (216 − 90)/3 = 42; p = 42c + 6 ⇒ 42c − p = −6.",
  }],
  ["t3-m2h-19", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "On January 1, 2005, the population of a town was 18,420, and on January 1, 2015, the population was 19,170. The equation 10<i>x</i> + 18,420 = 19,170 describes this situation. Which of the following is the best interpretation of <i>x</i> in this context?",
    choices: [
      "The average increase per year of the population between 2005 and 2015",
      "The total increase in population between 2005 and 2015",
      "The projected population of the town 10 years after 2015",
      "The percentage by which the population of the town increased each year between 2005 and 2015",
    ], answer: 0,
    explanation: "10 yil × x = umumiy o'sish ⇒ x — yillik o'rtacha o'sish.",
  }],
  ["t3-m2h-20", {
    domain: PSDA, skill: "Percentages", difficulty: "H",
    prompt: "The value of a rare coin increased by 125% from the end of 2018 to the end of 2019 and then decreased by 12% from the end of 2019 to the end of 2020. What was the net percentage increase in the value of the coin from the end of 2018 to the end of 2020?",
    choices: ["98.00%", "113.00%", "125.00%", "198.00%"], answer: 0, rotate: 0,
    explanation: "2.25 · 0.88 = 1.98 ⇒ 98% o'sish.",
  }],
  ["t3-m2h-21", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "H",
    prompt: "An object's speed is increasing at a rate of 9.80 meters per second squared. What is this rate, in <u>miles per minute squared</u>, rounded to the nearest tenth? Use 1 mile = 1,609 meters.",
    answers: ["21.9"],
    explanation: "1 min² = 3,600 s²; 9.80 · 3,600 / 1,609 ≈ 21.93 ⇒ 21.9.",
  }],
  ["t3-m2h-22", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `9<i>x</i>${SQ} − <i>px</i> + <i>w</i> = −40<br>In the given equation, <i>p</i> and <i>w</i> are integer constants. The equation has exactly one real solution. Which is NOT a possible value of <i>w</i>?`,
    choices: ["−31", "9", "20", "24"], answer: 2, sortNumeric: true,
    explanation: "9x² − px + (w + 40) = 0; bitta yechim ⇒ p² = 36(w + 40) ⇒ w + 40 to'liq kvadrat bo'lishi kerak. −31→9, 9→49, 24→64 mos; 20→60 kvadrat emas.",
  }],
]);
