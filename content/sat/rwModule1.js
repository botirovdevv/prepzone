// Reading and Writing — Module 1 (aralash qiyinlik, 27 ta savol).
// Tartib real Digital SAT'dagi kabi: Craft & Structure -> Information &
// Ideas -> Standard English Conventions -> Expression of Ideas.
import { buildModule, STEM, table, notes } from "./helpers.js";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

export const rwModule1 = buildModule([
  // ---------------- Craft and Structure ----------------
  ["rw1-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Marine biologist Lena Ortiz found that the sea stars she studied were remarkably ______: individuals that lost an arm regrew it within a year, and some regenerated nearly an entire body from a single limb.",
    prompt: STEM.wic,
    choices: ["resilient", "fragile", "predictable", "solitary"], answer: 0,
    explanation: "Qo'l yo'qotib, uni qayta o'stira olish — tiklanish qobiliyati, ya'ni \"resilient\" (chidamli, tez tiklanadigan).",
  }],
  ["rw1-02", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Although the town council had initially ______ the proposal for a community garden, members voted to approve it after residents presented a detailed plan for maintaining the plots.",
    prompt: STEM.wic,
    choices: ["opposed", "funded", "designed", "celebrated"], answer: 0,
    explanation: "\"Although\" qarama-qarshilik bildiradi: keyin ma'qullangan bo'lsa, avval qarshi (\"opposed\") bo'lgan.",
  }],
  ["rw1-03", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "In her study of medieval trade routes, historian Priya Nandakumar argues that the spread of papermaking was not a single event but a ______ process, unfolding over several centuries as the craft passed from one region to the next.",
    prompt: STEM.wic,
    choices: ["protracted", "sporadic", "clandestine", "reciprocal"], answer: 0,
    explanation: "\"Bir necha asr davomida\" davom etgan jarayon — cho'zilgan, uzoq davom etgan (\"protracted\").",
  }],
  ["rw1-04", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Critics have described architect Tomasz Wren's buildings as ______: each one combines materials and forms drawn from several distinct traditions, from Japanese joinery to Moroccan tilework, yet the result never seems incoherent.",
    prompt: STEM.wic,
    choices: ["eclectic", "derivative", "austere", "ephemeral"], answer: 0,
    explanation: "Turli an'analardan olingan elementlarni birlashtirish — \"eclectic\". \"Derivative\" (taqlidiy) salbiy ma'no beradi, matn esa natijani maqtaydi.",
  }],
  ["rw1-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Many people assume that deserts are nearly lifeless. <u>In fact, the Sonoran Desert supports more than 2,000 species of plants, many of which store water in thick stems or germinate only after heavy rains.</u> These adaptations allow the plants to survive long dry periods and to flourish briefly when water becomes available.",
    prompt: STEM.underlined,
    choices: [
      "It presents evidence that challenges a common assumption.",
      "It explains why deserts receive little rainfall.",
      "It introduces a hypothesis that the text later rejects.",
      "It describes a single plant species in detail.",
    ], answer: 0,
    explanation: "Birinchi gap keng tarqalgan fikrni (cho'l jonsiz) keltiradi, tagiga chizilgan gap esa unga qarshi dalil beradi.",
  }],
  ["rw1-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Poet Adaeze Nwosu's early collections were written almost entirely in English, the language of her schooling. In her later work, however, she began weaving untranslated Igbo phrases into her poems, a choice some reviewers found puzzling. Nwosu has explained that she wanted readers unfamiliar with Igbo to experience, if only briefly, the disorientation she herself felt as a child moving between two languages.",
    prompt: STEM.purpose,
    choices: [
      "To describe a change in Nwosu's work and her stated reason for it",
      "To argue that Nwosu's early collections are superior to her later ones",
      "To explain how Igbo came to be taught in schools",
      "To criticize reviewers who dismissed Nwosu's poetry",
    ], answer: 0,
    explanation: "Matn shoiraning uslubidagi o'zgarishni va uning o'zi aytgan sababni tasvirlaydi.",
  }],
  ["rw1-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nSome economists argue that remote work reduces productivity. Employees who work from home, they claim, lose the spontaneous conversations that happen in shared offices—exchanges that often spark new ideas and help teams solve problems quickly.\n\n<b>Text 2</b>\nEconomist Tomas Reyes tracked software teams for two years. Remote teams produced as much code, of comparable quality, as in-office teams did, but they proposed fewer new projects and filed fewer patents. Reyes concluded that remote work may leave routine output unaffected while reducing the kind of innovation that depends on informal interaction.",
    prompt: "Based on the texts, how would Reyes (Text 2) most likely respond to the economists' argument in Text 1?",
    choices: [
      "By partly agreeing, since his findings suggest remote work may limit innovation but not routine productivity",
      "By rejecting it entirely, since remote teams matched in-office teams in every measure he studied",
      "By arguing that informal conversations actually reduce the quality of employees' work",
      "By claiming that shared offices make it harder for teams to file patents",
    ], answer: 0,
    explanation: "Reyes umumiy unumdorlik pasaymaganini, lekin norasmiy muloqotga bog'liq innovatsiya kamayganini topdi. Demak u 1-matndagi fikrga qisman qo'shiladi.",
  }],

  // ---------------- Information and Ideas ----------------
  ["rw1-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "For decades, researchers believed that honeybees communicated the location of food only through the \"waggle dance,\" a series of movements performed inside the hive. More recent studies, however, show that bees also leave scent marks on productive flowers, which help nestmates find the same food source. These findings suggest that bee communication relies on several signals rather than a single method.",
    prompt: STEM.mainIdea,
    choices: [
      "Honeybees use more than one method to communicate about food sources.",
      "The waggle dance is performed only outside the hive.",
      "Scent marks are more reliable than the waggle dance.",
      "Researchers no longer study how honeybees communicate.",
    ], answer: 0,
    explanation: "Oxirgi gap asosiy fikrni beradi: asalarilar bir nechta signaldan foydalanadi.",
  }],
  ["rw1-09", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Ecologist Mara Lindqvist hypothesizes that urban foxes are bolder than rural foxes because city environments reward animals that approach unfamiliar objects, such as discarded food containers.",
    prompt: "Which finding, if true, would most directly support Lindqvist's hypothesis?",
    choices: [
      "Urban foxes approached and investigated new objects placed in their territory more quickly than rural foxes did.",
      "Rural foxes have larger home ranges than urban foxes do.",
      "Both urban and rural foxes are mostly active at night.",
      "Urban fox populations have grown over the past twenty years.",
    ], answer: 0,
    explanation: "Gipoteza shahar tulkilari notanish narsalarga dadilroq yaqinlashadi deydi. Buni to'g'ridan-to'g'ri tasdiqlaydigan yagona natija shu.",
  }],
  ["rw1-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    passage: table("Average Daily Screen Time by Grade", ["Grade", "Hours per day"], [["6", "3.1"], ["8", "4.4"], ["10", "5.2"], ["12", "5.0"]]) +
      "A researcher surveyed students about their daily screen time. She noted that screen time generally rose as students got older, although the pattern did not hold for every grade: ______",
    prompt: STEM.table,
    choices: [
      "students in grade 12 reported slightly less screen time than students in grade 10 did.",
      "students in grade 6 reported the least screen time of any grade.",
      "students in grade 8 reported more than 4 hours of screen time per day.",
      "students in grade 10 reported more screen time than students in grade 8 did.",
    ], answer: 0,
    explanation: "Gap istisnoni talab qiladi: faqat 12-sinf (5.0) 10-sinfdan (5.2) kam — o'sish naqshi buziladigan yagona joy.",
  }],
  ["rw1-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "In the novel <i>The Harbor Light</i>, the narrator suggests that Elena conceals her ambition behind an appearance of indifference.",
    prompt: "Which quotation from the novel most effectively illustrates the claim?",
    choices: [
      "\"Elena rarely spoke in meetings, yet she had memorized every figure in the company's ledgers and had quietly drafted a plan to take over its failing branch.\"",
      "\"Elena loved the harbor at dawn, when the fishing boats slipped out one by one.\"",
      "\"Elena's brother often complained that she was too eager to please their father.\"",
      "\"Elena announced to everyone at dinner that she intended to run the company within five years.\"",
    ], answer: 0,
    explanation: "Da'vo ikki qismli: tashqi befarqlik (kam gapiradi) va yashirin ambitsiya (reja tuzgan). Oxirgi variant ambitsiyani ochiq ko'rsatadi, yashirmaydi.",
  }],
  ["rw1-12", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Archaeologists excavating a Bronze Age settlement found grinding stones, storage jars containing traces of barley, and sickle blades. They found no evidence of domesticated animals, although bones of wild deer and fish were plentiful. These findings suggest that the settlement's residents ______",
    prompt: STEM.complete,
    choices: [
      "obtained food both by growing grain and by hunting and fishing.",
      "raised cattle and sheep as their main source of food.",
      "abandoned the settlement before they had grown any crops.",
      "traded barley for domesticated animals from nearby settlements.",
    ], answer: 0,
    explanation: "Arpa, o'roq va yorg'ichoq — dehqonchilik; yovvoyi kiyik va baliq suyaklari — ov va baliqchilik. Uy hayvonlari izi yo'q.",
  }],
  ["rw1-13", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "When a minnow is injured by a predator, its damaged skin releases a chemical that causes nearby minnows to flee. Biologist Kenji Aoki found that minnows raised in isolation, which had never encountered a predator or another minnow, fled in response to the chemical just as quickly as minnows raised in groups did. This finding suggests that the fleeing response ______",
    prompt: STEM.complete,
    choices: [
      "does not depend on prior experience with predators or with other minnows.",
      "is learned by observing how other minnows react to danger.",
      "occurs only in minnows that have themselves been injured.",
      "is weaker in minnows raised in groups than in isolated minnows.",
    ], answer: 0,
    explanation: "Hech narsani ko'rmagan yolg'iz baliqlar ham bir xil tez qochgan — demak reaksiya tajribaga bog'liq emas (tug'ma).",
  }],
  ["rw1-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "Economic historian Farida Osei argues that the rapid growth of nineteenth-century port cities is often wrongly credited to their harbors alone. Many cities with excellent natural harbors, she notes, remained small, while others with mediocre harbors flourished once railroads linked them to productive inland regions. For Osei, a harbor was valuable only insofar as it connected distant producers to distant markets.",
    prompt: STEM.mainIdea,
    choices: [
      "Osei contends that a port city's growth depended less on its harbor than on its connections to inland regions.",
      "Osei argues that cities with excellent harbors always grew faster than cities with mediocre harbors.",
      "Osei claims that railroads were less important than harbors to nineteenth-century trade.",
      "Osei believes that inland regions were more productive than port cities.",
    ], answer: 0,
    explanation: "Osei port o'sishini faqat bandargohga bog'lash xato deydi: hal qiluvchi omil — ichki hududlar bilan bog'lanish.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["rw1-15", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "The Great Barrier Reef is the largest coral reef system in the ______ stretches for more than 2,300 kilometers along the northeastern coast of Australia.",
    prompt: STEM.conventions,
    choices: ["world; it", "world, it", "world it", "world, and, it"], answer: 0,
    explanation: "Ikki mustaqil gapni vergul bilan ulab bo'lmaydi (comma splice). Nuqtali vergul to'g'ri.",
  }],
  ["rw1-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "X-ray images produced in Rosalind Franklin's laboratory provided crucial evidence for the shape of ______ a double helix.",
    prompt: STEM.conventions,
    choices: ["DNA:", "DNA;", "DNA, it was", "DNA. A"], answer: 0,
    explanation: "Ikki nuqta oldingi to'liq gapni tushuntiruvchi qismni (\"a double helix\") kiritadi. Nuqtali vergul va nuqtadan keyin to'liq gap kerak bo'lardi.",
  }],
  ["rw1-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The novel's narrator, a retired ship captain named ______ recounts his voyages in a series of letters to his granddaughter.",
    prompt: STEM.conventions,
    choices: ["Elias Varga,", "Elias Varga", "Elias, Varga", "Elias Varga;"], answer: 0,
    explanation: "\"a retired ship captain named Elias Varga\" — izohlovchi qism; u ikki tomondan vergul bilan ajratiladi.",
  }],
  ["rw1-18", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "The committee's final report—which drew on interviews with more than 300 ______ recommended expanding the after-school tutoring program to every district in the city.",
    prompt: STEM.conventions,
    choices: ["residents—", "residents,", "residents;", "residents"], answer: 0,
    explanation: "Qo'shimcha qism tire bilan boshlangan, demak u tire bilan yopilishi kerak.",
  }],
  ["rw1-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The collection of letters written by the explorer's crew members ______ valuable insight into daily life aboard the ship.",
    prompt: STEM.conventions,
    choices: ["provides", "provide", "have provided", "are providing"], answer: 0,
    explanation: "Ega — \"collection\" (birlik), \"letters\" emas. Birlikdagi fe'l kerak: \"provides\".",
  }],
  ["rw1-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Having analyzed thousands of satellite images taken over two decades, ______",
    prompt: STEM.conventions,
    choices: [
      "the research team concluded that the glaciers were retreating faster than predicted.",
      "the research team's conclusion was that the glaciers were retreating faster than predicted.",
      "the glaciers were found by the research team to be retreating faster than predicted.",
      "retreating glaciers were faster than the research team had predicted.",
    ], answer: 0,
    explanation: "Tasvirlarni tahlil qilgan — jamoa. Kirish qismidan keyin darhol \"the research team\" kelishi shart (dangling modifier xatosi).",
  }],
  ["rw1-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Cliff swallows build their nests in large colonies on rock faces and bridges. The ______ nests, made from hundreds of pellets of mud, can remain attached to a wall for years.",
    prompt: STEM.conventions,
    choices: ["swallows'", "swallows", "swallow's", "swallows's"], answer: 0,
    explanation: "Ko'plikdagi qushlarga tegishli uyalar: ko'plik egalik shakli \"swallows'\".",
  }],

  // ---------------- Expression of Ideas ----------------
  ["rw1-22", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Solar panels generate electricity only when sunlight is available. ______ many solar installations include batteries that store excess energy for use at night.",
    prompt: STEM.transition,
    choices: ["For this reason,", "Nevertheless,", "Similarly,", "In contrast,"], answer: 0,
    explanation: "Batareyalar aynan birinchi gapdagi muammo tufayli qo'shiladi — sabab-oqibat bog'lovchisi.",
  }],
  ["rw1-23", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "For centuries, many scholars believed that comets were phenomena of the upper atmosphere, like clouds or lightning. ______ in 1577, Danish astronomer Tycho Brahe's measurements showed that a bright comet was much farther away than the Moon.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "Likewise,", "In other words,"], answer: 0,
    explanation: "Brahe o'lchovlari avvalgi e'tiqodga zid — qarama-qarshilik bog'lovchisi kerak.",
  }],
  ["rw1-24", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "The bee orchid produces flowers that resemble female bees, luring male bees that then carry the orchid's pollen to other flowers. In much of northern Europe, however, the particular bee species that the orchid mimics is rare or absent. ______ the orchid there pollinates itself almost exclusively.",
    prompt: STEM.transition,
    choices: ["As a result,", "For instance,", "Nevertheless,", "Similarly,"], answer: 0,
    explanation: "Changlatuvchi ari yo'qligi sababli orxideya o'zini o'zi changlatadi — natija bog'lovchisi.",
  }],
  ["rw1-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "E",
    passage: notes([
      "The axolotl is a salamander native to lakes near Mexico City.",
      "Unlike most salamanders, it keeps its gills and remains aquatic throughout its life.",
      "It can regenerate lost limbs and even parts of its heart and brain.",
      "Scientists study axolotls to learn how tissue regeneration works.",
    ]),
    prompt: "The student wants to explain why scientists study axolotls. " + STEM.notes,
    choices: [
      "Because axolotls can regenerate limbs and even parts of their heart and brain, scientists study them to learn how tissue regeneration works.",
      "The axolotl is a salamander native to lakes near Mexico City.",
      "Unlike most salamanders, the axolotl keeps its gills throughout its life.",
      "Axolotls remain aquatic throughout their lives in lakes near Mexico City.",
    ], answer: 0,
    explanation: "Maqsad — olimlar nima uchun o'rganishini tushuntirish. Faqat shu variant regeneratsiya va tadqiqot sababini bog'laydi.",
  }],
  ["rw1-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The Hubble Space Telescope was launched in 1990.",
      "It observes mainly in visible and ultraviolet light.",
      "The James Webb Space Telescope was launched in 2021.",
      "It observes mainly in infrared light, which allows it to see through clouds of dust.",
    ]),
    prompt: "The student wants to emphasize a difference between the two telescopes. " + STEM.notes,
    choices: [
      "While the Hubble telescope observes mainly in visible and ultraviolet light, the James Webb telescope observes mainly in infrared light.",
      "Both the Hubble and the James Webb telescopes are space telescopes.",
      "The James Webb telescope, launched in 2021, can see through clouds of dust.",
      "The Hubble Space Telescope was launched in 1990.",
    ], answer: 0,
    explanation: "Farqni ta'kidlash uchun ikkala teleskop bitta jihatda (yorug'lik turi) solishtirilishi kerak.",
  }],
  ["rw1-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Researchers compared two groups of students learning the same vocabulary words.",
      "Group 1 reviewed the words in one long session.",
      "Group 2 reviewed the words in several short sessions spread over a week.",
      "One month later, Group 2 remembered 35% more words than Group 1 did.",
    ]),
    prompt: "The student wants to present the study's finding to an audience unfamiliar with the study. " + STEM.notes,
    choices: [
      "In a study of vocabulary review methods, students who reviewed words in several short sessions over a week remembered 35% more words a month later than students who reviewed in one long session.",
      "Group 2 remembered 35% more words than Group 1 did.",
      "Researchers compared two groups of students who were learning the same vocabulary words.",
      "Reviewing words in one long session is a common study method.",
    ], answer: 0,
    explanation: "Tadqiqotni bilmagan o'quvchiga natija kontekst bilan kerak: ikkala usul nima ekanligi va natija. \"Group 2\" iborasi kontekstsiz tushunarsiz.",
  }],
]);
