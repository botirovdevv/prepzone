import { LuTriangleAlert } from "react-icons/lu";

const REASON_TEXT = {
  fullscreen: "Siz to'liq ekran (fullscreen) rejimidan chiqdingiz.",
  warnings: "Xavfsizlik qoidalari bir necha marta buzildi.",
};

export default function TestTerminatedScreen({ reason }) {
  return (
    <div className="min-h-screen bg-[#3B0A0A] text-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
        <LuTriangleAlert size={36} />
      </div>
      <p className="text-sm uppercase tracking-widest text-white/60 font-semibold mb-2">
        Test yakunlandi
      </p>
      <h1 className="font-display text-3xl font-extrabold mb-3">
        Siz testdan chetlatildingiz
      </h1>
      <p className="text-white/70 max-w-md mb-2">
        {REASON_TEXT[reason] || "Xavfsizlik qoidasi buzildi."}
      </p>
      <p className="text-white/50 max-w-md text-sm">
        Shu paytgacha bergan javoblaringiz asosida natija hisoblanmoqda...
      </p>
    </div>
  );
}
