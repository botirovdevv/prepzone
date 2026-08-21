import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { LuBookOpen, LuArrowRight, LuLayers, LuSparkles } from "react-icons/lu";
import PageHero from "../components/PageHero";

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
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHero
        eyebrow="AMALIYOT MARKAZI"
        icon={LuSparkles}
        title="Savollar to'plamlari"
        subtitle="Vaqt cheklovisiz mashq qiling — javob belgilashingiz bilan to'g'ri yoki noto'g'riligini darhol ko'rasiz."
        stats={[
          {
            icon: LuLayers,
            value: sets.length,
            label: "to'plam",
            iconClass: "bg-[#087fd1]/10 text-[#087fd1]",
          },
        ]}
      />

      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-[22px] border border-[#12213D]/6 animate-pulse" />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-dashed border-[#12213D]/12 p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mx-auto mb-4">
            <LuLayers size={24} />
          </div>
          <p className="text-[#12213D]/50 font-medium">Hozircha to'plamlar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sets.map((s) => (
            <Link
              key={s.id}
              to={`/practice/${s.id}`}
              className="group flex items-center gap-5 bg-white p-5 rounded-[22px] border border-[#12213D]/7 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.2)] transition-all duration-200"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#087fd1]/10 flex items-center justify-center text-[#087fd1] shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors duration-200">
                <LuLayers size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-extrabold text-[#12213D] text-[17px] truncate">
                  {s.title}
                </h3>
                <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#087fd1] bg-[#087fd1]/8 px-2.5 py-1 rounded-lg">
                    <LuBookOpen size={13} />
                    {countQuestions(s)} ta savol
                  </span>
                  {s.description && (
                    <span className="text-sm text-[#12213D]/40 truncate">{s.description}</span>
                  )}
                </div>
              </div>

              <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#12213D]/25 group-hover:text-[#087fd1] group-hover:bg-[#087fd1]/8 transition-colors shrink-0">
                <LuArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
