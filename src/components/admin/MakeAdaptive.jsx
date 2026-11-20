import { useState } from "react";
import { LuGitBranch, LuLoaderCircle } from "react-icons/lu";
import { api } from "../../api/client";
import { fromBank } from "../../utils/bankQuestion";
import { adaptFixedTest } from "../../utils/adaptiveAssembler";
import { RW_DOMAINS } from "../../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../../data/mathDomains";

// ------------------------------------------------------------------
// PDF'dan import qilingan testni adaptiv qilish (SessionForm). Bunday
// testda Module 2 bitta ("Aralash"). Tugma bosilganda u qiyinligiga qarab
// "Qiyin" (yoki "Oson") variantga o'tadi, ikkinchi variant savol bankidan
// shu hajmda yig'iladi. PDF savollari o'zgarmaydi. Natijani admin pastdagi
// modul tahrirlagichlarida ko'rib chiqib, testni saqlaydi.
// ------------------------------------------------------------------

const DOMAINS = { rw: RW_DOMAINS, math: MATH_DOMAINS };
const TITLES = { rw: "Reading and Writing", math: "Math" };
const ROUTE_LABEL = { module2Hard: "Qiyin", module2Easy: "Oson" };

async function loadBank(subject) {
  const files = await Promise.all(
    DOMAINS[subject].map((d) =>
      api.get(`/admin/question-bank?file=${encodeURIComponent(`${subject}-${d.id}`)}`).catch(() => [])
    )
  );
  return files.flat().map(fromBank);
}

// sections: { rw: { module1, module2Mixed }, math: {...} } — faqat aylantirish kerak bo'lganlari.
export default function MakeAdaptive({ sections, onApply }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);

  const ids = Object.keys(sections);
  if (ids.length === 0 && notes.length === 0) return null;

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const out = {};
      const lines = [];
      for (const id of ids) {
        const { module1, module2Mixed } = sections[id];
        const bank = await loadBank(id);
        if (!bank.length) throw new Error("Savol banki yuklanmadi. Qaytadan urinib ko'ring.");
        const r = adaptFixedTest({ subject: id, module1, module2: module2Mixed, bank });
        out[id] = { module2Easy: r.module2Easy, module2Hard: r.module2Hard };
        const otherLabel = r.pdfRoute === "module2Hard" ? "Oson" : "Qiyin";
        const short = r.report.bank.total < r.report.bank.size;
        lines.push(
          `${TITLES[id]}: PDF'dagi Module 2 (${r.report.pdf.total} ta) — "${ROUTE_LABEL[r.pdfRoute]}" variant; ` +
            `"${otherLabel}" variant savol bankidan ${r.report.bank.total}/${r.report.bank.size} ta ` +
            `(oson ${r.report.bank.easy} · o'rta ${r.report.bank.medium} · qiyin ${r.report.bank.hard}).` +
            (short ? " To'liq emas — qo'lda qo'shing." : "")
        );
      }
      onApply(out);
      setNotes(lines);
    } catch (err) {
      setError(err.message || "Adaptiv qilishda xatolik.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-amber-300/60 bg-amber-50 p-4">
      {ids.length > 0 && (
        <>
          <p className="text-sm font-semibold text-ink">Bu test hozir adaptiv emas</p>
          <p className="text-xs leading-relaxed text-ink/65">
            {ids.map((id) => TITLES[id]).join(" va ")} bo'limida Module 2 bitta — hamma talaba bir xil savollarni
            oladi. Haqiqiy Digital SAT'dagi kabi adaptiv qilish uchun tugmani bosing: PDF'dagi Module 2 qiyinligiga
            qarab "Qiyin" yoki "Oson" variant bo'ladi, ikkinchi variant savol bankidan yig'iladi. PDF savollari
            o'zgarmaydi. Talaba Module 1 natijasiga qarab mos variantni oladi.
          </p>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-press disabled:opacity-50"
          >
            {busy ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuGitBranch size={15} />}
            {busy ? "Yig'ilmoqda..." : "Testni adaptiv qilish"}
          </button>
        </>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {notes.length > 0 && (
        <div className="space-y-1 text-xs leading-relaxed text-emerald-800">
          {notes.map((n) => (
            <p key={n}>✓ {n}</p>
          ))}
          <p className="text-ink/55">Pastdagi modullarni ko'rib chiqing va testni saqlang.</p>
        </div>
      )}
    </div>
  );
}
