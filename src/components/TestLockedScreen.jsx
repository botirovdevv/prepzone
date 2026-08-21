import { useEffect, useState } from "react";
import { LuLock } from "react-icons/lu";
import { getCooldownRemainingMs } from "../utils/testProgress";

function formatRemaining(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestLockedScreen({ pausedAt, onUnlocked }) {
  const [remaining, setRemaining] = useState(() => getCooldownRemainingMs(pausedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getCooldownRemainingMs(pausedAt);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onUnlocked();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pausedAt]);

  return (
    <div className="min-h-screen bg-[#12213D] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <LuLock size={32} />
      </div>
      <p className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-2">
        Test vaqtincha bloklangan
      </p>
      <h1 className="font-display text-3xl font-extrabold mb-3">
        Siz testdan chiqib ketgansiz
      </h1>
      <p className="text-white/60 max-w-md mb-10">
        Xavfsizlik qoidasiga ko'ra, testdan chiqqandan so'ng uni faqat 30
        daqiqadan keyin qayta davom ettirish mumkin.
      </p>
      <div className="text-6xl font-black font-display tabular-nums mb-2">
        {formatRemaining(remaining)}
      </div>
      <p className="text-white/40 text-sm">qolgan vaqt</p>
    </div>
  );
}
