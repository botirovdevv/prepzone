import { Link, useLocation } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import logo from "../../../public/Logo.png";
import { LanguageSwitch, useI18n } from "../../i18n";
import { ThemeCycleButton } from "../ThemeToggle";

// ------------------------------------------------------------------
// Auth sahifalari navbari: chapda logo (bosh sahifaga), o'ngda
// "Kirish | Ro'yxatdan o'tish" segmentli almashtirgich. Tanlangan pill
// sahifalar orasida bir xil yo'nalishda sirpanadi — foydalanuvchi qaysi
// sahifada ekanini va qayerga o'tishi mumkinligini doim ko'radi.
// ------------------------------------------------------------------

const TABS = [
  { to: "/login", label: "login" },
  // Telefonda joy tor — qisqa yozuv ko'rsatiladi.
  { to: "/register", label: "register", short: "registerShort" },
];

export default function AuthNavbar() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  const activeIndex = TABS.findIndex((t) => t.to === pathname);

  return (
    <header className="pz-auth-nav sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="pz-press flex shrink-0 items-center rounded-lg" aria-label={t("auth.homeLabel")}>
            <img src={logo} alt="Prepzone" className="pz-logo h-auto w-[92px] object-contain sm:w-32" />
          </Link>
          <Link
            to="/"
            className="pz-press hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-2 transition-colors hover:bg-ink/[0.04] hover:text-ink md:inline-flex"
          >
            <LuArrowLeft size={15} aria-hidden="true" />
            {t("auth.home")}
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeCycleButton className="h-9 w-9 rounded-full" />
          <LanguageSwitch className="hidden sm:inline-flex" />

        <nav
          aria-label={t("auth.account")}
          className="relative grid grid-cols-2 rounded-full bg-ink/[0.06] p-1 text-[13px] font-semibold tracking-[-0.01em] sm:text-[14px] sm:tracking-normal"
        >
          {activeIndex >= 0 && (
            <span
              aria-hidden="true"
              className="pz-segment-pill absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.04)] dark:bg-ink/25"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            />
          )}
          {TABS.map((tab, i) => {
            const active = i === activeIndex;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                replace
                aria-current={active ? "page" : undefined}
                className={`pz-press relative z-10 whitespace-nowrap rounded-full px-3.5 py-1.5 text-center transition-colors sm:px-4 ${
                  active ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {tab.short ? (
                  <>
                    <span className="sm:hidden">{t(`auth.tabs.${tab.short}`)}</span>
                    <span className="hidden sm:inline">{t(`auth.tabs.${tab.label}`)}</span>
                  </>
                ) : (
                  t(`auth.tabs.${tab.label}`)
                )}
              </Link>
            );
          })}
        </nav>
        </div>
      </div>
    </header>
  );
}
