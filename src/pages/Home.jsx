import { useNavigate } from "react-router-dom";
import {
  LuArrowRight,
  LuBookOpenCheck,
  LuHeadphones,
  LuMapPin,
} from "react-icons/lu";
import logo from '../../public/Logo.png'

// Eslatma: bu sahifa faqat login QILMAGAN foydalanuvchilarga ko'rsatiladi.
// Login qilgan foydalanuvchi "/" ga kirsa, App.jsx'dagi RootRoute uni
// avtomatik "/dashboard"ga yo'naltiradi — shuning uchun bu yerda
// user-holatiga oid shart-sharoitlar shart emas.
export default function Home() {
  const navigate = useNavigate();

  const handleSAT = () => navigate("/login");

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfa] text-[#111827] font-['Inter']">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-[#111827]/[0.08] bg-[#fcfcfa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center shrink-0 h-12 overflow-hidden"
          >
            <img
              src={logo}
              alt="Prepzone"
              className="w-36 max-h-full object-contain"
            />
          </button>

          <nav className="hidden items-center gap-8 text-[14px] font-medium text-[#566176] md:flex">
            <button onClick={() => scrollTo("tests")} className="transition hover:text-[#111827]">
              Mock tests
            </button>
            <button onClick={() => scrollTo("features")} className="transition hover:text-[#111827]">
              Platform
            </button>
            <button onClick={() => scrollTo("how")} className="transition hover:text-[#111827]">
              Qanday ishlaydi
            </button>
          </nav>

          <button
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#087fd1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#066fb8]"
          >
            Kirish
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-5 pb-20 pt-20 sm:px-8 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="mb-7 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[#0788d5]">
              <span className="h-2 w-2 rounded-full bg-[#0788d5]" />
              Online mock test platform
            </div>

            <h1 className="max-w-[650px] font-['Inter_Tight'] text-[58px] font-semibold leading-[0.94] tracking-[-0.055em] sm:text-[76px] lg:text-[88px]">
              Test.
              <br />
              Review.
              <br />
              <span className="text-[#0788d5]">Improve.</span>
            </h1>

            <p className="mt-8 max-w-[520px] text-[17px] leading-7 text-[#667085] sm:text-[19px]">
              SAT, IELTS va CEFR Speaking uchun real imtihon formatiga yaqin
              mock testlar. Natijangizni ko‘ring va keyingi qadamni aniq biling.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSAT}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#087fd1] px-7 py-3.5 text-[14px] font-bold text-white transition hover:bg-[#066fb8]"
              >
                SAT mock testni boshlash
                <LuArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                onClick={() => scrollTo("tests")}
                className="inline-flex items-center justify-center rounded-full border border-[#111827]/12 bg-white px-7 py-3.5 text-[14px] font-bold text-[#111827] transition hover:bg-[#f5f6f7]"
              >
                Platformani ko‘rish
              </button>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative lg:pl-4">
            <div className="absolute -inset-8 -z-10 bg-gradient-to-br from-[#0788d5]/10 via-transparent to-[#8fd8ff]/20 blur-3xl" />

            <div className="rotate-[1.2deg] overflow-hidden rounded-[20px] border border-[#cfd7df] bg-white shadow-[0_30px_80px_rgba(24,54,78,0.13)] transition duration-500 hover:rotate-0">
              <div className="flex h-12 items-center justify-between border-b border-[#e7ebef] bg-[#f8fafb] px-5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d8dde2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d8dde2]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d8dde2]" />
                </div>
                <span className="text-[11px] font-semibold text-[#697586]">
                  Prepzone · SAT
                </span>
              </div>

              <div className="grid min-h-[390px] md:grid-cols-[0.92fr_1.08fr]">
                <div className="border-b border-[#e8edf1] p-7 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between text-[11px] text-[#697586]">
                    <span>Section 1, Module 1</span>
                    <span className="font-semibold text-[#111827]">31:23</span>
                  </div>

                  <div className="mt-9">
                    <p className="text-[13px] leading-6 text-[#303a46]">
                      The mihrab (or niche) is one of many features that
                      distinguish mosque architecture and is therefore
                      considered a blank aspect of mosque design.
                    </p>

                    <div className="mt-7 h-px bg-[#e8edf1]" />

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[11px] text-[#9aa4b2]">Question 12 of 27</span>
                      <span className="text-[11px] font-semibold text-[#087fd1]">
                        Reading & Writing
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#fcfdfe] p-7">
                  <p className="text-[13px] font-medium leading-6 text-[#202833]">
                    Which choice completes the text with the most logical and
                    precise word or phrase?
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {[
                      "an unprecedented",
                      "an embellished",
                      "an imposing",
                      "a fundamental",
                    ].map((answer, index) => (
                      <div
                        key={answer}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[12px] ${index === 1
                          ? "border-[#087fd1] bg-[#087fd1]/[0.045] text-[#111827]"
                          : "border-[#e1e6eb] bg-white text-[#657184]"
                          }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${index === 1
                            ? "border-[#087fd1] bg-[#087fd1] text-white"
                            : "border-[#cbd3dc] text-[#697586]"
                            }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        {answer}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-3 hidden rounded-2xl border border-[#dce3e8] bg-white px-5 py-4 shadow-[0_15px_40px_rgba(24,54,78,0.10)] sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#98a2b3]">
                Practice progress
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-2xl font-bold tracking-tight">64%</span>
                <span className="mb-1 text-[11px] font-medium text-[#087fd1]">
                  +12% this week
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-[#111827]/[0.08] bg-white">
        <div className="mx-auto grid max-w-[1280px] divide-y divide-[#111827]/[0.08] px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ["SAT", "Full mock practice", "Reading & Writing + Math"],
            ["IELTS", "Coming soon", "Listening, Reading, Writing & Speaking"],
            ["CEFR", "Coming soon", "Speaking mock practice"],
          ].map(([name, title, text]) => (
            <div key={name} className="flex items-center gap-5 py-6 md:px-8 first:md:pl-0 last:md:pr-0">
              <span className="font-['Inter_Tight'] text-2xl font-bold tracking-tight text-[#111827]">
                {name}
              </span>
              <div>
                <p className="text-[13px] font-semibold">{title}</p>
                <p className="mt-0.5 text-[11px] text-[#8a94a3]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tests */}
      <section id="tests" className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0788d5]">
              Practice engine
            </p>
            <h2 className="mt-4 max-w-[430px] font-['Inter_Tight'] text-4xl font-semibold leading-[1] tracking-[-0.04em] sm:text-5xl">
              Bitta platforma.
              <br />
              Bir nechta imtihon.
            </h2>
            <p className="mt-5 max-w-[390px] text-[15px] leading-6 text-[#6b7280]">
              Qaysi imtihonga tayyorlanayotgan bo‘lsangiz, kerakli formatda
              mashq qiling.
            </p>
          </div>

          <div className="divide-y divide-[#dfe4e8] border-y border-[#dfe4e8]">
            <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0788d5]/10 text-[#0788d5]">
                  <LuBookOpenCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">SAT Mock Test</h3>
                  <p className="mt-1 max-w-[480px] text-sm leading-6 text-[#707b8b]">
                    Reading & Writing va Math. Vaqt chegarasi, modullar va
                    test muhiti bilan.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSAT}
                className="inline-flex items-center gap-2 self-start text-sm font-bold text-[#087fd1] transition hover:text-[#055f9d] sm:self-center"
              >
                Boshlash <LuArrowRight size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111827]/[0.05] text-[#667085]">
                  <LuHeadphones size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#344054]">IELTS</h3>
                    <span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8b95a3]">
                      Soon
                    </span>
                  </div>
                  <p className="mt-1 max-w-[480px] text-sm leading-6 text-[#8b95a3]">
                    Listening, Reading, Writing va Speaking mock testlari.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#111827]/[0.05] text-[#667085]">
                  <LuMapPin size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#344054]">CEFR Speaking</h3>
                    <span className="rounded-full bg-[#f1f3f5] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8b95a3]">
                      Soon
                    </span>
                  </div>
                  <p className="mt-1 max-w-[480px] text-sm leading-6 text-[#8b95a3]">
                    Speaking topshiriqlarini imtihon sharoitiga yaqin formatda mashq qiling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-[#111827]/[0.08] bg-[#f7f8f7]">
        <div className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
          <div className="max-w-[580px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0788d5]">
              Built for practice
            </p>
            <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
              Faqat test ishlamang.
              <br />
              Nima uchun xato qilganingizni biling.
            </h2>
          </div>

          <div className="mt-14 grid border-l border-t border-[#dfe4e8] sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Real format", "Imtihon tuzilmasiga yaqin mock tajribasi."],
              ["02", "Timed practice", "Vaqtni boshqarishni real sharoitda mashq qiling."],
              ["03", "Score tracking", "Har bir urinishdan keyin natijangizni kuzating."],
              ["04", "Test history", "Oldingi urinishlaringizni bitta joyda saqlang."],
            ].map(([number, title, text]) => (
              <div key={number} className="border-b border-r border-[#dfe4e8] bg-white p-7 sm:p-8">
                <span className="text-[11px] font-bold text-[#9aa4b2]">{number}</span>
                <h3 className="mt-12 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#7a8492]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="mx-auto max-w-[1280px] px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#0788d5]">
              How it works
            </p>
            <h2 className="mt-4 font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
              Boshlash oson.
              <br />
              Progress aniq.
            </h2>
          </div>

          <div className="border-t border-[#dfe4e8]">
            {[
              ["01", "Imtihonni tanlang", "SAT mock testdan boshlang yoki keyinchalik IELTS va CEFR Speaking modullarini tanlang."],
              ["02", "Testni ishlang", "Savollarni vaqt chegarasida bajaring va o‘zingizni real imtihon sharoitida sinang."],
              ["03", "Natijani ko‘ring", "Urinish yakunida natijangizni ko‘ring va keyingi tayyorgarlik yo‘nalishini belgilang."],
            ].map(([number, title, text]) => (
              <div key={number} className="grid gap-4 border-b border-[#dfe4e8] py-7 sm:grid-cols-[70px_1fr]">
                <span className="text-sm font-bold text-[#0788d5]">{number}</span>
                <div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#7a8492]">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="overflow-hidden rounded-[28px] bg-[#111827] px-7 py-14 text-white sm:px-12 lg:px-16">
          <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#53b7f5]">
                Start practicing
              </p>
              <h2 className="mt-4 max-w-[680px] font-['Inter_Tight'] text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">
                Keyingi testingizni
                <br />
                bugundan boshlang.
              </h2>
            </div>

            <button
              onClick={handleSAT}
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-bold text-[#111827] transition hover:bg-[#f1f4f6]"
            >
              SAT mock test
              <LuArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111827]/[0.08] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <img src={logo} alt="Prepzone" className="h-7 w-auto object-contain" />
          <p className="text-xs text-[#98a2b3]">
            © {new Date().getFullYear()} Prepzone. Online mock test platform.
          </p>
        </div>
      </footer>
    </div>
  );
}