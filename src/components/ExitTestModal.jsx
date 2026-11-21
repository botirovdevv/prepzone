import { LuTriangleAlert } from "react-icons/lu";
import { useI18n } from "../i18n";

export default function ExitTestModal({ onCancel, onConfirm, confirming }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <LuTriangleAlert size={22} />
        </div>
        <h2 className="mb-2 text-lg font-bold text-gray-900">{t("proctor.exit.title")}</h2>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          {t("proctor.exit.textBefore")}{" "}
          <span className="font-semibold text-gray-700">{t("proctor.exit.textStrong")}</span>
          {t("proctor.exit.textAfter") === "." ? "." : ` ${t("proctor.exit.textAfter")}`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-lg bg-danger py-2.5 font-semibold text-white hover:bg-danger/90 disabled:opacity-60"
          >
            {confirming ? t("proctor.exit.exiting") : t("proctor.exit.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
