// ------------------------------------------------------------------
// Firebase ilovasi va Auth — bosh sahifa (Home) ham shu yengil qismni
// yuklaydi. Firestore alohida (firebase/config.js) va faqat login
// qilingan sahifalarda yuklanadi — birinchi ochilish tezroq.
//
// Qiymatlar .env dan (VITE_FIREBASE_*), qarang: .env.example.
// Firebase Console -> Authentication -> Sign-in method: Email/Password
// va Google yoqilgan bo'lishi kerak.
// ------------------------------------------------------------------
import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// getAuth() o'rniga: popup/redirect kodi faqat Google bilan kirishda
// (signInWithPopup'ga resolver berilganda) yuklanadi.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

export default app;
