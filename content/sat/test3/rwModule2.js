// Practice Test 3 — Reading and Writing, Module 2 (oson / qiyin).
// Qiyin modul March 2026 testi tuzilishiga mos; matnlar original.
import { buildModule, STEM, table, notes, svgFigure } from "../helpers.js";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

// Qiyin 12-savol: o'lchangan qiymat va ikki model bashorati (ustunli grafik).
// y: 0..1, 1 = 200px, y0 = 250. Har guruhda 3 ta ustun (14px).
const bar = (x, v, fill) =>
  `<rect x="${x}" y="${250 - v * 200}" width="14" height="${v * 200}" fill="${fill}" stroke="#111" stroke-width="1.2"/>`;
const groups = [
  ["N2", 0.72, 0.66, 0.44],
  ["N3", 0.14, 0.18, 0.22],
  ["N4", 0.04, 0.06, 0.1],
  ["S2", 0.8, 0.84, 0.36],
  ["S3", 0.1, 0.07, 0.24],
  ["S4", 0.03, 0.02, 0.12],
];
const routeFigure = svgFigure(
  460,
  390,
  `<text x="240" y="22" text-anchor="middle" font-weight="bold">Proportion of Three Most Common Travel Patterns</text>
   <g stroke="#ccc" stroke-width="1">
     <line x1="60" y1="50" x2="440" y2="50"/><line x1="60" y1="90" x2="440" y2="90"/><line x1="60" y1="130" x2="440" y2="130"/>
     <line x1="60" y1="170" x2="440" y2="170"/><line x1="60" y1="210" x2="440" y2="210"/>
   </g>
   <line x1="60" y1="250" x2="440" y2="250" stroke="#111" stroke-width="1.5"/>
   <line x1="60" y1="50" x2="60" y2="250" stroke="#111" stroke-width="1.5"/>
   <g font-size="13" text-anchor="end">
     <text x="54" y="254">0</text><text x="54" y="214">0.2</text><text x="54" y="174">0.4</text>
     <text x="54" y="134">0.6</text><text x="54" y="94">0.8</text><text x="54" y="54">1</text>
   </g>
   <text x="18" y="150" font-size="13" text-anchor="middle" transform="rotate(-90 18 150)">Proportion</text>
   ${groups
     .map(([label, m, d, h], i) => {
       const x = 75 + i * 61;
       return `${bar(x, m, "#555")}${bar(x + 14, d, "#fff")}${bar(x + 28, h, "#111")}<text x="${x + 21}" y="270" font-size="13" text-anchor="middle">${label}</text>`;
     })
     .join("")}
   <text x="250" y="292" font-size="13" text-anchor="middle">Travel pattern by region</text>
   <g font-size="13">
     <rect x="120" y="305" width="250" height="76" fill="#fff" stroke="#111"/>
     <rect x="132" y="315" width="14" height="14" fill="#555" stroke="#111"/><text x="156" y="327">measured</text>
     <rect x="132" y="337" width="14" height="14" fill="#fff" stroke="#111"/><text x="156" y="349">model: emphasis on distance</text>
     <rect x="132" y="359" width="14" height="14" fill="#111" stroke="#111"/><text x="156" y="371">model: emphasis on habits</text>
   </g>`
);

