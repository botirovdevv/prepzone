import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

// Amaliyot to'plamlarining yengil ro'yxati: questionSetIndex/{id}.
// PracticeIndex butun to'plamlarni (barcha savollari bilan) yuklamasligi
// uchun — faqat nom, tavsif va savollar soni.
export const countSetQuestions = (sections) =>
  (sections || []).reduce((sum, sec) => sum + (sec.questions?.length || 0), 0);

export function writeSetIndex(id, { title, description, sections, createdAt }) {
  return setDoc(doc(db, "questionSetIndex", id), {
    title,
    description: description || "",
    questionCount: countSetQuestions(sections),
    createdAt: createdAt ?? null,
  });
}

export const deleteSetIndex = (id) => deleteDoc(doc(db, "questionSetIndex", id));
