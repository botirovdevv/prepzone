// ------------------------------------------------------------------
// Math savollari generatori.
//
// MUHIM: har bir savol uchun to'g'ri javob shu yerda DASTUR orqali
// (haqiqiy matematik hisoblash bilan) topiladi, keyin variantlar
// (choices) ham shu hisoblangan qiymatdan hosil qilinadi. Shu
// sababli to'g'ri javob har doim ichki izchil (self-consistent) va
// xato bo'lishi mumkin emas — men qo'lda hisoblab xato qilish xavfi
// yo'q.
// ------------------------------------------------------------------

const LABELS = ["A", "B", "C", "D"];

function fmt(n) {
  if (typeof n !== "number") return String(n);
  // butun sonlarni butun, kasrlarni 2 xonagacha ko'rsatish
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.00$/, "");
}

let uid = 1;
function buildQuestion(prompt, values, correctValue, rotate) {
  const rotated = values.slice(rotate % values.length).concat(values.slice(0, rotate % values.length));
  const choices = rotated.map((v, i) => ({ label: LABELS[i], text: fmt(v) }));
  const correctAnswer = LABELS[rotated.findIndex((v) => v === correctValue)];
  return { id: uid++, prompt, choices, correctAnswer };
}

// 1) ax + b = c
function oneStepLinear(a, b, c, rotate = 0) {
  const x = (c - b) / a;
  const prompt = `If ${a}x ${b >= 0 ? "+ " + b : "- " + -b} = ${c}, what is the value of x?`;
  return buildQuestion(prompt, [x, x + 1, x - 1, x + 2], x, rotate);
}

// 2) a(x - b) = cx + d
function twoStepDistribute(a, b, cCoef, d, rotate = 0) {
  const x = (d + a * b) / (a - cCoef);
  const prompt = `If ${a}(x ${b >= 0 ? "- " + b : "+ " + -b}) = ${cCoef}x ${d >= 0 ? "+ " + d : "- " + -d}, what is the value of x?`;
  return buildQuestion(prompt, [x, x + 1, x - 1, -x], x, rotate);
}

// 3) p% of n
function percentOf(p, n, rotate = 0) {
  const x = (p / 100) * n;
  const prompt = `What is ${p}% of ${n}?`;
  return buildQuestion(prompt, [x, x + 5, x - 5, x + 10], x, rotate);
}

// 4) narx + soliq
function percentWithTax(cost, taxPercent, rotate = 0) {
  const total = +(cost * (1 + taxPercent / 100)).toFixed(2);
  const prompt = `An item costs $${fmt(cost)} before a ${taxPercent}% sales tax. What is the total cost?`;
  const values = [total, +(total + 1).toFixed(2), +(total - 1).toFixed(2), +(total + 2).toFixed(2)];
  const rotated = values.slice(rotate % values.length).concat(values.slice(0, rotate % values.length));
  const choices = rotated.map((v, i) => ({ label: LABELS[i], text: `$${fmt(v)}` }));
  const correctAnswer = LABELS[rotated.findIndex((v) => v === total)];
  return { id: uid++, prompt, choices, correctAnswer };
}

// 5) nisbat masalasi
function ratioWordProblem(ratioA, ratioB, multiplier, itemA, itemB, rotate = 0) {
  const amountB = ratioB * multiplier;
  const amountA = ratioA * multiplier;
  const prompt = `A recipe calls for ${ratioA} cups of ${itemA} for every ${ratioB} cups of ${itemB}. If a baker uses ${amountB} cups of ${itemB}, how many cups of ${itemA} are needed?`;
  return buildQuestion(prompt, [amountA, amountA + ratioA, amountA - ratioA, amountB], amountA, rotate);
}

// 6) qiyalik
function slopeFromPoints(x1, y1, x2, y2, rotate = 0) {
  const slope = (y2 - y1) / (x2 - x1);
  const prompt = `A line passes through the points (${x1}, ${y1}) and (${x2}, ${y2}). What is the slope of the line?`;
  return buildQuestion(prompt, [slope, slope + 1, slope - 1, -slope], slope, rotate);
}

