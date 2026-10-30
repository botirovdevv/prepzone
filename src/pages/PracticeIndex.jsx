import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LuBookOpen, LuArrowRight, LuLayers, LuSparkles } from "react-icons/lu";
import { Page, PageHeader, Card, Badge, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { useI18n } from "../i18n";

export default function PracticeIndex() {
  const { t } = useI18n();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Yengil ro'yxat (savollarsiz) — to'liq to'plam faqat ochilganda yuklanadi.
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    api
      .get("/question-sets")
      .then((list) => !cancelled && setSets(list))
      .catch(() => !cancelled && setLoadError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const countQuestions = (s) => s.questionCount ?? 0;

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow={t("practiceIndex.eyebrow")}
        icon={LuSparkles}
        title={t("practiceIndex.title")}
        subtitle={t("practiceIndex.subtitle")}
        actions={
          !loading && !loadError && (
            <Badge tone="blue" icon={LuLayers}>
              {t("practiceIndex.count", { n: sets.length })}
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
      ) : loadError ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : sets.length === 0 ? (
        <EmptyState icon={LuLayers} title={t("practiceIndex.emptyTitle")} text={t("practiceIndex.emptyText")} />
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
                  {t("practiceIndex.questions", { n: countQuestions(s) })}
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
