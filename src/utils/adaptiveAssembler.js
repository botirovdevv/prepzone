import { normalizeDifficulty } from "./bankQuestion.js";

// ------------------------------------------------------------------
// Adaptiv test yig'ish: admin bergan savollar pool'idan bo'limning uchta
// modulini (Module 1, Module 2 Oson, Module 2 Qiyin) tuzadi — haqiqiy
// Digital SAT'dagi kabi talaba Module 1 + bitta Module 2 ni yechadi
// (RW 27+27, Math 22+22 = 98 savol), lekin adaptivlik uchun Module 2 ning
// ikkala varianti kerak. Yetishmagan savollar savol bankidan (yoki AI'dan)
// to'ldiriladi. Yo'naltirish va ball — src/utils/irtScoring.js.
// ------------------------------------------------------------------

export const MODULE_SIZE = { rw: 27, math: 22 };

// Digital SAT'dagi taxminiy domen ulushlari (College Board spetsifikatsiyasi).
export const DOMAIN_SHARE = {
  rw: { "craft-structure": 0.28, "info-ideas": 0.26, conventions: 0.26, expression: 0.2 },
  math: { algebra: 0.35, "advanced-math": 0.35, "problem-solving-data": 0.15, "geometry-trig": 0.15 },
};

// Modul qiyinlik aralashmasi: Module 1 — teng; Oson Module 2 — asosan
// oson/o'rta; Qiyin Module 2 — asosan o'rta/qiyin.
export const DIFFICULTY_MIX = {
  module1: { easy: 1 / 3, medium: 1 / 3, hard: 1 / 3 },
  module2Easy: { easy: 0.45, medium: 0.4, hard: 0.15 },
  module2Hard: { easy: 0.1, medium: 0.4, hard: 0.5 },
};

const LEVELS = ["easy", "medium", "hard"];
const MODULES = ["module1", "module2Easy", "module2Hard"];

// Ulushlarni butun sonlarga (yig'indisi = total) — eng katta qoldiq usuli.
export function apportion(shares, total) {
  const keys = Object.keys(shares);
  const sum = keys.reduce((n, k) => n + shares[k], 0) || 1;
  const exact = keys.map((k) => [k, (shares[k] / sum) * total]);
  const out = Object.fromEntries(exact.map(([k, v]) => [k, Math.floor(v)]));
  let left = total - Object.values(out).reduce((a, b) => a + b, 0);
  for (const [k] of [...exact].sort((a, b) => (b[1] % 1) - (a[1] % 1))) {
    if (left-- <= 0) break;
    out[k] += 1;
  }
  return out;
}

const level = (q) => normalizeDifficulty(q.difficulty);

// Modul holati: qiyinlik va domen bo'yicha qolgan "tanqislik".
function slotState(subject, mod, size) {
  return {
    size,
    items: [],
    diff: apportion(DIFFICULTY_MIX[mod], size),
    dom: apportion(DOMAIN_SHARE[subject], size),
  };
}

function place(state, q) {
  state.items.push(q);
  state.diff[level(q)] -= 1;
  if (q.domain in state.dom) state.dom[q.domain] -= 1;
}

// Nomzodning modulga mosligi: kerakli qiyinlik muhimroq, keyin domen.
function fit(state, q) {
  return (state.diff[level(q)] > 0 ? 2 : 0) + (state.dom[q.domain] > 0 ? 1 : q.domain ? 0 : 0.5);
}

// Pool'dan modulni eng mos savollar bilan to'ldiradi (pool o'zgaradi).
function fillFrom(state, pool, { strict = false } = {}) {
  while (state.items.length < state.size && pool.length) {
    let best = -1;
    let bestScore = -1;
    for (let i = 0; i < pool.length; i++) {
      const score = fit(state, pool[i]);
      if (score > bestScore) [best, bestScore] = [i, score];
      if (score === 3) break;
    }
    // strict: bankdan faqat qiyinligi mos savol olinadi (aralashma buzilmasin).
    if (strict && bestScore < 2) break;
    place(state, pool.splice(best, 1)[0]);
  }
}

// Qolgan bo'sh joylar uchun spetsifikatsiya (AI bilan yaratish uchun).
function missingSpecs(state) {
  const n = state.size - state.items.length;
  if (n <= 0) return [];
  const diffs = LEVELS.flatMap((l) => Array(Math.max(0, state.diff[l])).fill(l));
  const doms = Object.entries(state.dom).flatMap(([d, c]) => Array(Math.max(0, c)).fill(d));
  const fallbackDom = Object.keys(state.dom);
  return Array.from({ length: n }, (_, i) => ({
    difficulty: diffs[i] || "medium",
    domain: doms[i] || fallbackDom[i % fallbackDom.length],
  }));
}

// Modul ichidagi tartib: RW — domenlar SAT tartibida, har birida osondan
// qiyinga; Math — osondan qiyinga.
function ordered(subject, items) {
  const domOrder = Object.keys(DOMAIN_SHARE[subject]);
  const rank = (q) => LEVELS.indexOf(level(q));
  return [...items].sort((a, b) =>
    subject === "rw"
      ? (domOrder.indexOf(a.domain) + 1 || 99) - (domOrder.indexOf(b.domain) + 1 || 99) || rank(a) - rank(b)
      : rank(a) - rank(b)
  );
}

