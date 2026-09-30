import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { getSessionCode, migrateLegacyCodes } from "../../utils/sessionCode";
import { LuPlus, LuCalendarClock, LuChevronRight, LuShieldCheck, LuGlobe, LuCalendarX } from "react-icons/lu";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, Skeleton } from "../../components/ui";

function formatDateTime(ts) {
  if (!ts) return "-";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
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
  const scheduled = session.scheduledAt?.toDate
    ? session.scheduledAt.toDate()
    : new Date(session.scheduledAt);
  if (scheduled > new Date()) return { text: "Hali boshlanmagan", tone: "amber" };
  return { text: "Faol", tone: "emerald" };
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "testSessions"), orderBy("scheduledAt", "desc"), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  // Kirish kodlari himoyalangan joyda (secure/admin) — alohida o'qiladi.
  // Eski formatdagi sessiyalar shu yerda bir martalik ko'chiriladi.
  const [codes, setCodes] = useState({});
  useEffect(() => {
    if (!sessions.length) return;
    let cancelled = false;
    migrateLegacyCodes(sessions)
      .then(() =>
        Promise.all(
          sessions
            .filter((s) => s.accessType !== "open")
            .map((s) => getSessionCode(s.id, s.code).then((c) => [s.id, c]).catch(() => [s.id, null]))
        )
      )
      .then((pairs) => !cancelled && setCodes(Object.fromEntries(pairs)));
    return () => {
      cancelled = true;
    };
  }, [sessions]);

  return (
    <Page>
      <PageHeader
        eyebrow="Admin panel"
        icon={LuShieldCheck}
        title="Mock testlar"
        subtitle="Vaqti belgilangan va doimiy ochiq testlarni yarating, kuzating va boshqaring."
        actions={
          <Button to="/admin/sessions/new">
            <LuPlus size={17} /> Yangi test
          </Button>
        }
      />

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
          <div className="grid divide-y divide-[#12213D]/[0.06]">
            {sessions.map((s) => {
              const badge = sessionStatusLabel(s);
              return (
                <Link
                  key={s.id}
                  to={`/admin/sessions/${s.id}/monitor`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
                >
                  <IconTile icon={s.accessType === "open" ? LuGlobe : LuCalendarClock} tone="blue" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-[#12213D]">{s.title}</p>
                      <Badge tone={badge.tone}>{badge.text}</Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-[#12213D]/50">
                      {s.accessType === "open" ? "Kod talab qilinmaydi" : formatDateTime(s.scheduledAt)}
                    </p>
                  </div>
                  <span className="hidden rounded-lg bg-[#F6F7FB] px-2.5 py-1.5 font-mono text-sm font-bold tracking-wider text-[#12213D]/70 sm:inline">
                    {s.accessType === "open" ? "OPEN" : codes[s.id] || "······"}
                  </span>
                  <LuChevronRight
                    size={18}
                    className="shrink-0 text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]"
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
