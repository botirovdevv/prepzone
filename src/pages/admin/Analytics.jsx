import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getCountFromServer, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  LuChartColumn,
  LuUsers,
  LuActivity,
  LuEye,
  LuUserPlus,
  LuFileCheck,
  LuRefreshCw,
  LuSearch,
  LuTriangleAlert,
  LuChevronDown,
} from "react-icons/lu";
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  StatTile,
  Badge,
  Button,
  Skeleton,
  EmptyState,
  ScoreTrend,
  inputClass,
} from "../../components/ui";
import { dayKey, routeLabel } from "../../utils/analytics";

const SOURCE_LABELS = { instagram: "Instagram", telegram: "Telegram", friends: "Do'stlari", other: "Boshqa" };

// Onboarding maqsadlari: "SAT 1400 · IELTS 8".
function formatTargets(t) {
  if (!t) return "—";
  const parts = [];
  if (t.sat != null) parts.push(`SAT ${t.sat}`);
  if (t.ielts != null) parts.push(`IELTS ${t.ielts}`);
  return parts.join(" · ") || "—";
}

const RANGES = [7, 30, 90];

function toDate(ts) {
  if (!ts) return null;
  return ts.toDate ? ts.toDate() : new Date(ts);
}

function formatDate(ts, withTime = false) {
  const d = toDate(ts);
  if (!d) return "—";
  return d.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function relativeTime(ts) {
  const d = toDate(ts);
  if (!d) return "—";
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "hozirgina";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  return formatDate(d);
}

// Oxirgi `n` kunning kalitlari, eskidan yangiga.
function lastDays(n) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    out.push(dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - i)));
  }
  return out;
}

function sortedPages(pages = {}) {
  return Object.entries(pages)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
}

