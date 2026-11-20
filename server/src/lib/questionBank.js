import { readFile, readdir } from "node:fs/promises";

// ------------------------------------------------------------------
// Admin savol banki (server/question-bank/*.json) — kun savollari va SAT Duel
// shu yerdan oladi. Faqat 4 variantli, rasmsiz savollar (telefonda ham
// tez o'qiladi, kalit bitta harf).
// ------------------------------------------------------------------

let bank = null;

export async function loadBank() {
  if (bank) return bank;
  const dir = new URL("../../question-bank/", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const all = [];
  for (const f of files) {
    const section = f.startsWith("math") ? "math" : "rw";
    const items = JSON.parse(await readFile(new URL(f, dir), "utf8"));
    for (const q of items) {
      if (!Array.isArray(q.choices) || q.choices.length !== 4 || !q.correctAnswer || q.image) continue;
      all.push({ ...q, section });
    }
  }
  bank = { math: all.filter((q) => q.section === "math"), rw: all.filter((q) => q.section === "rw") };
  return bank;
}
