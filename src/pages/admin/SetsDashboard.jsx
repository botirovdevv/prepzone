import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { LuPlus, LuLibrary, LuChevronRight, LuTrash2, LuEye } from "react-icons/lu";

export default function SetsDashboard() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
      window.alert(err.message);
    }
  };

  const countQuestions = (s) =>
    (s.sections || []).reduce((sum, sec) => sum + (sec.questionCount ?? sec.questions?.length ?? 0), 0);

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087fd1] mb-1">
            Admin panel
          </p>
          <h1 className="text-2xl font-extrabold text-[#12213D]">Amaliyot to'plamlari</h1>
          <p className="text-sm text-[#12213D]/50 mt-1">
            Vaqt cheklanmagan, darhol javob ko'rsatiladigan savol to'plamlari (masalan, o'tgan
            imtihonlardagi savollar).
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/sets/new")}
          className="flex items-center gap-2 bg-[#087fd1] text-white font-semibold px-4 py-2.5 rounded-full hover:bg-[#066fb8] shrink-0"
        >
          <LuPlus size={17} /> Yangi to'plam
        </button>
      </div>

      {loading ? (
        <p className="text-[#12213D]/40 text-sm">Yuklanmoqda...</p>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#12213D]/8 p-10 text-center text-[#12213D]/50">
          Hali birorta to'plam yaratilmagan.
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((s) => (
            <Link
              key={s.id}
              to={`/admin/sets/${s.id}/edit`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#12213D]/8 p-5 hover:border-[#087fd1]/40 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0">
                <LuLibrary size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#12213D] truncate">{s.title}</p>
                <p className="text-sm text-[#12213D]/50 truncate">
                  {countQuestions(s)} ta savol
                  {s.description ? ` · ${s.description}` : ""}
                </p>
              </div>
              <a
                href={`/practice/${s.id}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Talaba sifatida ko'rish"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#12213D]/40 hover:bg-[#12213D]/5 hover:text-[#12213D] shrink-0"
              >
                <LuEye size={17} />
              </a>
              <button
                onClick={(e) => handleDelete(e, s.id, s.title)}
                title="O'chirish"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 shrink-0"
              >
                <LuTrash2 size={17} />
              </button>
              <LuChevronRight size={18} className="text-[#12213D]/30 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
