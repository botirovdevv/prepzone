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
} from "react-icons/lu";
import Avatar from "./Avatar";
import ThemeToggle, { ThemeCycleButton } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
const logo = "/Logo.png";
const LogoMark = "/Logo-sm.png";

const NAV = [
  {
    label: "MAIN",
    items: [
      { to: "/dashboard", label: "Today", icon: LuHouse, iconColor: "text-accent" },
      { to: "/study-plan", label: "Study Plan", icon: LuCompass, iconColor: "text-purple" },
    ],
  },
  {
    label: "PRACTICE",
    items: [
      { to: "/sat/select", label: "Practise tests", icon: LuFileText, iconColor: "text-ink-3" },
      { to: "/practice", label: "Exam questions", icon: LuZap, iconColor: "text-orange-500" },
      { to: "/join", label: "Mock with key", icon: LuKeyRound, iconColor: "text-ink-3" },
    ],
  },
  {
    label: "LEARN",
    items: [
      { to: "/vocabulary", label: "Vocabulary", icon: LuBookOpen, iconColor: "text-success" },
      { to: "/desmos", label: "Desmos darslari", icon: LuCalculator, iconColor: "text-success" },
    ],
  },
  {
    label: "PROGRESS",
    items: [
      { to: "/sat/history", label: "Mock Scores", icon: LuTrendingUp, iconColor: "text-accent" },
      { to: "/leaderboard", label: "Leaderboard", icon: LuTrophy, iconColor: "text-amber-500" },
    ],
  },
];



const ADMIN_ITEMS = [
  { to: "/admin", label: "Testlar (admin)", icon: LuShieldCheck, end: true, iconColor: "text-accent", perm: "sessions" },
  { to: "/admin/sets", label: "To'plamlar (admin)", icon: LuLibrary, perm: "sets" },
  { to: "/admin/desmos", label: "Desmos (admin)", icon: LuCalculator, perm: "desmos" },
  { to: "/admin/analytics", label: "Analitika (admin)", icon: LuChartColumn, perm: ["analytics", "users"] },
];


function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon;
  const base = `group relative w-full flex items-center gap-3 h-9 rounded-[10px] text-[14px] font-medium tracking-[-0.01em] ${
    collapsed ? "justify-center px-0" : "px-3"
  }`;

  if (item.soon) {
    return (
      <div
        title={collapsed ? `${item.label} — tez orada` : undefined}
        className={`${base} text-ink/30 cursor-not-allowed`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            <span className="text-[10px] font-bold text-ink/40 bg-ink/[0.05] px-1.5 py-0.5 rounded-md">
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
            ? "bg-accent/[0.12] text-accent"
            : "text-ink/75 hover:bg-ink/[0.05] hover:text-ink"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={`shrink-0 ${isActive ? "text-accent" : item.iconColor || ""}`} />
          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
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
            className="pz-logo h-full w-auto object-contain"
          />
        </NavLink>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-2 [scrollbar-width:none]">
        {navGroups.map((group) => (
          <div key={group.label}>
            {isCollapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-ink/10" />
            ) : (
              <p className="mb-1 px-3 text-[12px] font-semibold text-ink/40">
                {group.label.charAt(0) + group.label.slice(1).toLowerCase()}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} collapsed={isCollapsed} onNavigate={onCloseMobile} />
              ))}
            </div>
          </div>
        ))}

        {isAdmin && adminItems.length > 0 && (
          <div>
            {isCollapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-ink/10" />
            ) : (
              <p className="mb-1 px-3 text-[12px] font-semibold text-ink/40">
                Admin
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
      <div className="shrink-0 space-y-2 p-3">
        <div className={`flex ${isCollapsed ? "justify-center" : "px-1"}`}>
          {isCollapsed ? <ThemeCycleButton className="h-8 w-8 rounded-lg" /> : <ThemeToggle compact className="!w-full" />}
        </div>
        <div
          className={`flex items-center gap-2.5 rounded-2xl bg-ink/[0.04] p-2 ${
            isCollapsed ? "flex-col" : ""
          }`}
        >
          <Avatar user={user} name={displayName} className="h-9 w-9 rounded-xl bg-night text-[12px]" />
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{displayName}</p>
              <p className="truncate text-[11px] text-ink-2">{user?.email}</p>
            </div>
          )}
          <div className={`flex ${isCollapsed ? "flex-col" : ""} gap-0.5`}>
            <NavLink
              to="/account"
              onClick={onCloseMobile}
              title="Sozlamalar"
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  isActive ? "bg-surface text-accent shadow-sm" : "text-ink/50 hover:bg-surface hover:text-ink"
                }`
              }
            >
              <LuSettings size={16} />
            </NavLink>
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/50 transition hover:bg-surface hover:text-danger"
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
        className={`pz-material-surface fixed bottom-3 left-3 top-3 z-40 hidden rounded-[22px] border border-ink/[0.06] shadow-lift transition-[width] duration-300 ease-in-out-strong lg:flex ${
          collapsed ? "w-[72px]" : "w-[248px]"
        }`}
      >
        {renderContent(collapsed)}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Sidebarni yoyish" : "Sidebarni yig'ish"}
          className="absolute -right-3 top-[76px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-ink/12 bg-surface text-ink/50 shadow-sm transition hover:border-accent/40 hover:text-accent"
        >
          {collapsed ? <LuChevronsRight size={13} /> : <LuChevronsLeft size={13} />}
        </button>
      </aside>

      {/* Mobil: yuqori panel */}
      <header className="pz-material fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-ink/[0.08] px-4 lg:hidden">
        <button
          onClick={onOpenMobile}
          aria-label="Menyuni ochish"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5"
        >
          <LuMenu size={19} />
        </button>
        <img src={logo} alt="Prepzone" className="pz-logo h-6 w-auto object-contain" />
      </header>

      {/* Mobil drawer */}
      {drawerMounted && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className={`absolute inset-0 bg-black/40 ${mobileOpen ? "pz-overlay-in" : "pz-overlay-out"}`}
            onClick={onCloseMobile}
          />
          <aside
            className={`relative h-full w-[280px] max-w-[82%] bg-elevated shadow-xl ${
              mobileOpen ? "pz-drawer-in" : "pz-drawer-out"
            }`}
            onAnimationEnd={() => !mobileOpen && setDrawerMounted(false)}
          >
            <button
              onClick={onCloseMobile}
              aria-label="Menyuni yopish"
              className="absolute right-3 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-ink/60 hover:bg-ink/5"
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
