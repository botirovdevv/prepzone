// ------------------------------------------------------------------
// SAT Duel vaqt rejimlari (chess.com uslubi). Klientdagi nusxa:
// src/data/duelModes.js — id'lar bir xil bo'lishi shart.
//
//   clockMs   — har o'yinchining "shaxmat soati" (soatli rejimlar)
//   incMs     — har javobdan keyin qo'shiladigan vaqt
//   total     — savollar soni
//   maxLen    — savol (matn + variantlar) uzunligi chegarasi: tez rejimlarda
//               qisqa savollar
//   levels    — qiyinlik rejasi (savollar soniga cho'ziladi)
//   category  — reyting turi (bullet / blitz / rapid / classic)
//   noRw      — Reading & Writing bo'limi yo'q (uzun matnlar 1 daqiqaga sig'maydi)
//   classic   — sinxron raundlar (ikkalasi bir savolda, 90 s)
// ------------------------------------------------------------------

export const DUEL_MODES = {
  bullet1: { id: "bullet1", category: "bullet", clockMs: 60_000, incMs: 0, total: 5, maxLen: 350, levels: ["easy", "medium"], noRw: true },
  bullet2: { id: "bullet2", category: "bullet", clockMs: 120_000, incMs: 1_000, total: 8, maxLen: 350, levels: ["easy", "medium"], noRw: true },
  blitz3: { id: "blitz3", category: "blitz", clockMs: 180_000, incMs: 2_000, total: 10, maxLen: 600, levels: ["easy", "medium", "hard"] },
  blitz5: { id: "blitz5", category: "blitz", clockMs: 300_000, incMs: 0, total: 10, maxLen: 600, levels: ["easy", "medium", "hard"] },
  rapid10: { id: "rapid10", category: "rapid", clockMs: 600_000, incMs: 0, total: 15, maxLen: Infinity, levels: ["easy", "medium", "hard"] },
  classic: { id: "classic", category: "classic", classic: true, total: 7, roundMs: 90_000, maxLen: Infinity, levels: ["easy", "medium", "hard"] },
};

export const CATEGORIES = ["bullet", "blitz", "rapid", "classic"];

export function getMode(id) {
  return DUEL_MODES[id] || null;
}

// Bo'lim rejimga mos kelmasa (Bullet + RW) — "mix"ga o'tkaziladi.
export function sectionFor(mode, section) {
  if (mode.noRw && section === "rw") return "mix";
  return section;
}
