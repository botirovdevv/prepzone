// ------------------------------------------------------------------
// Dashboard (login'dan keyingi sahifalar) uchun umumiy UI elementlari.
// Apple HIG uslubi (skill: apple-web-design). Faqat semantik tokenlar:
//   ink / ink-2 / on-ink — matn;  accent — interaktiv;  canvas / surface /
//   fill / line — yuzalar;  success / warning / danger — holatlar.
// Tokenlar yorug' va qorong'i rejimda o'zi almashadi (styles/tokens.css).
// ------------------------------------------------------------------
import { Link } from "react-router-dom";
import { LuChevronRight, LuRotateCw, LuTriangleAlert } from "react-icons/lu";
import { useI18n } from "../i18n";

const cx = (...parts) => parts.filter(Boolean).join(" ");

// ---------------- Sahifa sarlavhasi (HIG Large Title) ----------------
// eyebrow — sarlavha ustidagi kichik izoh (masalan bo'lim nomi), oddiy ink-2 matn.
export function PageHeader({ eyebrow, title, subtitle, actions, children }) {
  return (
    <header className="mb-8 lg:mb-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-[15px] font-medium text-ink-2">{eyebrow}</p>}
          <h1 className="font-display text-[28px] font-bold leading-[34px] tracking-[-0.02em] text-ink sm:text-[34px] sm:leading-[41px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-[17px] leading-[25px] text-ink-2">{subtitle}</p>
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
        "bg-surface rounded-card border border-ink/[0.06] shadow-card",
        interactive && "transition duration-300 hover:shadow-lift hover:-translate-y-0.5",
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
        <h2 className="font-display text-[20px] font-semibold leading-[25px] tracking-[-0.01em] text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-[15px] leading-[20px] text-ink-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------------- Tugma ----------------
const BUTTON_VARIANTS = {
  primary: "bg-accent text-white hover:bg-accent-press",
  dark: "bg-ink text-on-ink hover:bg-ink/85",
  outline: "bg-ink/[0.06] text-ink hover:bg-ink/10",
  ghost: "text-accent hover:bg-accent/10",
  danger: "bg-danger/10 text-danger hover:bg-danger/15",
  light: "bg-white/15 text-white hover:bg-white/25 backdrop-blur",
};
// Apple tugmalari — "kapsula" (pill) shaklida.
const BUTTON_SIZES = {
  sm: "h-8 px-3.5 text-[13px] gap-1.5 rounded-full",
  md: "h-10 px-5 text-[15px] gap-2 rounded-full",
  lg: "h-12 px-7 text-[17px] gap-2 rounded-full",
};

export function Button({ variant = "primary", size = "md", to, className, children, ...props }) {
  const classes = cx(
    "inline-flex items-center justify-center font-medium tracking-[-0.01em] whitespace-nowrap transition disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25",
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

// ---------------- Segmentli boshqaruv (HIG segmented control) ----------------
// 2–5 ta o'zaro istisno variant: mavzu, til, sahifa ichidagi tablar/filtrlar.
//   options: [{ value, label, icon? }]
export function SegmentedControl({ options, value, onChange, size = "md", iconOnly = false, label, className }) {
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const h = size === "sm" ? "h-7 text-[12px]" : "h-8 text-[13px]";
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx("relative inline-grid rounded-full bg-fill p-[3px]", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pz-segment-pill absolute bottom-[3px] left-[3px] top-[3px] rounded-full bg-surface shadow-[0_1px_3px_rgb(0_0_0/0.12),0_1px_1px_rgb(0_0_0/0.04)] dark:bg-ink/25"
        style={{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={iconOnly ? o.label : undefined}
            title={iconOnly ? o.label : undefined}
            onClick={() => onChange(o.value)}
            className={cx(
              "relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 font-medium transition-colors",
              h,
              active ? "text-ink" : "text-ink-2 hover:text-ink"
            )}
          >
            {Icon && <Icon size={size === "sm" ? 13 : 14} />}
            {!iconOnly && o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------- iOS "inset grouped" ro'yxat ----------------
// <SectionTitle> — guruh ustidagi kichik sarlavha; <ListGroup> — bitta yumaloq karta;
// <ListRow> — qator (ikonka, sarlavha, izoh, qiymat, o'ng tomonda chevron yoki boshqaruv).
export function SectionTitle({ children, action, className }) {
  return (
    <div className={cx("mb-2 flex items-end justify-between gap-3 px-4", className)}>
      <h2 className="text-[13px] font-medium leading-[18px] text-ink-2">{children}</h2>
      {action}
    </div>
  );
}

export function ListGroup({ as: Tag = "div", className, children, ...props }) {
  return (
    <Tag
      className={cx(
        "overflow-hidden rounded-card border border-ink/[0.06] bg-surface shadow-card",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

const ROW_ICON_TONES = {
  blue: "bg-accent text-white",
  green: "bg-success text-white",
  orange: "bg-warning text-white",
  red: "bg-danger text-white",
  purple: "bg-purple text-white",
  gray: "bg-ink-3 text-white",
  plain: "text-ink-2",
};

export function ListRow({
  icon: Icon,
  iconTone = "plain",
  title,
  subtitle,
  value,
  accessory,
  to,
  state,
  onClick,
  chevron,
  destructive = false,
  disabled = false,
  className,
  children,
}) {
  const interactive = Boolean(to || onClick) && !disabled;
  const showChevron = chevron ?? interactive;
  const content = (
    <>
      {Icon && (
        <span
          className={cx(
            "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px]",
            ROW_ICON_TONES[iconTone]
          )}
        >
          <Icon size={iconTone === "plain" ? 20 : 17} />
        </span>
      )}
      <span className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 border-b border-ink/[0.08] py-2.5 pr-4 group-last/row:border-b-0">
        <span className="min-w-0 flex-1">
          <span
            className={cx(
              "block truncate text-[16px] leading-[21px]",
              destructive ? "text-danger" : disabled ? "text-ink-3" : "text-ink"
            )}
          >
            {title}
          </span>
          {subtitle && <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-2">{subtitle}</span>}
          {children}
        </span>
        {value != null && <span className="shrink-0 text-[15px] text-ink-2 tabular-nums">{value}</span>}
        {accessory}
        {showChevron && <LuChevronRight size={17} className="shrink-0 text-ink-3" aria-hidden="true" />}
      </span>
    </>
  );
  const base = cx(
    "group/row flex w-full items-center gap-3 pl-4 text-left",
    interactive && "transition-colors hover:bg-ink/[0.03] active:bg-ink/[0.06]",
    disabled && "cursor-not-allowed",
    className
  );
  if (to && !disabled) {
    return (
      <Link to={to} state={state} className={base}>
        {content}
      </Link>
    );
  }
  if (onClick && !disabled) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {content}
      </button>
    );
  }
  return (
    <div className={base} aria-disabled={disabled || undefined}>
      {content}
    </div>
  );
}

// ---------------- Ikonka "plitkasi" ----------------
const TONES = {
  blue: "bg-accent/10 text-accent",
  ink: "bg-ink/[0.06] text-ink/70",
  amber: "bg-warning/10 text-warning",
  emerald: "bg-success/10 text-success",
  red: "bg-danger/10 text-danger",
  solid: "bg-accent text-white",
  dark: "bg-ink text-on-ink",
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
        <p className="text-[13px] font-medium text-ink-2">{label}</p>
        <p className="font-display text-[28px] font-bold tracking-[-0.02em] leading-tight text-ink tabular-nums mt-0.5">
          {value ?? "—"}
        </p>
        {hint && <p className="text-[12px] text-ink-2 mt-0.5">{hint}</p>}
      </div>
    </Card>
  );
}

// ---------------- Belgi (badge) ----------------
const BADGE_TONES = {
  blue: "bg-accent/10 text-accent",
  ink: "bg-ink/[0.06] text-ink/60",
  amber: "bg-warning/10 text-warning",
  emerald: "bg-success/10 text-success",
  red: "bg-danger/10 text-danger",
};

export function Badge({ tone = "ink", icon: Icon, children, className }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[12px] font-semibold whitespace-nowrap",
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
    <Card className="px-6 py-14 text-center">
      {icon && <IconTile icon={icon} tone="blue" size="lg" className="mx-auto mb-4" />}
      <p className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      {text && <p className="text-[15px] text-ink-2 mt-1 max-w-sm mx-auto">{text}</p>}
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
      <p className="mx-auto max-w-sm text-sm text-ink/70">{text || t("common.loadError")}</p>
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
  return <div className={cx("animate-pulse rounded-2xl bg-ink/[0.05]", className)} />;
}

// iOS uslubidagi faollik indikatori (index.css → .pz-spinner).
export function Spinner({ size = 28, className }) {
  return (
    <span aria-hidden="true" className={cx("pz-spinner text-ink/70", className)} style={{ width: size, height: size }}>
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} style={{ "--i": i }} />
      ))}
    </span>
  );
}

// Sahifa yuklanmoqda.
//   fullscreen — butun ekran markazida (layout'dan tashqari: auth tekshiruvi, test sahifalari);
//   aks holda — DashboardLayout ichida, ko'rinib turgan kontent maydonining markazida
//   (telefonda yuqori panel va tab bar hisobga olinadi).
export function PageLoader({ fullscreen = false, label }) {
  const { t } = useI18n();
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        "pz-loader flex flex-col items-center justify-center gap-3",
        fullscreen ? "fixed inset-0 z-40 bg-canvas" : "min-h-[calc(100dvh-52px-var(--tabbar-h))] lg:min-h-[100dvh]"
      )}
    >
      <Spinner />
      <span className="text-[13px] font-medium tracking-[-0.01em] text-ink/45">{label || t("common.loading")}</span>
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
  "w-full h-11 rounded-xl border border-ink/[0.12] bg-surface px-3.5 text-[16px] text-ink placeholder:text-ink-3 outline-none transition hover:border-ink/25 focus:border-accent focus:ring-4 focus:ring-accent/15 disabled:bg-ink/[0.04] disabled:text-ink/45";

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-ink-3">{hint}</span>}
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
          <stop offset="0%" stopColor="rgb(var(--c-accent))" stopOpacity="0.18" />
          <stop offset="100%" stopColor="rgb(var(--c-accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(var(--c-ink))" strokeOpacity="0.07" strokeDasharray="3 4" />
          <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgb(var(--c-ink))" fillOpacity="0.4">
            {t}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#pz-trend-fill)" />
      <path d={line} fill="none" stroke="rgb(var(--c-accent))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {scores.map((s, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(s.value)} r="4.5" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-accent))" strokeWidth="2.5">
            <title>{`${s.label}: ${s.value}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}
