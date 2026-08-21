import { LuBookmark, LuCheck, LuX } from "react-icons/lu";
import HighlightableText from "./HighlightableText";

export default function QuestionPanel({
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
  return (
    <div className={`flex-1 min-h-0 flex ${showPassage ? "flex-row" : "flex-col"}`}>
      {showPassage && (
        <div className="w-1/2 border-r border-gray-300 p-8 overflow-y-auto passage-scroll select-text">
          <HighlightableText
            key={`passage-${question.id}`}
            text={question.passage}
            className="text-[17px] leading-8 text-gray-900 whitespace-pre-line"
          />
        </div>
      )}

      <div className={`${showPassage ? "w-1/2" : "w-full max-w-3xl mx-auto"} p-8 overflow-y-auto passage-scroll`}>
        <div className="flex items-stretch border border-gray-300 rounded-t-md overflow-hidden text-sm">
          <div className="bg-gray-900 text-white font-bold w-9 flex items-center justify-center">
            {index + 1}
          </div>
          <button
            onClick={onToggleMark}
            className={`flex items-center gap-1.5 px-3 border-r border-gray-300 ${
              marked ? "text-red-600 font-semibold" : "text-gray-700"
            }`}
          >
            <LuBookmark size={14} fill={marked ? "currentColor" : "none"} />
            Mark for Review
          </button>
          <div className="flex-1" />
          <span
            title="Javob variantlarini o'chirish uchun ular yonidagi harfni bosing"
            className="px-3 flex items-center border-l border-gray-300 text-xs font-bold text-gray-400 select-none"
          >
            <span className="underline decoration-2">ABC</span>
          </span>
        </div>

        {!showPassage && question.passage && (
          <HighlightableText
            key={`inline-passage-${question.id}`}
            text={question.passage}
            className="text-[17px] leading-8 text-gray-900 mb-4 mt-4 whitespace-pre-line select-text"
          />
        )}

        <HighlightableText
          key={`prompt-${question.id}`}
          text={question.prompt}
          className="text-[17px] leading-7 text-gray-900 font-medium mt-5 mb-4 select-text"
        />

        {question.image && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <img
              src={question.image}
              alt="Savolga oid rasm"
              className="max-w-full max-h-80 mx-auto object-contain rounded"
            />
          </div>
        )}

        <div className="space-y-3">
          {question.choices.map((choice) => {
            const isSelected = selected === choice.label;
            const isCrossed = crossedOut?.includes(choice.label);
            const isCorrectChoice = choice.label === question.correctAnswer;
            const showFeedback = feedbackMode && !!selected;
            let feedbackClass = "";
            if (showFeedback) {
              if (isCorrectChoice) {
                feedbackClass = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
              } else if (isSelected) {
                feedbackClass = "border-red-500 bg-red-50 ring-1 ring-red-500";
              }
            }
            return (
              <div key={choice.label} className="flex items-center gap-3">
                <button
                  onClick={() => !isCrossed && onSelectAnswer(choice.label)}
                  disabled={isCrossed}
                  className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 text-left text-[15px] transition
                    ${
                      showFeedback
                        ? feedbackClass || "border-gray-200 opacity-60"
                        : isSelected
                        ? "border-[#375DFB] bg-blue-50 ring-1 ring-[#375DFB]"
                        : "border-gray-300 hover:bg-gray-50"
                    }
                    ${isCrossed ? "opacity-50" : ""}
                  `}
                >
                  <span
                    className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold shrink-0
                      ${
                        showFeedback && isCorrectChoice
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : showFeedback && isSelected
                          ? "bg-red-500 text-white border-red-500"
                          : isSelected
                          ? "bg-[#375DFB] text-white border-[#375DFB]"
                          : "border-gray-400 text-gray-700"
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
                  <span className={isCrossed ? "line-through" : ""}>{choice.text}</span>
                </button>

                {/* Eliminate (crossout) tugmasi doim ko'rinadi — alohida "mode"
                    yoqish shart emas, xohlagan javobni to'g'ridan-to'g'ri o'chirish/
                    qaytarish mumkin. */}
                {!feedbackMode && (
                  <button
                    onClick={() => onToggleCrossOut(choice.label)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 transition
                      ${
                        isCrossed
                          ? "border-gray-400 text-gray-400 line-through bg-gray-50"
                          : "border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600"
                      }`}
                    title={isCrossed ? "Javobni qaytarish" : "Javobni o'chirish"}
                  >
                    {choice.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {feedbackMode && selected && question.explanation && (
          <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
            <p className="font-semibold text-gray-900 mb-1">Tushuntirish</p>
            {question.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
