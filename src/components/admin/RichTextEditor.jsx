import { useEffect, useRef } from "react";
import { LuBold, LuItalic, LuUnderline } from "react-icons/lu";
import { sanitizeRichText } from "../../utils/sanitizeHtml";

// Contenteditable bo'sh bo'lsa ham brauzer ba'zan "<br>" yoki "<div><br></div>"
// kabi bo'sh teglar qoldirib ketadi — shularni ham "bo'sh" deb hisoblaymiz.
export function isRichTextEmpty(html) {
  if (!html) return true;
  const stripped = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
  return stripped.length === 0;
}

const TOOLS = [
  { command: "bold", label: "Qalin (bold)", Icon: LuBold },
  { command: "italic", label: "Qiya (italic)", Icon: LuItalic },
  { command: "underline", label: "Tagiga chizish (underline)", Icon: LuUnderline },
];

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 84 }) {
  const editorRef = useRef(null);

  // `value` faqat tashqaridan (masalan, forma tozalanganda yoki mavjud
  // savol yuklanganda) o'zgarganda DOMga yoziladi — har bir onInput'da
  // qayta yozib, kursor pozitsiyasini buzib qo'ymaslik uchun.
  // Xavfsizlik: bazadan kelgan HTML ham tozalanadi (bulk import va h.k. orqali
  // kirgan <img onerror=...> kabi skriptlar admin brauzerida ishlamasin).
  useEffect(() => {
    const safe = sanitizeRichText(value || "");
    if (editorRef.current && editorRef.current.innerHTML !== safe) {
      editorRef.current.innerHTML = safe;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runCommand = (command) => (e) => {
    e.preventDefault();
    editorRef.current?.focus();
    document.execCommand(command, false, null);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || "");

  return (
    <div className="rounded-xl border border-[#12213D]/12 overflow-hidden bg-white transition focus-within:border-[#087fd1] focus-within:ring-4 focus-within:ring-[#087fd1]/10">
      <div className="flex items-center gap-1 bg-[#12213D]/[0.03] border-b border-[#12213D]/10 px-2 py-1.5">
        {TOOLS.map(({ command, label, Icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            onMouseDown={runCommand(command)}
            className="p-1.5 rounded-lg text-[#12213D]/60 hover:bg-[#12213D]/8 hover:text-[#12213D] transition"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="richtext-editable w-full px-3 py-2 text-sm outline-none max-h-64 overflow-y-auto leading-relaxed"
      />
    </div>
  );
}
