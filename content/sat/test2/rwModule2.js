// Practice Test 2 — Reading and Writing, Module 2 (oson / qiyin).
import { buildModule, STEM, table, notes } from "../helpers.js";

const CS = "craft-structure";
const II = "info-ideas";
const SEC = "conventions";
const EOI = "expression";

export const t2RwModule2Easy = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t2-rw2e-01", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "After the storm, volunteers worked for weeks to ______ the damaged park, replanting trees and repairing benches.",
    prompt: STEM.wic,
    choices: ["restore", "abandon", "measure", "advertise"], answer: 0,
    explanation: "Daraxt ekish va o'rindiqlarni tuzatish — bog'ni tiklash (\"restore\").",
  }],
  ["t2-rw2e-02", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "The teacher was ______ with her students, answering their questions calmly even when the same question was asked several times.",
    prompt: STEM.wic,
    choices: ["patient", "careless", "strict", "silent"], answer: 0,
    explanation: "Bir xil savolga ham xotirjam javob berish — sabrli (\"patient\").",
  }],
  ["t2-rw2e-03", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Because the museum's collection is so ______, visitors can see everything from ancient pottery to modern sculpture.",
    prompt: STEM.wic,
    choices: ["diverse", "limited", "fragile", "recent"], answer: 0,
    explanation: "Qadimiy kulolchilikdan zamonaviy haykalgacha — xilma-xil (\"diverse\").",
  }],
  ["t2-rw2e-04", {
    domain: CS, skill: "Words in Context", difficulty: "M",
    passage: "The scientist's early results were ______, so she repeated the experiment several times before publishing her conclusions.",
    prompt: STEM.wic,
    choices: ["preliminary", "final", "famous", "obvious"], answer: 0,
    explanation: "Tajribani qayta takrorlash kerak bo'lgan natijalar — dastlabki (\"preliminary\").",
  }],
  ["t2-rw2e-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "E",
    passage: "Many people think of bats as blind. <u>In fact, all bat species can see, and some fruit bats have excellent vision.</u> Many bats also use echolocation, producing sounds and listening for the echoes to locate objects in the dark.",
    prompt: STEM.underlined,
    choices: [
      "It corrects a common misconception.",
      "It explains how echolocation works.",
      "It describes where bats live.",
      "It questions whether bats use echolocation.",
    ], answer: 0,
    explanation: "Birinchi gapdagi keng tarqalgan xato fikrni (ko'rshapalaklar ko'r) tuzatadi.",
  }],
  ["t2-rw2e-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "The city of Venice, Italy, is built on more than 100 small islands in a lagoon. Instead of streets, many parts of the city are connected by canals, and people often travel by boat. More than 400 bridges link the islands together.",
    prompt: STEM.purpose,
    choices: [
      "To describe distinctive features of Venice's layout",
      "To explain why Venice was founded",
      "To argue that Venice should build more bridges",
      "To compare Venice with other Italian cities",
    ], answer: 0,
    explanation: "Matn orollar, kanallar va ko'priklarni — shaharning o'ziga xos tuzilishini tasvirlaydi.",
  }],
  ["t2-rw2e-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nSome popular diet guides recommend that people avoid fats in their diets as much as possible.\n\n<b>Text 2</b>\nResearch has shown that not all fats are harmful. Unsaturated fats, found in foods such as nuts, olive oil, and fish, can support heart health when eaten in moderation.",
    prompt: "Based on the texts, how would the author of Text 2 most likely respond to the recommendation in Text 1?",
    choices: [
      "By arguing that the recommendation is too broad because some fats can be beneficial",
      "By agreeing that people should avoid all fats",
      "By claiming that people should eat as much fat as possible",
      "By suggesting that nuts and fish are unhealthy foods",
    ], answer: 0,
    explanation: "2-matn ba'zi yog'lar foydali ekanini aytadi — barcha yog'lardan qochish tavsiyasi haddan tashqari umumiy.",
  }],

  // ---------------- Information and Ideas ----------------
  ["t2-rw2e-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "Many people believe that goldfish have a memory span of only a few seconds. However, experiments have shown that goldfish can be trained to respond to sounds and colors, and even to push levers for food, and that they can remember these tasks for months.",
    prompt: STEM.mainIdea,
    choices: [
      "Goldfish have better memories than many people believe.",
      "Goldfish can remember things for only a few seconds.",
      "Goldfish prefer certain colors to others.",
      "Most people keep goldfish as pets.",
    ], answer: 0,
    explanation: "Tajribalar keng tarqalgan fikrni rad etadi: oltin baliqlar oylab eslab qoladi.",
  }],
  ["t2-rw2e-09", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "When the town of Millbrook opened its first public library in 1905, the library contained only 300 books, most of them donated by residents. Today it holds more than 50,000 books and also lends e-books and audiobooks.",
    prompt: "According to the text, where did most of the library's original books come from?",
    choices: [
      "They were donated by residents.",
      "They were bought from another library.",
      "They were written by local authors.",
      "They were e-books and audiobooks.",
    ], answer: 0,
    explanation: "Matnda aytilgan: dastlabki kitoblarning ko'pini aholi sovg'a qilgan.",
  }],
  ["t2-rw2e-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "E",
    passage: table("Visitors to Lakeview Park", ["Season", "Visitors"], [["Spring", "12,400"], ["Summer", "25,800"], ["Fall", "9,600"], ["Winter", "3,100"]]) +
      "The park manager noted that the park was most popular in summer: ______",
    prompt: STEM.table,
    choices: [
      "about 25,800 people visited in summer, more than in any other season.",
      "about 12,400 people visited in spring.",
      "fewer people visited in winter than in fall.",
      "about 9,600 people visited in fall.",
    ], answer: 0,
    explanation: "Yozda eng ko'p tashrif bo'lganini ko'rsatish uchun yozgi raqamni boshqa fasllar bilan solishtirish kerak.",
  }],
  ["t2-rw2e-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "A researcher claims that reading aloud to young children helps them develop larger vocabularies.",
    prompt: "Which finding, if true, would most directly support the researcher's claim?",
    choices: [
      "By age five, children whose parents read aloud to them daily knew more words than children whose parents rarely read to them.",
      "Many parents prefer reading picture books to their children.",
      "Children enjoy stories with animal characters.",
      "Most libraries offer story hours for young children.",
    ], answer: 0,
    explanation: "Da'vo ovoz chiqarib o'qish va so'z boyligi haqida — shu ikkisini bog'laydigan yagona natija.",
  }],
  ["t2-rw2e-12", {
    domain: II, skill: "Inferences", difficulty: "E",
    passage: "A farmer noticed that the tomato plants on the sunny side of her field produced much more fruit than the plants on the shady side. The soil and the amount of water were the same on both sides. The farmer most likely concluded that ______",
    prompt: STEM.complete,
    choices: [
      "the amount of sunlight affected how much fruit the plants produced.",
      "the soil on the shady side was poorer.",
      "the plants on the sunny side received more water.",
      "tomato plants grow best in the shade.",
    ], answer: 0,
    explanation: "Tuproq va suv bir xil — yagona farq quyosh nuri. Demak hosilga quyosh ta'sir qilgan.",
  }],
  ["t2-rw2e-13", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "Researchers found that people who were given a small gift before completing a survey answered more of its questions than people who received no gift. Both groups received the same survey and the same instructions. This result suggests that ______",
    prompt: STEM.complete,
    choices: [
      "receiving a gift may make people more willing to complete a task.",
      "people dislike answering surveys.",
      "the survey questions were too difficult.",
      "people who receive gifts answer questions less carefully.",
    ], answer: 0,
    explanation: "Guruhlar orasidagi yagona farq — sovg'a; u ko'proq savolga javob berishga undagan.",
  }],
  ["t2-rw2e-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "M",
    passage: "Although the Sahara is now one of the driest places on Earth, it was not always so. Rock paintings found in the desert show giraffes, hippos, and people swimming, and scientists have found evidence of ancient lakes. Between roughly 11,000 and 5,000 years ago, the region was much wetter and covered in grasslands.",
    prompt: STEM.mainIdea,
    choices: [
      "The Sahara was once a much wetter region than it is today.",
      "The Sahara is the driest place on Earth.",
      "Giraffes and hippos still live in the Sahara.",
      "Rock paintings are common in deserts around the world.",
    ], answer: 0,
    explanation: "Barcha dalillar (rasmlar, ko'llar) Sahroi Kabir bir paytlar nam bo'lganini ko'rsatadi.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t2-rw2e-15", {
    domain: SEC, skill: "Boundaries", difficulty: "E",
    passage: "My grandmother grew up on a ______ she still wakes up before sunrise every morning.",
    prompt: STEM.conventions,
    choices: ["farm, and", "farm and,", "farm, and,", "farm"], answer: 0,
    explanation: "Ikki mustaqil gap vergul + \"and\" bilan bog'lanadi.",
  }],
  ["t2-rw2e-16", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Olympic swimmer ______ won a total of 28 Olympic medals during his career.",
    prompt: STEM.conventions,
    choices: ["Michael Phelps", "Michael Phelps,", "Michael, Phelps", "Michael Phelps;"], answer: 0,
    explanation: "\"Olympic swimmer Michael Phelps\" — ism unvonni aniqlaydi (restrictive), vergul qo'yilmaydi.",
  }],
  ["t2-rw2e-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "The recipe calls for three main ______ flour, sugar, and butter.",
    prompt: STEM.conventions,
    choices: ["ingredients:", "ingredients;", "ingredients, which", "ingredients are"], answer: 0,
    explanation: "Ikki nuqta \"three main ingredients\" ro'yxatini kiritadi.",
  }],
  ["t2-rw2e-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "Yesterday, the students ______ a field trip to the science museum.",
    prompt: STEM.conventions,
    choices: ["took", "take", "will take", "are taking"], answer: 0,
    explanation: "\"Yesterday\" — o'tgan zamon: \"took\".",
  }],
  ["t2-rw2e-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "E",
    passage: "The dog wagged ______ tail when its owner came home.",
    prompt: STEM.conventions,
    choices: ["its", "it's", "their", "its'"], answer: 0,
    explanation: "Egalik olmoshi — \"its\". \"it's\" = \"it is\".",
  }],
  ["t2-rw2e-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The list of required materials for the art class ______ posted on the school's website.",
    prompt: STEM.conventions,
    choices: ["is", "are", "were", "have been"], answer: 0,
    explanation: "Ega — \"list\" (birlik), \"materials\" emas.",
  }],
  ["t2-rw2e-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Walking into the kitchen, ______",
    prompt: STEM.conventions,
    choices: [
      "Marco smelled fresh bread baking in the oven.",
      "the smell of fresh bread greeted Marco.",
      "fresh bread was baking in the oven, and Marco smelled it.",
      "the oven was baking fresh bread that Marco smelled.",
    ], answer: 0,
    explanation: "Oshxonaga kirgan — Marco. U verguldan keyin darhol kelishi kerak (dangling modifier).",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t2-rw2e-22", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "Maya practiced the piano every day for a year. ______ she was able to play her favorite song without a single mistake.",
    prompt: STEM.transition,
    choices: ["As a result,", "However,", "For example,", "In contrast,"], answer: 0,
    explanation: "Xatosiz chalish — bir yillik mashqning natijasi.",
  }],
  ["t2-rw2e-23", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Penguins are birds. ______ unlike most birds, they cannot fly.",
    prompt: STEM.transition,
    choices: ["However,", "Therefore,", "For example,", "Similarly,"], answer: 0,
    explanation: "Qush bo'la turib ucha olmaslik — kutilganiga zid, \"However\".",
  }],
  ["t2-rw2e-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "The library offers many free services. ______ it provides computers with internet access, homework help for students, and language classes for adults.",
    prompt: STEM.transition,
    choices: ["For example,", "However,", "Instead,", "Therefore,"], answer: 0,
    explanation: "Ikkinchi gap bepul xizmatlarga misollar keltiradi.",
  }],
  ["t2-rw2e-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "E",
    passage: notes([
      "The Amazon River is in South America.",
      "It carries more water than any other river in the world.",
      "It flows through several countries, including Brazil and Peru.",
    ]),
    prompt: "The student wants to emphasize how much water the Amazon River carries. " + STEM.notes,
    choices: [
      "The Amazon River carries more water than any other river in the world.",
      "The Amazon River is in South America.",
      "The Amazon River flows through Brazil and Peru.",
      "The Amazon River flows through several countries.",
    ], answer: 0,
    explanation: "Maqsad — suv miqdori; faqat birinchi variant bu haqda.",
  }],
  ["t2-rw2e-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "Marie Curie was a physicist and chemist born in Poland in 1867.",
      "She won the Nobel Prize in Physics in 1903.",
      "She won the Nobel Prize in Chemistry in 1911.",
      "She was the first person to win Nobel Prizes in two different sciences.",
    ]),
    prompt: "The student wants to emphasize an achievement unique to Curie. " + STEM.notes,
    choices: [
      "Marie Curie was the first person to win Nobel Prizes in two different sciences: physics (1903) and chemistry (1911).",
      "Marie Curie was a physicist and chemist born in Poland in 1867.",
      "Marie Curie won the Nobel Prize in Physics in 1903.",
      "Marie Curie studied both physics and chemistry.",
    ], answer: 0,
    explanation: "\"Unique\" — faqat unga tegishli yutuq: ikki xil fan bo'yicha birinchi Nobel.",
  }],
  ["t2-rw2e-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Two students tested paper airplane designs.",
      "Design A had wide wings.",
      "Design B had narrow wings.",
      "Design A flew an average of 8 meters.",
      "Design B flew an average of 12 meters.",
    ]),
    prompt: "The student wants to compare the results of the two designs. " + STEM.notes,
    choices: [
      "Design B, which had narrow wings, flew an average of 12 meters—4 meters farther than Design A, which had wide wings.",
      "Design A had wide wings, and Design B had narrow wings.",
      "Design B flew an average of 12 meters.",
      "Two students tested paper airplane designs with different wings.",
    ], answer: 0,
    explanation: "Natijalarni solishtirish uchun ikkala masofa va ular orasidagi farq kerak.",
  }],
]);

