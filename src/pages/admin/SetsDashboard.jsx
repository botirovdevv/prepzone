import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { LuPlus, LuLibrary, LuChevronRight, LuTrash2, LuEye, LuBookOpen } from "react-icons/lu";
import { Page, PageHeader, Card, Button, IconTile, Badge, EmptyState, Skeleton } from "../../components/ui";

export default function SetsDashboard() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Yengil ro'yxat: server savollar o'rniga faqat ularning sonini qaytaradi.
    api
      .get("/question-sets")
      .then(setSets)
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`"${title}" to'plamini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.delete(`/question-sets/${id}`);
      setSets((list) => list.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      window.alert(err.message || "To'plamni o'chirib bo'lmadi. Internet aloqasini tekshirib, qaytadan urinib ko'ring.");
    }
  };

  const countQuestions = (s) => s.questionCount ?? 0;

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
          <div className="grid divide-y divide-ink/[0.06]">
            {sets.map((s) => (
              <Link
                key={s.id}
                to={`/admin/sets/${s.id}/edit`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-canvas sm:px-6"
              >
                <IconTile icon={LuLibrary} tone="blue" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{s.title}</p>
                  {s.description && <p className="mt-0.5 truncate text-sm text-ink/50">{s.description}</p>}
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink/40 transition hover:bg-surface hover:text-ink hover:shadow-sm"
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
                  className="shrink-0 text-ink/25 transition group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </Link>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
