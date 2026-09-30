import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  documentId,
  endAt,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  startAt,
  where,
} from "firebase/firestore";
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
import { countUserResults } from "../../utils/userResults";

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

const USERS_PAGE = 50;

const countOf = (q) =>
  getCountFromServer(q)
    .then((s) => s.data().count)
    .catch((err) => {
      console.error(err);
      return null;
    });

// O'tgan kunlar uchun yig'ma: analyticsDaily/{kun} = { date, views, pages, active }.
// Bir marta hisoblanadi (shard'lar + visitor soni), keyin faqat shu hujjat
// o'qiladi — har ochilishda 90 kunlik barcha shard'larni o'qimaslik uchun.
async function loadDays(keys) {
  const today = dayKey();
  const past = keys.filter((k) => k !== today);
  const dailySnap = await getDocs(
    query(collection(db, "analyticsDaily"), where("date", ">=", keys[0]), where("date", "<=", keys.at(-1)))
  );
  const byDay = Object.fromEntries(dailySnap.docs.map((d) => [d.id, d.data()]));

  const aggregate = async (k) => {
    const [shards, legacy, visitors] = await Promise.all([
      getDocs(query(collection(db, "analyticsShards"), where("date", "==", k))),
      getDocs(query(collection(db, "analytics"), where("date", "==", k))),
      countOf(query(collection(db, "analyticsVisitors"), where("date", "==", k))),
    ]);
    const day = { date: k, views: 0, pages: {}, active: visitors || 0 };
    for (const d of [...shards.docs, ...legacy.docs]) {
      const x = d.data();
      day.views += x.views || 0;
      for (const [p, c] of Object.entries(x.pages || {})) day.pages[p] = (day.pages[p] || 0) + c;
      if (x.activeUsers) day.active = Math.max(day.active, x.activeUsers.length);
    }
    return day;
  };

  // Yig'masi yo'q o'tgan kunlar — hisoblab, saqlab qo'yamiz.
  const missing = past.filter((k) => !byDay[k]);
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = await Promise.all(missing.slice(i, i + 10).map(aggregate));
    await Promise.all(
      chunk.map((day) => {
        byDay[day.date] = day;
        return setDoc(doc(db, "analyticsDaily", day.date), day).catch((err) => console.error(err));
      })
    );
  }
  if (keys.includes(today)) byDay[today] = await aggregate(today);
  return byDay;
}

