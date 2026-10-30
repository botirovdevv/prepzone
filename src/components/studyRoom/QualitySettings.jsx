import { useEffect, useRef } from "react";
import { LuX } from "react-icons/lu";
import { QUALITY_OPTIONS } from "./quality";

// Video sifati paneli (Study Room boshqaruv panelidagi tugma ochadi).

function Segmented({ value, onChange, disabled }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/[0.06] p-1">
      {QUALITY_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={`rounded-lg py-1.5 text-[13px] font-semibold transition disabled:opacity-50 ${
            value === o.id ? "bg-white text-[#12213D]" : "text-white/70 hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function QualityPanel({ incoming, outgoing, onIncoming, onOutgoing, applying, onClose }) {
  const ref = useRef(null);

  // Panel tashqarisiga bosilsa yoki Esc — yopiladi.
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest?.("[data-quality-toggle]")) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Video sifati"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl bg-[#1b2c4d] p-4 text-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-[15px] font-bold">Video sifati</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Yopish"
          className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <LuX size={16} />
        </button>
      </div>

      <p className="mb-1.5 text-xs font-semibold text-white/60">Men ko'radigan video</p>
      <Segmented value={incoming} onChange={onIncoming} />

      <p className="mb-1.5 mt-4 text-xs font-semibold text-white/60">Men yuboradigan video</p>
      <Segmented value={outgoing} onChange={onOutgoing} disabled={applying} />

      <p className="mt-3 text-[11px] leading-relaxed text-white/45">
        Avto — internet va ekranga qarab eng yaxshi sifat. Internet sekin bo'lsa yoki trafikni tejamoqchi bo'lsangiz —
        "Past"ni tanlang: video qotmaydi, ovoz tiniq qoladi.
      </p>
    </div>
  );
}
