// Practice Test 3 — Reading and Writing, Module 1 (aralash qiyinlik, 27 ta).
// Savol turlari va tartibi March 2026 testi tuzilishiga mos; matnlar original.
import { buildModule, STEM, table, notes, svgFigure } from "../helpers.js";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

// 12-savol: uch turdagi qushlar soni (chiziqli grafik).
// x: Mar, Jun, Sep, Dec → 90, 190, 290, 390; y: 0..60, 1 birlik = 4px, y0 = 280.
const birdCountFigure = svgFigure(
  460,
  400,
  `<text x="240" y="22" text-anchor="middle" font-weight="bold">Birds Counted at Willow Marsh, 2023</text>
   <g stroke="#bbb" stroke-width="1">
     <line x1="60" y1="40" x2="420" y2="40"/><line x1="60" y1="80" x2="420" y2="80"/>
     <line x1="60" y1="120" x2="420" y2="120"/><line x1="60" y1="160" x2="420" y2="160"/>
     <line x1="60" y1="200" x2="420" y2="200"/><line x1="60" y1="240" x2="420" y2="240"/>
   </g>
   <line x1="60" y1="280" x2="420" y2="280" stroke="#111" stroke-width="1.5"/>
   <line x1="60" y1="40" x2="60" y2="280" stroke="#111" stroke-width="1.5"/>
   <g font-size="13" text-anchor="end">
     <text x="54" y="284">0</text><text x="54" y="244">10</text><text x="54" y="204">20</text>
     <text x="54" y="164">30</text><text x="54" y="124">40</text><text x="54" y="84">50</text><text x="54" y="44">60</text>
   </g>
   <g font-size="13" text-anchor="middle">
     <text x="90" y="300">March</text><text x="190" y="300">June</text>
     <text x="290" y="300">September</text><text x="390" y="300">December</text>
   </g>
   <text x="18" y="160" font-size="13" text-anchor="middle" transform="rotate(-90 18 160)">Number of birds</text>
   <polyline points="90,92 190,220 290,264 390,272" fill="none" stroke="#111" stroke-width="2.5"/>
   <g fill="#111"><circle cx="90" cy="92" r="5"/><circle cx="190" cy="220" r="5"/><circle cx="290" cy="264" r="5"/><circle cx="390" cy="272" r="5"/></g>
   <polyline points="90,228 190,200 290,184 390,240" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="8 5"/>
   <g fill="#fff" stroke="#111" stroke-width="2"><rect x="85" y="223" width="10" height="10"/><rect x="185" y="195" width="10" height="10"/><rect x="285" y="179" width="10" height="10"/><rect x="385" y="235" width="10" height="10"/></g>
   <polyline points="90,276 190,256 290,236 390,252" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="2 4"/>
   <g fill="#fff" stroke="#111" stroke-width="2"><circle cx="90" cy="276" r="5"/><circle cx="190" cy="256" r="5"/><circle cx="290" cy="236" r="5"/><circle cx="390" cy="252" r="5"/></g>
   <g font-size="13">
     <rect x="110" y="320" width="250" height="72" fill="#fff" stroke="#111"/>
     <line x1="120" y1="337" x2="160" y2="337" stroke="#111" stroke-width="2.5"/><circle cx="140" cy="337" r="5" fill="#111"/><text x="170" y="341">red-winged blackbird</text>
     <line x1="120" y1="357" x2="160" y2="357" stroke="#111" stroke-width="2" stroke-dasharray="8 5"/><rect x="135" y="352" width="10" height="10" fill="#fff" stroke="#111" stroke-width="2"/><text x="170" y="361">marsh wren</text>
     <line x1="120" y1="377" x2="160" y2="377" stroke="#111" stroke-width="2" stroke-dasharray="2 4"/><circle cx="140" cy="377" r="5" fill="#fff" stroke="#111" stroke-width="2"/><text x="170" y="381">sora rail</text>
   </g>`
);

