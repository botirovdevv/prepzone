// Apple uslubidagi segmentli boshqaruv: Yorug' / Qorong'i / Auto.
//   compact — faqat ikonkalar (navbar, sidebar uchun);
//   aks holda — ikonka + yozuv (Sozlamalar sahifasi uchun).
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { value: "light", label: "Yorug'", icon: LuSun },
  { value: "dark", label: "Qorong'i", icon: LuMoon },
  { value: "system", label: "Auto", icon: LuMonitor },
];

export default function ThemeToggle({ compact = false, className = "" }) {
  const { theme, setTheme } = useTheme();
  const index = Math.max(0, OPTIONS.findIndex((o) => o.value === theme));

  return (
    <div
      role="radiogroup"
      aria-label="Ko'rinish"
      className={`relative grid grid-cols-3 rounded-full bg-ink/[0.06] p-[3px] ${compact ? "w-[108px]" : "w-full max-w-sm"} ${className}`}
    >
      {/* Tanlangan segment "tabletkasi" — joriy pozitsiyadan silliq suriladi. */}
      <span
        aria-hidden="true"
        className="pz-segment-pill absolute bottom-[3px] left-[3px] top-[3px] rounded-full bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12),0_1px_1px_rgb(0_0_0/0.04)] dark:bg-elevated"
        style={{ width: "calc((100% - 6px) / 3)", transform: `translateX(${index * 100}%)` }}
      />
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`pz-press relative z-10 flex items-center justify-center gap-1.5 rounded-full font-medium ${
              compact ? "h-7 text-[12px]" : "h-9 text-[13px]"
            } ${active ? "text-ink" : "text-ink/50 hover:text-ink/80"}`}
          >
            <Icon size={compact ? 14 : 15} />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Bitta ikonka-tugma: Yorug' → Qorong'i → Auto aylanadi (tor joylar: navbar, yig'ilgan sidebar).
export function ThemeCycleButton({ className = "h-10 w-10 rounded-full" }) {
  const { theme, setTheme } = useTheme();
  const i = Math.max(0, OPTIONS.findIndex((o) => o.value === theme));
  const { icon: Icon, label } = OPTIONS[i];
  const next = OPTIONS[(i + 1) % OPTIONS.length];
  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      title={`Ko'rinish: ${label} (bosing: ${next.label})`}
      aria-label={`Ko'rinish: ${label}. ${next.label} rejimiga o'tish`}
      className={`pz-press flex shrink-0 items-center justify-center text-ink/70 transition hover:bg-ink/[0.06] hover:text-ink ${className}`}
    >
      <Icon size={17} />
    </button>
  );
}
