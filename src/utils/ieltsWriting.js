import { roundBand } from "./ieltsScoring";

// ------------------------------------------------------------------
// IELTS Writing — avtomatik TAXMINIY baholash.
//
// IELTS'ning 4 ta rasmiy mezoni bo'yicha (Task Achievement/Response,
// Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy)
// matnning o'lchab bo'ladigan belgilari tekshiriladi: so'z soni,
// overview/pozitsiya, paragraflar, bog'lovchilar, leksik xilma-xillik,
// akademik so'zlar, gap tuzilishi va keng tarqalgan xatolar.
//
// Bu examiner o'rnini bosmaydi: g'oyalar sifati, mantiq va grammatik
// aniqlikni to'liq tushuna olmaydi. Shuning uchun har bir mezon 8.0 bilan
// cheklangan va natija "taxminiy" deb ko'rsatiladi.
// ------------------------------------------------------------------

const MAX_BAND = 8;
const MIN_BAND = 1;

const LINKERS = [
  "however", "moreover", "furthermore", "in addition", "additionally", "therefore", "consequently",
  "as a result", "for example", "for instance", "on the other hand", "in contrast", "by contrast",
  "whereas", "although", "nevertheless", "nonetheless", "firstly", "secondly", "thirdly", "finally",
  "in conclusion", "to conclude", "to sum up", "overall", "similarly", "likewise", "meanwhile", "thus",
  "hence", "in particular", "because", "since", "despite", "in spite of", "besides", "while",
  "on the whole", "in summary", "as well as", "not only", "this means", "as a consequence",
];

const SUBORDINATORS = [
  "because", "although", "though", "which", "who", "whom", "whose", "that", "when", "while", "whereas",
  "if", "unless", "since", "where", "so that", "even though", "as long as", "provided that",
];

// Akademik so'zlar ro'yxatidan (AWL) qism — o'zak bo'yicha solishtiriladi.
const ACADEMIC_STEMS = [
  "analys", "approach", "assess", "assum", "authorit", "availab", "benefi", "concept", "consist",
  "constitut", "context", "creat", "data", "defin", "deriv", "distribut", "econom", "environment",
  "establish", "estimat", "eviden", "factor", "financ", "function", "identif", "income", "indicat",
  "individual", "interpret", "involv", "issue", "legislat", "major", "method", "occur", "percent",
  "period", "policy", "principl", "process", "requir", "research", "respons", "signific", "similar",
  "sourc", "specific", "structur", "theor", "vari", "achiev", "acquir", "affect", "appropriat",
  "aspect", "categor", "communit", "complex", "conclu", "conduct", "consequen", "construct", "consum",
  "cultur", "distinct", "element", "evaluat", "featur", "focus", "impact", "institut", "invest",
  "maintain", "obtain", "participat", "perceiv", "potential", "previous", "primar", "range", "region",
  "regulat", "relevan", "resourc", "restrict", "strateg", "survey", "tradition", "infrastructur",
  "sustainab", "fluctuat", "declin", "proportion", "substantial", "considerabl", "dramatical",
  "gradual", "steadi", "trend", "prior", "funding", "alloc", "efficien", "urban", "commut",
  "emission", "congestion", "priorit", "implement", "advocat", "contribut", "enhanc",
];

const STOPWORDS = new Set(
  ("a an the and or but if of to in on at for with by from as is are was were be been being this that these those it its " +
    "they them their there then than so such not no can could will would should may might must do does did have has had " +
    "i we you he she my our your his her which who what when where how also more most very much many some any other " +
    "into over up down out about between while because although however").split(" ")
);

const MISSPELLINGS = [
  "recieve", "beleive", "goverment", "goverments", "enviroment", "becuase", "alot", "untill", "wich",
  "thier", "occured", "seperate", "definately", "arguement", "succesful", "tommorow", "neccessary",
  "accomodation", "publically", "transportaion", "begining", "adress", "wether", "realy", "truely",
  "freind", "foward", "pollusion", "infomation", "peoples", "childs", "wont", "dont", "doesnt", "cant",
  "isnt", "didnt", "govermental", "comunity", "economicaly", "increse", "decrese", "persentage",
];

