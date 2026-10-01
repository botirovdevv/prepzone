import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { writeSetIndex } from "../../utils/questionSetIndex";
import { loadSetImages, storeSetImages } from "../../utils/setImages";
import { withUniqueIds } from "../../utils/questionId";
import { useAuth } from "../../context/AuthContext";
import QuestionEditor from "../../components/admin/QuestionEditor";
import { RW_DOMAINS, RW_PROMPT_TEMPLATES } from "../../data/rwPromptTemplates";
import { MATH_DOMAINS } from "../../data/mathDomains";
import { LuArrowLeft, LuInfo, LuLibrary } from "react-icons/lu";
import { Page, PageHeader, Card, CardHeader, Button, Field, inputClass, PageLoader } from "../../components/ui";
import useUnsavedChangesWarning from "../../hooks/useUnsavedChangesWarning";

// Firestore hujjati ≤ 1 MiB; zaxira bilan.
const MAX_SET_BYTES = 900 * 1024;

// Firestore xatosini admin tushunadigan matnga aylantiradi.
function describeFirestoreError(err, prefix) {
  if (err?.code === "permission-denied") {
    return `${prefix}: ruxsat yo'q. Hisobingiz admins ro'yxatida borligini va firestore.rules Firebase Console'da Publish qilinganini tekshiring.`;
  }
  if (err?.code === "invalid-argument" && /exceeds|size|bytes/i.test(err.message || "")) {
    return `${prefix}: to'plam juda katta (Firestore 1 MB chegarasi). Savollarni ikki to'plamga bo'ling.`;
  }
  if (err?.code === "unavailable") {
    return `${prefix}: internet aloqasini tekshiring.`;
  }
  return `${prefix}: ${err?.message || "noma'lum xatolik"}`;
}

