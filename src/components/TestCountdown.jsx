import { Link } from "react-router-dom";
import { LuCalendarClock, LuTarget } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { nextTestDate, daysLeft } from "../data/testDates";
import { Card, IconTile } from "./ui";

// Eng yaqin rasmiy SAT test day'gacha qolgan kunlar + onboarding'da
// kiritilgan maqsad ball (masalan "1400 ga 4 kun qoldi").
export default function TestCountdown() {
  const { user } = useAuth();
  const date = nextTestDate();
  const left = date ? daysLeft(date) : null;
  const targetLabel = user?.onboarding?.targets?.sat ?? null;
  const dateLabel = date
    ? date.split("-").reverse().join(".")
    : "Keyingi sanalar hali e'lon qilinmagan";

  return (
    <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <IconTile icon={LuCalendarClock} tone="blue" />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink/45">
            SAT test day · {dateLabel}
          </p>
          <p className="mt-0.5 font-display text-[24px] font-extrabold leading-tight text-ink">
            {left == null ? (
              "—"
            ) : left === 0 ? (
              "Bugun test kuni — omad!"
            ) : (
              <>
                {targetLabel != null && <span className="text-accent">{targetLabel} ga </span>}
                <span className="tabular-nums">{left}</span> kun qoldi
              </>
            )}
          </p>
        </div>
      </div>

      {targetLabel != null ? (
        <div className="flex items-center gap-3 rounded-xl bg-accent/[0.07] px-4 py-2.5">
          <LuTarget size={18} className="text-accent" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink/45">Maqsad</p>
            <p className="font-display text-[20px] font-extrabold tabular-nums text-ink">{targetLabel}</p>
          </div>
        </div>
      ) : (
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 rounded-xl bg-accent/[0.07] px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/[0.12]"
        >
          <LuTarget size={16} /> Maqsad ball qo'yish
        </Link>
      )}
    </Card>
  );
}
