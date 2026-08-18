import { LuChevronDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function BottomNav({
  total,
  currentIndex,
  answers,
  marked,
  studentName,
  onOpenNav,
  onPrev,
  onNext,
  isLastQuestion,
  onFinishModule,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-30">
      <div className="flex h-1.5">
        {Array.from({ length: total }).map((_, i) => {
          let color = "bg-gray-300";
          if (marked[i]) color = "bg-yellow-400";
          else if (answers[i]) color = "bg-[#375DFB]";
          if (i === currentIndex) color = "bg-gray-900";
          return <div key={i} className={`flex-1 ${color}`} />;
        })}
      </div>

      <div className="relative flex items-center justify-between px-6 py-3">
        <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
          {studentName || "Student"}
        </div>

        <button
          onClick={onOpenNav}
          className="absolute left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-6 py-2.5 flex items-center gap-2 font-semibold text-sm shadow-lg hover:bg-gray-800"
        >
          Question {currentIndex + 1} of {total}
          <LuChevronDown size={16} />
        </button>

        <div className="flex items-center gap-2">
          {currentIndex > 0 && (
            <button
              onClick={onPrev}
              className="flex items-center gap-1 border border-gray-400 rounded-full px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              <LuChevronLeft size={16} />
              Back
            </button>
          )}
          {!isLastQuestion ? (
            <button
              onClick={onNext}
              className="flex items-center gap-1 bg-gray-900 text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-gray-800"
            >
              Next
              <LuChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onFinishModule}
              className="flex items-center gap-1 bg-[#375DFB] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#2b4bd9]"
            >
              Modulni yakunlash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
