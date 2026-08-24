import { LuX } from "react-icons/lu";

// Rasmiy digital SAT Math bo'limida taqdim etiladigan "Reference"
// varag'idagi formulalar (o'zgarmas, hamma testda bir xil).
const SHAPES = [
  { label: "Doira", lines: ["A = πr²", "C = 2πr"], note: "π taxminan 3.14159" },
  { label: "To'g'ri to'rtburchak", lines: ["A = lw"] },
  { label: "Uchburchak", lines: ["A = ½bh"] },
  { label: "Trapetsiya", lines: ["A = ½(b₁ + b₂)h"] },
];

const SOLIDS = [
  { label: "To'g'ri burchakli parallelepiped", lines: ["V = lwh"] },
  { label: "Silindr", lines: ["V = πr²h"] },
  { label: "Konus", lines: ["V = ⅓πr²h"] },
  { label: "Shar", lines: ["V = 4/3 πr³"] },
  { label: "Piramida", lines: ["V = ⅓lwh"] },
];

const FACTS = [
  "Uchburchak burchaklari yig'indisi = 180°",
  "To'g'ri chiziqdagi burchaklar yig'indisi = 180°",
  "Doiradagi darajalar soni = 360°, radianlarda = 2π",
  "Pifagor teoremasi: a² + b² = c²",
  "n ta tomonli ko'pburchak ichki burchaklari yig'indisi = (n − 2) × 180°",
];

const SPECIAL_TRIANGLES = [
  { label: "30°–60°–90°", desc: "tomonlar nisbati: x, x√3, 2x" },
  { label: "45°–45°–90°", desc: "tomonlar nisbati: x, x, x√2" },
];

export default function MathReferenceSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-base font-bold text-gray-800">Reference</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <LuX size={20} />
          </button>
        </div>

        <div className="p-5 grid sm:grid-cols-2 gap-4">
          {[...SHAPES, ...SOLIDS].map((item) => (
            <div key={item.label} className="border border-gray-200 rounded-xl p-3.5">
              <p className="text-xs font-bold text-gray-500 mb-1.5">{item.label}</p>
              {item.lines.map((l) => (
                <p key={l} className="font-mono text-[15px] text-gray-900">
                  {l}
                </p>
              ))}
              {item.note && <p className="text-[11px] text-gray-400 mt-1">{item.note}</p>}
            </div>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-xl p-3.5 mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2">Maxsus to'g'ri burchakli uchburchaklar</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {SPECIAL_TRIANGLES.map((t) => (
                <div key={t.label}>
                  <p className="font-mono text-sm text-gray-900">{t.label}</p>
                  <p className="text-[11px] text-gray-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-3.5">
            <p className="text-xs font-bold text-gray-500 mb-2">Boshqa qoidalar</p>
            <ul className="space-y-1.5">
              {FACTS.map((f) => (
                <li key={f} className="text-sm text-gray-800 flex items-start gap-2">
                  <span className="text-gray-300 mt-0.5">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
