import { LuFlag, LuMapPin } from "react-icons/lu";

// Bluebook'dagi "Check Your Work" sahifasi — modul oxirida barcha
// savollar holatini ko'rsatadi; talaba istalgan savolga qaytishi yoki
// modulni topshirishi mumkin.
export default function ModuleReview({
  sectionTitle,
  questions,
  answers,
  marked,
  currentIndex,
  studentName,
  onSelect,
  onBack,
  onSubmit,
}) {
  const unanswered = questions.filter((_, i) => !answers[i]).length;

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto passage-scroll">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">Check Your Work</h1>
          <p className="text-center text-gray-700 mb-1">
            On test day, you won&apos;t be able to move on to the next module until time expires.
          </p>
          <p className="text-center text-gray-700 mb-8">
            For these practice questions, you can click <b>Next</b> when you&apos;re ready to move on.
          </p>

          <div className="border border-gray-300 rounded-xl shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">{sectionTitle} Questions</h2>
              <div className="flex items-center gap-5 text-xs text-gray-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-dashed border-gray-500 inline-block rounded-sm" />
                  Unanswered
                </span>
                <span className="flex items-center gap-1.5">
                  <LuFlag size={12} fill="currentColor" className="text-red-600" />
                  For Review
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-10 gap-3 px-6 py-6">
              {questions.map((q, i) => {
                const isAnswered = !!answers[i];
                return (
                  <button
                    key={q.id}
                    onClick={() => onSelect(i)}
                    className={`relative h-11 rounded-md font-bold text-sm flex items-center justify-center transition
                      ${
                        isAnswered
                          ? "bg-[#375DFB] text-white hover:bg-[#2b4bd9]"
                          : "bg-white text-[#375DFB] border-2 border-dashed border-gray-400 hover:bg-gray-50"
                      }`}
                  >
                    {i + 1}
                    {i === currentIndex && (
                      <LuMapPin size={14} className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-gray-900" />
                    )}
                    {marked[i] && (
                      <LuFlag size={12} fill="currentColor" className="absolute -top-1.5 -right-1.5 text-red-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {unanswered > 0 && (
            <p className="text-center text-sm text-amber-700 mt-5">
              {unanswered} ta savolga javob berilmagan. Javobsiz savol xato hisoblanadi — taxminiy
              javob belgilash foydaliroq.
            </p>
          )}
        </div>
      </div>

      <div className="h-20" />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="text-sm font-semibold text-gray-800 truncate max-w-[160px]">
            {studentName || "Student"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="border border-gray-400 rounded-full px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={onSubmit}
              className="bg-[#375DFB] text-white rounded-full px-6 py-2 text-sm font-semibold hover:bg-[#2b4bd9]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
