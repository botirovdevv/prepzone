import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionWaitingScreen({ title, scheduledAt, onReady }) {
  const [remaining, setRemaining] = useState(() => scheduledAt.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = scheduledAt.getTime() - Date.now();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onReady();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledAt]);

  return (
    <div className="min-h-screen bg-[#12213D] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <LuClock size={32} />
      </div>
      <p className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-2">
        Test hali boshlanmagan
      </p>
      <h1 className="font-display text-2xl font-extrabold mb-3 max-w-md">{title}</h1>
      <p className="text-white/60 max-w-md mb-10">
        Test{" "}
        {scheduledAt.toLocaleString("uz-UZ", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        da boshlanadi. Iltimos, shu sahifada kuting — vaqti kelganda avtomatik
        davom etadi.
      </p>
      <div className="text-5xl sm:text-6xl font-black font-display tabular-nums mb-2">
        {formatRemaining(remaining)}
      </div>
      <p className="text-white/40 text-sm">boshlanishiga qoldi</p>
    </div>
  );
}
