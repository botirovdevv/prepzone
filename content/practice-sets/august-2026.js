// August 2026 (22-avgust) — original savollar: 12 ta RW + 10 ta Math.
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
  ["aug26-rw-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The library's rare book room is kept cool and dry in order to ______ old manuscripts, some of which are more than 500 years old.",
    prompt: STEM.wic,
    choices: ["preserve", "replace", "publish", "translate"], answer: 0,
    explanation: "Salqin va quruq saqlash — qo'lyozmalarni asrash (\"preserve\").",
  }],
  ["aug26-rw-02", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Historian Kwame Asante cautions that the diary should not be read as an impartial record of the war. Its author, a general, had every reason to present his own decisions favorably, and his account is therefore ______ at best.",
    prompt: STEM.wic,
    choices: ["partial", "comprehensive", "anonymous", "unprecedented"], answer: 0,
    explanation: "Muallif o'zini yaxshi ko'rsatishga intilgan — kundalik xolis emas, tarafkash (\"partial\").",
  }],
  ["aug26-rw-03", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "For decades, scientists believed that the giant squid was too sluggish to hunt actively. In 2004, however, Japanese researchers photographed a living giant squid in the deep ocean for the first time. The images showed the animal attacking bait aggressively and wrapping its long tentacles around the line.",
    prompt: STEM.purpose,
    choices: [
      "To describe evidence that challenged a long-held belief about the giant squid's behavior",
      "To explain why giant squids live only in the deep ocean",
      "To argue that photographing ocean animals is too difficult to be useful",
      "To compare the giant squid with other large marine animals",
    ], answer: 0,
    explanation: "Eski qarash + 2004-yilgi suratlar uni rad etdi.",
  }],
  ["aug26-rw-04", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "When the city of Seoul removed an elevated highway in 2003 and restored the Cheonggyecheon stream that had been buried beneath it, some residents worried that traffic would become unbearable. Instead, traffic adjusted as drivers switched to public transit, and the restored stream lowered nearby summer temperatures by several degrees while attracting millions of visitors each year.",
    prompt: STEM.mainIdea,
    choices: [
      "Removing a highway to restore a stream in Seoul produced benefits that outweighed residents' initial concerns.",
      "Most residents of Seoul prefer public transit to driving.",
      "Elevated highways cause summer temperatures to rise in large cities.",
      "The Cheonggyecheon stream was buried to make room for a highway.",
    ], answer: 0,
    explanation: "Xavotirlar bo'lgan, ammo natijada foyda ko'p bo'lgan.",
  }],
  ["aug26-rw-05", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    passage: table(
      "Average Hours of Sleep per Night by Daily Screen Time",
      ["Daily screen time before bed", "Average sleep (hours)"],
      [["Less than 30 minutes", "8.1"], ["30–60 minutes", "7.6"], ["1–2 hours", "7.0"], ["More than 2 hours", "6.4"]]
    ) + "A student concludes that teenagers who spend more time on screens before bed tend to sleep less.",
    prompt: "Which choice most effectively uses data from the table to support the student's conclusion?",
    choices: [
      "Teenagers with less than 30 minutes of screen time averaged 8.1 hours of sleep, while those with more than 2 hours averaged only 6.4 hours.",
      "Teenagers with 1–2 hours of screen time averaged 7.0 hours of sleep.",
      "The average sleep for teenagers with 30–60 minutes of screen time was 7.6 hours.",
      "No group in the table averaged more than 9 hours of sleep.",
    ], answer: 0,
    explanation: "Eng kam va eng ko'p ekran vaqtini taqqoslash tendensiyani ko'rsatadi.",
  }],
  ["aug26-rw-06", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Paleontologists found fossilized dinosaur eggs arranged in tight circular clusters, with adult skeletons lying directly on top of several nests. Because modern birds that sit on their nests in this way do so to keep their eggs warm, the researchers suggested that ______",
    prompt: STEM.complete,
    choices: [
      "some dinosaurs may have incubated their eggs by sitting on them, as many birds do.",
      "dinosaur eggs required cooler temperatures than bird eggs.",
      "the adult dinosaurs were attempting to eat the eggs.",
      "modern birds learned nesting behavior by observing dinosaurs.",
    ], answer: 0,
    explanation: "Qushlarga o'xshash holat — tuxumni isitish uchun ustida o'tirgan.",
  }],
  ["aug26-rw-07", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Last summer, the volunteers ______ more than 300 pounds of trash from the beach in a single weekend.",
    prompt: STEM.conventions,
    choices: ["removed", "remove", "will remove", "are removing"], answer: 0,
    explanation: "\"Last summer\" — o'tgan zamon.",
  }],
  ["aug26-rw-08", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Frida Kahlo painted many self-portraits during her ______ these works often explored themes of identity, pain, and Mexican culture.",
    prompt: STEM.conventions,
    choices: ["career, and", "career", "career,", "career and,"], answer: 0,
    explanation: "Ikki mustaqil gap: vergul + bog'lovchi (\"and\").",
  }],
  ["aug26-rw-09", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The results of the clinical trial, which followed more than 4,000 patients over a period of six years, ______ that the new treatment significantly reduces the risk of heart disease.",
    prompt: STEM.conventions,
    choices: ["suggest", "suggests", "has suggested", "is suggesting"], answer: 0,
    explanation: "Ega — \"The results\" (ko'plik); oradagi izoh chalg'itmasin.",
  }],
  ["aug26-rw-10", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Tomatoes are botanically classified as fruits because they develop from a flower and contain seeds. ______ most cooks treat them as vegetables and use them in savory dishes.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "For example,", "Additionally,"], answer: 0,
    explanation: "Botanik jihatdan meva — lekin oshpazlar sabzavot deb biladi. Qarama-qarshilik.",
  }],
  ["aug26-rw-11", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "To reduce food waste, the school cafeteria began letting students choose their own portion sizes. It also started donating unserved meals to a local shelter. ______ the amount of food the cafeteria threw away dropped by nearly half in one year.",
    prompt: STEM.transition,
    choices: ["As a result,", "On the other hand,", "Nonetheless,", "In comparison,"], answer: 0,
    explanation: "Choralar → natija: chiqindi kamaydi.",
  }],
  ["aug26-rw-12", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The Great Wall of China and Machu Picchu are both UNESCO World Heritage Sites.",
      "The Great Wall was built over many centuries, mainly for defense.",
      "Machu Picchu is a 15th-century Inca city in the mountains of Peru.",
      "Machu Picchu was likely built as an estate for the Inca emperor Pachacuti.",
      "Both sites attract millions of tourists each year.",
    ]),
    prompt: "The student wants to emphasize a difference in the purposes of the two sites. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "While the Great Wall of China was built mainly for defense, Machu Picchu was likely built as an estate for an Inca emperor.",
      "Both the Great Wall of China and Machu Picchu are UNESCO World Heritage Sites.",
      "The Great Wall of China and Machu Picchu each attract millions of tourists every year.",
      "Machu Picchu is a 15th-century Inca city located in the mountains of Peru.",
    ], answer: 0,
    explanation: "Maqsad — vazifadagi farq: mudofaa va imperator qarorgohi.",
  }],
]);

