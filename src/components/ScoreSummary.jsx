import { LuTriangleAlert } from "react-icons/lu";
import { Card } from "./ui";
import { useI18n } from "../i18n";

// Umumiy ball kartasi: katta jami ball + har bir bo'lim uchun 200–800
// shkaladagi chiziq. Results va SessionResults sahifalarida ishlatiladi.
export function ScoreSummary({ eyebrow, total, sections, terminated }) {
  const { t } = useI18n();
  return (
    <>
      {terminated && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-danger/[0.08] p-4 text-[15px] text-danger">
          <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t("results.summary.terminatedTitle")}</p>
            <p className="text-danger/80">{t("results.summary.terminatedText")}</p>
          </div>
        </div>
      )}

      <Card className="mb-6 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.4fr]">
          <div className="border-b border-ink/[0.08] bg-surface-2 p-7 sm:p-8 md:border-b-0 md:border-r">
            <p className="text-[13px] font-medium text-ink-2">{eyebrow || t("results.summary.eyebrow")}</p>
            <p className="mt-2 font-display text-[64px] font-bold leading-none tracking-[-0.03em] text-ink tabular-nums">
              {total}
            </p>
            <p className="mt-2 text-[13px] text-ink-2">{t("results.summary.scale")}</p>
          </div>
          <div className="flex flex-col justify-center gap-5 p-7 sm:p-8">
            {sections.map((s) => {
              const pct = Math.max(0, Math.min(100, (((s.score || 200) - 200) / 600) * 100));
              return (
                <div key={s.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-[15px] font-medium text-ink-2">{s.title}</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-ink">
                      {s.score}
                      <span className="ml-1 text-xs font-medium text-ink-3">/ 800</span>
                    </p>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink/[0.06]">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </>
  );
}

// Modul bo'yicha to'g'ri javoblar jadvali (bo'lim kartasi ichida).
export function ModuleBreakdown({ rows }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl bg-canvas px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/50">
            {row.label}
            {row.tag}
          </p>
          <p className="mt-1 font-display text-lg font-bold tabular-nums text-ink">
            {row.value}
            <span className="ml-1 text-xs font-medium text-ink/40">{t("results.summary.correctSuffix")}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
