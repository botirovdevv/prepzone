import { LuRefreshCw, LuTriangleAlert } from "react-icons/lu";

// AI import jarayoni (hooks/usePdfImport.js) uchun umumiy ko'rinishlar:
// progress chizig'i va o'qilmagan bo'laklarni qayta yuborish paneli.

export function ImportProgress({ progress }) {
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <div className="rounded-xl bg-accent/[0.05] p-3">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-semibold text-ink/70">
          {progress.preparing
            ? `${progress.preparing} bo'laklarga ajratilmoqda...`
            : `AI o'qiyapti: ${progress.done}/${progress.total} bo'lak`}
        </span>
        {!progress.preparing && <span className="tabular-nums text-ink/50">{progress.found} ta savol</span>}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
        <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FailedChunks({ failed, busy, progress, onRetry }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
      <p className="flex items-start gap-1.5 font-semibold">
        <LuTriangleAlert size={14} className="mt-px shrink-0" />
        {failed.length} ta bo'lak o'qilmadi (AI band yoki limit). Qolgan savollar tayyor — bu bo'laklarni qayta yuboring.
      </p>
      <ul className="mt-1.5 space-y-0.5 pl-5 text-amber-800/80">
        {failed.map((f) => (
          <li key={f.key}>
            {f.label} — {f.message}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onRetry}
        disabled={busy}
        className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-warning px-3 py-1.5 font-semibold text-white hover:bg-warning/90 disabled:opacity-50"
      >
        <LuRefreshCw size={13} className={busy ? "animate-spin" : ""} />
        {busy && progress ? `Qayta yuborilmoqda ${progress.done}/${progress.total}` : "Qayta urinish"}
      </button>
    </div>
  );
}