const OVERVIEW_MARKERS = ["overall", "in general", "generally", "it is clear", "it can be seen", "the main trend", "to summarise", "to summarize", "in summary", "it is evident"];
const COMPARISON_MARKERS = ["higher", "lower", "more than", "less than", "whereas", "while", "compared", "in contrast", "the most", "the least", "doubled", "halved", "overtook", "surpassed", "exceeded", "twice", "than"];
const TREND_WORDS = ["increas", "rise", "rose", "grew", "grow", "declin", "decreas", "fell", "fall", "drop", "remain", "stable", "fluctuat", "peak", "steady", "steadily", "gradual", "sharp", "plateau"];
const POSITION_MARKERS = ["i agree", "i disagree", "i believe", "in my opinion", "i think", "in my view", "this essay will argue", "i strongly", "to a large extent", "partly agree", "i would argue", "i am convinced", "i feel that", "my view"];
const CONCLUSION_MARKERS = ["in conclusion", "to conclude", "to sum up", "in summary", "overall,", "all in all", "to summarise", "to summarize"];
const EXAMPLE_MARKERS = ["for example", "for instance", "such as", "e.g.", "a good example", "to illustrate"];

function countPhrase(lower, phrase) {
  const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
  return (lower.match(re) || []).length;
}

function clampBand(v) {
  return Math.min(MAX_BAND, Math.max(MIN_BAND, Math.round(v * 2) / 2));
}

function mattr(words, window = 50) {
  if (words.length === 0) return 0;
  if (words.length <= window) return new Set(words).size / words.length;
  let sum = 0;
  let n = 0;
  for (let i = 0; i + window <= words.length; i += 5) {
    sum += new Set(words.slice(i, i + window)).size / window;
    n += 1;
  }
  return sum / n;
}

