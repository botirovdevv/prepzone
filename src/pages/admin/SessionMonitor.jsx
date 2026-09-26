import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot, collection, query, orderBy, limit, updateDoc, deleteDoc } from "firebase/firestore";
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
  LuTrash2,
  LuCheck,
  LuUsers,
  LuActivity,
  LuSearchX,
} from "react-icons/lu";
import { generateUniqueCode, assignCode, getSessionCode, releaseCode } from "../../utils/sessionCode";
import { Page, PageHeader, Card, CardHeader, Button, Badge, StatTile, EmptyState, PageLoader } from "../../components/ui";

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
  active: { text: "Test yechmoqda", color: "text-[#087fd1] bg-[#087fd1]/10", icon: LuLoaderCircle },
  finished: { text: "Yakunladi", color: "text-emerald-600 bg-emerald-500/10", icon: LuCircleCheck },
  terminated: { text: "Chetlatildi", color: "text-red-600 bg-red-500/10", icon: LuCircleX },
  paused: { text: "Pauzada (chiqib ketgan)", color: "text-amber-600 bg-amber-500/10", icon: LuPause },
  not_started: { text: "Hali kirmagan", color: "text-[#12213D]/50 bg-[#12213D]/[0.06]", icon: LuLoaderCircle },
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
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState(null);

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

  // Kod himoyalangan joydan o'qiladi; eski formatdagi sessiya bo'lsa — ko'chiriladi.
  const legacyCode = session?.code || null;
  const sessionExists = !!session;
  useEffect(() => {
    if (!sessionExists) return;
    const load = legacyCode
      ? assignCode(id, legacyCode).then(() => legacyCode)
      : getSessionCode(id);
    load.then(setCode).catch((err) => console.error("Kodni o'qishda xatolik:", err));
  }, [id, sessionExists, legacyCode]);

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerateCode = async () => {
    setRegenerating(true);
    try {
      const newCode = await generateUniqueCode();
      await assignCode(id, newCode, code);
      setCode(newCode);
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

  // Testni butunlay o'chirish. Firestore klient SDK'si pastki
  // kolleksiyalarni (participants/events/results) avtomatik
  // o'chirmaydi — ular bazada qoladi, lekin asosiy hujjat va savollar
  // o'chgach hech qayerda ko'rinmaydi.
  const handleDeleteSession = async () => {
    if (
      !window.confirm(
        `"${session.title}" testini butunlay o'chirishni tasdiqlaysizmi? Savollar va kirish kodi o'chadi, bu amalni qaytarib bo'lmaydi.`
      )
    )
      return;
    setDeleting(true);
    try {
      await releaseCode(id);
      await deleteDoc(doc(db, "testSessions", id, "secure", "content"));
      await deleteDoc(doc(db, "testSessions", id));
      navigate("/admin");
    } catch (err) {
      console.error("Testni o'chirishda xatolik:", err);
      window.alert("Testni o'chirib bo'lmadi. Firestore qoidalari admin uchun o'chirishga ruxsat berishini tekshiring.");
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!session) {
    return (
      <Page width="narrow">
        <EmptyState icon={LuSearchX} title="Test topilmadi" action={<Button to="/admin">Barcha testlar</Button>} />
      </Page>
    );
  }

  const counts = participants.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Page>
      <button
        onClick={() => navigate("/admin")}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#12213D]/50 transition hover:text-[#12213D]"
      >
        <LuArrowLeft size={16} /> Barcha testlar
      </button>

      <PageHeader
        eyebrow={session.accessType === "open" ? "Doimiy ochiq test" : formatDateTime(session.scheduledAt)}
        icon={LuActivity}
        title={session.title}
        actions={
          <>
            <Button variant="outline" size="sm" to={`/admin/sessions/${id}/edit`}>
              <LuPencil size={15} /> Tahrirlash
            </Button>
            <Button variant="danger" size="sm" onClick={handleCloseSession} disabled={closing || session.status === "closed"}>
              <LuLock size={15} /> {session.status === "closed" ? "Yakunlangan" : "Testni yopish"}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteSession} disabled={deleting}>
              <LuTrash2 size={15} /> {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </Button>
          </>
        }
      />

      {/* Kirish kodi */}
      <section className="relative mb-6 overflow-hidden rounded-2xl bg-[#12213D] p-6 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[#087fd1]/25 blur-2xl" />
        <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">
              {session.accessType === "open" ? "Kirish kodi (ixtiyoriy — test doimiy ochiq)" : "Kirish kodi"}
            </p>
            <p className="mt-2 font-mono text-4xl font-black tracking-[0.25em]">{code || "······"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="light" size="sm" onClick={handleCopyCode}>
              {copied ? <LuCheck size={15} /> : <LuCopy size={15} />} {copied ? "Nusxalandi!" : "Nusxalash"}
            </Button>
            <Button variant="light" size="sm" onClick={handleRegenerateCode} disabled={regenerating}>
              <LuRefreshCw size={15} className={regenerating ? "animate-spin" : ""} /> Yangilash
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={LuUsers} label="Ishtirokchilar" value={participants.length} />
        <StatTile icon={LuLoaderCircle} label="Yechmoqda" value={counts.active || 0} />
        <StatTile icon={LuCircleCheck} tone="emerald" label="Yakunladi" value={counts.finished || 0} />
        <StatTile icon={LuTriangleAlert} tone="red" label="Hodisalar" value={events.length} />
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-5">
        {/* Ishtirokchilar */}
        <Card className="lg:col-span-3">
          <CardHeader title="Ishtirokchilar" subtitle={`${participants.length} ta talaba`} />
          {participants.length === 0 ? (
            <p className="px-6 pb-6 pt-3 text-sm text-[#12213D]/45">Hali hech kim kirmadi.</p>
          ) : (
            <div className="mt-4 divide-y divide-[#12213D]/[0.06] border-t border-[#12213D]/[0.06]">
              {participants.map((p) => {
                const meta = STATUS_META[p.status] || STATUS_META.not_started;
                const Icon = meta.icon;
                return (
                  <div key={p.uid} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#12213D]">{p.name || p.email}</p>
                      <p className="text-xs text-[#12213D]/45">
                        {meta.text}
                        {typeof p.totalScore === "number" ? ` · ${p.totalScore} ball` : ""}
                      </p>
                    </div>
                    {(p.violationCount || 0) > 0 && (
                      <Badge tone="red" icon={LuTriangleAlert}>
                        {p.violationCount}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Jonli xavfsizlik hodisalari */}
        <Card className="lg:col-span-2">
          <CardHeader title="Xavfsizlik hodisalari" subtitle="Oxirgi 50 ta, jonli" />
          {events.length === 0 ? (
            <p className="px-6 pb-6 pt-3 text-sm text-[#12213D]/45">Hozircha hech qanday hodisa yo'q.</p>
          ) : (
            <div className="mt-4 max-h-[520px] divide-y divide-[#12213D]/[0.06] overflow-y-auto border-t border-[#12213D]/[0.06]">
              {events.map((e) => (
                <div key={e.id} className="flex gap-3 px-5 py-3 text-sm sm:px-6">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#12213D]">{EVENT_LABEL[e.type] || e.type}</p>
                    <p className="mt-0.5 truncate text-xs text-[#12213D]/45">
                      {e.name} · {formatDateTime(e.at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </Page>
  );
}
