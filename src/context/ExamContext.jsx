import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

// ------------------------------------------------------------------
// Tanlangan imtihon: "sat" | "ielts" | null (hali tanlanmagan).
// Brauzerda (tez ochilishi uchun) va users/{uid}.exam da (boshqa
// qurilmada ham saqlanishi uchun) yoziladi.
//
// Onboarding so'rovnomasi (ChooseExam) javoblari users/{uid}.onboarding da:
//   { source, sourceOther, exams: ["sat","ielts"], targets: { sat, ielts }, completedAt }
// ------------------------------------------------------------------

export const EXAMS = {
  sat: { id: "sat", label: "SAT", full: "Digital SAT" },
  ielts: { id: "ielts", label: "IELTS", full: "IELTS Academic" },
};

const ExamContext = createContext(null);
const EMPTY_STATE = { exam: null, targets: {}, ready: false };
const key = (uid) => `pz_exam::${uid}`;
const targetsKey = (uid) => `pz_targets::${uid}`;
const syncKey = (uid) => `pz_examSync::${uid}`;
// Keshdagi tanlov bo'lsa, Firestore'dan kuniga ko'pi bilan bir marta yangilanadi
// (har sahifa yangilanishida users/{uid} ni o'qimaslik uchun).
const SYNC_MS = 24 * 60 * 60 * 1000;

function syncedRecently(uid) {
  try {
    return Date.now() - Number(localStorage.getItem(syncKey(uid)) || 0) < SYNC_MS;
  } catch {
    return false;
  }
}

function readLocal(uid) {
  try {
    const v = localStorage.getItem(key(uid));
    return EXAMS[v] ? v : null;
  } catch {
    return null;
  }
}

function readLocalTargets(uid) {
  try {
    const v = JSON.parse(localStorage.getItem(targetsKey(uid)) || "null");
    return v && typeof v === "object" ? v : {};
  } catch {
    return {};
  }
}

function writeLocal(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}

export function ExamProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [state, setState] = useState({ uid: null, exam: null, targets: {}, ready: false });

  useEffect(() => {
    if (!uid) return;
    const local = readLocal(uid);
    const localTargets = readLocalTargets(uid);
    // Keshdagi imtihon bo'lsa darhol ko'rsatamiz, maqsad ballarini esa
    // fonda Firestore'dan yangilab olamiz (boshqa qurilmada kiritilgan bo'lishi mumkin).
    if (local) setState({ uid, exam: local, targets: localTargets, ready: true });
    if (local && syncedRecently(uid)) return;
    let cancelled = false;
    getDoc(doc(db, "users", uid))
      .then((snap) => {
        if (cancelled) return;
        const d = snap.data() || {};
        const remote = EXAMS[d.exam] ? d.exam : null;
        const targets = d.onboarding?.targets || localTargets;
        if (remote) writeLocal(key(uid), remote);
        writeLocal(targetsKey(uid), JSON.stringify(targets));
        writeLocal(syncKey(uid), String(Date.now()));
        setState({ uid, exam: local || remote, targets, ready: true });
      })
      .catch(() => !cancelled && setState({ uid, exam: local, targets: localTargets, ready: true }));
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const setExam = useCallback(
    (exam) => {
      if (!uid || !EXAMS[exam]) return;
      setState((s) => ({ ...s, uid, exam, ready: true }));
      writeLocal(key(uid), exam);
      setDoc(doc(db, "users", uid), { exam }, { merge: true }).catch((err) =>
        console.error("Imtihon tanlovini saqlashda xatolik:", err)
      );
    },
    [uid]
  );

  // So'rovnoma javoblarini bitta yozuv bilan saqlaydi.
  const saveOnboarding = useCallback(
    async ({ source, sourceOther, exams, targets }) => {
      if (!uid) return;
      const exam = exams.includes("sat") ? "sat" : "ielts";
      await setDoc(
        doc(db, "users", uid),
        {
          exam,
          onboarding: {
            source,
            sourceOther: source === "other" ? sourceOther.trim().slice(0, 60) : "",
            exams,
            targets,
            completedAt: serverTimestamp(),
          },
        },
        { merge: true }
      );
      writeLocal(key(uid), exam);
      writeLocal(targetsKey(uid), JSON.stringify(targets));
      setState({ uid, exam, targets, ready: true });
    },
    [uid]
  );

  // Boshqa user bilan kirilganda eski holat ko'rinib qolmasligi uchun.
  const current = state.uid === uid ? state : EMPTY_STATE;
  const value = useMemo(
    () => ({ exam: current.exam, targets: current.targets, ready: !!uid && current.ready, setExam, saveOnboarding }),
    [current, uid, setExam, saveOnboarding]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  return useContext(ExamContext);
}
