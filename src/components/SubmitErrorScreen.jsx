import { useState } from "react";
import { LuWifiOff, LuRotateCw } from "react-icons/lu";

// Javoblarni serverga yuborib bo'lmaganda (internet uzilgan va h.k.).
// Javoblar xotirada saqlanib turadi — "Qayta yuborish" bilan davom etiladi.
export default function SubmitErrorScreen({ message, onRetry }) {
  const [retrying, setRetrying] = useState(false);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <LuWifiOff size={28} />
      </div>
      <h1 className="font-display text-2xl font-extrabold text-[#12213D]">Javoblar hali yuborilmadi</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#12213D]/60">
        {message || "Serverga ulanib bo'lmadi."} Javoblaringiz saqlanib turibdi — internetni tekshirib, qayta
        yuboring. Sahifani yopmang.
      </p>
      <button
        disabled={retrying}
        onClick={async () => {
          setRetrying(true);
          try {
            await onRetry();
          } finally {
            setRetrying(false);
          }
        }}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087fd1] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0670b9] disabled:opacity-60"
      >
        <LuRotateCw size={16} className={retrying ? "animate-spin" : ""} /> Qayta yuborish
      </button>
    </div>
  );
}
