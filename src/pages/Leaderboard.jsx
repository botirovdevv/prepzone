import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { LuTrophy } from "react-icons/lu";
import PageHero from "../components/PageHero";

function initials(name) {
  const parts = (name || "?").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

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

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHero
        eyebrow="REYTING"
        icon={LuTrophy}
        title="Eng yaxshi natijalar"
        subtitle="Har bir foydalanuvchining eng yuqori mock test balli bo'yicha TOP-15."
      />

      {loading ? (
        <div className="grid gap-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-[#12213D]/6 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-dashed border-[#12213D]/12 p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mx-auto mb-4">
            <LuTrophy size={24} />
          </div>
          <p className="text-[#12213D]/50 font-medium">
            Hali hech kim mock test yakunlamagan — birinchi bo'ling!
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {rows.map((r, i) => {
            const isMe = r.uid === user?.uid;
            const isTop3 = i < 3;
            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                  isMe
                    ? "bg-[#087fd1]/[0.05] border-[#087fd1]/25"
                    : "bg-white border-[#12213D]/7"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-extrabold text-sm shrink-0 ${
                    isTop3
                      ? "bg-[#087fd1] text-white"
                      : "bg-[#12213D]/[0.05] text-[#12213D]/50"
                  }`}
                >
                  {i + 1}
                </div>

                <div className="w-10 h-10 rounded-full bg-[#12213D] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {initials(r.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[#12213D] truncate">
                    {r.name}
                    {isMe && <span className="text-[#087fd1] font-semibold"> (Siz)</span>}
                  </p>
                </div>

                <p className="font-display text-xl font-black text-[#12213D] shrink-0">
                  {r.bestScore}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {user && myRank === -1 && !loading && rows.length > 0 && (
        <p className="text-center text-sm text-[#12213D]/40 mt-6">
          Siz hali TOP-15'da emassiz — yaxshiroq natija ko'rsatib, ro'yxatga kiring!
        </p>
      )}
    </div>
  );
}
