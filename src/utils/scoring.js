// ------------------------------------------------------------------
// SAT'ning moslashuvchan (adaptive) marshrutlash va bal hisoblash
// mantiqi.
//
// MUHIM ESLATMA: College Board o'zining IRT (Item Response Theory)
// asosidagi rasmiy bal jadvalini ochiq e'lon qilmaydi. Quyidagi
// formulalar ochiq manbalarda tasvirlangan xatti-harakatga
// (routing chegarasi ~70%, oson Module 2'da bal ~600-650 bilan
// cheklanishi, qiyin Module 2'da bal 460-800 oralig'ida bo'lishi)
// asoslangan TAXMINIY simulyatsiyadir — real SAT balini 100%
// takrorlamaydi, faqat undagi adaptiv mantiqni his qildirish uchun.
// ------------------------------------------------------------------

import { isAnswerCorrect } from "./irtScoring";

// Module 1'da to'g'ri javoblar ulushi shu chegaradan yuqori bo'lsa,
// talaba qiyinroq Module 2'ga yo'naltiriladi.
export const ROUTING_THRESHOLD = 0.7;

export function decideRoute(correctCount, totalCount) {
  if (totalCount === 0) return "hard";
  return correctCount / totalCount >= ROUTING_THRESHOLD ? "hard" : "easy";
}

function interpolate(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

// Bitta bo'lim (Reading&Writing yoki Math) uchun taxminiy scaled
// score (200-800), 10 ga yaxlitlangan holda.
export function calcSectionScaledScore({ route, rawCorrect, maxRaw }) {
  const scaled =
    route === "hard"
      ? interpolate(rawCorrect, 0, maxRaw, 460, 800)
      : interpolate(rawCorrect, 0, maxRaw, 200, 650);
  return Math.round(scaled / 10) * 10;
}

// Berilgan javoblar massivi asosida to'g'ri javoblar sonini hisoblaydi
// (grid-in savollarda "3/4" va "0.75" kabi ekvivalent yozuvlar ham
// to'g'ri hisoblanadi).
export function countCorrect(questions, answers) {
  return questions.reduce(
    (acc, q, i) => acc + (isAnswerCorrect(q, answers[i]) ? 1 : 0),
    0
  );
}

// Faqat bitta modulli (Module 2 yo'q) bo'limlar uchun — masalan, admin
// tashkil qilgan sessiyada shu bo'limga faqat Module 1 savollari
// qo'shilgan bo'lsa — oddiy chiziqli 200-800 shkala bo'yicha baholanadi.
export function calcSingleModuleScaledScore({ rawCorrect, maxRaw }) {
  const scaled = interpolate(rawCorrect, 0, maxRaw, 200, 800);
  return Math.round(scaled / 10) * 10;
}
