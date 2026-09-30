// September 2026 (12-sentabr) — original savollar: 12 ta RW + 10 ta Math.
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
  ["sep26-rw-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "After weeks of heavy rain, the river became so ______ that officials closed the bridge and warned residents to move to higher ground.",
    prompt: STEM.wic,
    choices: ["swollen", "shallow", "calm", "frozen"], answer: 0,
    explanation: "Kuchli yomg'irdan keyin daryo to'lib-toshgan (\"swollen\").",
  }],
  ["sep26-rw-02", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Sculptor Ruth Asawa's wire forms can seem ______ at first glance, but a closer look reveals intricate patterns of interlocking loops that took months to weave by hand.",
    prompt: STEM.wic,
    choices: ["simple", "enormous", "fragile", "colorful"], answer: 0,
    explanation: "\"But a closer look reveals intricate...\" — birinchi qarashda oddiy (\"simple\").",
  }],
  ["sep26-rw-03", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b><br>Some linguists argue that children learn language mainly by imitating the adults around them. Children, in this view, gradually copy the words and sentence patterns they hear most often.<br><br><b>Text 2</b><br>Linguist Noam Chomsky pointed out that young children regularly produce sentences they have never heard, such as \"I goed to the park.\" Such errors, he argued, show that children are applying grammatical rules on their own rather than simply repeating what adults say.",
    prompt: "Based on the texts, how would Chomsky (Text 2) most likely respond to the view presented in Text 1?",
    choices: [
      "He would argue that imitation alone cannot explain the novel sentences children produce.",
      "He would agree that children learn language only by copying adults.",
      "He would claim that children rarely make grammatical errors.",
      "He would suggest that adults should correct children's errors more often.",
    ], answer: 0,
    explanation: "\"I goed\" — kattalardan eshitilmagan; demak faqat taqlid yetarli emas.",
  }],
  ["sep26-rw-04", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Before refrigerators became common, many families in cold regions cut large blocks of ice from frozen lakes each winter. They packed the ice in sawdust and stored it in insulated icehouses, where it could last well into the summer and keep food from spoiling.",
    prompt: STEM.mainIdea,
    choices: [
      "Before refrigerators, some families stored lake ice through the summer to keep food cold.",
      "Sawdust was the most important invention for preserving food.",
      "Frozen lakes were dangerous places to work in winter.",
      "Refrigerators were invented because icehouses were too expensive.",
    ], answer: 0,
    explanation: "Matn muzni saqlab, oziq-ovqatni sovuq tutish usulini tasvirlaydi.",
  }],
  ["sep26-rw-05", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "A team of marine biologists hypothesizes that clownfish recognize their home sea anemone mainly by its chemical scent rather than by its appearance.",
    prompt: "Which finding, if true, would most strongly support the team's hypothesis?",
    choices: [
      "Clownfish swam toward water carrying the scent of their home anemone even when the anemone itself was hidden from view.",
      "Clownfish spent more time near anemones than near rocks.",
      "Clownfish chose brightly colored anemones over dull ones.",
      "Clownfish living in aquariums grew faster than wild clownfish.",
    ], answer: 0,
    explanation: "Anemon ko'rinmasa ham hidga qarab suzadi — hid asosiy omil.",
  }],
  ["sep26-rw-06", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    passage: table(
      "Community Garden Harvest (kilograms)",
      ["Crop", "2024", "2025"],
      [["Tomatoes", "140", "210"], ["Beans", "90", "85"], ["Squash", "120", "160"], ["Lettuce", "60", "58"]]
    ) + "After the garden installed a drip irrigation system in 2025, a volunteer claimed that the system helped some crops more than others. Specifically, ______",
    prompt: STEM.table,
    choices: [
      "the tomato harvest rose by 70 kilograms, while the bean harvest fell slightly.",
      "tomatoes produced the largest harvest of any crop in 2025.",
      "the lettuce harvest was the smallest of any crop in both years.",
      "the combined harvest of all four crops was greater than 400 kilograms in 2024.",
    ], answer: 0,
    explanation: "\"Ba'zilariga ko'proq foyda\" — biri keskin o'sgan, boshqasi kamaygan: A.",
  }],
  ["sep26-rw-07", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "Mount Everest, the tallest mountain above sea ______ rises 8,849 meters on the border between Nepal and China.",
    prompt: STEM.conventions,
    choices: ["level,", "level", "level;", "level:"], answer: 0,
    explanation: "Qo'shimcha izoh (appositive) ikki tomondan vergul bilan ajratiladi.",
  }],
  ["sep26-rw-08", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "Neither the coach nor the players ______ expecting the storm to delay the championship game by three hours.",
    prompt: STEM.conventions,
    choices: ["were", "was", "is", "has been"], answer: 0,
    explanation: "\"Neither…nor\" da fe'l yaqinroq egaga (\"players\" — ko'plik) moslashadi.",
  }],
  ["sep26-rw-09", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "The spacecraft carried several scientific ______ a camera to photograph the surface, a spectrometer to analyze minerals, and a drill to collect soil samples.",
    prompt: STEM.conventions,
    choices: ["instruments:", "instruments,", "instruments;", "instruments, including:"], answer: 0,
    explanation: "To'liq gapdan keyin ro'yxat — ikki nuqta. \"including:\" dan keyin ikki nuqta qo'yilmaydi.",
  }],
  ["sep26-rw-10", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "The recipe calls for fresh basil. ______ dried basil can be used if fresh leaves are not available.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "Similarly,", "Consequently,"], answer: 0,
    explanation: "Yangi rayhon kerak, lekin quritilgani ham bo'ladi — qarama-qarshilik.",
  }],
  ["sep26-rw-11", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "Some early astronomers believed that Mars was covered with canals built by intelligent beings. Later observations with more powerful telescopes showed that the \"canals\" were optical illusions. ______ spacecraft images confirmed that Mars has no such structures.",
    prompt: STEM.transition,
    choices: ["Later still,", "In contrast,", "For instance,", "Even so,"], answer: 0,
    explanation: "Voqealar ketma-ketligi davom etmoqda — \"Later still\".",
  }],
  ["sep26-rw-12", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Katherine Johnson (1918–2020) was a mathematician at NASA.",
      "She calculated flight paths for early U.S. space missions.",
      "In 1962, astronaut John Glenn asked that Johnson personally check the computer's calculations before his orbital flight.",
      "She received the Presidential Medal of Freedom in 2015.",
    ]),
    prompt: "The student wants to emphasize how much NASA astronauts trusted Johnson's work. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "Before his 1962 orbital flight, astronaut John Glenn asked that Katherine Johnson personally check the computer's calculations.",
      "Katherine Johnson, a NASA mathematician, lived from 1918 to 2020.",
      "In 2015, Katherine Johnson received the Presidential Medal of Freedom.",
      "Katherine Johnson calculated flight paths for early U.S. space missions.",
    ], answer: 0,
    explanation: "Ishonch — Glenn hisob-kitoblarni aynan Johnson tekshirishini so'ragan.",
  }],
]);

