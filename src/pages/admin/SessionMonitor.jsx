import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy, limit, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  LuArrowLeft,
  LuCopy,
  LuRefreshCw,
  LuTriangleAlert,
  LuCircleCheck,
  LuCircleX,
  LuLoaderCircle,
  LuLock,
  LuPencil,
  LuPause,
} from "react-icons/lu";
import { generateUniqueCode } from "../../utils/sessionCode";

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

const STATUS_META = {
  active: { text: "Test yechmoqda", color: "text-blue-600 bg-blue-50", icon: LuLoaderCircle },
  finished: { text: "Yakunladi", color: "text-emerald-600 bg-emerald-50", icon: LuCircleCheck },
  terminated: { text: "Chetlatildi", color: "text-red-600 bg-red-50", icon: LuCircleX },
  paused: { text: "Pauzada (chiqib ketgan)", color: "text-amber-600 bg-amber-50", icon: LuPause },
  not_started: { text: "Hali kirmagan", color: "text-gray-500 bg-gray-100", icon: LuLoaderCircle },
};

const EVENT_LABEL = {
  screenshot: "Skrinshot urinishi",
  tabswitch: "Boshqa tabga o'tdi",
  devtools: "DevTools ochishga urindi",
  fullscreen: "Fullscreen'dan chiqdi",
  warnings: "Ogohlantirishlar chegarasiga yetdi",
};

export default function SessionMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "testSessions", id), (snap) => {
      setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, "testSessions", id, "participants"));
    const unsub = onSnapshot(q, (snap) => {
      setParticipants(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, [id]);

  useEffect(() => {
    const q = query(collection(db, "testSessions", id, "events"), orderBy("at", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [id]);

  const handleCopyCode = () => {
    if (!session) return;
    navigator.clipboard?.writeText(session.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    try {
      const newCode = await generateUniqueCode();
      await updateDoc(doc(db, "testSessions", id), { code: newCode });
    } finally {
      setRegenerating(false);
    }
  };

  const handleCloseSession = async () => {
    if (!window.confirm("Testni yakunlashni tasdiqlaysizmi? Bundan keyin hech kim kira olmaydi va faol yechayotganlar ham chetlatiladi.")) return;
    setClosing(true);
    try {
      await updateDoc(doc(db, "testSessions", id), { status: "closed" });
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <div className="p-10 text-[#0F1C30]/40">Yuklanmoqda...</div>;
  if (!session) return <div className="p-10 text-[#0F1C30]/40">Test topilmadi.</div>;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-1.5 text-sm text-[#0F1C30]/50 hover:text-[#0F1C30] mb-6"
      >
        <LuArrowLeft size={16} /> Barcha testlar
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F1C30] mb-1">{session.title}</h1>
          <p className="text-sm text-[#0F1C30]/50">
            {session.accessType === "open" ? "Doimiy ochiq test" : formatDateTime(session.scheduledAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/sessions/${id}/edit`}
            className="flex items-center gap-1.5 border border-[#0F1C30]/15 text-[#0F1C30] text-sm font-semibold px-3.5 py-2 rounded-full hover:bg-[#0F1C30]/5"
          >
            <LuPencil size={15} /> Tahrirlash
          </Link>
          <button
            onClick={handleCloseSession}
            disabled={closing || session.status === "closed"}
            className="flex items-center gap-1.5 border border-red-200 text-red-600 text-sm font-semibold px-3.5 py-2 rounded-full hover:bg-red-50 disabled:opacity-50"
          >
            <LuLock size={15} /> {session.status === "closed" ? "Yakunlangan" : "Testni yopish"}
          </button>
        </div>
      </div>

      {/* Kirish kodi */}
      <div className="bg-[#0F1C30] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50 mb-1">
            {session.accessType === "open" ? "Kirish kodi (ixtiyoriy — test doimiy ochiq)" : "Kirish kodi"}
          </p>
          <p className="text-4xl font-black font-mono tracking-widest">{session.code}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-sm font-semibold px-3.5 py-2 rounded-full"
          >
            <LuCopy size={15} /> {copied ? "Nusxalandi!" : "Nusxalash"}
          </button>
          <button
            onClick={handleRegenerateCode}
            disabled={regenerating}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-sm font-semibold px-3.5 py-2 rounded-full disabled:opacity-50"
          >
            <LuRefreshCw size={15} className={regenerating ? "animate-spin" : ""} /> Yangilash
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Ishtirokchilar */}
        <div className="lg:col-span-3">
          <h2 className="font-bold text-[#0F1C30] mb-3">Ishtirokchilar ({participants.length})</h2>
          {participants.length === 0 ? (
            <p className="text-sm text-[#0F1C30]/40 bg-white rounded-xl border border-[#0F1C30]/8 p-5">
              Hali hech kim kirmadi.
            </p>
          ) : (
            <div className="space-y-2">
              {participants.map((p) => {
                const meta = STATUS_META[p.status] || STATUS_META.not_started;
                const Icon = meta.icon;
                return (
                  <div
                    key={p.uid}
                    className="flex items-center gap-3 bg-white rounded-xl border border-[#0F1C30]/8 p-3.5"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F1C30] truncate">
                        {p.name || p.email}
                      </p>
                      <p className="text-xs text-[#0F1C30]/40">
                        {meta.text}
                        {typeof p.totalScore === "number" ? ` · ${p.totalScore} ball` : ""}
                      </p>
                    </div>
                    {(p.violationCount || 0) > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full shrink-0">
                        <LuTriangleAlert size={12} /> {p.violationCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Jonli xavfsizlik hodisalari */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-[#0F1C30] mb-3">Xavfsizlik hodisalari</h2>
          {events.length === 0 ? (
            <p className="text-sm text-[#0F1C30]/40 bg-white rounded-xl border border-[#0F1C30]/8 p-5">
              Hozircha hech qanday hodisa yo'q.
            </p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {events.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-red-100 p-3 text-sm">
                  <p className="font-semibold text-red-600">{EVENT_LABEL[e.type] || e.type}</p>
                  <p className="text-[#0F1C30]/60 text-xs mt-0.5">
                    {e.name} · {formatDateTime(e.at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
