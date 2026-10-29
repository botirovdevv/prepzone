import { useRef, useState } from "react";
import { LuFileUp, LuLoaderCircle, LuSparkles, LuTriangleAlert, LuX, LuCircleCheck } from "react-icons/lu";
import { sanitizeRichText } from "../../utils/sanitizeHtml";
import { newQuestionId } from "../../utils/questionId";
import { assignToModules } from "../../utils/pdfImport";
import { checkFileLimits, isPdf, usePdfImport } from "../../hooks/usePdfImport";
import { FailedChunks, ImportProgress } from "./ImportProgress";
import { Card } from "../ui";

// ------------------------------------------------------------------
// Butun testni bitta PDF'dan tuzish (admin, SessionForm tepasida): AI har
// savolning bo'limini (Reading & Writing / Math), modulini va raqamini
// aniqlaydi, PDF oxiridagi kalitdan to'g'ri javoblarni oladi; natija
// bo'lim × modul bo'yicha joylanadi. Shubhali savollar (kalitsiz, grafikli,
// AI ishonchi past) "AI · tekshirish kerak" belgisi bilan qo'shiladi —
// SessionForm ularni tasdiqlamasdan saqlashga yo'l qo'ymaydi.
// ------------------------------------------------------------------

const SECTIONS = [
  { id: "rw", title: "Reading and Writing" },
  { id: "math", title: "Math" },
];
const MODULES = [
  { key: "module1", label: "Module 1" },
  { key: "module2Easy", label: "Module 2 · Oson" },
  { key: "module2Hard", label: "Module 2 · Qiyin" },
  { key: "module2Mixed", label: "Module 2" },
];

const missingAnswer = (q) =>
  q.type === "spr" ? !q.answers?.length : !q.correctAnswer || q.choices.some((c) => !c.text.trim());

// AI javobi -> QuestionEditor formatidagi savol (AiImporter.addSelected bilan bir xil).
function toEditorQuestion(q) {
  const flagged = q.issues.length > 0 || missingAnswer(q);
  return {
    id: newQuestionId(),
    html: true,
    passage: q.passage ? sanitizeRichText(q.passage) : "",
    prompt: q.prompt,
    type: q.type,
    choices: q.choices,
    correctAnswer: q.correctAnswer,
    ...(q.type === "spr" ? { answers: q.answers } : {}),
    explanation: q.explanation,
    image: null,
    domain: q.domain,
    skill: q.skill,
    difficulty: q.difficulty,
    ...(flagged
      ? {
          aiGenerated: true,
          aiReviewed: false,
          aiNote: [...q.issues, ...(missingAnswer(q) ? ["To'g'ri javobni belgilang"] : [])].join(" · "),
        }
      : {}),
  };
}

