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
  LuMapPin,
  LuShieldCheck,
  LuLibrary,
  LuKeyRound,
  LuCalculator,
} from "react-icons/lu";
import { AiFillHome } from "react-icons/ai";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import logo from "../../public/Logo.png";
import LogoMark from "../../public/Logo-sm.png";

const NAV_GROUPS = [
  {
    label: "MAIN",
    items: [
      { to: "/dashboard", label: "Today", icon: AiFillHome, badge: "Route", badgeType: "route", iconColor: "text-[#0096c7]" },
      { label: "Study Plan", icon: LuCompass, soon: true, badge: "Soon", badgeType: "soon", iconColor: "text-[#0096c7]" },
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
      { to: "/desmos", label: "Desmos tutorials", icon: LuCalculator, iconColor: "text-[#0096c7]" },
      { label: "Vocabulary", icon: LuBookOpen, soon: true, badge: "Soon", badgeType: "soon", iconColor: "text-[#0096c7]" },
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

function initials(nameOrEmail) {
  const base = nameOrEmail || "?";
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onOpenMobile, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const content = (
    <div className="flex flex-col h-full w-full">
      {/* Brand */}
      <div className={`flex items-center h-16 px-4 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <NavLink to="/dashboard" className={`flex items-center ${collapsed ? "h-9 w-9" : "h-8"}`}>
          {collapsed ? (
            <img src={LogoMark} alt="Prepzone" className="h-full w-auto object-contain" />
          ) : (
            <img src={logo} alt="Prepzone" className="h-full w-auto object-contain" />
          )}
        </NavLink>
      </div>

      {/* Badge / Pill section */}
      {!collapsed && (
        <div className="px-4 mb-3 shrink-0">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#12213D] bg-[#F1F1ED] px-3.5 py-1.5 rounded-full">
            <LuMapPin size={14} className="text-[#0096c7] fill-[#0096c7] stroke-white" />
            <span>
              <strong className="font-extrabold text-[#12213D]">DSAT</strong> prep
            </span>
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-4 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="w-full">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold tracking-wider text-[#12213D]/35">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5 w-full">
              {group.items.map((item) => {
                const Icon = item.icon;
                if (item.soon) {
                  return (
                    <div
                      key={item.label}
                      title={collapsed ? `${item.label} — tez orada` : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#12213D]/30 cursor-not-allowed ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <Icon size={18} className={`shrink-0 ${item.iconColor || ""}`} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          <span className="text-[9px] font-bold bg-[#12213D]/6 px-1.5 py-0.5 rounded-full shrink-0">
                            Soon
                          </span>
                        </>
                      )}
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        collapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-[#087fd1]/10 text-[#087fd1]"
                          : "text-[#12213D]/65 hover:bg-[#12213D]/5 hover:text-[#12213D]"
                      }`
                    }
                  >
                    <Icon size={18} className={`shrink-0 ${item.iconColor || ""}`} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {isAdmin && (
          <div className="w-full">
            <p className="px-3 mb-1 text-[10px] font-bold tracking-wider text-[#12213D]/35">
              {collapsed ? "" : "ADMIN"}
            </p>
            <div className="space-y-0.5 w-full">
              <NavLink
                to="/admin"
                end
                onClick={onCloseMobile}
                title={collapsed ? "Testlar" : undefined}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#087fd1]/10 text-[#087fd1]"
                      : "text-[#12213D]/65 hover:bg-[#12213D]/5 hover:text-[#12213D]"
                  }`
                }
              >
                <LuShieldCheck size={18} className="shrink-0 text-[#087fd1]" />
                {!collapsed && <span className="flex-1 truncate">Testlar (admin)</span>}
              </NavLink>
              <NavLink
                to="/admin/sets"
                onClick={onCloseMobile}
                title={collapsed ? "Amaliyot to'plamlari" : undefined}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#087fd1]/10 text-[#087fd1]"
                      : "text-[#12213D]/65 hover:bg-[#12213D]/5 hover:text-[#12213D]"
                  }`
                }
              >
                <LuLibrary size={18} className="shrink-0 text-[#12213D]/65" />
                {!collapsed && <span className="flex-1 truncate">To'plamlar (admin)</span>}
              </NavLink>
              <NavLink
                to="/admin/desmos"
                onClick={onCloseMobile}
                title={collapsed ? "Desmos darsliklari" : undefined}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    collapsed ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-[#087fd1]/10 text-[#087fd1]"
                      : "text-[#12213D]/65 hover:bg-[#12213D]/5 hover:text-[#12213D]"
                  }`
                }
              >
                <LuCalculator size={18} className="shrink-0 text-[#12213D]/65" />
                {!collapsed && <span className="flex-1 truncate">Desmos (admin)</span>}
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Footer Section */}
      <div className="px-2 pb-3 pt-2 border-t border-[#12213D]/8 space-y-0.5 shrink-0 w-full">
        <NavLink
          to="/account"
          onClick={onCloseMobile}
          title={collapsed ? "Sozlamalar" : undefined}
          className={({ isActive }) =>
            `w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-[#087fd1]/10 text-[#087fd1]"
                : "text-[#12213D]/65 hover:bg-[#12213D]/5 hover:text-[#12213D]"
            }`
          }
        >
          <LuSettings size={18} className="shrink-0 text-[#12213D]/65" />
          {!collapsed && <span className="flex-1 truncate">Sozlamalar</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={collapsed ? "Chiqish" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[#12213D]/65 hover:bg-red-50 hover:text-red-600 transition-all ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LuLogOut size={18} className="shrink-0 text-[#12213D]/65" />
          {!collapsed && <span className="flex-1 text-left truncate">Chiqish</span>}
        </button>

        <div
          className={`w-full flex items-center gap-2.5 mt-2 px-2.5 py-2 rounded-xl bg-[#12213D]/[0.03] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#12213D] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials(displayName)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#12213D] truncate">{displayName}</p>
              <p className="text-[10px] text-[#12213D]/40 truncate">{user?.email}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-[#12213D]/8 z-40 transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {content}

        {/* Yig'ish/yoyish tugmasi — sidebar chekkasida, o'rtada suzib turadi */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Sidebarni yoyish" : "Sidebarni yig'ish"}
          className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#12213D]/12 shadow-sm items-center justify-center text-[#12213D]/50 hover:text-[#087fd1] hover:border-[#087fd1]/30 hover:shadow-md transition-all z-50"
        >
          {collapsed ? <LuChevronsRight size={13} /> : <LuChevronsLeft size={13} />}
        </button>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={onOpenMobile}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-white shadow-md border border-[#12213D]/10 flex items-center justify-center text-[#12213D]"
      >
        <LuMenu size={18} />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="relative w-72 max-w-[80%] bg-white h-full shadow-xl">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#12213D]/60 hover:bg-[#12213D]/5"
            >
              <LuX size={18} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}