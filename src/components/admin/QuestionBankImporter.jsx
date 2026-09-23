import { useState } from "react";
import { LuDatabase, LuLoaderCircle, LuCircleCheck, LuCircleAlert } from "react-icons/lu";

// Har bir fan (subject) uchun statik JSON fayllar /public/question-bank/ ostida
// joylashgan: masalan "rw-craft-structure.json", "math-algebra.json".
// Fayl nomi: `${subject}-${domainId}.json`

const DIFFICULTIES = [
  { id: "easy", label: "Oson" },
  { id: "medium", label: "O'rta" },
  { id: "hard", label: "Qiyin" },
];

export default function QuestionBankImporter({ subject, domainOptions, existingQuestions, onImport }) {
  const [domainId, setDomainId] = useState(domainOptions?.[0]?.id || "");
  const [difficulties, setDifficulties] = useState(["easy", "medium", "hard"]);
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastImported, setLastImported] = useState(0);
  const [available, setAvailable] = useState(null);

  const toggleDifficulty = (id) => {
    setDifficulties((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const fetchBank = async (domain) => {
    const res = await fetch(`/question-bank/${subject}-${domain}.json`);
    if (!res.ok) {
      throw new Error("not-found");
    }
    return res.json();
  };

  const handlePreview = async (domain) => {
    setError("");
    setAvailable(null);
    try {
      const all = await fetchBank(domain);
      const existingIds = new Set((existingQuestions || []).map((q) => q.sourceId).filter(Boolean));
      const usable = all.filter((q) => difficulties.includes(q.difficulty) && !existingIds.has(q.sourceId));
      setAvailable(usable.length);
    } catch {
      setAvailable(null);
    }
  };

  const handleDomainChange = (id) => {
    setDomainId(id);
    handlePreview(id);
  };

  const handleImport = async () => {
    if (!domainId) return;
    setLoading(true);
    setError("");
    setLastImported(0);
    try {
      const all = await fetchBank(domainId);
      const existingIds = new Set((existingQuestions || []).map((q) => q.sourceId).filter(Boolean));
      let usable = all.filter((q) => difficulties.includes(q.difficulty) && !existingIds.has(q.sourceId));
      // Aralashtirib olamiz, shunda har safar bir xil savollar chiqavermaydi
      for (let i = usable.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [usable[i], usable[j]] = [usable[j], usable[i]];
      }
      const picked = usable.slice(0, count);
      if (picked.length === 0) {
        setError(
          "Bu mavzu/qiyinlik bo'yicha yangi savol topilmadi (balki hammasi allaqachon qo'shilgan)."
        );
        setLoading(false);
        return;
      }
      let idCounter = (existingQuestions?.[existingQuestions.length - 1]?.id || 0) + 1;
      const mapped = picked.map((q) => ({
        id: idCounter++,
        passage: q.passage || "",
        prompt: q.prompt,
        choices: q.choices,
        correctAnswer: q.correctAnswer,
        image: null,
        domain: q.domain,
        sourceId: q.sourceId,
      }));
      onImport(mapped);
      setLastImported(mapped.length);
      handlePreview(domainId);
    } catch (err) {
      setError("Bank faylini yuklab bo'lmadi. /public/question-bank/ papkasi joylashganini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#12213D]/45 leading-relaxed">
        College Board'ning rasmiy savollar bankidan tayyor savollarni to'g'ridan-to'g'ri shu
        bo'limga import qiling — qo'lda yozishning hojati yo'q.
      </p>

      {domainOptions && (
        <div>
          <label className="block text-xs font-semibold text-[#12213D]/55 mb-1.5">Mavzu</label>
          <select
            value={domainId}
            onChange={(e) => handleDomainChange(e.target.value)}
            className="w-full rounded-xl border border-[#12213D]/12 px-3 py-2 text-sm outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10 bg-white"
          >
            {domainOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#12213D]/55 mb-1.5">Qiyinlik darajasi</label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                toggleDifficulty(d.id);
                handlePreview(domainId);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                difficulties.includes(d.id)
                  ? "bg-[#087fd1] text-white border-[#087fd1]"
                  : "bg-white text-[#12213D]/50 border-[#12213D]/15"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#12213D]/55 mb-1.5">Nechta savol</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            className="w-24 rounded-xl border border-[#12213D]/12 px-3 py-2 text-sm outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10"
          />
        </div>
        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !domainId}
          className="flex items-center gap-1.5 bg-[#087fd1] text-white text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-[#066fb8] disabled:opacity-40"
        >
          {loading ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuDatabase size={15} />}
          {loading ? "Import qilinmoqda..." : "Import qilish"}
        </button>
        {available !== null && (
          <span className="text-xs text-[#12213D]/40 pb-2">{available} ta mavjud</span>
        )}
      </div>

      {error && (
        <p className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
          <LuCircleAlert size={13} className="shrink-0 mt-0.5" />
          {error}
        </p>
      )}
      {lastImported > 0 && !error && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
          <LuCircleCheck size={14} /> {lastImported} ta savol import qilindi ✓
        </p>
      )}
    </div>
  );
}
