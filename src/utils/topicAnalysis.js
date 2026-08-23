import { RW_DOMAINS } from "../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../data/mathDomains";

const DOMAIN_META = Object.fromEntries(
  [...RW_DOMAINS, ...MATH_DOMAINS].map((d) => [d.id, d])
);

// Bu chegaralar taxminiy — real pedagogik tadqiqotga emas, oddiy
// "yetarlicha ishonchli xulosa chiqarish" mantig'iga asoslangan:
// - kamida shuncha savol ishlangan bo'lishi kerak, aks holda 1 ta xato
//   savol butun mavzuni "zaif" qilib ko'rsatib yuborishi mumkin;
// - foiz chegaralari talabaga tushunarli, keskin bo'lmagan darajada.
export const MIN_ATTEMPTS_FOR_TOPIC = 2;
export const WEAK_THRESHOLD = 0.6; // 60% dan past — e'tibor talab qiladi
export const STRONG_THRESHOLD = 0.85; // 85% va undan yuqori — yaxshi o'zlashtirilgan

const SUBJECT_LABELS = { rw: "Reading and Writing", math: "Math" };

/**
 * `questions` — { id, domain?, correctAnswer, ... , _showPassage? / _sectionType? }
 * `answers` — { [questionId]: tanlangan variant harfi | null }
 *
 * Faqat talaba javob bergan savollar hisobga olinadi (bo'sh qoldirilgan
 * savollar "xato" deb hisoblanmaydi — chunki bu ko'proq vaqt yetishmasligi
 * yoki e'tiborsizlik bo'lishi mumkin, mavzuni bilmaslik emas).
 */
export function analyzeTopics(questions, answers, getSubject = defaultGetSubject) {
  const bySubject = {
    rw: { total: 0, correct: 0 },
    math: { total: 0, correct: 0 },
  };
  const byDomain = {};

  for (const q of questions) {
    if (answers[q.id] == null) continue;
    const isCorrect = answers[q.id] === q.correctAnswer;
    const subject = getSubject(q);

    if (subject && bySubject[subject]) {
      bySubject[subject].total += 1;
      if (isCorrect) bySubject[subject].correct += 1;
    }

    if (q.domain) {
      if (!byDomain[q.domain]) byDomain[q.domain] = { total: 0, correct: 0 };
      byDomain[q.domain].total += 1;
      if (isCorrect) byDomain[q.domain].correct += 1;
    }
  }

  const domainSummaries = Object.entries(byDomain)
    .map(([domainId, stats]) => {
      const meta = DOMAIN_META[domainId] || { label: domainId, hint: "" };
      return {
        domainId,
        label: meta.label,
        hint: meta.hint,
        ...stats,
        accuracy: stats.total ? stats.correct / stats.total : 0,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy);

  const subjectSummaries = Object.entries(bySubject)
    .filter(([, s]) => s.total > 0)
    .map(([id, s]) => ({
      subjectId: id,
      label: SUBJECT_LABELS[id] || id,
      ...s,
      accuracy: s.total ? s.correct / s.total : 0,
    }));

  return { domainSummaries, subjectSummaries };
}

function defaultGetSubject(q) {
  if (q._sectionType) return q._sectionType;
  if (typeof q._showPassage === "boolean") return q._showPassage ? "rw" : "math";
  return null;
}

/**
 * Tahlil natijasidan foydalanuvchiga ko'rsatiladigan maslahatlar
 * ro'yxatini tuzadi: qaysi mavzularga ko'proq e'tibor qaratish kerak
 * va qaysilarini yaxshi bilishi haqida.
 */
export function buildTopicAdvice({ domainSummaries, subjectSummaries }) {
  const advice = [];
  const attempted = domainSummaries.filter((d) => d.total >= MIN_ATTEMPTS_FOR_TOPIC);
  const weak = attempted.filter((d) => d.accuracy < WEAK_THRESHOLD);
  const strong = attempted.filter((d) => d.accuracy >= STRONG_THRESHOLD);

  weak.slice(0, 3).forEach((d) => {
    advice.push({
      type: "weak",
      domainId: d.domainId,
      label: d.label,
      accuracy: d.accuracy,
      total: d.total,
      correct: d.correct,
      text: `"${d.label}" mavzusida ${d.correct}/${d.total} ta savolga to'g'ri javob berdingiz (${Math.round(
        d.accuracy * 100
      )}%). Shu mavzuga ko'proq e'tibor qarating va qo'shimcha mashq qiling.`,
    });
  });

  strong.slice(0, 2).forEach((d) => {
    advice.push({
      type: "strong",
      domainId: d.domainId,
      label: d.label,
      accuracy: d.accuracy,
      total: d.total,
      correct: d.correct,
      text: `"${d.label}" mavzusini yaxshi o'zlashtirgansiz — ${d.correct}/${d.total} to'g'ri (${Math.round(
        d.accuracy * 100
      )}%). Ajoyib natija!`,
    });
  });

  // Agar hech qaysi savolga mavzu (domain) belgilanmagan bo'lsa, hech
  // bo'lmaganda bo'lim (Reading&Writing / Math) darajasida umumiy
  // maslahat beramiz — foydalanuvchi hech narsasiz qolmasin.
  if (attempted.length === 0) {
    subjectSummaries.forEach((s) => {
      if (s.accuracy < WEAK_THRESHOLD) {
        advice.push({
          type: "weak",
          label: s.label,
          accuracy: s.accuracy,
          total: s.total,
          correct: s.correct,
          text: `${s.label} bo'limida natijangiz ${s.correct}/${s.total} (${Math.round(
            s.accuracy * 100
          )}%) — ko'proq mashq qilishni tavsiya qilamiz.`,
        });
      }
    });
  }

  if (weak.length === 0 && attempted.length > 0 && !advice.some((a) => a.type === "weak")) {
    advice.push({
      type: "info",
      text: "Aniq zaif mavzu topilmadi — natijangiz barcha mavzular bo'yicha yaxshi. Shunday davom eting!",
    });
  }

  return advice;
}
