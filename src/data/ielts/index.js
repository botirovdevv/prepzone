import catalog from "../generated/catalog.json";

// Testlar ro'yxati (faqat id/nom/tavsif). To'liq test — loadIeltsTest() bilan,
// kalitsiz nusxa; to'g'ri javoblar va ball hisoblash serverda (api/ielts/*).
// Yangi test qo'shish: content/ielts/ ga yozing.
export const IELTS_TESTS = catalog.ielts;

const loaders = import.meta.glob("../generated/ielts/*.json", { import: "default" });

export function loadIeltsTest(id) {
  const load = loaders[`../generated/ielts/${id}.json`];
  return load ? load() : Promise.resolve(null);
}

// Bo'limlar va ularning vaqti (daqiqa). Listening uchun vaqt audio
// davomiyligiga bog'liq; bu yerda — audio + tekshirish uchun yuqori chegara.
export const IELTS_SECTIONS = {
  listening: { key: "listening", label: "Listening", minutes: 32, questions: 40 },
  reading: { key: "reading", label: "Reading", minutes: 60, questions: 40 },
  writing: { key: "writing", label: "Writing", minutes: 60, questions: 2 },
};

export const SECTION_ORDER = ["listening", "reading", "writing"];

export function sectionsFor(mode) {
  return mode === "full" ? SECTION_ORDER : [mode];
}
