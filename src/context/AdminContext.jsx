import { createContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

// Admin holati butun ilova uchun BIR MARTA (login paytida) tekshiriladi —
// admins/{uid} kamdan-kam o'zgaradi, doimiy listener shart emas.
// Qiymat `useIsAdmin()` hook'i orqali o'qiladi. Haqiqiy himoya — firestore.rules.
export const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState({ uid: null, isAdmin: false, checked: false });

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    getDoc(doc(db, "admins", uid))
      .then((snap) => !cancelled && setState({ uid, isAdmin: snap.exists(), checked: true }))
      .catch(() => !cancelled && setState({ uid, isAdmin: false, checked: true }));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const value = useMemo(
    () =>
      !uid
        ? { isAdmin: false, checked: true }
        : state.uid === uid
          ? { isAdmin: state.isAdmin, checked: state.checked }
          : { isAdmin: false, checked: false },
    [uid, state]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
