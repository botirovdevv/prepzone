import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuFlaskConical, LuX } from "react-icons/lu";

// ------------------------------------------------------------------
// "Sayt sinov rejimida" eslatmasi — yangi kirgan har bir foydalanuvchiga
// bir marta ko'rsatiladi ("Tushunarli" bosilgach shu brauzerda qayta
// chiqmaydi). Matn o'zgarsa, KEY versiyasini oshiring — hammaga qayta
// ko'rinadi. Test yechish sahifalarida chiqmaydi (imtihondan chalg'itmasin).
// ------------------------------------------------------------------

const KEY = "pz-beta-notice-v1";
const HIDDEN_ON = [/^\/sat\/test/, /^\/session\/[^/]+\/test/, /^\/practice\/[^/]+/];

function wasDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export default function BetaNotice() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(() => !wasDismissed());

  if (!open || HIDDEN_ON.some((re) => re.test(pathname))) return null;

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Saqlab bo'lmasa (private rejim) — keyingi tashrifda yana ko'rinadi.
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="pz-rise fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] mx-auto max-w-[440px] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:mx-0"
    >
      <div className="relative flex gap-3 rounded-[20px] border border-amber-500/20 bg-surface/95 p-4 pr-11 shadow-[0_16px_40px_-16px_rgba(18,33,61,0.35)] backdrop-blur">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
          <LuFlaskConical size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-ink">Sayt sinov (beta) rejimida</p>
          <p className="mt-1 text-[13px] leading-[1.5] text-ink/65">
            Prepzone hozir test rejimida ishlayapti: ba'zi funksiyalar o'zgarishi yoki xato bilan ishlashi mumkin.
            Muammo ko'rsangiz,{" "}
            <Link to="/contact" className="font-semibold text-accent hover:underline">
              bizga xabar bering
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="pz-press mt-3 rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-on-ink hover:bg-ink/90"
          >
            Tushunarli
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Yopish"
          className="pz-press absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
        >
          <LuX size={16} />
        </button>
      </div>
    </div>
  );
}
