import { LuTriangleAlert } from "react-icons/lu";
import { useI18n } from "../i18n";
import TestStatusScreen from "./TestStatusScreen";

export default function TestTerminatedScreen({ reason, message }) {
  const { t, tr } = useI18n();
  const reasons = tr("proctor.terminated.reasons") || {};
  return (
    <TestStatusScreen
      icon={LuTriangleAlert}
      tone="red"
      eyebrow={t("proctor.terminated.eyebrow")}
      title={t("proctor.terminated.title")}
      showLanguage={false}
    >
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink">
        {message || reasons[reason] || t("proctor.terminated.defaultReason")}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-3">{t("proctor.terminated.calculating")}</p>
    </TestStatusScreen>
  );
}
