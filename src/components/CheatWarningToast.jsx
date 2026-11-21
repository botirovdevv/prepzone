import { LuTriangleAlert } from "react-icons/lu";
import { useI18n } from "../i18n";

export default function CheatWarningToast({ warning, maxWarnings }) {
  const { t } = useI18n();
  if (!warning) return null;
  const key = `proctor.warning.${warning.type}`;
  const text = t(key);

  return (
    <div className="fixed left-1/2 top-4 z-[100] w-[92%] max-w-md -translate-x-1/2" role="alert">
      <div className="flex items-start gap-3 rounded-xl bg-danger px-5 py-3.5 text-white shadow-2xl">
        <LuTriangleAlert size={20} className="mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-bold">{t("proctor.warning.title", { count: warning.count, max: maxWarnings })}</p>
          <p className="text-white/90">{text === key ? warning.message : text}</p>
        </div>
      </div>
    </div>
  );
}
