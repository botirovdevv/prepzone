import { memo, useEffect, useRef, useState } from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuHighlighter,
  LuEllipsisVertical,
  LuCalculator,
  LuLogOut,
  LuSigma,
  LuAlarmClock,
  LuCircleHelp,
  LuRuler,
  LuCheck,
} from "react-icons/lu";
import HighlightsPanel from "./HighlightsPanel";
import MathReferenceSheet from "./MathReferenceSheet";
import TestDirections from "./TestDirections";
import { useSecondsLeft } from "../hooks/useCountdown";

const FIVE_MINUTES = 5 * 60;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Bluebook taymeri: "Hide" bosilsa vaqt o'rnida soat belgisi qoladi.
// 5 daqiqa qolganda taymer o'zi ochiladi, qizil rangga o'tadi va qisqa
// "5 Minutes Remaining" xabari chiqadi (keyin yana yashirish mumkin).
// Har soniyada faqat shu kichik komponent qayta render bo'ladi.
function TimerBlock({ endAt }) {
  const secondsLeft = useSecondsLeft(endAt);
  const [hidden, setHidden] = useState(false);
  const [alert, setAlert] = useState(false);
  const alertedRef = useRef(false);

  // Yangi modul — yangi taymer: 5 daqiqa ogohlantirishi qayta yoqiladi.
  useEffect(() => {
    alertedRef.current = false;
  }, [endAt]);

  const lowTime = secondsLeft != null && secondsLeft <= FIVE_MINUTES;

  useEffect(() => {
    if (!lowTime || alertedRef.current || !secondsLeft) return;
    alertedRef.current = true;
    setHidden(false);
    setAlert(true);
    const id = setTimeout(() => setAlert(false), 6000);
    return () => clearTimeout(id);
  }, [lowTime, secondsLeft]);

  if (secondsLeft == null) return null;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`flex h-7 items-center text-xl font-bold tabular-nums ${
          lowTime ? "text-[#c8102e]" : "text-gray-900"
        }`}
        aria-live={lowTime ? "polite" : "off"}
      >
        {hidden ? <LuAlarmClock size={22} aria-label="Timer hidden" /> : formatTime(secondsLeft)}
      </div>
      <button
        onClick={() => setHidden((h) => !h)}
        className="mt-0.5 rounded-full border border-gray-500 px-3 py-0.5 text-xs font-semibold text-gray-800 hover:bg-gray-200"
      >
        {hidden ? "Show" : "Hide"}
      </button>
      {alert && (
        <div
          role="alert"
          className="absolute top-[calc(100%+10px)] z-40 whitespace-nowrap rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-lg"
        >
          5 Minutes Remaining
        </div>
      )}
    </div>
  );
}