// 7) to'g'ri to'rtburchak perimetri
function rectanglePerimeterWidth(k, m, width, rotate = 0) {
  const length = k * width + m;
  const perimeter = 2 * (length + width);
  const kWord = k === 2 ? "twice" : k === 3 ? "three times" : `${k} times`;
  const prompt = `A rectangle has a length that is ${m} more than ${kWord} its width. If the perimeter is ${perimeter}, what is the width?`;
  return buildQuestion(prompt, [width, width + 1, width - 1, width + 2], width, rotate);
}

// 8) tenglamalar sistemasi: a1*x + b1*y = c1 ; a2*x + b2*y = c2
function systemOfEquations(a1, b1, a2, b2, x, y, rotate = 0) {
  const c1 = a1 * x + b1 * y;
  const c2 = a2 * x + b2 * y;
  const b1Term = b1 >= 0 ? `+ ${b1}y` : `- ${-b1}y`;
  const b2Term = b2 >= 0 ? `+ ${b2}y` : `- ${-b2}y`;
  const prompt = `The system of equations ${a1}x ${b1Term} = ${c1} and ${a2}x ${b2Term} = ${c2} has solution (x, y). What is the value of x?`;
  return buildQuestion(prompt, [x, x + 1, x - 1, y], x, rotate);
}

// 9) faktorlanadigan kvadrat tenglama
function quadraticFactorable(root1, root2, rotate = 0) {
  const b = -(root1 + root2);
  const c = root1 * root2;
  const bTerm = b === 0 ? "" : b > 0 ? `+ ${b}x` : `- ${-b}x`;
  const cTerm = c === 0 ? "" : c > 0 ? `+ ${c}` : `- ${-c}`;
  const [lo, hi] = [root1, root2].sort((a, b2) => a - b2);
  const prompt = `If f(x) = x^2 ${bTerm} ${cTerm}, for what value(s) of x does f(x) = 0?`;
  const values = [
    `x = ${lo} or x = ${hi}`,
    `x = ${-lo} or x = ${-hi}`,
    `x = ${lo} only`,
    `x = ${lo + 1} or x = ${hi + 1}`,
  ];
  return buildQuestion(prompt, values, values[0], rotate);
}

// 10) kvadrat funksiyani baholash
function functionEvaluateQuadratic(a, b, c, x0, rotate = 0) {
  const value = a * x0 * x0 + b * x0 + c;
  const bTerm = b >= 0 ? `+ ${b}x` : `- ${-b}x`;
  const cTerm = c >= 0 ? `+ ${c}` : `- ${-c}`;
  const prompt = `The function f(x) = ${a}x^2 ${bTerm} ${cTerm} is graphed in the xy-plane. What is the value of f(${x0})?`;
  return buildQuestion(prompt, [value, value + 1, value - 1, value + 2], value, rotate);
}

// 11) eksponensial o'sish
function exponentialGrowth(p0, doublingHours, tHours, rotate = 0) {
  const factor = Math.pow(2, tHours / doublingHours);
  const result = p0 * factor;
  const prompt = `A population of bacteria doubles every ${doublingHours} hours. If there are ${p0} bacteria at time t = 0, how many are there at t = ${tHours} hours?`;
  return buildQuestion(prompt, [result, result / 2, result * 2, p0 * (factor + 1)], result, rotate);
}

// 12) o'rtacha (mean)
function meanOfSet(numbers, rotate = 0) {
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const sorted = [...numbers].sort((a, b) => a - b);
  let median = sorted[Math.floor(sorted.length / 2)];
  if ([mean, mean + 1, mean - 1].includes(median)) median = mean + 2.5;
  const prompt = `What is the mean (average) of the numbers ${numbers.join(", ")}?`;
  return buildQuestion(prompt, [mean, mean + 1, mean - 1, median], mean, rotate);
}

// --------------------------------------------------------------
// Modullarni yig'ish — har birida aniq 22 ta savol (real SAT Math
// modulidagi savollar soni bilan bir xil)
// --------------------------------------------------------------

