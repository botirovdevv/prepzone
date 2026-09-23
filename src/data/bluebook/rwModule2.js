// Reading and Writing — Module 2.
//   rwModule2Easy — Module 1'da past natija: asosan oson/o'rta savollar
//   rwModule2Hard — Module 1'da yuqori natija: asosan o'rta/qiyin savollar
import { buildModule, STEM, table, notes } from "./helpers";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

export const rwModule2Easy = buildModule([
  // ---------------- Craft and Structure ----------------
  ["rw2e-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Because the museum's new dinosaur exhibit was so ______, visitors often waited in line for more than an hour to see it.",
    prompt: STEM.wic,
    choices: ["popular", "obscure", "temporary", "fragile"], answer: 0,
    explanation: "Bir soatdan ko'p navbat kutish — ko'rgazma juda mashhur (\"popular\").",
  }],
  ["rw2e-02", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The instructions for assembling the bookshelf were so ______ that even first-time builders finished in under an hour.",
    prompt: STEM.wic,
    choices: ["clear", "vague", "lengthy", "costly"], answer: 0,
    explanation: "Yangi boshlovchilar ham tez tugatgan — ko'rsatmalar aniq (\"clear\") bo'lgan.",
  }],
  ["rw2e-03", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Chef Mariana Lopes is known for ______ traditional recipes: she keeps the core ingredients of classic dishes but adds unexpected spices and cooking techniques.",
    prompt: STEM.wic,
    choices: ["reinventing", "ignoring", "memorizing", "criticizing"], answer: 0,
    explanation: "Asosini saqlab, yangi elementlar qo'shish — retseptni qayta yaratish (\"reinventing\").",
  }],
  ["rw2e-04", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "The documentary's narrator maintains a ______ tone throughout, presenting evidence from both sides of the debate without revealing her own opinion.",
    prompt: STEM.wic,
    choices: ["neutral", "passionate", "sarcastic", "mournful"], answer: 0,
    explanation: "Ikkala tomonni ko'rsatib, o'z fikrini bildirmaslik — betaraf (\"neutral\") ohang.",
  }],
  ["rw2e-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "E",
    passage: "Octopuses are known for their intelligence. In laboratory experiments, they have opened jars to reach food, found their way through mazes, and even escaped from their tanks. <u>Some researchers believe that this intelligence developed because octopuses, lacking a protective shell, must find food and avoid predators by their wits alone.</u>",
    prompt: STEM.underlined,
    choices: [
      "It offers a possible explanation for the ability described earlier in the text.",
      "It provides another example of an experiment involving octopuses.",
      "It questions whether octopuses are truly intelligent.",
      "It compares octopuses with animals that have shells.",
    ], answer: 0,
    explanation: "Oldingi gaplar aql-idrokni tasvirlaydi, tagiga chizilgan gap esa u nima uchun rivojlanganini tushuntiradi.",
  }],
  ["rw2e-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Many cities are replacing traditional streetlights with LED lights, which use far less energy. Some astronomers, however, have raised concerns. LED streetlights often emit more blue light than older bulbs, and blue light scatters widely in the atmosphere, brightening the night sky and making stars harder to see.",
    prompt: STEM.purpose,
    choices: [
      "To present a drawback of a change that also has benefits",
      "To explain how LED lights use less energy than older bulbs",
      "To argue that cities should stop using streetlights",
      "To describe how astronomers measure the brightness of stars",
    ], answer: 0,
    explanation: "LED'ning afzalligi (kam energiya) aytiladi, keyin astronomlar ko'rsatgan kamchilik tushuntiriladi.",
  }],
  ["rw2e-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nMany nutrition guides recommend eating breakfast every day, claiming that a morning meal helps people control their weight.\n\n<b>Text 2</b>\nIn a review of several controlled trials, researchers found that people who were assigned to eat breakfast did not lose more weight than people who were assigned to skip it. The researchers noted that earlier studies linking breakfast with lower weight had only observed people's existing habits, so they could not show that breakfast itself caused the difference.",
    prompt: "Based on the texts, how would the researchers in Text 2 most likely respond to the claim in Text 1?",
    choices: [
      "They would argue that the claim is not supported by evidence from controlled trials.",
      "They would agree that eating breakfast is the most effective way to lose weight.",
      "They would argue that people who skip breakfast always gain weight.",
      "They would claim that nutrition guides should not discuss breakfast at all.",
    ], answer: 0,
    explanation: "Nazoratli tajribalar nonushtaning vazn yo'qotishga ta'sirini ko'rsatmagan — demak da'vo dalil bilan tasdiqlanmagan.",
  }],

  // ---------------- Information and Ideas ----------------
  ["rw2e-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Community libraries today do much more than lend books. Many offer free internet access, job-search workshops, and language classes. Some even lend tools, musical instruments, and gardening equipment. For many residents, the library has become a center for learning and community services.",
    prompt: STEM.mainIdea,
    choices: [
      "Libraries now provide many services beyond lending books.",
      "Libraries have stopped lending books to residents.",
      "Most residents prefer gardening equipment to books.",
      "Internet access is the most popular library service.",
    ], answer: 0,
    explanation: "Matn kutubxonalar kitobdan tashqari ko'plab xizmatlar ko'rsatishini ta'kidlaydi.",
  }],
  ["rw2e-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Monarch butterflies migrate thousands of kilometers each fall, traveling from Canada and the northern United States to forests in central Mexico. The butterflies that make the trip south have never been to Mexico before; they are several generations removed from the butterflies that left the forests the previous spring.",
    prompt: "According to the text, what is true about the monarchs that fly south in the fall?",
    choices: [
      "They have never before been to the forests in Mexico.",
      "They were born in the forests of central Mexico.",
      "They make the round trip several times during their lives.",
      "They follow older butterflies that know the route.",
    ], answer: 0,
    explanation: "Matnda to'g'ridan-to'g'ri aytilgan: janubga uchadigan kapalaklar Meksikada hech qachon bo'lmagan.",
  }],
  ["rw2e-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "E",
    passage: table("Books Borrowed from Riverside Library", ["Year", "Books borrowed"], [["2020", "41,000"], ["2021", "47,500"], ["2022", "53,200"], ["2023", "58,900"]]) +
      "A librarian noted that the number of books borrowed from Riverside Library rose substantially over the period shown in the table: ______",
    prompt: STEM.table,
    choices: [
      "about 41,000 books were borrowed in 2020, while about 58,900 were borrowed in 2023.",
      "about 41,000 books were borrowed in 2020.",
      "more books were borrowed in 2021 than in 2023.",
      "the same number of books was borrowed in 2022 and in 2023.",
    ], answer: 0,
    explanation: "O'sishni ko'rsatish uchun davr boshidagi va oxiridagi qiymatlarni solishtirish kerak: 41,000 dan 58,900 gacha.",
  }],
  ["rw2e-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Nutrition researcher Hana Sato claims that people tend to eat more when their food is served on larger plates.",
    prompt: "Which finding, if true, would most directly support Sato's claim?",
    choices: [
      "Participants given large plates served themselves and ate more food than participants given small plates did.",
      "Participants preferred plates of a single color to plates with patterns.",
      "Participants ate more slowly when they were eating with friends.",
      "Restaurants that use large plates tend to charge higher prices.",
    ], answer: 0,
    explanation: "Da'vo tarelka o'lchami va yeyilgan ovqat miqdori haqida — shu ikkisini bog'laydigan yagona natija.",
  }],
  ["rw2e-12", {
    domain: II, skill: "Inferences", difficulty: "E",
    passage: "A neighborhood bakery sells out of its sourdough bread by 9:00 a.m. every day, and customers who arrive later often ask when more will be available. The owner has decided to hire an additional baker. The owner most likely expects that the new baker will ______",
    prompt: STEM.complete,
    choices: [
      "help the bakery produce more sourdough bread each day.",
      "convince customers to arrive before 9:00 a.m.",
      "replace sourdough bread with other kinds of bread.",
      "reduce the number of customers who visit the bakery.",
    ], answer: 0,
    explanation: "Muammo — non tez tugashi. Qo'shimcha novvoy ko'proq non pishirish uchun olinadi.",
  }],
  ["rw2e-13", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "In a study, some students were taught that the brain can grow stronger through practice, much like a muscle; other students did not receive this lesson. Over the following semester, the students who received the lesson spent more time working on difficult homework problems. This result suggests that ______",
    prompt: STEM.complete,
    choices: [
      "believing that ability can improve through effort may encourage students to persist with challenging work.",
      "students who spend more time on homework always earn higher grades.",
      "the brain stops developing once students reach adulthood.",
      "difficult homework problems should be removed from the curriculum.",
    ], answer: 0,
    explanation: "Yagona farq — dars (qobiliyat mashq bilan o'sadi degan g'oya), natija esa qiyin masalalarga ko'proq vaqt sarflash.",
  }],
  ["rw2e-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "Although sharks are often portrayed in films as a serious danger to humans, shark attacks are extremely rare. In fact, humans pose a far greater threat to sharks: overfishing and the demand for shark fins have caused many shark populations to decline sharply in recent decades.",
    prompt: STEM.mainIdea,
    choices: [
      "Humans are a much greater threat to sharks than sharks are to humans.",
      "Films about sharks are usually based on accurate information.",
      "Shark populations have grown in recent decades.",
      "Most shark attacks happen because of overfishing.",
    ], answer: 0,
    explanation: "Matn keng tarqalgan qo'rquvni rad etib, asl xavf odamlardan akulalarga ekanini ta'kidlaydi.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["rw2e-15", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "Maya Angelou wrote seven ______ the first, <i>I Know Why the Caged Bird Sings</i>, was published in 1969.",
    prompt: STEM.conventions,
    choices: ["autobiographies;", "autobiographies,", "autobiographies", "autobiographies, which"], answer: 0,
    explanation: "Ikki mustaqil gap — nuqtali vergul bilan ajratiladi. Faqat vergul qo'yish comma splice bo'ladi.",
  }],
  ["rw2e-16", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "Visitors to the national park can hike along the canyon ______ swim in the river, or camp beneath the stars.",
    prompt: STEM.conventions,
    choices: ["rim,", "rim", "rim;", "rim:"], answer: 0,
    explanation: "Uch elementli ro'yxat: elementlar vergul bilan ajratiladi.",
  }],
  ["rw2e-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Rachel Carson's book <i>Silent Spring</i>, ______ in 1962, helped inspire the modern environmental movement.",
    prompt: STEM.conventions,
    choices: ["published", "was published", "it was published", "which published"], answer: 0,
    explanation: "Vergullar orasidagi qism — qo'shimcha izoh; unda alohida ega-kesim bo'lmasligi kerak: \"published in 1962\".",
  }],
  ["rw2e-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Last summer, the city ______ new bike lanes along Main Street, and the number of cyclists on the street has increased ever since.",
    prompt: STEM.conventions,
    choices: ["added", "adds", "will add", "is adding"], answer: 0,
    explanation: "\"Last summer\" — o'tgan zamon, shuning uchun \"added\".",
  }],
  ["rw2e-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The results of the survey, which was completed by more than 1,000 residents, ______ that most people support building a new park downtown.",
    prompt: STEM.conventions,
    choices: ["show", "shows", "has shown", "is showing"], answer: 0,
    explanation: "Ega — \"results\" (ko'plik); oradagi izoh fe'lga ta'sir qilmaydi.",
  }],
  ["rw2e-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "When the students finished ______ science projects, they presented them to the class.",
    prompt: STEM.conventions,
    choices: ["their", "its", "there", "they're"], answer: 0,
    explanation: "\"students\" (ko'plik) ga tegishli egalik olmoshi — \"their\".",
  }],
  ["rw2e-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The number of students enrolled in the district's coding classes ______ tripled since 2015.",
    prompt: STEM.conventions,
    choices: ["has", "have", "are", "were"], answer: 0,
    explanation: "\"The number of ...\" — birlikdagi ega, shuning uchun \"has\".",
  }],

  // ---------------- Expression of Ideas ----------------
  ["rw2e-22", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Tomato plants grow best in warm weather and can be damaged by frost. ______ gardeners in cooler regions often start tomato seeds indoors and move the young plants outside only after the last frost.",
    prompt: STEM.transition,
    choices: ["Therefore,", "In contrast,", "For example,", "Additionally,"], answer: 0,
    explanation: "Uy ichida ekish — sovuqdan zarar ko'rish xavfining oqibati. Sabab-natija bog'lovchisi kerak.",
  }],
  ["rw2e-23", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "The first bicycles, built in the early 1800s, had no pedals; riders pushed themselves along with their feet. ______ inventors attached pedals directly to the front wheel.",
    prompt: STEM.transition,
    choices: ["Later,", "Similarly,", "For example,", "Instead,"], answer: 0,
    explanation: "Voqealar xronologik ketma-ketlikda — vaqt bog'lovchisi \"Later\".",
  }],
  ["rw2e-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Some desert plants, such as cacti, store water in their thick stems. ______ other desert plants, such as mesquite trees, send roots deep underground to reach water.",
    prompt: STEM.transition,
    choices: ["By contrast,", "As a result,", "For instance,", "Therefore,"], answer: 0,
    explanation: "Ikki xil strategiya solishtirilmoqda — qarama-qarshilik bog'lovchisi.",
  }],
  ["rw2e-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "E",
    passage: notes([
      "Frida Kahlo was a Mexican painter.",
      "She was born in 1907.",
      "She is known especially for her self-portraits.",
      "Many of her paintings include imagery from Mexican folk culture.",
    ]),
    prompt: "The student wants to introduce Frida Kahlo to an audience unfamiliar with her. " + STEM.notes,
    choices: [
      "Frida Kahlo, born in 1907, was a Mexican painter known especially for her self-portraits.",
      "Kahlo's paintings include imagery from Mexican folk culture.",
      "She was born in 1907.",
      "Self-portraits are paintings that artists make of themselves.",
    ], answer: 0,
    explanation: "Tanishtirish uchun kimligini (meksikalik rassom) va nimasi bilan mashhurligini aytish kerak.",
  }],
  ["rw2e-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "A kilometer is a unit of length in the metric system.",
      "A mile is a unit of length used in the United States.",
      "One mile is approximately 1.6 kilometers.",
      "Most countries use kilometers to measure road distances.",
    ]),
    prompt: "The student wants to compare the length of a mile with the length of a kilometer. " + STEM.notes,
    choices: [
      "A mile is longer than a kilometer: one mile is approximately 1.6 kilometers.",
      "Most countries use kilometers to measure road distances.",
      "A kilometer is a unit of length in the metric system.",
      "Both miles and kilometers are units of length.",
    ], answer: 0,
    explanation: "Uzunliklarni solishtirish uchun ular orasidagi nisbat (1 mil ≈ 1.6 km) kerak.",
  }],
  ["rw2e-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Rice is a staple food for billions of people.",
      "Traditional rice paddies are kept flooded with water.",
      "Flooded paddies release methane, a greenhouse gas.",
      "A technique called alternate wetting and drying (AWD) lets fields dry out periodically.",
      "In one field trial, AWD reduced the field's methane emissions by 45% without lowering the rice harvest.",
    ]),
    prompt: "The student wants to present AWD as a solution to a problem. " + STEM.notes,
    choices: [
      "Because flooded rice paddies release the greenhouse gas methane, farmers could adopt alternate wetting and drying, which in one trial cut methane emissions by 45% without lowering the harvest.",
      "Rice is a staple food for billions of people, and traditional rice paddies are kept flooded with water.",
      "Alternate wetting and drying is a technique that lets rice fields dry out periodically.",
      "Methane is a greenhouse gas that is released by many sources, including flooded rice paddies.",
    ], answer: 0,
    explanation: "\"Yechim\" sifatida taqdim etish uchun muammo (metan) va AWD uni qanday kamaytirishi birga aytilishi kerak.",
  }],
]);

