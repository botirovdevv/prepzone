import { LuX, LuHighlighter, LuTrash2 } from "react-icons/lu";
import { useHighlights } from "../context/HighlightsContext";

export default function HighlightsPanel({ onClose }) {
  const highlights = useHighlights();
  const list = highlights?.list || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-sm h-full shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <LuHighlighter size={18} className="text-amber-500" />
            Annotations
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <LuX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {list.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-10 px-4 leading-relaxed">
              No annotations yet. Select text in a passage or question to highlight it.
            </p>
          ) : (
            list.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                  {item.label}
                </p>
                <p className="text-sm text-gray-800 bg-yellow-100 rounded px-2 py-1 mb-2 leading-snug">
                  “{item.text}”
                </p>
                <textarea
                  value={item.note}
                  onChange={(e) => highlights?.setNote(item.id, e.target.value)}
                  placeholder="Add a note (optional)..."
                  rows={2}
                  className="w-full text-xs rounded-lg border border-gray-200 px-2.5 py-1.5 outline-none focus:border-accent resize-none"
                />
              </div>
            ))
          )}
        </div>

        {list.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => highlights?.resetAll()}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700"
            >
              <LuTrash2 size={13} /> Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
