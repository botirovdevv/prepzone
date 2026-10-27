import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { satTest } from "../data/satTest";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const terminated = location.state?.terminated;
  const saveError = location.state?.saveError;
  const [results, setResults] = useState(location.state?.results || null);
  const [loading, setLoading] = useState(!location.state?.results && !!id);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Agar sahifa /sat/results/:id orqali ochilgan bo'lsa (masalan,
    // "Mening natijalarim" ro'yxatidan), natijani serverdan olib kelamiz.
    if (location.state?.results || !id) return;
    setLoading(true);
    api
      .get(`/results/${id}`)
      .then((data) => setResults(data.results))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-600">
        <p>Bu natija topilmadi.</p>
        <Link
          to="/sat/history"
          className="bg-[#375DFB] text-white px-5 py-2 rounded-lg font-semibold"
        >
          Barcha natijalarim
        </Link>
      </div>
    );
  }

  if (!results) {
    // Sahifa to'g'ridan-to'g'ri ochilgan bo'lsa (masalan, refresh qilingan) -
    // natija ma'lumoti yo'q, testni qaytadan boshlashni taklif qilamiz.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-600">
        <p>Natija topilmadi. Iltimos, testni qaytadan tugating.</p>
        <button
          onClick={() => navigate("/sat/select")}
          className="bg-[#375DFB] text-white px-5 py-2 rounded-lg font-semibold"
        >
          Testga qaytish
        </button>
      </div>
    );
  }

  const groupResults = satTest.groups.map((g) => results[g.id]).filter(Boolean);
  const total = groupResults.reduce((sum, r) => sum + (r.scaledScore || 0), 0);

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
          <p className="text-sm uppercase tracking-wide text-white/70 mb-2">
            Umumiy natija
          </p>
          <p className="text-6xl font-black">{total}</p>
          <p className="text-white/70 mt-1">400 - 1600 shkala bo'yicha</p>
        </div>

        <div className="space-y-5">
          {satTest.groups.map((g) => {
            const r = results[g.id];
            if (!r) return null;
            const totalCorrect = (r.module1Correct || 0) + (r.module2Correct || 0);
            const totalQ = (r.module1Total || 0) + (r.module2Total || 0);
            return (
              <div key={g.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg text-gray-900">{g.title}</h2>
                  <span className="text-3xl font-black text-[#375DFB]">
                    {r.scaledScore}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Module 1 (baza)</span>
                    <span className="font-medium text-gray-800">
                      {r.module1Correct}/{r.module1Total} to'g'ri
                    </span>
                  </div>
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
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                    <span>Jami</span>
                    <span className="font-medium text-gray-800">
                      {totalCorrect}/{totalQ} to'g'ri
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  {r.route === "hard"
                    ? "Module 1'da yaxshi natija ko'rsatganingiz uchun qiyinroq Module 2'ga yo'naltirildingiz — bu maksimal bal olish imkonini ochadi."
                    : "Module 1'dagi xatolar tufayli osonroq Module 2'ga yo'naltirildingiz — bu holatda bo'lim bali odatda 200-650 oralig'ida cheklanadi."}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed">
          Eslatma: bu taxminiy simulyatsiya — real College Board balllash
          algoritmi (IRT) ochiq e'lon qilinmagan. Bu yerdagi bal faqat
          moslashuvchan (adaptive) marshrutlash mantiqini his qildirish
          uchun taqribiy hisoblanadi.
        </p>

        <div className="flex justify-center gap-3 mt-8">
          <Link
            to="/"
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-white"
          >
            Bosh sahifa
          </Link>
          <Link
            to="/sat/history"
            className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-white"
          >
            Barcha natijalarim
          </Link>
          <button
            onClick={() => navigate("/sat/select")}
            className="bg-[#375DFB] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#2b4bd9]"
          >
            Testni qayta boshlash
          </button>
        </div>
      </div>
    </div>
  );
}
