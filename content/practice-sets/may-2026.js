// May 2026 (2-may) — original savollar: 12 ta RW + 10 ta Math.
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
  ["may26-rw-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Because the hiking trail is steep and rocky, park rangers ______ visitors to wear sturdy boots and to carry plenty of water.",
    prompt: STEM.wic,
    choices: ["advise", "forbid", "prevent", "doubt"], answer: 0,
    explanation: "Qo'riqchilar mustahkam poyabzal kiyishni maslahat beradi (\"advise\").",
  }],
  ["may26-rw-02", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Critics had expected the composer's final symphony to be grand and dramatic, but the work is strikingly ______: its melodies are simple, its orchestration is sparse, and several movements last less than three minutes.",
    prompt: STEM.wic,
    choices: ["restrained", "turbulent", "derivative", "incoherent"], answer: 0,
    explanation: "Oddiy kuylar, siyrak orkestr, qisqa qismlar — vazmin, cheklangan (\"restrained\").",
  }],
  ["may26-rw-03", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b><br>Many urban planners argue that adding lanes to congested highways reduces traffic. Wider roads, they say, allow more cars to move at once, shortening commutes.<br><br><b>Text 2</b><br>Economists Gilles Duranton and Matthew Turner studied highway expansion across U.S. cities and found that vehicle miles traveled rose almost exactly in proportion to new road capacity. New lanes, they concluded, attract new drivers, so congestion soon returns to its previous level.",
    prompt: "Based on the texts, how would Duranton and Turner (Text 2) most likely respond to the planners' argument in Text 1?",
    choices: [
      "They would argue that the planners overlook the way added capacity increases the amount of driving.",
      "They would agree that wider highways permanently shorten commutes in most cities.",
      "They would claim that highway expansion has no effect on the number of drivers.",
      "They would suggest that congestion is mainly caused by poorly trained drivers.",
    ], answer: 0,
    explanation: "Text 2: yangi yo'llar yangi haydovchilarni jalb qiladi — rejalashtiruvchilar buni hisobga olmagan.",
  }],
  ["may26-rw-04", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Botanist Aiyana Redcloud hypothesizes that a certain species of sunflower turns to face east each morning because warmer flowers attract more pollinating bees.",
    prompt: "Which finding, if true, would most directly support Redcloud's hypothesis?",
    choices: [
      "East-facing sunflowers were warmer in the morning and received more bee visits than sunflowers artificially turned to face west.",
      "Sunflowers grown in greenhouses turned toward artificial lights regardless of their direction.",
      "Bees visited sunflowers less frequently in the afternoon than in the morning.",
      "Some sunflower species do not turn to face the sun at any point in the day.",
    ], answer: 0,
    explanation: "Gipoteza: iliqlik → ko'proq ari. A ikkalasini ham ko'rsatadi.",
  }],
  ["may26-rw-05", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    passage: table(
      "Percentage of Surveyed Adults Who Read Print Books, by Age Group",
      ["Age group", "2016", "2024"],
      [["18–29", "72%", "68%"], ["30–49", "65%", "60%"], ["50–64", "61%", "59%"], ["65+", "58%", "62%"]]
    ) + "A researcher notes that print reading declined among most age groups from 2016 to 2024. However, one group was an exception: ______",
    prompt: STEM.table,
    choices: [
      "the percentage of adults aged 65 and older who read print books rose from 58% to 62%.",
      "adults aged 18–29 had the highest percentage of print readers in both years.",
      "the percentage of adults aged 30–49 who read print books fell from 65% to 60%.",
      "adults aged 50–64 read print books at nearly the same rate in both years.",
    ], answer: 0,
    explanation: "Istisno — o'sgan guruh: faqat 65+ (58% → 62%).",
  }],
  ["may26-rw-06", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "In a study of city parks, researchers found that parks with dense tree cover were, on average, 4°C cooler on summer afternoons than nearby streets, while parks consisting mainly of open lawn were only 1°C cooler. This suggests that the cooling effect of a park depends largely on ______",
    prompt: STEM.complete,
    choices: [
      "the amount of shade its trees provide.",
      "the number of people who visit it.",
      "how close it is to other parks.",
      "whether its lawns are watered regularly.",
    ], answer: 0,
    explanation: "Daraxtli parklar 4°C, maysali parklar 1°C salqinroq — farq daraxt soyasida.",
  }],
  ["may26-rw-07", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Each of the students in the robotics club ______ responsible for designing one part of the team's machine.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "have been"], answer: 0,
    explanation: "\"Each\" — birlik, shuning uchun \"is\".",
  }],
  ["may26-rw-08", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The Great Barrier Reef stretches for more than 2,300 ______ it is so large that it can be seen from space.",
    prompt: STEM.conventions,
    choices: ["kilometers, in fact,", "kilometers; in fact,", "kilometers in fact", "kilometers in fact,"], answer: 1,
    explanation: "Ikki mustaqil gap: nuqtali vergul + \"in fact,\".",
  }],
  ["may26-rw-09", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Having spent years studying the migration routes of monarch butterflies, ______",
    prompt: STEM.conventions,
    choices: [
      "entomologist Rosa Lin published a detailed map of their journey across North America.",
      "a detailed map of the butterflies' journey across North America was published by entomologist Rosa Lin.",
      "the journey of the butterflies across North America was mapped in detail by entomologist Rosa Lin.",
      "North America was the subject of a detailed map published by entomologist Rosa Lin.",
    ], answer: 0,
    explanation: "Kirish qismi (\"Having spent years...\") bajaruvchiga — Rosa Lin'ga ishora qilishi kerak.",
  }],
  ["may26-rw-10", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Octopuses can change the color of their skin in less than a second. ______ they can alter its texture, raising small bumps to blend in with rocks and coral.",
    prompt: STEM.transition,
    choices: ["In addition,", "However,", "As a result,", "Instead,"], answer: 0,
    explanation: "Yana bir qobiliyat qo'shilmoqda — \"In addition\".",
  }],
  ["may26-rw-11", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "Early critics dismissed photography as a mechanical process rather than an art form. Photographers such as Alfred Stieglitz worked to change this view, exhibiting carefully composed prints in galleries. ______ by the 1920s, major museums had begun collecting photographs alongside paintings.",
    prompt: STEM.transition,
    choices: ["Eventually,", "Conversely,", "For instance,", "Regardless,"], answer: 0,
    explanation: "Vaqt bo'yicha rivojlanish natijasi — \"Eventually\".",
  }],
  ["may26-rw-12", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The Svalbard Global Seed Vault is located on a Norwegian island in the Arctic.",
      "It opened in 2008.",
      "It stores backup copies of seeds from gene banks around the world.",
      "Its permafrost location keeps the seeds cold even without electricity.",
      "It can hold up to 4.5 million seed samples.",
    ]),
    prompt: "The student wants to explain why the vault's location is useful. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "Because it sits in Arctic permafrost, the Svalbard Global Seed Vault keeps seeds cold even without electricity.",
      "The Svalbard Global Seed Vault, which opened in 2008, can hold up to 4.5 million seed samples.",
      "The Svalbard Global Seed Vault stores backup copies of seeds from gene banks around the world.",
      "Located on a Norwegian island, the Svalbard Global Seed Vault opened in 2008.",
    ], answer: 0,
    explanation: "Maqsad — joylashuv foydasi: abadiy muzlik elektrsiz ham sovuq saqlaydi.",
  }],
]);

