import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import { sanitizeRichText } from "../../utils/sanitizeHtml";
import RichTextEditor, { isRichTextEmpty } from "../../components/admin/RichTextEditor";
import { LuArrowLeft, LuInfo } from "react-icons/lu";
import useUnsavedChangesWarning from "../../hooks/useUnsavedChangesWarning";

function youtubeEmbedUrl(url) {
  if (!url) return "";
  try {
    const u = new URL(url.trim());
    let id = "";
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.searchParams.get("v")) {
      id = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/embed/")) {
      id = u.pathname.replace("/embed/", "");
    }
    return id ? `https://www.youtube.com/embed/${id}` : "";
  } catch {
    return "";
  }
}

export default function DesmosForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [content, setContent] = useState("");

  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const savedSnapshotRef = useRef(null);
  useEffect(() => {
    if (!loadingExisting && savedSnapshotRef.current === null) {
      savedSnapshotRef.current = JSON.stringify({ title, description, videoUrl, order, content });
    }
  }, [loadingExisting, title, description, videoUrl, order, content]);

  const isDirty =
    savedSnapshotRef.current !== null &&
    JSON.stringify({ title, description, videoUrl, order, content }) !== savedSnapshotRef.current;

  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/desmos/${id}`).catch(() => null).then((d) => {
      if (!d) {
        setError("Darslik topilmadi.");
        setLoadingExisting(false);
        return;
      }
      setTitle(d.title || "");
      setDescription(d.description || "");
      setVideoUrl(d.videoUrl || "");
      setOrder(d.order ?? 0);
      setContent(d.content || "");
      setLoadingExisting(false);
    });
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Darslik nomini kiriting.");
      return;
    }
    if (isRichTextEmpty(content) && !videoUrl.trim()) {
      setError("Kamida video havola yoki matnli tushuntirish qo'shing.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      videoUrl: videoUrl.trim(),
      order: Number(order) || 0,
      content: isRichTextEmpty(content) ? "" : sanitizeRichText(content),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/desmos/${id}`, payload);
      } else {
        await api.post("/desmos", payload);
      }
      savedSnapshotRef.current = JSON.stringify({ title, description, videoUrl, order, content });
      navigate("/admin/desmos");
    } catch (err) {
      console.error(err);
      setError(err.message || "Saqlashda xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return <div className="p-10 text-ink/40">Yuklanmoqda...</div>;
  }

  const embedPreview = youtubeEmbedUrl(videoUrl);

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/admin/desmos")}
        className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-ink mb-6"
      >
        <LuArrowLeft size={16} /> Desmos darsliklari
      </button>

      <h1 className="text-2xl font-extrabold text-ink mb-1">
        {isEdit ? "Darslikni tahrirlash" : "Yangi Desmos darsligi"}
      </h1>
      <p className="text-sm text-ink/50 mb-8">
        Talabalarga Desmos'dan qanday foydalanishni tushuntiruvchi qisqa dars — video, matn yoki
        ikkalasi birga.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface rounded-2xl border border-ink/8 p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1.5">
              Darslik nomi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Chiziqli tenglama grafigini chizish"
              className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1.5">
              Qisqa tavsif (ixtiyoriy)
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Masalan: y = mx + b formulasi bilan tanishish"
              className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1.5">
                YouTube video havolasi (ixtiyoriy)
              </label>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1.5">
                Tartib raqami
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full rounded-xl border border-ink/15 px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>
          </div>
          {videoUrl && !embedPreview && (
            <p className="text-xs text-amber-600">
              Bu havola YouTube havolasiga o'xshamayapti — talaba tomonida video ko'rinmasligi
              mumkin.
            </p>
          )}
          {embedPreview && (
            <div className="rounded-xl overflow-hidden border border-ink/10 aspect-video">
              <iframe
                src={embedPreview}
                title="Video ko'rinishi"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 bg-accent/5 border border-accent/15 rounded-xl p-4 text-sm text-ink/70">
          <LuInfo size={17} className="shrink-0 mt-0.5 text-accent" />
          <p>
            Video va matnli tushuntirishni birga ishlatishingiz mumkin — masalan video yuqorida,
            qadam-baqadam yozma ko'rsatma pastda. Matnni qalin/kursiv/tagiga chizib formatlashingiz
            mumkin.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1.5">
            Matnli tushuntirish (ixtiyoriy)
          </label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Qadam-baqadam ko'rsatma yozing..."
            minHeight={180}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent text-white font-semibold py-3.5 rounded-full hover:bg-accent-press disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : isEdit ? "O'zgarishlarni saqlash" : "Darslikni yaratish"}
        </button>
      </form>
    </div>
  );
}
