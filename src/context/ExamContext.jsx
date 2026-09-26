import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

// ------------------------------------------------------------------
// Tanlangan imtihon: "sat" | "ielts" | null (hali tanlanmagan).
// Brauzerda (tez ochilishi uchun) va users/{uid}.exam da (boshqa
// qurilmada ham saqlanishi uchun) yoziladi.
// ------------------------------------------------------------------

export const EXAMS = {
  sat: { id: "sat", label: "SAT", full: "Digital SAT" },
  ielts: { id: "ielts", label: "IELTS", full: "IELTS Academic" },
};

const ExamContext = createContext(null);
const key = (uid) => `pz_exam::${uid}`;

function readLocal(uid) {
  try {
    const v = localStorage.getItem(key(uid));
    return EXAMS[v] ? v : null;
  } catch {
    return null;
  }
}

export function ExamProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState({ uid: null, exam: null, ready: false });

  useEffect(() => {
    if (!uid) return;
    const local = readLocal(uid);
    if (local) {
      setState({ uid, exam: local, ready: true });
      return;
    }
    let cancelled = false;
    getDoc(doc(db, "users", uid))
      .then((snap) => {
        const remote = snap.data()?.exam;
        if (cancelled) return;
        if (EXAMS[remote]) {
          try {
            localStorage.setItem(key(uid), remote);
          } catch {
            /* ignore */
          }
        }
        setState({ uid, exam: EXAMS[remote] ? remote : null, ready: true });
      })
      .catch(() => !cancelled && setState({ uid, exam: null, ready: true }));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const setExam = useCallback(
    (exam) => {
      if (!uid || !EXAMS[exam]) return;
      setState({ uid, exam, ready: true });
      try {
        localStorage.setItem(key(uid), exam);
      } catch {
        /* ignore */
      }
      setDoc(doc(db, "users", uid), { exam }, { merge: true }).catch((err) =>
        console.error("Imtihon tanlovini saqlashda xatolik:", err)
      );
    },
    [uid]
  );

  // Boshqa user bilan kirilganda eski holat ko'rinib qolmasligi uchun.
  const current = state.uid === uid ? state : { exam: null, ready: false };

  return (
    <ExamContext.Provider value={{ exam: current.exam, ready: !!uid && current.ready, setExam }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  return useContext(ExamContext);
}
