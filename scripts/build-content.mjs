// ------------------------------------------------------------------
// content/ dagi to'liq testlardan brauzer uchun KALITSIZ nusxa yaratadi:
//   src/data/generated/sat/{id}.json
//   src/data/generated/ielts/{id}.json
//   src/data/generated/catalog.json
// To'g'ri javoblar, qabul qilinadigan variantlar va tushuntirishlar faqat
// serverda (api/) qoladi. `npm run dev` va `npm run build` dan oldin
// avtomatik ishga tushadi (package.json -> predev / prebuild).
// ------------------------------------------------------------------
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { SAT_TESTS } from "../content/sat/index.js";
import { IELTS_TESTS } from "../content/ielts/index.js";

const OUT = new URL("../src/data/generated/", import.meta.url);

const SAT_SECRET = ["correctAnswer", "answers", "explanation"];
const IELTS_SECRET = ["accept", "answer"];

function omit(obj, keys) {
  const out = { ...obj };
  for (const k of keys) delete out[k];
  return out;
}

function publicSatTest(test) {
  const strip = (m) => ({ ...m, questions: m.questions.map((q) => omit(q, SAT_SECRET)) });
  return {
    ...test,
    groups: test.groups.map((g) => ({
      ...g,
      module1: strip(g.module1),
      module2Easy: strip(g.module2Easy),
      module2Hard: strip(g.module2Hard),
    })),
  };
}

function publicIeltsTest(test) {
  const stripParts = (parts) =>
    parts.map((p) => ({
      ...p,
      groups: p.groups.map((g) => ({ ...g, questions: g.questions.map((q) => omit(q, IELTS_SECRET)) })),
    }));
  return {
    ...test,
    listening: { ...test.listening, parts: stripParts(test.listening.parts) },
    reading: { ...test.reading, parts: stripParts(test.reading.parts) },
  };
}

function write(rel, data) {
  writeFileSync(new URL(rel, OUT), JSON.stringify(data));
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(new URL("sat/", OUT), { recursive: true });
mkdirSync(new URL("ielts/", OUT), { recursive: true });

for (const test of Object.values(SAT_TESTS)) write(`sat/${test.id}.json`, publicSatTest(test));
for (const test of IELTS_TESTS) write(`ielts/${test.id}.json`, publicIeltsTest(test));

write("catalog.json", {
  ielts: IELTS_TESTS.map(({ id, title, description }) => ({ id, title, description })),
});

// Himoya: kalit maydonlari tasodifan client nusxasiga tushib qolmasin.
const leaked = JSON.stringify([
  ...Object.values(SAT_TESTS).map(publicSatTest),
  ...IELTS_TESTS.map(publicIeltsTest),
]).match(/"(correctAnswer|answers|explanation|accept|answer)":/);
if (leaked) throw new Error(`Client nusxasida kalit maydoni qoldi: ${leaked[1]}`);

console.log(`content: ${Object.keys(SAT_TESTS).length} SAT, ${IELTS_TESTS.length} IELTS test yaratildi`);
