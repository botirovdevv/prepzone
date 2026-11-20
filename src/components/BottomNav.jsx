import { memo } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

// Bluebook'ning pastki paneli: chapda ism, markazda "Question X of Y"
// (savollar ro'yxatini ochadi), o'ngda Back / Next.
function BottomNav({
  total,
  currentIndex,
  studentName,
  navOpen,
  onOpenNav,
  onPrev,
  onNext,
  isLastQuestion,
  onFinishModule,
  finishLabel = "Next",
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-dashed border-gray-400 bg-fill">
      <div className="relative flex items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <div className="hidden max-w-[180px] truncate text-sm font-bold text-gray-900 sm:block">
          {studentName || "Student"}
        </div>

        <button
          type="button"
          onClick={onOpenNav}
          aria-expanded={!!navOpen}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-gray-800 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          Question {currentIndex + 1} of {total}
          {navOpen ? <LuChevronDown size={16} /> : <LuChevronUp size={16} />}
        </button>

        <div className="flex items-center gap-2">
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={isLastQuestion ? onFinishModule : onNext}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent"
          >
            {isLastQuestion ? finishLabel : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// memo: taymer yoki boshqa holat o'zgarganda props o'zgarmasa qayta render qilinmaydi.
export default memo(BottomNav);
