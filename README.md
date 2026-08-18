# Universal Mock Platform — SAT (Bluebook uslubida)

React + Vite + Tailwind CSS asosida qurilgan, Bluebook (real SAT) interfeysiga
o'xshatilgan mock test platformasi. Hozirgi versiyada faqat **SAT** ishlaydi,
**IELTS** bo'limi "Tez orada" holatida turibdi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching.

## Firebase sozlash (MUHIM)

Login/Register ishlashi uchun o'z Firebase loyihangizni ulashingiz kerak:

1. https://console.firebase.google.com dan yangi loyiha yarating.
2. **Build → Authentication → Sign-in method** bo'limida **Email/Password**
   provayderini yoqing.
3. **Project settings → General → Your apps → Web app (</>)** orqali yangi
   web-app qo'shing va sizga beriladigan konfiguratsiya obyektini oling.
4. `src/firebase/config.js` faylidagi `firebaseConfig` obyektidagi
   qiymatlarni o'zingiznikiga almashtiring.

Shundan so'ng ro'yxatdan o'tish/kirish to'liq ishlaydi.

## Loyiha tuzilishi

```
src/
  firebase/config.js       -> Firebase init (o'zingiznikini kiriting)
  context/AuthContext.jsx  -> Login/Register/Logout logikasi
  data/satTest.js          -> Namunaviy SAT savollari (Reading&Writing + Math)
  components/
    TestHeader.jsx         -> Yuqori panel (taymer, "Hide", "Directions" va h.k.)
    QuestionPanel.jsx      -> Matn (passage) + savol + ABCD javoblar
    BottomNav.jsx          -> Pastki panel, "Question X of Y", Back/Next
    QuestionNav.jsx        -> "Question X of Y" bosilganda chiqadigan panel
    DesmosCalculator.jsx   -> Math modulida ochiladigan Desmos kalkulyatori
    ProtectedRoute.jsx     -> Login qilinmagan foydalanuvchini yo'naltiradi
  pages/
    Home.jsx               -> Hero sahifa, SAT/IELTS tanlash
    Login.jsx / Register.jsx -> Firebase autentifikatsiya sahifalari
    SATTest.jsx             -> Asosiy test interfeysi (Bluebook sahifasi)
```

## Hozirgi imkoniyatlar

- Email/parol bilan ro'yxatdan o'tish va kirish (Firebase Auth)
- Hero sahifa: SAT / IELTS tanlash (IELTS hozircha yopiq)
- Bluebook uslubidagi test interfeysi:
  - Savollar orasida navigatsiya (Next / Back)
  - "Question X of Y" panelidan istalgan savolga o'tish
  - Javobni belgilash — tanlangan javob ko'k rang bilan ajratiladi
  - "Mark for Review" — savolni keyinroq qaytib ko'rish uchun belgilash
  - "ABC" tugmasi — noto'g'ri variantlarni chizib tashlash (eliminator)
  - Har bir modul uchun sanoqli taymer
  - Math modulida Desmos grafik kalkulyatori (ochish/yopish/surish mumkin)
- Bir nechta modul (Section 1 Module 1/2 — Reading&Writing,
  Section 2 Module 1/2 — Math) ketma-ket ishlaydi

## Keyingi bosqichlar (hali qilinmagan)

- Natijalarni hisoblash va ball chiqarish funksiyasi
- IELTS mock moduli
- Savollarni admin panel orqali qo'shish/tahrirlash (hozircha `src/data/satTest.js` faylida qo'lda tahrirlanadi)
- Foydalanuvchi natijalarini Firestore'ga saqlash

## Build

```bash
npm run build
```

`dist/` papkasida tayyor production build hosil bo'ladi.
