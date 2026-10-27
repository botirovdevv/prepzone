import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SessionResults() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: sessionId } = useParams();

  const terminated = location.state?.terminated;
  const saveError = location.state?.saveError;
  const [results, setResults] = useState(location.state?.results || null);
  const [sections, setSections] = useState(location.state?.sections || null);
  const [total, setTotal] = useState(location.state?.total ?? null);
  const [sessionTitle, setSessionTitle] = useState(location.state?.sessionTitle || "");
  const [loading, setLoading] = useState(!location.state?.results);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (location.state?.results || !user) return;
    setLoading(true);
    Promise.all([api.get(`/sessions/${sessionId}/results/me`), api.get(`/sessions/${sessionId}`)])
      .then(([data, s]) => {
        setResults(data.results);
        setTotal(data.total);
        setSessionTitle(s.title);
        setSections((s.sections || []).map((sec) => ({ id: sec.id, title: sec.title })));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sessionId, user, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (notFound || !results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-600">
        <p>Bu natija topilmadi.</p>
        <Link to="/dashboard" className="bg-[#375DFB] text-white px-5 py-2 rounded-lg font-semibold">
          Bosh sahifa
        </Link>
      </div>
    );
  }

  const SECTION_TITLES = { rw: "Reading and Writing", math: "Math" };
  const sectionsMeta =
    sections || Object.keys(results).map((id) => ({ id, title: SECTION_TITLES[id] || id }));
  const groupResults = sectionsMeta.map((s) => ({ meta: s, r: results[s.id] })).filter((x) => x.r);
  const computedTotal =
    total ?? groupResults.reduce((sum, { r }) => sum + (r.scaledScore || 0), 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {saveError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6 text-sm">
            <p className="font-semibold mb-0.5">Natija serverga saqlanmadi.</p>
            <p className="text-amber-700/80">
              Internet aloqasini tekshiring. Bu natija "Mening natijalarim" va reytingda ko'rinmasligi mumkin.
            </p>
          </div>
        )}
        {terminated && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
            <p className="font-semibold mb-0.5">
              Test xavfsizlik qoidasi buzilgani uchun avtomatik yakunlandi.
            </p>
            <p className="text-red-600/80">
              Natija shu paytgacha bergan javoblaringiz asosida hisoblandi.
            </p>
          </div>
        )}

        <div className="bg-[#0B2265] text-white rounded-2xl p-8 text-center shadow-xl mb-8">
          {sessionTitle && (
            <p className="text-sm uppercase tracking-wide text-white/70 mb-2">{sessionTitle}</p>
          )}
          <p className="text-6xl font-black">{computedTotal}</p>
          <p className="text-white/70 mt-1">400 - 1600 shkala bo'yicha</p>
        </div>

        <div className="space-y-5">
          {groupResults.map(({ meta, r }) => {
            const totalCorrect = (r.module1Correct || 0) + (r.module2Correct || 0);
            const totalQ = (r.module1Total || 0) + (r.module2Total || 0);
            return (
              <div key={meta.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-gray-900">{meta.title}</h2>
                  <span className="text-3xl font-black text-[#375DFB]">{r.scaledScore}</span>
                </div>

                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>{r.singleModule ? "Savollar" : "Module 1 (baza)"}</span>
                    <span className="font-medium text-gray-800">
                      {r.module1Correct}/{r.module1Total} to'g'ri
                    </span>
                  </div>
                  {!r.singleModule && (
                    <div className="flex justify-between items-center">
                      <span>
                        Module 2 —{" "}
                        <span
                          className={`font-semibold ${
                            r.route === "hard" ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {r.route === "hard" ? "Qiyin" : "Oson"}
                        </span>{" "}
                        versiya
                      </span>
                      <span className="font-medium text-gray-800">
                        {r.module2Correct}/{r.module2Total} to'g'ri
                      </span>
                    </div>
                  )}
                  {!r.singleModule && (
                    <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                      <span>Jami</span>
                      <span className="font-medium text-gray-800">
                        {totalCorrect}/{totalQ} to'g'ri
                      </span>
                    </div>
                  )}
                </div>

                {r.incomplete && (
                  <p className="text-xs text-amber-600 mt-4">
                    Bu bo'lim to'liq tugallanmagan — test muddatidan oldin yakunlangan.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Link
            to="/dashboard"
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-white"
          >
            Bosh sahifa
          </Link>
          <button
            onClick={() => navigate("/sat/history")}
            className="bg-[#375DFB] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#2b4bd9]"
          >
            Barcha natijalarim
          </button>
        </div>
      </div>
    </div>
  );
}
