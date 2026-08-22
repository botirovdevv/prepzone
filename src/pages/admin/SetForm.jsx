import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import QuestionEditor from "../../components/admin/QuestionEditor";
import { RW_DOMAINS, RW_PROMPT_TEMPLATES } from "../../data/rwPromptTemplates";
import { LuArrowLeft, LuInfo } from "react-icons/lu";
import useUnsavedChangesWarning from "../../hooks/useUnsavedChangesWarning";

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
    getDoc(doc(db, "questionSets", id)).then((snap) => {
      if (!snap.exists()) {
        setError("To'plam topilmadi.");
        setLoadingExisting(false);
        return;
      }
      const s = snap.data();
      setTitle(s.title || "");
      setDescription(s.description || "");
      const rw = (s.sections || []).find((sec) => sec.id === "rw");
      const math = (s.sections || []).find((sec) => sec.id === "math");
      setRwQuestions(rw?.questions || []);
      setMathQuestions(math?.questions || []);
      setLoadingExisting(false);
    });
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
      if (isEdit) {
        await updateDoc(doc(db, "questionSets", id), {
          title: title.trim(),
          description: description.trim(),
          sections,
        });
        navigate("/admin/sets");
      } else {
        await addDoc(collection(db, "questionSets"), {
          title: title.trim(),
          description: description.trim(),
          sections,
          createdBy: user.uid,
          createdByName: user.displayName || user.email,
          createdAt: serverTimestamp(),
        });
        navigate("/admin/sets");
      }
    } catch (err) {
      console.error(err);
      setError("Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return <div className="p-10 text-[#12213D]/40">Yuklanmoqda...</div>;
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <button
        onClick={() => {
          if (isDirty && !window.confirm("Saqlanmagan o'zgarishlar bor. Sahifadan chiqsangiz, ular yo'qoladi. Baribir chiqasizmi?")) return;
          navigate("/admin/sets");
        }}
        className="flex items-center gap-1.5 text-sm text-[#12213D]/50 hover:text-[#12213D] mb-6"
      >
        <LuArrowLeft size={16} /> Amaliyot to'plamlari
      </button>

      <h1 className="text-2xl font-extrabold text-[#12213D] mb-1">
        {isEdit ? "To'plamni tahrirlash" : "Yangi amaliyot to'plami"}
      </h1>
      <p className="text-sm text-[#12213D]/50 mb-8">
        Masalan, biror imtihonda (Iyun, Mart, Oktabr) chiqqan savollarni shu yerga joylashtiring.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#12213D]/8 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
              To'plam nomi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Iyun 2024 savollari"
              className="w-full rounded-xl border border-[#12213D]/15 px-4 py-2.5 text-sm outline-none focus:border-[#087fd1]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#12213D]/50 mb-1.5">
              Tavsif (ixtiyoriy)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: 2024-yil iyun oyi imtihonida chiqqan savollar"
              className="w-full rounded-xl border border-[#12213D]/15 px-4 py-2.5 text-sm outline-none focus:border-[#087fd1]"
            />
          </div>
        </div>

        <div className="flex items-start gap-2.5 bg-[#087fd1]/5 border border-[#087fd1]/15 rounded-xl p-4 text-sm text-[#12213D]/70">
          <LuInfo size={17} className="shrink-0 mt-0.5 text-[#087fd1]" />
          <p>
            Bu to'plam <strong>vaqt cheklanmagan</strong> holatda ko'rsatiladi va talaba javob
            belgilashi bilanoq to'g'ri/noto'g'riligini darhol ko'radi — moslashuvchan (Module 1/2)
            tuzilma shart emas.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-[#12213D]">Reading and Writing</h2>
          <QuestionEditor
            title="Savollar"
            questions={rwQuestions}
            onChange={setRwQuestions}
            showPassage
            domainOptions={RW_DOMAINS}
            promptTemplates={RW_PROMPT_TEMPLATES}
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-[#12213D]">Math</h2>
          <QuestionEditor title="Savollar" questions={mathQuestions} onChange={setMathQuestions} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#087fd1] text-white font-semibold py-3.5 rounded-full hover:bg-[#066fb8] disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "To'plamni yaratish"}
        </button>
      </form>
    </div>
  );
}
