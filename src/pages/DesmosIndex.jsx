import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { LuCalculator, LuArrowRight, LuPlay, LuFileText } from "react-icons/lu";
import PageHero from "../components/PageHero";

export default function DesmosIndex() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/desmos")
      .then(setTutorials)
      .catch(() => setTutorials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <PageHero
        eyebrow="DESMOS KALKULYATOR"
        icon={LuCalculator}
        title="Desmos darsliklari"
        subtitle="Math bo'limida ishlatiladigan Desmos grafik kalkulyatoridan qanday foydalanishni bosqichma-bosqich o'rganing."
        stats={[
          {
            icon: LuCalculator,
            value: tutorials.length,
            label: "darslik",
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
      ) : tutorials.length === 0 ? (
        <div className="bg-white rounded-[24px] border border-dashed border-[#12213D]/12 p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center mx-auto mb-4">
            <LuCalculator size={24} />
          </div>
          <p className="text-[#12213D]/50 font-medium">Hozircha darsliklar mavjud emas.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tutorials.map((t) => (
            <Link
              key={t.id}
              to={`/desmos/${t.id}`}
              className="group flex items-center gap-5 bg-white p-5 rounded-[22px] border border-[#12213D]/7 hover:border-[#087fd1]/30 hover:shadow-[0_8px_24px_-8px_rgba(8,127,209,0.2)] transition-all duration-200"
            >
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#087fd1]/10 flex items-center justify-center text-[#087fd1] shrink-0 group-hover:bg-[#087fd1] group-hover:text-white transition-colors duration-200">
                {t.videoUrl ? <LuPlay size={22} /> : <LuFileText size={22} />}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display font-extrabold text-[#12213D] text-[17px] truncate">
                  {t.title}
                </h3>
                {t.description && (
                  <p className="text-sm text-[#12213D]/45 mt-1 truncate">{t.description}</p>
                )}
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
