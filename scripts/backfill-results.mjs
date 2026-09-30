// ------------------------------------------------------------------
// Bir martalik migratsiya: server baholashga o'tishdan OLDIN saqlangan
// SAT natijalariga yangi maydonlarni qo'shadi:
//   results.{rw,math}.domains — Study Plan mavzu tahlili uchun
//   complete                  — reyting "birinchi to'liq urinish" qoidasi uchun
//
// Ishga tushirish (FIREBASE_SERVICE_ACCOUNT .env da bo'lishi kerak):
//   node --env-file=.env scripts/backfill-results.mjs          # faqat ko'rsatadi
//   node --env-file=.env scripts/backfill-results.mjs --write  # yozadi
// ------------------------------------------------------------------
import { adminDb } from "../server/firebaseAdmin.js";
import { getStaticSections, scoreSectionAttempt } from "../server/satScoring.js";

const WRITE = process.argv.includes("--write");
const db = adminDb();
const snap = await db.collection("results").get();
let changed = 0;
let batch = db.batch();
let inBatch = 0;

for (const d of snap.docs) {
  const r = d.data();
  if (r.sessionId || !r.results || r.complete !== undefined) continue;
  const test = getStaticSections(r.testId || "bluebook-1");
  if (!test) continue;
  const update = { complete: !r.terminated };
  for (const section of test.sections) {
    const sr = r.results[section.id];
    if (!sr || !Array.isArray(sr.module1Answers)) {
      update.complete = false;
      continue;
    }
    if (!Array.isArray(sr.module2Answers)) update.complete = false;
    const { domains } = scoreSectionAttempt(section, sr);
    update[`results.${section.id}.domains`] = domains;
  }
  changed++;
  console.log(d.id, update.complete ? "complete" : "incomplete");
  if (WRITE) {
    batch.update(d.ref, update);
    if (++inBatch === 400) {
      await batch.commit();
      batch = db.batch();
      inBatch = 0;
    }
  }
}
if (WRITE && inBatch) await batch.commit();
console.log(`${changed} ta natija ${WRITE ? "yangilandi" : "yangilanadi (--write bilan ishga tushiring)"}`);
