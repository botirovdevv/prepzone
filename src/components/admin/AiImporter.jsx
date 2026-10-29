import { useRef, useState } from "react";
import { LuFileUp, LuLoaderCircle, LuSparkles, LuTriangleAlert, LuX } from "react-icons/lu";
import { sanitizeRichText } from "../../utils/sanitizeHtml";
import { newQuestionId } from "../../utils/questionId";
import { DIFFICULTIES } from "../../utils/bankQuestion";
import { checkFileLimits, usePdfImport } from "../../hooks/usePdfImport";
import { FailedChunks, ImportProgress } from "./ImportProgress";

// ------------------------------------------------------------------
// AI import: PDF / rasm (skrinshot) yoki joylashtirilgan matndan savollarni
// Gemini orqali ajratib oladi (server/src/routes/ai.js). Natija avval shu
// yerda ko'rib chiqiladi: javob kaliti yo'q yoki variantlari to'liq bo'lmagan
// savolni qo'shib bo'lmaydi, shubhalilari sariq belgilanadi.
// Katta PDF bo'laklab, parallel o'qiladi (hooks/usePdfImport.js).
// ------------------------------------------------------------------

const fieldClass =
  "rounded-lg border border-[#12213D]/12 bg-white px-2 py-1 text-xs outline-none focus:border-[#087fd1] focus:ring-2 focus:ring-[#087fd1]/15";

const isBlocked = (q) =>
  q.type === "spr" ? !q.answers?.length : !q.correctAnswer || q.choices.some((c) => !c.text.trim());

