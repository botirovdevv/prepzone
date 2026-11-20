// Telefon uchun pastki tab bar (HIG): 5 ta bo'lim, har birida ikonka + yozuv.
// Kontent ustida suzuvchi "shisha" panel; faqat lg dan kichik ekranlarda.
import { NavLink, useLocation } from "react-router-dom";
import { TABS } from "./navConfig";
import { useI18n } from "../i18n";

export default function TabBar() {
  const { t } = useI18n();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label={t("nav.tabsLabel")}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="pz-tabbar mx-auto grid h-[58px] max-w-md grid-cols-5 rounded-[28px] px-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const extra = tab.match?.some((p) => pathname.startsWith(p));
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-[22px] transition-colors ${
                  isActive || extra ? "text-accent" : "text-ink-2 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive || extra ? 2.25 : 1.9} aria-hidden="true" />
                  <span className="max-w-full truncate px-0.5 text-[10px] font-medium leading-3">{t(`nav.${tab.label}`)}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
