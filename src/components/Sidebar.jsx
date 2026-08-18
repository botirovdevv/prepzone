import { NavLink, useNavigate } from "react-router-dom";
import {
  LuFileText,
  LuHistory,
  LuLibrary,
  LuBookA,
  LuTrophy,
  LuSettings,
  LuLogOut,
  LuChevronsLeft,
  LuChevronsRight,
  LuMenu,
  LuX,
  LuMapPin,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import logo from '../../public/Logo.png'

const NAV_GROUPS = [
  {
    label: "ASOSIY",
    items: [
      { to: "/sat/select", label: "Testlar", icon: LuFileText },
      { to: "/sat/history", label: "Mening natijalarim", icon: LuHistory },
    ],
  },
  {
    label: "TEZ ORADA",
    items: [
      { label: "Savollar banki", icon: LuLibrary, soon: true },
      { label: "Lug'at (Vocabulary)", icon: LuBookA, soon: true },
      { label: "Reyting", icon: LuTrophy, soon: true },
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
  const navigate = useNavigate();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Foydalanuvchi";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-2 h-16 px-4 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <NavLink to="/" className="flex items-center gap-2 h-45 w-35">
          <img
            src={logo}
            alt="Prepzone"
            className={collapsed ? "h-full w-full object-contain object-left" : "h-6 w-auto"}
          />
        </NavLink>
      </div>

      {!collapsed && (
        <div className="px-4 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0076FC] bg-[#0076FC]/8 px-2.5 py-1 rounded-full">
            <LuMapPin size={12} />
            SAT prep
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-[#0F1C30]/35">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                if (item.soon) {
                  return (
                    <div
                      key={item.label}
                      title={collapsed ? `${item.label} — tez orada` : undefined}
                      className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-[#0F1C30]/30 cursor-not-allowed ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          <span className="text-[9px] font-bold bg-[#0F1C30]/6 px-1.5 py-0.5 rounded-full shrink-0">
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
                      `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition ${
                        collapsed ? "justify-center" : ""
                      } ${
                        isActive
                          ? "bg-[#0076FC]/10 text-[#0076FC]"
                          : "text-[#0F1C30]/65 hover:bg-[#0F1C30]/5 hover:text-[#0F1C30]"
                      }`
                    }
                  >
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: settings, profile, logout */}
      <div className="px-3 pb-3 pt-2 border-t border-[#0F1C30]/8 space-y-0.5 shrink-0">
        <NavLink
          to="/account"
          onClick={onCloseMobile}
          title={collapsed ? "Sozlamalar" : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-[#0076FC]/10 text-[#0076FC]"
                : "text-[#0F1C30]/65 hover:bg-[#0F1C30]/5 hover:text-[#0F1C30]"
            }`
          }
        >
          <LuSettings size={17} className="shrink-0" />
          {!collapsed && <span className="truncate">Sozlamalar</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          title={collapsed ? "Chiqish" : undefined}
          className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-[#0F1C30]/65 hover:bg-red-50 hover:text-red-600 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LuLogOut size={17} className="shrink-0" />
          {!collapsed && <span className="truncate">Chiqish</span>}
        </button>

        <div
          className={`flex items-center gap-2.5 mt-2 px-2 py-2 rounded-lg bg-[#0F1C30]/[0.03] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#0F1C30] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials(displayName)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0F1C30] truncate">{displayName}</p>
              <p className="text-[10px] text-[#0F1C30]/40 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Collapse toggle — faqat desktop'da */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex w-full items-center gap-2 px-2.5 py-2 mt-1 rounded-lg text-xs font-medium text-[#0F1C30]/45 hover:bg-[#0F1C30]/5 hover:text-[#0F1C30]/70 transition justify-center"
        >
          {collapsed ? <LuChevronsRight size={16} /> : <LuChevronsLeft size={16} />}
          {!collapsed && "Yig'ish"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-[#0F1C30]/8 z-40 transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        {content}
      </aside>

      {/* Mobile: hamburger button (fixed top-left) */}
      <button
        onClick={onOpenMobile}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-white shadow-md border border-[#0F1C30]/10 flex items-center justify-center text-[#0F1C30]"
      >
        <LuMenu size={18} />
      </button>

      {/* Mobile: drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="relative w-72 max-w-[80%] bg-white h-full shadow-xl">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#0F1C30]/60 hover:bg-[#0F1C30]/5"
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
