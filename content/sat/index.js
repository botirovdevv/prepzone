// ------------------------------------------------------------------
// Statik (repo ichidagi) Digital SAT mock testlari — FAQAT server (api/) va
// scripts/build-content.mjs uchun; brauzerga kirmaydi.
//
// Hozircha statik test yo'q: "SAT Practice Test 1/2" (bluebook-1/2) olib
// tashlangan. Yangi to'liq testlar admin panelidan "Doimiy ochiq" sessiya
// sifatida qo'shiladi (AI import bilan PDF'dan). Statik test qo'shish kerak
// bo'lsa — helpers.js dagi mcq/spr/buildModule bilan modul yozib, shu yerga
// { id, testTitle, groups: [rw, math] } ko'rinishida qo'shing.
// ------------------------------------------------------------------

export const SAT_TESTS = {};

// Natija sahifasida savollarni ko'rib chiqish uchun: bo'lim, bosqich va
// yo'nalish bo'yicha tegishli savollar ro'yxati.
export function getModuleQuestions(group, stage, route) {
  if (stage === "module1") return group.module1.questions;
  return route === "hard" ? group.module2Hard.questions : group.module2Easy.questions;
}