export const t3RwModule2Easy = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t3-rw2e-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The old library had been closed for years, but after a careful renovation it was ______ to the public, and residents once again filled its reading rooms.",
    prompt: STEM.wic,
    choices: ["reopened", "hidden", "sold", "described"], answer: 0,
    explanation: "Yana odamlar bilan to'lgan — kutubxona qayta ochilgan (\"reopened\").",
  }],
  ["t3-rw2e-02", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The hiking trail was so ______ that even young children and older visitors could complete it easily in under an hour.",
    prompt: STEM.wic,
    choices: ["gentle", "dangerous", "crowded", "remote"], answer: 0,
    explanation: "Bolalar va keksalar oson o'ta oladi — yo'l yengil, qiya emas (\"gentle\").",
  }],
  ["t3-rw2e-03", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "The following text is adapted from an 1897 novel.<br><br>The young clerk was eager to please, but he lacked <u>polish</u>; he spoke too loudly at dinner and could never remember which fork to use.",
    prompt: "As used in the text, what does the word \"polish\" most nearly mean?",
    choices: ["Refinement", "Shine", "Cleaner", "Completion"], answer: 0,
    explanation: "Baland gapirish va vilkani adashtirish — odob-axloqdagi nafislik yetishmaydi (\"Refinement\").",
  }],
  ["t3-rw2e-04", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Because the new vaccine had been tested on only a few hundred people, health officials called the early results ______ and urged scientists to conduct a much larger trial before drawing firm conclusions.",
    prompt: STEM.wic,
    choices: ["promising but tentative", "final and conclusive", "irrelevant and misleading", "famous but outdated"], answer: 0,
    explanation: "Kichik sinov — natija umidli, lekin hali qat'iy emas (\"tentative\"); kattaroq sinov kerak.",
  }],
  ["t3-rw2e-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "E",
    passage: "Many people believe that camels store water in their humps. <u>In fact, a camel's hump is made mostly of fat, which the animal can break down for energy when food is scarce.</u> Camels survive long periods without drinking because their bodies lose very little water.",
    prompt: STEM.underlined,
    choices: [
      "It corrects a mistaken belief described in the previous sentence.",
      "It explains why camels need to drink large amounts of water.",
      "It describes where camels usually live.",
      "It questions whether camels can survive in deserts.",
    ], answer: 0,
    explanation: "Oldingi gapdagi noto'g'ri fikr (o'rkachda suv bor) tuzatiladi.",
  }],
  ["t3-rw2e-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Iceland generates nearly all of its electricity from renewable sources. Hydroelectric dams on glacier-fed rivers supply most of this power, and geothermal plants that tap heat from beneath the island's volcanic surface supply the rest. Geothermal energy also heats about 90 percent of the country's homes.",
    prompt: STEM.purpose,
    choices: [
      "To describe how Iceland meets its energy needs",
      "To argue that every country should build geothermal plants",
      "To explain how glaciers form on volcanic islands",
      "To compare Iceland's energy use with that of other countries",
    ], answer: 0,
    explanation: "Matn Islandiya elektr va issiqlikni qayerdan olishini tasvirlaydi.",
  }],
  ["t3-rw2e-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nSome nutrition guides advise people to avoid eating eggs because egg yolks contain cholesterol, which has been linked to heart disease.\n\n<b>Text 2</b>\nMore recent studies have found that, for most healthy people, eating an egg a day does not raise the risk of heart disease. The cholesterol in food, researchers now say, has a much smaller effect on blood cholesterol than once believed.",
    prompt: "Based on the texts, how would the researchers in Text 2 most likely respond to the advice in Text 1?",
    choices: [
      "By suggesting that the advice is overly cautious for most healthy people",
      "By agreeing that people should stop eating eggs entirely",
      "By arguing that egg yolks contain no cholesterol",
      "By claiming that heart disease has no connection to diet",
    ], answer: 0,
    explanation: "2-matn: sog'lom odamlar uchun kuniga bitta tuxum xavfni oshirmaydi — maslahat haddan tashqari ehtiyotkor.",
  }],

  // ---------------- Information and Ideas ----------------
  ["t3-rw2e-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Octopuses are known for their intelligence. In laboratory studies, they have learned to open jars to reach food, find their way through simple mazes, and even recognize individual human caretakers. Some have been observed escaping from their tanks at night.",
    prompt: STEM.mainIdea,
    choices: [
      "Octopuses display a variety of intelligent behaviors.",
      "Octopuses prefer to eat food stored in jars.",
      "Octopuses are most active during the day.",
      "Octopuses cannot survive outside their tanks.",
    ], answer: 0,
    explanation: "Barcha misollar (banka ochish, labirint, odamni tanish) aqlli xatti-harakatni ko'rsatadi.",
  }],
  ["t3-rw2e-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "The town of Riverside held its first farmers market in 1998 with just six vendors, most of them selling vegetables from their own gardens. Today the market hosts more than eighty vendors every Saturday from May through October.",
    prompt: "According to the text, what did most of the original vendors sell?",
    choices: [
      "Vegetables from their own gardens",
      "Products imported from other towns",
      "Baked goods and handmade crafts",
      "Fruit grown on large commercial farms",
    ], answer: 0,
    explanation: "Matnda aniq aytilgan: dastlabki sotuvchilarning ko'pi o'z bog'idagi sabzavotni sotgan.",
  }],
  ["t3-rw2e-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "E",
    passage: table("Books Borrowed from Hillcrest Library", ["Month", "Books borrowed"], [["January", "2,150"], ["February", "1,980"], ["March", "2,430"], ["April", "3,620"]]) +
      "The librarian noted that April was the busiest month shown: ______",
    prompt: STEM.table,
    choices: [
      "about 3,620 books were borrowed in April, more than in any other month shown.",
      "about 2,150 books were borrowed in January.",
      "fewer books were borrowed in February than in January.",
      "about 2,430 books were borrowed in March.",
    ], answer: 0,
    explanation: "Aprel eng band oy ekanini ko'rsatish uchun aprel raqamini boshqalar bilan solishtirish kerak.",
  }],
  ["t3-rw2e-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "A psychologist claims that taking short breaks while studying helps students remember more of what they learn.",
    prompt: "Which finding, if true, would most directly support the psychologist's claim?",
    choices: [
      "Students who took a five-minute break every 25 minutes recalled more information on a test than students who studied for the same total time without breaks.",
      "Most students said that they prefer to study in the evening.",
      "Students who studied in a library reported feeling less distracted than students who studied at home.",
      "Many students listen to music while they study.",
    ], answer: 0,
    explanation: "Da'vo tanaffus va eslab qolish haqida — faqat birinchi natija aynan shu ikkisini solishtiradi.",
  }],
  ["t3-rw2e-12", {
    domain: II, skill: "Inferences", difficulty: "E",
    passage: "A gardener planted two identical rows of lettuce. She watered both rows the same amount, but she covered one row with a cloth that blocked some of the afternoon sun. By midsummer, the covered lettuce was healthy, while much of the uncovered lettuce had wilted. The gardener most likely concluded that ______",
    prompt: STEM.complete,
    choices: [
      "too much afternoon sun can harm lettuce plants.",
      "the uncovered row had received less water.",
      "lettuce grows best without any sunlight at all.",
      "the cloth provided the lettuce with extra nutrients.",
    ], answer: 0,
    explanation: "Suv bir xil, yagona farq — quyoshni to'sish. Demak ortiqcha quyosh salatga zarar bergan.",
  }],
  ["t3-rw2e-13", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "A city replaced the ordinary stairs at one subway exit with \"piano stairs\" that played musical notes when stepped on. Next to the stairs was an escalator. In the following month, the number of people who chose the stairs instead of the escalator rose by more than 60 percent. This result suggests that ______",
    prompt: STEM.complete,
    choices: [
      "making an activity more enjoyable can encourage people to choose it.",
      "most subway riders dislike music.",
      "escalators break down more often than stairs do.",
      "people who use stairs are more musical than those who use escalators.",
    ], answer: 0,
    explanation: "Yagona o'zgarish — zinapoya qiziqarli bo'ldi; odamlar uni ko'proq tanlay boshladi.",
  }],
  ["t3-rw2e-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "Although Antarctica is now covered almost entirely by ice, it was once home to forests. Fossilized tree trunks and leaves found on the continent show that, about 90 million years ago, its climate was warm enough to support rainforest plants similar to those found in New Zealand today.",
    prompt: STEM.mainIdea,
    choices: [
      "Antarctica once had a much warmer climate than it does today.",
      "Antarctica is the coldest continent on Earth.",
      "Rainforest plants still grow in parts of Antarctica.",
      "New Zealand was once connected to Antarctica.",
    ], answer: 0,
    explanation: "Fotoalbomlar Antarktidada bir paytlar o'rmonlar bo'lgani — iqlim iliq bo'lganini ko'rsatadi.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t3-rw2e-15", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "My uncle worked as a baker for thirty ______ he still makes fresh bread every Sunday morning.",
    prompt: STEM.conventions,
    choices: ["years, and", "years and,", "years, and,", "years"], answer: 0,
    explanation: "Ikki mustaqil gap vergul + \"and\" bilan bog'lanadi.",
  }],
  ["t3-rw2e-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Award-winning author ______ wrote the novel <i>Brown Girl Dreaming</i> in verse.",
    prompt: STEM.conventions,
    choices: ["Jacqueline Woodson", "Jacqueline Woodson,", "Jacqueline, Woodson", "Jacqueline Woodson;"], answer: 0,
    explanation: "\"Award-winning author Jacqueline Woodson\" — ism unvonni aniqlaydi (restrictive), vergul kerak emas.",
  }],
  ["t3-rw2e-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The art kit contains three basic ______ red, yellow, and blue.",
    prompt: STEM.conventions,
    choices: ["colors:", "colors;", "colors, which", "colors are"], answer: 0,
    explanation: "Ikki nuqta \"three basic colors\" ro'yxatini kiritadi.",
  }],
  ["t3-rw2e-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Last summer, my family ______ a road trip along the Pacific coast.",
    prompt: STEM.conventions,
    choices: ["took", "takes", "will take", "is taking"], answer: 0,
    explanation: "\"Last summer\" — o'tgan zamon: \"took\".",
  }],
  ["t3-rw2e-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "The students in the chess club practice every afternoon so that ______ can compete in the regional tournament.",
    prompt: STEM.conventions,
    choices: ["they", "it", "them", "he or she"], answer: 0,
    explanation: "\"students\" (ko'plik) ni almashtiruvchi ega olmoshi — \"they\".",
  }],
  ["t3-rw2e-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The collection of rare coins in the museum's basement ______ valued at more than two million dollars.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "have been"], answer: 0,
    explanation: "Ega — \"collection\" (birlik), \"coins\" emas.",
  }],
  ["t3-rw2e-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Opening the front door, ______",
    prompt: STEM.conventions,
    choices: [
      "Priya saw that snow had covered the entire street overnight.",
      "the entire street had been covered by snow overnight.",
      "snow covered the entire street, and Priya saw it.",
      "the overnight snow was seen by Priya on the street.",
    ], answer: 0,
    explanation: "Eshikni ochgan — Priya. U verguldan keyin darhol kelishi kerak (dangling modifier).",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t3-rw2e-22", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Jamal trained for the marathon by running five days a week for six months. ______ he finished the race in under four hours on his first attempt.",
    prompt: STEM.transition,
    choices: ["As a result,", "However,", "For example,", "In contrast,"], answer: 0,
    explanation: "Natija — olti oylik mashqning oqibati.",
  }],
  ["t3-rw2e-23", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Bats are mammals. ______ unlike almost all other mammals, they are capable of true flight.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "For example,", "Similarly,"], answer: 0,
    explanation: "Sutemizuvchi bo'la turib ucha oladi — kutilganiga zid, \"However\".",
  }],
  ["t3-rw2e-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "The community center offers many programs for older residents. ______ it hosts weekly exercise classes, computer workshops, and a monthly book club.",
    prompt: STEM.transition,
    choices: ["For instance,", "However,", "Instead,", "Therefore,"], answer: 0,
    explanation: "Ikkinchi gap dasturlarga misollar keltiradi.",
  }],
  ["t3-rw2e-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "E",
    passage: notes([
      "The Sahara is located in northern Africa.",
      "It is the largest hot desert in the world.",
      "It covers parts of eleven countries.",
    ]),
    prompt: "The student wants to emphasize the size of the Sahara. " + STEM.notes,
    choices: [
      "The Sahara is the largest hot desert in the world.",
      "The Sahara is located in northern Africa.",
      "The Sahara is a desert in Africa.",
      "Many people have traveled across the Sahara.",
    ], answer: 0,
    explanation: "Maqsad — o'lcham; faqat birinchi variant bu haqda.",
  }],
  ["t3-rw2e-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Serena Williams is an American tennis player born in 1981.",
      "She won 23 Grand Slam singles titles.",
      "This is the most won by any player in the Open Era, which began in 1968.",
      "She also won 14 Grand Slam doubles titles with her sister, Venus.",
    ]),
    prompt: "The student wants to emphasize a record held by Serena Williams. " + STEM.notes,
    choices: [
      "Serena Williams won 23 Grand Slam singles titles, the most won by any player in the Open Era.",
      "Serena Williams is an American tennis player born in 1981.",
      "Serena Williams played doubles with her sister, Venus.",
      "The Open Era of tennis began in 1968.",
    ], answer: 0,
    explanation: "Rekord — Ochiq davrdagi eng ko'p yakkalik Grand Slam unvoni.",
  }],
  ["t3-rw2e-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "A class tested two types of bridge built from wooden craft sticks.",
      "Bridge A used a triangle design.",
      "Bridge B used a square design.",
      "Bridge A held an average of 14 kilograms before breaking.",
      "Bridge B held an average of 6 kilograms before breaking.",
    ]),
    prompt: "The student wants to compare the strength of the two bridge designs. " + STEM.notes,
    choices: [
      "Bridge A, which used a triangle design, held an average of 14 kilograms—8 kilograms more than Bridge B, which used a square design.",
      "Bridge A used a triangle design, and Bridge B used a square design.",
      "Bridge A held an average of 14 kilograms before breaking.",
      "A class tested two types of bridge built from wooden craft sticks.",
    ], answer: 0,
    explanation: "Mustahkamlikni solishtirish uchun ikkala natija va farq kerak.",
  }],
]);

