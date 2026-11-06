import { useEffect, useState } from "react";
import { LuCrown } from "react-icons/lu";
import { api } from "../../api/client";
import { Card, Button, Badge } from "../ui";
import { useI18n, formatDate, formatNumber } from "../../i18n";

// Sozlamalar: joriy tarif, limitlar va to'lovlar tarixi.
const TONE = { pending: "ink", receipt_sent: "amber", approved: "emerald", rejected: "red", expired: "ink" };

export default function SubscriptionCard() {
  const { t } = useI18n();
  const [d, setD] = useState(null);
  useEffect(() => {
    api.get("/billing/me").then(setD).catch(() => {});
  }, []);
  if (!d) return null;

  const date = (v) => formatDate(v, { day: "numeric", month: "long", year: "numeric" });
  const limitText = (used, limit) => (limit == null ? t("billing.unlimited") : `${used}/${limit}`);

  return (
    <Card className="mb-6 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <LuCrown size={22} />
          </span>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">{t("billing.section")}</p>
            <p className="font-display text-xl font-extrabold text-[#12213D]">{t(`plans.names.${d.plan}`)}</p>
            <p className="text-sm text-[#12213D]/55">
              {d.planEndsAt ? t("billing.until", { date: date(d.planEndsAt) }) : d.plan === "free" ? "" : t("billing.forever")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#12213D]/60">
          <Badge tone="ink">
            Mock: {limitText(d.mock.used, d.mock.limit)}
            {d.mock.period ? ` · ${t(`billing.period.${d.mock.period}`)}` : ""}
          </Badge>
          <Badge tone="ink">AI: {limitText(d.ai.used, d.ai.limit)}</Badge>
          <Button size="sm" to="/pricing">
            {d.plan === "free" ? t("paywall.seePlans") : t("plans.extend")}
          </Button>
        </div>
      </div>
      {d.payments.length > 0 && (
        <div className="mt-5 border-t border-[#12213D]/[0.06] pt-4">
          <p className="mb-2 text-sm font-semibold text-[#12213D]">{t("billing.history")}</p>
          <div className="space-y-1.5">
            {d.payments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 text-[13px] text-[#12213D]/70">
                <span>
                  {formatDate(p.createdAt, { day: "2-digit", month: "short" })} · {t(`plans.names.${p.plan}`)} · {t(`plans.months.${p.months}`)}
                </span>
                <span className="flex items-center gap-2">
                  <b className="tabular-nums">{formatNumber(p.amount)}</b>
                  <Badge tone={TONE[p.status]}>{t(`billing.status.${p.status}`)}</Badge>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
