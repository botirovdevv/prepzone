import { LuX, LuMapPin, LuFlag } from "react-icons/lu";

export default function QuestionNav({
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
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30">
      <div className="bg-white w-full max-w-3xl rounded-t-2xl shadow-2xl mb-24 max-h-[75vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-lg font-bold text-gray-800">{sectionTitle} Questions</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <LuX size={22} />
          </button>
        </div>

        <div className="flex items-center gap-6 px-6 py-3 border-y border-gray-200 text-sm text-gray-700">
          <div className="flex items-center gap-1.5">
            <LuMapPin size={16} />
            Current
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 border border-dashed border-gray-500 inline-block rounded-sm" />
            Unanswered
          </div>
          <div className="flex items-center gap-1.5">
            <LuFlag size={14} fill="currentColor" className="text-red-600" />
            For Review
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 px-6 py-6">
          {questions.map((q, i) => {
            const isAnswered = !!answers[i];
            const isMarked = !!marked[i];
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => onSelect(i)}
                className={`relative h-12 rounded-md font-bold flex items-center justify-center text-sm transition
                  ${
                    isAnswered
                      ? "bg-[#375DFB] text-white"
                      : "bg-white text-gray-800 border-2 border-dashed border-gray-400 hover:bg-gray-50"
                  }
                  ${isCurrent ? "ring-2 ring-gray-900" : ""}
                `}
              >
                {i + 1}
                {isCurrent && (
                  <LuMapPin
                    size={16}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-gray-900"
                  />
                )}
                {isMarked && (
                  <LuFlag
                    size={14}
                    fill="currentColor"
                    className="absolute -top-1.5 -right-1.5 text-red-600"
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center pb-6">
          <button
            onClick={onGoToReview}
            className="border border-[#375DFB] text-[#375DFB] font-semibold px-6 py-2.5 rounded-full hover:bg-blue-50 transition"
          >
            Go to Review Page
          </button>
        </div>
      </div>
    </div>
  );
}