export default function Analytics() {
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({});
  const [days, setDays] = useState({});
  const [chartMetric, setChartMetric] = useState("views");
  const [sources, setSources] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Foydalanuvchilar jadvali — sahifalab (oxirgi faollik bo'yicha) yoki email bo'yicha qidiruv.
  const [users, setUsers] = useState([]);
  const [usersCursor, setUsersCursor] = useState(null);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [bestScores, setBestScores] = useState({});
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const errs = [];
    const keys = lastDays(range);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const todayStart = new Date(start);
    start.setDate(start.getDate() - (range - 1));

    const usersCol = collection(db, "users");
    const [totalUsers, newUsers, activeInRange, activeToday, satTests, ieltsTests, ...sourceCounts] = await Promise.all([
      countOf(usersCol),
      countOf(query(usersCol, where("createdAt", ">=", start))),
      countOf(query(usersCol, where("lastSeenAt", ">=", start))),
      countOf(query(usersCol, where("lastSeenAt", ">=", todayStart))),
      countOf(query(collection(db, "results"), where("createdAt", ">=", start))),
      countOf(query(collection(db, "ieltsResults"), where("createdAt", ">=", start))),
      ...Object.keys(SOURCE_LABELS).map((s) => countOf(query(usersCol, where("onboarding.source", "==", s)))),
    ]);
    if (totalUsers == null) errs.push("users");
    if (satTests == null) errs.push("results");
    if (ieltsTests == null) errs.push("ieltsResults");
    setStats({
      totalUsers,
      newUsers,
      activeInRange,
      activeToday,
      testsInRange: (satTests || 0) + (ieltsTests || 0),
    });
    setSources(
      Object.keys(SOURCE_LABELS)
        .map((s, i) => [s, sourceCounts[i] || 0])
        .filter(([, c]) => c > 0)
        .sort((a, b) => b[1] - a[1])
    );
    try {
      setDays(await loadDays(keys));
    } catch (err) {
      console.error(err);
      errs.push("analyticsShards");
    }
    setErrors(errs);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  // Ko'rsatilayotgan userlarning eng yaxshi SAT ballari (leaderboard'dan, 30 tadan).
  const loadBestScores = async (list) => {
    const ids = list.map((u) => u.id);
    const found = {};
    for (let i = 0; i < ids.length; i += 30) {
      const snap = await getDocs(
        query(collection(db, "leaderboard"), where(documentId(), "in", ids.slice(i, i + 30)))
      ).catch(() => null);
      snap?.docs.forEach((d) => (found[d.id] = d.data().bestScore));
    }
    setBestScores((prev) => ({ ...prev, ...found }));
  };

  const loadUsers = useCallback(async (after = null, term = "") => {
    setUsersLoading(true);
    try {
      const q = term
        ? query(
            collection(db, "users"),
            orderBy("email"),
            startAt(term),
            endAt(`${term}`),
            limit(USERS_PAGE)
          )
        : query(
            collection(db, "users"),
            orderBy("lastSeenAt", "desc"),
            ...(after ? [startAfter(after)] : []),
            limit(USERS_PAGE)
          );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers((prev) => (after ? [...prev, ...list] : list));
      setUsersCursor(snap.docs.at(-1) || null);
      setUsersHasMore(!term && snap.docs.length === USERS_PAGE);
      loadBestScores(list);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Qidiruv: email boshlanishi bo'yicha (kichik harflarda), 400 ms kechikish bilan.
  useEffect(() => {
    const term = search.trim().toLowerCase();
    const t = setTimeout(() => loadUsers(null, term), term ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, loadUsers, reloadKey]);

  const data = useMemo(() => {
    const keys = lastDays(range);
    const series = keys.map((k) => ({ key: k, views: days[k]?.views || 0, active: days[k]?.active || 0 }));
    const pages = {};
    let views = 0;
    for (const k of keys) {
      const d = days[k];
      if (!d) continue;
      views += d.views || 0;
      for (const [p, c] of Object.entries(d.pages || {})) pages[p] = (pages[p] || 0) + c;
    }
    return {
      series,
      views,
      pages: sortedPages(pages),
      activeToday: Math.max(stats.activeToday || 0, days[dayKey()]?.active || 0),
    };
  }, [days, range, stats]);

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
            <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} disabled={loading}>
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
            <StatTile icon={LuUsers} label="Jami userlar" value={stats.totalUsers?.toLocaleString() ?? "—"} />
            <StatTile icon={LuActivity} tone="emerald" label="Bugun faol" value={data.activeToday} />
            <StatTile
              icon={LuActivity}
              tone="ink"
              label={`Faol userlar (${range} kun)`}
              value={stats.activeInRange ?? "—"}
            />
            <StatTile
              icon={LuEye}
              tone="blue"
              label={`Sahifa ko'rishlar (${range} kun)`}
              value={data.views.toLocaleString()}
            />
            <StatTile icon={LuUserPlus} tone="amber" label={`Yangi userlar (${range} kun)`} value={stats.newUsers ?? "—"} />
            <StatTile
              icon={LuFileCheck}
              tone="red"
              label={`Yakunlangan testlar (${range} kun)`}
              value={stats.testsInRange}
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
              subtitle={search.trim() ? `${users.length} ta topildi · email bo'yicha` : `${stats.totalUsers ?? users.length} ta · oxirgi faollik bo'yicha`}
              action={
                <div className="relative w-full max-w-[240px]">
                  <LuSearch
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#12213D]/35"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Email bo'yicha qidirish"
                    className={`${inputClass} h-9 pl-9 text-[13px]`}
                  />
                </div>
              }
            />
            {users.length === 0 && !usersLoading ? (
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
                    {users.map((u) => {
                      const open = expanded === u.id;
                      const userPages = sortedPages(u.pages);
                      return (
                        <UserRow
                          key={u.id}
                          user={u}
                          open={open}
                          onToggle={() => setExpanded(open ? null : u.id)}
                          best={bestScores[u.id]}
                          pages={userPages}
                        />
                      );
                    })}
                  </tbody>
                </table>
                {(usersHasMore || usersLoading) && (
                  <div className="border-t border-[#12213D]/[0.06] p-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersLoading}
                      onClick={() => loadUsers(usersCursor)}
                    >
                      {usersLoading ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </Page>
  );
}

function UserRow({ user, open, onToggle, best, pages }) {
  const name = user.displayName || user.email?.split("@")[0] || "—";
  const [tests, setTests] = useState(null);
  useEffect(() => {
    if (!open || tests != null) return;
    Promise.all([countUserResults("results", user.id), countUserResults("ieltsResults", user.id)])
      .then(([a, b]) => setTests(a + b))
      .catch(() => setTests("—"));
  }, [open, tests, user.id]);
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
        <td className="px-3 py-3 text-right tabular-nums text-[#12213D]">{tests ?? (open ? "…" : "·")}</td>
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
