import { LuClock, LuVolume2, LuCircleHelp, LuEyeOff, LuEye, LuLogOut, LuWifi, LuBell } from "react-icons/lu";

function formatLeft(seconds) {
  if (seconds >= 60) {
    const m = Math.ceil(seconds / 60);
    return `${m} minute${m === 1 ? "" : "s"} left`;
  }
  return `${seconds} seconds left`;
}

// IELTS on Computer'dagi yuqori panelga o'xshash: chapda logo va nomzod,
// markazda taymer (10 va 5 daqiqada ogohlantiruvchi rang), o'ngda asboblar.
export default function IeltsHeader({
  candidate,
  sectionLabel,
  secondsLeft,
  timerHidden,
  onToggleTimer,
  onHelp,
  onExit,
  volume,
  onVolume,
}) {
  const warn = secondsLeft <= 600;
  const critical = secondsLeft <= 300;
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#d7d7d7] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="rounded bg-[#e4002b] px-2 py-0.5 font-display text-[15px] font-black tracking-wide text-white">
          IELTS
        </span>
        <div className="hidden min-w-0 leading-tight sm:block">
          <p className="truncate text-[13px] font-semibold text-[#1d1d1b]">{candidate}</p>
          <p className="text-[11px] text-[#1d1d1b]/55">{sectionLabel}</p>
        </div>
      </div>

      <div className="flex flex-1 justify-center">
        {!timerHidden ? (
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-1 text-[15px] font-bold tabular-nums ${
              critical
                ? "animate-pulse bg-[#e4002b] text-white"
                : warn
                  ? "bg-[#e4002b]/10 text-[#e4002b]"
                  : "text-[#1d1d1b]"
            }`}
          >
            <LuClock size={17} /> {formatLeft(secondsLeft)}
          </div>
        ) : (
          <span className="text-[13px] text-[#1d1d1b]/40">Timer hidden</span>
        )}
      </div>

      <div className="flex items-center gap-1 text-[#1d1d1b]/70">
        {onVolume && (
          <label className="mr-2 hidden items-center gap-2 md:flex" title="Volume">
            <LuVolume2 size={18} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              className="w-24 accent-[#1d1d1b]"
            />
          </label>
        )}
        <span className="hidden p-2 lg:inline" title="Connected">
          <LuWifi size={17} />
        </span>
        <span className="hidden p-2 lg:inline">
          <LuBell size={17} />
        </span>
        <button onClick={onToggleTimer} className="rounded p-2 hover:bg-black/5" title={timerHidden ? "Show timer" : "Hide timer"}>
          {timerHidden ? <LuEye size={18} /> : <LuEyeOff size={18} />}
        </button>
        <button onClick={onHelp} className="rounded p-2 hover:bg-black/5" title="Help">
          <LuCircleHelp size={18} />
        </button>
        <button
          onClick={onExit}
          className="ml-1 flex items-center gap-1.5 rounded border border-[#1d1d1b]/20 px-2.5 py-1.5 text-[12px] font-semibold hover:bg-black/5"
        >
          <LuLogOut size={14} /> Exit
        </button>
      </div>
    </header>
  );
}