export const t2RwModule2Hard = buildModule([
  // ---------------- Craft and Structure ----------------
  ["t2-rw2h-01", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The committee's report was notably ______: rather than offering firm recommendations, it outlined several possible courses of action and declined to endorse any of them.",
    prompt: STEM.wic,
    choices: ["noncommittal", "emphatic", "inflammatory", "redundant"], answer: 0,
    explanation: "Aniq tavsiya bermay, hech bir variantni qo'llamaslik — \"noncommittal\" (qat'iy pozitsiya bildirmaydigan).",
  }],
  ["t2-rw2h-02", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "Critics who dismiss the novelist's descriptions as merely ornamental overlook how ______ those passages are to the plot: nearly every detail of setting she includes later proves essential to solving the mystery.",
    prompt: STEM.wic,
    choices: ["integral", "incidental", "antithetical", "superfluous"], answer: 0,
    explanation: "Har bir detal sirni yechishda muhim — syujetning ajralmas qismi (\"integral\").",
  }],
  ["t2-rw2h-03", {
    domain: CS, skill: "Words in Context", difficulty: "E",
    passage: "Although the manuscript had been damaged by water, conservators were able to ______ most of its text using ultraviolet imaging.",
    prompt: STEM.wic,
    choices: ["recover", "obscure", "translate", "abridge"], answer: 0,
    explanation: "Shikastlanganiga qaramay matnni qayta tiklash — \"recover\".",
  }],
  ["t2-rw2h-04", {
    domain: CS, skill: "Words in Context", difficulty: "H",
    passage: "The historian's account is ______: it draws on letters, tax records, and court documents to reconstruct village life in remarkable detail, yet it largely ignores the perspectives of the women who appear throughout those sources.",
    prompt: STEM.wic,
    choices: ["meticulous but incomplete", "careless and biased", "brief but balanced", "speculative and vague"], answer: 0,
    explanation: "Juda batafsil (meticulous), lekin ayollar nuqtai nazarini e'tiborsiz qoldiradi (incomplete).",
  }],
  ["t2-rw2h-05", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "H",
    passage: "Economists have long debated why some regions grow wealthy while others do not. Some emphasize geography, such as access to navigable rivers or a temperate climate. Others emphasize institutions, such as secure property rights and independent courts. <u>Economist Tariq Mansour argues that this debate presents a false choice, since geography often shaped which institutions developed in the first place.</u>",
    prompt: STEM.underlined,
    choices: [
      "It presents a view that challenges the way the debate described earlier is framed.",
      "It offers evidence supporting the view that geography matters more than institutions.",
      "It summarizes the two positions described earlier.",
      "It explains how courts protect property rights.",
    ], answer: 0,
    explanation: "Mansour ikki tomonni qarama-qarshi qo'yishning o'zini (\"false choice\") shubha ostiga oladi.",
  }],
  ["t2-rw2h-06", {
    domain: CS, skill: "Text Structure and Purpose", difficulty: "M",
    passage: "In 1928, Alexander Fleming noticed that mold contaminating one of his bacterial cultures had killed the surrounding bacteria. He identified the substance produced by the mold, which he named penicillin, but he was unable to produce it in large quantities. More than a decade later, a team at Oxford University developed methods to purify and mass-produce penicillin, making it widely available as a medicine.",
    prompt: STEM.structure,
    choices: [
      "It describes an initial discovery and then explains how a later development made that discovery practically useful.",
      "It compares two competing explanations for the same discovery.",
      "It argues that Fleming deserves less credit than the Oxford team.",
      "It lists several medicines developed at Oxford University.",
    ], answer: 0,
    explanation: "Tuzilma: dastlabki kashfiyot → keyingi rivojlanish uni amalda foydali qildi.",
  }],
  ["t2-rw2h-07", {
    domain: CS, skill: "Cross-Text Connections", difficulty: "H",
    passage: "<b>Text 1</b>\nMany ecologists have argued that reintroducing wolves to Yellowstone National Park in 1995 set off a \"trophic cascade\": by preying on elk and changing where elk grazed, wolves allowed willows and aspens along streams to recover.\n\n<b>Text 2</b>\nEcologist Priya Raman acknowledges that willows have recovered in parts of Yellowstone, but she notes that the recovery has been uneven and that other factors, such as a growing bear population and changes in stream levels, also affected elk numbers and plant growth. Wolves, she argues, are only one part of a more complicated story.",
    prompt: "Based on the texts, how would Raman (Text 2) most likely respond to the ecologists' claim in Text 1?",
    choices: [
      "By suggesting that it overstates the role of wolves in the recovery of the plants",
      "By rejecting the idea that willows have recovered anywhere in Yellowstone",
      "By arguing that bears were reintroduced to Yellowstone in 1995",
      "By agreeing that wolves were the only cause of the plants' recovery",
    ], answer: 0,
    explanation: "Raman tiklanishni tan oladi, lekin boshqa omillarni ham ko'rsatadi — bo'rilarning rolini oshirib yuborilgan deb hisoblaydi.",
  }],

  // ---------------- Information and Ideas ----------------
  ["t2-rw2h-08", {
    domain: II, skill: "Central Ideas and Details", difficulty: "H",
    passage: "Although the printing press is often credited with rapidly spreading literacy across Europe, historian Ana Duarte cautions that its effects were gradual and uneven. For decades after its introduction, printed books remained expensive, and in many rural areas literacy rates barely changed. Duarte argues that the press created the conditions for mass literacy but that schools, cheaper paper, and changing economic needs were required before those conditions were realized.",
    prompt: STEM.mainIdea,
    choices: [
      "Duarte contends that the printing press contributed to mass literacy only in combination with other developments over time.",
      "Duarte argues that the printing press had no effect on literacy in Europe.",
      "Duarte claims that literacy spread rapidly in rural areas after the press was introduced.",
      "Duarte believes that schools were more important than books for spreading literacy.",
    ], answer: 0,
    explanation: "Asosiy fikr: bosmaxona shart-sharoit yaratgan, lekin ommaviy savodxonlik boshqa omillar bilan birga asta-sekin kelgan.",
  }],
  ["t2-rw2h-09", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "A biologist hypothesizes that a species of lizard changes color primarily to regulate its body temperature rather than to communicate with other lizards.",
    prompt: "Which finding, if true, would most directly support the biologist's hypothesis?",
    choices: [
      "The lizards turned darker in cool temperatures and lighter in warm temperatures, even when no other lizards were present.",
      "The lizards changed color more often during the breeding season.",
      "Male lizards were more brightly colored than female lizards.",
      "The lizards changed color when they encountered rival lizards.",
    ], answer: 0,
    explanation: "Boshqa kaltakesaklar yo'qligida ham rang haroratga qarab o'zgargan — aloqa emas, harorat sabab.",
  }],
  ["t2-rw2h-10", {
    domain: II, skill: "Command of Evidence (Quantitative)", difficulty: "H",
    passage: table("Percentage of Seeds That Germinated", ["Temperature", "Species X", "Species Y"], [["10°C", "20%", "65%"], ["20°C", "70%", "70%"], ["30°C", "85%", "40%"]]) +
      "A botanist claims that Species Y is better suited than Species X to cool conditions. ______",
    prompt: STEM.table,
    choices: [
      "At 10°C, 65% of Species Y seeds germinated, compared with only 20% of Species X seeds.",
      "At 20°C, the two species germinated at the same rate.",
      "At 30°C, 85% of Species X seeds germinated.",
      "Species X germinated at a higher rate at 30°C than at 10°C.",
    ], answer: 0,
    explanation: "Da'vo sovuq sharoit haqida — eng past haroratda (10°C) Y ancha yaxshi unib chiqqan.",
  }],
  ["t2-rw2h-11", {
    domain: II, skill: "Command of Evidence (Textual)", difficulty: "M",
    passage: "In the novel <i>The Quiet Orchard</i>, the narrator describes Tomas as someone who values practicality over appearance.",
    prompt: "Which quotation from the novel most effectively illustrates the claim?",
    choices: [
      "\"Tomas wore the same patched coat for a decade, insisting that a coat's only job was to keep out the cold.\"",
      "\"Tomas spent every autumn harvesting apples with his brothers.\"",
      "\"Tomas was the tallest man in the village and the quietest.\"",
      "\"Tomas admired the elegant clothes worn by visitors from the city.\"",
    ], answer: 0,
    explanation: "Yamoq palto va \"faqat sovuqdan saqlasa bo'ldi\" — ko'rinishdan ko'ra amaliylikni afzal ko'rish.",
  }],
  ["t2-rw2h-12", {
    domain: II, skill: "Inferences", difficulty: "H",
    passage: "In a study of bird migration, researchers kept birds of a migratory species in cages where they could not see the sky or the surrounding landscape. During the season when the species normally migrates, the caged birds became restless and repeatedly faced the direction in which the species usually travels. Because the birds had no visual cues, the researchers concluded that the birds ______",
    prompt: STEM.complete,
    choices: [
      "likely rely on a cue other than sight to sense direction.",
      "had forgotten the direction of their usual migration route.",
      "were unable to sense the season of the year.",
      "learned their migration route by watching other birds.",
    ], answer: 0,
    explanation: "Ko'rish imkoni yo'q, ammo to'g'ri yo'nalishga qaragan — demak ko'rishdan boshqa signal ishlatiladi.",
  }],
  ["t2-rw2h-13", {
    domain: II, skill: "Inferences", difficulty: "M",
    passage: "A company tested two versions of its website. Version A displayed prices that included shipping costs; Version B displayed lower prices without shipping and added the shipping cost at checkout. More visitors added items to their carts on Version B, but a larger share of Version B visitors abandoned their carts at checkout. These results suggest that ______",
    prompt: STEM.complete,
    choices: [
      "showing lower initial prices may attract interest but can lead customers to cancel purchases once they see the full cost.",
      "customers prefer websites that do not charge for shipping.",
      "Version A attracted more visitors than Version B did.",
      "shipping costs have no effect on whether customers complete purchases.",
    ], answer: 0,
    explanation: "B ko'proq qiziqish uyg'otgan, lekin to'liq narx ko'ringanda ko'p xarid bekor qilingan.",
  }],
  ["t2-rw2h-14", {
    domain: II, skill: "Central Ideas and Details", difficulty: "E",
    passage: "The Eiffel Tower was built for the 1889 World's Fair in Paris. Many artists and writers of the time criticized the tower, calling it ugly. Today, however, it is one of the most recognizable and beloved landmarks in the world.",
    prompt: STEM.mainIdea,
    choices: [
      "The Eiffel Tower, once widely criticized, is now greatly admired.",
      "The Eiffel Tower was built for the 1889 World's Fair.",
      "Artists and writers designed the Eiffel Tower.",
      "Most landmarks are criticized when they are first built.",
    ], answer: 0,
    explanation: "Matn tanqiddan hozirgi mashhurlikkacha bo'lgan o'zgarishni ko'rsatadi.",
  }],

  // ---------------- Standard English Conventions ----------------
  ["t2-rw2h-15", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Researchers asked each participant a simple ______ which of two images appeared brighter?",
    prompt: STEM.conventions,
    choices: ["question:", "question;", "question,", "question"], answer: 0,
    explanation: "Ikki nuqta \"a simple question\" ning o'zini kiritadi. Nuqtali verguldan keyin to'liq gap kerak edi.",
  }],
  ["t2-rw2h-16", {
    domain: SEC, skill: "Boundaries", difficulty: "H",
    passage: "Octavia Butler's novel <i>Kindred</i>______ in 1979, follows a Black woman who is repeatedly transported from 1970s California to a plantation in pre–Civil War Maryland.",
    prompt: STEM.conventions,
    choices: [", published", " published", ", which published", "; published"], answer: 0,
    explanation: "\"published in 1979\" — izoh; u ikki tomondan vergul bilan ajratiladi.",
  }],
  ["t2-rw2h-17", {
    domain: SEC, skill: "Boundaries", difficulty: "M",
    passage: "Some species of bamboo can grow nearly a meter in a single ______ a rate that places them among the fastest-growing plants on Earth.",
    prompt: STEM.conventions,
    choices: ["day,", "day;", "day, this is", "day"], answer: 0,
    explanation: "\"a rate that ...\" — to'liq gap emas, oldingi fikrga izoh; vergul bilan qo'shiladi.",
  }],
  ["t2-rw2h-18", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "Neither the manager nor the employees ______ aware that the meeting had been rescheduled.",
    prompt: STEM.conventions,
    choices: ["were", "was", "is", "has been"], answer: 0,
    explanation: "\"neither ... nor\" da fe'l yaqinroq egaga (employees — ko'plik) moslashadi.",
  }],
  ["t2-rw2h-19", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "The findings from the two studies, which were conducted more than a decade apart, ______ remarkably similar.",
    prompt: STEM.conventions,
    choices: ["are", "is", "was", "has been"], answer: 0,
    explanation: "Ega — \"findings\" (ko'plik); oradagi izoh fe'lga ta'sir qilmaydi.",
  }],
  ["t2-rw2h-20", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "M",
    passage: "The two ______ findings were published in the same issue of the journal.",
    prompt: STEM.conventions,
    choices: ["scientists'", "scientist's", "scientists", "scientists's"], answer: 0,
    explanation: "Ikki olimga tegishli natijalar — ko'plik egalik shakli \"scientists'\".",
  }],
  ["t2-rw2h-21", {
    domain: SEC, skill: "Form, Structure, and Sense", difficulty: "H",
    passage: "Having been restored after decades of neglect, ______",
    prompt: STEM.conventions,
    choices: [
      "the theater reopened to the public with a sold-out performance.",
      "the public flocked to the theater's sold-out reopening performance.",
      "a sold-out performance marked the theater's reopening.",
      "the city celebrated as the theater reopened.",
    ], answer: 0,
    explanation: "Qayta tiklangan — teatr. U verguldan keyin darhol kelishi kerak.",
  }],

  // ---------------- Expression of Ideas ----------------
  ["t2-rw2h-22", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Early electronic computers filled entire rooms and required teams of specialists to operate. ______ today's smartphones, which fit in a pocket, are far more powerful than those early machines.",
    prompt: STEM.transition,
    choices: ["By comparison,", "Consequently,", "Similarly,", "For instance,"], answer: 0,
    explanation: "Eski va zamonaviy qurilmalar solishtirilmoqda — \"By comparison\".",
  }],
  ["t2-rw2h-23", {
    domain: EOI, skill: "Transitions", difficulty: "E",
    passage: "The study's sample was small, consisting of only forty participants. ______ its results should be confirmed by larger studies before any firm conclusions are drawn.",
    prompt: STEM.transition,
    choices: ["Thus,", "Nonetheless,", "Likewise,", "Specifically,"], answer: 0,
    explanation: "Kichik tanlanma sababli natijalarni tasdiqlash kerak — natija bog'lovchisi.",
  }],
  ["t2-rw2h-24", {
    domain: EOI, skill: "Transitions", difficulty: "M",
    passage: "Many people assume that tomatoes have always been central to Italian cooking. ______ tomatoes, which are native to the Americas, did not become common in Italian cuisine until long after they arrived in Europe in the 1500s.",
    prompt: STEM.transition,
    choices: ["In reality,", "Accordingly,", "Similarly,", "For this reason,"], answer: 0,
    explanation: "Keng tarqalgan taxmin rad etilib, haqiqiy holat aytiladi — \"In reality\".",
  }],
  ["t2-rw2h-25", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "The Svalbard Global Seed Vault is located on a Norwegian island in the Arctic.",
      "It stores seeds of food crops from around the world.",
      "It was built to protect crop diversity in case of disasters.",
      "It can hold up to 4.5 million seed samples.",
      "The surrounding permafrost helps keep the seeds cold even if the power fails.",
    ]),
    prompt: "The student wants to explain why the vault's location is advantageous. " + STEM.notes,
    choices: [
      "Because it is located in the Arctic, the Svalbard Global Seed Vault is surrounded by permafrost that helps keep its seeds cold even if the power fails.",
      "The Svalbard Global Seed Vault can hold up to 4.5 million seed samples.",
      "The Svalbard Global Seed Vault stores seeds of food crops from around the world.",
      "The Svalbard Global Seed Vault was built to protect crop diversity in case of disasters.",
    ], answer: 0,
    explanation: "Joylashuvning afzalligi — abadiy muzlik urug'larni sovuq saqlashi.",
  }],
  ["t2-rw2h-26", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "M",
    passage: notes([
      "A solar eclipse occurs when the Moon passes between Earth and the Sun.",
      "A lunar eclipse occurs when Earth passes between the Sun and the Moon.",
      "A total solar eclipse can be seen only from a narrow path on Earth's surface.",
      "A total lunar eclipse can be seen from anywhere on the night side of Earth.",
    ]),
    prompt: "The student wants to contrast where the two types of total eclipses can be seen. " + STEM.notes,
    choices: [
      "While a total solar eclipse can be seen only from a narrow path on Earth's surface, a total lunar eclipse can be seen from anywhere on Earth's night side.",
      "A solar eclipse occurs when the Moon passes between Earth and the Sun.",
      "Both solar and lunar eclipses involve Earth, the Moon, and the Sun.",
      "A lunar eclipse occurs when Earth passes between the Sun and the Moon.",
    ], answer: 0,
    explanation: "Qayerdan ko'rinishini solishtirish kerak: tor yo'lak va tunda butun yarim shar.",
  }],
  ["t2-rw2h-27", {
    domain: EOI, skill: "Rhetorical Synthesis", difficulty: "H",
    passage: notes([
      "Researchers studied two groups of commuters for six months.",
      "Group 1 drove to work.",
      "Group 2 cycled to work.",
      "Group 2 reported lower stress levels than Group 1.",
      "Group 2 also took fewer sick days than Group 1.",
    ]),
    prompt: "The student wants to present the study's findings as evidence for the benefits of cycling to work. " + STEM.notes,
    choices: [
      "In a six-month study, commuters who cycled to work reported lower stress and took fewer sick days than those who drove, suggesting that cycling to work may have real benefits.",
      "Researchers studied two groups of commuters for six months.",
      "Group 2 cycled to work, while Group 1 drove.",
      "Group 2 reported lower stress levels than Group 1.",
    ], answer: 0,
    explanation: "Dalil sifatida taqdim etish uchun ikkala natija va ularning velosiped bilan bog'liqligi kerak.",
  }],
]);