export function buildMathModule1() {
  return [
    oneStepLinear(3, 7, 22, 0),
    oneStepLinear(5, -4, 26, 1),
    oneStepLinear(2, 15, 41, 2),
    twoStepDistribute(5, 2, 3, 4, 1),
    twoStepDistribute(4, 3, 2, 5, 2),
    twoStepDistribute(6, 1, 4, 2, 3),
    percentOf(15, 240, 0),
    percentOf(20, 150, 1),
    percentWithTax(50, 8, 0),
    ratioWordProblem(3, 2, 4, "flour", "sugar", 0),
    ratioWordProblem(5, 3, 3, "cement", "sand", 1),
    slopeFromPoints(2, 5, 4, 11, 0),
    slopeFromPoints(1, 2, 3, 10, 1),
    slopeFromPoints(-1, 4, 2, -2, 2),
    rectanglePerimeterWidth(2, 4, 5, 0),
    rectanglePerimeterWidth(3, 2, 4, 1),
    systemOfEquations(2, 1, 1, -1, 4, 2, 0),
    systemOfEquations(1, 1, 1, -1, 6, 3, 1),
    quadraticFactorable(1, 3, 0),
    quadraticFactorable(-2, 5, 1),
    functionEvaluateQuadratic(2, -3, 1, 2, 0),
    exponentialGrowth(200, 3, 9, 0),
  ];
}

export function buildMathModule2Easy() {
  return [
    oneStepLinear(1, 6, 11, 0),
    oneStepLinear(1, -2, 9, 1),
    oneStepLinear(2, 3, 15, 2),
    oneStepLinear(3, -5, 10, 3),
    oneStepLinear(4, 1, 17, 0),
    oneStepLinear(5, 2, 27, 1),
    percentOf(10, 150, 0),
    percentOf(20, 60, 1),
    percentOf(50, 84, 2),
    percentOf(25, 200, 3),
    percentWithTax(20, 5, 0),
    percentWithTax(40, 10, 1),
    percentWithTax(60, 6, 2),
    ratioWordProblem(2, 1, 5, "blue paint", "white paint", 0),
    ratioWordProblem(3, 4, 2, "apples", "oranges", 1),
    ratioWordProblem(1, 2, 6, "tea", "water", 2),
    slopeFromPoints(0, 1, 2, 5, 0),
    slopeFromPoints(1, 0, 3, 8, 1),
    rectanglePerimeterWidth(2, 2, 4, 0),
    rectanglePerimeterWidth(2, 0, 6, 1),
    meanOfSet([2, 4, 6, 8, 10], 0),
    meanOfSet([5, 7, 9, 11], 1),
  ];
}

export function buildMathModule2Hard() {
  return [
    twoStepDistribute(5, 2, 3, 4, 0),
    twoStepDistribute(7, 1, 2, 6, 1),
    twoStepDistribute(6, 3, 1, 2, 2),
    twoStepDistribute(8, 2, 5, 3, 3),
    systemOfEquations(2, 1, 1, -1, 4, 2, 0),
    systemOfEquations(3, 2, 1, -2, 4, 2, 1),
    systemOfEquations(1, 1, 1, -1, 6, 3, 2),
    systemOfEquations(2, 3, 2, -1, 7, 1, 3),
    systemOfEquations(4, 1, 1, 3, 5, 2, 0),
    quadraticFactorable(1, 3, 0),
    quadraticFactorable(-2, 5, 1),
    quadraticFactorable(2, 6, 2),
    quadraticFactorable(-3, -1, 3),
    quadraticFactorable(4, 7, 0),
    functionEvaluateQuadratic(2, -3, 1, 2, 0),
    functionEvaluateQuadratic(3, 2, -4, 3, 1),
    functionEvaluateQuadratic(-1, 5, 2, 4, 2),
    functionEvaluateQuadratic(2, 0, -5, 3, 3),
    exponentialGrowth(200, 3, 9, 0),
    exponentialGrowth(100, 2, 6, 1),
    percentWithTax(150, 12, 0),
    percentWithTax(220, 18, 1),
  ];
}
