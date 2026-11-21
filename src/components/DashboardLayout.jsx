import { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar, { SIDEBAR_W } from "./Sidebar";
import TabBar from "./TabBar";
import Avatar from "./Avatar";
import TelegramPromo from "./TelegramPromo";
import StudyPlanNudge from "./StudyPlanNudge";
import { PageLoader } from "./ui";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";

const logo = "/Logo.png";

// Telefon: yuqorida ixcham shisha panel (logo + hisob), pastda TabBar.
function MobileTopBar() {
  const { user } = useAuth();
  const { t } = useI18n();
  const name = user?.displayName || user?.email?.split("@")[0] || t("nav.userFallback");
  return (
    <header className="pz-material fixed inset-x-0 top-0 z-40 border-b border-ink/[0.08] pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="flex h-[52px] items-center justify-between px-4">
        <Link to="/dashboard" className="flex h-6 items-center" aria-label="Prepzone">
          <img src={logo} alt="Prepzone" className="pz-logo h-full w-auto object-contain" />
        </Link>
        <Link to="/account" aria-label={t("nav.accountLabel", { name })} className="rounded-full">
          <Avatar user={user} name={name} className="h-8 w-8 rounded-full bg-ink-3 text-[12px]" />
        </Link>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const offset = collapsed ? SIDEBAR_W.collapsed : SIDEBAR_W.open;

  return (
    <div className="pz-app min-h-screen bg-canvas" style={{ "--sidebar-w": `${offset}px` }}>
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
      <MobileTopBar />
      <div className="pz-page pb-[calc(var(--tabbar-h)+12px)] pt-[calc(52px+env(safe-area-inset-top))] transition-[padding] duration-300 ease-in-out-strong lg:pb-0 lg:pl-[var(--sidebar-w)] lg:pt-0">
        {/* Sahifa chunk'i yuklanayotganda navigatsiya joyida qoladi. */}
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </div>
      <TabBar />
      <TelegramPromo />
      <StudyPlanNudge />
    </div>
  );
}
