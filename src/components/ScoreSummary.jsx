import { LuTriangleAlert } from "react-icons/lu";
import { Card } from "./ui";

// Umumiy ball kartasi: katta jami ball + har bir bo'lim uchun 200–800
// shkaladagi chiziq. Results va SessionResults sahifalarida ishlatiladi.
export function ScoreSummary({ eyebrow = "Umumiy natija", total, sections, terminated }) {
  return (
    <>
      {terminated && (
        <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Test xavfsizlik qoidasi buzilgani uchun avtomatik yakunlandi.</p>
            <p className="text-red-600/80">Natija shu paytgacha bergan javoblaringiz asosida hisoblandi.</p>
          </div>
        </div>
      )}

      <Card className="mb-6 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_1.4fr]">
          <div className="relative overflow-hidden bg-night p-7 text-white sm:p-8">
            <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-accent/30 blur-2xl" />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">{eyebrow}</p>
            <p className="relative mt-3 font-display text-[64px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
              {total}
            </p>
            <p className="relative mt-2 text-sm text-white/50">400–1600 shkala bo'yicha</p>
          </div>
          <div className="flex flex-col justify-center gap-5 p-7 sm:p-8">
            {sections.map((s) => {
              const pct = Math.max(0, Math.min(100, (((s.score || 200) - 200) / 600) * 100));
              return (
                <div key={s.id}>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-ink/70">{s.title}</p>
                    <p className="font-display text-2xl font-extrabold tabular-nums text-ink">
                      {s.score}
                      <span className="ml-1 text-xs font-medium text-ink/35">/ 800</span>
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
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl bg-canvas px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/50">
            {row.label}
            {row.tag}
          </p>
          <p className="mt-1 font-display text-lg font-extrabold tabular-nums text-ink">
            {row.value}
            <span className="ml-1 text-xs font-medium text-ink/40">to'g'ri</span>
          </p>
        </div>
      ))}
    </div>
  );
}
