import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LuCalculator, LuArrowRight, LuPlay, LuFileText } from "react-icons/lu";
import { Page, PageHeader, Card, Badge, EmptyState, IconTile, Skeleton } from "../components/ui";

export default function DesmosIndex() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/desmos")
      .then(setTutorials)
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Desmos kalkulyator"
        icon={LuCalculator}
        title="Desmos darsliklari"
        subtitle="Math bo'limida ishlatiladigan Desmos grafik kalkulyatoridan qanday foydalanishni bosqichma-bosqich o'rganing."
        actions={
          !loading && (
            <Badge tone="blue" icon={LuCalculator}>
              {tutorials.length} ta darslik
            </Badge>
          )
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[76px]" />
          ))}
        </div>
      ) : tutorials.length === 0 ? (
        <EmptyState
          icon={LuCalculator}
          title="Hozircha darsliklar mavjud emas"
          text="Yangi darsliklar qo'shilishi bilan shu yerda paydo bo'ladi."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid divide-y divide-[#12213D]/[0.06]">
            {tutorials.map((t) => (
              <Link
                key={t.id}
                to={`/desmos/${t.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
              >
                <IconTile icon={t.videoUrl ? LuPlay : LuFileText} tone="blue" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[16px] font-bold text-[#12213D]">{t.title}</h3>
                  {t.description && <p className="mt-0.5 truncate text-sm text-[#12213D]/45">{t.description}</p>}
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#12213D]/25 transition group-hover:bg-[#087fd1] group-hover:text-white">
                  <LuArrowRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </Page>
  );
}
