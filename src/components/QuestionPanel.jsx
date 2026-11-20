import { memo, useRef, useState } from "react";
import { LuBookmark, LuCheck, LuX, LuGripVertical, LuMaximize2, LuMinimize2 } from "react-icons/lu";
import HighlightableText from "./HighlightableText";
import { sanitizeRichText } from "../utils/sanitizeHtml";

// Bluebook qoidasi: musbat javob uchun 5 ta, manfiy uchun 6 ta belgi.
function isValidSprInput(value) {
  if (!/^-?[0-9./]*$/.test(value)) return false;
  return value.length <= (value.startsWith("-") ? 6 : 5);
}

function SprDirections() {
  return (
    <div className="text-[15px] leading-7 text-gray-900">
      <p className="mb-3 font-bold">Student-produced response directions</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>If you find more than one correct answer, enter only one answer.</li>
        <li>
          You can enter up to 5 characters for a positive answer and up to 6 characters (including the negative sign)
          for a negative answer.
        </li>
        <li>If your answer is a fraction that doesn&apos;t fit in the space, enter the decimal equivalent.</li>
        <li>
          If your answer is a decimal that doesn&apos;t fit in the space, enter it by truncating or rounding at the
          fourth digit.
        </li>
        <li>
          If your answer is a mixed number (such as 3&frac12;), enter it as an improper fraction (7/2) or its decimal
          equivalent (3.5).
        </li>
        <li>Don&apos;t enter symbols such as a percent sign, comma, or dollar sign.</li>
      </ul>
    </div>
  );
}

// Bluebook'dagi kabi chap/o'ng panellar orasidagi sudraladigan ajratgich.
function useSplit() {
  const [left, setLeft] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const handlers = {
    onPointerDown: (e) => {
      if (e.target.closest("button")) return;
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeft(Math.min(75, Math.max(25, pct)));
    },
    onPointerUp: () => {
      dragging.current = false;
    },
  };
  return { left, setLeft, containerRef, handlers };
}

