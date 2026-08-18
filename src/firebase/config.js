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
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);
export default app;