export const rwModule2Hard = buildModule([
  // ---------------- Craft and Structure ----------------
  ["rw2h-01", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Although the senator's speech was ______, touching on a dozen loosely related topics, reporters managed to identify a single clear policy proposal buried near its end.",
    prompt: STEM.wic,
    choices: ["discursive", "concise", "inflammatory", "conciliatory"], answer: 0,
    explanation: "O'nlab bog'liq bo'lmagan mavzularga to'xtalish — tarqoq, mavzudan-mavzuga o'tuvchi (\"discursive\").",
  }],
  ["rw2h-02", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Some reviewers have faulted biographer Irene Castellanos for being too ______ toward her subjects, arguing that her admiration leads her to excuse flaws that a more detached writer would examine closely.",
    prompt: STEM.wic,
    choices: ["deferential", "skeptical", "indifferent", "derisive"], answer: 0,
    explanation: "Qahramonlariga haddan tashqari hurmat ko'rsatib, kamchiliklarini oqlash — \"deferential\".",
  }],
  ["rw2h-03", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The new findings do not overturn the prevailing theory of how the Moon formed; rather, they ______ it, adding detail about the composition of the debris from which the Moon coalesced.",
    prompt: STEM.wic,
    choices: ["refine", "refute", "predate", "obscure"], answer: 0,
    explanation: "Nazariyani ag'darmaydi, balki tafsilot qo'shadi — aniqlashtiradi (\"refine\"). \"Refute\" aynan rad etilgan ma'no.",
  }],
  ["rw2h-04", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Although the treaty's language appeared ______ when it was signed, later disputes revealed that several of its key provisions could be interpreted in conflicting ways.",
    prompt: STEM.wic,
    choices: ["unambiguous", "convoluted", "provisional", "belligerent"], answer: 0,
    explanation: "\"Although\" — keyinchalik turlicha talqin qilingani, dastlab bir ma'noli (\"unambiguous\") ko'ringaniga zid.",
  }],
  ["rw2h-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "Nineteenth-century naturalists often described the platypus as a \"primitive\" mammal, a leftover from an earlier stage of evolution. The label reflected the animal's unusual traits: it lays eggs and lacks nipples, feeding its young with milk secreted through patches of skin. <u>Yet the platypus has been evolving for just as long as any other living mammal, and many of its features, such as the electroreceptors in its bill that detect prey underwater, are highly specialized.</u>",
    prompt: STEM.underlined,
    choices: [
      "It challenges the characterization presented earlier by showing that the animal's traits are not merely remnants of the past.",
      "It provides further evidence supporting the naturalists' description of the platypus.",
      "It explains why the platypus lays eggs rather than giving birth to live young.",
      "It describes how scientists first discovered the platypus's electroreceptors.",
    ], answer: 0,
    explanation: "\"Yet\" bilan boshlangan gap \"primitiv\" degan tavsifga qarshi chiqadi: ixtisoslashgan belgilar evolyutsiya davom etganini ko'rsatadi.",
  }],
  ["rw2h-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Urban planners long assumed that building more roads would reduce traffic congestion. Studies conducted since the 1990s, however, have repeatedly found that new roads tend to attract additional drivers, so that congestion soon returns to its former level. This phenomenon, known as induced demand, has led some cities to invest in public transit rather than in highway expansion.",
    prompt: STEM.structure,
    choices: [
      "It describes a long-held assumption, presents evidence against it, and notes a consequence of that evidence.",
      "It proposes a new theory, tests it, and concludes that it is incorrect.",
      "It compares two cities' transportation policies and recommends one of them.",
      "It explains the history of highway construction in chronological order.",
    ], answer: 0,
    explanation: "Tuzilma: eski taxmin → unga qarshi dalil → bu dalilning oqibati (shaharlar transportga sarmoya kiritmoqda).",
  }],
  ["rw2h-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nLinguists have traditionally treated animal calls as fundamentally different from human language. Unlike words, they argue, animal calls are fixed signals that cannot be combined according to rules to produce new meanings.\n\n<b>Text 2</b>\nBiologist Ren Takahashi studied a songbird species with two distinct calls: one warns of danger, and the other recruits flockmates. When he played recordings of the calls in the order \"warning, then recruit,\" birds scanned for danger and then approached the speaker. When he reversed the order, the birds largely ignored the recordings.",
    prompt: "Based on the texts, how would Takahashi (Text 2) most likely respond to the linguists' view in Text 1?",
    choices: [
      "By arguing that at least one species combines calls in an order that affects their meaning, which challenges that view",
      "By agreeing that animal calls are fixed signals that cannot be combined",
      "By claiming that songbirds understand human language",
      "By suggesting that warning calls are more important than recruitment calls",
    ], answer: 0,
    explanation: "Tartib o'zgarganda qushlar reaksiyasi o'zgargan — chaqiriqlar qoida (tartib) bo'yicha birlashtirilib, ma'no hosil qilmoqda.",
  }],

  // ---------------- Information and Ideas ----------------
  ["rw2h-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "Philosopher Adwoa Mensah argues that debates about whether machines can \"think\" often stall because the participants disagree less about machines than about what thinking is. One side treats thinking as the ability to produce appropriate responses to the world; the other holds that it requires inner experience. Until that underlying disagreement is resolved, Mensah contends, no amount of evidence about how machines behave can settle the question.",
    prompt: STEM.mainIdea,
    choices: [
      "Mensah claims that evidence about machine behavior cannot settle the debate because the participants define thinking differently.",
      "Mensah argues that machines are already capable of inner experience.",
      "Mensah believes that the ability to produce appropriate responses is the best definition of thinking.",
      "Mensah contends that debates about machines should be abandoned.",
    ], answer: 0,
    explanation: "Asosiy fikr: bahs mashinalar haqida emas, \"fikrlash\" ta'rifi haqida — shuning uchun xulq-atvor dalillari savolni hal qila olmaydi.",
  }],
  ["rw2h-09", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Researchers hypothesize that females of a certain tree frog species choose where to lay their eggs based on the absence of predatory fish in a pond.",
    prompt: "Which finding, if true, would most directly support the researchers' hypothesis?",
    choices: [
      "In a field experiment, the frogs laid far fewer eggs in ponds to which fish had been added than in otherwise identical ponds without fish.",
      "The frogs' eggs hatch more quickly in warm ponds than in cool ponds.",
      "Predatory fish eat many kinds of insects in addition to tadpoles.",
      "The frogs are most active during the spring breeding season.",
    ], answer: 0,
    explanation: "Faqat baliq bor-yo'qligi farq qilgan hovuzlarda tuxum soni farqlangan — gipotezani to'g'ridan-to'g'ri tasdiqlaydi.",
  }],
  ["rw2h-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    passage: table("Percentage of Surveyed Adults Who Used Each Format in the Past Year", ["Format", "2016", "2023"], [["Print book", "65%", "60%"], ["E-book", "28%", "30%"], ["Audiobook", "14%", "23%"]]) +
      "A researcher claims that the growth in audiobook listening between 2016 and 2023 was not simply part of a general increase in reading across all formats. ______",
    prompt: STEM.table,
    choices: [
      "Although the percentage of adults who listened to an audiobook rose from 14% to 23%, the percentage who read a print book fell from 65% to 60%.",
      "The percentage of adults who listened to an audiobook rose from 14% in 2016 to 23% in 2023.",
      "In both 2016 and 2023, more adults read print books than read e-books.",
      "The percentage of adults who read an e-book rose from 28% to 30%.",
    ], answer: 0,
    explanation: "Da'voni tasdiqlash uchun audiokitoblar o'sgan, ammo boshqa format kamaygan paytni ko'rsatish kerak — umumiy o'sish bo'lmagan.",
  }],
  ["rw2h-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "In the short story \"The Lamplighter,\" the narrator portrays old Mr. Keane's work as both tedious and deeply meaningful to him.",
    prompt: "Which quotation from the story most effectively illustrates the claim?",
    choices: [
      "\"Every evening he climbed the same forty ladders and lit the same forty lamps, and yet he spoke of each flame as if it were a small promise kept to the city.\"",
      "\"Mr. Keane had lived on Harrow Street for as long as anyone could remember.\"",
      "\"The lamps on Harrow Street were older than the houses they illuminated.\"",
      "\"On winter nights, Mr. Keane wore a heavy wool coat that had belonged to his father.\"",
    ], answer: 0,
    explanation: "Ikki qism kerak: zerikarli takror (bir xil 40 zina, 40 chiroq) va chuqur ma'no (\"shaharga berilgan va'da\").",
  }],
  ["rw2h-12", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Astronomers measuring a distant galaxy's rotation found that stars near its outer edge orbit the galactic center just as fast as stars closer to the center do. If the galaxy's mass were concentrated where its visible stars and gas are, the outer stars should orbit more slowly, just as the outer planets of our solar system orbit the Sun more slowly than the inner planets do. The astronomers therefore concluded that the galaxy most likely ______",
    prompt: STEM.complete,
    choices: [
      "contains a substantial amount of mass that cannot be seen.",
      "has fewer stars at its outer edge than at its center.",
      "is rotating more slowly than other galaxies of its size.",
      "has planets orbiting its stars in the same way as our solar system.",
    ], answer: 0,
    explanation: "Tashqi yulduzlar kutilganidan tez aylansa, ko'rinadigan moddadan tashqari qo'shimcha (ko'rinmas) massa bor degan xulosa chiqadi.",
  }],
  ["rw2h-13", {
    domain: II, skill: "Inferences", difficulty: "E",
    passage: "A city introduced a program that gives residents a small refund for each glass bottle they return. In the program's first year, the amount of glass collected for recycling doubled, while the amount of glass found as litter in parks and streets fell sharply. These results suggest that ______",
    prompt: STEM.complete,
    choices: [
      "the refund encouraged residents to return bottles that might otherwise have been discarded as litter.",
      "residents bought fewer glass bottles after the program began.",
      "the city's parks were cleaned less often after the program began.",
      "glass bottles are more difficult to recycle than plastic bottles.",
    ], answer: 0,
    explanation: "Qayta ishlashga topshirish ko'paygan, ko'chadagi shisha axlat kamaygan — qaytarish puli sabab bo'lgan.",
  }],
  ["rw2h-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "Although the Inca Empire had no system of writing as it is conventionally defined, its administrators recorded census data and tax obligations using khipus—cords of cotton or camelid fiber on which knots were tied. The type of knot, its position on the cord, and the color of the fiber all appear to have carried meaning. Scholars have deciphered much of the khipus' numerical information but continue to debate whether the cords also encoded language.",
    prompt: "According to the text, what remains uncertain about khipus?",
    choices: [
      "Whether they recorded language in addition to numerical information",
      "Whether the color of their fibers carried any meaning",
      "Whether Inca administrators used them to record census data",
      "Whether they were made from cotton or from camelid fiber",
    ], answer: 0,
    explanation: "Oxirgi gap: olimlar kiplar tilni ham kodlaganmi-yo'qmi, hali bahslashmoqda.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["rw2h-15", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Many of the city's oldest buildings share a distinctive ______ their facades are covered in glazed tiles that protect the walls from the humid coastal air.",
    prompt: STEM.conventions,
    choices: ["feature:", "feature,", "feature", "feature, which"], answer: 0,
    explanation: "Ikki nuqtadan keyingi to'liq gap \"distinctive feature\" nima ekanini tushuntiradi.",
  }],
  ["rw2h-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Researchers found that the drug reduced symptoms in 70 percent of ______ however, it also caused mild side effects in a small number of participants.",
    prompt: STEM.conventions,
    choices: ["patients;", "patients,", "patients", "patients:"], answer: 0,
    explanation: "\"however\" bog'lovchi emas, ravish — ikki mustaqil gap orasida nuqtali vergul kerak.",
  }],
  ["rw2h-17", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "The documentary follows three ______ a beekeeper in Kenya, a rice farmer in Vietnam, and a grape grower in Chile—as they adapt to changing weather patterns.",
    prompt: STEM.conventions,
    choices: ["farmers—", "farmers:", "farmers,", "farmers;"], answer: 0,
    explanation: "Ro'yxat oxirida tire bor, demak ro'yxat tire bilan ochilishi kerak (juft tirelar).",
  }],
  ["rw2h-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "In the 1950s, researchers at the observatory ______ a method for measuring the distances to stars that astronomers still use today.",
    prompt: STEM.conventions,
    choices: ["developed", "develop", "have developed", "will develop"], answer: 0,
    explanation: "\"In the 1950s\" — o'tgan zamondagi tugallangan harakat.",
  }],
  ["rw2h-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The team of engineers, along with several consultants from the city's transportation department, ______ recommended replacing the bridge rather than repairing it.",
    prompt: STEM.conventions,
    choices: ["has", "have", "were", "are"], answer: 0,
    explanation: "Ega — \"team\" (birlik). \"along with ...\" egani ko'plikka aylantirmaydi.",
  }],
  ["rw2h-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The museum returned the ancient manuscripts to the monastery, where ______ had been kept for centuries before being sold in the 1800s.",
    prompt: STEM.conventions,
    choices: ["they", "it", "them", "its"], answer: 0,
    explanation: "Olmosh \"manuscripts\" (ko'plik) ni almashtiradi va ega vazifasida — \"they\".",
  }],
  ["rw2h-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Known for her precise brushwork and bold use of color, ______",
    prompt: STEM.conventions,
    choices: [
      "painter Rosa Ibarra has created murals that cover walls throughout the city.",
      "painter Rosa Ibarra's murals cover walls throughout the city.",
      "murals by painter Rosa Ibarra cover walls throughout the city.",
      "walls throughout the city are covered by painter Rosa Ibarra's murals.",
    ], answer: 0,
    explanation: "\"Known for her ... brushwork\" — rassomning o'zini tasvirlaydi, shuning uchun vergildan keyin darhol \"painter Rosa Ibarra\" kelishi kerak.",
  }],

  // ---------------- Expression of Ideas ----------------
  ["rw2h-22", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "Early models of the solar system placed Earth at the center, with the Sun and planets orbiting it. These models, however, struggled to explain why planets such as Mars sometimes appear to move backward across the sky. ______ Copernicus's Sun-centered model accounted for this apparent backward motion as a result of Earth overtaking the slower-moving outer planets.",
    prompt: STEM.transition,
    choices: ["By contrast,", "Similarly,", "For example,", "Consequently,"], answer: 0,
    explanation: "Yer markazli modellar tushuntira olmagan narsani Kopernik modeli tushuntiradi — qarama-qarshilik.",
  }],
  ["rw2h-23", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "The novelist spent a decade researching the history of the region before writing a single chapter. ______ the finished book is full of precise details about the region's farming practices, dialects, and religious festivals.",
    prompt: STEM.transition,
    choices: ["Accordingly,", "Nonetheless,", "Alternatively,", "Specifically,"], answer: 0,
    explanation: "Aniq tafsilotlar — o'n yillik izlanishning natijasi.",
  }],
  ["rw2h-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Critics praised the film's cinematography and its lead performance. ______ several of them faulted the screenplay, which they described as uneven and at times confusing.",
    prompt: STEM.transition,
    choices: ["Still,", "Hence,", "Likewise,", "In fact,"], answer: 0,
    explanation: "Maqtovdan keyin tanqid keladi — qarama-qarshilik (\"Still\" = shunga qaramay).",
  }],
  ["rw2h-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Mary Anning (1799–1847) was a British fossil collector.",
      "She discovered the first nearly complete plesiosaur skeleton.",
      "Her finds helped shape early scientific ideas about extinction.",
      "As a woman, she was excluded from the Geological Society of London.",
      "Her discoveries were often credited to the men who bought her fossils.",
    ]),
    prompt: "The student wants to emphasize the contrast between the importance of Anning's discoveries and the recognition she received. " + STEM.notes,
    choices: [
      "Although Anning's fossil discoveries helped shape early ideas about extinction, she was excluded from the Geological Society of London, and her finds were often credited to men.",
      "Mary Anning (1799–1847) was a British fossil collector who discovered the first nearly complete plesiosaur skeleton.",
      "Anning's discoveries were often credited to the men who bought her fossils.",
      "Anning's finds, including a nearly complete plesiosaur skeleton, helped shape early scientific ideas about extinction.",
    ], answer: 0,
    explanation: "Qarama-qarshilik uchun ikkala tomon kerak: kashfiyotlar ahamiyati va tan olinmaganlik.",
  }],
  ["rw2h-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "One study examined how morning daylight affects sleep in teenagers.",
      "Teens who were exposed to more morning daylight fell asleep earlier at night.",
      "A second study examined the same question in adults.",
      "Adults who were exposed to more morning daylight also fell asleep earlier.",
    ]),
    prompt: "The student wants to emphasize a similarity between the two studies' findings. " + STEM.notes,
    choices: [
      "Both studies—one of teenagers and one of adults—found that more exposure to morning daylight was associated with falling asleep earlier.",
      "One study examined teenagers, while the other examined adults.",
      "Teens who were exposed to more morning daylight fell asleep earlier at night.",
      "A second study examined how morning daylight affects sleep in adults.",
    ], answer: 0,
    explanation: "O'xshashlik — ikkala tadqiqot natijasi bir xil. Ikkinchi variant farqni ta'kidlaydi.",
  }],
  ["rw2h-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "The Mariana Trench is the deepest known part of Earth's oceans.",
      "Its deepest point, Challenger Deep, lies about 10,900 meters below sea level.",
      "Mount Everest rises about 8,850 meters above sea level.",
      "In 1960, Jacques Piccard and Don Walsh became the first people to reach Challenger Deep.",
    ]),
    prompt: "The student wants to use a comparison to convey how deep Challenger Deep is. " + STEM.notes,
    choices: [
      "Challenger Deep lies about 10,900 meters below sea level—a greater distance than Mount Everest, at about 8,850 meters, rises above it.",
      "Challenger Deep, the deepest point of the Mariana Trench, was first reached in 1960.",
      "The Mariana Trench is the deepest known part of Earth's oceans.",
      "Jacques Piccard and Don Walsh reached Challenger Deep, which lies about 10,900 meters below sea level.",
    ], answer: 0,
    explanation: "Chuqurlikni solishtirish orqali ko'rsatish kerak — Everest balandligi bilan taqqoslash.",
  }],
]);
