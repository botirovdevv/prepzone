// June 2026 (6-iyun) — original savollar: 12 ta RW + 10 ta Math.
import { buildModule, STEM, notes } from "../sat/helpers.js";

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
  ["jun26-rw-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The chef's new menu is ______ with the seasons: in summer it features fresh tomatoes and berries, while in winter it relies on root vegetables and hearty stews.",
    prompt: STEM.wic,
    choices: ["aligned", "unrelated", "competing", "finished"], answer: 0,
    explanation: "Menyu fasllarga moslashgan (\"aligned\").",
  }],
  ["jun26-rw-02", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Although the senator was known for her fiery speeches, her response to the committee's report was notably ______; she simply thanked its authors and said she would review their recommendations.",
    prompt: STEM.wic,
    choices: ["measured", "passionate", "hostile", "lengthy"], answer: 0,
    explanation: "Olovli nutqlarga qarama-qarshi — vazmin, o'ylangan (\"measured\").",
  }],
  ["jun26-rw-03", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "The following text is adapted from a 1913 short story. A young woman has just arrived in a large city.<br><br>Everything about the station seemed designed to overwhelm her. <u>Voices echoed from the high glass ceiling, porters pushed carts piled with trunks, and a hundred people seemed to be rushing in a hundred directions at once.</u> She gripped her small bag more tightly and searched the crowd for a familiar face.",
    prompt: STEM.underlined,
    choices: [
      "It provides specific details that illustrate why the station feels overwhelming to the woman.",
      "It explains why the woman decided to travel to the city.",
      "It suggests that the woman has visited the station many times before.",
      "It introduces a character who will help the woman find her way.",
    ], answer: 0,
    explanation: "Tagiga chizilgan gap — shovqin, aravalar, olomon — \"overwhelm\" ni aniq misollar bilan ko'rsatadi.",
  }],
  ["jun26-rw-04", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Many people think of deserts as lifeless, but the Sonoran Desert in North America supports more than 2,000 species of plants. Some, like the saguaro cactus, store water in their thick stems. Others, such as desert wildflowers, remain dormant as seeds for years and bloom only after heavy rains.",
    prompt: STEM.mainIdea,
    choices: [
      "The Sonoran Desert supports a wide variety of plants that have adapted to dry conditions.",
      "The saguaro cactus is the most common plant in the Sonoran Desert.",
      "Deserts receive more rain than many people believe.",
      "Desert wildflowers bloom every year in the Sonoran Desert.",
    ], answer: 0,
    explanation: "2,000+ tur va ularning quruqlikka moslashuvi — asosiy fikr.",
  }],
  ["jun26-rw-05", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "In her novel <i>The Quiet Harbor</i>, Elena Vasquez portrays the character of Tomás as someone who values his independence above his relationships with others.",
    prompt: "Which quotation from <i>The Quiet Harbor</i> most effectively illustrates this claim?",
    choices: [
      "\"When his brother offered to share the boat, Tomás refused, saying he would rather fish alone and keep whatever he caught.\"",
      "\"Tomás rose each morning before dawn and walked along the harbor.\"",
      "\"The villagers often asked Tomás about the weather, since he was rarely wrong.\"",
      "\"Tomás had learned to repair nets from his grandfather.\"",
    ], answer: 0,
    explanation: "Akasining taklifini rad etib, yolg'iz ishlashni afzal ko'radi — mustaqillik munosabatlardan ustun.",
  }],
  ["jun26-rw-06", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Researchers tracking a population of sea otters noticed that in areas where otters were abundant, kelp forests were thick and healthy, but where otters had disappeared, sea urchins multiplied and the kelp was largely gone. Because sea otters eat sea urchins, and sea urchins eat kelp, the researchers concluded that ______",
    prompt: STEM.complete,
    choices: [
      "sea otters indirectly help protect kelp forests by keeping urchin populations in check.",
      "sea urchins are the main food source for most animals in kelp forests.",
      "kelp forests grow more quickly in warm water than in cold water.",
      "sea otters avoid areas where kelp forests are thick.",
    ], answer: 0,
    explanation: "Otter → kamroq kirpi → ko'proq kelp. Bilvosita himoya.",
  }],
  ["jun26-rw-07", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "The town's annual festival includes three main ______ a parade, a craft fair, and a fireworks show.",
    prompt: STEM.conventions,
    choices: ["events:", "events,", "events;", "events"], answer: 0,
    explanation: "Ro'yxatni to'liq gapdan keyin ikki nuqta bilan boshlaymiz.",
  }],
  ["jun26-rw-08", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "When the astronauts returned from the International Space Station, doctors examined ______ bones to measure how much density had been lost during the mission.",
    prompt: STEM.conventions,
    choices: ["their", "its", "they're", "there"], answer: 0,
    explanation: "Astronavtlar (ko'plik) — egalik \"their\".",
  }],
  ["jun26-rw-09", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "Kenyan environmentalist Wangari Maathai founded the Green Belt Movement in ______ organization has since planted more than 50 million trees across Kenya.",
    prompt: STEM.conventions,
    choices: ["1977, the", "1977; the", "1977 the", "1977, and, the"], answer: 1,
    explanation: "Ikki mustaqil gap — nuqtali vergul. Faqat vergul qo'yilsa, comma splice bo'ladi.",
  }],
  ["jun26-rw-10", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Blue whales are the largest animals ever known to have lived. ______ an adult blue whale's heart alone can weigh as much as a small car.",
    prompt: STEM.transition,
    choices: ["In fact,", "However,", "Meanwhile,", "Otherwise,"], answer: 0,
    explanation: "Oldingi fikrni kuchaytiruvchi misol — \"In fact\".",
  }],
  ["jun26-rw-11", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Most metals expand when heated. Water, ______ expands when it freezes, which is why ice floats and why pipes can burst in cold weather.",
    prompt: STEM.transition,
    choices: ["by contrast,", "for example,", "as a result,", "similarly,"], answer: 0,
    explanation: "Metall qizitilganda kengayadi, suv esa muzlaganda — qarama-qarshilik.",
  }],
  ["jun26-rw-12", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Ada Lovelace (1815–1852) was an English mathematician.",
      "Charles Babbage designed a mechanical computer called the Analytical Engine.",
      "In 1843, Lovelace published notes describing how the engine could calculate Bernoulli numbers.",
      "Her notes are often considered the first published computer program.",
      "She also suggested the engine could one day create music.",
    ]),
    prompt: "The student wants to emphasize the historical significance of Lovelace's notes. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "Lovelace's 1843 notes on calculating Bernoulli numbers are often considered the first published computer program.",
      "Ada Lovelace, an English mathematician, lived from 1815 to 1852.",
      "Charles Babbage designed the Analytical Engine, a mechanical computer.",
      "Lovelace suggested that Babbage's Analytical Engine could one day create music.",
    ], answer: 0,
    explanation: "Tarixiy ahamiyat — \"birinchi kompyuter dasturi\".",
  }],
]);

