// Study Plan eslatmalari (components/StudyPlanNudge.jsx) — o'ng tepada chiqadi.
// Uch holat: behind — kechqurun bo'ldi, bugun hali hech narsa yo'q;
// missed — kecha butunlay o'tkazib yuborildi; almost — boshlangan, tugamagan.
// Ohang: kulgili, lekin uyaltirmaydi — har birida kichik, aniq qadam bor.
export default {
  uz: {
    nudge: {
      open: "Rejani ochish",
      later: "Keyinroq",
      behind: [
        { title: "Rejangiz yolg'iz qoldi 🥲", text: "Bugungi vazifalar sizni kutib, choyi ham sovib qoldi. 10 daqiqa ajratsangiz — ular ham, siz ham xursand." },
        { title: "SAT kutmaydi, biz esa kutyapmiz 👀", text: "Bugun hali bitta ham vazifa belgilanmadi. Eng kichigidan boshlang — lug'at atigi 10 daqiqa." },
        { title: "Telefon charchadi, miya zerikdi 📱", text: "Scroll'ni 15 daqiqaga to'xtatib, bugungi rejadan bittasini bajaring. Kelishdikmi?" },
        { title: "Ertangi siz rahmat aytadi 🙏", text: "Bugungi bitta vazifa — kelajakdagi 1500+ uchun kichik, lekin foydali investitsiya." },
        { title: "Kalkulyator ham sizni sog'indi 🧮", text: "Bugungi mashq hali ochilmadi. Bir-ikki savol yechib, miyani isitib oling." },
        { title: "Hali kech emas ⏰", text: "Kun tugashiga vaqt bor. Eng qisqa vazifadan boshlang — qolgani o'zi ergashib keladi." },
      ],
      missed: [
        { title: "Kecha reja dam oldi. Bugun-chi? 😴", text: "Hech gap yo'q, hamma ham bir kun to'xtaydi. Muhimi — bugun qaytib kelish." },
        { title: "Streak yig'lab o'tiribdi 😢", text: "Kecha bitta ham vazifa bajarilmadi. Bugun bittasini belgilang — u yana jilmayadi." },
        { title: "Kechagi vazifalar sizni qidiryapti 🔍", text: "Ularni qaytarib bo'lmaydi, lekin bugungi reja tayyor. 20 daqiqa yetarli." },
        { title: "Imtihon sanasi joyidan qimirlamadi 📅", text: "Kecha o'tib ketdi, imtihon esa yaqinlashishda davom etyapti. Bugun bir qadam oldinga!" },
        { title: "Dam olish yaxshi, lekin rejada yo'q edi 😅", text: "Bugun qaytib keling — Study Plan xafa emas, faqat sal norozi." },
      ],
      almost: [
        { title: "Deyarli tayyor! 🏁", text: "Bugungi rejadan ozgina qoldi. Oxirgi vazifani yopsangiz, kun mukammal yakunlanadi." },
        { title: "Marra ko'rinib turibdi 👟", text: "Bir-ikki vazifa qoldi xolos. Hozir to'xtash — marafonni 41-kilometrda tashlash degani." },
        { title: "Yarmi tayyor, yarmi kutyapti 🍕", text: "Pitsaning yarmini tashlab ketmaysiz-ku? Qolgan vazifalarni ham tugatib qo'ying." },
        { title: "Zo'r ketyapsiz, lekin hali tugamadi 💪", text: "Bugun yaxshi boshladingiz. Oxirigacha yetkazsangiz, streak yana bittaga oshadi." },
      ],
    },
  },
  en: {
    nudge: {
      open: "Open my plan",
      later: "Later",
      behind: [
        { title: "Your plan feels lonely 🥲", text: "Today's tasks have been waiting so long their tea went cold. Give them 10 minutes — you'll both feel better." },
        { title: "The SAT won't wait, but we will 👀", text: "Nothing's checked off yet today. Start with the smallest one — vocabulary is just 10 minutes." },
        { title: "Your phone is tired, your brain is bored 📱", text: "Pause the scrolling for 15 minutes and knock out one task from today's plan. Deal?" },
        { title: "Future you says thanks 🙏", text: "One task today is a small but solid investment in that 1500+." },
        { title: "Even the calculator misses you 🧮", text: "Today's practice hasn't been opened yet. Solve a couple of questions to warm up." },
        { title: "It's not too late ⏰", text: "There's still time today. Start with the shortest task — the rest tends to follow." },
      ],
      missed: [
        { title: "Your plan took yesterday off. Today? 😴", text: "No big deal — everyone pauses sometimes. What matters is coming back today." },
        { title: "Your streak is crying 😢", text: "Nothing got done yesterday. Check off one task today and it'll smile again." },
        { title: "Yesterday's tasks are looking for you 🔍", text: "We can't bring them back, but today's plan is ready. 20 minutes is enough." },
        { title: "The exam date didn't move 📅", text: "Yesterday slipped by, but the exam keeps getting closer. One step forward today!" },
        { title: "Rest is great, but it wasn't in the plan 😅", text: "Come back today — Study Plan isn't upset, just a little disappointed." },
      ],
      almost: [
        { title: "Almost there! 🏁", text: "Just a bit of today's plan is left. Close the last task and the day is perfect." },
        { title: "The finish line is in sight 👟", text: "Only a task or two left. Stopping now is like quitting a marathon at mile 25." },
        { title: "Half done, half waiting 🍕", text: "You wouldn't leave half a pizza, right? Finish the remaining tasks too." },
        { title: "You're doing great — not done yet 💪", text: "Great start today. Finish it off and your streak goes up by one." },
      ],
    },
  },
};
