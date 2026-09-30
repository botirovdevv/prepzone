// March 2026 (14-mart) — original savollar: 12 ta RW + 10 ta Math.
import { buildModule, STEM, table, notes } from "../sat/helpers.js";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";
const ALG = "algebra";
const ADV = "advanced-math";
const PSDA = "problem-solving-data";
const GEO = "geometry-trig";
const SQ = "<sup>2</sup>";

export const rw = buildModule([
  ["mar26-rw-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The museum's new exhibit is ______: it will remain on display for only three weeks before traveling to another city.",
    prompt: STEM.wic,
    choices: ["temporary", "permanent", "colorful", "mandatory"], answer: 0,
    explanation: "Faqat uch hafta turadi — vaqtinchalik (\"temporary\").",
  }],
  ["mar26-rw-02", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Ecologist Mariana Duarte's findings ______ an earlier assumption that the frogs could survive only in undisturbed forests: she found thriving populations in several farm ponds.",
    prompt: STEM.wic,
    choices: ["challenge", "confirm", "ignore", "restate"], answer: 0,
    explanation: "Qurbaqalar ferma hovuzlarida ham yashaydi — bu avvalgi taxminga qarshi chiqadi (\"challenge\").",
  }],
  ["mar26-rw-03", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Many readers assume that Hiroshi Tanaka wrote his celebrated novel quickly, since its prose feels spontaneous. In fact, Tanaka's notebooks reveal that he revised each chapter more than a dozen times, often reworking a single sentence for days. The apparent ease of the novel, then, was the product of painstaking effort.",
    prompt: STEM.structure,
    choices: [
      "It presents a common assumption about a novel, then uses evidence to show that the assumption is mistaken.",
      "It describes a novelist's writing habits, then argues that those habits weakened his work.",
      "It compares two novels, then explains why one became more popular than the other.",
      "It summarizes a novel's plot, then evaluates the quality of its prose.",
    ], answer: 0,
    explanation: "Avval keng tarqalgan taxmin, keyin daftarlar (dalil) uni rad etadi.",
  }],
  ["mar26-rw-04", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "Honeybee colonies must keep their hives within a narrow temperature range. On hot days, worker bees collect water, spread it across the comb, and fan their wings to evaporate it, cooling the hive much as sweat cools a human body. On cold days, the bees cluster tightly together and shiver their flight muscles to generate heat.",
    prompt: STEM.mainIdea,
    choices: [
      "Honeybees use coordinated behaviors to regulate the temperature of their hives.",
      "Honeybees prefer to live in regions with mild climates.",
      "Worker bees spend most of their time collecting water.",
      "Hives overheat more often than they become too cold.",
    ], answer: 0,
    explanation: "Issiqda sovutish, sovuqda isitish — asosiy fikr haroratni boshqarish.",
  }],
  ["mar26-rw-05", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    passage: table(
      "Electric Bicycle Sales in Four Cities",
      ["City", "2023", "2025"],
      [["Lyon", "1,200", "1,900"], ["Oslo", "2,100", "3,500"], ["Porto", "800", "1,500"], ["Graz", "1,500", "1,800"]]
    ) + "A student claims that among the four cities in the table, Oslo experienced the greatest increase in electric bicycle sales from 2023 to 2025.",
    prompt: "Which choice most effectively uses data from the table to support the student's claim?",
    choices: [
      "Sales in Oslo rose from 2,100 to 3,500, an increase larger than that of any other city in the table.",
      "Sales in Porto nearly doubled from 2023 to 2025.",
      "In 2023, sales in Graz were higher than sales in Lyon.",
      "Lyon and Porto each had an increase of 700 bicycles.",
    ], answer: 0,
    explanation: "Oslo: +1,400; Lyon va Porto: +700; Graz: +300. Faqat A da'voni to'g'ridan-to'g'ri tasdiqlaydi.",
  }],
  ["mar26-rw-06", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Archaeologists studying an ancient inland settlement found large quantities of fish bones but no fishing hooks, nets, or boat remains at the site. Chemical analysis showed that the fish came from a lake nearly 40 kilometers away. These findings suggest that the settlement's residents ______",
    prompt: STEM.complete,
    choices: [
      "likely obtained fish through exchange with people living closer to the lake.",
      "did not include fish in their regular diet.",
      "built the settlement beside the lake in order to fish more easily.",
      "preferred fish from the sea to fish from the lake.",
    ], answer: 0,
    explanation: "Baliq ko'p, lekin baliq ovlash asboblari yo'q va ko'l uzoqda — baliq ayirboshlash orqali olingan.",
  }],
  ["mar26-rw-07", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "The Atacama Desert in Chile is one of the driest places on ______ some weather stations there have never recorded rainfall.",
    prompt: STEM.conventions,
    choices: ["Earth;", "Earth,", "Earth", "Earth that"], answer: 0,
    explanation: "Ikki mustaqil gap — nuqtali vergul kerak.",
  }],
  ["mar26-rw-08", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The collection of letters written by the explorer's crew members ______ valuable details about daily life aboard the ship.",
    prompt: STEM.conventions,
    choices: ["provides", "provide", "have provided", "are providing"], answer: 0,
    explanation: "Ega — \"The collection\" (birlik), shuning uchun \"provides\".",
  }],
  ["mar26-rw-09", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "In 1928, Scottish microbiologist ______ discovered penicillin after noticing that a mold had killed the bacteria in one of his culture dishes.",
    prompt: STEM.conventions,
    choices: ["Alexander Fleming", "Alexander Fleming,", ", Alexander Fleming,", "Alexander, Fleming"], answer: 0,
    explanation: "Ism unvondan oldin cheklovchi (restrictive) — vergul qo'yilmaydi.",
  }],
  ["mar26-rw-10", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Solar panels generate no electricity at night. ______ many homeowners who install solar panels also purchase batteries to store energy produced during the day.",
    prompt: STEM.transition,
    choices: ["For this reason,", "In contrast,", "Similarly,", "For example,"], answer: 0,
    explanation: "Sabab-natija: tunda elektr yo'q — shuning uchun batareya olinadi.",
  }],
  ["mar26-rw-11", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "The first steam locomotives were slow and unreliable, often breaking down after only a few miles. ______ within a few decades, railways had become the fastest way to travel across Britain.",
    prompt: STEM.transition,
    choices: ["Nevertheless,", "Therefore,", "In other words,", "Likewise,"], answer: 0,
    explanation: "Qarama-qarshilik: sekin edi — shunga qaramay eng tez bo'ldi.",
  }],
  ["mar26-rw-12", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Maria Sibylla Merian (1647–1717) was a German naturalist and artist.",
      "In 1699, she traveled to Suriname to study insects.",
      "She documented the complete life cycles of butterflies and moths.",
      "Her book <i>Metamorphosis insectorum Surinamensium</i> was published in 1705.",
      "The book contained 60 detailed illustrations of insect life cycles.",
    ]),
    prompt: "The student wants to describe the contents of Merian's 1705 book. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "Merian's 1705 book, <i>Metamorphosis insectorum Surinamensium</i>, contained 60 detailed illustrations of insect life cycles.",
      "In 1699, German naturalist Maria Sibylla Merian traveled to Suriname.",
      "Maria Sibylla Merian, who lived from 1647 to 1717, was both a naturalist and an artist.",
      "Merian traveled to Suriname in 1699, and her book was published six years later.",
    ], answer: 0,
    explanation: "Maqsad — kitob mazmuni; faqat A kitobda nima borligini aytadi.",
  }],
]);

