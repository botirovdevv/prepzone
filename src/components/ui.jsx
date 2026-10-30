// ------------------------------------------------------------------
// Dashboard (login'dan keyingi sahifalar) uchun umumiy UI elementlari.
// Ranglar faqat loyihaning mavjud palitrasidan:
//   ink     #12213D  — matn, to'q yuzalar
//   primary #087fd1  — asosiy aksent (hover: #066fb8)
//   fon     #F6F7FB, oq; holatlar uchun amber / emerald / red.
// ------------------------------------------------------------------
import { Link } from "react-router-dom";
import { LuRotateCw, LuTriangleAlert } from "react-icons/lu";
import { useI18n } from "../i18n";

const cx = (...parts) => parts.filter(Boolean).join(" ");

// ---------------- Sahifa sarlavhasi ----------------
export function PageHeader({ eyebrow, icon: Icon, title, subtitle, actions, children }) {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#087fd1] mb-3">
              {Icon && <Icon size={14} />}
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[28px] sm:text-[34px] font-extrabold tracking-[-0.02em] text-[#12213D] leading-[1.1]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2.5 max-w-2xl text-[15px] leading-relaxed text-[#12213D]/55">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

// ---------------- Karta ----------------
export function Card({ as: Tag = "div", interactive = false, className, children, ...props }) {
  return (
    <Tag
      className={cx(
        "bg-white rounded-2xl border border-[#12213D]/[0.07] shadow-[0_1px_2px_rgba(18,33,61,0.04)]",
        interactive &&
          "transition hover:border-[#12213D]/15 hover:shadow-[0_10px_28px_-12px_rgba(18,33,61,0.22)] hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cx("flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-bold text-[#12213D]">{title}</h2>
        {subtitle && <p className="text-sm text-[#12213D]/50 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------------- Tugma ----------------
const BUTTON_VARIANTS = {
  primary: "bg-[#087fd1] text-white hover:bg-[#066fb8] shadow-[0_8px_20px_-10px_rgba(8,127,209,0.7)]",
  dark: "bg-[#12213D] text-white hover:bg-[#12213D]/90",
  outline: "bg-white text-[#12213D] border border-[#12213D]/12 hover:border-[#12213D]/25 hover:bg-[#12213D]/[0.02]",
  ghost: "text-[#12213D]/60 hover:text-[#12213D] hover:bg-[#12213D]/5",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
  light: "bg-white/10 text-white hover:bg-white/20",
};
const BUTTON_SIZES = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-2xl",
};

export function Button({ variant = "primary", size = "md", to, className, children, ...props }) {
  const classes = cx(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition disabled:opacity-50 disabled:pointer-events-none",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

// ---------------- Ikonka "plitkasi" ----------------
const TONES = {
  blue: "bg-[#087fd1]/10 text-[#087fd1]",
  ink: "bg-[#12213D]/[0.06] text-[#12213D]/70",
  amber: "bg-amber-500/10 text-amber-600",
  emerald: "bg-emerald-500/10 text-emerald-600",
  red: "bg-red-500/10 text-red-600",
  solid: "bg-[#087fd1] text-white",
  dark: "bg-[#12213D] text-white",
};

export function IconTile({ icon: Icon, tone = "blue", size = "md", className }) {
  const s = size === "lg" ? "w-12 h-12 rounded-2xl" : size === "sm" ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl";
  const iconSize = size === "lg" ? 22 : size === "sm" ? 15 : 18;
  return (
    <span className={cx("flex items-center justify-center shrink-0", s, TONES[tone], className)}>
      <Icon size={iconSize} />
    </span>
  );
}

// ---------------- Statistika plitkasi ----------------
export function StatTile({ icon, label, value, hint, tone = "blue" }) {
  return (
    <Card className="p-5 flex items-start gap-4">
      {icon && <IconTile icon={icon} tone={tone} />}
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#12213D]/45">{label}</p>
        <p className="font-display text-[26px] font-extrabold leading-tight text-[#12213D] tabular-nums mt-0.5">
          {value ?? "—"}
        </p>
        {hint && <p className="text-xs text-[#12213D]/45 mt-0.5">{hint}</p>}
      </div>
    </Card>
  );
}

// ---------------- Belgi (badge) ----------------
const BADGE_TONES = {
  blue: "bg-[#087fd1]/10 text-[#087fd1]",
  ink: "bg-[#12213D]/[0.06] text-[#12213D]/60",
  amber: "bg-amber-500/10 text-amber-700",
  emerald: "bg-emerald-500/10 text-emerald-700",
  red: "bg-red-500/10 text-red-600",
};

export function Badge({ tone = "ink", icon: Icon, children, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap",
        BADGE_TONES[tone],
        className
      )}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

// ---------------- Bo'sh holat ----------------
export function EmptyState({ icon, title, text, action }) {
  return (
    <Card className="border-dashed px-6 py-14 text-center">
      {icon && <IconTile icon={icon} tone="blue" size="lg" className="mx-auto mb-4" />}
      <p className="font-display font-bold text-[#12213D]">{title}</p>
      {text && <p className="text-sm text-[#12213D]/50 mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </Card>
  );
}

// ---------------- Xato holati ----------------
// Ma'lumot yuklanmasa — "bo'sh" deb emas, xato va "Qayta urinish" bilan.
export function ErrorState({ text, onRetry, className }) {
  const { t } = useI18n();
  return (
    <Card role="alert" className={cx("border-red-200 bg-red-50/40 px-6 py-10 text-center", className)}>
      <IconTile icon={LuTriangleAlert} tone="red" size="lg" className="mx-auto mb-4" />
      <p className="mx-auto max-w-sm text-sm text-[#12213D]/70">{text || t("common.loadError")}</p>
      {onRetry && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <LuRotateCw size={14} /> {t("common.retry")}
          </Button>
        </div>
      )}
    </Card>
  );
}

// ---------------- Yuklanish holatlari ----------------
export function Skeleton({ className }) {
  return <div className={cx("animate-pulse rounded-2xl bg-[#12213D]/[0.05]", className)} />;
}

// iOS uslubidagi faollik indikatori (index.css → .pz-spinner).
export function Spinner({ size = 28, className }) {
  return (
    <span aria-hidden="true" className={cx("pz-spinner text-[#12213D]/70", className)} style={{ width: size, height: size }}>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

// Sahifa yuklanmoqda.
//   fullscreen — butun ekran markazida (layout'dan tashqari: auth tekshiruvi, test sahifalari);
//   aks holda — DashboardLayout ichida, ko'rinib turgan kontent maydonining markazida
//   (mobil header 3.5rem hisobga olinadi).
export function PageLoader({ fullscreen = false, label }) {
  const { t } = useI18n();
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "pz-loader flex flex-col items-center justify-center gap-3",
        fullscreen ? "fixed inset-0 z-40 bg-[#F6F7FB]" : "min-h-[calc(100dvh-3.5rem)] lg:min-h-[100dvh]"
      )}
    >
      <Spinner />
      <span className="text-[13px] font-medium tracking-[-0.01em] text-[#12213D]/45">{label || t("common.loading")}</span>
    </div>
  );
}

// ---------------- Sahifa konteyneri ----------------
export function Page({ width = "wide", className, children }) {
  const max = width === "narrow" ? "max-w-3xl" : width === "form" ? "max-w-2xl" : "max-w-6xl";
  return <div className={cx("mx-auto px-5 py-8 sm:px-8 lg:px-10 lg:py-10", max, className)}>{children}</div>;
}

// ---------------- Forma elementlari ----------------
export const inputClass =
  "w-full h-11 rounded-xl border border-[#12213D]/12 bg-white px-3.5 text-[15px] text-[#12213D] placeholder:text-[#12213D]/30 outline-none transition focus:border-[#087fd1] focus:ring-4 focus:ring-[#087fd1]/10 disabled:bg-[#12213D]/[0.03] disabled:text-[#12213D]/45";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-[#12213D]/75">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-[#12213D]/45">{hint}</span>}
    </label>
  );
}

// ---------------- Ball dinamikasi grafigi ----------------
// scores: [{ value, label }] — eski natijadan yangisiga qarab.
export function ScoreTrend({ scores, height = 150, min = 400, max = 1600 }) {
  const { t } = useI18n();
  if (!scores || scores.length === 0) return null;
  const w = 600;
  const h = height;
  const pad = { t: 14, r: 12, b: 22, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const x = (i) => pad.l + (scores.length === 1 ? innerW / 2 : (i / (scores.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * innerH;
  const line = scores.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(scores.length - 1).toFixed(1)},${pad.t + innerH} L${x(0).toFixed(1)},${pad.t + innerH} Z`;
  const ticks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label={t("common.scoreTrend")}>
      <defs>
        <linearGradient id="pz-trend-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#087fd1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#087fd1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="#12213D" strokeOpacity="0.07" strokeDasharray="3 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#12213D" fillOpacity="0.4">
            {t}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#pz-trend-fill)" />
      <path d={line} fill="none" stroke="#087fd1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {scores.map((s, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(s.value)} r="4.5" fill="#fff" stroke="#087fd1" strokeWidth="2.5">
            <title>{`${s.label}: ${s.value}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
