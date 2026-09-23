import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import { LuPlus, LuLibrary, LuChevronRight, LuTrash2, LuEye, LuBookOpen } from "react-icons/lu";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, Skeleton } from "../../components/ui";

export default function SetsDashboard() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "questionSets"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setSets(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  const handleDelete = async (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`"${title}" to'plamini o'chirishni tasdiqlaysizmi?`)) return;
    await deleteDoc(doc(db, "questionSets", id));
  };

  const countQuestions = (s) =>
    (s.sections || []).reduce((sum, sec) => sum + (sec.questions?.length || 0), 0);

  return (
    <Page>
      <PageHeader
        eyebrow="Admin panel"
        icon={LuLibrary}
        title="Amaliyot to'plamlari"
        subtitle="Vaqt cheklanmagan, darhol javob ko'rsatiladigan savol to'plamlari (masalan, o'tgan imtihonlardagi savollar)."
        actions={
          <Button to="/admin/sets/new">
            <LuPlus size={17} /> Yangi to'plam
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[76px]" />
          <Skeleton className="h-[76px]" />
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          icon={LuLibrary}
          title="Hali birorta to'plam yaratilmagan"
          action={
            <Button to="/admin/sets/new">
              <LuPlus size={17} /> Yangi to'plam
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid divide-y divide-[#12213D]/[0.06]">
            {sets.map((s) => (
              <Link
                key={s.id}
                to={`/admin/sets/${s.id}/edit`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
              >
                <IconTile icon={LuLibrary} tone="blue" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#12213D]">{s.title}</p>
                  {s.description && <p className="mt-0.5 truncate text-sm text-[#12213D]/50">{s.description}</p>}
                </div>
                <Badge tone="blue" icon={LuBookOpen} className="hidden sm:inline-flex">
                  {countQuestions(s)} ta savol
                </Badge>
                <a
                  href={`/practice/${s.id}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Talaba sifatida ko'rish"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#12213D]/40 transition hover:bg-white hover:text-[#12213D] hover:shadow-sm"
                >
                  <LuEye size={17} />
                </a>
                <button
                  onClick={(e) => handleDelete(e, s.id, s.title)}
                  title="O'chirish"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-red-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LuTrash2 size={17} />
                </button>
                <LuChevronRight
                  size={18}
                  className="shrink-0 text-[#12213D]/25 transition group-hover:translate-x-0.5 group-hover:text-[#087fd1]"
                />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
