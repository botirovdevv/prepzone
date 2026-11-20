import { memo } from "react";
import { LuX, LuMapPin, LuFlag } from "react-icons/lu";

function QuestionNav({
  questions,
  currentIndex,
  answers,
  marked,
  sectionTitle,
  onSelect,
  onClose,
  onGoToReview,
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-xl rounded-t-2xl shadow-2xl mb-24 max-h-[65vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
          <h2 className="text-base font-bold text-gray-800">{sectionTitle} Questions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <LuX size={20} />
          </button>
        </div>

        <div className="flex items-center gap-5 px-5 py-2.5 border-y border-gray-200 text-xs text-gray-700">
          <div className="flex items-center gap-1.5">
            <LuMapPin size={14} />
            Current
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-dashed border-gray-500 inline-block rounded-sm" />
            Unanswered
          </div>
          <div className="flex items-center gap-1.5">
            <LuFlag size={12} fill="currentColor" className="text-red-600" />
            For Review
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2.5 px-5 py-5">
          {questions.map((q, i) => {
            const isAnswered = !!answers[i];
            const isMarked = !!marked[i];
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                className={`relative h-10 rounded-md font-bold flex items-center justify-center text-xs transition
                  ${
                    isAnswered
                      ? "bg-accent text-white"
                      : "bg-surface text-gray-800 border-2 border-dashed border-gray-400 hover:bg-gray-50"
                  }
                  ${isCurrent ? "ring-2 ring-gray-900" : ""}
                `}
              >
                {i + 1}
                {isCurrent && (
                  <LuMapPin
                    size={14}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-gray-900"
                  />
                )}
                {isMarked && (
                  <LuFlag
                    size={12}
                    fill="currentColor"
                    className="absolute -top-1.5 -right-1.5 text-red-600"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pb-5">
          <button
            onClick={onGoToReview}
            className="border border-accent text-accent font-semibold text-sm px-5 py-2 rounded-full hover:bg-blue-50 transition"
          >
            Go to Review Page
          </button>
        </div>
      </div>
    </div>
  );
}

// memo: taymer yoki boshqa holat o'zgarganda props o'zgarmasa qayta render qilinmaydi.
export default memo(QuestionNav);
