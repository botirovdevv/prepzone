import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { LuPlus, LuChevronRight, LuShieldCheck, LuCalendarX } from "react-icons/lu";
import { Page, PageHeader, Card, Button, Badge, EmptyState, ErrorState, Skeleton } from "../../components/ui";

function formatDateTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sessionStatusLabel(session) {
  if (session.status === "closed") return { text: "Yakunlangan", tone: "ink" };
  if (session.accessType === "open") return { text: "Doimiy ochiq", tone: "emerald" };
  const scheduled = new Date(session.scheduledAt);
  if (scheduled > new Date()) return { text: "Hali boshlanmagan", tone: "amber" };
  return { text: "Faol", tone: "emerald" };
}

export default function AdminDashboard() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Barcha mock testlar (tayyor + sessiyalar) — talabalar ko'radigan
  // tartibda, bir xil ko'rinishda. Har biri bir xil tahlil sahifasiga olib boradi.
  useEffect(() => {
    let cancelled = false;
    setError(false);
    api
      .get("/admin/tests")
      .then((list) => !cancelled && setTests(list))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <Page>
      <PageHeader
        eyebrow="Admin panel"
        icon={LuShieldCheck}
        title="Mock testlar"
        subtitle="Barcha mock testlar: natijalar, savollar tahlili va boshqaruv bir joyda."
        actions={
          <>
            {!loading && !error && <Badge tone="blue">{tests.length} ta test</Badge>}
            <Button to="/admin/sessions/new">
              <LuPlus size={17} /> Yangi test
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[76px]" />
          <Skeleton className="h-[76px]" />
          <Skeleton className="h-[76px]" />
        </div>
      ) : error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : tests.length === 0 ? (
        <EmptyState
          icon={LuCalendarX}
          title="Hali birorta test yo'q"
          text="Birinchi testni yarating — talabalar unga kod yoki doimiy ochiq havola orqali kiradi."
          action={
            <Button to="/admin/sessions/new">
              <LuPlus size={17} /> Yangi test
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid divide-y divide-ink/[0.06]">
            {tests.map((t, i) => {
              const badge = sessionStatusLabel(t);
              return (
                <Link
                  key={t.id}
                  to={`/admin/tests/${t.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-canvas sm:px-6"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 font-display text-[16px] font-bold text-accent tabular-nums"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-ink">{t.title}</p>
                      <Badge tone={badge.tone}>{badge.text}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-ink/50 tabular-nums">
                      {t.questions} savol · {t.attempts} urinish · {t.users} talaba
                      {t.avgTotal != null && ` · o'rtacha ${t.avgTotal}`}
                      {t.accessType !== "open" && t.scheduledAt && ` · ${formatDateTime(t.scheduledAt)}`}
                    </p>
                  </div>
                  <span className="hidden rounded-lg bg-canvas px-2.5 py-1.5 font-mono text-sm font-bold tracking-wider text-ink/70 sm:inline">
                    {t.accessType === "open" ? "OPEN" : t.code || "······"}
                  </span>
                  <LuChevronRight
                    size={18}
                    className="shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </Page>
  );
}