export const math = buildModule([
  ["jun26-m-01", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 4<i>x</i> − 3. What is the value of <i>f</i>(5)?",
    choices: ["2", "17", "20", "23"], answer: 1, sortNumeric: true,
    explanation: "4·5 − 3 = 17.",
  }],
  ["jun26-m-02", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "What is the slope of the line defined by the equation 2<i>x</i> + 5<i>y</i> = 20?",
    choices: ["−5/2", "−2/5", "2/5", "4"], answer: 1,
    explanation: "5y = −2x + 20, y = −(2/5)x + 4. Qiyalik −2/5.",
  }],
  ["jun26-m-03", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "H",
    prompt: "A theater sold 200 tickets for a show. Adult tickets cost $12 each and child tickets cost $8 each. If the total ticket sales were $2,080, how many adult tickets were sold?",
    choices: ["80", "100", "120", "140"], answer: 2, sortNumeric: true,
    explanation: "a + c = 200, 12a + 8c = 2080 → 12a + 1600 − 8a = 2080 → 4a = 480, a = 120.",
  }],
  ["jun26-m-04", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: `Which expression is equivalent to 3<i>x</i>(2<i>x</i> − 4) + 5<i>x</i>?`,
    choices: [`6<i>x</i>${SQ} − 7<i>x</i>`, `6<i>x</i>${SQ} − 12<i>x</i>`, `6<i>x</i>${SQ} + <i>x</i>`, `6<i>x</i>${SQ} − 17<i>x</i>`], answer: 0,
    explanation: "6x² − 12x + 5x = 6x² − 7x.",
  }],
  ["jun26-m-05", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "If √(<i>x</i> + 6) = 5, what is the value of <i>x</i>?",
    choices: ["−1", "11", "19", "31"], answer: 2, sortNumeric: true,
    explanation: "x + 6 = 25, x = 19.",
  }],
  ["jun26-m-06", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "A car's value decreases by 15% each year. The car was worth $24,000 when it was purchased. Which expression gives the car's value, in dollars, <i>n</i> years after it was purchased?",
    choices: [
      "24,000(0.85)<sup><i>n</i></sup>",
      "24,000(0.15)<sup><i>n</i></sup>",
      "24,000(1.15)<sup><i>n</i></sup>",
      "24,000 − 0.15<i>n</i>",
    ], answer: 0,
    explanation: "Har yili 85% qoladi: 24,000(0.85)ⁿ.",
  }],
  ["jun26-m-07", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "What is 30% of 250?",
    choices: ["25", "30", "75", "83"], answer: 2, sortNumeric: true,
    explanation: "0.3 × 250 = 75.",
  }],
  ["jun26-m-08", {
    domain: PSDA, skill: "Two-variable data", difficulty: "M",
    prompt: "A scatterplot of the heights and arm spans of 20 students has a line of best fit given by <i>y</i> = 0.95<i>x</i> + 4, where <i>x</i> is height and <i>y</i> is arm span, both in centimeters. Based on the line of best fit, what is the predicted arm span, in centimeters, of a student who is 160 centimeters tall?",
    choices: ["152", "156", "160", "164"], answer: 1, sortNumeric: true,
    explanation: "0.95 · 160 + 4 = 152 + 4 = 156.",
  }],
  ["jun26-m-09", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    prompt: "A 13-foot ladder leans against a vertical wall. The bottom of the ladder is 5 feet from the base of the wall. How high up the wall, in feet, does the top of the ladder reach?",
    choices: ["8", "12", "13", "18"], answer: 1, sortNumeric: true,
    explanation: "√(13² − 5²) = √144 = 12.",
  }],
  ["jun26-m-10", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: "In a circle with a radius of 9 centimeters, a central angle measures 80°. What is the length, in centimeters, of the arc intercepted by this angle?",
    choices: ["2π", "4π", "8π", "18π"], answer: 1,
    explanation: "Yoy = (80/360) · 2π · 9 = (2/9) · 18π = 4π.",
  }],
]);
