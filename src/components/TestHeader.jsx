import { memo, useState } from "react";
import {
  LuChevronDown,
  LuHighlighter,
  LuEllipsisVertical,
  LuCalculator,
  LuLogOut,
} from "react-icons/lu";
import HighlightsPanel from "./HighlightsPanel";
import MathReferenceSheet from "./MathReferenceSheet";
import { useSecondsLeft } from "../hooks/useCountdown";

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Faqat shu kichik komponent har soniyada qayta render bo'ladi.
function TimerText({ endAt }) {
  const secondsLeft = useSecondsLeft(endAt);
  return secondsLeft == null ? null : formatTime(secondsLeft);
}

function TestHeader({
  sectionLabel,
  title,
  endAt,
  showCalcButton,
  onToggleCalculator,
  onExit,
  practiceMode = true,
  hideTimer = false,
}) {
  const [hidden, setHidden] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showReference, setShowReference] = useState(false);

  return (
    <div className="w-full sticky top-0 z-30">
      <div className="flex items-center justify-between bg-fill border-b border-gray-300 px-6 py-2">
        <div>
          <div className="font-bold text-gray-900 text-sm">
            {sectionLabel}: {title}
          </div>
          <button className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
            Directions <LuChevronDown size={12} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          {hideTimer ? (
            <div className="text-sm font-semibold text-gray-500">Vaqt cheklanmagan</div>
          ) : (
            <>
              <div className="text-lg font-bold text-gray-900 tabular-nums">
                {hidden ? "" : <TimerText endAt={endAt} />}
              </div>
              <button
                onClick={() => setHidden((h) => !h)}
                className="text-xs border border-gray-400 rounded-full px-3 py-0.5 mt-0.5 hover:bg-gray-200"
              >
                {hidden ? "Show" : "Hide"}
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-5 text-xs text-gray-700">
          {onExit && (
            <button
              onClick={onExit}
              className="flex flex-col items-center gap-0.5 hover:text-red-600"
            >
              <LuLogOut size={18} />
              Chiqish
            </button>
          )}
          {showCalcButton && (
            <button
              onClick={onToggleCalculator}
              className="flex flex-col items-center gap-0.5 hover:text-accent"
            >
              <LuCalculator size={18} />
              Calculator
            </button>
          )}
          <button
            onClick={() => setShowHighlights(true)}
            className="flex flex-col items-center gap-0.5 hover:text-accent"
          >
            <LuHighlighter size={18} />
            Highlights &amp; Notes
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMore((s) => !s)}
              className="hover:text-accent"
            >
              <LuEllipsisVertical size={18} />
            </button>
            {showMore && (
              <div className="absolute right-0 mt-2 w-40 bg-surface border border-gray-200 rounded-lg shadow-lg text-sm z-10">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Test Directions
                </button>
                {showCalcButton && (
                  <button
                    onClick={() => {
                      setShowReference(true);
                      setShowMore(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Reference
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {practiceMode && (
        <div className="bg-night text-white text-center text-xs font-semibold py-1.5 tracking-wide">
          THIS IS A PRACTICE TEST
        </div>
      )}

      {showHighlights && <HighlightsPanel onClose={() => setShowHighlights(false)} />}
      {showReference && <MathReferenceSheet onClose={() => setShowReference(false)} />}
    </div>
  );
}

export default memo(TestHeader);
