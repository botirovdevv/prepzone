import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LuTrophy, LuCrown, LuMedal } from "react-icons/lu";
import Avatar from "../components/Avatar";
import { Page, PageHeader, Card, Button, EmptyState, ErrorState, Skeleton, SegmentedControl } from "../components/ui";
import { useI18n } from "../i18n";

// Podium tartibi: 2-o'rin, 1-o'rin, 3-o'rin (o'rtadagisi eng baland).
const PODIUM = [
  { index: 1, height: "h-24", ring: "ring-ink/15", avatar: "bg-ink-3" },
  { index: 0, height: "h-32", ring: "ring-amber-400", avatar: "bg-accent" },
  { index: 2, height: "h-20", ring: "ring-ink/10", avatar: "bg-ink-3/70" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // "score" — eng yuqori mock ball, "xp" — faollik (kun savollari, streak).
  const [tab, setTab] = useState("score");

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    const req =
      tab === "xp"
        ? api.get("/learn/xp-leaderboard").then((list) =>
            list.slice(0, 15).map((r) => ({ ...r, id: r.uid, bestScore: `${r.xp} XP${r.streak ? ` · 🔥${r.streak}` : ""}` }))
          )
        : api.get("/leaderboard?limit=15");
    req
      .then(setRows)
      .catch(() => {
        setRows([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [reloadKey, tab]);

  const myRank = rows.findIndex((r) => r.uid === user?.uid);
  const rest = rows.slice(3);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("leaderboard.eyebrow")}
        icon={LuTrophy}
        title={t("leaderboard.title")}
        subtitle={tab === "xp" ? t("streak.xpBoardSub") : t("leaderboard.subtitle")}
      />

      <SegmentedControl
        className="mb-6"
        options={[
          { value: "score", label: t("streak.tabScore") },
          { value: "xp", label: t("streak.tabXp") },
        ]}
        value={tab}
        onChange={setTab}
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : loadError ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={LuTrophy}
          title={t("leaderboard.emptyTitle")}
          text={t("leaderboard.emptyText")}
          action={<Button to="/sat/select">{t("leaderboard.startTest")}</Button>}
        />
      ) : (
        <>
          {/* Podium */}
          <Card className="mb-6 px-4 pb-0 pt-8 sm:px-8">
            <div className="grid grid-cols-3 items-end gap-3 sm:gap-6">
              {PODIUM.map(({ index, height, ring, avatar }) => {
                const r = rows[index];
                if (!r) return <div key={index} />;
                const isMe = r.uid === user?.uid;
                return (
                  <div key={r.id} className="flex flex-col items-center text-center">
                    {index === 0 && <LuCrown size={22} className="mb-1.5 text-amber-500" />}
                    <Avatar
                      name={r.name}
                      src={r.avatarUrl}
                      className={`h-14 w-14 rounded-2xl text-sm ring-4 ring-offset-2 ${avatar} ${ring}`}
                    />
                    <p className="mt-3 w-full truncate text-sm font-semibold text-ink">
                      {r.name}
                      {isMe && <span className="text-accent">{t("leaderboard.you")}</span>}
                    </p>
                    <p className="font-display text-xl font-bold tabular-nums text-ink">{r.bestScore}</p>
                    <div
                      className={`mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 ${height} ${
                        index === 0 ? "bg-accent text-white" : "bg-canvas text-ink/50"
                      }`}
                    >
                      <span className="font-display text-2xl font-bold">{index + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {rest.length > 0 && (
            <Card className="overflow-hidden">
              <div className="grid divide-y divide-ink/[0.06]">
                {rest.map((r, i) => {
                  const isMe = r.uid === user?.uid;
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-4 px-5 py-3.5 sm:px-6 ${isMe ? "bg-accent/[0.06]" : ""}`}
                    >
                      <span className="w-6 text-center font-display text-sm font-bold tabular-nums text-ink/35">
                        {i + 4}
                      </span>
                      <Avatar name={r.name} src={r.avatarUrl} className="h-9 w-9 rounded-xl bg-ink-3 text-xs" />
                      <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
                        {r.name}
                        {isMe && <span className="font-semibold text-accent">{t("leaderboard.you")}</span>}
                      </p>
                      <p className="font-display text-lg font-bold tabular-nums text-ink">{r.bestScore}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {user && myRank === -1 && (
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-ink/45">
              <LuMedal size={16} />
              {t("leaderboard.notInTop")}
            </p>
          )}
        </>
      )}
    </Page>
  );
}
