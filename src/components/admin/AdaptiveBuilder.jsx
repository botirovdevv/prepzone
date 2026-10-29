import { useState } from "react";
import { LuDatabase, LuLoaderCircle, LuShuffle, LuWandSparkles } from "react-icons/lu";
import { api } from "../../api/client";
import { fromBank } from "../../utils/bankQuestion";
import { newQuestionId } from "../../utils/questionId";
import { MODULE_SIZE, addToModule, assembleAdaptive } from "../../utils/adaptiveAssembler";
import QuestionEditor from "./QuestionEditor";

// ------------------------------------------------------------------
// "Adaptiv yig'ish": admin bo'limning barcha savollarini (masalan 54 RW yoki
// 44 Math) bitta pool'ga qo'shadi; tizim ularni qiyinlik bo'yicha Module 1 /
// Module 2 Oson / Module 2 Qiyin ga taqsimlaydi va yetishmaganini savol
// bankidan yoki AI bilan to'ldiradi. Natija pastdagi modul tahrirlagichlariga
// yoziladi — u yerda qo'lda o'zgartirish mumkin.
// ------------------------------------------------------------------

const MODULE_LABELS = { module1: "Module 1", module2Easy: "Module 2 — Oson", module2Hard: "Module 2 — Qiyin" };
const AI_BATCH = 10;

