import { useState } from "react";
import { LuPlus, LuTrash2, LuChevronDown, LuChevronUp } from "react-icons/lu";

const emptyForm = { passage: "", prompt: "", choices: ["", "", "", ""], correctAnswer: "A" };

export default function QuestionEditor({ title, questions, onChange, showPassage }) {
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);

  const addQuestion = () => {
    if (!form.prompt.trim() || form.choices.some((c) => !c.trim())) return;
    const nextId = (questions[questions.length - 1]?.id || 0) + 1;
    const q = {
      id: nextId,
      passage: showPassage ? form.passage.trim() : "",
      prompt: form.prompt.trim(),
      choices: form.choices.map((text, i) => ({ label: "ABCD"[i], text: text.trim() })),
      correctAnswer: form.correctAnswer,
    };
    onChange([...questions, q]);
    setForm(emptyForm);
  };

  const removeQuestion = (id) => onChange(questions.filter((q) => q.id !== id));

  return (
    <div className="border border-[#0F1C30]/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0F1C30]/[0.03]"
      >
        <span className="font-semibold text-sm text-[#0F1C30]">
          {title}{" "}
          <span className="text-[#0F1C30]/40 font-normal">({questions.length} ta savol)</span>
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
                  className="flex items-start gap-2 bg-white border border-[#0F1C30]/8 rounded-lg p-3 text-sm"
                >
                  <span className="font-bold text-[#0F1C30]/40 shrink-0">{i + 1}.</span>
                  <p className="flex-1 text-[#0F1C30]/80 line-clamp-2">{q.prompt}</p>
                  <span className="shrink-0 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {q.correctAnswer}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="shrink-0 text-red-500 hover:text-red-700"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#0F1C30]/8 pt-4 space-y-3">
            {showPassage && (
              <textarea
                value={form.passage}
                onChange={(e) => setForm({ ...form, passage: e.target.value })}
                placeholder="Passage (matn) — ixtiyoriy"
                rows={3}
                className="w-full rounded-lg border border-[#0F1C30]/15 px-3 py-2 text-sm outline-none focus:border-[#0076FC]"
              />
            )}
            <textarea
              value={form.prompt}
              onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              placeholder="Savol matni"
              rows={2}
              className="w-full rounded-lg border border-[#0F1C30]/15 px-3 py-2 text-sm outline-none focus:border-[#0076FC]"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {form.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-xs font-bold text-[#0F1C30]/40">{"ABCD"[i]}</span>
                  <input
                    value={c}
                    onChange={(e) => {
                      const next = [...form.choices];
                      next[i] = e.target.value;
                      setForm({ ...form, choices: next });
                    }}
                    placeholder={`${"ABCD"[i]} varianti`}
                    className="flex-1 rounded-lg border border-[#0F1C30]/15 px-3 py-1.5 text-sm outline-none focus:border-[#0076FC]"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-[#0F1C30]/60">To'g'ri javob:</label>
              <select
                value={form.correctAnswer}
                onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                className="rounded-lg border border-[#0F1C30]/15 px-2 py-1.5 text-sm outline-none focus:border-[#0076FC]"
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
                className="ml-auto flex items-center gap-1.5 bg-[#0076FC] text-white text-sm font-semibold px-3.5 py-1.5 rounded-lg hover:bg-[#0062d1]"
              >
                <LuPlus size={15} /> Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
