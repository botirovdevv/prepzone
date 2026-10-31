import { useEffect, useState } from "react";
import { FaTelegramPlane } from "react-icons/fa";
import { LuX } from "react-icons/lu";
import { useI18n } from "../i18n";

// ------------------------------------------------------------------
// Telegram kanalimiz (@prepzonesat) reklamasi: login qilgan foydalanuvchiga
// kuniga bir marta (shu brauzerda) chiqadi. Ko'rsatilgan sana
// localStorage'da saqlanadi; u ishlamasa ham sahifa buzilmaydi.
// ------------------------------------------------------------------

const CHANNEL_URL = "https://t.me/prepzonesat";
const KEY = "pz-tg-promo-date";
const DELAY_MS = 1500;

// Mahalliy sana (YYYY-MM-DD) — kun foydalanuvchining yarim tunida almashadi.
const today = () => new Date().toLocaleDateString("en-CA");

function shownToday() {
  try {
    return localStorage.getItem(KEY) === today();
  } catch {
    return false;
  }
}

function markShown() {
  try {
    localStorage.setItem(KEY, today());
  } catch {
    // localStorage yopiq — bu safar shunchaki eslab qololmaymiz.
  }
}

export default function TelegramPromo() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shownToday()) return;
    const timer = setTimeout(() => {
      markShown();
      setOpen(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tg-promo-title"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={t("telegramPromo.close")}
        >
          <LuX size={18} />
        </button>
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#229ED9] text-white">
          <FaTelegramPlane size={28} />
        </div>
        <h2 id="tg-promo-title" className="text-lg font-bold text-[#12213D]">
          {t("telegramPromo.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("telegramPromo.text")}</p>
        <a
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1c8cc2]"
        >
          <FaTelegramPlane size={16} />
          {t("telegramPromo.join")}
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          {t("telegramPromo.later")}
        </button>
      </div>
    </div>
  );
}
