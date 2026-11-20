// ------------------------------------------------------------------
// College Board va uning rasmiy hamkorlari (Khan Academy, Schoolhouse.world)
// beradigan bepul SAT manbalari. Faqat HAVOLALAR — savollar matni saytga
// ko'chirilmaydi (College Board materiallari mualliflik huquqi bilan
// himoyalangan). Havolalar 2026-11-20 da tekshirilgan (HTTP 200).
// Matnlar: i18n/messages/resources.js (kalit = id).
// ------------------------------------------------------------------

const CB = "https://satsuite.collegeboard.org";
const PDF = `${CB}/media/pdf`;

export const QUESTION_BANK_URL = "https://mypractice.collegeboard.org/questionbank/search";

// Bluebook'dagi to'liq adaptiv testlar.
export const BLUEBOOK = {
  app: "https://bluebook.collegeboard.org/students",
  tests: `${CB}/practice/practice-tests/bluebook`,
};

// Qog'oz (noadaptiv) practice testlar: test, baholash qo'llanmasi, javob izohlari.
export const PAPER_TESTS = [4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
  n,
  test: `${PDF}/sat-practice-test-${n}-digital.pdf`,
  scoring: `${PDF}/scoring-sat-practice-test-${n}-digital.pdf`,
  answers: `${PDF}/sat-practice-test-${n}-answers-digital.pdf`,
}));
export const PAPER_TESTS_PAGE = `${CB}/practice/practice-tests/paper`;

// SAT bo'limlari, domenlari va ko'nikmalari — College Board rasmiy nomlari
// (satsuite.collegeboard.org/practice/content-domains). share — testdagi
// taxminiy ulush (%). Qiyinlik: Easy / Medium / Hard.
export const SKILL_MAP = [
  {
    section: "rw",
    name: "Reading and Writing",
    guide: `${CB}/practice/student-question-bank/reading-writing`,
    domains: [
      { id: "info", name: "Information and Ideas", share: 26, skills: ["Central Ideas and Details", "Inferences", "Command of Evidence"] },
      { id: "craft", name: "Craft and Structure", share: 28, skills: ["Words in Context", "Text Structure and Purpose", "Cross-Text Connections"] },
      { id: "expression", name: "Expression of Ideas", share: 20, skills: ["Rhetorical Synthesis", "Transitions"] },
      { id: "conventions", name: "Standard English Conventions", share: 26, skills: ["Boundaries", "Form, Structure, and Sense"] },
    ],
  },
  {
    section: "math",
    name: "Math",
    guide: `${CB}/practice/student-question-bank/math`,
    domains: [
      {
        id: "algebra",
        name: "Algebra",
        share: 35,
        skills: [
          "Linear equations in one variable",
          "Linear functions",
          "Linear equations in two variables",
          "Systems of two linear equations in two variables",
          "Linear inequalities in one or two variables",
        ],
      },
      {
        id: "advanced",
        name: "Advanced Math",
        share: 35,
        skills: [
          "Nonlinear functions",
          "Nonlinear equations in one variable and systems of equations in two variables",
          "Equivalent expressions",
        ],
      },
      {
        id: "psda",
        name: "Problem-Solving and Data Analysis",
        share: 15,
        skills: [
          "Ratios, rates, proportional relationships, and units",
          "Percentages",
          "One-variable data: Distributions and measures of center and spread",
          "Two-variable data: Models and scatterplots",
          "Probability and conditional probability",
          "Inference from sample statistics and margin of error",
          "Evaluating statistical claims: Observational studies and experiments",
        ],
      },
      {
        id: "geometry",
        name: "Geometry and Trigonometry",
        share: 15,
        skills: ["Area and volume", "Lines, angles, and triangles", "Right triangles and trigonometry", "Circles"],
      },
    ],
  },
];

export const DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Boshqa bepul rasmiy manbalar. group — sahifadagi bo'lim; tone — ikonka rangi.
export const RESOURCES = [
  { id: "qotd", group: "daily", url: "https://qotd.collegeboard.org/", tone: "orange" },
  { id: "myPractice", group: "daily", url: "https://mypractice.collegeboard.org", tone: "blue" },
  { id: "readiness", group: "daily", url: `${CB}/practice/student-readiness-check`, tone: "green" },
  { id: "studyPlan", group: "daily", url: `${CB}/practice/build-your-study-plan`, tone: "purple" },
  { id: "khan", group: "learn", url: "https://www.khanacademy.org/test-prep/digital-sat", tone: "green" },
  { id: "khanGuide", group: "learn", url: `${CB}/practice/khan-academy`, tone: "gray" },
  { id: "schoolhouse", group: "learn", url: "https://schoolhouse.world/sat-bootcamp", tone: "blue" },
  { id: "domains", group: "guides", url: `${CB}/practice/content-domains`, tone: "blue" },
  { id: "qbTips", group: "guides", url: `${CB}/practice/student-question-bank/tips`, tone: "orange" },
  { id: "confidence", group: "guides", url: `${CB}/practice/practice-with-confidence`, tone: "purple" },
  { id: "myPractice101", group: "guides", url: `${CB}/practice/my-practice-101`, tone: "gray" },
  { id: "studentGuide", group: "guides", url: `${PDF}/sat-student-guide.pdf`, tone: "red" },
];
