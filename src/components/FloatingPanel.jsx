import { useEffect, useRef, useState } from "react";
import { LuChevronDown, LuChevronUp, LuGripHorizontal, LuX } from "react-icons/lu";

// Bluebook'dagi Calculator / Reference oynalari: sarlavhasidan sudrab
// suriladi (sichqoncha va touch), yig'iladi, yopiladi va ekrandan
// chiqib ketmaydi.
export default function FloatingPanel({ title, icon: Icon, width = 560, initial, onClose, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState(() => {
    const w = Math.min(width, window.innerWidth - 16);
    return initial || { x: Math.max(8, window.innerWidth - w - 24), y: 96 };
  });
  const drag = useRef(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // Oyna kichraysa panel ko'rinadigan joyda qoladi.
  useEffect(() => {
    const onResize = () =>
      setPos((p) => ({
        x: Math.min(p.x, Math.max(8, window.innerWidth - 120)),
        y: Math.min(p.y, Math.max(8, window.innerHeight - 60)),
      }));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.min(Math.max(8, d.ox + e.clientX - d.sx), window.innerWidth - 120);
    const y = Math.min(Math.max(8, d.oy + e.clientY - d.sy), window.innerHeight - 48);
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => setPos({ x, y }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed z-50 flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-2xl"
      style={{ left: pos.x, top: pos.y, width: `min(${width}px, calc(100vw - 16px))` }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="flex cursor-move touch-none select-none items-center justify-between bg-black px-3 py-2 text-white"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {Icon && <Icon size={16} />}
          {title}
        </div>
        <LuGripHorizontal size={16} className="text-white/50" aria-hidden="true" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold hover:bg-white/20"
            aria-expanded={!collapsed}
          >
            {collapsed ? <LuChevronDown size={14} /> : <LuChevronUp size={14} />}
            {collapsed ? "Expand" : "Collapse"}
          </button>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/20" aria-label="Close">
            <LuX size={16} />
          </button>
        </div>
      </div>
      {!collapsed && <div className="max-h-[calc(100vh-180px)] overflow-auto">{children}</div>}
    </div>
  );
}