export const math = buildModule([
  ["mar26-m-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 3<i>x</i> + 7 = 22, what is the value of <i>x</i>?",
    choices: ["3", "5", "7", "15"], answer: 1, sortNumeric: true,
    explanation: "3x = 15, x = 5.",
  }],
  ["mar26-m-02", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "M",
    prompt: "<i>x</i> + <i>y</i> = 10<br><i>x</i> − <i>y</i> = 4<br>If (<i>x</i>, <i>y</i>) is the solution to the system of equations above, what is the value of <i>x</i>?",
    choices: ["3", "6", "7", "14"], answer: 2, sortNumeric: true,
    explanation: "Qo'shamiz: 2x = 14, x = 7.",
  }],
  ["mar26-m-03", {
    domain: ALG, skill: "Linear functions", difficulty: "H",
    prompt: "Line <i>ℓ</i> passes through the points (2, 5) and (6, 17) in the <i>xy</i>-plane. Which equation defines line <i>ℓ</i>?",
    choices: ["<i>y</i> = 3<i>x</i> − 1", "<i>y</i> = 3<i>x</i> + 5", "<i>y</i> = 4<i>x</i> − 3", "<i>y</i> = 2<i>x</i> + 1"], answer: 0,
    explanation: "Qiyalik (17 − 5)/(6 − 2) = 3; 5 = 3·2 + b, b = −1.",
  }],
  ["mar26-m-04", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: "Which expression is equivalent to (<i>x</i> + 4)" + SQ + "?",
    choices: [`<i>x</i>${SQ} + 8<i>x</i> + 16`, `<i>x</i>${SQ} + 16`, `<i>x</i>${SQ} + 4<i>x</i> + 16`, "2<i>x</i> + 8"], answer: 0,
    explanation: "(x + 4)² = x² + 2·4·x + 16 = x² + 8x + 16.",
  }],
  ["mar26-m-05", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: `The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = <i>x</i>${SQ} − 6<i>x</i> + 5. What is the sum of the <i>x</i>-coordinates of the <i>x</i>-intercepts of the graph of <i>y</i> = <i>f</i>(<i>x</i>)?`,
    choices: ["−6", "5", "6", "11"], answer: 2, sortNumeric: true,
    explanation: "x² − 6x + 5 = (x − 1)(x − 5); 1 + 5 = 6.",
  }],
  ["mar26-m-06", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "A population of bacteria doubles every 3 hours. The initial population is 500. Which function gives the population <i>P</i>(<i>t</i>) after <i>t</i> hours?",
    choices: [
      "<i>P</i>(<i>t</i>) = 500(2)<sup><i>t</i>/3</sup>",
      "<i>P</i>(<i>t</i>) = 500(2)<sup>3<i>t</i></sup>",
      "<i>P</i>(<i>t</i>) = 500(3)<sup><i>t</i>/2</sup>",
      "<i>P</i>(<i>t</i>) = 500 + 2(<i>t</i>/3)",
    ], answer: 0,
    explanation: "Har 3 soatda 2 marta: daraja t/3.",
  }],
  ["mar26-m-07", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "A shirt originally priced at $40 is on sale for 25% off the original price. What is the sale price of the shirt?",
    choices: ["$10", "$15", "$30", "$35"], answer: 2,
    explanation: "40 × 0.75 = 30.",
  }],
  ["mar26-m-08", {
    domain: PSDA, skill: "One-variable data", difficulty: "M",
    prompt: "The mean of five numbers is 12. When one of the numbers, 20, is removed, what is the mean of the remaining four numbers?",
    choices: ["8", "10", "12", "14"], answer: 1, sortNumeric: true,
    explanation: "Yig'indi 60; 60 − 20 = 40; 40 / 4 = 10.",
  }],
  ["mar26-m-09", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    prompt: "In right triangle <i>ABC</i>, angle <i>C</i> is a right angle, <i>AC</i> = 6, and <i>BC</i> = 8. What is the value of sin <i>A</i>?",
    choices: ["3/5", "3/4", "4/5", "4/3"], answer: 2,
    explanation: "AB = 10; sin A = qarama-qarshi katet / gipotenuza = BC/AB = 8/10 = 4/5.",
  }],
  ["mar26-m-10", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: `The equation <i>x</i>${SQ} + <i>y</i>${SQ} − 6<i>x</i> + 4<i>y</i> = 12 defines a circle in the <i>xy</i>-plane. What is the radius of the circle?`,
    choices: ["5", "√12", "12", "25"], answer: 0,
    explanation: "(x − 3)² + (y + 2)² = 12 + 9 + 4 = 25, r = 5.",
  }],
]);
