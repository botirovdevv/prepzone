import { useEffect } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

// ------------------------------------------------------------------
// Foydalanish shartlari, Maxfiylik siyosati va Aloqa sahifalari.
// Matnlar — MVP uchun shablon: e'lon qilishdan oldin o'zingizning
// ma'lumotlaringiz (tashkilot nomi, aloqa manzillari) bilan tekshiring.
// ------------------------------------------------------------------

const CONTACT_EMAIL = "support@prepzone.uz";
const TELEGRAM = "https://t.me/prepzone";
const UPDATED = "2026-yil 29-sentabr";

const PAGES = {
  terms: {
    title: "Foydalanish shartlari",
    sections: [
      [
        "1. Umumiy qoidalar",
        "Prepzone — Digital SAT imtihoniga tayyorlanish uchun onlayn mock testlar platformasi. Saytdan foydalanib, siz ushbu shartlarga rozilik bildirasiz. Shartlarga rozi bo'lmasangiz, platformadan foydalanmang.",
      ],
      [
        "2. Hisob",
        "Ro'yxatdan o'tishda to'g'ri ma'lumot kiriting va parolingizni hech kimga bermang. Hisobingiz orqali amalga oshirilgan barcha harakatlar uchun o'zingiz javobgarsiz. Bitta shaxs uchun bitta hisob.",
      ],
      [
        "3. Testlar va natijalar",
        "Testlar va ballar tayyorgarlik maqsadida beriladi va taxminiy hisoblanadi. Ular College Board tomonidan berilgan rasmiy natija emas va College Board bilan bog'liq emas. SAT® — College Board'ning savdo belgisi.",
      ],
      [
        "4. Halollik qoidalari",
        "Test paytida boshqa oynaga o'tish, skrinshot olish, javoblarni tarqatish, avtomatlashtirilgan vositalar yoki tizimni chetlab o'tishga urinish taqiqlanadi. Qoidabuzarlikda test to'xtatiladi, natija reytingdan chiqariladi va hisob bloklanishi mumkin.",
      ],
      [
        "5. Intellektual mulk",
        "Saytdagi savollar, matnlar, dizayn va dasturiy ta'minot Prepzone'ga tegishli. Ularni ruxsatsiz nusxalash, sotish yoki tarqatish taqiqlanadi.",
      ],
      [
        "6. Javobgarlikni cheklash",
        "Platforma \"boricha\" taqdim etiladi. Texnik uzilishlar, ma'lumot yo'qolishi yoki haqiqiy imtihon natijasi uchun javobgarlik olmaymiz, lekin xizmatni barqaror ishlatish uchun harakat qilamiz.",
      ],
      [
        "7. O'zgarishlar",
        "Shartlar yangilanishi mumkin. Muhim o'zgarishlar haqida saytda xabar beramiz. Yangilangandan keyin foydalanishni davom ettirish — yangi shartlarga rozilik.",
      ],
    ],
  },
  privacy: {
    title: "Maxfiylik siyosati",
    sections: [
      [
        "1. Qanday ma'lumot yig'amiz",
        "Ism, email manzil va (Google orqali kirsangiz) Google hisobingizdagi asosiy profil ma'lumotlari; test javoblaringiz, natijalar va o'quv rejasi sozlamalari; sahifalardan foydalanish statistikasi (qaysi bo'limlar ochilgani). Parolingizni biz ko'rmaymiz — u faqat qaytarib bo'lmaydigan (bcrypt) xesh ko'rinishida saqlanadi.",
      ],
      [
        "2. Ma'lumotdan qanday foydalanamiz",
        "Hisobingizni yuritish, testlarni baholash va natijalarni ko'rsatish, reyting (faqat ism va eng yaxshi ball), platformani yaxshilash va xavfsizlikni ta'minlash uchun. Ma'lumotlaringizni sotmaymiz va reklama uchun uchinchi shaxslarga bermaymiz.",
      ],
      [
        "3. Saqlash va xizmat ko'rsatuvchilar",
        "Ma'lumotlar Prepzone'ning o'z serverida (Oracle Cloud, Frankfurt) shifrlangan HTTPS ulanish orqali saqlanadi va qayta ishlanadi. Tasdiqlash kodlari Resend xizmati orqali emailingizga yuboriladi; Google orqali kirganda Google faqat hisobingizni tasdiqlaydi.",
      ],
      [
        "4. Sizning huquqlaringiz",
        `Ma'lumotlaringizni ko'rish, tuzatish yoki hisobingizni butunlay o'chirishni so'rashingiz mumkin — ${CONTACT_EMAIL} manziliga yozing.`,
      ],
      [
        "5. Cookie va brauzer xotirasi",
        "Kirgan holatingizni saqlash uchun himoyalangan (httpOnly) cookie, test jarayoni va lug'at mashqlari uchun esa brauzer xotirasidan (localStorage) foydalanamiz.",
      ],
    ],
  },
  contact: {
    title: "Aloqa",
    sections: [
      [
        "Savol yoki taklif bormi?",
        "Texnik muammo, testdagi xato yoki hamkorlik bo'yicha biz bilan bog'laning — odatda 1 ish kuni ichida javob beramiz.",
      ],
    ],
    contacts: true,
  },
};

export default function LegalPage({ page }) {
  const data = PAGES[page];

  useEffect(() => {
    document.title = `${data.title} — Prepzone`;
    return () => {
      document.title = "Prepzone — Digital SAT mock testlar";
    };
  }, [data.title]);

  return (
    <AuthLayout
      headerAction={
        <Link
          to="/login"
          className="rounded-full border border-[#111827]/10 bg-white/80 px-5 py-2 text-sm font-semibold transition hover:bg-white hover:shadow-sm"
        >
          Kirish
        </Link>
      }
    >
      <article className="w-full max-w-2xl rounded-3xl border border-[#111827]/[0.08] bg-white/90 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        {!data.contacts && <p className="mt-2 text-xs text-[#566176]">Oxirgi yangilanish: {UPDATED}</p>}
        <div className="mt-8 space-y-6">
          {data.sections.map(([heading, text]) => (
            <section key={heading}>
              <h2 className="text-base font-bold">{heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#374151]">{text}</p>
            </section>
          ))}
        </div>
        {data.contacts && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="rounded-2xl border border-[#111827]/10 p-5 transition hover:border-[#087fd1] hover:bg-[#087fd1]/[0.03]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#566176]">Email</p>
              <p className="mt-1 font-semibold text-[#087fd1]">{CONTACT_EMAIL}</p>
            </a>
            <a
              href={TELEGRAM}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#111827]/10 p-5 transition hover:border-[#087fd1] hover:bg-[#087fd1]/[0.03]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-[#566176]">Telegram</p>
              <p className="mt-1 font-semibold text-[#087fd1]">@prepzone</p>
            </a>
          </div>
        )}
      </article>
    </AuthLayout>
  );
}