export function analyzeText(text) {
  const raw = String(text || "");
  const lower = raw.toLowerCase();
  const words = lower.match(/[a-z]+(?:'[a-z]+)?/g) || [];
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const sentences = raw
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[a-z]/i.test(s));
  const paragraphs = raw
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter((p) => p.split(/\s+/).length >= 5);
  const sentenceLengths = sentences.map((s) => (s.match(/[A-Za-z]+/g) || []).length);
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / (sentenceLengths.length || 1);
  const sd = Math.sqrt(
    sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / (sentenceLengths.length || 1)
  );
  return { raw, lower, words, wordCount: tokens.length, sentences, paragraphs, sentenceLengths, mean, sd };
}

function taskScore(taskKey, text, meta) {
  const a = analyzeText(text);
  const wc = a.wordCount;
  const min = meta.minWords;
  const notes = { ta: [], cc: [], lr: [], gra: [] };

  if (wc < 20) {
    const band = wc === 0 ? 0 : 1;
    return {
      wordCount: wc,
      criteria: { ta: band, cc: band, lr: band, gra: band },
      band,
      notes: {
        ta: [{ ok: false, text: wc === 0 ? "Javob yozilmagan." : "Matn baholash uchun juda qisqa." }],
        cc: [], lr: [], gra: [],
      },
    };
  }

  // ---------------- Task Achievement / Response ----------------
  let ta = 6;
  let taCap = MAX_BAND;
  const ratio = wc / min;
  if (ratio < 0.5) {
    taCap = 3.5;
    notes.ta.push({ ok: false, text: `Juda qisqa: ${wc} so'z (kamida ${min} kerak). Bu band'ni keskin tushiradi.` });
  } else if (ratio < 1) {
    ta -= ratio < 0.8 ? 1.5 : 1;
    notes.ta.push({ ok: false, text: `${wc} so'z — minimal ${min} so'zdan kam. Real imtihonda bu uchun ball kesiladi.` });
  } else {
    notes.ta.push({ ok: true, text: `So'z soni yetarli (${wc}).` });
  }

  const coverage = meta.keywords?.length
    ? meta.keywords.filter((k) => a.lower.includes(k)).length / meta.keywords.length
    : 0.5;

  if (taskKey === "task1") {
    const hasOverview = OVERVIEW_MARKERS.some((m) => a.lower.includes(m));
    const numbers = (a.raw.match(/\d+(\.\d+)?\s*(%|per ?cent)?/g) || []).length;
    const comparisons = COMPARISON_MARKERS.filter((m) => countPhrase(a.lower, m) > 0).length;
    const trends = TREND_WORDS.filter((m) => a.lower.includes(m)).length;
    if (hasOverview) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "Overview (umumiy tendensiya) bor." });
    } else {
      ta -= 1;
      taCap = Math.min(taCap, 5);
      notes.ta.push({ ok: false, text: "Aniq overview yo'q — \"Overall, ...\" bilan asosiy tendensiyani yozing (usiz Task 1 odatda 5 dan oshmaydi)." });
    }
    if (numbers >= 5) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "Ma'lumotlar raqamlar bilan asoslangan." });
    } else if (numbers < 2) {
      ta -= 1;
      notes.ta.push({ ok: false, text: "Grafikdan aniq raqamlar deyarli keltirilmagan." });
    }
    if (comparisons >= 2) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "Kategoriyalar o'zaro taqqoslangan." });
    } else {
      notes.ta.push({ ok: false, text: "Taqqoslash kam (higher / whereas / compared with ...)." });
    }
    if (trends < 2) {
      ta -= 0.5;
      notes.ta.push({ ok: false, text: "O'zgarishlarni ifodalovchi so'zlar kam (increase, decline, remain stable ...)." });
    }
    if (/\b(i think|i believe|in my opinion)\b/.test(a.lower)) {
      ta -= 0.5;
      notes.ta.push({ ok: false, text: "Task 1 da shaxsiy fikr yozilmaydi — faqat ma'lumotni tasvirlang." });
    }
  } else {
    const hasPosition = POSITION_MARKERS.some((m) => a.lower.includes(m));
    const hasConclusion = CONCLUSION_MARKERS.some((m) => a.lower.includes(m));
    const examples = EXAMPLE_MARKERS.filter((m) => a.lower.includes(m)).length;
    if (hasPosition) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "Pozitsiyangiz aniq bildirilgan." });
    } else {
      ta -= 1;
      taCap = Math.min(taCap, 5);
      notes.ta.push({ ok: false, text: "Aniq pozitsiya yo'q — \"To what extent\" savolida qanchalik rozi ekaningizni ochiq ayting." });
    }
    if (hasConclusion) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "Xulosa paragrafi bor." });
    } else {
      ta -= 0.5;
      notes.ta.push({ ok: false, text: "Xulosa yo'q (In conclusion, ...)." });
    }
    if (examples >= 1) {
      ta += 0.5;
      notes.ta.push({ ok: true, text: "G'oyalar misollar bilan qo'llab-quvvatlangan." });
    } else {
      notes.ta.push({ ok: false, text: "Misollar keltirilmagan — har bir asosiy g'oyani misol bilan kuchaytiring." });
    }
  }
  if (coverage >= 0.5) {
    ta += 0.5;
  } else if (coverage < 0.2) {
    ta -= 1.5;
    notes.ta.push({ ok: false, text: "Matn topshiriq mavzusiga yetarlicha mos kelmayapti (asosiy tushunchalar ishlatilmagan)." });
  }

  // ---------------- Coherence & Cohesion ----------------
  let cc = 5.5;
  const paras = a.paragraphs.length;
  const idealParas = taskKey === "task1" ? 3 : 4;
  if (paras >= idealParas) {
    cc += 1;
    notes.cc.push({ ok: true, text: `${paras} ta paragraf — tuzilish aniq.` });
  } else if (paras === idealParas - 1) {
    cc += 0.5;
    notes.cc.push({ ok: false, text: `${paras} ta paragraf. Tavsiya: ${taskKey === "task1" ? "kirish, overview, 1–2 ta tafsilot paragrafi" : "kirish, 2 ta asosiy paragraf, xulosa"}.` });
  } else if (paras <= 1) {
    cc -= 1;
    notes.cc.push({ ok: false, text: "Matn paragraflarga bo'linmagan — bu Coherence band'ini sezilarli tushiradi." });
  }
  const linkerCounts = LINKERS.map((l) => [l, countPhrase(a.lower, l)]).filter(([, c]) => c > 0);
  const distinct = linkerCounts.length;
  const totalLinkers = linkerCounts.reduce((s, [, c]) => s + c, 0);
  if (distinct >= 7) {
    cc += 1;
    notes.cc.push({ ok: true, text: `Bog'lovchi so'zlar xilma-xil (${distinct} xil).` });
  } else if (distinct >= 4) {
    cc += 0.5;
    notes.cc.push({ ok: true, text: `${distinct} xil bog'lovchi ishlatilgan.` });
  } else {
    cc -= 1;
    notes.cc.push({ ok: false, text: "Bog'lovchilar kam (however, moreover, as a result, in contrast ...)." });
  }
  const overused = linkerCounts.filter(([l, c]) => c > 3 && !["because", "while", "since", "as well as"].includes(l));
  if (overused.length || totalLinkers / (wc / 100) > 7) {
    cc -= 0.5;
    notes.cc.push({
      ok: false,
      text: overused.length
        ? `Ba'zi bog'lovchilar haddan ortiq takrorlangan: ${overused.map(([l]) => `"${l}"`).join(", ")}.`
        : "Bog'lovchilar juda ko'p — mexanik ko'rinadi.",
    });
  }

  // ---------------- Lexical Resource ----------------
  let lr = 5;
  const diversity = mattr(a.words);
  if (diversity >= 0.78) lr += 1.5;
  else if (diversity >= 0.72) lr += 1;
  else if (diversity >= 0.66) lr += 0.5;
  else if (diversity < 0.58) lr -= 1;
  notes.lr.push({
    ok: diversity >= 0.66,
    text: `Leksik xilma-xillik: ${Math.round(diversity * 100)}% ${diversity >= 0.72 ? "(yaxshi)" : diversity >= 0.66 ? "(o'rtacha)" : "(so'zlar ko'p takrorlanadi)"}.`,
  });
  const academic = a.words.filter((w) => w.length >= 5 && ACADEMIC_STEMS.some((s) => w.startsWith(s))).length;
  const academicRate = academic / (wc / 100);
  if (academicRate >= 6) {
    lr += 1;
    notes.lr.push({ ok: true, text: "Akademik lug'at yaxshi ishlatilgan." });
  } else if (academicRate >= 3) {
    lr += 0.5;
  } else {
    lr -= 0.5;
    notes.lr.push({ ok: false, text: "Akademik so'zlar kam (significant, substantial, contribute, allocate ...)." });
  }
  const longWords = a.words.filter((w) => w.length >= 7).length / (a.words.length || 1);
  if (longWords >= 0.28) lr += 0.5;
  else if (longWords < 0.18) lr -= 0.5;
  const misspelled = [...new Set(a.words.filter((w) => MISSPELLINGS.includes(w)))];
  if (misspelled.length) {
    lr -= Math.min(1.5, misspelled.length * 0.5);
    notes.lr.push({ ok: false, text: `Imlo xatolari: ${misspelled.join(", ")}.` });
  }
  const freq = {};
  a.words.forEach((w) => {
    if (!STOPWORDS.has(w) && w.length > 3) freq[w] = (freq[w] || 0) + 1;
  });
  const repeated = Object.entries(freq)
    .filter(([, c]) => c / a.words.length > 0.03 && c >= 5)
    .map(([w]) => w);
  if (repeated.length) {
    lr -= 0.5;
    notes.lr.push({ ok: false, text: `Ko'p takrorlangan so'zlar: ${repeated.slice(0, 4).join(", ")} — sinonimlardan foydalaning.` });
  }

  // ---------------- Grammatical Range & Accuracy ----------------
  let gra = 5;
  const complex =
    a.sentences.filter((s) => SUBORDINATORS.some((w) => countPhrase(s.toLowerCase(), w) > 0)).length /
    (a.sentences.length || 1);
  if (complex >= 0.5) gra += 1.5;
  else if (complex >= 0.3) gra += 1;
  else if (complex >= 0.15) gra += 0.5;
  else gra -= 0.5;
  notes.gra.push({
    ok: complex >= 0.3,
    text: `Murakkab (ergash gapli) gaplar ulushi: ${Math.round(complex * 100)}%${complex < 0.3 ? " — ko'proq which / although / because bilan murakkab gaplar tuzing" : ""}.`,
  });
  if (a.sd >= 6) gra += 0.5;
  if (a.mean >= 12 && a.mean <= 28) gra += 0.5;
  else if (a.mean < 9) {
    gra -= 1;
    notes.gra.push({ ok: false, text: "Gaplar juda qisqa va sodda." });
  }

  const errors = [];
  const lowerI = (a.raw.match(/(^|\s)i(\s|')/g) || []).length;
  if (lowerI) errors.push(`kichik "i" (${lowerI})`);
  const lowerStart = a.sentences.filter((s) => /^[a-z]/.test(s)).length;
  if (lowerStart) errors.push(`gap kichik harf bilan boshlangan (${lowerStart})`);
  const doubled = (a.lower.match(/\b(\w+)\s+\1\b/g) || []).filter((d) => !/^(that that|had had)$/.test(d)).length;
  if (doubled) errors.push(`so'z takrorlangan (${doubled})`);
  const runOns = a.sentenceLengths.filter((l) => l > 45).length;
  if (runOns) errors.push(`juda uzun gaplar (${runOns})`);
  const noSpace = (a.raw.match(/[a-z][,.][A-Za-z]/g) || []).length;
  if (noSpace) errors.push(`tinish belgisidan keyin bo'sh joy yo'q (${noSpace})`);
  if (!/[.!?]\s*$/.test(a.raw.trim())) errors.push("oxirgi gap tugallanmagan");
  if (errors.length) {
    gra -= Math.min(2, errors.length * 0.5);
    notes.gra.push({ ok: false, text: `Xatolar: ${errors.join("; ")}.` });
  } else {
    notes.gra.push({ ok: true, text: "Asosiy mexanik xatolar topilmadi." });
  }
  if (ratio < 0.5) gra = Math.min(gra, 4);

  const criteria = {
    ta: clampBand(Math.min(ta, taCap)),
    cc: clampBand(ratio < 0.5 ? Math.min(cc, 4) : cc),
    lr: clampBand(ratio < 0.5 ? Math.min(lr, 4) : lr),
    gra: clampBand(gra),
  };
  const band = roundBand((criteria.ta + criteria.cc + criteria.lr + criteria.gra) / 4);
  return { wordCount: wc, criteria, band, notes };
}

export const CRITERIA_LABELS = {
  ta: { task1: "Task Achievement", task2: "Task Response" },
  cc: "Coherence & Cohesion",
  lr: "Lexical Resource",
  gra: "Grammatical Range & Accuracy",
};

// Task 2 ikki barobar og'irlikka ega.
export function assessWriting(writingMeta, texts) {
  const task1 = taskScore("task1", texts.task1, writingMeta.task1);
  const task2 = taskScore("task2", texts.task2, writingMeta.task2);
  const band = roundBand((task1.band + 2 * task2.band) / 3);
  return { task1, task2, band };
}
