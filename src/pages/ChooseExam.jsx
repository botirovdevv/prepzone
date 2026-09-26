import { useNavigate } from "react-router-dom";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { useExam } from "../context/ExamContext";

const logo = "/Logo.png";

const OPTIONS = [
  {
    id: "sat",
    badge: "SAT",
    badgeClass: "bg-[#087fd1] text-white",
    title: "Digital SAT",
    text: "Bluebook formatidagi adaptiv mock testlar, 400–1600 ball, Desmos kalkulyatori.",
    points: ["To'liq adaptiv mock testlar", "Mavzular bo'yicha tahlil", "Study Plan va reyting"],
  },
  {
    id: "ielts",
    badge: "IELTS",
    badgeClass: "bg-[#e4002b] text-white",
    title: "IELTS Academic",
    text: "IELTS on Computer interfeysidagi Listening, Reading va Writing mock testlari, band 0–9.",
    points: ["CD IELTS uslubidagi interfeys", "Listening, Reading avtomatik baholanadi", "Writing — 4 mezon bo'yicha taxminiy baho"],
  },
];

export default function ChooseExam() {
  const { user } = useAuth();
  const { exam, setExam } = useExam();
  const navigate = useNavigate();
  const name = user?.displayName || user?.email?.split("@")[0] || "";

  const choose = (id) => {
    setExam(id);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] px-5 py-10">
      <div className="mx-auto max-w-4xl">
        <img src={logo} alt="Prepzone" className="h-8 w-auto" />
        <h1 className="mt-10 font-display text-[30px] font-extrabold tracking-[-0.02em] text-[#12213D] sm:text-[38px]">
          {name ? `${name}, qaysi imtihonga tayyorlanyapsiz?` : "Qaysi imtihonga tayyorlanyapsiz?"}
        </h1>
        <p className="mt-2 text-[15px] text-[#12213D]/55">
          Tanlovingizga qarab dashboard, testlar va statistika moslashadi. Keyin sidebar'dan istalgan payt almashtirishingiz mumkin.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => choose(o.id)}
              className={`group rounded-3xl border bg-white p-7 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(18,33,61,0.35)] ${
                exam === o.id ? "border-[#087fd1] ring-4 ring-[#087fd1]/10" : "border-[#12213D]/[0.08]"
              }`}
            >
              <span className={`inline-block rounded-lg px-2.5 py-1 font-display text-[14px] font-black tracking-wide ${o.badgeClass}`}>
                {o.badge}
              </span>
              <h2 className="mt-5 font-display text-[22px] font-extrabold text-[#12213D]">{o.title}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#12213D]/55">{o.text}</p>
              <ul className="mt-5 space-y-2">
                {o.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[14px] text-[#12213D]/80">
                    <LuCheck size={16} className="shrink-0 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
              <span className="mt-7 inline-flex items-center gap-2 text-[14px] font-bold text-[#087fd1]">
                Boshlash <LuArrowRight size={16} className="transition group-hover:translate-x-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