export const math = buildModule([
  ["may26-m-01", {
    domain: ALG, skill: "Linear inequalities", difficulty: "E",
    prompt: "Which value of <i>x</i> is a solution to the inequality 2<i>x</i> − 5 > 9?",
    choices: ["5", "6", "7", "8"], answer: 3, sortNumeric: true,
    explanation: "2x > 14, x > 7. Faqat 8 mos.",
  }],
  ["may26-m-02", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "M",
    prompt: "A gym charges a one-time fee of $50 plus $30 per month. Which equation gives the total cost <i>C</i>, in dollars, of a membership for <i>m</i> months?",
    choices: ["<i>C</i> = 30<i>m</i> + 50", "<i>C</i> = 50<i>m</i> + 30", "<i>C</i> = 80<i>m</i>", "<i>C</i> = 30(<i>m</i> + 50)"], answer: 0,
    explanation: "Oylik 30m, bir martalik 50: C = 30m + 50.",
  }],
  ["may26-m-03", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "H",
    prompt: "In the system of equations below, <i>k</i> is a constant.<br>3<i>x</i> + 2<i>y</i> = 7<br>6<i>x</i> + <i>ky</i> = 10<br>For what value of <i>k</i> does the system have no solution?",
    choices: ["2", "4", "7", "14"], answer: 1, sortNumeric: true,
    explanation: "Parallel chiziqlar: 6/3 = k/2, k = 4 (7·2 = 14 ≠ 10, demak yechim yo'q).",
  }],
  ["may26-m-04", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "E",
    prompt: `What is the positive solution to the equation <i>x</i>${SQ} = 49?`,
    choices: ["7", "14", "24.5", "49"], answer: 0, sortNumeric: true,
    explanation: "x = ±7, musbati 7.",
  }],
  ["may26-m-05", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to <i>x</i>${SQ} − 9<i>x</i> + 20?`,
    choices: ["(<i>x</i> − 4)(<i>x</i> − 5)", "(<i>x</i> + 4)(<i>x</i> + 5)", "(<i>x</i> − 2)(<i>x</i> − 10)", "(<i>x</i> − 4)(<i>x</i> + 5)"], answer: 0,
    explanation: "Ko'paytmasi 20, yig'indisi −9: −4 va −5.",
  }],
  ["may26-m-06", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The function <i>h</i> is defined by <i>h</i>(<i>t</i>) = −5<i>t</i>${SQ} + 20<i>t</i> + 3, where <i>h</i>(<i>t</i>) is the height, in meters, of a ball <i>t</i> seconds after it is thrown. What is the maximum height, in meters, of the ball?`,
    choices: ["2", "20", "23", "43"], answer: 2, sortNumeric: true,
    explanation: "Uch nuqta t = −20/(2·(−5)) = 2; h(2) = −20 + 40 + 3 = 23.",
  }],
  ["may26-m-07", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "A car travels 180 miles in 3 hours at a constant speed. At this speed, how many miles will the car travel in 5 hours?",
    choices: ["240", "280", "300", "900"], answer: 2, sortNumeric: true,
    explanation: "Tezlik 60 mil/soat; 60 × 5 = 300.",
  }],
  ["may26-m-08", {
    domain: PSDA, skill: "Probability", difficulty: "M",
    prompt: table(
      "",
      ["", "Prefers tea", "Prefers coffee", "Total"],
      [["Students", "18", "12", "30"], ["Teachers", "6", "14", "20"], ["Total", "24", "26", "50"]]
    ) + "The table shows the results of a survey of 50 people. If a person who prefers coffee is selected at random, what is the probability that the person is a teacher?",
    choices: ["7/25", "7/13", "7/10", "6/13"], answer: 1,
    explanation: "Qahva sevuvchilar 26 ta, ulardan 14 tasi o'qituvchi: 14/26 = 7/13.",
  }],
  ["may26-m-09", {
    domain: GEO, skill: "Area and volume", difficulty: "M",
    prompt: "A right circular cylinder has a radius of 3 inches and a height of 10 inches. What is the volume, in cubic inches, of the cylinder?",
    choices: ["30π", "60π", "90π", "300π"], answer: 2,
    explanation: "V = πr²h = π·9·10 = 90π.",
  }],
  ["may26-m-10", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "H",
    prompt: "In triangle <i>PQR</i>, the measure of angle <i>P</i> is 30° and the measure of angle <i>Q</i> is twice the measure of angle <i>R</i>. What is the measure, in degrees, of angle <i>Q</i>?",
    choices: ["50", "75", "100", "120"], answer: 2, sortNumeric: true,
    explanation: "Q + R = 150 va Q = 2R: 3R = 150, R = 50, Q = 100.",
  }],
]);