function PageBars({ entries, total, label = routeLabel }) {
  return (
    <div className="space-y-3">
      {entries.map(([key, count]) => {
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate font-semibold text-[#12213D]">{label(key)}</span>
              <span className="shrink-0 tabular-nums text-[#12213D]/55">
                {count.toLocaleString()} · {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#12213D]/[0.06]">
              <div className="h-full rounded-full bg-[#087fd1]" style={{ width: `${Math.max(pct, 1)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [users, setUsers] = useState([]);
  const [days, setDays] = useState([]);
  const [results, setResults] = useState([]);
  const [bestScores, setBestScores] = useState({});
  const [chartMetric, setChartMetric] = useState("views");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [activeCounts, setActiveCounts] = useState({});
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const startKey = lastDays(90)[0]; // eng katta davr — bir marta yuklab, keyin filtrlaymiz
    const [u, a, r, l, ir, sh] = await Promise.allSettled([
      getDocs(collection(db, "users")),
      // Eski format (bitta kunlik hujjat) — o'tish davridagi ma'lumotlar uchun.
      getDocs(query(collection(db, "analytics"), where("date", ">=", startKey), orderBy("date"))),
      getDocs(collection(db, "results")),
      getDocs(collection(db, "leaderboard")),
      getDocs(collection(db, "ieltsResults")),
      getDocs(query(collection(db, "analyticsShards"), where("date", ">=", startKey))),
    ]);
    const errs = [];
    if (u.status === "fulfilled") setUsers(u.value.docs.map((d) => ({ id: d.id, ...d.data() })));
    else errs.push("users");
    // Kun bo'yicha yig'ish: eski hujjatlar + yangi shardlar.
    const byDay = {};
    const add = (d) => {
      const day = (byDay[d.date] ||= { date: d.date, views: 0, pages: {}, legacyActive: 0 });
      day.views += d.views || 0;
      for (const [p, c] of Object.entries(d.pages || {})) day.pages[p] = (day.pages[p] || 0) + c;
      if (d.activeUsers) day.legacyActive = d.activeUsers.length;
    };
    if (a.status === "fulfilled") a.value.docs.forEach((d) => add(d.data()));
    if (sh.status === "fulfilled") sh.value.docs.forEach((d) => add(d.data()));
    else errs.push("analyticsShards");
    setDays(Object.values(byDay));
    // SAT va IELTS natijalari birga sanaladi (testlar soni uchun).
    const toRow = (d) => ({ uid: d.data().uid, createdAt: d.data().createdAt });
    if (r.status === "fulfilled" || ir.status === "fulfilled")
      setResults([
        ...(r.status === "fulfilled" ? r.value.docs.map(toRow) : []),
        ...(ir.status === "fulfilled" ? ir.value.docs.map(toRow) : []),
      ]);
    if (r.status !== "fulfilled") errs.push("results");
    if (ir.status !== "fulfilled") errs.push("ieltsResults");
    if (l.status === "fulfilled")
      setBestScores(Object.fromEntries(l.value.docs.map((d) => [d.id, d.data().bestScore])));
    else errs.push("leaderboard");
    [u, a, r, l, ir, sh].forEach((x) => x.status === "rejected" && console.error(x.reason));
    setErrors(errs);
    setLoading(false);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Kunlik faol userlar — har kun uchun serverda sanash (hujjatlarni yuklamasdan).
  useEffect(() => {
    let cancelled = false;
    const keys = lastDays(range);
    Promise.all(
      keys.map((k) =>
        getCountFromServer(query(collection(db, "analyticsVisitors"), where("date", "==", k)))
          .then((s) => [k, s.data().count])
          .catch(() => [k, 0])
      )
    ).then((pairs) => !cancelled && setActiveCounts(Object.fromEntries(pairs)));
    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const data = useMemo(() => {
    const keys = lastDays(range);
    const byDay = Object.fromEntries(days.map((d) => [d.date, d]));
    const activeOn = (k) => Math.max(activeCounts[k] || 0, byDay[k]?.legacyActive || 0);
    const series = keys.map((k) => ({
      key: k,
      views: byDay[k]?.views || 0,
      active: activeOn(k),
    }));

    const pages = {};
    let views = 0;
    for (const k of keys) {
      const d = byDay[k];
      if (!d) continue;
      views += d.views || 0;
      for (const [p, c] of Object.entries(d.pages || {})) pages[p] = (pages[p] || 0) + c;
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayStart = new Date(start);
    start.setDate(start.getDate() - (range - 1));

    const newUsers = users.filter((x) => (toDate(x.createdAt) || 0) >= start).length;
    const testsInRange = results.filter((x) => (toDate(x.createdAt) || 0) >= start).length;
    // Davrda faol = oxirgi faolligi davr boshidan keyin bo'lgan userlar.
    const activeInRange = users.filter((x) => (toDate(x.lastSeenAt) || 0) >= start).length;
    const activeToday = Math.max(
      activeOn(dayKey()),
      users.filter((x) => (toDate(x.lastSeenAt) || 0) >= todayStart).length
    );

    return {
      series,
      views,
      activeInRange,
      activeToday,
      pages: sortedPages(pages),
      newUsers,
      testsInRange,
    };
  }, [days, users, results, range, activeCounts]);

  const testsByUser = useMemo(() => {
    const m = {};
    for (const r of results) if (r.uid) m[r.uid] = (m[r.uid] || 0) + 1;
    return m;
  }, [results]);

  const userRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter(
        (u) =>
          !q ||
          (u.displayName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
      )
      .sort((a, b) => (toDate(b.lastSeenAt)?.getTime() || 0) - (toDate(a.lastSeenAt)?.getTime() || 0));
  }, [users, search]);

  // "Bizni qayerdan topdingiz?" javoblari taqsimoti.
  const sources = useMemo(() => {
    const m = {};
    for (const u of users) {
      const s = u.onboarding?.source;
      if (s) m[s] = (m[s] || 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [users]);
  const sourcesTotal = sources.reduce((n, [, c]) => n + c, 0);

  const chartValues = data.series.map((s) => ({
    label: s.key,
    value: chartMetric === "views" ? s.views : s.active,
  }));
  const chartMax = Math.max(5, ...chartValues.map((s) => s.value));

  return (
    <Page>
      <PageHeader
        eyebrow="Admin panel"
        icon={LuChartColumn}
        title="Sayt analitikasi"
        subtitle="Foydalanuvchilar, faollik va eng ko'p ishlatiladigan sahifalar."
        actions={
          <>
            <div className="flex rounded-xl border border-[#12213D]/10 bg-white p-1">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`h-8 rounded-lg px-3 text-[13px] font-semibold transition ${
                    range === r ? "bg-[#12213D] text-white" : "text-[#12213D]/55 hover:text-[#12213D]"
                  }`}
                >
                  {r} kun
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yangilash
            </Button>
          </>
        }
      />

      {errors.length > 0 && (
        <Card className="mb-6 flex items-start gap-3 border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-800">
          <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Ba'zi ma'lumotlarni o'qib bo'lmadi: {errors.join(", ")}
            </p>
            <p className="mt-1 text-amber-800/80">
              Firebase Console → Firestore → Rules'da admin uchun o'qish ruxsati berilganini tekshiring
              (users, analytics, results, leaderboard kolleksiyalari).
            </p>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[92px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile icon={LuUsers} label="Jami userlar" value={users.length.toLocaleString()} />
            <StatTile icon={LuActivity} tone="emerald" label="Bugun faol" value={data.activeToday} />
            <StatTile
              icon={LuActivity}
              tone="ink"
              label={`Faol userlar (${range} kun)`}
              value={data.activeInRange}
            />
            <StatTile
              icon={LuEye}
              tone="blue"
              label={`Sahifa ko'rishlar (${range} kun)`}
              value={data.views.toLocaleString()}
            />
            <StatTile icon={LuUserPlus} tone="amber" label={`Yangi userlar (${range} kun)`} value={data.newUsers} />
            <StatTile
              icon={LuFileCheck}
              tone="red"
              label={`Yakunlangan testlar (${range} kun)`}
              value={data.testsInRange}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Kunlik faollik"
                subtitle={`${data.series[0]?.key} — ${data.series.at(-1)?.key}`}
                action={
                  <div className="flex rounded-lg bg-[#12213D]/[0.05] p-0.5 text-[12px] font-semibold">
                    {[
                      ["views", "Ko'rishlar"],
                      ["active", "Faol userlar"],
                    ].map(([k, label]) => (
                      <button
                        key={k}
                        onClick={() => setChartMetric(k)}
                        className={`rounded-md px-2.5 py-1 transition ${
                          chartMetric === k ? "bg-white text-[#12213D] shadow-sm" : "text-[#12213D]/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              />
              <div className="px-3 pb-4 pt-2 sm:px-4">
                <ScoreTrend scores={chartValues} min={0} max={chartMax} height={200} />
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Eng ko'p ishlatiladigan sahifalar" subtitle={`Oxirgi ${range} kun`} />
              <div className="px-5 pb-6 pt-4 sm:px-6">
                {data.pages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#12213D]/45">Hali ma'lumot yo'q</p>
                ) : (
                  <PageBars entries={data.pages.slice(0, 10)} total={data.views} />
                )}
              </div>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader title="Bizni qayerdan topishdi" subtitle={`${sourcesTotal} ta javob · ro'yxatdan o'tishdagi so'rovnoma`} />
            <div className="px-5 pb-6 pt-4 sm:px-6">
              {sourcesTotal === 0 ? (
                <p className="py-4 text-center text-sm text-[#12213D]/45">Hali javob yo'q</p>
              ) : (
                <PageBars entries={sources} total={sourcesTotal} label={(k) => SOURCE_LABELS[k] || k} />
              )}
            </div>
          </Card>

          <Card className="mt-6 overflow-hidden">
            <CardHeader
              title="Foydalanuvchilar"
              subtitle={`${userRows.length} ta · oxirgi faollik bo'yicha`}
              action={
                <div className="relative w-full max-w-[240px]">
                  <LuSearch
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#12213D]/35"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ism yoki email"
                    className={`${inputClass} h-9 pl-9 text-[13px]`}
                  />
                </div>
              }
            />
            {userRows.length === 0 ? (
              <div className="p-5 sm:p-6">
                <EmptyState
                  icon={LuUsers}
                  title="Userlar topilmadi"
                  text="Userlar saytga kirganlaridan so'ng shu yerda paydo bo'ladi."
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[13px]">
                  <thead>
                    <tr className="border-y border-[#12213D]/[0.06] bg-[#F6F7FB] text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">
                      <th className="px-5 py-2.5 sm:px-6">User</th>
                      <th className="px-3 py-2.5">Ro'yxatdan o'tgan</th>
                      <th className="px-3 py-2.5">Oxirgi faollik</th>
                      <th className="px-3 py-2.5 text-right">Ko'rishlar</th>
                      <th className="px-3 py-2.5 text-right">Testlar</th>
                      <th className="px-3 py-2.5 text-right">Eng yaxshi ball</th>
                      <th className="px-3 py-2.5">Maqsad / manba</th>
                      <th className="w-10 px-3 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#12213D]/[0.06]">
                    {userRows.map((u) => {
                      const open = expanded === u.id;
                      const userPages = sortedPages(u.pages);
                      return (
                        <UserRow
                          key={u.id}
                          user={u}
                          open={open}
                          onToggle={() => setExpanded(open ? null : u.id)}
                          tests={testsByUser[u.id] || 0}
                          best={bestScores[u.id]}
                          pages={userPages}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}

function UserRow({ user, open, onToggle, tests, best, pages }) {
  const name = user.displayName || user.email?.split("@")[0] || "—";
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer transition hover:bg-[#F6F7FB]">
        <td className="px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#12213D]">{name}</p>
            {user.provider === "google.com" && <Badge tone="ink">Google</Badge>}
            {!user.emailVerified && <Badge tone="amber">tasdiqlanmagan</Badge>}
          </div>
          <p className="text-[12px] text-[#12213D]/45">{user.email}</p>
        </td>
        <td className="px-3 py-3 text-[#12213D]/70">{formatDate(user.createdAt)}</td>
        <td className="px-3 py-3 text-[#12213D]/70" title={formatDate(user.lastSeenAt, true)}>
          {relativeTime(user.lastSeenAt)}
        </td>
        <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#12213D]">
          {(user.pageViews || 0).toLocaleString()}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-[#12213D]">{tests}</td>
        <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#087fd1]">{best ?? "—"}</td>
        <td className="px-3 py-3">
          <p className="font-semibold text-[#12213D]">{formatTargets(user.onboarding?.targets)}</p>
          {user.onboarding?.source && (
            <p className="text-[12px] text-[#12213D]/45">
              {SOURCE_LABELS[user.onboarding.source] || user.onboarding.source}
              {user.onboarding.sourceOther ? `: ${user.onboarding.sourceOther}` : ""}
            </p>
          )}
        </td>
        <td className="px-3 py-3 text-[#12213D]/35">
          <LuChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
        </td>
      </tr>
      {open && (
        <tr className="bg-[#F6F7FB]/60">
          <td colSpan={8} className="px-5 py-4 sm:px-6">
            {pages.length === 0 ? (
              <p className="text-[13px] text-[#12213D]/45">Bu user uchun sahifa statistikasi hali yo'q.</p>
            ) : (
              <div className="max-w-xl">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-[#12213D]/45">
                  Eng ko'p kirgan sahifalari
                </p>
                <PageBars entries={pages.slice(0, 8)} total={user.pageViews || 0} />
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
