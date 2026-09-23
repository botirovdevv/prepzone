// Practice Test 2 — Reading and Writing, Module 1 (aralash qiyinlik, 27 ta).
import { buildModule, STEM, table, notes } from "../helpers";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

export const t2RwModule1 = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t2-rw1-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The new bridge was designed to be ______, able to withstand strong earthquakes and hurricane-force winds without significant damage.",
    prompt: STEM.wic,
    choices: ["sturdy", "temporary", "decorative", "narrow"], answer: 0,
    explanation: "Zilzila va bo'ronga bardosh berish — mustahkam (\"sturdy\") bo'lish.",
  }],
  ["t2-rw1-02", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Although the documentary covers a complex scientific topic, its narrator explains each idea in ______ language that viewers without scientific training can easily follow.",
    prompt: STEM.wic,
    choices: ["accessible", "technical", "ambiguous", "archaic"], answer: 0,
    explanation: "Mutaxassis bo'lmaganlar ham oson tushunadigan til — \"accessible\" (tushunarli).",
  }],
  ["t2-rw1-03", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Biologist Chen Wei observed that the young birds did not learn their songs all at once; instead, they ______ them over several weeks, adding a few new notes each day.",
    prompt: STEM.wic,
    choices: ["acquired", "abandoned", "concealed", "exaggerated"], answer: 0,
    explanation: "Har kuni yangi notalar qo'shib, asta-sekin o'rganish — o'zlashtirish (\"acquired\").",
  }],
  ["t2-rw1-04", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Some historians regard the trade treaty as a turning point, but economist Laila Haddad considers its effects ______: trade between the two countries, she notes, had already been growing steadily for a decade before the treaty was signed, and the agreement merely formalized existing practices.",
    prompt: STEM.wic,
    choices: ["negligible", "catastrophic", "unprecedented", "immediate"], answer: 0,
    explanation: "Savdo shartnomadan oldin ham o'sgan, shartnoma faqat rasmiylashtirgan — ta'siri juda kichik (\"negligible\").",
  }],
  ["t2-rw1-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "For many years, scientists assumed that trees in a forest mainly competed with one another for light and nutrients. <u>More recent research, however, has shown that many trees are linked by underground networks of fungi, through which they can exchange water, carbon, and chemical signals.</u> This discovery has led some ecologists to describe forests as cooperative communities rather than collections of competitors.",
    prompt: STEM.underlined,
    choices: [
      "It introduces a finding that complicates an earlier assumption.",
      "It provides an example of how trees compete for light.",
      "It explains why fungi grow only in forests.",
      "It restates the main claim of the first sentence.",
    ], answer: 0,
    explanation: "\"however\" bilan kelgan yangi tadqiqot daraxtlar faqat raqobatlashadi degan eski taxminni murakkablashtiradi.",
  }],
  ["t2-rw1-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "In the mid-1800s, many physicians dismissed Ignaz Semmelweis's claim that doctors could reduce deaths among new mothers simply by washing their hands. Semmelweis had strong evidence: when handwashing was introduced in his clinic, death rates fell sharply. But he offered no convincing explanation of why the practice worked, and germ theory, which would later provide that explanation, had not yet been developed.",
    prompt: STEM.purpose,
    choices: [
      "To suggest a reason why a well-supported claim was initially rejected",
      "To argue that Semmelweis's evidence was weaker than he believed",
      "To describe how germ theory was first developed",
      "To criticize modern physicians for ignoring handwashing",
    ], answer: 0,
    explanation: "Dalil kuchli bo'lsa-da, tushuntirish yo'qligi rad etilish sababi sifatida ko'rsatiladi.",
  }],
  ["t2-rw1-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nMany educators argue that students learn best when they discover concepts on their own, with minimal guidance from teachers. Struggling with a problem, they claim, leads to deeper understanding than simply being shown how to solve it.\n\n<b>Text 2</b>\nIn a study by education researcher Omar Siddiqui, beginning students who studied step-by-step worked examples before solving problems outperformed beginners who solved problems with little guidance. Among students who already had substantial background knowledge, however, this advantage disappeared.",
    prompt: "Based on the texts, how would Siddiqui (Text 2) most likely respond to the educators' argument in Text 1?",
    choices: [
      "By suggesting that learning with minimal guidance may be less effective for beginners than for students with substantial prior knowledge",
      "By agreeing that all students learn best when they receive minimal guidance",
      "By arguing that worked examples are harmful for students with background knowledge",
      "By claiming that struggling with problems never leads to deeper understanding",
    ], answer: 0,
    explanation: "Yangi boshlovchilarga namunalar yordam bergan, tajribalilarda farq yo'qolgan — minimal yo'l-yo'riq hamma uchun bir xil samarali emas.",
  }],

  // ---------------- Information and Ideas ----------------
  ["t2-rw1-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Many cities have begun planting trees along streets to reduce summer temperatures. Trees provide shade, and water evaporating from their leaves cools the surrounding air. In some neighborhoods, streets lined with trees are several degrees cooler on hot afternoons than nearby streets without trees.",
    prompt: STEM.mainIdea,
    choices: [
      "Street trees can help lower temperatures in cities.",
      "Most cities have stopped planting trees.",
      "Trees need more water in cities than in forests.",
      "Hot afternoons are becoming less common in cities.",
    ], answer: 0,
    explanation: "Butun matn daraxtlar shahar haroratini qanday pasaytirishi haqida.",
  }],
  ["t2-rw1-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "The Great Wall of China was not built all at once. Different sections were constructed by various dynasties over roughly two thousand years, and many of the best-preserved sections that tourists visit today were built during the Ming dynasty, which ruled from 1368 to 1644.",
    prompt: "According to the text, what is true about many of the best-preserved sections of the Great Wall?",
    choices: [
      "They were built during the Ming dynasty.",
      "They were built all at once.",
      "They are closed to tourists.",
      "They are about two thousand years old.",
    ], answer: 0,
    explanation: "Matnda to'g'ridan-to'g'ri aytilgan: yaxshi saqlangan qismlarning ko'pi Min sulolasi davrida qurilgan.",
  }],
  ["t2-rw1-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    passage: table("Average Monthly Rainfall (mm)", ["Month", "City A", "City B"], [["January", "80", "20"], ["April", "60", "45"], ["July", "15", "110"], ["October", "70", "35"]]) +
      "A climatologist notes that the two cities have opposite rainy seasons: ______",
    prompt: STEM.table,
    choices: [
      "City A receives much more rain than City B in January, but City B receives much more rain than City A in July.",
      "City A receives 80 mm of rain in January.",
      "Both cities receive some rain in every month shown.",
      "City B receives more rain in April than in October.",
    ], answer: 0,
    explanation: "\"Qarama-qarshi yomg'irli fasl\" — biri ko'p olganda ikkinchisi kam oladi: yanvarda A, iyulda B.",
  }],
  ["t2-rw1-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Sociologist Nadia Petrova hypothesizes that people are more likely to recycle when recycling bins are placed closer to them than trash bins are.",
    prompt: "Which finding, if true, would most directly support Petrova's hypothesis?",
    choices: [
      "In an office where recycling bins were moved next to employees' desks and trash bins were moved to the hallway, the amount of recycled material increased substantially.",
      "Most employees said that they believe recycling is important.",
      "Recycling bins are usually more expensive than trash bins.",
      "Offices produce more paper waste than homes do.",
    ], answer: 0,
    explanation: "Gipoteza qutilarning joylashuvi haqida — faqat birinchi natija joylashuvni o'zgartirib, qayta ishlash ko'payganini ko'rsatadi.",
  }],
  ["t2-rw1-12", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Paleontologists studying fossilized eggs of one dinosaur species found that the eggshells were thin and porous, similar to those of modern crocodiles, which bury their eggs in warm soil or mounds of vegetation. Birds that sit on their eggs, by contrast, typically have thicker, less porous shells. These findings suggest that this dinosaur species most likely ______",
    prompt: STEM.complete,
    choices: [
      "buried its eggs rather than sitting on them.",
      "sat on its eggs the way modern birds do.",
      "laid its eggs in water.",
      "was closely related to modern crocodiles.",
    ], answer: 0,
    explanation: "Qobiq tuproqqa ko'madigan timsohlarnikiga o'xshash, ustida o'tiradigan qushlarnikidan farqli — demak tuxumlar ko'milgan.",
  }],
  ["t2-rw1-13", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Economists studied a town whose largest employer, a factory, closed suddenly. In the following year, overall employment in the town fell, but the number of new small businesses rose sharply. Most of the new businesses were founded by former factory workers. The economists concluded that the closure likely ______",
    prompt: STEM.complete,
    choices: [
      "prompted some former employees to start their own businesses.",
      "increased overall employment in the town.",
      "caused the town's population to grow.",
      "had no effect on the town's economy.",
    ], answer: 0,
    explanation: "Yangi bizneslarning ko'pini sobiq zavod ishchilari ochgan — yopilish ularni o'z ishini boshlashga undagan.",
  }],
  ["t2-rw1-14", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "In the poem \"Low Tide,\" the speaker expresses both admiration for the sea and unease about it.",
    prompt: "Which quotation from the poem most effectively illustrates the claim?",
    choices: [
      "\"I love the sea's bright, restless face, / yet fear what waits beneath its grace.\"",
      "\"The gulls wheel low above the pier, / and fishing boats come drifting near.\"",
      "\"At dawn the tide slips out again / and leaves the sand a silver plain.\"",
      "\"My father sailed these waters wide / and told me stories of the tide.\"",
    ], answer: 0,
    explanation: "Ikkala tuyg'u kerak: \"love\" (hayrat) va \"fear\" (xavotir). Qolganlari faqat tasvirlaydi.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t2-rw1-15", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "Honeybees share information through ______ a returning forager performs a \"waggle dance\" that indicates the direction and distance of a food source.",
    prompt: STEM.conventions,
    choices: ["movement:", "movement,", "movement", "movement, and,"], answer: 0,
    explanation: "Ikki nuqtadan keyingi to'liq gap \"movement\" orqali qanday ma'lumot berilishini tushuntiradi. Vergul comma splice bo'ladi.",
  }],
  ["t2-rw1-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Architect Zaha Hadid, who was born in Baghdad and studied in ______ became the first woman to win the Pritzker Architecture Prize.",
    prompt: STEM.conventions,
    choices: ["London,", "London", "London;", "London—"], answer: 0,
    explanation: "\"who was born ... London\" — vergul bilan boshlangan izoh, u vergul bilan yopiladi.",
  }],
  ["t2-rw1-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The museum's newest exhibit features artifacts from three ancient ______ Egypt, Mesopotamia, and the Indus Valley.",
    prompt: STEM.conventions,
    choices: ["civilizations:", "civilizations;", "civilizations, such as:", "civilizations that"], answer: 0,
    explanation: "Ikki nuqta \"three ancient civilizations\" ro'yxatini kiritadi. Nuqtali verguldan keyin to'liq gap bo'lishi kerak edi.",
  }],
  ["t2-rw1-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "Each of the students in the robotics club ______ responsible for building one part of the robot.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "have been"], answer: 0,
    explanation: "Ega — \"Each\" (birlik), shuning uchun \"is\".",
  }],
  ["t2-rw1-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "When the researchers analyzed the soil samples, ______ found traces of a rare mineral.",
    prompt: STEM.conventions,
    choices: ["they", "it", "them", "he or she"], answer: 0,
    explanation: "\"researchers\" (ko'plik) ni almashtiruvchi ega olmoshi — \"they\".",
  }],
  ["t2-rw1-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "By the time the rescue team arrived at the mountain hut, the hikers ______ there for nearly two days.",
    prompt: STEM.conventions,
    choices: ["had been waiting", "have been waiting", "are waiting", "will wait"], answer: 0,
    explanation: "O'tmishdagi bir voqeadan (kelish) oldin davom etgan harakat — past perfect continuous.",
  }],
  ["t2-rw1-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The city's new transportation program aims to reduce traffic, improve air quality, and ______",
    prompt: STEM.conventions,
    choices: [
      "encourage more residents to walk or cycle.",
      "encouraging more residents to walk or cycle.",
      "more residents being encouraged to walk or cycle.",
      "residents will be encouraged to walk or cycle.",
    ], answer: 0,
    explanation: "Parallel tuzilma: reduce, improve, encourage — hammasi bir xil shakldagi fe'l.",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t2-rw1-22", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "The museum is closed on Mondays. ______ visitors who arrive on a Monday will not be able to enter.",
    prompt: STEM.transition,
    choices: ["Therefore,", "However,", "For example,", "Meanwhile,"], answer: 0,
    explanation: "Kira olmaslik — dushanba yopiq bo'lishining natijasi.",
  }],
  ["t2-rw1-23", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Coral reefs cover less than 1 percent of the ocean floor. ______ they are home to roughly a quarter of all known marine species.",
    prompt: STEM.transition,
    choices: ["Nevertheless,", "Therefore,", "Similarly,", "For instance,"], answer: 0,
    explanation: "Kichik maydon va juda ko'p tur — kutilmagan qarama-qarshilik (\"Nevertheless\").",
  }],
  ["t2-rw1-24", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "Many early photographs show people with stern, unsmiling faces. This does not necessarily mean that people of the time were unhappy. ______ long exposure times made it difficult to hold a smile, and portrait conventions of the era favored serious expressions.",
    prompt: STEM.transition,
    choices: ["Rather,", "Similarly,", "For this reason,", "In contrast,"], answer: 0,
    explanation: "Oldingi noto'g'ri talqin rad etilib, asl sabab keltiriladi — \"Rather\" (aksincha, aslida).",
  }],
  ["t2-rw1-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "E",
    passage: notes([
      "The saguaro is a cactus native to the Sonoran Desert.",
      "It can grow up to about 12 meters tall.",
      "It can live for more than 150 years.",
      "Its flowers open at night and are pollinated by bats, birds, and insects.",
    ]),
    prompt: "The student wants to emphasize the saguaro's long life span. " + STEM.notes,
    choices: [
      "The saguaro, a cactus native to the Sonoran Desert, can live for more than 150 years.",
      "The saguaro can grow up to about 12 meters tall.",
      "The saguaro's flowers open at night.",
      "Bats, birds, and insects pollinate the saguaro's flowers.",
    ], answer: 0,
    explanation: "Maqsad — uzoq umr. Faqat shu variant 150 yildan ortiq yashashini aytadi.",
  }],
  ["t2-rw1-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The violin has four strings.",
      "It is usually played with a bow.",
      "The guitar typically has six strings.",
      "It is usually played by plucking or strumming the strings.",
    ]),
    prompt: "The student wants to contrast how the two instruments are usually played. " + STEM.notes,
    choices: [
      "While the violin is usually played with a bow, the guitar is usually played by plucking or strumming.",
      "The violin has four strings, and the guitar typically has six.",
      "Both the violin and the guitar are string instruments.",
      "The guitar is usually played by plucking or strumming the strings.",
    ], answer: 0,
    explanation: "Qanday chalinishini solishtirish kerak — kamon va chertish/urish. Ikkinchi variant torlar sonini solishtiradi.",
  }],
  ["t2-rw1-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "A city made its public buses free to ride.",
      "Before the change, the buses carried about 20,000 riders per day.",
      "One year later, they carried about 32,000 riders per day.",
      "During the same period, traffic on the city's main roads decreased by 7%.",
    ]),
    prompt: "The student wants to present the outcome of the policy to an audience unfamiliar with it. " + STEM.notes,
    choices: [
      "After a city made its buses free, daily ridership rose from about 20,000 to about 32,000 within a year, and traffic on its main roads fell by 7%.",
      "Daily ridership rose to about 32,000.",
      "Before the change, the buses carried about 20,000 riders per day.",
      "Traffic on the city's main roads decreased by 7%.",
    ], answer: 0,
    explanation: "Tanish bo'lmagan o'quvchiga siyosat nima ekanini va uning natijalarini birga aytish kerak.",
  }],
]);