export const t3RwModule2Hard = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t3-rw2h-01", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Museum tours led by curator Elena Vasquez are aptly called ______, since a single visit may combine a gallery walk, a hands-on demonstration of painting techniques, and a short film about the historical period in which the works were made.",
    prompt: STEM.wic,
    choices: ["wide-ranging", "restricted", "indiscriminate", "boisterous"], answer: 0,
    explanation: "Bitta tashrifda bir nechta xil faoliyat — keng qamrovli (\"wide-ranging\").",
  }],
  ["t3-rw2h-02", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Among freshwater frog species, body coloration varies strongly with habitat. While species living in sunlit streams are ______ bright, high-contrast patterns, species living on the shaded forest floor display a wide range of colors, from dull browns to vivid greens.",
    prompt: STEM.wic,
    choices: ["clustered around", "accustomed to", "verified by", "simultaneous with"], answer: 0,
    explanation: "\"While\" — qarama-qarshilik: biri bir xil naqsh atrofida to'plangan, ikkinchisi xilma-xil. \"clustered around\".",
  }],
  ["t3-rw2h-03", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The following text is adapted from a 1905 novel. The narrator has asked her landlady about a neighbor named Mr. Ashby.<br><br>On most subjects my landlady talked freely, offering a wealth of gossip about the village; but when I mentioned Mr. Ashby she grew suddenly quiet. There was no unkindness in her <u>restraint</u>; I sensed only a settled unwillingness to speak of him.",
    prompt: "As used in the text, what does the word \"restraint\" most nearly mean?",
    choices: ["Reticence", "Confinement", "Composure", "Suspicion"], answer: 0,
    explanation: "U haqda gapirishni istamaslik — so'zga xasislik, jimlik (\"Reticence\").",
  }],
  ["t3-rw2h-04", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Research by cognitive scientist Amara Okafor suggests that people imagine ______ outcomes when deciding whether an event caused another: when participants watched a video of one domino knocking over another, their eyes moved to where the second domino would have remained standing had the first not touched it.",
    prompt: STEM.wic,
    choices: ["hypothetical", "analogous", "nostalgic", "indifferent"], answer: 0,
    explanation: "\"Agar birinchi tegmaganida nima bo'lardi\" — bo'lmagan, faraziy natija (\"hypothetical\").",
  }],
  ["t3-rw2h-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "<u>After a long, stressful day, many people's first impulse is to talk about their problems with a friend,</u> but a recent study suggests that a quiet walk alone may sometimes be more restorative. Participants were randomly assigned to spend twenty minutes either discussing a recent stressful event with a companion or walking alone in a park. Those who walked alone reported feeling calmer afterward, possibly, the researchers propose, because solitude allowed them to process the event at their own pace.",
    prompt: "Which choice best describes the function of the underlined portion in the text as a whole?",
    choices: [
      "It presents a common response to stress whose effects are compared in the study discussed in the text.",
      "It provides evidence that the study's conclusions should be treated with skepticism.",
      "It summarizes the main finding of a study whose methods the text later criticizes.",
      "It describes a behavior that the study discussed in the text proved to be harmful.",
    ], answer: 0,
    explanation: "Belgilangan qism keng tarqalgan reaksiyani (do'stga gapirish) taqdim etadi — tadqiqot aynan shuni yolg'iz sayr bilan solishtirgan.",
  }],
  ["t3-rw2h-06", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nFor decades, entomologists assumed that among fireflies in temperate regions, only males produce the flashing light signals used in courtship. Researchers Ana Ferreira and Paul Lindqvist note that this assumption does not hold in the tropics, where females of many species flash as often as males. They call for further study of this difference between tropical and temperate fireflies.\n\n<b>Text 2</b>\nNew observations show that females of many temperate firefly species do produce flashes, contends entomologist Wen Zhao. These flashes, however, are much dimmer and briefer than those of males and are often given from low in the grass, making them \"easy to overlook when attention is drawn to the bright males flying overhead,\" Zhao says.",
    prompt: "Based on the texts, how would Zhao (Text 2) most likely respond to the difference described by Ferreira and Lindqvist (Text 1)?",
    choices: [
      "By suggesting that the apparent difference may partly reflect how difficult female flashes are to detect in temperate species",
      "By arguing that tropical male fireflies flash less often than previous researchers reported",
      "By proposing that the difference results from differences in the length of the mating season",
      "By claiming that temperate female fireflies flash more brightly than tropical female fireflies",
    ], answer: 0,
    explanation: "Zhao: mo''tadil hududdagi urg'ochilar ham yonadi, lekin xira — sezish qiyin. Demak farq qisman aniqlash qiyinligidan.",
  }],
  ["t3-rw2h-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nTwo research teams, one led by Lina Haddad and one by Marco Silva, tested whether trees share water with one another through their roots' fungal partners. Haddad's team ruled out every pathway except the fungal network by surrounding each tree's roots with a fine mesh that blocked roots but let fungal threads pass—a step Silva's team skipped.\n\n<b>Text 2</b>\nHaddad's team was right to keep the trees' roots apart. Yet any mesh fine enough to block roots but open enough to admit fungal threads will also let soil water seep through. The team's design therefore cannot show that water moved through the fungal network rather than simply through the soil.",
    prompt: "Based on the texts, how would the author of Text 2 most likely respond to the characterization of Haddad's study in Text 1?",
    choices: [
      "By asserting that Text 1 overstates how effectively Haddad's method isolated the fungal pathway",
      "By arguing that Text 1 confuses the method used by Haddad's team with the method used by Silva's team",
      "By claiming that Text 1 misrepresents what Haddad's team was trying to measure",
      "By pointing out that Text 1 ignores studies whose results contradict Haddad's",
    ], answer: 0,
    explanation: "1-matn: Haddad boshqa barcha yo'llarni istisno qilgan. 2-matn: to'r suvni ham o'tkazadi — usul samaradorligi oshirib ko'rsatilgan.",
  }],

  // ---------------- Information and Ideas ----------------
  ["t3-rw2h-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "An international index has ranked cities by \"livability\" every year since 2005, basing its scores largely on measures such as average income, commute times, and the number of available services. Some urban scholars argue, however, that the index reflects a narrow view of what makes a city livable. Surveys in several regions, for example, have found that residents rate close ties with neighbors and access to shared public spaces as more important to their quality of life than income or convenience.",
    prompt: "Based on the text, what is a potential weakness of the livability index?",
    choices: [
      "It may not account for differences in what residents value most about where they live.",
      "It relies on survey responses from residents who may not represent their cities.",
      "It ignores the ways in which cities have changed since 2005.",
      "It includes data from many large cities but only a few small ones.",
    ], answer: 0,
    explanation: "Indeks daromad va qulaylikka tayanadi, lekin aholi boshqa narsalarni (qo'shnilar, jamoat joylari) muhimroq deb biladi.",
  }],
  ["t3-rw2h-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "Newspaper editors generally try to cover the stories their readers care about most; after all, a paper that ignores its audience's interests risks losing subscribers. One major way editors gauge those interests is through letters and comments that readers submit, but this feedback is subject to a selection effect. Readers who have the time and motivation to write to a newspaper are unlikely to be typical of its readership as a whole.",
    prompt: "Which choice best states the main idea of the text?",
    choices: [
      "Editors try to cover the stories readers care about, but their sense of those interests may be distorted.",
      "Readers who write to newspapers usually care more about news than other readers do.",
      "Reader feedback shapes editors' beliefs about their audience, and editors act on those beliefs.",
      "Although editors want to keep subscribers, that is not their only goal when choosing stories.",
    ], answer: 0,
    explanation: "Muharrirlar o'quvchi qiziqishiga ergashadi, lekin xat yozuvchilar tipik emas — tasavvur buzilishi mumkin.",
  }],
  ["t3-rw2h-10", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "In music schools, learning music history requires that students master the major works and composers of earlier centuries. Composing new music, by contrast, calls for the inventive, independent use of that knowledge to create something original. Although both activities involve engaging with past composers, composers tend to treat those figures as partners in an ongoing conversation who can spark fresh ideas rather than as distant authorities whose importance lies mainly in the past.",
    prompt: "Based on the text, which choice best describes the relationship between composing new music and learning music history?",
    choices: [
      "Composing new music involves creating original work through an imagined exchange with earlier composers, drawing on knowledge gained by learning music history.",
      "Composing new music rejects the standards that govern musical study, whereas learning music history requires following those standards.",
      "Composing new music helps students solve practical problems, whereas learning music history focuses on historical debates.",
      "Composing new music requires students to oppose the ideas of earlier composers, especially those ideas that most students accept.",
    ], answer: 0,
    explanation: "Bastakorlar o'tmish ijodkorlarini \"suhbatdosh\" deb biladi va tarix bilimiga tayanib yangi asar yaratadi.",
  }],
  ["t3-rw2h-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "Scientists have documented dozens of facial expressions in dogs, such as raising the inner eyebrows, that appear to signal emotions. Researchers Lucia Moretti and Daniel Osei hypothesized that people can read these expressions without relying on any other cues. To test this idea, they showed participants short video clips of dogs and asked them to identify each dog's emotional state. <u>Although participants performed well above chance, it is unclear whether they were responding to the dogs' faces or to other cues in the clips, such as the dogs' barking or body posture.</u>",
    prompt: "Which statement, if true, would most strongly support the underlined claim?",
    choices: [
      "Participants identified dogs' emotions much more accurately when they watched clips with sound than when they watched the same clips with the sound removed.",
      "Participants identified dogs' emotions at the same rate whether the dogs' bodies were visible in the clips or hidden.",
      "Participants were better at identifying a dog's fear than at identifying a dog's excitement.",
      "Participants who owned dogs performed about as well as participants who had never owned a dog.",
    ], answer: 0,
    explanation: "Ovoz bilan aniqlik keskin oshsa, ishtirokchilar yuzga emas, boshqa signalga (hurish) tayangan bo'lishi mumkin — da'vo tasdiqlanadi.",
  }],
  ["t3-rw2h-12", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    image: routeFigure,
    passage: "Researchers used anonymized phone location data from two regions, North (N) and South (S), to record people's daily travel patterns and test a computer model that predicts those patterns. In both regions, round trips among two, three, or four locations were the most common pattern types; the graph shows each type as a proportion of all patterns found in that region (for example, the measured value of 0.14 for N3 means that three-location trips made up 14% of all patterns in the North). The researchers ran their model twice under different assumptions and concluded that emphasizing the distance between locations rather than people's habits generally produced better predictions.",
    prompt: "Which choice most effectively uses data from the graph to illustrate the researchers' conclusion?",
    choices: [
      "Under the assumption that habits matter more than distance, the N2 and S2 proportions were predicted to be about 0.44 and 0.36, respectively, much farther from the measured values than the predictions made under the other assumption.",
      "Under the assumption that distance matters more than habits, the N2 and S2 proportions were predicted to be about 0.66 and 0.84, respectively, higher than the measured values in both regions.",
      "Under the assumption that habits matter more than distance, the N3 and S3 proportions were predicted to be about 0.22 and 0.24, respectively, closer to the measured values than the predictions made under the other assumption.",
      "Under both assumptions, the model predicted that two-location trips would be the most common pattern type in each region.",
    ], answer: 0,
    explanation: "Xulosa: masofa-modeli yaxshiroq. N2/S2 da odat-modeli (0.44, 0.36) o'lchangandan (0.72, 0.80) ancha uzoq, masofa-modeli (0.66, 0.84) yaqin. B noto'g'ri: 0.66 < 0.72.",
  }],
  ["t3-rw2h-13", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Gray wolves vary widely in the prey they hunt, a pattern that could reflect inherited traits, the prey available in a given area, or learning from parents (young wolves typically stay with their family pack for one to three years). To evaluate these explanations, Ingrid Solberg and colleagues analyzed 25 years of diet data for female wolves. After leaving their packs, daughters, who usually settled in territories near their mothers', hunted the same prey as their mothers for about two years, but this similarity had vanished by year five. Diet similarity with unrelated wolves in comparable territories was modest, and similarity with other relatives (such as aunts) living in different habitats was no greater than with unrelated wolves. These findings suggest that ______",
    prompt: STEM.complete,
    choices: [
      "female wolves' prey choices may reflect a learned effect that fades over time, though the influence of local prey availability cannot be ruled out.",
      "prey choice among female wolves is determined mainly by inherited traits, with only a minor role for learning.",
      "female wolves' prey choices are best explained by changes in prey availability rather than by learning or inheritance.",
      "growing differences between mothers' and daughters' diets show that daughters actively avoid hunting the prey their mothers hunt.",
    ], answer: 0,
    explanation: "Ona bilan o'xshashlik 2 yil saqlanib, so'ng yo'qoladi (o'rganilgan, so'nuvchi ta'sir); boshqa qarindoshlar bilan o'xshashlik yo'q (irsiyat emas); o'xshash hududlarda biroz o'xshashlik (muhit ham rol o'ynashi mumkin).",
  }],
  ["t3-rw2h-14", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Many readers have shifted from buying individual e-books toward subscription services that offer unlimited access to large digital libraries for a monthly fee. Economists Rhea Kapoor and Tom Bennett studied how this shift affects the range of books people read. They reasoned that buying books individually attaches a price to each new title a reader tries, while subscriptions make trying an additional title essentially free, which suggests that ______",
    prompt: STEM.complete,
    choices: [
      "subscribers would likely read a wider variety of books than readers who buy books individually.",
      "authors who publish only e-books will likely earn the same income as authors who publish printed books.",
      "subscribers would be more likely to give printed books as gifts than to buy them for themselves.",
      "readers who buy books individually tend to prefer older books to newer ones.",
    ], answer: 0,
    explanation: "Har bir yangi kitob bepul bo'lsa, odamlar ko'proq xilma-xil kitob sinab ko'radi.",
  }],
  ["t3-rw2h-15", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Some cities are adopting several strategies at once to cool neighborhoods during heat waves without driving up energy costs for residents. These strategies include planting street trees, installing reflective roofs, and adding shaded public spaces. To compare the strategies' combined effects on temperature and cost, planner Sofia Reyes and colleagues analyzed data from 1,940 neighborhoods in nine countries. They found that using several cooling strategies together did more both to lower temperatures and to reduce residents' energy costs than relying on any single strategy did. Their finding suggests that ______",
    prompt: STEM.complete,
    choices: [
      "cooling neighborhoods need not come at the expense of residents' energy costs, but cities may be less likely to achieve both goals if they rely on only one strategy.",
      "cities that plant street trees without adopting other strategies will lower temperatures but will raise residents' energy costs.",
      "residents who are reluctant to support cooling strategies wrongly believe that the strategies will raise their energy costs.",
      "installing reflective roofs together with other strategies is more expensive than installing them first and adding other strategies later.",
    ], answer: 0,
    explanation: "Bir nechta strategiya birga ikkala maqsadga ham yaxshiroq erishgan — demak murosa majburiy emas, lekin bitta strategiya bilan qiyinroq.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t3-rw2h-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "A tendency to study daytime animals rather than nocturnal ones was among the gaps that ecologist Hannah Brecht and her colleagues ______ reviewing more than 500 wildlife surveys conducted on six continents.",
    prompt: STEM.conventions,
    choices: ["identified while", "identified. While", "identified, while", "identified: while"], answer: 0,
    explanation: "\"while reviewing...\" — gapning davomi; hech qanday tinish belgisi kerak emas.",
  }],
  ["t3-rw2h-17", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Charlotte Brontë's <i>Jane Eyre</i> (1847) and Elizabeth Gaskell's <i>North and South</i> (1855) are often read as very different books. However, the similarity of the two ______ struggles—both Jane and Margaret Hale must make their way in the world after losing the security of their families—suggests that both novels share a concern with women's independence.",
    prompt: STEM.conventions,
    choices: ["novels' heroines'", "novel's heroine's", "novels' heroines", "novel's heroines'"], answer: 0,
    explanation: "Ikki romanga (novels') tegishli ikki qahramonning (heroines') kurashlari — ikkalasi ham ko'plik egalik.",
  }],
  ["t3-rw2h-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "To map ancient trade routes across the Atacama Desert, archaeologist Inés Castillo built detailed three-dimensional models of the terrain from aerial photographs. The drone ______ the region, which contained sites dating back more than 4,000 years, flew in a grid pattern that ensured each photograph overlapped the next by 70 percent.",
    prompt: STEM.conventions,
    choices: ["photographing", "photographs", "was photographing", "photographed"], answer: 0,
    explanation: "Asosiy fe'l — \"flew\". \"photographing the region\" — egani aniqlovchi qism; ikkinchi tuslangan fe'l bo'lmasligi kerak.",
  }],
  ["t3-rw2h-19", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "Before the 1960s, several countries extended the right to vote to residents as young as eighteen, partly to recognize the young people who had served in their armed forces. Brazil lowered its voting age to eighteen in ______ while many other countries did not do so until the 1970s.",
    prompt: STEM.conventions,
    choices: ["1934, for example,", "1934, for example:", "1934, for example;", "1934; for example,"], answer: 0,
    explanation: "\"for example\" — gap ichidagi izoh, ikki tomondan vergul bilan ajratiladi; \"while\" bilan gap davom etadi.",
  }],
  ["t3-rw2h-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "In finance, two bonds are considered equivalent when they carry essentially the same risk and return, \"essentially\" being a word that allows some room for judgment. In 2022, economists R. Akande and L. Brandt developed a model to measure such near-equivalence. Separating \"identical\" from \"nearly identical\" investments—whether bonds, stocks, or currencies—______ one of the model's central goals.",
    prompt: STEM.conventions,
    choices: ["was", "were", "having been", "being"], answer: 0,
    explanation: "Ega — \"Separating ...\" (gerund, birlik); tire ichidagi ro'yxat fe'lga ta'sir qilmaydi: \"was\".",
  }],
  ["t3-rw2h-21", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "The influence of the Portuguese Empire, which once held territory on four continents, is still evident in Brazil, one of many countries whose history is reflected in the language its people speak. Compare Brazil with Sri Lanka, which ceased to be part of the empire in ______ the island's connection to Portugal is so faint that Portuguese is rarely heard there today.",
    prompt: STEM.conventions,
    choices: ["1658:", "1658 and", "1658", "1658,"], answer: 0,
    explanation: "Ikki nuqtadan keyingi to'liq gap oldingi taqqoslashni tushuntiradi. Vergul comma splice bo'ladi.",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t3-rw2h-22", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "To estimate when ancient handprints were pressed into a cave wall in Indonesia, archaeologist Priya Nair and colleagues sampled the thin mineral crusts that had formed over the prints; these samples were then analyzed using a method called uranium-series dating. ______ the analysis showed that the handprints were at least 40,000 years old.",
    prompt: STEM.transition,
    choices: ["Ultimately,", "Similarly,", "By comparison,", "In addition,"], answer: 0,
    explanation: "Jarayon tasvirlangan, keyin yakuniy natija keladi — \"Ultimately\".",
  }],
  ["t3-rw2h-23", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "When the Sydney Opera House opened in 1973, critics attacked its unusual shell-shaped roof as impractical and wildly over budget. ______ the building won not only acceptance but admiration, and in 2007 it was named a UNESCO World Heritage Site.",
    prompt: STEM.transition,
    choices: ["Over time,", "For example,", "Thus,", "Similarly,"], answer: 0,
    explanation: "Tanqiddan keyin vaqt o'tib tan olingan — \"Over time\".",
  }],
  ["t3-rw2h-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Engineer Kofi Mensah works on the Parker Solar Probe, which has flown closer to the Sun than any other spacecraft—within about 6 million kilometers of its surface. ______ Earth itself orbits roughly 150 million kilometers from the Sun.",
    prompt: STEM.transition,
    choices: ["By contrast,", "Secondly,", "Similarly,", "Therefore,"], answer: 0,
    explanation: "6 million va 150 million km — qarama-qarshi masofalar solishtirilmoqda.",
  }],
  ["t3-rw2h-25", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "In some canyon walls, layers of rock formed 300 million years ago lie directly on top of layers formed 1.7 billion years ago, with no rock at all representing the time in between. ______ the Earth did not stop forming rock during those 1.4 billion years; the missing layers were most likely worn away by erosion before the younger rock was deposited.",
    prompt: STEM.transition,
    choices: ["Of course,", "As a result,", "In particular,", "On the contrary,"], answer: 0,
    explanation: "Aniq narsani tan oladi (Yer tosh hosil qilishdan to'xtamagan) — \"Of course\".",
  }],
  ["t3-rw2h-26", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "The Ainu language of northern Japan has very few remaining native speakers. Although most Ainu descendants live on the island of Hokkaido, the language is also being revived far from there. ______ community groups in the Tokyo area have begun offering weekly Ainu language classes to descendants living there.",
    prompt: STEM.transition,
    choices: ["Specifically,", "Nonetheless,", "In addition,", "Meanwhile,"], answer: 0,
    explanation: "Keyingi gap umumiy fikrni (boshqa joyda ham tiklanmoqda) aniq misol bilan ko'rsatadi — \"Specifically\".",
  }],
  ["t3-rw2h-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Mary Ann Shadd Cary (1823–1893) was a journalist and the first Black woman in North America to publish and edit a newspaper.",
      "Her newspaper, <i>The Provincial Freeman</i>, printed firsthand accounts written by formerly enslaved people who had settled in Canada.",
      "Historians note that her paper is significant for letting these settlers describe their own lives in their own words.",
      "Media historian Dana Whitlow: Black-run newspapers of the era created \"a space where Black communities could speak for themselves rather than be spoken about.\"",
      "Whitlow: such newspapers \"varied widely, from religious weeklies to fiery political journals.\"",
    ]),
    prompt: "The student wants to describe Shadd Cary's approach and explain its significance. " + STEM.notes,
    choices: [
      "By printing firsthand accounts by formerly enslaved settlers, Shadd Cary's newspaper created what Whitlow calls \"a space where Black communities could speak for themselves rather than be spoken about.\"",
      "According to Whitlow, Black-run newspapers such as Shadd Cary's \"varied widely, from religious weeklies to fiery political journals.\"",
      "Shadd Cary was the first Black woman in North America to publish and edit a newspaper, an achievement that Whitlow describes as \"fiery.\"",
      "<i>The Provincial Freeman</i> was one of many Black-run newspapers that, according to Whitlow, ranged \"from religious weeklies to fiery political journals.\"",
    ], answer: 0,
    explanation: "Yondashuv — ko'chmanchilarning o'z hikoyalarini chop etish; ahamiyati — Whitlow iqtibosi (o'zlari uchun gapira olish).",
  }],
]);
