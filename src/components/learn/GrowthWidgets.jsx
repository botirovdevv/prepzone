import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuFlame, LuSun, LuArrowRight, LuTarget, LuLock, LuTrendingUp, LuTrendingDown, LuMinus, LuNotebookPen } from "react-icons/lu";
import { api } from "../../api/client";
import { Card, Button } from "../ui";
import { useI18n } from "../../i18n";

// ------------------------------------------------------------------
// Dashboard vidjetlari: streak + kun savollari, score predictor, xatolar.
// ------------------------------------------------------------------

export function StreakDaily() {
  const { t } = useI18n();
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/learn/streak").then(setS).catch(() => setS({ current: 0, best: 0, xp: 0 }));
  }, []);
  if (!s) return <Card className="h-[148px] animate-pulse" />;
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        <span
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
            s.today ? "bg-orange-500 text-white" : "bg-orange-500/10 text-orange-500"
          }`}
        >
          <LuFlame size={28} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[26px] font-extrabold leading-none text-[#12213D] tabular-nums">
            {s.current} <span className="text-[14px] font-semibold text-[#12213D]/50">{t("streak.days")}</span>
          </p>
          <p className="mt-1 text-[12px] text-[#12213D]/50">
            {s.xp} {t("streak.xp")}
            {s.rank ? ` · ${t("streak.rank", { n: s.rank })}` : ""} · {t("streak.best", { n: s.best })}
          </p>
        </div>
      </div>
      <Link
        to="/daily"
        className="flex items-center gap-3 border-t border-[#12213D]/[0.06] bg-amber-50/60 px-5 py-3.5 transition hover:bg-amber-50"
      >
        <LuSun size={18} className="text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#12213D]">{t("daily.widgetTitle")}</p>
          <p className="text-xs text-[#12213D]/50">{s.dailyDone ? t("daily.widgetDone") : t("daily.widgetText")}</p>
        </div>
        <span className="text-sm font-bold text-[#087fd1]">{s.dailyDone ? t("daily.ctaDone") : t("daily.cta")}</span>
        <LuArrowRight size={15} className="text-[#087fd1]" />
      </Link>
    </Card>
  );
}

// Oxirgi to'liq natijalardan bashorat: og'irlikli o'rtacha + trend.
export function predictScore(attempts) {
  const scores = (attempts || [])
    .filter((a) => a.complete !== false && !a.terminated && a.total >= 400)
    .slice(0, 5)
    .map((a) => a.total);
  if (!scores.length) return null;
  const weights = [0.4, 0.25, 0.15, 0.12, 0.08].slice(0, scores.length);
  const wsum = weights.reduce((a, b) => a + b, 0);
  const avg = scores.reduce((s, x, i) => s + x * weights[i], 0) / wsum;
  // Trend: eng yangisi va eng eskisi orasidagi o'rtacha qadam (eng yangisi birinchi).
  const slope = scores.length > 1 ? (scores[0] - scores[scores.length - 1]) / (scores.length - 1) : 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const sd = Math.sqrt(scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length);
  const spread = Math.round(Math.max(30, Math.min(90, sd + 60 / scores.length)) / 10) * 10;
  const point = Math.round(Math.min(1600, Math.max(400, avg + slope * 0.5)) / 10) * 10;
  return {
    point,
    low: Math.max(400, point - spread),
    high: Math.min(1600, point + spread),
    spread,
    trend: slope > 15 ? "up" : slope < -15 ? "down" : "flat",
  };
}

export function Predictor({ attempts, target, locked }) {
  const { t } = useI18n();
  const p = predictScore(attempts);
  const TrendIcon = p?.trend === "up" ? LuTrendingUp : p?.trend === "down" ? LuTrendingDown : LuMinus;
  const gap = p && target ? target - p.point : null;
  const perWeek = gap == null ? null : gap <= 0 ? 1 : gap > 150 ? 3 : 2;

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[17px] font-bold text-[#12213D]">{t("predictor.title")}</p>
          <p className="text-sm text-[#12213D]/50">{t("predictor.subtitle")}</p>
        </div>
        <LuTarget size={20} className="text-[#087fd1]" />
      </div>
      {!p ? (
        <p className="mt-5 text-sm text-[#12213D]/55">{t("predictor.noData")}</p>
      ) : (
        <div className={locked ? "pointer-events-none select-none blur-[6px]" : ""}>
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">{t("predictor.range")}</p>
          <p className="font-display text-[34px] font-extrabold leading-tight tabular-nums text-[#12213D]">
            {p.low}–{p.high}
          </p>
          <p className="flex items-center gap-1.5 text-[13px] text-[#12213D]/55">
            <TrendIcon size={15} className={p.trend === "up" ? "text-emerald-600" : p.trend === "down" ? "text-red-500" : ""} />
            {t(`predictor.trend${p.trend === "up" ? "Up" : p.trend === "down" ? "Down" : "Flat"}`)} · {t("predictor.confidence", { n: p.spread })}
          </p>
          {target != null && (
            <div className="mt-4 rounded-xl bg-[#F6F7FB] p-3 text-[13px] text-[#12213D]/75">
              <p className="font-semibold">{gap > 0 ? t("predictor.need", { gap }) : t("predictor.reached")}</p>
              <p className="mt-0.5">{t("predictor.plan", { n: perWeek })}</p>
            </div>
          )}
        </div>
      )}
      {locked && p && (
        <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3 rounded-xl bg-white/95 p-3 shadow-sm">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#12213D]">
            <LuLock size={14} /> {t("predictor.locked")}
          </span>
          <Button size="sm" to="/pricing">
            {t("paywall.seePlans")}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function MistakesCard() {
  const { t } = useI18n();
  const [m, setM] = useState(null);
  useEffect(() => {
    api.get("/learn/mistakes").then(setM).catch(() => {});
  }, []);
  if (!m || (!m.open && !m.mastered)) return null;
  return (
    <Link
      to="/mistakes"
      className="group flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50/60 p-5 transition hover:bg-red-50"
    >
      <LuNotebookPen size={22} className="text-red-500" />
      <div className="flex-1">
        <p className="font-bold text-[#12213D]">{t("mistakes.eyebrow")}</p>
        <p className="text-sm text-[#12213D]/60">
          {t("mistakes.due")}: <b>{m.due}</b> · {t("mistakes.mastered")}: <b>{m.mastered}</b>
        </p>
      </div>
      <LuArrowRight size={16} className="text-[#12213D]/30 transition group-hover:translate-x-0.5" />
    </Link>
  );
}
