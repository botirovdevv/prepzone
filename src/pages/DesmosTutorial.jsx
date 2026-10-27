import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { sanitizeRichText } from "../utils/sanitizeHtml";
import { LuArrowLeft, LuCalculator } from "react-icons/lu";

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

export default function DesmosTutorial() {
  const { id } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api
      .get(`/desmos/${id}`)
      .then(setTutorial)
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#12213D]/40">
        Yuklanmoqda...
      </div>
    );
  }

  if (missing || !tutorial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-[#12213D]/50">
        <p>Bu darslik topilmadi.</p>
        <Link to="/desmos" className="text-[#087fd1] font-semibold">
          Barcha darsliklar
        </Link>
      </div>
    );
  }

  const embedUrl = youtubeEmbedUrl(tutorial.videoUrl);
  const safeContent = tutorial.content ? sanitizeRichText(tutorial.content) : "";

  return (
    <div className="px-5 sm:px-8 py-8 max-w-3xl mx-auto">
      <Link
        to="/desmos"
        className="flex items-center gap-1.5 text-sm text-[#12213D]/50 hover:text-[#12213D] mb-6"
      >
        <LuArrowLeft size={16} /> Barcha darsliklar
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#087fd1]/10 text-[#087fd1] flex items-center justify-center shrink-0">
          <LuCalculator size={19} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-[#12213D]">{tutorial.title}</h1>
      </div>
      {tutorial.description && (
        <p className="text-[#12213D]/55 mb-6">{tutorial.description}</p>
      )}

      {embedUrl && (
        <div className="rounded-2xl overflow-hidden border border-[#12213D]/8 aspect-video mb-6 shadow-sm">
          <iframe src={embedUrl} title={tutorial.title} className="w-full h-full" allowFullScreen />
        </div>
      )}

      {safeContent && (
        <div
          className="bg-white rounded-2xl border border-[#12213D]/7 p-6 text-[15px] leading-relaxed text-[#12213D]/85 [&_strong]:font-bold [&_u]:underline [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      )}
    </div>
  );
}
