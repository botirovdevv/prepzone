import { useState } from "react";
import { LuWifiOff, LuRotateCw } from "react-icons/lu";
import { useI18n } from "../i18n";
import TestStatusScreen from "./TestStatusScreen";

// Javoblarni serverga yuborib bo'lmaganda (internet uzilgan va h.k.).
// Javoblar xotirada saqlanib turadi — "Qayta yuborish" bilan davom etiladi.
export default function SubmitErrorScreen({ message, onRetry }) {
  const { t } = useI18n();
  const [retrying, setRetrying] = useState(false);
  return (
    <TestStatusScreen icon={LuWifiOff} tone="amber" title={t("proctor.submitError.title")} showLanguage={false}>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#566176]">
        {message || t("proctor.submitError.fallback")} {t("proctor.submitError.text")}
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
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#087fd1] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#066fb8] disabled:opacity-60"
      >
        <LuRotateCw size={16} className={retrying ? "animate-spin" : ""} /> {t("proctor.submitError.retry")}
      </button>
    </TestStatusScreen>
  );
}
