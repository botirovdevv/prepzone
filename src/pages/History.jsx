import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function History() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Faqat "uid" bo'yicha filtrlaymiz — bu Firestore'da composite index
    // talab qilmaydi. Sanaga ko'ra saralashni JS tomonda qilamiz.
    const qy = query(collection(db, "results"), where("uid", "==", user.uid));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => {
          const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return tb - ta;
        });
        setAttempts(list);
        setFetching(false);
      },
      (err) => {
        setError("Natijalarni yuklashda xatolik yuz berdi.");
        console.error(err);
        setFetching(false);
      }
    );
    return unsub;
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mening natijalarim</h1>
          <Link to="/" className="text-sm text-[#375DFB]">
            ← Bosh sahifa
          </Link>
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {attempts.length === 0 && !error && (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            <p>Hali birorta test topshirmagansiz.</p>
            <button
              onClick={() => navigate("/sat/select")}
              className="mt-4 bg-[#375DFB] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#2b4bd9]"
            >
              Testni boshlash
            </button>
          </div>
        )}

        <div className="space-y-3">
          {attempts.map((a) => {
            const date = a.createdAt?.toDate
              ? a.createdAt.toDate()
              : null;
            return (
              <Link
                key={a.id}
                to={`/sat/results/${a.id}`}
                className="block bg-white rounded-xl shadow p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {date
                        ? date.toLocaleString("uz-UZ", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Sana noma'lum"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      SAT Practice Test
                    </p>
                  </div>
                  <div className="text-3xl font-black text-[#375DFB]">
                    {a.total}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
