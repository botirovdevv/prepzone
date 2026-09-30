import { useEffect, useRef, useState } from "react";
import { LuX, LuMinus, LuCalculator } from "react-icons/lu";

// Desmos kalkulyator hozircha o'chiq — tez orada qo'shiladi. Oyna (sudrash,
// kichraytirish, yopish) saqlangan, ichida faqat "tez orada" xabari.

export default function DesmosCalculator({ onClose }) {
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 60, y: 90 });
  const dragState = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => () => onDragEnd(), []);

  // Listener'lar dragState'da saqlanadi — render'lar orasida o'sha funksiyalar
  // olib tashlanadi (aks holda window'da osilib qoladi).
  function onDragEnd() {
    cancelAnimationFrame(frameRef.current);
    const d = dragState.current;
    dragState.current = null;
    if (!d) return;
    window.removeEventListener("mousemove", d.move);
    window.removeEventListener("mouseup", d.end);
  }

  const onDragStart = (e) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = pos.x;
    const origY = pos.y;
    const move = (ev) => {
      const x = origX + ev.clientX - startX;
      const y = origY + ev.clientY - startY;
      // Kadrga bir marta yangilash (har mousemove'da render qilmaslik uchun).
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => setPos({ x, y }));
    };
    const end = () => onDragEnd();
    dragState.current = { move, end };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", end);
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        width: 480,
        height: minimized ? 44 : 220,
        transition: "height 0.15s ease",
      }}
    >
      <div
        onMouseDown={onDragStart}
        className="flex items-center justify-between bg-[#0B2265] text-white px-3 py-2 rounded-t-lg cursor-move select-none"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LuCalculator size={16} />
          Desmos Calculator
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMinimized((m) => !m)}
            className="hover:bg-white/20 rounded p-1"
            title="Kichraytirish"
          >
            <LuMinus size={14} />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-white/20 rounded p-1"
            title="Yopish"
          >
            <LuX size={14} />
          </button>
        </div>
      </div>
      <div className={`flex-1 relative ${minimized ? "hidden" : ""}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <LuCalculator size={28} className="text-[#0B2265]/40" />
          <p className="text-sm font-semibold text-gray-700">Desmos kalkulyator tez orada qo'shiladi</p>
          <p className="text-xs text-gray-400">Hozircha formula varag'i va qog'oz-qalamdan foydalaning.</p>
        </div>
      </div>
    </div>
  );
}
