// ------------------------------------------------------------------
// Katta PDF'ni AI importi uchun tayyorlash: kichik bo'laklarga (har biri
// alohida PDF) ajratib, parallel yuborish va natijalarni birlashtirish.
// Bitta ulkan so'rov o'rniga ~10 ta kichik so'rov — 98 savollik test ~1,5 daqiqada.
// Brauzerga ham, Node'ga ham bog'liq emas (sinov skriptlari uchun).
// ------------------------------------------------------------------

export const PAGES_PER_CHUNK = 10;
export const CONCURRENCY = 5;
// Kalit ba'zan har modul uchun alohida sahifada (RW M1/M2, Math M1/M2).
const KEY_PAGES = 4;

function toBase64(bytes) {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

// bytes: ArrayBuffer | Uint8Array. Qaytaradi: { pageCount, chunks, keyPart }
//   chunks  — [{ index, firstPage, data(base64) }]
//   keyPart — oxirgi sahifalar (javoblar kaliti odatda shu yerda)
export async function splitPdf(bytes, { pagesPerChunk = PAGES_PER_CHUNK } = {}) {
  const { PDFDocument } = await import("pdf-lib");
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = src.getPageCount();

  const extract = async (from, to) => {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(src, Array.from({ length: to - from }, (_, i) => from + i));
    pages.forEach((p) => doc.addPage(p));
    return toBase64(await doc.save());
  };

  const chunks = [];
  for (let from = 0, index = 0; from < pageCount; from += pagesPerChunk, index++) {
    chunks.push({ index, firstPage: from + 1, data: await extract(from, Math.min(pageCount, from + pagesPerChunk)) });
  }
  const keyPart = pageCount > 1 ? await extract(Math.max(0, pageCount - KEY_PAGES), pageCount) : null;
  return { pageCount, chunks, keyPart };
}

// Vazifalarni `limit` tadan parallel bajaradi; har biri tugaganda onDone.
export async function runPool(items, limit, worker, onDone) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
      onDone?.(item);
    }
  });
  await Promise.all(lanes);
}

// Bluebook skrinshotlarida modul sarlavhasi bo'lmaydi, raqamlar esa har
// modulda 1 dan boshlanadi. Savollar sahifa tartibida kelgani uchun modulni
// raqamlar ketma-ketligidan aniqlaymiz: bo'lim ichida raqam kichraysa
// (…26, 27 -> 1) — yangi modul. AI sarlavhadan o'qigan modullar ishonchliroq;
// ular kamroq modul ko'rsatsa (masalan hammasi "1" yoki bo'sh) — almashtiriladi.
export function inferModules(list) {
  const inferred = new Map();
  const state = {};
  for (const q of list) {
    if (!q.number) continue;
    const s = (state[q.section || ""] ||= { module: 1, last: 0 });
    if (q.number < s.last) s.module += 1;
    s.last = q.number;
    inferred.set(q, String(s.module));
  }
  const bySection = {};
  for (const q of list) {
    const b = (bySection[q.section || ""] ||= { ai: new Set(), guess: new Set() });
    if (q.module) b.ai.add(q.module);
    if (inferred.has(q)) b.guess.add(inferred.get(q));
  }
  return list.map((q) => {
    const b = bySection[q.section || ""];
    if (!inferred.has(q) || b.guess.size <= b.ai.size) return q;
    return { ...q, module: inferred.get(q) };
  });
}

const slot = (x, withModule = true) => `${x.section || ""}|${withModule ? x.module || "" : ""}#${x.number}`;

// Bo'laklar chegarasida bir savol ikki marta chiqishi mumkin — bo'lim, modul
// va raqam (yoki savol boshi) bo'yicha takrorlar olib tashlanadi.
export function dedupeQuestions(list) {
  const seen = new Set();
  return list.filter((q) => {
    const key = q.number ? slot(q) : `${(q.prompt || "").slice(0, 80)}|${(q.passage || "").slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Javoblar kaliti AI o'zi yechgan javobdan ustun. Kalitda bitta ro'yxat
// (modulsiz) bo'lsa — faqat raqam bo'yicha moslanadi.
export function applyAnswerKey(questions, keys) {
  if (!keys?.length) return questions;
  const singleList = keys.every((k) => !k.module);
  const map = new Map(keys.map((k) => [slot(k, !singleList), k.answer]));
  return questions.map((q) => {
    if (!q.number) return q;
    const ans = map.get(slot(q, !singleList));
    if (!ans) return q;
    if (q.type === "spr") {
      return { ...q, answers: [ans, ...(q.answers || []).filter((a) => a !== ans)], issues: q.issues.filter((i) => !i.startsWith("Qabul")) };
    }
    const letter = ans.toUpperCase().match(/^[A-D]$/)?.[0];
    if (!letter) return q;
    const issues = q.issues.filter((i) => i !== "To'g'ri javob topilmadi" && !i.startsWith("AI ishonchi"));
    if (q.correctAnswer && q.correctAnswer !== letter) issues.push(`Kalit: ${letter}, AI yechimi: ${q.correctAnswer} — tekshiring`);
    return { ...q, correctAnswer: letter, fromKey: true, issues };
  });
}

// ---------------- Butun testni modullarga joylash ----------------
// questions: AI javobi (section, module, variant bilan). Qaytaradi:
//   { rw: { module1, module2Easy, module2Hard, module2Mixed }, math: {...}, unlabeled }
// Module 2 oson/qiyin deb aniq belgilangan va ikkalasi ham bo'lsa — adaptiv;
// aks holda (real testdan olingan bitta Module 2) — "Aralash" to'plam.
export function assignToModules(questions) {
  const out = {};
  let unlabeled = 0;
  for (const sec of ["rw", "math"]) {
    const list = questions.filter((q) => q.section === sec);
    const hasModules = list.some((q) => q.module);
    const m2 = list.filter((q) => q.module && q.module !== "1");
    const adaptive = m2.some((q) => q.variant === "easy") && m2.some((q) => q.variant === "hard");
    const box = { module1: [], module2Easy: [], module2Hard: [], module2Mixed: [] };
    for (const q of list) {
      if (!q.module) {
        if (hasModules) unlabeled += 1;
        box.module1.push(q);
      } else if (q.module === "1") box.module1.push(q);
      else if (adaptive && q.variant === "easy") box.module2Easy.push(q);
      else if (adaptive && q.variant === "hard") box.module2Hard.push(q);
      else box.module2Mixed.push(q);
    }
    // Savol raqami bo'yicha tartib (bo'laklar parallel kelgani uchun).
    for (const k of Object.keys(box)) box[k].sort((a, b) => (a.number || 999) - (b.number || 999));
    out[sec] = box;
  }
  return { ...out, unlabeled };
}
