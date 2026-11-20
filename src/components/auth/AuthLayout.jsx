import { LuSigma, LuChartLine, LuLayers } from "react-icons/lu";
import AuthNavbar from "./AuthNavbar";
import { LanguageSwitch, useI18n } from "../../i18n";

// ------------------------------------------------------------------
// Login / Register / Parolni tiklash sahifalarining umumiy qobig'i.
// Telefonda bitta ustun (faqat forma). Katta ekranda o'ngda Prepzone
// nima berishini ko'rsatadigan qorong'i panel — forma diqqat markazida
// qoladi, panel esa uni chalg'itmasdan to'ldiradi.
// ------------------------------------------------------------------
export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="pz-auth-bg relative flex min-h-[100dvh] flex-col text-ink">
      <AuthNavbar />

      <main className="mx-auto grid w-full max-w-[1120px] flex-1 items-center gap-10 px-4 pb-10 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-14 lg:py-12">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="pz-rise mb-7 px-1">
            {eyebrow && (
              <p className="text-[13px] font-semibold tracking-[-0.005em] text-accent">{eyebrow}</p>
            )}
            <h1 className="mt-1 font-display text-[34px] font-bold leading-[1.06] tracking-[-0.03em] sm:text-[40px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-[17px] leading-[1.47] tracking-[-0.01em] text-ink-2">{subtitle}</p>
            )}
          </div>

          <div className="pz-rise-2 pz-auth-card rounded-[28px] p-5 sm:p-7">{children}</div>

          {footer && (
            <div className="pz-rise-3 mt-6 text-center text-[15px] text-ink-2">{footer}</div>
          )}
        </div>

        <Showcase />
      </main>

      <footer className="flex flex-col items-center gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-[12px] text-ink-3">
        <LanguageSwitch className="sm:hidden" />
        <span>&copy; {new Date().getFullYear()} Prepzone</span>
      </footer>
    </div>
  );
}

const FEATURE_ICONS = [LuLayers, LuSigma, LuChartLine];

// Faqat lg+ ekranlarda. Raqamlar namuna sifatida belgilangan — real statistika emas.
function Showcase() {
  const { t, tr } = useI18n();
  return (
    <aside
      aria-hidden="true"
      className="pz-rise-3 pz-auth-aside relative hidden min-h-[600px] overflow-hidden rounded-[32px] p-10 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div>
        <p className="text-[13px] font-semibold text-white/60">Prepzone SAT</p>
        <p className="mt-2 max-w-[22ch] font-display text-[34px] font-bold leading-[1.08] tracking-[-0.03em]">
          {t("auth.showcase.title")}
        </p>
      </div>

      <div className="pz-glass mx-auto my-8 w-full max-w-[340px] rounded-[24px] p-6">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-white/70">{t("auth.showcase.estimate")}</p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/70">{t("auth.showcase.sample")}</span>
        </div>
        <p className="mt-1 font-display text-[56px] font-bold leading-none tracking-[-0.04em] tabular-nums">1480</p>
        <div className="mt-5 space-y-3">
          {[
            ["Reading & Writing", 740, 800],
            ["Math", 740, 800],
          ].map(([label, value, max]) => (
            <div key={label}>
              <div className="mb-1.5 flex justify-between text-[12px] text-white/70">
                <span>{label}</span>
                <span className="tabular-nums text-white">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-surface" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="grid gap-4">
        {tr("auth.showcase.features").map(({ title, text }, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
          <li key={title} className="flex gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
              <p className="text-[14px] leading-[1.45] text-white/65">{text}</p>
            </div>
          </li>
          );
        })}
      </ul>
    </aside>
  );
}
