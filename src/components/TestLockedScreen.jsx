import { useEffect, useState } from "react";
import { LuLock } from "react-icons/lu";
import { getCooldownRemainingMs } from "../utils/testProgress";
import { useI18n } from "../i18n";
import TestStatusScreen, { BigTimer } from "./TestStatusScreen";

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TestLockedScreen({ pausedAt, onUnlocked }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(() => getCooldownRemainingMs(pausedAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getCooldownRemainingMs(pausedAt);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        onUnlocked();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pausedAt]);

  return (
    <TestStatusScreen icon={LuLock} tone="amber" eyebrow={t("proctor.locked.eyebrow")} title={t("proctor.locked.title")}>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">{t("proctor.locked.text")}</p>
      <BigTimer caption={t("proctor.locked.left")}>{formatRemaining(remaining)}</BigTimer>
    </TestStatusScreen>
  );
}
