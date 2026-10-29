import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
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
import UserAdminActions from "../../components/admin/UserAdminActions";
import OnlineNow from "../../components/admin/OnlineNow";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { dayKey, routeLabel } from "../../utils/analytics";

const USER_FILTERS = [
  ["", "Hammasi"],
  ["admins", "Adminlar"],
  ["blocked", "Bloklanganlar"],
];

const SOURCE_LABELS = { instagram: "Instagram", telegram: "Telegram", friends: "Do'stlari", other: "Boshqa" };

// Onboarding maqsadi: "SAT 1400".
function formatTargets(t) {
  return t?.sat != null ? `SAT ${t.sat}` : "—";
}

const RANGES = [7, 30, 90];

function toDate(ts) {
  return ts ? new Date(ts) : null;
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
  // Sahifaga "analytics" yoki "users" ruxsati bilan kiriladi; statistika faqat birinchisi bilan.
  const { can } = useIsAdmin();
  const canAnalytics = can("analytics");
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(canAnalytics);
  const [errors, setErrors] = useState([]);
  const [stats, setStats] = useState({});
  const [days, setDays] = useState({});
  const [chartMetric, setChartMetric] = useState("views");
  const [sources, setSources] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Foydalanuvchilar jadvali — sahifalab (oxirgi faollik bo'yicha) yoki email bo'yicha qidiruv.
  const [users, setUsers] = useState([]);
  const [usersHasMore, setUsersHasMore] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    if (!canAnalytics) return;
    setLoading(true);
    try {
      const data = await api.get(`/admin/analytics?range=${range}`);
      setStats(data.stats);
      setSources(data.sources.map(([source, count]) => [source, count]).filter(([s]) => SOURCE_LABELS[s]));
      setDays(data.days);
      setErrors([]);
    } catch (err) {
      console.error(err);
      setErrors([err.message || "analytics"]);
    } finally {
      setLoading(false);
    }
  }, [range, canAnalytics]);

  useEffect(() => {
    load();
  }, [load, reloadKey]);

  // Foydalanuvchilar (eng yaxshi ball va testlar soni bilan) — server sahifalab beradi.
  const loadUsers = useCallback(async (offset = 0, term = "", only = "") => {
    setUsersLoading(true);
    try {
      const qs = new URLSearchParams({ offset: String(offset) });
      if (term) qs.set("search", term);
      if (only) qs.set("filter", only);
      const { items, hasMore } = await api.get(`/admin/users?${qs}`);
      setUsers((prev) => (offset ? [...prev, ...items] : items));
      setUsersHasMore(hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Qidiruv: email boshlanishi bo'yicha (kichik harflarda), 400 ms kechikish bilan.
  useEffect(() => {
    const term = search.trim().toLowerCase();
    const t = setTimeout(() => loadUsers(0, term, filter), term ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, filter, loadUsers, reloadKey]);

  const updateUser = (updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

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
        title={canAnalytics ? "Sayt analitikasi" : "Foydalanuvchilar"}
        subtitle={
          canAnalytics
            ? "Foydalanuvchilar, faollik va eng ko'p ishlatiladigan sahifalar."
            : "Userlarni qidirish va bloklash."
        }
        actions={
          <>
            {canAnalytics && (
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
            )}
            <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} disabled={loading}>
              <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Yangilash
            </Button>
          </>
        }
      />

      {canAnalytics && <OnlineNow />}

      {errors.length > 0 && (
        <Card className="mb-6 flex items-start gap-3 border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-800">
          <LuTriangleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Ba'zi ma'lumotlarni o'qib bo'lmadi: {errors.join(", ")}
            </p>
            <p className="mt-1 text-amber-800/80">
              Sahifani yangilang. Muammo takrorlansa, server loglarini tekshiring.
            </p>
          </div>
        </Card>
      )}

      {!canAnalytics ? null : loading ? (
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
        </>
      )}

      <Card className={`overflow-hidden ${canAnalytics ? "mt-6" : ""}`}>
        <CardHeader
          title="Foydalanuvchilar"
          subtitle={
            search.trim() || filter || !canAnalytics
              ? `${users.length}${usersHasMore ? "+" : ""} ta · oxirgi faollik bo'yicha`
              : `${stats.totalUsers ?? users.length} ta · oxirgi faollik bo'yicha`
          }
          action={
            <div className="flex w-full flex-wrap items-center justify-end gap-2">
              <div className="flex rounded-lg bg-[#12213D]/[0.05] p-0.5 text-[12px] font-semibold">
                {USER_FILTERS.map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`rounded-md px-2.5 py-1 transition ${
                      filter === k ? "bg-white text-[#12213D] shadow-sm" : "text-[#12213D]/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
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
                      best={u.bestScore}
                      pages={userPages}
                      onUpdated={updateUser}
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
                  onClick={() => loadUsers(users.length, search.trim().toLowerCase(), filter)}
                >
                  {usersLoading ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </Page>
  );
}

function UserRow({ user, open, onToggle, best, pages, onUpdated }) {
  const name = user.displayName || user.email?.split("@")[0] || "—";
  const tests = user.tests;
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer transition hover:bg-[#F6F7FB]">
        <td className="px-5 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[#12213D]">{name}</p>
            {user.provider === "google.com" && <Badge tone="ink">Google</Badge>}
            {!user.emailVerified && <Badge tone="amber">tasdiqlanmagan</Badge>}
            {user.isOwner ? <Badge tone="blue">Owner</Badge> : user.isAdmin && <Badge tone="blue">Admin</Badge>}
            {user.blocked && <Badge tone="red">Bloklangan</Badge>}
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
        <td className="px-3 py-3 text-right tabular-nums text-[#12213D]">{tests ?? "—"}</td>
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
            <UserAdminActions key={`${user.id}:${user.adminPerms?.join()}:${user.blocked}`} user={user} onUpdated={onUpdated} />
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
