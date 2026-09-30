// ------------------------------------------------------------------
// Firestore — faqat login qilingan sahifalar (lazy chunk'lar) import qiladi.
// App va Auth: firebase/app.js.
// ------------------------------------------------------------------
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import app, { auth } from "./app";

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
export { auth };
export default app;
