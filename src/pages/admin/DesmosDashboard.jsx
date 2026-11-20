import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { LuPlus, LuCalculator, LuChevronRight, LuTrash2, LuEye, LuPlay } from "react-icons/lu";

export default function DesmosDashboard() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/desmos")
      .then(setTutorials)
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e, id, title) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`"${title}" darsligini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await api.delete(`/desmos/${id}`);
      setTutorials((list) => list.filter((item) => item.id !== id));
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
            Admin panel
          </p>
          <h1 className="text-2xl font-extrabold text-ink">Desmos darsliklari</h1>
          <p className="text-sm text-ink/50 mt-1">
            Talabalarga Desmos grafik kalkulyatoridan foydalanishni o'rgatuvchi qisqa darsliklar.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/desmos/new")}
          className="flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2.5 rounded-full hover:bg-accent-press shrink-0"
        >
          <LuPlus size={17} /> Yangi darslik
        </button>
      </div>

      {loading ? (
        <p className="text-ink/40 text-sm">Yuklanmoqda...</p>
      ) : tutorials.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-ink/8 p-10 text-center text-ink/50">
          Hali birorta darslik yaratilmagan.
        </div>
      ) : (
        <div className="space-y-3">
          {tutorials.map((t) => (
            <Link
              key={t.id}
              to={`/admin/desmos/${t.id}/edit`}
              className="flex items-center gap-4 bg-surface rounded-2xl border border-ink/8 p-5 hover:border-accent/40 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                {t.videoUrl ? <LuPlay size={19} /> : <LuCalculator size={19} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink truncate">{t.title}</p>
                <p className="text-sm text-ink/50 truncate">
                  {t.description || (t.videoUrl ? "Video darslik" : "Matnli darslik")}
                </p>
              </div>
              <a
                href={`/desmos/${t.id}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Talaba sifatida ko'rish"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink/40 hover:bg-ink/5 hover:text-ink shrink-0"
              >
                <LuEye size={17} />
              </a>
              <button
                onClick={(e) => handleDelete(e, t.id, t.title)}
                title="O'chirish"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0"
              >
                <LuTrash2 size={17} />
              </button>
              <LuChevronRight size={18} className="text-ink/30 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
