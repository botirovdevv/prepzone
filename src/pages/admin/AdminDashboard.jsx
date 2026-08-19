import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { LuPlus, LuCalendarClock, LuChevronRight } from "react-icons/lu";

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
  if (session.status === "closed") return { text: "Yakunlangan", color: "bg-gray-100 text-gray-500" };
  const scheduled = session.scheduledAt?.toDate
    ? session.scheduledAt.toDate()
    : new Date(session.scheduledAt);
  if (scheduled > new Date()) return { text: "Hali boshlanmagan", color: "bg-amber-50 text-amber-600" };
  return { text: "Faol", color: "bg-emerald-50 text-emerald-600" };
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "testSessions"), orderBy("scheduledAt", "desc"));
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

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#0076FC] mb-1">
            Admin panel
          </p>
          <h1 className="text-2xl font-extrabold text-[#0F1C30]">Vaqti belgilangan testlar</h1>
        </div>
        <button
          onClick={() => navigate("/admin/sessions/new")}
          className="flex items-center gap-2 bg-[#0076FC] text-white font-semibold px-4 py-2.5 rounded-full hover:bg-[#0062d1]"
        >
          <LuPlus size={17} /> Yangi test
        </button>
      </div>

      {loading ? (
        <p className="text-[#0F1C30]/40 text-sm">Yuklanmoqda...</p>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#0F1C30]/8 p-10 text-center text-[#0F1C30]/50">
          Hali birorta test tashkil qilinmagan.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const badge = sessionStatusLabel(s);
            return (
              <Link
                key={s.id}
                to={`/admin/sessions/${s.id}/monitor`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-[#0F1C30]/8 p-5 hover:border-[#0076FC]/40 hover:shadow-md transition"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0076FC]/10 text-[#0076FC] flex items-center justify-center shrink-0">
                  <LuCalendarClock size={19} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-[#0F1C30] truncate">{s.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-sm text-[#0F1C30]/50">
                    {formatDateTime(s.scheduledAt)} · Kod:{" "}
                    <span className="font-mono font-bold text-[#0F1C30]/70">{s.code}</span>
                  </p>
                </div>
                <LuChevronRight size={18} className="text-[#0F1C30]/30 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
