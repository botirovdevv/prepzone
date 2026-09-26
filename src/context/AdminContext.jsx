import { createContext, useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

// Admin holati butun ilova uchun BITTA real-time listener orqali kuzatiladi
// (avval har bir komponent — Sidebar, Dashboard, AdminRoute — o'z listener'ini
// ochardi). Qiymat `useIsAdmin()` hook'i orqali o'qiladi.
export const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState({ uid: null, isAdmin: false, checked: false });

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, "admins", uid),
      (snap) => setState({ uid, isAdmin: snap.exists(), checked: true }),
      () => setState({ uid, isAdmin: false, checked: true })
    );
    return unsub;
  }, [uid]);

  const value = !uid
    ? { isAdmin: false, checked: true }
    : state.uid === uid
      ? { isAdmin: state.isAdmin, checked: state.checked }
      : { isAdmin: false, checked: false };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
