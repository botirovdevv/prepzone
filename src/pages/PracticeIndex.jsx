import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuLibrary, LuArrowRight } from "react-icons/lu";

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
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0076FC] mb-1">
          Amaliyot
        </p>
        <h1 className="text-2xl font-extrabold text-[#0F1C30]">Savollar to'plamlari</h1>
        <p className="text-sm text-[#0F1C30]/50 mt-1">
          Vaqt cheklanmagan — javob belgilaganingizda darhol to'g'ri/noto'g'riligini ko'rasiz.
        </p>
      </div>

      {loading ? (
        <p className="text-[#0F1C30]/40 text-sm">Yuklanmoqda...</p>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#0F1C30]/8 p-10 text-center text-[#0F1C30]/50">
          Hozircha birorta to'plam yo'q.
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((s) => (
            <Link
              key={s.id}
              to={`/practice/${s.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl border border-[#0F1C30]/8 p-5 hover:border-[#0076FC]/40 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0076FC]/10 text-[#0076FC] flex items-center justify-center shrink-0">
                <LuLibrary size={19} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#0F1C30] truncate">{s.title}</p>
                <p className="text-sm text-[#0F1C30]/50 truncate">
                  {countQuestions(s)} ta savol
                  {s.description ? ` · ${s.description}` : ""}
                </p>
              </div>
              <LuArrowRight size={18} className="text-[#0F1C30]/30 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
