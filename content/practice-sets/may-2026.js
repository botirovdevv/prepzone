// May 2026 (2-may) — original savollar: 44 ta RW + 36 ta Math (question bank bilan jami 54 + 44).
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

  // ---- Craft and Structure ----
  ["may26-rw-13", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The new library's hours were designed to be ______: it opens early for commuters, stays open late for students, and remains open on weekends for families.",
    prompt: STEM.wic,
    choices: ["accommodating", "restrictive", "temporary", "unpredictable"], answer: 0,
    explanation: "Har xil guruhlarga moslashgan jadval — \"accommodating\".",
  }],
  ["may26-rw-14", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Although the scientist's early papers were largely ignored, her later work proved so ______ that researchers in fields from genetics to ecology now cite it routinely.",
    prompt: STEM.wic,
    choices: ["influential", "obscure", "controversial", "premature"], answer: 0,
    explanation: "Turli sohalarda muntazam iqtibos keltiriladi — ta'sirli (\"influential\").",
  }],
  ["may26-rw-15", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The historian cautions that the diary should not be read as a ______ record of events; its author frequently rewrote entries years later to flatter herself and her allies.",
    prompt: STEM.wic,
    choices: ["dispassionate", "fragmentary", "celebrated", "voluminous"], answer: 0,
    explanation: "Muallif o'zini maqtash uchun qayta yozgan — demak kundalik xolis (\"dispassionate\") emas.",
  }],
  ["may26-rw-16", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Unlike many of his contemporaries, who filled their novels with elaborate description, the writer favored a ______ style, often conveying a character's feelings in a single short sentence.",
    prompt: STEM.wic,
    choices: ["spare", "ornate", "whimsical", "archaic"], answer: 0,
    explanation: "Batafsil tasvirga qarama-qarshi, bitta qisqa gap — ixcham (\"spare\") uslub.",
  }],
  ["may26-rw-17", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Most animals heal wounds by forming scar tissue. The axolotl, a salamander native to Mexico, is different: it can regrow entire limbs, parts of its heart, and even sections of its brain. Researchers study the axolotl in hopes of learning how to stimulate similar regeneration in humans.",
    prompt: STEM.purpose,
    choices: [
      "To describe an unusual ability of the axolotl and explain why scientists are interested in it",
      "To argue that scar tissue is harmful to most animals",
      "To compare the axolotl with other salamanders native to Mexico",
      "To explain the process by which humans form scar tissue",
    ], answer: 0,
    explanation: "Matn aksolotlning qayta tiklanish qobiliyatini va olimlar nima uchun uni o'rganishini tushuntiradi.",
  }],
  ["may26-rw-18", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "Many people assume that deserts are nearly lifeless. <u>Yet a single hectare of the Sonoran Desert can support hundreds of plant species, from towering saguaro cacti to tiny wildflowers that bloom only after rain.</u> Ecologists attribute this diversity to the region's two rainy seasons, which allow different plants to thrive at different times of year.",
    prompt: STEM.underlined,
    choices: [
      "It challenges a common assumption by presenting contrary evidence.",
      "It explains why ecologists first began studying the Sonoran Desert.",
      "It describes a problem that the rest of the text proposes to solve.",
      "It offers an example of a claim that the text later rejects.",
    ], answer: 0,
    explanation: "\"Yet\" — cho'l jonsiz degan fikrga qarshi dalil keltiriladi.",
  }],
  ["may26-rw-19", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "In the 1800s, many engineers believed that iron bridges were too brittle for long spans. When the Eads Bridge opened in St. Louis in 1874, it used steel arches instead, spanning the Mississippi River with sections more than 150 meters long. The bridge's success encouraged builders across the country to adopt steel.",
    prompt: STEM.structure,
    choices: [
      "It presents a prevailing belief, describes an achievement that went beyond it, and notes the achievement's influence.",
      "It describes a problem, lists several failed solutions, and then proposes a new one.",
      "It compares two bridges and argues that one was more beautiful than the other.",
      "It explains how steel is produced and why it is stronger than iron.",
    ], answer: 0,
    explanation: "Keng tarqalgan fikr → uni yengib o'tgan yutuq → yutuqning ta'siri.",
  }],
  ["may26-rw-20", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "M",
    passage: "<b>Text 1</b><br>Some linguists argue that children learn language mainly by imitating the adults around them. On this view, a child's speech is largely a copy of the speech the child hears.<br><br><b>Text 2</b><br>Linguist Ana Ruiz points out that young children often produce forms such as \"goed\" and \"mouses,\" which adults rarely say. Such errors, Ruiz argues, show that children are actively applying grammatical rules rather than simply copying what they hear.",
    prompt: "Based on the texts, how would Ruiz (Text 2) most likely respond to the linguists' view in Text 1?",
    choices: [
      "She would argue that the view fails to account for errors that reveal children forming their own rules.",
      "She would agree that imitation fully explains how children acquire grammar.",
      "She would claim that adults frequently use forms such as \"goed\" and \"mouses.\"",
      "She would suggest that children do not begin speaking until they have mastered grammatical rules.",
    ], answer: 0,
    explanation: "\"goed\" kabi xatolar taqlid bilan tushuntirilmaydi — bolalar qoidani o'zlari qo'llaydi.",
  }],
  ["may26-rw-21", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Rather than ______ the committee's findings, the director accepted them in full and announced that the recommended changes would begin immediately.",
    prompt: STEM.wic,
    choices: ["contesting", "implementing", "publicizing", "summarizing"], answer: 0,
    explanation: "\"Rather than\" + \"to'liq qabul qildi\" — qarshi chiqish (\"contesting\") o'rniga.",
  }],

  // ---- Information and Ideas ----
  ["may26-rw-22", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "When the town of Greensburg, Kansas, was destroyed by a tornado in 2007, residents decided to rebuild it as a model of sustainability. The new city hall, school, and hospital were built to use far less energy than typical buildings, and wind turbines now supply much of the town's electricity.",
    prompt: STEM.mainIdea,
    choices: [
      "After a disaster, Greensburg was rebuilt with an emphasis on energy efficiency and renewable power.",
      "Tornadoes are more common in Kansas than in any other state.",
      "Wind turbines are the least expensive source of electricity in the United States.",
      "Greensburg's residents disagreed about whether to rebuild the town.",
    ], answer: 0,
    explanation: "Asosiy g'oya: shahar tejamkor va qayta tiklanuvchi energiya asosida qayta qurildi.",
  }],
  ["may26-rw-23", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "Biologist Kenji Watanabe claims that crows can recognize individual human faces and remember people who have threatened them.",
    prompt: "Which finding, if true, would most directly support Watanabe's claim?",
    choices: [
      "Crows that had been captured by a researcher wearing a particular mask scolded people wearing that mask years later but ignored people wearing other masks.",
      "Crows in cities gather in larger groups than crows in rural areas do.",
      "Crows can use sticks as tools to pull insects out of tree bark.",
      "Crows often hide food and retrieve it several days later.",
    ], answer: 0,
    explanation: "Faqat A yuzni tanish va tahdidni eslab qolishni birga ko'rsatadi.",
  }],
  ["may26-rw-24", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    passage: table(
      "Average Daily Screen Time (hours) by Device",
      ["Device", "2020", "2024"],
      [["Smartphone", "3.1", "3.9"], ["Television", "2.8", "2.1"], ["Laptop", "1.6", "1.7"], ["Tablet", "0.9", "0.8"]]
    ) + "A media researcher concludes that from 2020 to 2024, the rise in smartphone use was accompanied by a decline in television viewing.",
    prompt: "Which choice most effectively uses data from the table to support the researcher's conclusion?",
    choices: [
      "Average daily smartphone use rose from 3.1 to 3.9 hours, while television viewing fell from 2.8 to 2.1 hours.",
      "Average daily laptop use rose from 1.6 to 1.7 hours.",
      "In 2020, people spent more time on smartphones than on any other device.",
      "Average daily tablet use fell from 0.9 to 0.8 hours.",
    ], answer: 0,
    explanation: "Xulosa ikki qismli: smartfon o'sdi VA televizor kamaydi — faqat A ikkalasini beradi.",
  }],
  ["may26-rw-25", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Archaeologists excavating an ancient coastal settlement in Scotland found large quantities of fish bones in layers dating to 3000 BCE but almost none in layers dating to 2500 BCE, while bones of cattle and sheep became much more common in the later layers. Because the settlement remained near the coast throughout this period, the change most likely suggests that ______",
    prompt: STEM.complete,
    choices: [
      "the residents shifted from relying on fishing toward relying on livestock.",
      "the nearby sea had become too cold for fish to survive.",
      "the settlement was abandoned shortly after 3000 BCE.",
      "cattle and sheep were first domesticated in Scotland around 2500 BCE.",
    ], answer: 0,
    explanation: "Baliq suyaklari kamaydi, chorva suyaklari ko'paydi — ovqatlanish chorvaga o'tgan.",
  }],
  ["may26-rw-26", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "The following text is from a short story.<br><br>Mara had walked past the old bakery every morning for ten years without once going inside. Today, the smell of cinnamon drifted through the open door, and she found herself stopping, one hand on the doorframe, as if the decision had already been made for her.",
    prompt: "Which choice best describes what happens in the text?",
    choices: [
      "A character pauses at a familiar place she has long ignored, drawn in almost without deciding to.",
      "A character decides to open her own bakery after years of planning.",
      "A character recalls the day she first discovered the bakery.",
      "A character avoids the bakery because of an unpleasant memory.",
    ], answer: 0,
    explanation: "O'n yil kirmagan joy oldida to'xtaydi — \"qaror go'yo o'zi qabul qilingandek\".",
  }],
  ["may26-rw-27", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    passage: table(
      "Tomato Seeds Germinated (out of 50), by Soil Temperature",
      ["Soil temperature", "Seeds germinated"],
      [["10°C", "12"], ["15°C", "27"], ["20°C", "41"], ["25°C", "44"], ["30°C", "30"]]
    ) + "A student tested how soil temperature affects the germination of tomato seeds and concluded that germination increased with temperature only up to a point, after which it declined.",
    prompt: "Which choice most effectively uses data from the table to support the student's conclusion?",
    choices: [
      "Germination rose from 12 seeds at 10°C to 44 seeds at 25°C but fell to 30 seeds at 30°C.",
      "At 20°C, 41 of the 50 seeds germinated.",
      "More seeds germinated at 15°C than at 10°C.",
      "The fewest seeds germinated at 10°C.",
    ], answer: 0,
    explanation: "Xulosa: avval o'sish, keyin pasayish — A ikkala qismni ham ko'rsatadi.",
  }],
  ["may26-rw-28", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Honeybees communicate the location of food by performing a \"waggle dance.\" In one experiment, researchers moved a hive to an unfamiliar area and found that the bees' dances at first directed foragers inaccurately but became accurate after several days. This finding suggests that honeybees' ability to communicate locations ______",
    prompt: STEM.complete,
    choices: [
      "depends partly on learning about their surroundings.",
      "is entirely unaffected by changes in their environment.",
      "is less important than their sense of smell in finding food.",
      "develops only in bees that are raised in a single location.",
    ], answer: 0,
    explanation: "Yangi joyda bir necha kundan keyin aniqlashdi — atrofni o'rganish kerak bo'ldi.",
  }],
  ["may26-rw-29", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "Economist Priya Nair argues that shifting from a five-day to a four-day workweek tends to raise workers' productivity rather than lower it.",
    prompt: "Which finding, if true, would most directly weaken Nair's argument?",
    choices: [
      "Companies that adopted four-day workweeks produced less output per hour worked than similar companies that kept five-day workweeks.",
      "Employees at companies with four-day workweeks reported higher job satisfaction.",
      "Some companies adopted four-day workweeks only for certain departments.",
      "Four-day workweeks are more common in technology companies than in manufacturing companies.",
    ], answer: 0,
    explanation: "Unumdorlik = soatiga mahsulot. A unumdorlik pasayganini ko'rsatadi — da'voni kuchsizlantiradi.",
  }],

  // ---- Standard English Conventions ----
  ["may26-rw-30", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "The painter Frida Kahlo is known for her vivid self-______ she completed more than fifty of them during her career.",
    prompt: STEM.conventions,
    choices: ["portraits;", "portraits,", "portraits", "portraits and"], answer: 0,
    explanation: "Ikki mustaqil gap — nuqtali vergul kerak.",
  }],
  ["may26-rw-31", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "Since the 1990s, the population of gray wolves in Yellowstone National Park ______ steadily, reshaping the park's ecosystem.",
    prompt: STEM.conventions,
    choices: ["has grown", "grows", "will grow", "had been growing"], answer: 0,
    explanation: "\"Since the 1990s\" — hozirgacha davom etayotgan jarayon: present perfect.",
  }],
  ["may26-rw-32", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "The museum acquired two paintings by Mary Cassatt last year and plans to display ______ in a special exhibition this spring.",
    prompt: STEM.conventions,
    choices: ["them", "it", "its", "their"], answer: 0,
    explanation: "\"two paintings\" — ko'plik, to'ldiruvchi: \"them\".",
  }],
  ["may26-rw-33", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "Cliff swallows nest in large colonies. The ______ nests, built from mud, are often packed so closely together that they touch.",
    prompt: STEM.conventions,
    choices: ["cliff swallows'", "cliff swallow's", "cliff swallows", "cliff swallows's"], answer: 0,
    explanation: "Ko'plikdagi qushlarning uyalari — ko'plik egalik: \"swallows'\".",
  }],
  ["may26-rw-34", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "The expedition's success depended on one essential ______ reliable access to fresh water.",
    prompt: STEM.conventions,
    choices: ["resource:", "resource;", "resource", "resource, which"], answer: 0,
    explanation: "Ikki nuqta — \"resource\" nima ekanini aniqlab beradi; nuqtali vergul to'liq gap talab qiladi.",
  }],
  ["may26-rw-35", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The collection of letters written by the explorer during her travels in Central Asia ______ now housed at the national archive.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "have been"], answer: 0,
    explanation: "Ega — \"collection\" (birlik), \"letters\" emas: \"is\".",
  }],
  ["may26-rw-36", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Mae Jemison, the first African American woman to travel into ______ is also a physician and an engineer.",
    prompt: STEM.conventions,
    choices: ["space,", "space", "space;", "space:"], answer: 0,
    explanation: "Qo'shimcha izoh ikki tomondan vergul bilan ajratiladi.",
  }],
  ["may26-rw-37", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The goal of the conservation program is ______ the wetland's native plants and to remove invasive species.",
    prompt: STEM.conventions,
    choices: ["to restore", "restoring", "restored", "restores"], answer: 0,
    explanation: "Parallellik: \"to restore ... and to remove\".",
  }],
  ["may26-rw-38", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "In 1928, Alexander Fleming noticed that mold had killed bacteria in one of his laboratory ______ this accidental observation led to the development of penicillin.",
    prompt: STEM.conventions,
    choices: ["dishes; eventually,", "dishes, eventually,", "dishes eventually", "dishes, eventually"], answer: 0,
    explanation: "Ikki mustaqil gap: nuqtali vergul, so'ng \"eventually,\".",
  }],

  // ---- Expression of Ideas ----
  ["may26-rw-39", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Solar panels generate no electricity at night. ______ many solar-powered homes also use batteries to store energy produced during the day.",
    prompt: STEM.transition,
    choices: ["For this reason,", "Similarly,", "In contrast,", "Nevertheless,"], answer: 0,
    explanation: "Sabab → natija: tunda elektr yo'q, shuning uchun batareya.",
  }],
  ["may26-rw-40", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "For decades, many scientists thought that the giant squid lived only in the deepest parts of the ocean. ______ in 2012, researchers filmed one swimming at a depth of about 600 meters, far shallower than expected.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "Likewise,", "Additionally,"], answer: 0,
    explanation: "Kutilgandan farqli natija — zidlik: \"However\".",
  }],
  ["may26-rw-41", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "To make paper by hand, workers first soak plant fibers in water until they form a pulp. ______ they spread the pulp over a screen and let it dry.",
    prompt: STEM.transition,
    choices: ["Next,", "In contrast,", "For example,", "Instead,"], answer: 0,
    explanation: "Jarayonning keyingi bosqichi — \"Next\".",
  }],
  ["may26-rw-42", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Hedy Lamarr was born in Vienna in 1914.",
      "She became a Hollywood actress in the late 1930s.",
      "During World War II, she co-invented a frequency-hopping system to prevent enemies from jamming radio signals.",
      "Frequency-hopping technology later influenced the development of Wi-Fi and Bluetooth.",
    ]),
    prompt: "The student wants to emphasize Lamarr's contribution to modern technology. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "Hedy Lamarr co-invented a frequency-hopping system that later influenced the development of Wi-Fi and Bluetooth.",
      "Hedy Lamarr was born in Vienna in 1914.",
      "Hedy Lamarr became a Hollywood actress in the late 1930s.",
      "During World War II, Hedy Lamarr was a Hollywood actress.",
    ], answer: 0,
    explanation: "Zamonaviy texnologiyaga hissa — Wi-Fi va Bluetooth'ga ta'sir.",
  }],
  ["may26-rw-43", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "The Hubble Space Telescope was launched in 1990.",
      "Hubble observes mainly visible and ultraviolet light.",
      "The James Webb Space Telescope was launched in 2021.",
      "Webb observes mainly infrared light.",
      "Infrared light can pass through clouds of cosmic dust.",
    ]),
    prompt: "The student wants to contrast the types of light the two telescopes observe. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "While the Hubble Space Telescope observes mainly visible and ultraviolet light, the James Webb Space Telescope observes mainly infrared light.",
      "The Hubble Space Telescope was launched in 1990, and the James Webb Space Telescope was launched in 2021.",
      "Infrared light, which the James Webb Space Telescope observes, can pass through clouds of cosmic dust.",
      "The James Webb Space Telescope, launched in 2021, observes mainly infrared light.",
    ], answer: 0,
    explanation: "Maqsad — ikkala teleskopning yorug'lik turini solishtirish; faqat A ikkalasini qarama-qarshi qo'yadi.",
  }],
  ["may26-rw-44", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Researchers studied 120 community gardens in Chicago.",
      "They counted the number of bee species found in each garden.",
      "Gardens with a greater variety of flowering plants had more bee species.",
      "The researchers concluded that planting diverse flowers can help support bee populations in cities.",
    ]),
    prompt: "The student wants to present the study's conclusion. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
    choices: [
      "After studying 120 Chicago community gardens, researchers concluded that planting diverse flowers can help support urban bee populations.",
      "Researchers counted the number of bee species in 120 community gardens.",
      "The study took place in community gardens in Chicago.",
      "Some community gardens in Chicago had more bee species than others.",
    ], answer: 0,
    explanation: "Maqsad — tadqiqot xulosasi; A uni aniq bayon qiladi.",
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

  // ---- Algebra ----
  ["may26-m-11", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "If 4<i>x</i> + 7 = 31, what is the value of <i>x</i>?",
    choices: ["6", "8", "9", "12"], answer: 0, sortNumeric: true,
    explanation: "4x = 24, x = 6.",
  }],
  ["may26-m-12", {
    domain: ALG, skill: "Linear functions", difficulty: "E",
    prompt: "What is the slope of the line with equation 2<i>y</i> = 8<i>x</i> + 6 in the <i>xy</i>-plane?",
    choices: ["4", "6", "8", "16"], answer: 0, sortNumeric: true,
    explanation: "Ikkiga bo'lamiz: y = 4x + 3, qiyalik 4.",
  }],
  ["may26-m-13", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "A line in the <i>xy</i>-plane passes through the points (1, 5) and (4, 14). Which equation defines the line?",
    choices: ["<i>y</i> = 3<i>x</i> + 2", "<i>y</i> = 3<i>x</i> + 5", "<i>y</i> = 9<i>x</i> − 4", "<i>y</i> = 2<i>x</i> + 3"], answer: 0,
    explanation: "Qiyalik (14 − 5)/(4 − 1) = 3; 5 = 3·1 + b, b = 2.",
  }],
  ["may26-m-14", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "M",
    prompt: "If <i>x</i> + <i>y</i> = 12 and <i>x</i> − <i>y</i> = 4, what is the value of <i>xy</i>?",
    choices: ["32", "40", "48", "64"], answer: 0, sortNumeric: true,
    explanation: "Qo'shamiz: 2x = 16, x = 8, y = 4; xy = 32.",
  }],
  ["may26-m-15", {
    domain: ALG, skill: "Linear inequalities", difficulty: "M",
    prompt: "Maria has $240 in savings and spends $15 of it each week. Which inequality represents the numbers of weeks, <i>w</i>, for which Maria will still have at least $60 in savings?",
    choices: ["240 − 15<i>w</i> ≥ 60", "240 − 15<i>w</i> ≤ 60", "15<i>w</i> − 240 ≥ 60", "240 + 15<i>w</i> ≥ 60"], answer: 0,
    explanation: "Qolgan pul 240 − 15w, u kamida 60 bo'lishi kerak: ≥ 60.",
  }],
  ["may26-m-16", {
    domain: ALG, skill: "Linear functions", difficulty: "H",
    prompt: "Line ℓ in the <i>xy</i>-plane is perpendicular to the line with equation <i>y</i> = −(2/3)<i>x</i> + 5 and passes through the point (6, 1). What is the <i>y</i>-intercept of line ℓ?",
    choices: ["−8", "−2", "1", "10"], answer: 0, sortNumeric: true,
    explanation: "Perpendikulyar qiyalik 3/2: 1 = (3/2)·6 + b, b = 1 − 9 = −8.",
  }],
  ["may26-m-17", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "H",
    prompt: "In the system of equations below, <i>a</i> is a constant.<br>2<i>x</i> + 3<i>y</i> = 12<br><i>ax</i> + 6<i>y</i> = 24<br>For what value of <i>a</i> does the system have infinitely many solutions?",
    choices: ["2", "3", "4", "6"], answer: 2, sortNumeric: true,
    explanation: "Ikkinchi tenglama birinchisining 2 barobari bo'lishi kerak: a = 4 (6 = 2·3, 24 = 2·12).",
  }],
  ["may26-m-18", {
    domain: ALG, skill: "Linear equations in one variable", difficulty: "E",
    prompt: "A plumber charges $75 for a service visit plus $40 per hour of work. If a customer's total bill was $235, for how many hours did the plumber work?",
    choices: ["2", "3", "3.5", "4"], answer: 3, sortNumeric: true,
    explanation: "75 + 40h = 235, 40h = 160, h = 4.",
  }],
  ["may26-m-19", {
    domain: ALG, skill: "Linear functions", difficulty: "M",
    prompt: "The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = 5<i>x</i> − 3. What is the value of <i>f</i>(4) − <i>f</i>(2)?",
    choices: ["2", "7", "10", "17"], answer: 2, sortNumeric: true,
    explanation: "f(4) = 17, f(2) = 7; 17 − 7 = 10.",
  }],
  ["may26-m-20", {
    domain: ALG, skill: "Systems of two linear equations", difficulty: "H",
    prompt: "A theater sold 300 tickets for a total of $4,200. Adult tickets cost $18 each and student tickets cost $10 each. How many student tickets did the theater sell?",
    choices: ["120", "150", "180", "200"], answer: 1, sortNumeric: true,
    explanation: "a + s = 300, 18a + 10s = 4200 → 18(300 − s) + 10s = 4200 → 8s = 1200, s = 150.",
  }],

  // ---- Advanced Math ----
  ["may26-m-21", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "E",
    prompt: `The function <i>f</i> is defined by <i>f</i>(<i>x</i>) = <i>x</i>${SQ} − 3<i>x</i>. What is the value of <i>f</i>(5)?`,
    choices: ["−10", "10", "15", "40"], answer: 1, sortNumeric: true,
    explanation: "25 − 15 = 10.",
  }],
  ["may26-m-22", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: `What are the solutions to the equation <i>x</i>${SQ} − 2<i>x</i> − 15 = 0?`,
    choices: ["<i>x</i> = 5 and <i>x</i> = −3", "<i>x</i> = −5 and <i>x</i> = 3", "<i>x</i> = 5 and <i>x</i> = 3", "<i>x</i> = −5 and <i>x</i> = −3"], answer: 0,
    explanation: "(x − 5)(x + 3) = 0: x = 5 yoki x = −3.",
  }],
  ["may26-m-23", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "M",
    prompt: `Which expression is equivalent to (3<i>x</i>${SQ}<i>y</i>)(4<i>xy</i><sup>3</sup>)?`,
    choices: [
      "12<i>x</i><sup>3</sup><i>y</i><sup>4</sup>",
      "7<i>x</i><sup>3</sup><i>y</i><sup>4</sup>",
      "12<i>x</i><sup>2</sup><i>y</i><sup>3</sup>",
      "7<i>x</i><sup>2</sup><i>y</i><sup>3</sup>",
    ], answer: 0,
    explanation: "Koeffitsientlar ko'paytiriladi (3·4 = 12), darajalar qo'shiladi: x³y⁴.",
  }],
  ["may26-m-24", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: "An investment of $2,000 increases in value by 5% each year. Which function gives the value <i>V</i>, in dollars, of the investment <i>t</i> years after it was made?",
    choices: [
      "<i>V</i>(<i>t</i>) = 2,000(1.05)<sup><i>t</i></sup>",
      "<i>V</i>(<i>t</i>) = 2,000(0.05)<sup><i>t</i></sup>",
      "<i>V</i>(<i>t</i>) = 2,000 + 1.05<i>t</i>",
      "<i>V</i>(<i>t</i>) = 2,000(1.5)<sup><i>t</i></sup>",
    ], answer: 0,
    explanation: "Har yili 5% o'sish — ko'paytuvchi 1.05, eksponensial funksiya.",
  }],
  ["may26-m-25", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "M",
    prompt: "If <i>x</i> > 0 and √(<i>x</i> + 11) = <i>x</i> − 1, what is the value of <i>x</i>?",
    choices: ["2", "5", "10", "11"], answer: 1, sortNumeric: true,
    explanation: `Kvadratga ko'taramiz: x + 11 = x${SQ} − 2x + 1 → (x − 5)(x + 2) = 0. Tekshiruv: x = 5 (√16 = 4).`,
  }],
  ["may26-m-26", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "H",
    prompt: `The graph of <i>y</i> = <i>x</i>${SQ} − 8<i>x</i> + 19 in the <i>xy</i>-plane is a parabola with vertex (<i>h</i>, <i>k</i>). What is the value of <i>h</i> + <i>k</i>?`,
    choices: ["1", "4", "7", "11"], answer: 2, sortNumeric: true,
    explanation: "y = (x − 4)² + 3, uch nuqta (4, 3); 4 + 3 = 7.",
  }],
  ["may26-m-27", {
    domain: ADV, skill: "Nonlinear functions", difficulty: "M",
    prompt: "A population of bacteria doubles every 3 hours. If there are 500 bacteria initially, how many bacteria will there be after 12 hours?",
    choices: ["2,000", "4,000", "6,000", "8,000"], answer: 3, sortNumeric: true,
    explanation: "12/3 = 4 marta ikki barobar: 500 · 2⁴ = 8,000.",
  }],
  ["may26-m-28", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: `In the equation <i>x</i>${SQ} + 6<i>x</i> + <i>c</i> = 0, <i>c</i> is a constant. For what value of <i>c</i> does the equation have exactly one real solution?`,
    choices: ["3", "6", "9", "36"], answer: 2, sortNumeric: true,
    explanation: "Diskriminant nol: 36 − 4c = 0, c = 9.",
  }],
  ["may26-m-29", {
    domain: ADV, skill: "Equivalent expressions", difficulty: "E",
    prompt: "Which expression is equivalent to 2(<i>x</i> + 3) − (<i>x</i> − 5)?",
    choices: ["<i>x</i> + 11", "<i>x</i> + 1", "3<i>x</i> + 1", "<i>x</i> − 2"], answer: 0,
    explanation: "2x + 6 − x + 5 = x + 11.",
  }],
  ["may26-m-30", {
    domain: ADV, skill: "Nonlinear equations", difficulty: "H",
    prompt: "If (<i>x</i> + 2)/(<i>x</i> − 3) = 3, what is the value of <i>x</i>?",
    choices: ["3.5", "5.5", "7", "11"], answer: 1, sortNumeric: true,
    explanation: "x + 2 = 3x − 9 → 2x = 11, x = 5.5.",
  }],

  // ---- Problem-Solving and Data Analysis ----
  ["may26-m-31", {
    domain: PSDA, skill: "Percentages", difficulty: "E",
    prompt: "A shirt originally priced at $40 is on sale for 25% off the original price. What is the sale price, in dollars, of the shirt?",
    choices: ["10", "15", "30", "35"], answer: 2, sortNumeric: true,
    explanation: "40 · 0.75 = 30.",
  }],
  ["may26-m-32", {
    domain: PSDA, skill: "One-variable data", difficulty: "M",
    prompt: "The mean of five numbers is 18. If one of the numbers, 30, is removed, what is the mean of the remaining four numbers?",
    choices: ["12", "15", "18", "24"], answer: 1, sortNumeric: true,
    explanation: "Yig'indi 5 · 18 = 90; 90 − 30 = 60; 60/4 = 15.",
  }],
  ["may26-m-33", {
    domain: PSDA, skill: "Inference from sample statistics", difficulty: "H",
    prompt: "A survey of 400 randomly selected residents of a city found that 22% of them bike to work. The margin of error for this estimate is 4%. Which of the following is the most appropriate conclusion?",
    choices: [
      "It is plausible that between 18% and 26% of all residents of the city bike to work.",
      "Exactly 22% of all residents of the city bike to work.",
      "At least 26% of all residents of the city bike to work.",
      "The survey results apply only to the 400 residents who were surveyed.",
    ], answer: 0,
    explanation: "22% ± 4% → 18% dan 26% gacha bo'lishi ehtimoli bor; tanlov tasodifiy, shuning uchun butun shaharga tegishli.",
  }],

  // ---- Geometry and Trigonometry ----
  ["may26-m-34", {
    domain: GEO, skill: "Area and volume", difficulty: "E",
    prompt: "A rectangle has a length of 12 centimeters and a perimeter of 40 centimeters. What is the area, in square centimeters, of the rectangle?",
    choices: ["48", "80", "96", "480"], answer: 2, sortNumeric: true,
    explanation: "2(12 + w) = 40, w = 8; yuza 12 · 8 = 96.",
  }],
  ["may26-m-35", {
    domain: GEO, skill: "Right triangles and trigonometry", difficulty: "M",
    prompt: "The legs of a right triangle have lengths 9 and 12. What is the length of the hypotenuse?",
    choices: ["15", "17", "19", "21"], answer: 0, sortNumeric: true,
    explanation: "√(81 + 144) = √225 = 15.",
  }],
  ["may26-m-36", {
    domain: GEO, skill: "Circles", difficulty: "H",
    prompt: `A circle in the <i>xy</i>-plane has equation <i>x</i>${SQ} + <i>y</i>${SQ} − 6<i>x</i> + 4<i>y</i> − 12 = 0. What is the radius of the circle?`,
    choices: ["3", "5", "12", "25"], answer: 1, sortNumeric: true,
    explanation: "(x − 3)² + (y + 2)² = 12 + 9 + 4 = 25, r = 5.",
  }],
]);
