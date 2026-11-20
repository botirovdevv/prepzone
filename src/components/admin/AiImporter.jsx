import { useRef, useState } from "react";
import { LuFileUp, LuLoaderCircle, LuSparkles, LuTriangleAlert, LuX } from "react-icons/lu";
import { api } from "../../api/client";
import { compressImageToDataUrl } from "../../utils/imageCompress";
import { sanitizeRichText } from "../../utils/sanitizeHtml";
import { newQuestionId } from "../../utils/questionId";
import { DIFFICULTIES } from "../../utils/bankQuestion";

// ------------------------------------------------------------------
// AI import: PDF / rasm (skrinshot) yoki joylashtirilgan matndan savollarni
// Gemini orqali ajratib oladi (server/src/routes/ai.js). Natija avval shu
// yerda ko'rib chiqiladi: javob kaliti yo'q yoki variantlari to'liq bo'lmagan
// savolni qo'shib bo'lmaydi, shubhalilari sariq belgilanadi.
// ------------------------------------------------------------------

const MAX_BYTES = 15 * 1024 * 1024;

const fieldClass =
  "rounded-lg border border-ink/12 bg-surface px-2 py-1 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent/15";

function readBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`${file.name} faylini o'qib bo'lmadi.`));
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

// Rasm OCR uchun yetarli aniqlikda siqiladi (savol rasmiga biriktirilmaydi).
async function toPart(file) {
  if (file.type === "application/pdf") return { mimeType: file.type, data: await readBase64(file) };
  const dataUrl = await compressImageToDataUrl(file, { maxWidth: 1800, quality: 0.85 });
  return { mimeType: "image/jpeg", data: dataUrl.split(",")[1] };
}

const isBlocked = (q) =>
  q.type === "spr" ? !q.answers?.length : !q.correctAnswer || q.choices.some((c) => !c.text.trim());

export default function AiImporter({ subject, domainOptions, onImport }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState(null);
  const fileRef = useRef(null);

  const pickFiles = (e) => {
    const picked = [...(e.target.files || [])];
    e.target.value = "";
    const next = [...files, ...picked].slice(0, 10);
    if (next.reduce((n, f) => n + f.size, 0) > MAX_BYTES) {
      setError("Fayllar jami 15 MB dan oshmasin. PDF katta bo'lsa, bo'lib yuklang.");
      return;
    }
    setError("");
    setFiles(next);
  };

  const run = async () => {
    setBusy(true);
    setError("");
    try {
      const parts = await Promise.all(files.map(toPart));
      const { items: found } = await api.post("/admin/ai/parse-questions", {
        subject,
        text: text.trim() || undefined,
        files: parts.length ? parts : undefined,
      });
      if (!found.length) setError("Materialdan savol topilmadi.");
      setItems(found.map((q) => ({ ...q, key: newQuestionId(), include: !isBlocked(q) })));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const update = (key, patch) =>
    setItems((prev) =>
      prev.map((q) => {
        if (q.key !== key) return q;
        const next = { ...q, ...patch };
        return { ...next, include: patch.include ?? (q.include && !isBlocked(next)) };
      })
    );

  const selected = (items || []).filter((q) => q.include && !isBlocked(q));

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
    setItems(null);
    setText("");
    setFiles([]);
  };

  if (items) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-ink/60">
            {items.length} ta savol topildi · {selected.length} tasi tanlangan. Har birini tekshiring.
          </p>
          <button type="button" onClick={() => setItems(null)} className="text-xs font-semibold text-ink/50 hover:text-ink">
            Bekor qilish
          </button>
        </div>

        <div className="max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
          {items.map((q, i) => {
            const blocked = isBlocked(q);
            return (
              <div
                key={q.key}
                className={`rounded-xl border p-3 text-sm ${
                  q.issues.length ? "border-amber-300 bg-amber-50/50" : "border-ink/8 bg-ink/[0.02]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={q.include && !blocked}
                    disabled={blocked}
                    onChange={(e) => update(q.key, { include: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-accent"
                    aria-label={`${i + 1}-savolni qo'shish`}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    {q.passage && (
                      <p
                        className="line-clamp-3 text-xs leading-relaxed text-ink/55"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(q.passage) }}
                      />
                    )}
                    <p className="font-medium text-ink">
                      {i + 1}. {q.prompt}
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
                                : "text-ink/70 hover:bg-ink/5"
                            }`}
                          >
                            <span className="font-bold">{c.label})</span>
                            <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.text) || "<em>bo'sh</em>" }} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink/70">
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
          className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-press disabled:opacity-40"
        >
          <LuSparkles size={15} /> {selected.length} ta savolni qo'shish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-ink/45">
        PDF yoki savol rasmlarini (skrinshot) yuklang, yoki Word/PDF dan matnni nusxalab joylashtiring. AI savollarni,
        variantlarni, javob kalitini, qiyinlik va mavzuni ajratib beradi — qo'shishdan oldin tekshirasiz.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Savollar matnini shu yerga joylashtiring (javoblar kaliti bo'lsa, uni ham qo'shing)..."
        rows={6}
        className="w-full rounded-xl border border-ink/12 px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
      />

      <input ref={fileRef} type="file" accept="application/pdf,image/*" multiple onChange={pickFiles} className="hidden" />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-accent/8 px-3.5 py-2 text-sm font-semibold text-accent transition hover:bg-accent/12"
        >
          <LuFileUp size={15} /> PDF yoki rasm yuklash
        </button>
        {files.map((f, i) => (
          <span key={`${f.name}-${i}`} className="flex items-center gap-1 rounded-lg bg-ink/5 px-2 py-1 text-xs text-ink/70">
            {f.name}
            <button
              type="button"
              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
              aria-label={`${f.name} ni olib tashlash`}
              className="text-ink/40 hover:text-red-500"
            >
              <LuX size={12} />
            </button>
          </span>
        ))}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="button"
        onClick={run}
        disabled={busy || (!text.trim() && files.length === 0)}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-press disabled:opacity-40"
      >
        {busy ? <LuLoaderCircle size={15} className="animate-spin" /> : <LuSparkles size={15} />}
        {busy ? "AI o'qimoqda... (1 daqiqagacha)" : "AI bilan ajratish"}
      </button>
    </div>
  );
}
