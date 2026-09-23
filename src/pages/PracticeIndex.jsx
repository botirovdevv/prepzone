import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuBookOpen, LuArrowRight, LuLayers, LuSparkles } from "react-icons/lu";
import { Page, PageHeader, Card, Badge, EmptyState, Skeleton } from "../components/ui";

export default function PracticeIndex() {
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

  const countQuestions = (s) =>
    (s.sections || []).reduce((sum, sec) => sum + (sec.questions?.length || 0), 0);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Amaliyot markazi"
        icon={LuSparkles}
        title="Savollar to'plamlari"
        subtitle="Vaqt cheklovisiz mashq qiling — javob belgilashingiz bilan to'g'ri yoki noto'g'riligini darhol ko'rasiz."
        actions={
          !loading && (
            <Badge tone="blue" icon={LuLayers}>
              {sets.length} ta to'plam
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
      ) : sets.length === 0 ? (
        <EmptyState
          icon={LuLayers}
          title="Hozircha to'plamlar mavjud emas"
          text="Yangi amaliyot to'plamlari qo'shilishi bilan shu yerda paydo bo'ladi."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="grid divide-y divide-[#12213D]/[0.06]">
            {sets.map((s, i) => (
              <Link
                key={s.id}
                to={`/practice/${s.id}`}
                className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F7FB] sm:px-6"
              >
                <span className="w-7 shrink-0 font-display text-sm font-bold tabular-nums text-[#12213D]/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[16px] font-bold text-[#12213D]">{s.title}</h3>
                  {s.description && (
                    <p className="mt-0.5 truncate text-sm text-[#12213D]/45">{s.description}</p>
                  )}
                </div>
                <Badge tone="blue" icon={LuBookOpen} className="hidden sm:inline-flex">
                  {countQuestions(s)} ta savol
                </Badge>
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
