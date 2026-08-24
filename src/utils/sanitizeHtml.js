// contentEditable (RichTextEditor) yoki boshqa manbadan kelgan HTML'ni
// faqat xavfsiz, oddiy formatlash teglariga (qalin, kursiv, tagiga
// chizish) qisqartiradi.
//
// MUHIM (xavfsizlik): barcha atributlar (shu jumladan onerror, onclick,
// style, href, src) har doim olib tashlanadi — bu <script>, <img
// onerror=...> va shunga o'xshash skript in'ektsiyasi (XSS)
// hujumlarining oldini butunlay oladi. Bu funksiya HAR SAFAR
// dangerouslySetInnerHTML ishlatilishidan OLDIN chaqirilishi shart —
// manba (admin tahririchi, bulk import yoki eski ma'lumot) qanday
// bo'lishidan qat'i nazar.
const ALLOWED_TAGS = new Set(["B", "STRONG", "I", "EM", "U", "BR", "SPAN", "DIV", "P"]);
const STRIP_ENTIRELY = new Set([
  "SCRIPT",
  "STYLE",
  "IFRAME",
  "OBJECT",
  "EMBED",
  "LINK",
  "META",
  "SVG",
  "IMG",
  "FORM",
]);

export function sanitizeRichText(html) {
  if (!html) return "";
  if (typeof document === "undefined") return "";

  const container = document.createElement("div");
  container.innerHTML = html;

  const walk = (node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) {
        node.removeChild(child);
        continue;
      }

      const tag = child.tagName;

      if (STRIP_ENTIRELY.has(tag)) {
        node.removeChild(child);
        continue;
      }

      // Atributlarni to'liq olib tashlash — onerror/onclick/style/href/src
      // kabi barcha in'ektsiya vektorlarini bitta joyda yopadi.
      Array.from(child.attributes || []).forEach((attr) => child.removeAttribute(attr.name));

      if (!ALLOWED_TAGS.has(tag)) {
        // Ro'yxatda yo'q teg — o'zini olib tashlab, ichidagi matn/bolalarni
        // o'rniga qoldiramiz (kontent yo'qolib ketmasin).
        while (child.firstChild) node.insertBefore(child.firstChild, child);
        node.removeChild(child);
        continue;
      }

      walk(child);
    }
  };

  walk(container);
  return container.innerHTML;
}