function shuffle(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {object} opts
 * @param {"rw"|"math"} opts.subject
 * @param {Array} opts.pool  admin savollari (sessiya formatida)
 * @param {Array} [opts.bank] to'ldirish uchun savol banki (sessiya formatida)
 * @returns {{ module1, module2Easy, module2Hard, missing, report }}
 *   missing — har modul uchun yetishmagan joylar: [{ domain, difficulty }]
 */
export function assembleAdaptive({ subject, pool, bank = [], size = MODULE_SIZE[subject], rand = Math.random }) {
  const admin = shuffle(pool, rand);
  const used = new Set(admin.map((q) => q.sourceId).filter(Boolean));
  const bankPool = shuffle(
    bank.filter((q) => !used.has(q.sourceId)),
    rand
  );
  const st = Object.fromEntries(MODULES.map((m) => [m, slotState(subject, m, size)]));

  // 1) Module 1 — admin savollaridan, aralash qiyinlikda.
  fillFrom(st.module1, admin);

  // 2) Qolgan admin savollari Module 2 ga: oson → Oson, qiyin → Qiyin,
  //    o'rta → bo'sh joyi ko'proq bo'lganiga. Hech biri isrof bo'lmaydi.
  const targetFor = (q) => {
    const order =
      level(q) === "easy"
        ? ["module2Easy", "module2Hard"]
        : level(q) === "hard"
          ? ["module2Hard", "module2Easy"]
          : st.module2Easy.diff.medium >= st.module2Hard.diff.medium
            ? ["module2Easy", "module2Hard"]
            : ["module2Hard", "module2Easy"];
    return order.find((m) => st[m].items.length < size);
  };
  const leftover = [];
  for (const q of admin) {
    const m = targetFor(q);
    if (m) place(st[m], q);
    else leftover.push(q);
  }

  // 3) Bo'sh joylar — bankdan (avval qiyinligi mos, so'ng har qanday).
  for (const m of MODULES) fillFrom(st[m], bankPool, { strict: true });
  for (const m of MODULES) fillFrom(st[m], bankPool);

  const source = (q) => (q.aiGenerated ? "ai" : q.sourceId && !pool.includes(q) ? "bank" : "admin");
  const report = Object.fromEntries(
    MODULES.map((m) => {
      const items = st[m].items;
      const count = (fn) => items.filter(fn).length;
      return [
        m,
        {
          total: items.length,
          size,
          admin: count((q) => source(q) === "admin"),
          bank: count((q) => source(q) === "bank"),
          ai: count((q) => source(q) === "ai"),
          easy: count((q) => level(q) === "easy"),
          medium: count((q) => level(q) === "medium"),
          hard: count((q) => level(q) === "hard"),
        },
      ];
    })
  );

  return {
    module1: ordered(subject, st.module1.items),
    module2Easy: ordered(subject, st.module2Easy.items),
    module2Hard: ordered(subject, st.module2Hard.items),
    missing: Object.fromEntries(MODULES.map((m) => [m, missingSpecs(st[m])])),
    unused: leftover,
    report,
  };
}

const promptKey = (q) =>
  String(q.prompt || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 160);

/**
 * Real imtihondan (PDF) olingan testni adaptiv qilish. Bunday testda
 * Module 1 va bitta Module 2 bor. Ikkalasi ham o'zgarmaydi: PDF'dagi
 * Module 2 qiyinlik tarkibiga qarab "Qiyin" (odatda) yoki "Oson" variant
 * bo'ladi, ikkinchi variant esa savol bankidan shu hajmda yig'iladi.
 *
 * @returns {{ module1, module2Easy, module2Hard, pdfRoute, report, missing }}
 *   pdfRoute — PDF'dagi Module 2 qaysi variantga qo'yildi.
 */
export function adaptFixedTest({ subject, module1, module2, bank = [], rand = Math.random }) {
  const size = module2.length || MODULE_SIZE[subject];
  const count = (l) => module2.filter((q) => level(q) === l).length;
  const pdfRoute = count("hard") >= count("easy") ? "module2Hard" : "module2Easy";
  const other = pdfRoute === "module2Hard" ? "module2Easy" : "module2Hard";

  const existing = [...module1, ...module2];
  const usedIds = new Set(existing.map((q) => q.sourceId).filter(Boolean));
  const usedPrompts = new Set(existing.map(promptKey));
  const pool = shuffle(
    bank.filter((q) => !usedIds.has(q.sourceId) && !usedPrompts.has(promptKey(q))),
    rand
  );

  const st = slotState(subject, other, size);
  fillFrom(st, pool, { strict: true });
  fillFrom(st, pool);

  const items = ordered(subject, st.items);
  const report = {
    pdf: { total: module2.length, easy: count("easy"), medium: count("medium"), hard: count("hard") },
    bank: {
      total: items.length,
      size,
      easy: items.filter((q) => level(q) === "easy").length,
      medium: items.filter((q) => level(q) === "medium").length,
      hard: items.filter((q) => level(q) === "hard").length,
    },
  };
  return { module1, [pdfRoute]: module2, [other]: items, pdfRoute, report, missing: missingSpecs(st) };
}

// AI yaratgan savollarni yetishmagan joylarga qo'shib, tartibni yangilaydi.
export function addToModule(subject, items, extra) {
  return ordered(subject, [...items, ...extra]);
}
