import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";
import { useI18n } from "../i18n";
import TestStatusScreen, { BigTimer } from "./TestStatusScreen";

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SessionWaitingScreen({ title, scheduledAt, onReady }) {
  const { t, fmtDate } = useI18n();
  const [remaining, setRemaining] = useState(() => scheduledAt.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = scheduledAt.getTime() - Date.now();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onReady();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledAt]);

  const time = fmtDate(scheduledAt, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <TestStatusScreen icon={LuClock} eyebrow={t("proctor.waiting.eyebrow")} title={title}>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">
        {t("proctor.waiting.text", { time })}
      </p>
      <BigTimer caption={t("proctor.waiting.left")}>{formatRemaining(remaining)}</BigTimer>
    </TestStatusScreen>
  );
}
