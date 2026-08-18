import { useEffect, useRef, useState } from "react";
import { LuX, LuMinus, LuCalculator } from "react-icons/lu";

// Desmos-ning ochiq "demo" API kaliti - rasmiy hujjatlarida
// (https://www.desmos.com/api/v1.9/docs/index.html) sinov/demo
// maqsadlarida ishlatish uchun keltirilgan umumiy kalit.
const DESMOS_API_KEY = "dcb31709b452b1cf9dc26972add0fda6";
const DESMOS_SCRIPT_SRC = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${DESMOS_API_KEY}`;

let scriptPromise = null;
function loadDesmosScript() {
  if (window.Desmos) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = DESMOS_SCRIPT_SRC;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function DesmosCalculator({ onClose }) {
  const mountRef = useRef(null);
  const calcRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 60, y: 90 });
  const dragState = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadDesmosScript()
      .then(() => {
        if (cancelled || !mountRef.current) return;
        calcRef.current = window.Desmos.GraphingCalculator(mountRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: false,
          zoomButtons: true,
          border: false,
        });
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, []);

  const onDragStart = (e) => {
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", onDragEnd);
  };
  const onDragMove = (e) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  };
  const onDragEnd = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", onDragEnd);
  };

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        width: 480,
        height: minimized ? 44 : 420,
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
      {!minimized && (
        <div className="flex-1 relative">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Kalkulyator yuklanmoqda...
            </div>
          )}
          <div ref={mountRef} className="w-full h-full" />
        </div>
      )}
    </div>
  );
}
