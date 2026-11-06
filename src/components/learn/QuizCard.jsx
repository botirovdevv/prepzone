import { sanitizeRichText } from "../../utils/sanitizeHtml";

// ------------------------------------------------------------------
// Bitta savol kartasi (kun savollari, xatolarni takrorlash). `reveal`
// bo'lsa to'g'ri/noto'g'ri javob ranglanadi.
// ------------------------------------------------------------------

function Rich({ html, className }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitizeRichText(html || "") }} />;
}

export default function QuizCard({ question: q, selected, onSelect, reveal = false, correctAnswer, number, children }) {
  const answer = correctAnswer ?? q.correctAnswer;
  return (
    <div className="rounded-2xl border border-[#12213D]/[0.08] bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold text-[#12213D]/45">
        {number != null && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#12213D] text-[11px] text-white">{number}</span>
        )}
        {q.skill && <span className="truncate">{q.skill}</span>}
      </div>
      {q.passage && <Rich html={q.passage} className="sat-rich mb-4 whitespace-pre-line text-[15px] leading-7 text-[#12213D]/85" />}
      {q.image && <img src={q.image} alt="" className="mb-4 max-h-64" />}
      <Rich html={q.prompt} className="sat-rich mb-4 text-[15px] font-semibold leading-7 text-[#12213D]" />
      {q.type === "spr" && (
        <div>
          <input
            value={selected || ""}
            disabled={reveal}
            onChange={(e) => onSelect?.(e.target.value.slice(0, 12))}
            placeholder="Answer"
            className="h-12 w-40 rounded-xl border border-[#12213D]/15 px-4 text-[16px] font-semibold outline-none focus:border-[#087fd1]"
          />
          {reveal && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">✓ {(q.answers || []).join(" / ")}</p>
          )}
        </div>
      )}
      <div className="space-y-2">
        {(q.type === "spr" ? [] : q.choices || []).map((c) => {
          const isSel = selected === c.label;
          const isRight = reveal && c.label === answer;
          const isWrong = reveal && isSel && c.label !== answer;
          return (
            <button
              key={c.label}
              type="button"
              disabled={reveal}
              onClick={() => onSelect?.(c.label)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition ${
                isRight
                  ? "border-emerald-400 bg-emerald-50"
                  : isWrong
                  ? "border-red-300 bg-red-50"
                  : isSel
                  ? "border-[#087fd1] bg-[#087fd1]/[0.06]"
                  : "border-[#12213D]/10 hover:border-[#12213D]/25"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold ${
                  isRight
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isWrong
                    ? "border-red-500 bg-red-500 text-white"
                    : isSel
                    ? "border-[#087fd1] bg-[#087fd1] text-white"
                    : "border-[#12213D]/20 text-[#12213D]/60"
                }`}
              >
                {c.label}
              </span>
              <Rich html={c.text} className="sat-rich pt-0.5" />
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}