export const math = buildModule([
  ["aug26-m-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If <i>x</i>/4 + 3 = 8, what is the value of <i>x</i>?",
    choices: ["5", "11", "20", "44"], answer: 2, sortNumeric: true,
    explanation: "x/4 = 5, x = 20.",
  }],
  ["aug26-m-02", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    prompt: "A delivery van can carry at most 1,500 pounds. The driver weighs 180 pounds, and each box weighs 40 pounds. What is the greatest number of boxes the van can carry along with the driver?",
    choices: ["32", "33", "37", "38"], answer: 1, sortNumeric: true,
    explanation: "180 + 40b ≤ 1500 → b ≤ 33. Eng ko'pi 33.",
  }],
  ["aug26-m-03", {
    domain: ALG, skill: "Linear equations in two variables", difficulty: "H",
    prompt: "Line <i>k</i> is perpendicular to the line <i>y</i> = 2<i>x</i> + 7 and passes through the point (4, 1). What is the <i>y</i>-intercept of line <i>k</i>?",
    choices: ["−7", "−1", "1", "3"], answer: 3, sortNumeric: true,
    explanation: "Qiyalik −1/2; 1 = −1/2 · 4 + b, b = 3.",
  }],
  ["aug26-m-04", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to (3<i>x</i>${SQ} + 2<i>x</i>) − (<i>x</i>${SQ} − 5<i>x</i>)?`,
    choices: [`2<i>x</i>${SQ} + 7<i>x</i>`, `2<i>x</i>${SQ} − 3<i>x</i>`, `4<i>x</i>${SQ} + 7<i>x</i>`, `2<i>x</i>${SQ} + 3<i>x</i>`], answer: 0,
    explanation: "3x² − x² = 2x²; 2x + 5x = 7x.",
  }],
  ["aug26-m-05", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `What is the positive solution to the equation <i>x</i>${SQ} + 2<i>x</i> − 24 = 0?`,
    choices: ["2", "4", "6", "12"], answer: 1, sortNumeric: true,
    explanation: "(x + 6)(x − 4) = 0; musbat yechim 4.",
  }],
  ["aug26-m-06", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The graph of <i>y</i> = <i>a</i>(<i>x</i> − 3)${SQ} + 2 passes through the point (5, 14), where <i>a</i> is a constant. What is the value of <i>a</i>?`,
    choices: ["2", "3", "4", "6"], answer: 1, sortNumeric: true,
    explanation: "14 = a·(2)² + 2 → 4a = 12, a = 3.",
  }],
  ["aug26-m-07", {
    domain: PSDA, skill: "Ratios, rates, and units", difficulty: "E",
    prompt: "The ratio of cats to dogs at an animal shelter is 3 to 5. If there are 40 dogs at the shelter, how many cats are there?",
    choices: ["15", "24", "25", "64"], answer: 1, sortNumeric: true,
    explanation: "40/5 = 8; 3 · 8 = 24.",
  }],
  ["aug26-m-08", {
    domain: PSDA, skill: "Percentages", difficulty: "H",
    prompt: "The price of a jacket was increased by 20%. Later, the new price was decreased by 20%. The final price is what percent of the original price?",
    choices: ["80%", "96%", "100%", "104%"], answer: 1,
    explanation: "1.2 × 0.8 = 0.96 → 96%.",
  }],
  ["aug26-m-09", {
    domain: GEO, skill: "Area and volume", difficulty: "M",
    prompt: "A rectangle has a length that is 3 times its width. If the perimeter of the rectangle is 48 inches, what is its area, in square inches?",
    choices: ["36", "72", "108", "144"], answer: 2, sortNumeric: true,
    explanation: "2(3w + w) = 48 → w = 6, l = 18; yuza 108.",
  }],
  ["aug26-m-10", {
    domain: GEO, skill: "Lines, angles, and triangles", difficulty: "H",
    prompt: "Triangles <i>ABC</i> and <i>DEF</i> are similar, with <i>A</i>, <i>B</i>, and <i>C</i> corresponding to <i>D</i>, <i>E</i>, and <i>F</i>, respectively. If <i>AB</i> = 6, <i>DE</i> = 15, and <i>BC</i> = 8, what is the length of <i>EF</i>?",
    choices: ["17", "20", "24", "30"], answer: 1, sortNumeric: true,
    explanation: "Masshtab 15/6 = 2.5; EF = 8 · 2.5 = 20.",
  }],
]);
