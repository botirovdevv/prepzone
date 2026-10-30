import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LuCompass,
  LuZap,
  LuFileText,
  LuBookOpen,
  LuTrendingUp,
  LuTrophy,
  LuSettings,
  LuLogOut,
  LuChevronsLeft,
  LuChevronsRight,
  LuMenu,
  LuX,
  LuShieldCheck,
  LuLibrary,
  LuKeyRound,
  LuChartColumn,
  LuHouse,
  LuCalculator,
  LuVideo,
} from "react-icons/lu";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
const logo = "/Logo.png";
const LogoMark = "/Logo-sm.png";

const NAV = [
  {
    label: "MAIN",
    items: [
      { to: "/dashboard", label: "Today", icon: LuHouse, iconColor: "text-[#0096c7]" },
      { to: "/study-plan", label: "Study Plan", icon: LuCompass, iconColor: "text-[#7c3aed]", badge: "Beta" },
    ],
  },
  {
    label: "PRACTICE",
    items: [
      { to: "/sat/select", label: "Practise tests", icon: LuFileText, iconColor: "text-[#94a3b8]" },
      { to: "/practice", label: "Exam questions", icon: LuZap, iconColor: "text-[#e07a5f]" },
      { to: "/join", label: "Mock with key", icon: LuKeyRound, iconColor: "text-[#94a3b8]" },
    ],
  },
  {
    label: "LEARN",
    items: [
      { to: "/vocabulary", label: "Vocabulary", icon: LuBookOpen, iconColor: "text-[#2a9d8f]" },
      { to: "/desmos", label: "Desmos darslari", icon: LuCalculator, iconColor: "text-[#16a34a]" },
      { to: "/study-room", label: "Study Room", icon: LuVideo, iconColor: "text-[#db2777]", badge: "Beta" },
    ],
  },
  {
    label: "PROGRESS",
    items: [
      { to: "/sat/history", label: "Mock Scores", icon: LuTrendingUp, iconColor: "text-[#0096c7]" },
      { to: "/leaderboard", label: "Leaderboard", icon: LuTrophy, iconColor: "text-[#e76f51]" },
    ],
  },
];



const ADMIN_ITEMS = [
  { to: "/admin", label: "Testlar (admin)", icon: LuShieldCheck, end: true, iconColor: "text-[#087fd1]", perm: "sessions" },
  { to: "/admin/sets", label: "To'plamlar (admin)", icon: LuLibrary, perm: "sets" },
  { to: "/admin/desmos", label: "Desmos (admin)", icon: LuCalculator, perm: "desmos" },
  { to: "/admin/analytics", label: "Analitika (admin)", icon: LuChartColumn, perm: ["analytics", "users"] },
];


