import { useEffect, useState } from "react";
import { LuCheck, LuSparkles } from "react-icons/lu";
import { api } from "../../api/client";
import { useI18n, formatNumber } from "../../i18n";

// ------------------------------------------------------------------
// Tarif kartalari (bosh sahifa, /pricing, paywall). Narxlar serverdan
// (server/src/lib/plans.js) — bitta manba.
// ------------------------------------------------------------------

const FALLBACK = [
  { id: "free", prices: {} },
  { id: "sprint", prices: { 1: 59000, 3: 149000 } },
  { id: "pro", prices: { 1: 129000, 3: 299000 }, popular: true },
  { id: "elite", prices: { 1: 249000, 3: 599000 } },
];

let cache = null;
export function usePlans() {
  const [data, setData] = useState(cache || { plans: FALLBACK, botEnabled: true });
  useEffect(() => {
    if (cache) return;
    api
      .get("/billing/plans")
      .then((d) => {
        cache = d;
        setData(d);
      })
      .catch(() => {});
  }, []);
  return data;
}

const RANK = { free: 0, sprint: 1, pro: 2, elite: 3 };
const fmt = (n) => formatNumber(n).replace(/,/g, " ");

export function MonthsToggle({ months, onChange, dark = false }) {
  const { t } = useI18n();
  return (
    <div
      className={`inline-flex rounded-full p-1 text-sm font-semibold ${
        dark ? "bg-white/10" : "bg-[#111827]/[0.05]"
      }`}
    >
      {[1, 3].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`rounded-full px-4 py-2 transition ${
            months === m
              ? dark
                ? "bg-white text-[#111827]"
                : "bg-white text-[#111827] shadow-sm"
              : dark
              ? "text-white/70"
              : "text-[#667085]"
          }`}
        >
          {t(`plans.months.${m}`)}
          {m === 3 && <span className="ml-1.5 text-[11px] font-bold text-emerald-600">{t("plans.saveUpTo")}</span>}
        </button>
      ))}
    </div>
  );
}

export default function PlanCards({ months, currentPlan, onChoose, busyPlan, compact = false }) {
  const { t, tr } = useI18n();
  const { plans } = usePlans();

  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4"}`}>
      {plans
        .filter((p) => !compact || p.id !== "free")
        .map((p) => {
          const price = p.prices?.[months];
          const monthly = price ? Math.round(price / months / 1000) * 1000 : 0;
          const fullMonthly = p.prices?.[1];
          const savePct = months === 3 && fullMonthly ? Math.round((1 - price / (fullMonthly * 3)) * 100) : 0;
          const isCurrent = currentPlan === p.id;
          const lower = currentPlan && RANK[currentPlan] > RANK[p.id];
          const popular = p.popular;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl border p-6 ${
                popular
                  ? "border-[#087fd1] bg-[#111827] text-white shadow-[0_30px_60px_-30px_rgba(8,127,209,0.55)]"
                  : "border-[#111827]/[0.08] bg-white text-[#111827]"
              }`}
            >
              {popular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#087fd1] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                  <LuSparkles size={12} /> {t("plans.popular")}
                </span>
              )}
              <h3 className="text-[19px] font-bold tracking-tight">{t(`plans.names.${p.id}`)}</h3>
              <p className={`mt-1 text-[13px] ${popular ? "text-white/60" : "text-[#667085]"}`}>
                {t(`plans.taglines.${p.id}`)}
              </p>

              <div className="mt-5 min-h-[64px]">
                {p.id === "free" ? (
                  <p className="font-['Inter_Tight'] text-[38px] font-semibold leading-none tracking-tight">0</p>
                ) : (
                  <>
                    <p className="font-['Inter_Tight'] text-[38px] font-semibold leading-none tracking-tight tabular-nums">
                      {fmt(monthly)}
                      <span className={`ml-1 text-[14px] font-medium ${popular ? "text-white/60" : "text-[#667085]"}`}>
                        so'm{t("plans.perMonth")}
                      </span>
                    </p>
                    <p className={`mt-1.5 text-[12px] ${popular ? "text-white/50" : "text-[#98a2b3]"}`}>
                      {months === 3 ? `${fmt(price)} so'm · ${t("plans.save", { pct: savePct })}` : t("plans.oneTime")}
                    </p>
                  </>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5 text-[14px]">
                {(tr(`plans.features.${p.id}`) || []).map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <LuCheck size={16} className={`mt-0.5 shrink-0 ${popular ? "text-[#53b7f5]" : "text-emerald-600"}`} />
                    <span className={popular ? "text-white/85" : "text-[#344054]"}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={(isCurrent && p.id === "free") || lower || busyPlan === p.id}
                onClick={() => onChoose?.(p.id)}
                className={`mt-6 rounded-full py-3.5 text-[14px] font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  popular
                    ? "bg-[#087fd1] text-white hover:bg-[#066fb8]"
                    : p.id === "free"
                    ? "border border-[#111827]/12 text-[#111827] hover:bg-[#111827]/[0.04]"
                    : "bg-[#111827] text-white hover:bg-[#087fd1]"
                }`}
              >
                {busyPlan === p.id
                  ? "…"
                  : isCurrent
                  ? p.id === "free"
                    ? t("plans.current")
                    : t("plans.extend")
                  : p.id === "free"
                  ? t("plans.startFree")
                  : t("plans.choose")}
              </button>
            </div>
          );
        })}
    </div>
  );
}

export function PricingCompare() {
  const { tr } = useI18n();
  const cols = tr("pricing.compareCols") || [];
  const rows = tr("pricing.compareRows") || [];
  return (
    <div className="overflow-x-auto rounded-3xl border border-[#111827]/[0.08] bg-white">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#111827]/[0.06]">
            <th className="p-4 font-semibold text-[#667085]" />
            {cols.map((c, i) => (
              <th key={c} className={`p-4 font-bold ${i === 0 ? "text-[#087fd1]" : "text-[#344054]"}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, ...vals]) => (
            <tr key={label} className="border-b border-[#111827]/[0.04] last:border-0">
              <td className="p-4 font-medium text-[#344054]">{label}</td>
              {vals.map((v, i) => (
                <td
                  key={i}
                  className={`p-4 ${i === 0 ? "bg-[#087fd1]/[0.04] font-bold text-[#111827]" : "text-[#667085]"}`}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
