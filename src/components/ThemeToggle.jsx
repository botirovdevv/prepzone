// Kirishdan oldingi sahifalar (bosh sahifa, login) uchun ixcham mavzu tugmasi.
// Tizimga kirgandan keyin mavzu Sozlamalar > "Ko'rinish va til" bo'limida tanlanadi.
import { LuMonitor, LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";
import { useI18n } from "../i18n";

const OPTIONS = [
  { value: "light", icon: LuSun },
  { value: "dark", icon: LuMoon },
  { value: "system", icon: LuMonitor },
];

// Bitta ikonka-tugma: Yorug' → Qorong'i → Auto aylanadi (tor joylar: navbar, yig'ilgan sidebar).
export function ThemeCycleButton({ className = "h-10 w-10 rounded-full" }) {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  const i = Math.max(0, OPTIONS.findIndex((o) => o.value === theme));
  const { icon: Icon } = OPTIONS[i];
  const next = OPTIONS[(i + 1) % OPTIONS.length];
  const hint = t("account.theme.cycle", {
    current: t(`account.theme.${OPTIONS[i].value}`),
    next: t(`account.theme.${next.value}`),
  });
  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      title={hint}
      aria-label={hint}
      className={`pz-press flex shrink-0 items-center justify-center text-ink/70 transition hover:bg-ink/[0.06] hover:text-ink ${className}`}
    >
      <Icon size={17} />
    </button>
  );
}
