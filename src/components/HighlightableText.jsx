import { useState } from "react";

// Berilgan matnni belgilangan (highlight) oraliqlarga ko'ra bo'lakларга
// ajratadi. ranges: [{start, end}] — bir-biriga kesishmaydigan, tartiblangan.
function buildSegments(text, ranges) {
  if (ranges.length === 0) return [{ text, highlighted: false, start: 0, end: text.length }];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const segments = [];
  let cursor = 0;
  for (const r of sorted) {
    if (r.start > cursor) {
      segments.push({ text: text.slice(cursor, r.start), highlighted: false, start: cursor, end: r.start });
    }
    segments.push({ text: text.slice(r.start, r.end), highlighted: true, start: r.start, end: r.end });
    cursor = r.end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false, start: cursor, end: text.length });
  }
  return segments;
}

// Kesishgan/tegib turgan oraliqlarni birlashtiradi.
function mergeRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) {
      last.end = Math.max(last.end, r.end);
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

export default function HighlightableText({ text, className, as: Tag = "p" }) {
  const [ranges, setRanges] = useState([]);

  const handleMouseUp = (e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === "") return;
    const container = e.currentTarget;
    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;

    // Tanlangan matnning butun matn ichidagi belgi (character) pozitsiyasini topamiz.
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    const start = preRange.toString().length;
    const end = start + range.toString().length;

    selection.removeAllRanges();
    if (end <= start) return;
    setRanges((prev) => mergeRanges([...prev, { start, end }]));
  };

  const removeRange = (start, end) => {
    setRanges((prev) => prev.filter((r) => !(r.start === start && r.end === end)));
  };

  const segments = buildSegments(text, ranges);

  return (
    <Tag className={className} onMouseUp={handleMouseUp}>
      {segments.map((seg, i) =>
        seg.highlighted ? (
          <mark
            key={i}
            onClick={() => removeRange(seg.start, seg.end)}
            className="bg-yellow-200 rounded-sm cursor-pointer"
            title="Belgini olib tashlash uchun bosing"
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </Tag>
  );
}
