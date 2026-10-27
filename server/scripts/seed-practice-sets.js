// ------------------------------------------------------------------
// Oylik SAT amaliyot to'plamlarini (content/practice-sets) bazaga yozadi.
//
//   node scripts/seed-practice-sets.js          # faqat ko'rsatadi
//   node scripts/seed-practice-sets.js --write  # yozadi (serverda:
//     docker compose exec api node scripts/seed-practice-sets.js --write)
//
// To'plam id'lari barqaror (sat-2026-03, ...) — qayta ishga tushirish
// dublikat yaratmaydi, faqat shu to'plamlarni yangilaydi. Question bank
// savollari seed'li aralashtirish bilan tanlanadi, shuning uchun natija
// har safar bir xil va oylar orasida takrorlanmaydi.
// ------------------------------------------------------------------
import { readFile } from "node:fs/promises";
import { PRACTICE_SETS, BANK_QUOTA } from "../../content/practice-sets/index.js";

const WRITE = process.argv.includes("--write");

// mulberry32 — kichik deterministik PRNG
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(arr, rand) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const bank = {};
for (const [subject, quota] of Object.entries(BANK_QUOTA)) {
  for (const domain of Object.keys(quota)) {
    const url = new URL(`../question-bank/${subject}-${domain}.json`, import.meta.url);
    bank[`${subject}-${domain}`] = shuffled(JSON.parse(await readFile(url, "utf8")), rng(2026 + domain.length * 31));
  }
}

const used = new Set();
function pickBank(setId, subject) {
  const out = [];
  for (const [domain, count] of Object.entries(BANK_QUOTA[subject])) {
    const pool = bank[`${subject}-${domain}`];
    // Har bir domendan oson/o'rta/qiyin aralash bo'lsin
    const order = ["medium", "hard", "easy"];
    for (let k = 0; k < count; k++) {
      const want = order[k % order.length];
      const q = pool.find((x) => !used.has(x.sourceId) && x.difficulty === want) || pool.find((x) => !used.has(x.sourceId));
      if (!q) throw new Error(`${subject}-${domain}: bankda savol qolmadi`);
      used.add(q.sourceId);
      out.push({
        id: `${setId}-qb-${subject}-${out.length + 1}`,
        type: "mcq",
        passage: q.passage || "",
        prompt: q.prompt,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        image: null,
        domain: q.domain,
        skill: q.skill,
        difficulty: q.difficulty,
        sourceId: q.sourceId,
      });
    }
  }
  return out;
}

const sets = PRACTICE_SETS.map((s) => ({
  ...s,
  sections: [
    { id: "rw", title: "Reading and Writing", type: "rw", questions: [...s.rw, ...pickBank(s.id, "rw")] },
    { id: "math", title: "Math", type: "math", questions: [...s.math, ...pickBank(s.id, "math")] },
  ],
}));

for (const s of sets) {
  const [rw, math] = s.sections;
  console.log(`${s.id}  ${s.title}: RW ${rw.questions.length}, Math ${math.questions.length}`);
}

if (WRITE) {
  const { pool } = await import("../src/db/index.js");
  for (const s of sets) {
    // created_at = imtihon sanasi: ro'yxatda eng yangi oy tepada turadi.
    await pool.query(
      `INSERT INTO question_sets (id, data, created_at, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, created_at = EXCLUDED.created_at, updated_at = now()`,
      [
        s.id,
        {
          title: s.title,
          description: s.description,
          examDate: s.examDate,
          sections: s.sections,
          createdBy: "seed-practice-sets",
          createdByName: "PrepZone",
        },
        new Date(`${s.examDate}T12:00:00Z`),
      ]
    );
  }
  await pool.end();
  console.log(`${sets.length} ta to'plam bazaga yozildi`);
} else {
  console.log("(faqat ko'rsatildi — yozish uchun --write bilan ishga tushiring)");
}
