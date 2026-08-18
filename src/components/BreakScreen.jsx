import { useEffect, useState } from "react";
import { LuCoffee, LuArrowRight } from "react-icons/lu";

const BREAK_SECONDS = 10 * 60;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BreakScreen({ onContinue }) {
  const [secondsLeft, setSecondsLeft] = useState(BREAK_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) onContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  return (
    <div className="min-h-screen bg-[#0F1C30] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <LuCoffee size={36} />
      </div>
      <p className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-2">
        Tanaffus
      </p>
      <h1 className="font-display text-4xl font-extrabold mb-3">
        Reading & Writing bo'limi tugadi
      </h1>
      <p className="text-white/60 max-w-md mb-10">
        Bir oz dam oling. Math bo'limi tanaffus tugagach yoki siz "Davom
        etish" tugmasini bosganingizda boshlanadi.
      </p>

      <div className="text-6xl font-black font-display tabular-nums mb-10">
        {formatTime(secondsLeft)}
      </div>

      <button
        onClick={onContinue}
        className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0076FC] text-white font-semibold hover:bg-[#0062d1] transition"
      >
        Davom etish
        <LuArrowRight size={18} className="group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
}
