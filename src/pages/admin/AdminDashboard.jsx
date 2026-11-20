import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import {
  LuPlus,
  LuCalendarClock,
  LuChevronRight,
  LuShieldCheck,
  LuGlobe,
  LuCalendarX,
  LuNotebookPen,
} from "react-icons/lu";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, Skeleton, SectionTitle } from "../../components/ui";

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
  const [sessions, setSessions] = useState([]);
  const [builtin, setBuiltin] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin uchun server barcha sessiyalarni kirish kodi bilan qaytaradi;
  // tayyor (repo'dagi) testlar alohida endpoint'dan — statistikasi bilan.
  useEffect(() => {
    Promise.all([
      api.get("/sessions").catch(() => []),
      api.get("/admin/builtin-tests").catch(() => []),
    ])
      .then(([s, b]) => {
        setSessions(s);
        setBuiltin(b);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = sessions.length + builtin.length;

  return (
    <Page>
      <PageHeader
        eyebrow="Admin panel"
        icon={LuShieldCheck}
        title="Mock testlar"
        subtitle="Tayyor testlar natijalarini kuzating, vaqti belgilangan va doimiy ochiq testlarni yarating."
        actions={
          <>
            {!loading && <Badge tone="blue">{total} ta test</Badge>}
            <Button to="/admin/sessions/new">
              <LuPlus size={17} /> Yangi test
            </Button>
          </>
        }
      />

      {!loading && builtin.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Tayyor testlar</SectionTitle>
          <Card className="overflow-hidden">
            <div className="grid divide-y divide-ink/[0.06]">
              {builtin.map((b) => (
                <Link
                  key={b.id}
                  to={`/admin/tests/${b.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-canvas sm:px-6"
                >
                  <IconTile icon={LuNotebookPen} tone="blue" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-ink">{b.title}</p>
                      <Badge tone="blue">Tayyor test</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-ink/50 tabular-nums">
                      {b.questions} savol · {b.attempts} urinish · {b.users} talaba
                      {b.avgTotal != null && ` · o'rtacha ${b.avgTotal}`}
                    </p>
                  </div>
                  <span className="hidden rounded-lg bg-canvas px-2.5 py-1.5 font-mono text-sm font-bold tracking-wider text-ink/70 sm:inline">
                    {b.id}
                  </span>
                  <LuChevronRight
                    size={18}
                    className="shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-accent"
                  />
                </Link>
              ))}
            </div>
          </Card>
        </section>
      )}

      {!loading && <SectionTitle>Sessiyalar</SectionTitle>}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[76px]" />
          <Skeleton className="h-[76px]" />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={LuCalendarX}
          title="Hali birorta test tashkil qilinmagan"
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
            {sessions.map((s) => {
              const badge = sessionStatusLabel(s);
              return (
                <Link
                  key={s.id}
                  to={`/admin/sessions/${s.id}/monitor`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-canvas sm:px-6"
                >
                  <IconTile icon={s.accessType === "open" ? LuGlobe : LuCalendarClock} tone="blue" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-ink">{s.title}</p>
                      <Badge tone={badge.tone}>{badge.text}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-ink/50">
                      {s.accessType === "open" ? "Kod talab qilinmaydi" : formatDateTime(s.scheduledAt)}
                    </p>
                  </div>
                  <span className="hidden rounded-lg bg-canvas px-2.5 py-1.5 font-mono text-sm font-bold tracking-wider text-ink/70 sm:inline">
                    {s.accessType === "open" ? "OPEN" : s.code || "······"}
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
