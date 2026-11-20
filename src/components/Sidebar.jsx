// Kompyuter uchun HIG sidebar: chap tomonda to'liq balandlikdagi shaffof panel.
// Pastida faqat hisob qatori — mavzu, til va chiqish Sozlamalar sahifasida.
// Telefonda sidebar yo'q: o'rniga pastki TabBar + "Yana" sahifasi.
import { NavLink } from "react-router-dom";
import { LuChevronRight, LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
import Avatar from "./Avatar";
import { NAV, ADMIN_ITEMS } from "./navConfig";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useI18n } from "../i18n";

const logo = "/Logo.png";
const LogoMark = "/Logo-sm.png";

export const SIDEBAR_W = { open: 260, collapsed: 76 };

function NavItem({ item, collapsed }) {
  const { t } = useI18n();
  const Icon = item.icon;
  const label = item.admin ? item.label : t(`nav.${item.label}`);
  const badge = item.badge ? t(`common.${item.badge}`) : null;
  const base = `group relative flex h-9 w-full items-center gap-3 rounded-[10px] text-[15px] tracking-[-0.01em] ${
    collapsed ? "justify-center px-0" : "px-2.5"
  }`;

  if (item.soon) {
    return (
      <div
        title={collapsed ? t("nav.soonTitle", { label }) : undefined}
        aria-disabled="true"
        className={`${base} cursor-not-allowed text-ink-3`}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            <span className="text-[11px] font-medium text-ink-3">{t("common.soon")}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `${base} transition-colors ${
          isActive ? "bg-accent/[0.12] font-medium text-accent" : "text-ink hover:bg-ink/[0.05]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative shrink-0">
            <Icon size={18} className={isActive ? "text-accent" : "text-ink-2"} />
            {collapsed && badge && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-surface" />
            )}
          </span>
          {!collapsed && <span className="flex-1 truncate">{label}</span>}
          {!collapsed && badge && (
            <span className="rounded-full bg-ink/[0.06] px-1.5 py-px text-[11px] font-medium text-ink-2">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function Group({ title, collapsed, children }) {
  return (
    <div>
      {collapsed ? (
        <div className="mx-auto mb-2 h-px w-6 bg-ink/10" />
      ) : (
        <p className="mb-1 px-2.5 text-[13px] font-semibold text-ink-3">{title}</p>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const { isAdmin, can } = useIsAdmin();
  const adminItems = ADMIN_ITEMS.filter((item) => can(item.perm));
  const displayName = user?.displayName || user?.email?.split("@")[0] || t("nav.userFallback");

  return (
    <aside
      style={{ width: collapsed ? SIDEBAR_W.collapsed : SIDEBAR_W.open }}
      className="pz-material fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-ink/[0.08] transition-[width] duration-300 ease-in-out-strong lg:flex"
    >
      {/* Brend + yig'ish tugmasi */}
      <div className={`flex h-[60px] shrink-0 items-center ${collapsed ? "justify-center" : "justify-between pl-5 pr-3"}`}>
        {!collapsed && (
          <NavLink to="/dashboard" className="flex h-7 items-center">
            <img src={logo} alt="Prepzone" className="pz-logo h-full w-auto object-contain" />
          </NavLink>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? t("nav.expand") : t("nav.collapse")}
          aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          {collapsed ? <LuPanelLeftOpen size={18} /> : <LuPanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigatsiya */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 pt-1 [scrollbar-width:none]">
        {NAV.map((group) => (
          <Group key={group.label} title={t(`nav.groups.${group.label}`)} collapsed={collapsed}>
            {group.items.map((item) => (
              <NavItem key={item.label} item={item} collapsed={collapsed} />
            ))}
          </Group>
        ))}
        {isAdmin && adminItems.length > 0 && (
          <Group title={t("nav.groups.admin")} collapsed={collapsed}>
            {adminItems.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </Group>
        )}
      </nav>

      {/* Hisob — bitta qator, Sozlamalar sahifasiga olib boradi */}
      <div className="shrink-0 border-t border-ink/[0.08] p-3">
        <NavLink
          to="/account"
          title={collapsed ? t("nav.settings") : undefined}
          aria-label={t("nav.accountLabel", { name: displayName })}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl p-2 transition-colors ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "bg-accent/[0.12]" : "hover:bg-ink/[0.05]"}`
          }
        >
          <Avatar user={user} name={displayName} className="h-9 w-9 shrink-0 rounded-full bg-ink-3 text-[13px]" />
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{displayName}</span>
                <span className="block truncate text-[12px] text-ink-2">{t("nav.accountHint")}</span>
              </span>
              <LuChevronRight size={16} className="shrink-0 text-ink-3" />
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
