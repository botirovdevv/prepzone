// Foydalanish shartlari, maxfiylik siyosati, aloqa. {email} — aloqa manzili.
export default {
  uz: {
    legal: {
      updated: "Oxirgi yangilanish: {date}",
      updatedDate: "2026-yil 20-noyabr",
      login: "Kirish",
      footer: {
        terms: "Foydalanish shartlari",
        privacy: "Maxfiylik siyosati",
        contact: "Aloqa",
        rights: "Barcha huquqlar himoyalangan.",
      },
      terms: {
        title: "Foydalanish shartlari",
        sections: [
          ["1. Umumiy qoidalar", "Prepzone — Digital SAT imtihoniga tayyorlanish uchun onlayn mock testlar platformasi. Saytdan foydalanib, siz ushbu shartlarga rozilik bildirasiz. Shartlarga rozi bo'lmasangiz, platformadan foydalanmang."],
          ["2. Hisob", "Ro'yxatdan o'tishda to'g'ri ma'lumot kiriting va parolingizni hech kimga bermang. Hisobingiz orqali amalga oshirilgan barcha harakatlar uchun o'zingiz javobgarsiz. Bitta shaxs uchun bitta hisob."],
          ["3. Testlar va natijalar", "Testlar va ballar tayyorgarlik maqsadida beriladi va taxminiy hisoblanadi. Ular College Board tomonidan berilgan rasmiy natija emas va College Board bilan bog'liq emas. SAT® — College Board'ning savdo belgisi."],
          ["4. Halollik qoidalari", "Test paytida boshqa oynaga o'tish, skrinshot olish, javoblarni tarqatish, avtomatlashtirilgan vositalar yoki tizimni chetlab o'tishga urinish taqiqlanadi. Qoidabuzarlikda test to'xtatiladi, natija reytingdan chiqariladi va hisob bloklanishi mumkin."],
          ["5. Intellektual mulk", "Saytdagi savollar, matnlar, dizayn va dasturiy ta'minot Prepzone'ga tegishli. Ularni ruxsatsiz nusxalash, sotish yoki tarqatish taqiqlanadi."],
          ["6. Javobgarlikni cheklash", "Platforma \"boricha\" taqdim etiladi. Texnik uzilishlar, ma'lumot yo'qolishi yoki haqiqiy imtihon natijasi uchun javobgarlik olmaymiz, lekin xizmatni barqaror ishlatish uchun harakat qilamiz."],
          ["7. O'zgarishlar", "Shartlar yangilanishi mumkin. Muhim o'zgarishlar haqida saytda xabar beramiz. Yangilangandan keyin foydalanishni davom ettirish — yangi shartlarga rozilik."],
          ["8. Yosh chegarasi", "Platforma maktab o'quvchilari uchun ham mo'ljallangan. 16 yoshga to'lmagan bo'lsangiz, ro'yxatdan o'tishdan oldin ota-onangiz yoki vasiyingiz roziligini oling."],
          ["9. Hisobni to'xtatish", "Ushbu shartlar (ayniqsa halollik qoidalari) buzilganda hisobni vaqtincha yoki butunlay bloklashimiz mumkin. Siz esa istalgan vaqtda Sozlamalar sahifasida hisobingizni o'chira olasiz."],
        ],
      },
      privacy: {
        title: "Maxfiylik siyosati",
        sections: [
          ["1. Qanday ma'lumot yig'amiz", "Ism, email manzil va (Google orqali kirsangiz) Google hisobingizdagi asosiy profil ma'lumotlari; test javoblaringiz, natijalar va o'quv rejasi sozlamalari; sahifalardan foydalanish statistikasi (qaysi bo'limlar ochilgani). Parolingizni biz ko'rmaymiz — u faqat qaytarib bo'lmaydigan (bcrypt) xesh ko'rinishida saqlanadi."],
          ["2. Ma'lumotdan qanday foydalanamiz", "Hisobingizni yuritish, testlarni baholash va natijalarni ko'rsatish, reyting (faqat ism va eng yaxshi ball), platformani yaxshilash va xavfsizlikni ta'minlash uchun. Ma'lumotlaringizni sotmaymiz va reklama uchun uchinchi shaxslarga bermaymiz."],
          ["3. Saqlash va xizmat ko'rsatuvchilar", "Ma'lumotlar Prepzone'ning o'z serverida (Oracle Cloud, Frankfurt) shifrlangan HTTPS ulanish orqali saqlanadi va qayta ishlanadi. Tasdiqlash kodlari Resend xizmati orqali emailingizga yuboriladi; Google orqali kirganda Google faqat hisobingizni tasdiqlaydi. AI o'quv rejasini tuzganda mock natijalaringiz, AI tushuntirish so'raganingizda esa savol matni va sizning javobingiz (ismsiz) Google Gemini'ga yuboriladi."],
          ["4. Sizning huquqlaringiz", "Ma'lumotlaringizni ko'rish, tuzatish yoki hisobingizni butunlay o'chirishni so'rashingiz mumkin — {email} manziliga yozing. Hisobingizni Sozlamalar sahifasida o'zingiz ham o'chira olasiz."],
          ["5. Cookie va brauzer xotirasi", "Kirgan holatingizni saqlash uchun himoyalangan (httpOnly) cookie, test jarayoni, til tanlovi va lug'at mashqlari uchun esa brauzer xotirasidan (localStorage) foydalanamiz."],
          ["6. Xavfsizlik ma'lumotlari", "\"Faol seanslar\" ro'yxati va hisobingizni himoya qilish uchun har bir kirishning IP manzili va qurilma/brauzer turi saqlanadi. Tugatilgan seanslar yozuvi taxminan 31 kundan keyin o'chiriladi."],
          ["7. Study Room", "Video va ovoz ikki ishtirokchi o'rtasida to'g'ridan-to'g'ri (P2P) uzatiladi; to'g'ridan-to'g'ri ulanib bo'lmasa, shifrlangan oqim bizning relay serverimiz orqali o'tadi. Qo'ng'iroqlar yozib olinmaydi. Doska chizmalari faqat dars davomida server xotirasida turadi."],
          ["8. Saqlash muddati", "Ma'lumotlar hisobingiz mavjud ekan saqlanadi. Hisob o'chirilganda u bilan bog'liq ma'lumotlar bazadan o'chiriladi; kunlik zaxira nusxalarda ular 14 kungacha qolishi mumkin."],
          ["9. Bolalar", "16 yoshga to'lmagan foydalanuvchilar platformadan ota-ona yoki vasiy roziligi bilan foydalanadi. Ota-ona farzandining ma'lumotlarini ko'rish yoki o'chirishni {email} orqali so'rashi mumkin."],
        ],
      },
      contact: {
        title: "Aloqa",
        sections: [
          ["Savol yoki taklif bormi?", "Texnik muammo, testdagi xato yoki hamkorlik bo'yicha biz bilan bog'laning — odatda 1 ish kuni ichida javob beramiz."],
        ],
      },
    },
  },
  en: {
    legal: {
      updated: "Last updated: {date}",
      updatedDate: "November 20, 2026",
      login: "Log in",
      footer: {
        terms: "Terms of use",
        privacy: "Privacy policy",
        contact: "Contact",
        rights: "All rights reserved.",
      },
      terms: {
        title: "Terms of use",
        sections: [
          ["1. General", "Prepzone is an online mock test platform for preparing for the Digital SAT. By using the site, you agree to these terms. If you don't agree, please don't use the platform."],
          ["2. Account", "Enter accurate information when you sign up and never share your password. You are responsible for everything done through your account. One account per person."],
          ["3. Tests and results", "Tests and scores are provided for preparation and are estimates. They are not official results from College Board and are not affiliated with College Board. SAT® is a trademark of College Board."],
          ["4. Academic honesty", "During a test it is forbidden to switch windows, take screenshots, share answers, use automated tools or try to bypass the system. Violations end the test, remove the result from the leaderboard and may lead to the account being blocked."],
          ["5. Intellectual property", "The questions, texts, design and software on the site belong to Prepzone. Copying, selling or distributing them without permission is forbidden."],
          ["6. Limitation of liability", "The platform is provided \"as is\". We are not liable for technical outages, data loss or real exam results, but we work hard to keep the service running reliably."],
          ["7. Changes", "These terms may be updated. We will announce important changes on the site. Continuing to use the site after an update means you accept the new terms."],
          ["8. Age", "The platform is also meant for school students. If you are under 16, get your parent's or guardian's permission before signing up."],
          ["9. Account suspension", "If these terms (especially the academic honesty rules) are broken, we may block the account temporarily or permanently. You can delete your account at any time on the Settings page."],
        ],
      },
      privacy: {
        title: "Privacy policy",
        sections: [
          ["1. What we collect", "Your name, email address and (if you sign in with Google) basic profile details from your Google account; your test answers, results and study plan settings; page usage statistics (which sections were opened). We never see your password — it is stored only as an irreversible (bcrypt) hash."],
          ["2. How we use it", "To run your account, score tests and show results, for the leaderboard (only your name and best score), to improve the platform and to keep it secure. We don't sell your data or give it to third parties for advertising."],
          ["3. Storage and service providers", "Data is stored and processed on Prepzone's own server (Oracle Cloud, Frankfurt) over encrypted HTTPS. Confirmation codes are emailed through Resend; when you sign in with Google, Google only verifies your account. When an AI study plan is built, your mock results — and when you ask for an AI explanation, the question text and your answer — are sent to Google Gemini (without your name)."],
          ["4. Your rights", "You can ask to see or correct your data, or to delete your account completely — write to {email}. You can also delete your account yourself on the Settings page."],
          ["5. Cookies and browser storage", "We use a protected (httpOnly) cookie to keep you logged in, and browser storage (localStorage) for test progress, your language choice and vocabulary practice."],
          ["6. Security data", "For the \"Active sessions\" list and to protect your account, we store the IP address and device/browser type of each sign-in. Records of ended sessions are deleted after about 31 days."],
          ["7. Study Room", "Video and audio go directly between the two participants (P2P); if a direct connection isn't possible, the encrypted stream is relayed through our server. Calls are not recorded. Whiteboard drawings stay in server memory only during the session."],
          ["8. Retention", "We keep your data while your account exists. When you delete your account, its data is removed from the database; it may remain in daily backups for up to 14 days."],
          ["9. Children", "Users under 16 use the platform with a parent's or guardian's permission. A parent can ask to see or delete their child's data by writing to {email}."],
        ],
      },
      contact: {
        title: "Contact",
        sections: [
          ["Have a question or suggestion?", "Contact us about technical problems, mistakes in tests or partnerships — we usually reply within 1 business day."],
        ],
      },
    },
  },
};