function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  const base = `group relative w-full flex items-center gap-3 h-10 rounded-xl text-[14px] font-medium ${
    collapsed ? "justify-center px-0" : "px-3"
  }`;

  if (item.soon) {
    return (
      <div
        title={collapsed ? `${item.label} — tez orada` : undefined}
        className={`${base} text-[#12213D]/30 cursor-not-allowed`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-[10px] font-bold text-[#12213D]/40 bg-[#12213D]/[0.05] px-1.5 py-0.5 rounded-md">
              Soon
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `${base} transition ${
          isActive
            ? "bg-[#12213D] text-white shadow-[0_6px_16px_-8px_rgba(18,33,61,0.6)]"
            : "text-[#12213D]/60 hover:bg-[#12213D]/[0.05] hover:text-[#12213D]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative shrink-0">
            <Icon size={18} className={isActive ? "text-white" : item.iconColor || ""} />
            {collapsed && item.badge && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#7c3aed] ring-2 ring-white" />
            )}
          </span>
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-white/15 text-white" : "bg-[#7c3aed]/10 text-[#7c3aed]"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onOpenMobile, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { isAdmin, can } = useIsAdmin();
  const adminItems = ADMIN_ITEMS.filter((item) => can(item.perm));
  const navigate = useNavigate();
  const navGroups = NAV;

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  // Mobil drawer yopilganda darhol yo'qolmaydi — chiqish animatsiyasi
  // tugagach (onAnimationEnd) DOM'dan olib tashlanadi.
  const [drawerMounted, setDrawerMounted] = useState(mobileOpen);
  if (mobileOpen && !drawerMounted) setDrawerMounted(true);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const renderContent = (isCollapsed) => (
    <div className="flex h-full w-full flex-col">
      {/* Brend */}
      <div className={`flex h-16 shrink-0 items-center ${isCollapsed ? "justify-center" : "px-5"}`}>
        <NavLink to="/dashboard" onClick={onCloseMobile} className={`flex items-center ${isCollapsed ? "h-8 w-8" : "h-7"}`}>
          <img
            src={isCollapsed ? LogoMark : logo}
            alt="Prepzone"
            className="h-full w-auto object-contain"
          />
        </NavLink>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-2 [scrollbar-width:none]">
        {navGroups.map((group) => (
          <div key={group.label}>
            {isCollapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-[#12213D]/10" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#12213D]/35">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} collapsed={isCollapsed} onNavigate={onCloseMobile} />
              ))}
            </div>
          </div>
        ))}

        {isAdmin && adminItems.length > 0 && (
          <div>
            {isCollapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-[#12213D]/10" />
            ) : (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#12213D]/35">
                ADMIN
              </p>
            )}
            <div className="space-y-1">
              {adminItems.map((item) => (
                <NavItem key={item.to} item={item} collapsed={isCollapsed} onNavigate={onCloseMobile} />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Foydalanuvchi */}
      <div className="shrink-0 p-3">
        <div
          className={`flex items-center gap-2.5 rounded-2xl bg-[#F6F7FB] p-2 ${
            isCollapsed ? "flex-col" : ""
          }`}
        >
          <Avatar user={user} name={displayName} className="h-9 w-9 rounded-xl bg-[#12213D] text-[12px]" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-[#12213D]">{displayName}</p>
              <p className="truncate text-[11px] text-[#12213D]/45">{user?.email}</p>
            </div>
          )}
          <div className={`flex ${isCollapsed ? "flex-col" : ""} gap-0.5`}>
            <NavLink
              to="/account"
              onClick={onCloseMobile}
              title="Sozlamalar"
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  isActive ? "bg-white text-[#087fd1] shadow-sm" : "text-[#12213D]/50 hover:bg-white hover:text-[#12213D]"
                }`
              }
            >
              <LuSettings size={16} />
            </NavLink>
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#12213D]/50 transition hover:bg-white hover:text-red-600"
            >
              <LuLogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: sahifadan ajralib turuvchi "suzuvchi" panel */}
      <aside
        className={`fixed bottom-3 left-3 top-3 z-40 hidden rounded-[22px] border border-[#12213D]/[0.07] bg-white shadow-[0_1px_2px_rgba(18,33,61,0.04),0_12px_32px_-16px_rgba(18,33,61,0.18)] transition-[width] duration-300 ease-in-out-strong lg:flex ${
          collapsed ? "w-[72px]" : "w-[248px]"
        }`}
      >
        {renderContent(collapsed)}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Sidebarni yoyish" : "Sidebarni yig'ish"}
          className="absolute -right-3 top-[76px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-[#12213D]/12 bg-white text-[#12213D]/50 shadow-sm transition hover:border-[#087fd1]/40 hover:text-[#087fd1]"
        >
          {collapsed ? <LuChevronsRight size={13} /> : <LuChevronsLeft size={13} />}
        </button>
      </aside>

      {/* Mobil: yuqori panel */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-[#12213D]/[0.07] bg-white/85 px-4 backdrop-blur lg:hidden">
        <button
          onClick={onOpenMobile}
          aria-label="Menyuni ochish"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#12213D] hover:bg-[#12213D]/5"
        >
          <LuMenu size={19} />
        </button>
        <img src={logo} alt="Prepzone" className="h-6 w-auto object-contain" />
      </header>

      {/* Mobil drawer */}
      {drawerMounted && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className={`absolute inset-0 bg-[#12213D]/40 ${mobileOpen ? "pz-overlay-in" : "pz-overlay-out"}`}
            onClick={onCloseMobile}
          />
          <aside
            className={`relative h-full w-[280px] max-w-[82%] bg-white shadow-xl ${
              mobileOpen ? "pz-drawer-in" : "pz-drawer-out"
            }`}
            onAnimationEnd={() => !mobileOpen && setDrawerMounted(false)}
          >
            <button
              onClick={onCloseMobile}
              aria-label="Menyuni yopish"
              className="absolute right-3 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-[#12213D]/60 hover:bg-[#12213D]/5"
            >
              <LuX size={18} />
            </button>
            {renderContent(false)}
          </aside>
        </div>
      )}
    </>
  );
}