function QuestionPanel({
  question,
  index,
  selected,
  marked,
  crossedOut,
  onSelectAnswer,
  onToggleMark,
  onToggleCrossOut,
  showPassage,
  feedbackMode,
}) {
  const isSpr = question.type === "spr";
  const splitView = showPassage || isSpr;
  // Answer eliminator (ABC) — yoqilgan holati savoldan savolga o'tganda saqlanadi.
  const [eliminator, setEliminator] = useState(false);
  const { left, setLeft, containerRef, handlers } = useSplit();
  const renderRich = (text) =>
    question.html ? <span dangerouslySetInnerHTML={{ __html: sanitizeRichText(text) }} /> : text;
  const canEliminate = !feedbackMode && !isSpr && (question.choices || []).length > 0;

  const leftPane = isSpr && !showPassage ? (
    <SprDirections />
  ) : showPassage ? (
    <HighlightableText
      key={`passage-${question.id}`}
      text={question.passage}
      rich
      highlightKey={`q${question.id}-passage`}
      highlightLabel={`Question ${index + 1} — Passage`}
      className="sat-rich whitespace-pre-line text-[15px] leading-7 text-gray-900"
    />
  ) : null;

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden ${splitView ? "md:flex-row" : ""}`}
      style={{ "--left": `${left}%` }}
    >
      {splitView && (
        <>
          <div className="passage-scroll select-text border-b border-gray-300 p-5 sm:p-8 md:w-[var(--left)] md:shrink-0 md:overflow-y-auto md:border-b-0">
            {leftPane}
          </div>
          <div
            {...handlers}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(left)}
            className="group relative hidden w-2 shrink-0 cursor-col-resize touch-none bg-gray-200 hover:bg-gray-300 md:block"
          >
            <span className="absolute left-1/2 top-1/2 flex h-10 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-gray-300 bg-surface text-gray-500 shadow-sm">
              <LuGripVertical size={14} />
            </span>
            <div className="absolute left-1/2 top-3 flex -translate-x-1/2 flex-col gap-1">
              <button
                type="button"
                onClick={() => setLeft((l) => (l >= 70 ? 50 : 75))}
                title={left >= 70 ? "Restore" : "Expand passage"}
                className="flex h-6 w-6 items-center justify-center rounded bg-surface text-gray-600 shadow-sm hover:text-gray-900"
              >
                {left >= 70 ? <LuMinimize2 size={12} /> : <LuMaximize2 size={12} />}
              </button>
            </div>
          </div>
        </>
      )}

      <div
        className={`${
          splitView ? "md:flex-1 md:overflow-y-auto" : "mx-auto w-full max-w-3xl"
        } passage-scroll p-5 sm:p-8`}
      >
        <div className="flex items-stretch overflow-hidden rounded-t-md border-b-2 border-dashed border-gray-400 bg-fill text-sm">
          <div className="flex w-9 items-center justify-center bg-gray-900 font-bold text-white">{index + 1}</div>
          <button
            type="button"
            onClick={onToggleMark}
            aria-pressed={!!marked}
            className={`flex items-center gap-1.5 px-3 py-2 ${marked ? "font-semibold text-red-600" : "text-gray-800"}`}
          >
            <LuBookmark size={15} fill={marked ? "currentColor" : "none"} />
            Mark for Review
          </button>
          <div className="flex-1" />
          {canEliminate && (
            <button
              type="button"
              onClick={() => setEliminator((v) => !v)}
              aria-pressed={eliminator}
              title="Cross out answer choices"
              className={`m-1 flex items-center rounded border px-2 text-xs font-bold ${
                eliminator ? "border-accent bg-accent text-white" : "border-gray-500 text-gray-800 hover:bg-gray-200"
              }`}
            >
              <span className="line-through decoration-2">ABC</span>
            </button>
          )}
        </div>

        {!showPassage && question.passage && (
          <HighlightableText
            key={`inline-passage-${question.id}`}
            text={question.passage}
            rich
            highlightKey={`q${question.id}-passage`}
            highlightLabel={`Question ${index + 1} — Passage`}
            className="sat-rich mb-4 mt-4 select-text whitespace-pre-line text-[15px] leading-7 text-gray-900"
          />
        )}

        <HighlightableText
          key={`prompt-${question.id}`}
          text={question.prompt}
          rich={!!question.html}
          highlightKey={`q${question.id}-prompt`}
          highlightLabel={`Question ${index + 1} — Question`}
          className="sat-rich mb-4 mt-5 select-text text-[17px] font-medium leading-7 text-gray-900"
        />

        {question.image && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <img
              src={question.image}
              alt={`Figure for question ${index + 1}`}
              className="mx-auto max-h-80 max-w-full rounded object-contain"
            />
          </div>
        )}

        {isSpr && (
          <div className="mt-2">
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              aria-label="Your answer"
              value={selected || ""}
              onChange={(e) => {
                const v = e.target.value.replace(/\s/g, "");
                if (isValidSprInput(v)) onSelectAnswer(v || null);
              }}
              className="w-44 rounded-md border-2 border-gray-400 px-3 py-2.5 text-lg font-semibold tracking-wide focus:border-accent focus:outline-none"
            />
            <div className="mt-4 text-sm text-gray-600">
              Answer Preview: <span className="text-base font-semibold text-gray-900">{selected || ""}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {(question.choices || []).map((choice) => {
            const isSelected = selected === choice.label;
            const isCrossed = crossedOut?.includes(choice.label);
            const isCorrectChoice = choice.label === question.correctAnswer;
            const showFeedback = feedbackMode && !!selected;
            let feedbackClass = "";
            if (showFeedback) {
              if (isCorrectChoice) feedbackClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
              else if (isSelected) feedbackClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
            }
            return (
              <div key={choice.label} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => !isCrossed && onSelectAnswer(choice.label)}
                  disabled={isCrossed}
                  aria-pressed={isSelected}
                  className={`relative flex flex-1 items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-[15px] transition
                    ${
                      showFeedback
                        ? feedbackClass || "border-gray-200 opacity-60"
                        : isSelected
                        ? "border-accent bg-blue-50"
                        : "border-gray-300 hover:border-gray-500"
                    }
                    ${isCrossed ? "opacity-50" : ""}
                  `}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold
                      ${
                        showFeedback && isCorrectChoice
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : showFeedback && isSelected
                          ? "border-red-500 bg-red-500 text-white"
                          : isSelected
                          ? "border-accent bg-accent text-white"
                          : "border-gray-700 text-gray-800"
                      }`}
                  >
                    {showFeedback && isCorrectChoice ? (
                      <LuCheck size={14} />
                    ) : showFeedback && isSelected ? (
                      <LuX size={14} />
                    ) : (
                      choice.label
                    )}
                  </span>
                  <span>{renderRich(choice.text)}</span>
                  {/* Bluebook'dagi kabi chizilgan javob butun qator bo'ylab ustidan chiziladi. */}
                  {isCrossed && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-2 top-1/2 h-0.5 bg-gray-800" />
                  )}
                </button>

                {canEliminate && eliminator && (
                  <button
                    type="button"
                    onClick={() => onToggleCrossOut(choice.label)}
                    aria-label={isCrossed ? `Undo cross out ${choice.label}` : `Cross out ${choice.label}`}
                    // Qat'iy kenglik — "Undo" chiqqanda variant qatori siljimaydi.
                    className="flex w-11 shrink-0 justify-center text-xs font-bold text-gray-800"
                  >
                    {isCrossed ? (
                      <span className="rounded-md px-1.5 py-1 underline hover:bg-gray-100">Undo</span>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-700 line-through hover:bg-gray-100">
                        {choice.label}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {feedbackMode && selected && question.explanation && (
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <p className="mb-1 font-semibold text-gray-900">Explanation</p>
            {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
}

// memo: taymer yoki boshqa holat o'zgarganda props o'zgarmasa qayta render qilinmaydi.
export default memo(QuestionPanel);