export default function SetForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rwQuestions, setRwQuestions] = useState([]);
  const [mathQuestions, setMathQuestions] = useState([]);

  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sahifa ochilganda (yoki mavjud to'plam yuklab bo'linganda) holatning
  // "saqlangan" nusxasini olib qo'yamiz — shu nusxa bilan taqqoslab,
  // hozirgi holatda saqlanmagan o'zgarish bor-yo'qligini bilamiz.
  const savedSnapshotRef = useRef(null);
  useEffect(() => {
    if (!loadingExisting && savedSnapshotRef.current === null) {
      savedSnapshotRef.current = JSON.stringify({ title, description, rwQuestions, mathQuestions });
    }
  }, [loadingExisting, title, description, rwQuestions, mathQuestions]);

  const isDirty =
    savedSnapshotRef.current !== null &&
    JSON.stringify({ title, description, rwQuestions, mathQuestions }) !== savedSnapshotRef.current;

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "questionSets", id));
        if (!snap.exists()) {
          setError("To'plam topilmadi.");
          return;
        }
        const s = snap.data();
        const sections = await loadSetImages(id, s.sections);
        setTitle(s.title || "");
        setDescription(s.description || "");
        const rw = (sections || []).find((sec) => sec.id === "rw");
        const math = (sections || []).find((sec) => sec.id === "math");
        setRwQuestions(withUniqueIds(rw?.questions));
        setMathQuestions(withUniqueIds(math?.questions));
      } catch (err) {
        console.error(err);
        setError(describeFirestoreError(err, "To'plamni yuklab bo'lmadi"));
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("To'plam nomini kiriting.");
      return;
    }
    if (rwQuestions.length === 0 && mathQuestions.length === 0) {
      setError("Kamida bitta bo'limga (Reading&Writing yoki Math) savol qo'shing.");
      return;
    }

    const sections = [];
    if (rwQuestions.length > 0) {
      sections.push({ id: "rw", title: "Reading and Writing", type: "rw", questions: rwQuestions });
    }
    if (mathQuestions.length > 0) {
      sections.push({ id: "math", title: "Math", type: "math", questions: mathQuestions });
    }

    setSaving(true);
    try {
      // Rasmlar alohida saqlanadi, shuning uchun hajmga faqat havolasi kiradi.
      const size = new Blob([
        JSON.stringify(sections, (k, v) => (k === "image" && typeof v === "string" ? "img:xxxxxxxxxxxxxxxxxxxx" : v)),
      ]).size;
      if (size > MAX_SET_BYTES) {
        setError(
          `To'plam juda katta (${Math.round(size / 1024)} KB, chegara ~${Math.round(MAX_SET_BYTES / 1024)} KB). ` +
            "Savollarni ikki to'plamga bo'ling."
        );
        return;
      }

      const setRef = isEdit ? doc(db, "questionSets", id) : doc(collection(db, "questionSets"));
      // Rasmlar alohida hujjatlarga — asosiy hujjat 1 MiB limitdan oshmasin.
      const { sections: stored, removeUnused } = await storeSetImages(setRef.id, sections);

      if (isEdit) {
        await updateDoc(setRef, {
          title: title.trim(),
          description: description.trim(),
          sections: stored,
        });
        const snap = await getDoc(setRef);
        await writeSetIndex(id, {
          title: title.trim(),
          description: description.trim(),
          sections: stored,
          createdAt: snap.data()?.createdAt ?? Timestamp.now(),
        });
      } else {
        await setDoc(setRef, {
          title: title.trim(),
          description: description.trim(),
          sections: stored,
          createdBy: user.uid,
          createdByName: user.displayName || user.email,
          createdAt: serverTimestamp(),
        });
        await writeSetIndex(setRef.id, {
          title: title.trim(),
          description: description.trim(),
          sections: stored,
          createdAt: Timestamp.now(),
        });
      }
      await removeUnused().catch((err) => console.error("Eski rasmlarni o'chirib bo'lmadi:", err));
      savedSnapshotRef.current = JSON.stringify({ title, description, rwQuestions, mathQuestions });
      navigate("/admin/sets");
    } catch (err) {
      console.error(err);
      setError(describeFirestoreError(err, "Saqlashda xatolik yuz berdi"));
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) return <PageLoader />;

  return (
    <Page width="narrow">
      <button
        onClick={() => {
          if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqsangiz, ular yo'qoladi. Baribir chiqasizmi?")) return;
          navigate("/admin/sets");
        }}
        className="mb-5 flex items-center gap-1.5 text-sm font-medium text-[#12213D]/50 transition hover:text-[#12213D]"
      >
        <LuArrowLeft size={16} /> Amaliyot to'plamlari
      </button>

      <PageHeader
        eyebrow="Admin panel"
        icon={LuLibrary}
        title={isEdit ? "To'plamni tahrirlash" : "Yangi amaliyot to'plami"}
        subtitle="Masalan, biror imtihonda (Iyun, Mart, Oktabr) chiqqan savollarni shu yerga joylashtiring."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader title="Asosiy ma'lumotlar" />
          <div className="space-y-5 p-5 sm:p-6">
            <Field label="To'plam nomi">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: Iyun 2024 savollari"
                className={inputClass}
              />
            </Field>
            <Field label="Tavsif (ixtiyoriy)">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masalan: 2024-yil iyun oyi imtihonida chiqqan savollar"
                className={inputClass}
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-start gap-3 rounded-2xl border border-[#087fd1]/15 bg-[#087fd1]/[0.04] p-4 text-sm leading-relaxed text-[#12213D]/70">
          <LuInfo size={18} className="mt-0.5 shrink-0 text-[#087fd1]" />
          <p>
            Bu to'plam <strong>vaqt cheklanmagan</strong> holatda ko'rsatiladi va talaba javob
            belgilashi bilanoq to'g'ri/noto'g'riligini darhol ko'radi — moslashuvchan (Module 1/2)
            tuzilma shart emas.
          </p>
        </div>

        <Card>
          <CardHeader title="Reading and Writing" subtitle="Bo'lim 1" />
          <div className="p-5 sm:p-6">
            <QuestionEditor
              title="Savollar"
              questions={rwQuestions}
              onChange={setRwQuestions}
              showPassage
              domainOptions={RW_DOMAINS}
              promptTemplates={RW_PROMPT_TEMPLATES}
              bankSubject="rw"
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Math" subtitle="Bo'lim 2" />
          <div className="p-5 sm:p-6">
            <QuestionEditor
              title="Savollar"
              questions={mathQuestions}
              onChange={setMathQuestions}
              domainOptions={MATH_DOMAINS}
              bankSubject="math"
            />
          </div>
        </Card>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-[#12213D]/[0.07] bg-white/90 p-3 pl-5 shadow-[0_12px_32px_-12px_rgba(18,33,61,0.3)] backdrop-blur">
          <p className="text-sm text-[#12213D]/50">{isDirty ? "Saqlanmagan o'zgarishlar bor" : "Barcha o'zgarishlar saqlangan"}</p>
          <Button type="submit" disabled={saving}>
            {saving ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "To'plamni yaratish"}
          </Button>
        </div>
      </form>
    </Page>
  );
}
