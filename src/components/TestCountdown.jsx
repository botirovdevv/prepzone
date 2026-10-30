import { Link } from "react-router-dom";
import { LuCalendarClock, LuTarget } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { nextTestDate, daysLeft } from "../data/testDates";
import { Card, IconTile } from "./ui";
import { useI18n } from "../i18n";

// Eng yaqin rasmiy SAT test day'gacha qolgan kunlar + onboarding'da
// kiritilgan maqsad ball (masalan "1400 ga 4 kun qoldi").
export default function TestCountdown() {
  const { user } = useAuth();
  const { t } = useI18n();
  const date = nextTestDate();
  const left = date ? daysLeft(date) : null;
  const targetLabel = user?.onboarding?.targets?.sat ?? null;
  const dateLabel = date
    ? date.split("-").reverse().join(".")
    : t("dashboard.countdown.notAnnounced");

  return (
    <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <IconTile icon={LuCalendarClock} tone="blue" />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">
            SAT test day · {dateLabel}
          </p>
          <p className="mt-0.5 font-display text-[24px] font-extrabold leading-tight text-[#12213D]">
            {left == null ? (
              "—"
            ) : left === 0 ? (
              t("dashboard.countdown.today")
            ) : (
              <>
                {targetLabel != null && (
                  <span className="text-[#087fd1]">{t("dashboard.countdown.toTarget", { target: targetLabel })} </span>
                )}
                <span className="tabular-nums">{left}</span> {t("dashboard.countdown.daysLeft")}
              </>
            )}
          </p>
        </div>
      </div>

      {targetLabel != null ? (
        <div className="flex items-center gap-3 rounded-xl bg-[#087fd1]/[0.07] px-4 py-2.5">
          <LuTarget size={18} className="text-[#087fd1]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">{t("dashboard.countdown.goal")}</p>
            <p className="font-display text-[20px] font-extrabold tabular-nums text-[#12213D]">{targetLabel}</p>
          </div>
        </div>
      ) : (
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 rounded-xl bg-[#087fd1]/[0.07] px-4 py-2.5 text-sm font-semibold text-[#087fd1] hover:bg-[#087fd1]/[0.12]"
        >
          <LuTarget size={16} /> {t("dashboard.countdown.setGoal")}
        </Link>
      )}
    </Card>
  );
}
