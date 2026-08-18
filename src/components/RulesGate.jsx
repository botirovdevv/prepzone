import { useState } from "react";
import {
  LuShieldAlert,
  LuMonitor,
  LuCamera,
  LuMousePointerClick,
  LuLogOut,
  LuArrowRight,
} from "react-icons/lu";

const RULES = [
  {
    icon: LuMonitor,
    title: "To'liq ekran (fullscreen) rejimi",
    text:
      "Test boshlanishi bilan avtomatik to'liq ekran rejimiga o'tasiz. Fullscreen'dan chiqsangiz (Esc yoki boshqa usul bilan), test DARHOL yakunlanadi va siz testdan chetlatilasiz — shu paytgacha bergan javoblaringiz asosida natija hisoblab qo'yiladi.",
  },
  {
    icon: LuCamera,
    title: "Skrinshot olish taqiqlanadi",
    text:
      "Print Screen va Win+Shift+S kombinatsiyalari bloklanadi va ogohlantirish chiqadi. Mac'da Cmd+Shift+3/4/5 orqali skrinshot olishning oldini brauzer texnik jihatdan 100% ololmaydi — lekin imkon qadar bunday urinishlar ham kuzatiladi va ogohlantirishga sabab bo'ladi.",
  },
  {
    icon: LuMousePointerClick,
    title: "Nusxalash va boshqa oynaga o'tish",
    text:
      "Test davomida o'ng tugma menyusi, matn nusxalash/joylashtirish va DevTools ochish o'chirilgan. Boshqa tab yoki oynaga o'tish kuzatiladi. Ogohlantirishlar soni ko'payib ketsa, test avtomatik yakunlanadi.",
  },
  {
    icon: LuLogOut,
    title: "Chiqish tugmasi",
    text:
      "Testni davom ettira olmasangiz, \"Chiqish\" tugmasini bosing — hozirgi holatingiz saqlanadi, lekin testni faqat 30 daqiqadan so'ng qayta davom ettira olasiz.",
  },
];

export default function RulesGate({ onStart, isResume }) {
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);

  const handleStart = async () => {
    if (!agreed || starting) return;
    setStarting(true);
    setError(false);
    const ok = await onStart();
    if (!ok) {
      setError(true);
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1C30] text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <LuShieldAlert size={30} />
          </div>
          <p className="text-sm uppercase tracking-widest text-white/50 font-semibold mb-2">
            Xavfsizlik qoidalari
          </p>
          <h1 className="font-display text-3xl font-extrabold">
            {isResume ? "Testni davom ettirishdan oldin" : "Testni boshlashdan oldin"}
          </h1>
          <p className="text-white/60 mt-2 text-sm max-w-md">
            Iltimos, quyidagi qoidalar bilan tanishing. Bu qoidalar barcha
            ishtirokchilar uchun adolatli va halol test muhitini ta'minlash
            uchun kerak.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {RULES.map((r, i) => (
            <div key={i} className="flex gap-4 bg-white/5 rounded-xl p-4">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <r.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">{r.title}</p>
                <p className="text-white/60 text-sm leading-relaxed">{r.text}</p>
              </div>
            </div>
          ))}
        </div>

        <label className="flex items-start gap-3 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#0076FC]"
          />
          <span className="text-sm text-white/80">
            Yuqoridagi xavfsizlik qoidalarini o'qib chiqdim va roziman.
          </span>
        </label>

        {error && (
          <p className="text-red-400 text-sm mb-4">
            To'liq ekran rejimini yoqib bo'lmadi. Iltimos, brauzeringizda
            fullscreen ruxsatini tekshirib, qayta urinib ko'ring.
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={!agreed || starting}
          className={`w-full group flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold transition ${
            agreed
              ? "bg-[#0076FC] text-white hover:bg-[#0062d1]"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {starting
            ? "Boshlanmoqda..."
            : isResume
            ? "Testni davom ettirish"
            : "Testni boshlash"}
          {!starting && (
            <LuArrowRight size={18} className="group-hover:translate-x-0.5 transition" />
          )}
        </button>
      </div>
    </div>
  );
}