export default function AdaptiveBuilder({ subject, domainOptions, promptTemplates, showPassage, hasModules, onApply }) {
  const [pool, setPool] = useState([]);
  const [source, setSource] = useState("bank"); // "bank" | "ai"
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);

  const size = MODULE_SIZE[subject];

  const loadBank = async () => {
    const files = await Promise.all(
      domainOptions.map((d) => api.get(`/admin/question-bank?file=${encodeURIComponent(`${subject}-${d.id}`)}`).catch(() => []))
    );
    return files.flat().map(fromBank);
  };

  // Yetishmagan joylar uchun AI savol yaratadi (bir xil domen savollari uslub namunasi).
  const generate = async (specs) => {
    const out = [];
    for (let i = 0; i < specs.length; i += AI_BATCH) {
      const batch = specs.slice(i, i + AI_BATCH);
      setBusy(`AI savol yaratmoqda... ${i}/${specs.length}`);
      const examples = pool
        .filter((q) => batch.some((s) => s.domain === q.domain) && q.type !== "spr")
        .slice(0, 3)
        .map(({ passage, prompt, choices, correctAnswer }) => ({ passage, prompt, choices, correctAnswer }));
      const { items } = await api.post("/admin/ai/generate-questions", { subject, items: batch, examples });
      out.push(...items.map((q) => ({ ...q, id: newQuestionId(), html: true, image: null, aiReviewed: false })));
    }
    return out;
  };

  const build = async () => {
    if (hasModules && !window.confirm("Bu bo'limdagi mavjud modullar yangi yig'ilgan savollar bilan almashtiriladi. Davom etasizmi?")) return;
    setError("");
    setReport(null);
    try {
      setBusy(source === "bank" ? "Savol banki yuklanmoqda..." : "Taqsimlanmoqda...");
      const bank = source === "bank" ? await loadBank() : [];
      const result = assembleAdaptive({ subject, pool, bank });

      let aiNote = "";
      if (source === "ai") {
        const wanted = Object.values(result.missing).flat().length;
        let made = 0;
        try {
          // Har modul alohida — AI biror savolni tashlab ketsa ham boshqa modulga o'tib ketmaydi.
          for (const [m, specs] of Object.entries(result.missing)) {
            if (!specs.length) continue;
            const mine = await generate(specs);
            result[m] = addToModule(subject, result[m], mine);
            result.report[m].ai += mine.length;
            result.report[m].total += mine.length;
            made += mine.length;
          }
          if (made < wanted) aiNote = `AI ${wanted} tadan ${made} ta savol yaratdi.`;
        } catch (err) {
          aiNote = `AI to'ldirish to'xtadi (${made}/${wanted}): ${err.message}`;
        }
      }

      onApply({ module1: result.module1, module2Easy: result.module2Easy, module2Hard: result.module2Hard });
      setReport(result.report);
      const short = Object.values(result.report).some((r) => r.total < size);
      if (aiNote || short) {
        setError(
          [aiNote, short ? "Ba'zi modullar to'liq emas — ko'proq savol qo'shing yoki boshqa manbadan to'ldiring." : ""]
            .filter(Boolean)
            .join(" ")
        );
      }
    } catch (err) {
      setError(err.message || "Yig'ishda xatolik.");
    } finally {
      setBusy("");
    }
  };

  const sourceButton = (value, Icon, label) => (
    <button
      type="button"
      onClick={() => setSource(value)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        source === value ? "bg-white text-[#12213D] shadow-sm" : "text-[#12213D]/50"
      }`}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div className="space-y-3 rounded-2xl border border-[#087fd1]/20 bg-[#087fd1]/[0.03] p-4">
      <div>
        <p className="text-sm font-semibold text-[#12213D]">Adaptiv yig'ish (tavsiya etiladi)</p>
        <p className="mt-1 text-xs leading-relaxed text-[#12213D]/55">
          Bo'limning barcha savollarini shu yerga qo'shing (haqiqiy SAT'da {subject === "rw" ? "54" : "44"} ta) va har
          biriga qiyinlik belgilang. Tizim ularni Module 1 ({size}) va Module 2 ning Oson/Qiyin variantlariga ({size}
          tadan) taqsimlaydi, yetmaganini to'ldiradi. Talaba Module 1 natijasiga qarab mos Module 2 ni oladi.
        </p>
      </div>

      <QuestionEditor
        title="Savollar pool'i"
        questions={pool}
        onChange={setPool}
        showPassage={showPassage}
        domainOptions={domainOptions}
        promptTemplates={promptTemplates}
        bankSubject={subject}
      />

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-[#12213D]/55">Yetishmaganini to'ldirish:</span>
        <div className="flex gap-1 rounded-xl bg-[#12213D]/[0.05] p-1">
          {sourceButton("bank", LuDatabase, "Savol bankidan")}
          {sourceButton("ai", LuWandSparkles, "AI bilan yaratish")}
        </div>
        <button
          type="button"
          onClick={build}
          disabled={!!busy || pool.length === 0}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#087fd1] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#066fb8] disabled:opacity-40"
        >
          {busy ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuShuffle size={15} />}
          {busy || "Adaptiv test yig'ish"}
        </button>
      </div>
      {source === "ai" && (
        <p className="text-[11px] leading-relaxed text-[#12213D]/45">
          AI yaratgan savollar "AI · tekshirish kerak" deb belgilanadi — har birini ochib, javobini tekshirib
          tasdiqlamaguningizcha testni saqlab bo'lmaydi.
        </p>
      )}

      {error && <p className="text-xs text-amber-700">{error}</p>}

      {report && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead className="text-[#12213D]/45">
              <tr>
                <th className="py-1.5 pr-3 font-semibold">Modul</th>
                <th className="px-2 font-semibold">Jami</th>
                <th className="px-2 font-semibold">Oson / O'rta / Qiyin</th>
                <th className="px-2 font-semibold">Sizniki</th>
                <th className="px-2 font-semibold">Bank</th>
                <th className="px-2 font-semibold">AI</th>
              </tr>
            </thead>
            <tbody className="text-[#12213D]">
              {Object.entries(report).map(([m, r]) => (
                <tr key={m} className="border-t border-[#12213D]/6">
                  <td className="py-1.5 pr-3 font-semibold">{MODULE_LABELS[m]}</td>
                  <td className={`px-2 tabular-nums ${r.total < r.size ? "text-amber-700" : ""}`}>
                    {r.total}/{r.size}
                  </td>
                  <td className="px-2 tabular-nums">
                    {r.easy} / {r.medium} / {r.hard}
                  </td>
                  <td className="px-2 tabular-nums">{r.admin}</td>
                  <td className="px-2 tabular-nums">{r.bank}</td>
                  <td className="px-2 tabular-nums">{r.ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-[#12213D]/45">
            Modullar pastga yozildi — u yerda savollarni ko'rish, o'chirish yoki qiyinligini o'zgartirish mumkin.
          </p>
        </div>
      )}
    </div>
  );
}
