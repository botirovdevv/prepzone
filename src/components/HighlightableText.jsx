import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useHighlights } from "../context/HighlightsContext";
import { sanitizeRichText } from "../utils/sanitizeHtml";

// Oddiy (rich bo'lmagan) matnni HTML sifatida xavfsiz ko'rsatish uchun
// maxsus belgilarni escape qilamiz. Qatorlar orasidagi bo'shliq CSS
// (`whitespace-pre-line`) orqali saqlanadi, shuning uchun "\n" ni
// o'zgartirishning hojati yo'q.
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Talaba matnni sichqoncha bilan belgilab, "highlight" qila oladigan
 * komponent. `rich` true bo'lsa, `text` allaqachon (admin panelida
 * tayyorlangan, bold/italic/underline kabi teglarni o'z ichiga olishi
 * mumkin bo'lgan) xavfsiz HTML deb qabul qilinadi va o'zgarishsiz
 * ko'rsatiladi. Aks holda oddiy matn deb hisoblab escape qilinadi.
 *
 * Belgilash to'g'ridan-to'g'ri DOM ustida ishlaydi (character-offset
 * hisoblash o'rniga), shuning uchun ichida HTML formatlash (qalin,
 * tagiga chizish) bo'lgan taqdirda ham to'g'ri ishlaydi.
 *
 * `highlightKey` va `highlightLabel` berilsa (odatda savol ID'siga
 * bog'liq holda), belgilashlar HighlightsContext orqali saqlanadi —
 * shunda savoldan-savolga o'tib qaytilganda ham belgilashlar saqlanib
 * qoladi, va "Highlights & Notes" paneli ularni ko'rsata oladi.
 */
function HighlightableText({
  text,
  className,
  rich = false,
  as: Tag = "div",
  highlightKey,
  highlightLabel,
}) {
  const containerRef = useRef(null);
  const highlights = useHighlights();
  const baseHtml = useMemo(() => (rich ? sanitizeRichText(text || "") : escapeHtml(text || "")), [rich, text]);
  const persisted = highlightKey ? highlights?.getHtml(highlightKey) : null;
  const [html, setHtml] = useState(persisted ?? baseHtml);

  // Savol/passage almashganda (masalan, keyingi savolga o'tilganda) shu
  // maydon uchun avval saqlangan belgilash bo'lsa o'shani tiklaymiz,
  // bo'lmasa asl matnni qayta o'rnatamiz.
  useEffect(() => {
    const stored = highlightKey ? highlights?.getHtml(highlightKey) : null;
    setHtml(stored ?? baseHtml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, rich, highlightKey]);

  const persistHtml = (newHtml) => {
    setHtml(newHtml);
    if (highlightKey && highlights) {
      highlights.setHtml(highlightKey, highlightLabel || highlightKey, newHtml);
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === "") return;
    const container = containerRef.current;
    const range = selection.getRangeAt(0);
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    const mark = document.createElement("mark");
    mark.className = "bg-yellow-200 rounded-sm cursor-pointer";
    mark.title = "Belgini olib tashlash uchun bosing";
    try {
      range.surroundContents(mark);
    } catch {
      // Tanlangan qism bir nechta elementning chegarasidan o'tib ketsa
      // (masalan, qalin matnning yarmi tanlansa), surroundContents
      // ishlamaydi — bunday holda tanlangan qismni ajratib olib,
      // <mark> ichiga joylashtiramiz.
      const fragment = range.extractContents();
      mark.appendChild(fragment);
      range.insertNode(mark);
    }
    selection.removeAllRanges();
    persistHtml(container.innerHTML);
  };

  const handleClick = (e) => {
    const mark = e.target.closest("mark");
    if (!mark || !containerRef.current?.contains(mark)) return;
    const parent = mark.parentNode;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
    persistHtml(containerRef.current.innerHTML);
  };

  return (
    <Tag
      ref={containerRef}
      className={className}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// memo: taymer yoki boshqa holat o'zgarganda props o'zgarmasa qayta render qilinmaydi.
export default memo(HighlightableText);