export default function FullTestImporter({ hasQuestions, onApply }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // assignToModules natijasi
  const [applied, setApplied] = useState(false);
  const fileRef = useRef(null);
  const { busy, progress, failed, start, retry, reset } = usePdfImport();

  const pick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!isPdf(f)) return setError("Faqat PDF fayl yuklang.");
    const limitError = checkFileLimits([f]);
    if (limitError) return setError(limitError);
    setError("");
    setFile(f);
    setResult(null);
    setApplied(false);
    reset();
  };

  const build = (questions) => {
    if (!questions.length) {
      setResult(null);
      setError("PDF'dan savol olinmadi.");
      return;
    }
    const assigned = assignToModules(questions);
    const out = { unlabeled: assigned.unlabeled };
    for (const s of SECTIONS) {
      out[s.id] = Object.fromEntries(MODULES.map((m) => [m.key, assigned[s.id][m.key].map(toEditorQuestion)]));
    }
    setResult(out);
  };

  const run = async () => {
    setError("");
    setApplied(false);
    try {
      build(await start({ subject: "auto", files: [file] }));
    } catch (err) {
      setError(err.message);
    }
  };

  const retryFailed = async () => build(await retry());

  const all = result ? SECTIONS.flatMap((s) => MODULES.flatMap((m) => result[s.id][m.key])) : [];
  const flagged = all.filter((q) => q.aiGenerated).length;

  const apply = () => {
    if (hasQuestions && !window.confirm("Hozirgi barcha savollar PDF'dagi savollar bilan almashtiriladi. Davom etasizmi?")) return;
    onApply(result);
    setApplied(true);
  };

  return (
    <Card className="border-[#087fd1]/25 bg-gradient-to-br from-[#087fd1]/[0.06] to-transparent p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#087fd1] text-white">
          <LuSparkles size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-bold text-[#12213D]">Butun testni PDF'dan yuklash</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-[#12213D]/55">
            To'liq mock test PDF'ini (masalan, 98 savol) yuklang — AI Reading & Writing va Math'ni, modullarni va javob
            kalitini o'zi ajratib, quyidagi modullarga joylaydi. 40 MB gacha, ~1–2 daqiqa.
          </p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="application/pdf" onChange={pick} className="hidden" />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl border border-[#087fd1]/25 bg-white px-3.5 py-2 text-sm font-semibold text-[#087fd1] transition hover:bg-[#087fd1]/5 disabled:opacity-50"
        >
          <LuFileUp size={15} /> {file ? "Boshqa PDF" : "PDF tanlash"}
        </button>
        {file && (
          <span className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs text-[#12213D]/70 ring-1 ring-[#12213D]/10">
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            {!busy && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  reset();
                }}
                aria-label="PDF'ni olib tashlash"
                className="text-[#12213D]/40 hover:text-red-500"
              >
                <LuX size={12} />
              </button>
            )}
          </span>
        )}
        {file && !result && (
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-[#087fd1] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#066fb8] disabled:opacity-50"
          >
            {busy ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuSparkles size={15} />}
            {busy ? "AI o'qimoqda..." : "AI bilan testni tuzish"}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3 empty:hidden">
        {error && <p className="text-xs text-red-600">{error}</p>}
        {busy && progress && <ImportProgress progress={progress} />}
        {failed.length > 0 && <FailedChunks failed={failed} busy={busy} progress={progress} onRetry={retryFailed} />}

        {result && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {SECTIONS.map((s) => {
                const mods = MODULES.filter((m) => result[s.id][m.key].length);
                const count = mods.reduce((n, m) => n + result[s.id][m.key].length, 0);
                return (
                  <div key={s.id} className="rounded-xl bg-white p-4 ring-1 ring-[#12213D]/[0.07]">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-[#12213D]">{s.title}</p>
                      <p className="text-xs font-semibold tabular-nums text-[#12213D]/45">{count} ta savol</p>
                    </div>
                    {mods.length === 0 ? (
                      <p className="mt-2 text-xs text-[#12213D]/40">PDF'da bu bo'lim topilmadi</p>
                    ) : (
                      <ul className="mt-2 space-y-1 text-[13px]">
                        {mods.map((m) => {
                          const list = result[s.id][m.key];
                          const review = list.filter((q) => q.aiGenerated).length;
                          return (
                            <li key={m.key} className="flex items-center justify-between gap-2">
                              <span className="text-[#12213D]/70">{m.label}</span>
                              <span className="tabular-nums font-semibold text-[#12213D]">
                                {list.length}
                                {review > 0 && <span className="ml-1.5 text-[11px] font-semibold text-violet-600">({review} tekshirish)</span>}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs leading-relaxed text-[#12213D]/55">
              Jami <strong>{all.length}</strong> ta savol.{" "}
              {result.rw.module2Mixed.length + result.math.module2Mixed.length > 0 &&
                "PDF'da Module 2 oson/qiyin deb ajratilmagan — u barcha talabalar oladigan bitta Module 2 sifatida qo'yiladi. "}
              {flagged > 0 && (
                <>
                  <strong className="text-violet-700">{flagged} ta savol</strong> (grafikli, kalitsiz yoki shubhali) "AI · tekshirish kerak"
                  belgisi bilan qo'shiladi — ularni tasdiqlamaguncha test saqlanmaydi.{" "}
                </>
              )}
              {result.unlabeled > 0 && `${result.unlabeled} ta savolning moduli aniqlanmadi — Module 1 ga qo'yildi. `}
            </p>

            {applied ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                <LuCircleCheck size={16} /> Savollar modullarga joylandi. Pastda tekshirib, testni saqlang.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={apply}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-xl bg-[#087fd1] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#066fb8] disabled:opacity-50"
                >
                  <LuCircleCheck size={15} /> {all.length} ta savolni testga joylash
                </button>
                {failed.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-700">
                    <LuTriangleAlert size={13} /> Avval o'qilmagan bo'laklarni qayta yuborish tavsiya etiladi
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