// Line Reader: sichqoncha (yoki barmoq) turgan qatorni ochiq qoldirib,
// qolgan ekranni xiralashtiradi — o'qishda diqqatni bir qatorda tutadi.
function LineReader() {
  const [y, setY] = useState(() => window.innerHeight / 2);
  useEffect(() => {
    const move = (e) => setY(e.clientY);
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 z-20 h-20 rounded-sm border-y-2 border-[#375DFB]"
      style={{ top: y - 40, boxShadow: "0 0 0 100vmax rgba(17, 24, 39, 0.45)" }}
    />
  );
}

function HeaderButton({ icon: Icon, label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium ${
        active ? "text-[#375DFB]" : "text-gray-800 hover:text-[#375DFB]"
      }`}
    >
      <Icon size={19} />
      {label}
    </button>
  );
}

function HelpDialog({ onClose }) {
  const items = [
    ["Mark for Review", "Flag a question to come back to it. Flagged questions are shown in the question list and on the review page."],
    ["Answer eliminator (ABC)", "Turn it on to cross out answer choices you think are wrong. Click the letter again to undo."],
    ["Annotate", "Select text in a passage to highlight it, then open Annotate to add notes. Click a highlight to remove it."],
    ["Line Reader", "Shades everything except the line you're reading. Turn it on or off from the More menu."],
    ["Reference / Calculator", "In the Math section, open the formula sheet or the calculator. Both windows can be moved and collapsed."],
    ["Timer", "Hide the timer if it distracts you. It reappears automatically when 5 minutes remain, and the module is submitted when time runs out."],
    ["Save and Exit", "Saves your progress. You can resume the test after 30 minutes."],
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Help"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-gray-900">Help</h2>
        <dl className="mt-4 space-y-3">
          {items.map(([term, desc]) => (
            <div key={term}>
              <dt className="text-sm font-bold text-gray-900">{term}</dt>
              <dd className="text-sm leading-relaxed text-gray-600">{desc}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-full bg-[#ffd400] px-6 py-2 text-sm font-bold text-gray-900 hover:bg-[#ffe14d]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function TestHeader({
  sectionLabel,
  title,
  sectionType,
  endAt,
  showCalcButton,
  calcOpen,
  onToggleCalculator,
  onExit,
  exitLabel = "Save and Exit",
  practiceMode = true,
  hideTimer = false,
  // O'zgarganda (yangi bo'lim boshlanganda) Directions o'zi ochiladi.
  directionsKey,
}) {
  const [showMore, setShowMore] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [lineReader, setLineReader] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (directionsKey != null) setShowDirections(true);
  }, [directionsKey]);

  useEffect(() => {
    if (!showMore) return;
    const close = (e) => {
      if (!moreRef.current?.contains(e.target)) setShowMore(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [showMore]);

  const isMath = sectionType === "math" || showCalcButton;

  return (
    <div className="sticky top-0 z-30 w-full">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b-2 border-dashed border-gray-400 bg-[#F3F4F6] px-4 py-2 sm:px-6">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-gray-900 sm:text-base">
            {sectionLabel}: {title}
          </div>
          <button
            onClick={() => setShowDirections((s) => !s)}
            aria-expanded={showDirections}
            className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-[#375DFB]"
          >
            Directions {showDirections ? <LuChevronUp size={15} /> : <LuChevronDown size={15} />}
          </button>
        </div>

        <div className="flex flex-col items-center">
          {hideTimer ? (
            <div className="text-sm font-semibold text-gray-500">No time limit</div>
          ) : (
            <TimerBlock endAt={endAt} />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          {isMath ? (
            <>
              {showCalcButton && (
                <HeaderButton icon={LuCalculator} label="Calculator" onClick={onToggleCalculator} active={calcOpen} />
              )}
              <HeaderButton
                icon={LuSigma}
                label="Reference"
                onClick={() => setShowReference((s) => !s)}
                active={showReference}
              />
            </>
          ) : (
            <HeaderButton
              icon={LuHighlighter}
              label="Annotate"
              onClick={() => setShowHighlights(true)}
              active={showHighlights}
            />
          )}
          <div className="relative" ref={moreRef}>
            <HeaderButton icon={LuEllipsisVertical} label="More" onClick={() => setShowMore((s) => !s)} active={showMore} />
            {showMore && (
              <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg">
                <button
                  onClick={() => {
                    setShowHelp(true);
                    setShowMore(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-100"
                >
                  <LuCircleHelp size={16} /> Help
                </button>
                <button
                  onClick={() => {
                    setLineReader((v) => !v);
                    setShowMore(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-100"
                >
                  <LuRuler size={16} /> Line Reader
                  {lineReader && <LuCheck size={15} className="ml-auto text-[#375DFB]" />}
                </button>
                {isMath && (
                  <button
                    onClick={() => {
                      setShowHighlights(true);
                      setShowMore(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-100"
                  >
                    <LuHighlighter size={16} /> Annotate
                  </button>
                )}
                {onExit && (
                  <button
                    onClick={() => {
                      setShowMore(false);
                      onExit();
                    }}
                    className="flex w-full items-center gap-2.5 border-t border-gray-100 px-4 py-2.5 text-left text-red-700 hover:bg-red-50"
                  >
                    <LuLogOut size={16} /> {exitLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {practiceMode && (
        <div className="bg-[#0B2265] py-1.5 text-center text-xs font-semibold tracking-wide text-white">
          THIS IS A PRACTICE TEST
        </div>
      )}

      {showDirections && (
        <div className="fixed inset-0 z-[45] bg-black/30" onClick={() => setShowDirections(false)}>
          <div
            role="dialog"
            aria-label="Directions"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-2 right-2 top-16 mx-auto max-h-[75vh] max-w-3xl overflow-y-auto rounded-xl bg-white p-6 text-[15px] leading-7 text-gray-900 shadow-2xl sm:left-6 sm:right-auto sm:p-8"
          >
            <TestDirections type={sectionType} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDirections(false)}
                className="rounded-full bg-[#ffd400] px-6 py-2 text-sm font-bold text-gray-900 hover:bg-[#ffe14d]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
      {lineReader && <LineReader />}
      {showHighlights && <HighlightsPanel onClose={() => setShowHighlights(false)} />}
      {showReference && <MathReferenceSheet onClose={() => setShowReference(false)} />}
    </div>
  );
}

export default memo(TestHeader);
