import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LuSearchX, LuChartColumn, LuArrowRight } from "react-icons/lu";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Page, PageHeader, Card, CardHeader, Button, Badge, EmptyState, PageLoader } from "../components/ui";
import { ScoreSummary, ModuleBreakdown } from "../components/ScoreSummary";

export default function SessionResults() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: sessionId } = useParams();

  const terminated = location.state?.terminated;
  const [results, setResults] = useState(location.state?.results || null);
  const [sections, setSections] = useState(location.state?.sections || null);
  const [total, setTotal] = useState(location.state?.total ?? null);
  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle || "");
  const [loading, setLoading] = useState(!location.state?.results);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (location.state?.results || !user) return;
    setLoading(true);
    getDoc(doc(db, "testSessions", sessionId, "results", user.uid))
      .then((snap) => {
        if (!snap.exists()) {
          setNotFound(true);
          return;
        }
        const data = snap.data();
        setResults(data.results);
        setTotal(data.total);
        return getDoc(doc(db, "testSessions", sessionId));
      })
      .then((sessSnap) => {
        if (sessSnap?.exists()) {
          const s = sessSnap.data();
          setSessionTitle(s.title);
          setSections((s.sections || []).map((sec) => ({ id: sec.id, title: sec.title })));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sessionId, user, location.state]);

  if (loading) return <PageLoader />;

  if (notFound || !results) {
    return (
      <Page width="narrow">
        <EmptyState
          icon={LuSearchX}
          title="Natija topilmadi"
          text="Bu natija mavjud emas yoki hali saqlanmagan."
          action={<Button to="/dashboard">Bosh sahifa</Button>}
        />
      </Page>
    );
  }

  const sectionsMeta = sections || Object.keys(results).map((id) => ({ id, title: id }));
  const groupResults = sectionsMeta.map((s) => ({ meta: s, r: results[s.id] })).filter((x) => x.r);
  const computedTotal =
    total ?? groupResults.reduce((sum, { r }) => sum + (r.scaledScore || 0), 0);

  return (
    <Page width="narrow">
      <PageHeader
        eyebrow="Test natijasi"
        icon={LuChartColumn}
        title={sessionTitle || "Mock test"}
        subtitle="Bo'limlar bo'yicha ball va to'g'ri javoblar soni."
        actions={
          <Button onClick={() => navigate("/sat/history")}>
            Barcha natijalarim <LuArrowRight size={16} />
          </Button>
        }
      />

      <ScoreSummary
        total={computedTotal}
        terminated={terminated}
        sections={groupResults.map(({ meta, r }) => ({ id: meta.id, title: meta.title, score: r.scaledScore }))}
      />

      <div className="space-y-6">
        {groupResults.map(({ meta, r }) => {
          const totalCorrect = (r.module1Correct || 0) + (r.module2Correct || 0);
          const totalQ = (r.module1Total || 0) + (r.module2Total || 0);
          const rows = r.singleModule
            ? [{ label: "Savollar", value: `${r.module1Correct}/${r.module1Total}` }]
            : [
                { label: "Module 1", value: `${r.module1Correct}/${r.module1Total}` },
                {
                  label: "Module 2",
                  tag: (
                    <Badge tone={r.route === "hard" ? "red" : r.route === "mixed" ? "ink" : "emerald"}>
                      {r.route === "hard" ? "Qiyin" : r.route === "mixed" ? "Aralash" : "Oson"}
                    </Badge>
                  ),
                  value: `${r.module2Correct}/${r.module2Total}`,
                },
                { label: "Jami", value: `${totalCorrect}/${totalQ}` },
              ];
          return (
            <Card key={meta.id}>
              <CardHeader
                title={meta.title}
                subtitle={r.incomplete ? "Bu bo'lim to'liq tugallanmagan — test muddatidan oldin yakunlangan." : undefined}
                action={
                  <span className="font-display text-3xl font-extrabold tabular-nums text-[#087fd1]">{r.scaledScore}</span>
                }
              />
              <div className="p-5 sm:p-6">
                <ModuleBreakdown rows={rows} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" to="/dashboard">
          Bosh sahifa
        </Button>
      </div>
    </Page>
  );
}
