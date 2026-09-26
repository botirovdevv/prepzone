// ------------------------------------------------------------------
// Firebase konfiguratsiyasi
// ------------------------------------------------------------------
// Quyidagi qiymatlarni O'ZINGIZNING Firebase loyihangizdan oling:
// Firebase Console -> Project settings -> General -> Your apps -> SDK setup and configuration
//
// Eslatma: Authentication bo'limida "Email/Password" provayderini
// yoqishni unutmang (Firebase Console -> Authentication -> Sign-in method).
// ------------------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// IndexedDB'dagi doimiy kesh: takroriy o'qishlar keshdan beriladi (sahifalar
// tezroq ochiladi, Firestore'ga kamroq so'rov ketadi), bir nechta tab ham
// bitta keshni bo'lishadi. Brauzer IndexedDB'ni qo'llamasa — oddiy rejim.
function createDb() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (err) {
    console.warn("Firestore kesh yoqilmadi, oddiy rejimda ishlaydi:", err);
    return getFirestore(app);
  }
}

export const db = createDb();
export default app;