export default function AiImporter({ subject, domainOptions, onImport }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [items, setItems] = useState(null);
  const [moduleFilter, setModuleFilter] = useState("all");
  const fileRef = useRef(null);
  const { busy, progress, failed, start, retry, reset } = usePdfImport();

  const pickFiles = (e) => {
    const picked = [...(e.target.files || [])];
    e.target.value = "";
    const next = [...files, ...picked].slice(0, 10);
    const limitError = checkFileLimits(next);
    if (limitError) {
      setError(limitError);
      return;
    }
    setError("");
    setFiles(next);
  };

  const show = (found) =>
    setItems(found.length ? found.map((q) => ({ ...q, key: newQuestionId(), include: !isBlocked(q) })) : null);

  const run = async () => {
    setError("");
    setModuleFilter("all");
    try {
      const found = await start({ subject, files, text });
      show(found);
      if (!found.length) setError("Materialdan savol topilmadi.");
    } catch (err) {
      setError(err.message);
    }
  };

  const retryFailed = async () => {
    setError("");
    show(await retry());
  };

  const update = (key, patch) =>
    setItems((prev) =>
      prev.map((q) => {
        if (q.key !== key) return q;
        const next = { ...q, ...patch };
        return { ...next, include: patch.include ?? (q.include && !isBlocked(next)) };
      })
    );

  const modules = [...new Set((items || []).map((q) => q.module).filter(Boolean))].sort();
  const visible = (items || []).filter((q) => moduleFilter === "all" || q.module === moduleFilter);
  const selected = visible.filter((q) => q.include && !isBlocked(q));

  const addSelected = () => {
    onImport(
      selected.map((q) => ({
        id: newQuestionId(),
        // AI matematikani <sup>/<sub> bilan yozadi — QuestionPanel HTML sifatida ko'rsatadi.
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
      }))
    );
    // Bitta modul qo'shilgan bo'lsa — qolgan modullar savollari keyingi modulga
    // qo'shish uchun ro'yxatda qoladi.
    const rest = moduleFilter === "all" ? [] : items.filter((q) => q.module !== moduleFilter);
    if (rest.length) {
      setItems(rest);
      setModuleFilter("all");
      return;
    }
    setItems(null);
    setText("");
    setFiles([]);
    reset();
  };

  if (items) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#12213D]/60">
            {visible.length} ta savol topildi · {selected.length} tasi tanlangan. Har birini tekshiring.
          </p>
          <button
            type="button"
            onClick={() => {
              setItems(null);
              reset();
            }}
            className="text-xs font-semibold text-[#12213D]/50 hover:text-[#12213D]"
          >
            Bekor qilish
          </button>
        </div>

        {modules.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#12213D]/45">Modul:</span>
            {["all", ...modules].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModuleFilter(m)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  moduleFilter === m ? "bg-[#12213D] text-white" : "bg-[#12213D]/5 text-[#12213D]/60 hover:bg-[#12213D]/10"
                }`}
              >
                {m === "all" ? "Hammasi" : `Module ${m}`} ({m === "all" ? items.length : items.filter((q) => q.module === m).length})
              </button>
            ))}
          </div>
        )}

        {failed.length > 0 && <FailedChunks failed={failed} busy={busy} progress={progress} onRetry={retryFailed} />}

        <div className="max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
          {visible.map((q, i) => {
            const blocked = isBlocked(q);
            return (
              <div
                key={q.key}
                className={`rounded-xl border p-3 text-sm ${
                  q.issues.length ? "border-amber-300 bg-amber-50/50" : "border-[#12213D]/8 bg-[#12213D]/[0.02]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={q.include && !blocked}
                    disabled={blocked}
                    onChange={(e) => update(q.key, { include: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-[#087fd1]"
                    aria-label={`${i + 1}-savolni qo'shish`}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    {q.passage && (
                      <p
                        className="line-clamp-3 text-xs leading-relaxed text-[#12213D]/55"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(q.passage) }}
                      />
                    )}
                    <p className="font-medium text-[#12213D]">
                      {q.number || i + 1}. {q.prompt}
                    </p>

                    {q.type === "mcq" ? (
                      <div className="grid gap-1 sm:grid-cols-2">
                        {q.choices.map((c) => (
                          <button
                            key={c.label}
                            type="button"
                            onClick={() => update(q.key, { correctAnswer: c.label })}
                            title="To'g'ri javob deb belgilash"
                            className={`flex gap-1.5 rounded-lg px-2 py-1 text-left text-xs transition ${
                              q.correctAnswer === c.label
                                ? "bg-emerald-500/12 font-semibold text-emerald-800"
                                : "text-[#12213D]/70 hover:bg-[#12213D]/5"
                            }`}
                          >
                            <span className="font-bold">{c.label})</span>
                            <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.text) || "<em>bo'sh</em>" }} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#12213D]/70">
                        Javob (yozma): <strong>{q.answers?.join(", ") || "—"}</strong>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={q.difficulty}
                        onChange={(e) => update(q.key, { difficulty: e.target.value })}
                        className={fieldClass}
                        aria-label="Qiyinlik"
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      {domainOptions && (
                        <select
                          value={q.domain}
                          onChange={(e) => update(q.key, { domain: e.target.value })}
                          className={fieldClass}
                          aria-label="Mavzu"
                        >
                          <option value="">— mavzu —</option>
                          {domainOptions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {q.type === "mcq" && !q.correctAnswer && (
                        <span className="text-[11px] font-semibold text-red-600">Variantni bosib to'g'ri javobni belgilang</span>
                      )}
                    </div>

                    {q.issues.length > 0 && (
                      <p className="flex items-start gap-1.5 text-[11px] text-amber-800">
                        <LuTriangleAlert size={13} className="mt-px shrink-0" />
                        {q.issues.join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addSelected}
          disabled={selected.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-[#087fd1] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#066fb8] disabled:opacity-40"
        >
          <LuSparkles size={15} /> {selected.length} ta savolni qo'shish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-[#12213D]/45">
        PDF yoki savol rasmlarini (skrinshot) yuklang, yoki Word/PDF dan matnni nusxalab joylashtiring. AI savollarni,
        variantlarni, javob kalitini, qiyinlik va mavzuni ajratib beradi — qo'shishdan oldin tekshirasiz.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Savollar matnini shu yerga joylashtiring (javoblar kaliti bo'lsa, uni ham qo'shing)..."
        rows={6}
        className="w-full rounded-xl border border-[#12213D]/12 px-3 py-2 text-sm outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10"
      />

      <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple onChange={pickFiles} className="hidden" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-[#087fd1]/8 px-3.5 py-2 text-sm font-semibold text-[#087fd1] transition hover:bg-[#087fd1]/12"
        >
          <LuFileUp size={15} /> PDF yoki rasm yuklash
        </button>
        {files.map((f, i) => (
          <span key={`${f.name}-${i}`} className="flex items-center gap-1 rounded-lg bg-[#12213D]/5 px-2 py-1 text-xs text-[#12213D]/70">
            {f.name}
            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              aria-label={`${f.name} ni olib tashlash`}
              className="text-[#12213D]/40 hover:text-red-500"
            >
              <LuX size={12} />
            </button>
          </span>
        ))}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {failed.length > 0 && <FailedChunks failed={failed} busy={busy} progress={progress} onRetry={retryFailed} />}

      {busy && progress && <ImportProgress progress={progress} />}

      <button
        type="button"
        onClick={run}
        disabled={busy || (!text.trim() && files.length === 0)}
        className="flex items-center gap-1.5 rounded-xl bg-[#087fd1] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#066fb8] disabled:opacity-40"
      >
        {busy ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuSparkles size={15} />}
        {busy ? "AI o'qimoqda..." : "AI bilan ajratish"}
      </button>
    </div>
  );
}
