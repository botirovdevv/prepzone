// ------------------------------------------------------------------
// Bluebook uslubidagi savollarni yaratish uchun yordamchilar.
//
// Savol maydonlari:
//   id          — butun test bo'yicha yagona (highlight'lar shunga bog'lanadi)
//   type        — "mcq" (4 variantli) | "spr" (javobni o'zi yozadi, grid-in)
//   domain      — rwPromptTemplates / mathDomains'dagi domain id'si
//   skill       — kichik mavzu (natija tahlili uchun)
//   difficulty  — "E" | "M" | "H" (IRT bal hisoblashda ishlatiladi)
//   html        — true: passage/prompt/choices xavfsiz HTML sifatida
//                 ko'rsatiladi (<u>, <sup>, jadval va h.k.)
// ------------------------------------------------------------------

const LABELS = ["A", "B", "C", "D"];

// Standart SAT savol matnlari (stem'lar)
export const STEM = {
  wic: "Which choice completes the text with the most logical and precise word or phrase?",
  underlined: "Which choice best describes the function of the underlined sentence in the text as a whole?",
  purpose: "Which choice best states the main purpose of the text?",
  structure: "Which choice best describes the overall structure of the text?",
  mainIdea: "Which choice best states the main idea of the text?",
  complete: "Which choice most logically completes the text?",
  table: "Which choice most effectively uses data from the table to complete the statement?",
  graph: "Which choice most effectively uses data from the graph to complete the statement?",
  conventions: "Which choice completes the text so that it conforms to the conventions of Standard English?",
  transition: "Which choice completes the text with the most logical transition?",
  notes: "Which choice most effectively uses relevant information from the notes to accomplish this goal?",
};

// `answer` — to'g'ri variantning asl ro'yxatdagi indeksi (0..3).
// `rotate` — variantlar tartibini aylantirish (to'g'ri javoblar harflar
// bo'yicha teng taqsimlansin deb). Son variantlar (math) har doim
// o'sish tartibida saralanadi — real SAT'dagi kabi.
export function mcq(id, { choices, answer, rotate = 0, sortNumeric = false, ...rest }) {
  let items = choices.map((text, i) => ({ text, correct: i === answer }));
  if (sortNumeric) {
    const num = (t) => Number(String(t).replace("−", "-").replace(/,/g, ""));
    items = [...items].sort((x, y) => num(x.text) - num(y.text));
  } else if (rotate) {
    const r = rotate % items.length;
    items = items.slice(r).concat(items.slice(0, r));
  }
  return {
    id,
    type: "mcq",
    html: true,
    ...rest,
    choices: items.map((it, i) => ({ label: LABELS[i], text: it.text })),
    correctAnswer: LABELS[items.findIndex((it) => it.correct)],
  };
}

// Grid-in savol: `answers` — qabul qilinadigan barcha yozuvlar;
// birinchisi natija sahifasida "to'g'ri javob" sifatida ko'rsatiladi.
export function spr(id, { answers, ...rest }) {
  return {
    id,
    type: "spr",
    html: true,
    ...rest,
    answers,
    correctAnswer: answers[0],
  };
}

// Modul ichidagi savollarga navbatma-navbat aylantirish qo'llaydi
// (qo'lda berilgan `rotate` bo'lmasa), shunda to'g'ri javoblar A-D
// bo'yicha aralash taqsimlanadi.
export function buildModule(specs, builder = mcq) {
  return specs.map(([id, spec], i) =>
    spec.answers ? spr(id, spec) : builder(id, { rotate: (i * 3 + 1) % 4, ...spec })
  );
}

// Oddiy HTML jadval (R&W'dagi miqdoriy dalil savollari va Math uchun).
export function table(caption, head, rows) {
  const th = head.map((h) => `<th>${h}</th>`).join("");
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
  return `<table><caption>${caption}</caption><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`;
}

// SVG chizmani <img src> uchun data-URI'ga aylantiradi (sanitizer
// SVG teglarini o'chiradi, rasm sifatida esa xavfsiz ko'rsatiladi).
export function svgFigure(width, height, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Georgia, serif" font-size="16">${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// "Talaba quyidagi eslatmalarni yozib oldi" formatidagi ro'yxat.
export function notes(items) {
  return `While researching a topic, a student has taken the following notes:<ul>${items
    .map((t) => `<li>${t}</li>`)
    .join("")}</ul>`;
}
