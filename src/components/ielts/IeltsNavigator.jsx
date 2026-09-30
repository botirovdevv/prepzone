import { memo } from "react";
import { LuChevronLeft, LuChevronRight, LuCheck, LuFlag } from "react-icons/lu";

// Pastki navigatsiya paneli (IELTS on Computer kabi): har bir Part —
// faol bo'lsa savol raqamlari, aks holda "3 of 13" ko'rinishida.
// Javob berilgan savol tagiga chiziladi, "Review" belgisi — bayroqcha.
function IeltsNavigator({
  parts, // [{ label, questions: [n] }]
  activePart,
  currentQ,
  isAnswered,
  isFlagged,
  onSelectPart,
  onSelectQ,
  onPrev,
  onNext,
  onToggleFlag,
  onSubmit,
  showReview = true,
}) {
  return (
    <footer className="flex h-[68px] shrink-0 items-stretch border-t border-[#d7d7d7] bg-white">
      {showReview && (
        <label className="flex shrink-0 cursor-pointer items-center gap-2 border-r border-[#d7d7d7] px-4 text-[13px] font-semibold text-[#1d1d1b]">
          <input
            type="checkbox"
            checked={!!isFlagged(currentQ)}
            onChange={onToggleFlag}
            className="h-4 w-4 accent-[#1d1d1b]"
          />
          Review
        </label>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-2 [scrollbar-width:thin]">
        {parts.map((part, i) => {
          const answered = part.questions.filter(isAnswered).length;
          if (i !== activePart) {
            return (
              <button
                key={part.label}
                onClick={() => onSelectPart(i)}
                className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-[13px] hover:bg-black/5"
              >
                <span className="font-bold text-[#1d1d1b]">{part.label}</span>
                <span className="text-[#1d1d1b]/55">
                  {answered} of {part.questions.length}
                </span>
              </button>
            );
          }
          return (
            <div key={part.label} className="flex shrink-0 items-center gap-2 rounded bg-[#f1f2f2] px-3 py-1.5">
              <span className="mr-1 text-[13px] font-bold text-[#1d1d1b]">{part.label}</span>
              {part.questions.map((n) => {
                const current = n === currentQ;
                const done = isAnswered(n);
                return (
                  <button
                    key={n}
                    onClick={() => onSelectQ(n)}
                    className={`relative flex h-8 min-w-[30px] items-center justify-center rounded px-1 text-[13px] font-semibold tabular-nums transition ${
                      current
                        ? "border-2 border-[#1d1d1b] bg-white text-[#1d1d1b]"
                        : "border border-transparent text-[#1d1d1b] hover:border-[#1d1d1b]/30"
                    } ${done ? "underline decoration-2 underline-offset-4" : ""}`}
                  >
                    {n}
                    {isFlagged(n) && (
                      <LuFlag size={10} className="absolute -right-0.5 -top-0.5 fill-[#e4002b] text-[#e4002b]" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 px-3">
        <button
          onClick={onPrev}
          aria-label="Previous"
          className="flex h-10 w-10 items-center justify-center rounded bg-[#1d1d1b] text-white hover:bg-[#1d1d1b]/85"
        >
          <LuChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          aria-label="Next"
          className="flex h-10 w-10 items-center justify-center rounded bg-[#1d1d1b] text-white hover:bg-[#1d1d1b]/85"
        >
          <LuChevronRight size={20} />
        </button>
        <button
          onClick={onSubmit}
          className="ml-2 flex h-10 items-center gap-1.5 rounded border-2 border-[#1d1d1b] px-3 text-[13px] font-bold text-[#1d1d1b] hover:bg-[#1d1d1b] hover:text-white"
        >
          <LuCheck size={16} /> Submit
        </button>
      </div>
    </footer>
  );
}

// memo: taymer yoki boshqa holat o'zgarganda props o'zgarmasa qayta render qilinmaydi.
export default memo(IeltsNavigator);
