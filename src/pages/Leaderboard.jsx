import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { LuTrophy, LuCrown, LuMedal } from "react-icons/lu";
import { Page, PageHeader, Card, Button, EmptyState, Skeleton } from "../components/ui";

function initials(name) {
  const parts = (name || "?").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

// Podium tartibi: 2-o'rin, 1-o'rin, 3-o'rin (o'rtadagisi eng baland).
const PODIUM = [
  { index: 1, height: "h-24", ring: "ring-[#12213D]/15", avatar: "bg-[#12213D]" },
  { index: 0, height: "h-32", ring: "ring-amber-400", avatar: "bg-[#087fd1]" },
  { index: 2, height: "h-20", ring: "ring-[#12213D]/10", avatar: "bg-[#12213D]/70" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "leaderboard"), orderBy("bestScore", "desc"), limit(15));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const myRank = rows.findIndex((r) => r.uid === user?.uid);
  const rest = rows.slice(3);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Reyting"
        icon={LuTrophy}
        title="Eng yaxshi natijalar"
        subtitle="Har bir foydalanuvchining eng yuqori mock test balli bo'yicha TOP-15."
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-56" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={LuTrophy}
          title="Reyting hali bo'sh"
          text="Hali hech kim mock test yakunlamagan — birinchi bo'ling!"
          action={<Button to="/sat/select">Testni boshlash</Button>}
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
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold text-white ring-4 ring-offset-2 ${avatar} ${ring}`}
                    >
                      {initials(r.name)}
                    </div>
                    <p className="mt-3 w-full truncate text-sm font-semibold text-[#12213D]">
                      {r.name}
                      {isMe && <span className="text-[#087fd1]"> (Siz)</span>}
                    </p>
                    <p className="font-display text-xl font-extrabold tabular-nums text-[#12213D]">{r.bestScore}</p>
                    <div
                      className={`mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 ${height} ${
                        index === 0 ? "bg-[#087fd1] text-white" : "bg-[#F6F7FB] text-[#12213D]/50"
                      }`}
                    >
                      <span className="font-display text-2xl font-extrabold">{index + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {rest.length > 0 && (
            <Card className="overflow-hidden">
              <div className="grid divide-y divide-[#12213D]/[0.06]">
                {rest.map((r, i) => {
                  const isMe = r.uid === user?.uid;
                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-4 px-5 py-3.5 sm:px-6 ${isMe ? "bg-[#087fd1]/[0.06]" : ""}`}
                    >
                      <span className="w-6 text-center font-display text-sm font-bold tabular-nums text-[#12213D]/35">
                        {i + 4}
                      </span>
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#12213D] text-xs font-bold text-white">
                        {initials(r.name)}
                      </div>
                      <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#12213D]">
                        {r.name}
                        {isMe && <span className="font-semibold text-[#087fd1]"> (Siz)</span>}
                      </p>
                      <p className="font-display text-lg font-extrabold tabular-nums text-[#12213D]">{r.bestScore}</p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {user && myRank === -1 && (
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-[#12213D]/45">
              <LuMedal size={16} />
              Siz hali TOP-15'da emassiz — yaxshiroq natija ko'rsatib, ro'yxatga kiring!
            </p>
          )}
        </>
      )}
    </Page>
  );
}
