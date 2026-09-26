import { LuCheck, LuX } from "react-icons/lu";

// ------------------------------------------------------------------
// IELTS savol guruhi (bitta "Questions X–Y" bloki).
// Test paytida: onAnswer / onFocus bilan ishlaydi.
// Natija sahifasida: `review` = { [n]: { correct, expected } } — javoblar
// o'zgartirilmaydi, to'g'ri/xato belgilanadi.
// ------------------------------------------------------------------

const CHOICES = {
  tfng: ["TRUE", "FALSE", "NOT GIVEN"],
  ynng: ["YES", "NO", "NOT GIVEN"],
};

function ReviewMark({ info }) {
  if (!info) return null;
  return info.correct ? (
    <LuCheck size={16} className="inline shrink-0 text-emerald-600" />
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-red-600">
      <LuX size={16} className="shrink-0" /> {info.expected}
    </span>
  );
}

function QNum({ n, current }) {
  return (
    <span
      className={`inline-flex h-6 min-w-[26px] shrink-0 items-center justify-center rounded px-1 text-[12px] font-bold ${
        current ? "bg-[#1d1d1b] text-white" : "border border-[#1d1d1b]/40 text-[#1d1d1b]"
      }`}
    >
      {n}
    </span>
  );
}

export default function QuestionGroup({ group, answers, onAnswer, currentQ, onFocus, review }) {
  const ns = group.questions.map((q) => q.n);
  const from = Math.min(...ns);
  const to = Math.max(...ns);
  const readOnly = !!review;

  const set = (n, v) => {
    if (readOnly) return;
    onAnswer(n, v);
    onFocus?.(n);
  };

  const inputFor = (q) => {
    const value = answers[q.n] ?? "";
    const info = review?.[q.n];
    return (
      <span className="mx-1 inline-flex items-center gap-1.5 align-middle">
        <input
          id={`q-${q.n}`}
          value={value}
          readOnly={readOnly}
          onChange={(e) => set(q.n, e.target.value)}
          onFocus={() => onFocus?.(q.n)}
          placeholder={String(q.n)}
          autoComplete="off"
          spellCheck={false}
          className={`h-8 w-40 rounded border bg-white px-2 text-center text-[14px] font-medium text-[#1d1d1b] outline-none placeholder:font-bold placeholder:text-[#1d1d1b]/35 focus:border-[#1d1d1b] focus:ring-2 focus:ring-[#1d1d1b]/15 ${
            info ? (info.correct ? "border-emerald-500" : "border-red-400") : currentQ === q.n ? "border-[#1d1d1b]" : "border-[#1d1d1b]/35"
          }`}
        />
        <ReviewMark info={info} />
      </span>
    );
  };

  return (
    <section className="mb-8">
      <h3 className="text-[15px] font-bold text-[#1d1d1b]">
        Questions {from}–{to}
      </h3>
      <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-[#1d1d1b]/80">{group.instructions}</p>

      {(group.type === "match" || group.type === "headings") && group.options && (
        <div className="mt-3 rounded border border-[#d7d7d7] bg-[#f7f7f7] p-3">
          {group.type === "headings" && <p className="mb-2 text-[13px] font-bold">List of Headings</p>}
          <ul className="space-y-1 text-[14px] text-[#1d1d1b]">
            {group.options.map((o) => (
              <li key={o.key} className="flex gap-3">
                <span className="w-7 shrink-0 font-bold">{o.key}</span>
                <span>{o.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {group.title && (
        <p className="mt-4 text-center text-[15px] font-bold text-[#1d1d1b]">{group.title}</p>
      )}

      <div className={`mt-3 ${group.type === "gap" ? "space-y-3" : "space-y-5"}`}>
        {group.questions.map((q) => {
          const current = currentQ === q.n;

          if (group.type === "gap") {
            const [before, after = ""] = q.text.split("___");
            return (
              <p
                key={q.n}
                id={`qwrap-${q.n}`}
                className="text-[15px] leading-9 text-[#1d1d1b]"
                onClick={() => onFocus?.(q.n)}
              >
                {before}
                {inputFor(q)}
                {after}
              </p>
            );
          }

          if (group.type === "mcq") {
            const info = review?.[q.n];
            return (
              <div key={q.n} id={`qwrap-${q.n}`} onClick={() => onFocus?.(q.n)}>
                <p className="flex items-start gap-2 text-[15px] font-medium text-[#1d1d1b]">
                  <QNum n={q.n} current={current} />
                  <span className="pt-0.5">{q.text}</span>
                  <span className="pt-0.5">
                    <ReviewMark info={info} />
                  </span>
                </p>
                <div className="mt-2 space-y-1.5 pl-9">
                  {q.options.map((o) => (
                    <label
                      key={o.key}
                      className={`flex cursor-pointer items-start gap-2.5 rounded px-2 py-1.5 text-[14px] text-[#1d1d1b] ${
                        answers[q.n] === o.key ? "bg-[#1d1d1b]/[0.06]" : "hover:bg-black/[0.03]"
                      }`}
                    >
                      <input
                        id={o.key === q.options[0].key ? `q-${q.n}` : undefined}
                        type="radio"
                        name={`q${q.n}`}
                        checked={answers[q.n] === o.key}
                        disabled={readOnly}
                        onChange={() => set(q.n, o.key)}
                        className="mt-1 h-4 w-4 accent-[#1d1d1b]"
                      />
                      <span className="w-4 shrink-0 font-bold">{o.key}</span>
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          }

          if (group.type === "tfng" || group.type === "ynng") {
            const info = review?.[q.n];
            return (
              <div key={q.n} id={`qwrap-${q.n}`} onClick={() => onFocus?.(q.n)}>
                <p className="flex items-start gap-2 text-[15px] text-[#1d1d1b]">
                  <QNum n={q.n} current={current} />
                  <span className="pt-0.5">{q.text}</span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-9">
                  {CHOICES[group.type].map((c) => (
                    <label
                      key={c}
                      className={`flex cursor-pointer items-center gap-2 rounded border px-3 py-1.5 text-[13px] font-semibold ${
                        answers[q.n] === c
                          ? "border-[#1d1d1b] bg-[#1d1d1b] text-white"
                          : "border-[#1d1d1b]/25 text-[#1d1d1b] hover:border-[#1d1d1b]/60"
                      }`}
                    >
                      <input
                        id={c === "TRUE" || c === "YES" ? `q-${q.n}` : undefined}
                        type="radio"
                        name={`q${q.n}`}
                        checked={answers[q.n] === c}
                        disabled={readOnly}
                        onChange={() => set(q.n, c)}
                        className="sr-only"
                      />
                      {c}
                    </label>
                  ))}
                  <ReviewMark info={info} />
                </div>
              </div>
            );
          }

          // match / headings — ro'yxatdan tanlash
          const info = review?.[q.n];
          return (
            <div
              key={q.n}
              id={`qwrap-${q.n}`}
              className="flex flex-wrap items-center gap-2 text-[15px] text-[#1d1d1b]"
              onClick={() => onFocus?.(q.n)}
            >
              <QNum n={q.n} current={current} />
              <span className="min-w-0 flex-1">{q.text}</span>
              <select
                id={`q-${q.n}`}
                value={answers[q.n] ?? ""}
                disabled={readOnly}
                onChange={(e) => set(q.n, e.target.value || null)}
                onFocus={() => onFocus?.(q.n)}
                className={`h-8 rounded border bg-white px-2 text-[14px] font-semibold outline-none focus:border-[#1d1d1b] ${
                  current ? "border-[#1d1d1b]" : "border-[#1d1d1b]/35"
                }`}
              >
                <option value="">—</option>
                {group.options.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.key}
                  </option>
                ))}
              </select>
              <ReviewMark info={info} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
