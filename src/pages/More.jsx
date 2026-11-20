// "Yana" — telefondagi 5-tab: tab bar'ga sig'magan barcha bo'limlar, hisob va admin.
// iOS Settings uslubidagi guruhlangan ro'yxat.
import { Link, Navigate } from "react-router-dom";
import { LuChevronRight } from "react-icons/lu";
import Avatar from "../components/Avatar";
import { MORE_GROUPS, ADMIN_ITEMS } from "../components/navConfig";
import { ListGroup, ListRow, Page, PageHeader, SectionTitle } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useI18n } from "../i18n";

export default function More() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { isAdmin, can } = useIsAdmin();
  const adminItems = ADMIN_ITEMS.filter((i) => can(i.perm));
  const name = user?.displayName || user?.email?.split("@")[0] || t("nav.userFallback");

  // Kompyuterda hamma bo'lim sidebar'da — bu sahifa kerak emas.
  if (typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)").matches) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Page width="narrow">
      <PageHeader title={t("nav.more.title")} />

      {/* iOS Settings'dagi "Apple ID" qatori kabi */}
      <ListGroup className="mb-8">
        <Link to="/account" className="flex items-center gap-4 p-4 transition-colors hover:bg-ink/[0.03] active:bg-ink/[0.06]">
          <Avatar user={user} name={name} className="h-14 w-14 shrink-0 rounded-full bg-ink-3 text-lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[20px] font-semibold leading-[25px] text-ink">{name}</span>
            <span className="block truncate text-[13px] text-ink-2">{t("nav.accountHint")}</span>
          </span>
          <LuChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
        </Link>
      </ListGroup>

      <div className="space-y-8">
        {MORE_GROUPS.map((group) => (
          <section key={group.label}>
            <SectionTitle>{t(`nav.groups.${group.label}`)}</SectionTitle>
            <ListGroup>
              {group.items.map((item) => (
                <ListRow
                  key={item.to}
                  to={item.soon ? undefined : item.to}
                  icon={item.icon}
                  iconTone={item.soon ? "gray" : item.tone}
                  title={t(`nav.${item.label}`)}
                  disabled={item.soon}
                  value={item.soon ? t("common.soon") : item.badge ? t(`common.${item.badge}`) : null}
                />
              ))}
            </ListGroup>
          </section>
        ))}

        {isAdmin && adminItems.length > 0 && (
          <section>
            <SectionTitle>{t("nav.groups.admin")}</SectionTitle>
            <ListGroup>
              {adminItems.map((item) => (
                <ListRow key={item.to} to={item.to} icon={item.icon} iconTone={item.tone} title={item.label} />
              ))}
            </ListGroup>
          </section>
        )}
      </div>
    </Page>
  );
}