export const t3RwModule1 = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t3-rw1-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Weather balloons launched by meteorologists in the 1950s recorded temperature and humidity at high altitudes. Climate scientist Rosa Aguilar still compares those early readings with modern measurements, showing that the usefulness of the old records ______",
    prompt: STEM.wic,
    choices: ["endures", "objects", "departs", "consents"], answer: 0,
    explanation: "Eski yozuvlar hozir ham ishlatiladi — foydaliligi saqlanib qolmoqda (\"endures\").",
  }],
  ["t3-rw1-02", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "The following text is adapted from a 2019 memoir by a retired mountain guide.<br><br>My grandparents had always displayed a fondness for risk. Both had grown up in villages high in the Alps, where weather could turn in minutes. They worked patiently and spoke little, but they never hesitated to climb where others turned back.",
    prompt: "As used in the text, what does the word \"displayed\" most nearly mean?",
    choices: ["Showed", "Arranged", "Advertised", "Decorated"], answer: 0,
    explanation: "\"displayed a fondness for risk\" — xavfga moyillikni namoyon qilgan, ya'ni ko'rsatgan (\"Showed\").",
  }],
  ["t3-rw1-03", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "Engineers designing a new office tower expected the building's cooling system to waste much of the heat it removed from the interior. While some ______ of that heat was anticipated, the engineers were surprised to find that the system captured nearly 35% of it and used it to warm the building's water supply.",
    prompt: STEM.wic,
    choices: ["recycling", "imitation", "measurement", "removal"], answer: 0,
    explanation: "Issiqlik qayta ishlatilgan (suvni isitishga) — \"recycling\". \"While some\" — bir oz kutilgan, lekin ko'lami kutilmagan.",
  }],
  ["t3-rw1-04", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Although nearly every region of Mexico prepares tamales, the dish is highly ______ in its fillings and wrappings: in Oaxaca cooks wrap the dough in banana leaves, in the north they favor corn husks and shredded beef, and on the Yucatán Peninsula they season it with achiote paste.",
    prompt: STEM.wic,
    choices: ["regional", "seasonal", "meticulous", "proprietary"], answer: 0,
    explanation: "Har bir hududda boshqacha tayyorlanadi — hududga xos (\"regional\").",
  }],
  ["t3-rw1-05", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The following text is adapted from a 1902 short story. The narrator is describing a ship's captain.<br><br>Captain Hale was a man of perhaps fifty, broad in the shoulders and of a <u>fair</u> size, as anyone could tell even when he sat hunched over the chart table with his collar turned up against the wind.",
    prompt: "As used in the text, what does the word \"fair\" most nearly mean?",
    choices: ["Considerable", "Just", "Light-colored", "Pleasant"], answer: 0,
    explanation: "\"of a fair size\" — ancha katta, sezilarli o'lchamda (\"Considerable\"). \"Just\" — adolatli ma'nosi bu yerga mos emas.",
  }],
  ["t3-rw1-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "E",
    passage: "Mosaics are images made by fitting together small pieces of colored stone, glass, or tile. The ancient Romans decorated the floors of homes and public baths with detailed mosaics. Today, artists continue the tradition: for example, the artist Isaiah Zagar covered entire walls in Philadelphia with mosaics made from broken mirrors and dishes.",
    prompt: STEM.purpose,
    choices: [
      "To provide information about the art form of mosaics",
      "To argue that modern mosaics are more impressive than ancient ones",
      "To explain why the Romans built public baths",
      "To describe the difficulties of working with broken glass",
    ], answer: 0,
    explanation: "Matn mozaika nima ekanini, uning tarixi va zamonaviy misolini beradi — ma'lumot berish.",
  }],
  ["t3-rw1-07", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "Novelist Tomás Rivera wrote his stories about migrant farmworkers in the plain, unadorned Spanish that the workers themselves spoke, and he arranged the stories in short, broken fragments rather than a continuous plot. These choices mirror the lives of his characters, which are themselves fragmented by constant travel from one harvest to the next and by the struggle to hold a family together on the move.",
    prompt: STEM.purpose,
    choices: [
      "To show that a writer's stylistic choices reflect the experiences his stories depict",
      "To explain how Rivera first became interested in writing fiction",
      "To argue that Rivera's stories would be more effective with a continuous plot",
      "To summarize how the lives of migrant farmworkers have changed over time",
    ], answer: 0,
    explanation: "Til va bo'lak-bo'lak tuzilma qahramonlar hayotini aks ettiradi — uslub mavzuni kuchaytiradi.",
  }],
  ["t3-rw1-08", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "Planting fast-growing trees on degraded land is widely promoted as a way to draw carbon dioxide out of the atmosphere. Ecologist Mariana Duarte warns, however, that when such trees are planted on natural grasslands, they can dry out the soil and release carbon stored underground, partly canceling the benefit. Planners, she argues, should therefore assess the existing ecosystem before choosing a site for tree planting.",
    prompt: STEM.structure,
    choices: [
      "It describes a popular approach to an environmental problem, identifies a possible drawback of that approach, and then states a recommendation that follows from that drawback.",
      "It presents two competing solutions to an environmental problem and then explains why both are likely to fail.",
      "It explains the cause of an environmental problem and then criticizes scientists who have ignored that cause.",
      "It summarizes the history of tree planting and then predicts how that practice will change in the future.",
    ], answer: 0,
    explanation: "Tuzilma: mashhur yondashuv → kamchiligi (\"however\") → xulosa/tavsiya (\"therefore\").",
  }],

  // ---------------- Information and Ideas ----------------
  ["t3-rw1-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "A haiku is a short Japanese poem made up of three lines. One well-known writer of haiku was Matsuo Bashō, who lived in the 1600s. Haiku are often admired because they capture a single moment in nature in very few words.",
    prompt: "Which choice best states the main topic of the text?",
    choices: ["Haiku poetry", "Japanese history", "Famous travelers", "Learning to write novels"], answer: 0,
    explanation: "Matnning har bir gapi haiku she'riyati haqida.",
  }],
  ["t3-rw1-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "E",
    passage: table("Sea Turtles Tagged at Playa Grande", ["Tag number", "Species", "Shell length (cm)", "Approximate mass (kg)"], [
      ["T-41", "leatherback", "152", "310"],
      ["T-58", "green", "96", "120"],
      ["T-63", "leatherback", "140", "275"],
      ["T-77", "olive ridley", "64", "38"],
    ]) + "Researchers attached tags to sea turtles nesting at Playa Grande and recorded each turtle's species, shell length, and approximate mass. For the turtle with tag number T-58, for example, the researchers recorded that the turtle was a ______",
    prompt: STEM.table,
    choices: [
      "green turtle with a shell length of 96 cm and a mass of approximately 120 kg.",
      "leatherback with a shell length of 152 cm and a mass of approximately 310 kg.",
      "olive ridley with a shell length of 64 cm and a mass of approximately 38 kg.",
      "leatherback with a shell length of 140 cm and a mass of approximately 275 kg.",
    ], answer: 0,
    explanation: "Jadvaldagi T-58 qatori: green, 96 cm, 120 kg.",
  }],
  ["t3-rw1-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "In the novel <i>The Lighthouse Keeper's Daughter</i>, the narrator describes her father as both stern and gentle.",
    prompt: "Which quotation from the novel most effectively illustrates the claim?",
    choices: [
      "\"He could silence a room of quarreling fishermen with one look, yet he spent whole evenings teaching me to mend a torn net, guiding my fingers without a word of complaint.\"",
      "\"Every morning before dawn, he climbed the ninety-two steps to trim the lamp and polish the great lens.\"",
      "\"In his youth he had sailed as far as Lisbon, and he still kept a faded map of the harbor above his bed.\"",
      "\"When the storms came in November, he would stand at the window for hours, watching the waves break over the rocks.\"",
    ], answer: 0,
    explanation: "Ikki sifat kerak: bir qarash bilan jim qildirish (qattiqqo'l) va sabr bilan o'rgatish (mehribon).",
  }],
  ["t3-rw1-12", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "M",
    image: birdCountFigure,
    passage: "Ornithologist Dana Whitfield counted three bird species at Willow Marsh four times during 2023 and found that the species differed greatly in their peak counts. For example, the highest count for the red-winged blackbird was 47 birds in March, whereas the highest count for the sora rail was ______",
    prompt: "Which choice most effectively uses data from the graph to complete the example?",
    choices: ["11 birds in September.", "24 birds in September.", "47 birds in March.", "2 birds in June."], answer: 0,
    explanation: "Sora rail (oq doiracha, nuqtali chiziq) eng yuqori qiymati — sentyabrda 11 ta. 24 — marsh wren'niki.",
  }],
  ["t3-rw1-13", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "H",
    passage: "In 1960, linguist Charles Hockett proposed a list of \"design features\" meant to identify what makes human language different from animal communication, such as the ability to talk about things that are not present. Hockett argued that researchers must compare languages and animal signals feature by feature rather than judging them as wholes. <u>Since its publication, Hockett's list has significantly shaped the study of animal communication.</u>",
    prompt: "Which statement, if true, would most strongly support the claim in the underlined sentence?",
    choices: [
      "Many researchers studying animal communication since the 1970s have organized their studies around testing whether particular species display one or more of Hockett's design features.",
      "Some linguists working before Hockett compared human languages with one another but rarely studied animal signals.",
      "It is difficult for researchers to determine whether an animal is communicating about something that is not present.",
      "Most researchers today agree that no animal communication system shares every feature of human language.",
    ], answer: 0,
    explanation: "\"Ta'sir qilgan\" degan da'voni keyingi tadqiqotchilar aynan shu ro'yxat asosida ishlagani tasdiqlaydi.",
  }],
  ["t3-rw1-14", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Many cities are struggling to manage the growing number of electric scooters left on sidewalks after riders finish their trips. City officials have tested several solutions, including designated parking corrals and apps that fine riders for improper parking. So far, however, each solution has created new problems: corrals take up scarce sidewalk space, and fines have led many riders to stop using scooters altogether. As a result, cities will likely ______",
    prompt: STEM.complete,
    choices: [
      "continue to face difficulties managing scooter parking until a more workable solution is found.",
      "ban electric scooters from all city streets within the next year.",
      "have no reason to look for new ways to manage scooter parking.",
      "require riders to purchase their own parking corrals.",
    ], answer: 0,
    explanation: "Har bir yechim yangi muammo tug'dirgan — demak, yaxshiroq yechim topilmaguncha qiyinchilik davom etadi.",
  }],
  ["t3-rw1-15", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "Many flowering plants on the island of Guam depend on animals to carry their pollen from flower to flower. Most of the island's native pollinating birds disappeared after the brown tree snake was accidentally introduced in the 1940s. Recently, however, researchers observed that honeybees and several bird species brought to Guam in the last century regularly visit and pollinate these native plants. Based on these observations, the researchers suggest that some of Guam's native flowering plants ______",
    prompt: STEM.complete,
    choices: [
      "may now rely on introduced species to help them reproduce.",
      "were never pollinated by native birds in the first place.",
      "produce more flowers now than they did before the 1940s.",
      "arrived on the island at about the same time as the brown tree snake.",
    ], answer: 0,
    explanation: "Mahalliy changlatuvchilar yo'qolgan, lekin keltirilgan turlar o'simliklarni changlatmoqda — o'simliklar endi ularga tayanishi mumkin.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t3-rw1-16", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Created in 1916 to protect and manage the country's growing number of national parks, ______ helped millions of Americans experience wilderness areas firsthand.",
    prompt: STEM.conventions,
    choices: [
      "the National Park Service has",
      "the country's many efforts, one of which was the National Park Service, have",
      "many programs, including the National Park Service, have",
      "there were many agencies, including the National Park Service, that",
    ], answer: 0,
    explanation: "\"Created in 1916...\" — National Park Service'ni tasvirlaydi, shuning uchun u verguldan keyin darhol kelishi kerak (dangling modifier).",
  }],
  ["t3-rw1-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "During a 2022 survey of the coral reefs near Palau, marine biologist Keiko Tanaka and her team recorded nine giant clams ______ to the family Cardiidae, the giant clam (<i>Tridacna gigas</i>) can grow to more than a meter across.",
    prompt: STEM.conventions,
    choices: ["clams. Belonging", "clams, belonging", "clams and belonging", "clams belonging"], answer: 0,
    explanation: "\"Belonging to the family Cardiidae, the giant clam can grow...\" — yangi gap. Undan oldin nuqta kerak.",
  }],
  ["t3-rw1-18", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The way a birthday is celebrated depends largely on the country in which it takes ______ children in Mexico often break a piñata filled with candy. In Vietnam, by contrast, many people traditionally celebrate everyone's birthday together on the Lunar New Year.",
    prompt: STEM.conventions,
    choices: ["place. Many", "place, many", "place many", "place, and, many"], answer: 0,
    explanation: "Ikkita mustaqil gap — nuqta bilan ajratiladi. Vergul comma splice hosil qiladi.",
  }],
  ["t3-rw1-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Potatoes were first cultivated in the Andes Mountains of South America and later spread throughout Europe. The gradual movement of crops between continents ______ one of the most important developments in the history of agriculture.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "being"], answer: 0,
    explanation: "Ega — \"movement\" (birlik); \"of crops between continents\" — oradagi izoh.",
  }],
  ["t3-rw1-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Charles Babbage, often called the grandfather of the modern computer, never completed his Analytical Engine during his lifetime. Still, the design features he described in his notes—such as a memory unit that could store numbers for later use—______ a remarkably early vision of programmable machines.",
    prompt: STEM.conventions,
    choices: ["reveal", "reveals", "has revealed", "revealing"], answer: 0,
    explanation: "Ega — \"features\" (ko'plik); tire ichidagi izoh fe'lga ta'sir qilmaydi: \"features ... reveal\".",
  }],
  ["t3-rw1-21", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "In the eighteenth century, European tea merchants competed fiercely to import ______ the wealthy families who could afford them, the delicate leaves had become a symbol of refinement.",
    prompt: STEM.conventions,
    choices: ["tea. For", "tea for", "tea, which for", "tea, for"], answer: 0,
    explanation: "\"For the wealthy families ..., the leaves had become a symbol\" — alohida mustaqil gap, nuqta bilan boshlanadi.",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t3-rw1-22", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "It is easy to assume that the animated films <i>Paper Lanterns</i> and <i>Rooftop Garden</i> share the same goal—to entertain young children—since both feature talking animals and bright colors. ______ <i>Rooftop Garden</i> devotes as much attention to teaching viewers about urban ecology as it does to making them laugh.",
    prompt: STEM.transition,
    choices: ["In reality,", "Likewise,", "Next,", "In other words,"], answer: 0,
    explanation: "Oldingi taxmin (ikkalasining maqsadi bir xil) rad etiladi — \"In reality\".",
  }],
  ["t3-rw1-23", {
    domain: EOI, skill: "Transitions", difficulty: "H",
    passage: "Mary Shelley's 1818 novel <i>Frankenstein</i>, in which a scientist creates a living being from lifeless matter, deeply influenced later fiction and even everyday speech: the name \"Frankenstein\" is now used to describe any creation that turns against its maker. ______ the novel also helped establish an enduring literary question: what responsibilities creators have toward the beings they bring into existence.",
    prompt: STEM.transition,
    choices: [
      "Beyond lending a name to the language,",
      "Despite its influence on later fiction,",
      "Ultimately limited in its lasting impact,",
      "By achieving such a modest goal,",
    ], answer: 0,
    explanation: "Oldin tilga ta'siri aytilgan; keyingi gap undan tashqari yana bir ta'sirni qo'shadi — \"Beyond lending a name to the language\".",
  }],
  ["t3-rw1-24", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "<i>The Moonstone</i> (1868) is a detective novel by English author Wilkie Collins.",
      "Multiperspective novels tell a story through the accounts of several different narrators.",
      "Each narrator usually knows only part of the story.",
      "<i>The Moonstone</i> is told by several different narrators.",
      "The narrators include a family servant, a lawyer, and a detective.",
    ]),
    prompt: "The student wants to define the term \"multiperspective novel.\" " + STEM.notes,
    choices: [
      "A multiperspective novel tells a story through the accounts of several different narrators, each of whom usually knows only part of the story.",
      "Wilkie Collins's novel <i>The Moonstone</i> was published in 1868 and is told by several different narrators.",
      "Told by several narrators, including a family servant, a lawyer, and a detective, <i>The Moonstone</i> is a multiperspective novel.",
      "Published in 1868, <i>The Moonstone</i> is a detective novel by English author Wilkie Collins.",
    ], answer: 0,
    explanation: "Atamani ta'riflash kerak — faqat birinchi variant umumiy ta'rif beradi.",
  }],
  ["t3-rw1-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The tallest mountain in Japan is Mount Fuji.",
      "Mount Fuji is a volcano.",
      "The tallest mountain in Tanzania is Mount Kilimanjaro.",
      "Mount Kilimanjaro is a volcano.",
      "The tallest mountain in Nepal is Mount Everest, which is not a volcano.",
    ]),
    prompt: "The student wants to make a generalization about countries' tallest mountains. " + STEM.notes,
    choices: [
      "A country's tallest mountain is sometimes, but not always, a volcano.",
      "Mount Fuji and Mount Kilimanjaro are both volcanoes.",
      "Mount Everest, not Mount Fuji, is the tallest mountain in Nepal.",
      "The tallest mountain in Japan is Mount Fuji, while the tallest mountain in Tanzania is Mount Kilimanjaro.",
    ], answer: 0,
    explanation: "Umumlashma (generalization) aniq misollardan umumiy xulosa chiqaradi — faqat birinchi variant shunday.",
  }],
  ["t3-rw1-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "The Pritzker Architecture Prize is awarded each year by the Hyatt Foundation.",
      "It honors a living architect whose work has made \"significant contributions to humanity.\"",
      "The prize is named after Jay A. Pritzker, an American businessman who founded the Hyatt Foundation.",
      "Japanese architect Shigeru Ban won the prize in 2014.",
    ]),
    prompt: "The student wants to explain whom the prize is named for and identify one recipient of it. " + STEM.notes,
    choices: [
      "The Pritzker Architecture Prize, named for businessman Jay A. Pritzker, was awarded to Japanese architect Shigeru Ban in 2014.",
      "In 2014, Shigeru Ban won the Pritzker Architecture Prize, which honors \"significant contributions to humanity.\"",
      "The Pritzker Architecture Prize is awarded each year by the Hyatt Foundation.",
      "It was in 2014 that Japanese architect Shigeru Ban won the Pritzker Architecture Prize.",
    ], answer: 0,
    explanation: "Ikki narsa kerak: kim sharafiga nomlangan (Jay A. Pritzker) va bitta sovrindor (Shigeru Ban).",
  }],
  ["t3-rw1-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Some scientists have proposed using space elevators to carry cargo from Earth's surface into orbit.",
      "A space elevator would consist of a cable stretching from the ground to a station about 36,000 kilometers above Earth.",
      "To support its own weight, the cable would need a strength-to-weight ratio far greater than that of steel.",
      "Carbon nanotubes might have such a ratio.",
      "No one has yet produced carbon nanotubes long enough to build such a cable.",
    ]),
    prompt: "The student wants to acknowledge a complication affecting the construction of space elevators. " + STEM.notes,
    choices: [
      "A space elevator's cable would need to be far stronger for its weight than steel; carbon nanotubes might be strong enough, but none have yet been produced at the necessary length.",
      "Some scientists have proposed space elevators, which would carry cargo from Earth's surface to a station about 36,000 kilometers above Earth.",
      "A space elevator would consist of a cable and a station, making it possible to carry cargo into orbit.",
      "Carbon nanotubes might have a greater strength-to-weight ratio than steel, which is why scientists have proposed building space elevators.",
    ], answer: 0,
    explanation: "Murakkablik — kerakli uzunlikdagi nanotrubkalar hali ishlab chiqarilmagan. Faqat birinchi variant buni aytadi.",
  }],
]);
