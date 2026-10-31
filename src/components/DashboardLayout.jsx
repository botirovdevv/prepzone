import { Suspense, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TelegramPromo from "./TelegramPromo";
import { PageLoader } from "./ui";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebarCollapsed") === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="pz-app min-h-screen bg-[#F6F7FB]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onOpenMobile={() => setMobileOpen(true)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={`pz-page transition-[padding] duration-300 ease-in-out-strong pt-14 lg:pt-0 ${
          collapsed ? "lg:pl-[84px]" : "lg:pl-[260px]"
        }`}
      >
        {/* Sahifa chunk'i yuklanayotganda sidebar joyida qoladi. */}
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </div>
      <TelegramPromo />
    </div>
  );
}
