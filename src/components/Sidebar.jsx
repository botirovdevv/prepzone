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
  LuSun,
  LuNotebookPen,
} from "react-icons/lu";
import Avatar from "./Avatar";
import ThemeToggle, { ThemeCycleButton } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { LanguageSwitch, useI18n } from "../i18n";
const logo = "/Logo.png";
const LogoMark = "/Logo-sm.png";

const NAV = [
  {
    label: "main",
    items: [
      { to: "/dashboard", label: "today", icon: LuHouse, iconColor: "text-accent" },
      { to: "/daily", label: "daily", icon: LuSun, iconColor: "text-[#f59e0b]" },
      { to: "/study-plan", label: "studyPlan", icon: LuCompass, iconColor: "text-purple", badge: "beta" },
    ],
  },
  {
    label: "practice",
    items: [
      { to: "/sat/select", label: "practiceTests", icon: LuFileText, iconColor: "text-ink-3" },
      { to: "/practice", label: "examQuestions", icon: LuZap, iconColor: "text-orange-500" },
      { to: "/mistakes", label: "mistakes", icon: LuNotebookPen, iconColor: "text-danger" },
      { to: "/join", label: "mockWithKey", icon: LuKeyRound, iconColor: "text-ink-3" },
    ],
  },
  {
    label: "learn",
    items: [
      { to: "/vocabulary", label: "vocabulary", icon: LuBookOpen, iconColor: "text-success" },
      // Desmos hali ulanmagan — "Soon" bilan o'chiq turadi.
      { to: "/desmos", label: "desmos", icon: LuCalculator, iconColor: "text-success", soon: true },
      { to: "/study-room", label: "studyRoom", icon: LuVideo, iconColor: "text-[#db2777]", badge: "beta" },
    ],
  },
  {
    label: "progress",
    items: [
      { to: "/sat/history", label: "mockScores", icon: LuTrendingUp, iconColor: "text-accent" },
      { to: "/leaderboard", label: "leaderboard", icon: LuTrophy, iconColor: "text-amber-500" },
    ],
  },
];



const ADMIN_ITEMS = [
  { to: "/admin", label: "Testlar (admin)", icon: LuShieldCheck, end: true, iconColor: "text-accent", perm: "sessions", admin: true },
  { to: "/admin/sets", label: "To'plamlar (admin)", icon: LuLibrary, perm: "sets", admin: true },
  { to: "/admin/desmos", label: "Desmos (admin)", icon: LuCalculator, perm: "desmos", admin: true },
  { to: "/admin/analytics", label: "Analitika (admin)", icon: LuChartColumn, perm: ["analytics", "users"], admin: true },
];


function NavItem({ item, collapsed, onNavigate }) {
  const { t } = useI18n();
  const Icon = item.icon;
  // Admin bo'limlari tarjima qilinmaydi (label o'zi matn).
  const label = item.admin ? item.label : t(`nav.${item.label}`);
  const badge = item.badge ? t(`common.${item.badge}`) : null;
  const base = `group relative w-full flex items-center gap-3 h-9 rounded-[10px] text-[14px] font-medium ${
    collapsed ? "justify-center px-0" : "px-3"
  }`;

  if (item.soon) {
    return (
      <div
        title={collapsed ? t("nav.soonTitle", { label }) : undefined}
        aria-disabled="true"
        className={`${base} text-ink/30 cursor-not-allowed`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
              {t("common.soon")}
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
      title={collapsed ? label : undefined}
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
          <span className="relative shrink-0">
            <Icon size={18} className={isActive ? "text-accent" : item.iconColor || ""} />
            {collapsed && badge && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#7c3aed] ring-2 ring-white" />
            )}
          </span>
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {!collapsed && badge && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isActive ? "bg-white/15 text-accent" : "bg-[#7c3aed]/10 text-[#7c3aed]"
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onOpenMobile, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { isAdmin, can } = useIsAdmin();
  const adminItems = ADMIN_ITEMS.filter((item) => can(item.perm));
  const navigate = useNavigate();
  const navGroups = NAV;

  const displayName = user?.displayName || user?.email?.split("@")[0] || t("nav.userFallback");

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
              <p className="mb-1 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                {t(`nav.groups.${group.label}`)}
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
              <p className="mb-1 px-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                {t("nav.groups.admin")}
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
        {!isCollapsed && (
          <div className="flex justify-center">
            <LanguageSwitch />
          </div>
        )}
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
              title={t("nav.settings")}
              aria-label={t("nav.settings")}
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
              title={t("nav.logout")}
              aria-label={t("nav.logout")}
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
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="absolute -right-3 top-[76px] z-50 flex h-6 w-6 items-center justify-center rounded-full border border-ink/12 bg-surface text-ink/50 shadow-sm transition hover:border-accent/40 hover:text-accent"
        >
          {collapsed ? <LuChevronsRight size={13} /> : <LuChevronsLeft size={13} />}
        </button>
      </aside>

      {/* Mobil: yuqori panel */}
      <header className="pz-material fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-ink/[0.08] px-4 lg:hidden">
        <button
          onClick={onOpenMobile}
          aria-label={t("nav.openMenu")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink hover:bg-ink/5"
        >
          <LuMenu size={19} />
        </button>
        <img src={logo} alt="Prepzone" className="pz-logo h-6 w-auto object-contain" />
        <LanguageSwitch className="ml-auto" />
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
              aria-label={t("nav.closeMenu")}
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
