// ------------------------------------------------------------------
// content/sat dagi to'liq testlardan brauzer uchun KALITSIZ nusxa yaratadi:
//   src/data/generated/sat/{id}.json
// To'g'ri javoblar, qabul qilinadigan variantlar va tushuntirishlar faqat
// serverda (server/src/lib/satScoring.js) qoladi. `npm run dev` va
// `npm run build` dan oldin avtomatik ishga tushadi (package.json ->
// predev / prebuild).
// ------------------------------------------------------------------
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { SAT_TESTS } from "../content/sat/index.js";

const OUT = new URL("../src/data/generated/", import.meta.url);

const SAT_SECRET = ["correctAnswer", "answers", "explanation"];

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

function write(rel, data) {
  writeFileSync(new URL(rel, OUT), JSON.stringify(data));
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(new URL("sat/", OUT), { recursive: true });

for (const test of Object.values(SAT_TESTS)) write(`sat/${test.id}.json`, publicSatTest(test));

// Himoya: kalit maydonlari tasodifan client nusxasiga tushib qolmasin.
const leaked = JSON.stringify(Object.values(SAT_TESTS).map(publicSatTest)).match(
  /"(correctAnswer|answers|explanation)":/
);
if (leaked) throw new Error(`Client nusxasida kalit maydoni qoldi: ${leaked[1]}`);

console.log(`content: ${Object.keys(SAT_TESTS).length} ta SAT test yaratildi`);