export const math = buildModule([
  ["sep26-m-01", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 2(<i>x</i> + 3) = 18, what is the value of <i>x</i>?",
    choices: ["6", "7.5", "9", "12"], answer: 0, sortNumeric: true,
    explanation: "x + 3 = 9, x = 6.",
  }],
  ["sep26-m-02", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "A candle is 30 centimeters tall and burns at a constant rate of 1.5 centimeters per hour. After how many hours will the candle be 12 centimeters tall?",
    choices: ["8", "12", "18", "20"], answer: 1, sortNumeric: true,
    explanation: "30 − 1.5t = 12 → 1.5t = 18, t = 12.",
  }],
  ["sep26-m-03", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "H",
    prompt: "In the system of equations below, <i>a</i> is a constant.<br><i>ax</i> + 3<i>y</i> = 12<br>4<i>x</i> + 6<i>y</i> = 24<br>For what value of <i>a</i> does the system have infinitely many solutions?",
    choices: ["2", "3", "4", "8"], answer: 0, sortNumeric: true,
    explanation: "Ikkinchi tenglama = birinchisi × 2 bo'lishi kerak: 2a = 4, a = 2.",
  }],
  ["sep26-m-04", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: `The function <i>g</i> is defined by <i>g</i>(<i>x</i>) = <i>x</i>${SQ} − 3<i>x</i>. What is the value of <i>g</i>(−2)?`,
    choices: ["−10", "−2", "2", "10"], answer: 3, sortNumeric: true,
    explanation: "(−2)² − 3(−2) = 4 + 6 = 10.",
  }],
  ["sep26-m-05", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: "Which expression is equivalent to (<i>x</i><sup>5</sup> · <i>x</i><sup>3</sup>) / <i>x</i><sup>2</sup>, where <i>x</i> ≠ 0?",
    choices: ["<i>x</i><sup>6</sup>", "<i>x</i><sup>13</sup>", "<i>x</i><sup>4</sup>", "<i>x</i><sup>15/2</sup>"], answer: 0,
    explanation: "x^(5 + 3 − 2) = x⁶.",
  }],
  ["sep26-m-06", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `For what value of <i>c</i> does the equation <i>x</i>${SQ} − 8<i>x</i> + <i>c</i> = 0 have exactly one real solution?`,
    choices: ["4", "8", "16", "64"], answer: 2, sortNumeric: true,
    explanation: "Diskriminant 64 − 4c = 0, c = 16.",
  }],
  ["sep26-m-07", {
    domain: PSDA, skill: "One-variable data", difficulty: "E",
    prompt: "What is the range of the data set 14, 9, 22, 17, 5, 11?",
    choices: ["11", "12.5", "17", "22"], answer: 2, sortNumeric: true,
    explanation: "Eng katta − eng kichik: 22 − 5 = 17.",
  }],
  ["sep26-m-08", {
    domain: PSDA, skill: "Inference from sample statistics", difficulty: "M",
    prompt: "In a random sample of 200 students at a school of 1,800 students, 46 said they walk to school. Based on the sample, which is the best estimate of the number of students at the school who walk to school?",
    choices: ["46", "230", "414", "920"], answer: 2, sortNumeric: true,
    explanation: "46/200 = 0.23; 0.23 × 1800 = 414.",
  }],
  ["sep26-m-09", {
    domain: GEO, skill: "Area and volume", difficulty: "M",
    prompt: "A cube has a volume of 64 cubic centimeters. What is the total surface area, in square centimeters, of the cube?",
    choices: ["16", "64", "96", "384"], answer: 2, sortNumeric: true,
    explanation: "Qirra 4; 6 · 4² = 96.",
  }],
  ["sep26-m-10", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "H",
    prompt: "In right triangle <i>XYZ</i>, angle <i>Z</i> is a right angle and cos <i>X</i> = 5/13. What is the value of sin <i>Y</i>?",
    choices: ["5/13", "12/13", "5/12", "13/5"], answer: 0,
    explanation: "X va Y bir-birini 90° ga to'ldiradi, shuning uchun sin Y = cos X = 5/13.",
  }],
]);
