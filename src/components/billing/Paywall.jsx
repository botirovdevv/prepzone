import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuCheck, LuLock, LuX } from "react-icons/lu";
import { useI18n } from "../../i18n";

// ------------------------------------------------------------------
// Server tarif limitiga yetganda (402 plan-limit) api/client.js "plan:limit"
// hodisasini chiqaradi — shu oyna ochiladi. App.jsx'da bir marta ulanadi.
// ------------------------------------------------------------------

export default function Paywall() {
  const { t, tr } = useI18n();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const open = (e) => setInfo(e.detail || {});
    window.addEventListener("plan:limit", open);
    return () => window.removeEventListener("plan:limit", open);
  }, []);

  if (!info) return null;
  const close = () => setInfo(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-[#111827]/50 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-[#111827] px-7 pb-7 pt-8 text-white">
          <button
            onClick={close}
            aria-label={t("paywall.later")}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/10"
          >
            <LuX size={18} />
          </button>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087fd1]">
            <LuLock size={22} />
          </span>
          <h2 className="mt-5 text-[22px] font-bold leading-tight">{t("paywall.title")}</h2>
          {info.message && <p className="mt-2 text-[14px] leading-6 text-white/70">{info.message}</p>}
        </div>
        <div className="p-7">
          <ul className="space-y-3 text-[14px] text-[#344054]">
            {(tr("paywall.perks") || []).map((p) => (
              <li key={p} className="flex items-center gap-2.5">
                <LuCheck size={16} className="text-emerald-600" /> {p}
              </li>
            ))}
          </ul>
          <Link
            to="/pricing"
            onClick={close}
            className="mt-6 flex w-full items-center justify-center rounded-full bg-[#087fd1] py-3.5 font-bold text-white transition hover:bg-[#066fb8]"
          >
            {t("paywall.seePlans")}
          </Link>
          <button onClick={close} className="mt-2 w-full rounded-full py-3 text-sm font-semibold text-[#667085] hover:bg-[#111827]/[0.04]">
            {t("paywall.later")}
          </button>
        </div>
      </div>
    </div>
  );
}
