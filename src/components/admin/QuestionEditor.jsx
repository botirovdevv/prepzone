import { useRef, useState } from "react";
import {
  LuPlus,
  LuTrash2,
  LuChevronDown,
  LuChevronUp,
  LuImage,
  LuImageOff,
  LuLoaderCircle,
  LuLayers,
  LuSparkles,
  LuCircleAlert,
} from "react-icons/lu";
import { compressImageToDataUrl } from "../../utils/imageCompress";
import { parseBulkQuestions } from "../../utils/parseBulkQuestions";

const emptyForm = {
  passage: "",
  prompt: "",
  choices: ["", "", "", ""],
  correctAnswer: "A",
  image: null,
  domain: "",
};

const BULK_PLACEHOLDER = `Passage: (ixtiyoriy)

Savol matni shu yerga...

A) 1-variant
B) 2-variant
C) 3-variant
D) 4-variant

Javob: B

---

Keyingi savol...`;

export default function QuestionEditor({
  title,
  questions,
  onChange,
  showPassage,
  allowImage = true,
  domainOptions, // ixtiyoriy: [{id, label, hint}]
  promptTemplates, // ixtiyoriy: { [domainId]: [{label, text}] }
}) {
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("single"); // "single" | "bulk"
  const [bulkText, setBulkText] = useState("");
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkAdded, setBulkAdded] = useState(0);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImageError("");
    setImageBusy(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      setImageError("Rasmni yuklab bo'lmadi. Qaytadan urinib ko'ring.");
    } finally {
      setImageBusy(false);
    }
  };

  const nextId = () => (questions[questions.length - 1]?.id || 0) + 1;

  const addQuestion = () => {
    if (!form.prompt.trim() || form.choices.some((c) => !c.trim())) return;
    const q = {
      id: nextId(),
      passage: showPassage ? form.passage.trim() : "",
      prompt: form.prompt.trim(),
      choices: form.choices.map((text, i) => ({ label: "ABCD"[i], text: text.trim() })),
      correctAnswer: form.correctAnswer,
      image: form.image || null,
      domain: form.domain || "",
    };
    onChange([...questions, q]);
    // Domainni tozalamaymiz — bir bo'limdan ketma-ket bir nechta savol
    // qo'shilganda qayta tanlashning hojati bo'lmasin.
    setForm((f) => ({ ...emptyForm, domain: f.domain }));
  };

  const removeQuestion = (id) => onChange(questions.filter((q) => q.id !== id));

  const handleBulkAdd = () => {
    const { items, errors } = parseBulkQuestions(bulkText);
    setBulkErrors(errors);
    if (items.length === 0) {
      setBulkAdded(0);
      return;
    }
    let idCounter = nextId();
    const withMeta = items.map((it) => ({
      ...it,
      id: idCounter++,
      image: null,
      domain: form.domain || "",
    }));
    onChange([...questions, ...withMeta]);
    setBulkAdded(items.length);
    setBulkText("");
  };

  const templates = form.domain ? promptTemplates?.[form.domain] : null;

  return (
    <div className="border border-[#12213D]/10 rounded-2xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-[#12213D]/[0.025]"
      >
        <span className="font-semibold text-sm text-[#12213D]">
          {title}{" "}
          <span className="text-[#12213D]/35 font-normal">({questions.length} ta savol)</span>
        </span>
        {open ? <LuChevronUp size={16} /> : <LuChevronDown size={16} />}
      </button>

      {open && (
        <div className="p-4 space-y-4">
          {questions.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="flex items-start gap-2.5 bg-[#12213D]/[0.02] border border-[#12213D]/6 rounded-xl p-3 text-sm"
                >
                  <span className="font-bold text-[#12213D]/35 shrink-0">{i + 1}.</span>
                  {q.image && (
                    <img
                      src={q.image}
                      alt=""
                      className="w-10 h-10 rounded-md object-cover border border-[#12213D]/10 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#12213D]/75 line-clamp-2">{q.prompt}</p>
                    {q.domain && domainOptions && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-[#087fd1] bg-[#087fd1]/8 px-1.5 py-0.5 rounded">
                        {domainOptions.find((d) => d.id === q.domain)?.label || q.domain}
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#0E9A6C] bg-[#12B981]/10 px-2 py-0.5 rounded">
                    {q.correctAnswer}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="shrink-0 text-red-400 hover:text-red-600"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#12213D]/8 pt-4 space-y-3">
            {/* Bittalab / Ko'plab (bulk) rejim almashtirgich */}
            <div className="flex gap-1.5 bg-[#12213D]/[0.04] p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "single" ? "bg-white text-[#12213D] shadow-sm" : "text-[#12213D]/50"
                }`}
              >
                Bittalab qo'shish
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "bulk" ? "bg-white text-[#12213D] shadow-sm" : "text-[#12213D]/50"
                }`}
              >
                <LuLayers size={13} /> Ko'plab qo'shish
              </button>
            </div>

            {/* Mavzu bloki (domain) — ikkala rejimda ham umumiy */}
            {domainOptions && (
              <div>
                <label className="block text-xs font-semibold text-[#12213D]/55 mb-1.5">
                  Mavzu bloki (domain)
                </label>
                <select
                  value={form.domain}
                  onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                  className="w-full rounded-xl border border-[#12213D]/15 px-3 py-2 text-sm outline-none focus:border-[#087fd1] bg-white"
                >
                  <option value="">— tanlanmagan —</option>
                  {domainOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {form.domain && domainOptions.find((d) => d.id === form.domain)?.hint && (
                  <p className="text-[11px] text-[#12213D]/40 mt-1">
                    {domainOptions.find((d) => d.id === form.domain).hint}
                  </p>
                )}
              </div>
            )}

            {mode === "single" ? (
              <>
                {showPassage && (
                  <textarea
                    value={form.passage}
                    onChange={(e) => setForm({ ...form, passage: e.target.value })}
                    placeholder="Passage (matn) — ixtiyoriy"
                    rows={3}
                    className="w-full rounded-xl border border-[#12213D]/15 px-3 py-2 text-sm outline-none focus:border-[#087fd1]"
                  />
                )}

                {templates && templates.length > 0 && (
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#12213D]/55 mb-1.5">
                      <LuSparkles size={13} className="text-[#087fd1]" />
                      Tez shablon — bosing, savol maydoni to'ldiriladi
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {templates.map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, prompt: t.text }))}
                          className="text-xs font-medium text-[#087fd1] bg-[#087fd1]/8 hover:bg-[#087fd1]/15 px-2.5 py-1.5 rounded-lg transition"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="Savol matni"
                  rows={2}
                  className="w-full rounded-xl border border-[#12213D]/15 px-3 py-2 text-sm outline-none focus:border-[#087fd1]"
                />

                {allowImage && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImagePick}
                      className="hidden"
                    />
                    {form.image ? (
                      <div className="flex items-center gap-3 bg-[#12213D]/[0.02] border border-[#12213D]/10 rounded-xl p-2.5">
                        <img
                          src={form.image}
                          alt="Yuklangan rasm"
                          className="w-16 h-16 rounded-lg object-cover border border-[#12213D]/10"
                        />
                        <div className="flex-1 text-xs text-[#12213D]/50">Rasm biriktirildi</div>
                        <button
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, image: null }))}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          <LuImageOff size={14} /> O'chirish
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageBusy}
                        className="flex items-center gap-2 text-sm font-semibold text-[#087fd1] bg-[#087fd1]/8 hover:bg-[#087fd1]/12 px-3.5 py-2 rounded-xl transition disabled:opacity-60"
                      >
                        {imageBusy ? (
                          <LuLoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <LuImage size={15} />
                        )}
                        {imageBusy ? "Yuklanmoqda..." : "Rasm biriktirish (grafik, diagramma)"}
                      </button>
                    )}
                    {imageError && <p className="text-xs text-red-500 mt-1.5">{imageError}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {form.choices.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 text-xs font-bold text-[#12213D]/35">{"ABCD"[i]}</span>
                      <input
                        value={c}
                        onChange={(e) => {
                          const next = [...form.choices];
                          next[i] = e.target.value;
                          setForm({ ...form, choices: next });
                        }}
                        placeholder={`${"ABCD"[i]} varianti`}
                        className="flex-1 rounded-xl border border-[#12213D]/15 px-3 py-1.5 text-sm outline-none focus:border-[#087fd1]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-[#12213D]/55">To'g'ri javob:</label>
                  <select
                    value={form.correctAnswer}
                    onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                    className="rounded-xl border border-[#12213D]/15 px-2 py-1.5 text-sm outline-none focus:border-[#087fd1]"
                  >
                    {["A", "B", "C", "D"].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="ml-auto flex items-center gap-1.5 bg-[#087fd1] text-white text-sm font-semibold px-3.5 py-1.5 rounded-xl hover:bg-[#066fb8]"
                  >
                    <LuPlus size={15} /> Qo'shish
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-[#12213D]/45 leading-relaxed">
                  Bir nechta savolni pastdagi qutiga joylashtiring — har birini{" "}
                  <code className="bg-[#12213D]/6 px-1 rounded">---</code> bilan ajrating. Har
                  savolda <code className="bg-[#12213D]/6 px-1 rounded">A)</code>–
                  <code className="bg-[#12213D]/6 px-1 rounded">D)</code> variantlar va{" "}
                  <code className="bg-[#12213D]/6 px-1 rounded">Javob: B</code> qatori bo'lishi shart.
                </p>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={BULK_PLACEHOLDER}
                  rows={10}
                  className="w-full rounded-xl border border-[#12213D]/15 px-3 py-2 text-sm font-mono outline-none focus:border-[#087fd1]"
                />

                {bulkErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
                    {bulkErrors.map((err, i) => (
                      <p key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                        <LuCircleAlert size={13} className="shrink-0 mt-0.5" />
                        {err}
                      </p>
                    ))}
                  </div>
                )}
                {bulkAdded > 0 && bulkErrors.length === 0 && (
                  <p className="text-xs text-emerald-600 font-semibold">
                    {bulkAdded} ta savol qo'shildi ✓
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleBulkAdd}
                  disabled={!bulkText.trim()}
                  className="flex items-center gap-1.5 bg-[#087fd1] text-white text-sm font-semibold px-3.5 py-2 rounded-xl hover:bg-[#066fb8] disabled:opacity-40"
                >
                  <LuLayers size={15} /> Barchasini qo'shish
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
