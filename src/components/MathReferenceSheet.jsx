import { LuSigma } from "react-icons/lu";
import FloatingPanel from "./FloatingPanel";

// Digital SAT Math bo'limidagi "Reference" varag'i: rasmiy varaqdagi
// shakllar va formulalar, chizmalari shu yerda SVG'da qayta chizilgan
// (tashqi rasm fayli kerak emas, har qanday o'lchamda tiniq).

const S = { fill: "none", stroke: "#111827", strokeWidth: 1.6, strokeLinejoin: "round" };
const DASH = { ...S, strokeDasharray: "4 3" };
const VAR = { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: 15, fill: "#111827" };
const FORMULA = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 16, fill: "#111827", textAnchor: "middle" };
const SMALL = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 12, fill: "#111827" };

function RightAngle({ x, y, dx = 8, dy = -8 }) {
  return <path d={`M${x + dx} ${y} V${y + dy} H${x}`} {...S} strokeWidth={1.2} />;
}

function Formula({ x, y, children }) {
  return (
    <text x={x} y={y} {...FORMULA}>
      {children}
    </text>
  );
}

function ReferenceFigure() {
  return (
    <svg
      viewBox="0 0 760 480"
      role="img"
      aria-label="SAT math reference sheet: area and volume formulas, Pythagorean theorem, special right triangles, and angle facts"
      className="block h-auto w-full"
    >
      {/* ---------- 1-qator: tekis shakllar ---------- */}
      {/* Doira */}
      <circle cx="65" cy="82" r="44" {...S} />
      <circle cx="65" cy="82" r="2.2" fill="#111827" />
      <line x1="65" y1="82" x2="109" y2="82" {...S} />
      <text x="83" y="76" {...VAR}>r</text>
      <Formula x={65} y={162}>
        A = π<tspan fontStyle="italic">r</tspan>²
      </Formula>
      <Formula x={65} y={184}>
        C = 2π<tspan fontStyle="italic">r</tspan>
      </Formula>

      {/* To'g'ri to'rtburchak */}
      <rect x="142" y="52" width="96" height="62" {...S} />
      <text x="186" y="132" {...VAR}>ℓ</text>
      <text x="245" y="88" {...VAR}>w</text>
      <Formula x={190} y={162}>
        A = <tspan fontStyle="italic">ℓw</tspan>
      </Formula>

      {/* Uchburchak */}
      <path d="M266 120 L366 120 L302 46 Z" {...S} />
      <line x1="302" y1="46" x2="302" y2="120" {...DASH} />
      <RightAngle x={302} y={120} />
      <text x="307" y="90" {...VAR}>h</text>
      <text x="326" y="138" {...VAR}>b</text>
      <Formula x={316} y={162}>
        A = ½<tspan fontStyle="italic">bh</tspan>
      </Formula>

      {/* To'g'ri burchakli uchburchak (Pifagor) */}
      <path d="M402 120 L482 120 L402 46 Z" {...S} />
      <RightAngle x={402} y={120} />
      <text x="388" y="88" {...VAR}>a</text>
      <text x="438" y="138" {...VAR}>b</text>
      <text x="448" y="78" {...VAR}>c</text>
      <Formula x={442} y={162}>
        <tspan fontStyle="italic">c</tspan>² = <tspan fontStyle="italic">a</tspan>² + <tspan fontStyle="italic">b</tspan>²
      </Formula>

      {/* 30°-60°-90° (qisqa katet x, uzun katet x√3, gipotenuza 2x) */}
      <path d="M505 128 L616 128 L505 64 Z" {...S} />
      <RightAngle x={505} y={128} />
      <text x="491" y="101" {...VAR}>x</text>
      <text x="544" y="147" {...VAR}>
        x<tspan fontStyle="normal">√3</tspan>
      </text>
      <text x="566" y="88" {...VAR}>2x</text>
      <text x="509" y="84" {...SMALL}>60°</text>
      <text x="580" y="123" {...SMALL}>30°</text>

      {/* 45°-45°-90° */}
      <path d="M648 128 L712 128 L648 64 Z" {...S} />
      <RightAngle x={648} y={128} />
      <text x="635" y="101" {...VAR}>s</text>
      <text x="676" y="147" {...VAR}>s</text>
      <text x="684" y="90" {...VAR}>
        s<tspan fontStyle="normal">√2</tspan>
      </text>
      <text x="652" y="84" {...SMALL}>45°</text>
      <text x="684" y="123" {...SMALL}>45°</text>
      <text x="608" y="172" {...FORMULA} fontSize={13}>
        Special Right Triangles
      </text>

      {/* ---------- 2-qator: jismlar ---------- */}
      {/* To'g'ri burchakli quti */}
      <path d="M36 280 H106 V330 H36 Z" {...S} />
      <path d="M36 280 L61 260 H131 L106 280 M131 260 V310 L106 330" {...S} />
      <path d="M61 260 V310 H131 M61 310 L36 330" {...DASH} />
      <text x="68" y="348" {...VAR}>ℓ</text>
      <text x="121" y="328" {...VAR}>w</text>
      <text x="137" y="290" {...VAR}>h</text>
      <Formula x={84} y={384}>
        V = <tspan fontStyle="italic">ℓwh</tspan>
      </Formula>

      {/* Silindr */}
      <ellipse cx="228" cy="258" rx="40" ry="11" {...S} />
      <line x1="188" y1="258" x2="188" y2="326" {...S} />
      <line x1="268" y1="258" x2="268" y2="326" {...S} />
      <path d="M188 326 A40 11 0 0 0 268 326" {...S} />
      <path d="M188 326 A40 11 0 0 1 268 326" {...DASH} />
      <line x1="228" y1="258" x2="268" y2="258" {...S} />
      <circle cx="228" cy="258" r="2" fill="#111827" />
      <text x="244" y="253" {...VAR}>r</text>
      <text x="275" y="296" {...VAR}>h</text>
      <Formula x={228} y={384}>
        V = π<tspan fontStyle="italic">r</tspan>²
        <tspan fontStyle="italic">h</tspan>
      </Formula>

      {/* Shar */}
      <circle cx="380" cy="292" r="42" {...S} />
      <path d="M338 292 A42 11 0 0 0 422 292" {...S} />
      <path d="M338 292 A42 11 0 0 1 422 292" {...DASH} />
      <line x1="380" y1="292" x2="422" y2="292" {...S} />
      <circle cx="380" cy="292" r="2" fill="#111827" />
      <text x="398" y="286" {...VAR}>r</text>
      <Formula x={380} y={384}>
        V = ⁴⁄₃π<tspan fontStyle="italic">r</tspan>³
      </Formula>

      {/* Konus */}
      <path d="M492 326 L532 248 L572 326" {...S} />
      <path d="M492 326 A40 11 0 0 0 572 326" {...S} />
      <path d="M492 326 A40 11 0 0 1 572 326" {...DASH} />
      <line x1="532" y1="248" x2="532" y2="326" {...DASH} />
      <line x1="532" y1="326" x2="572" y2="326" {...S} />
      <RightAngle x={532} y={326} />
      <text x="537" y="292" {...VAR}>h</text>
      <text x="550" y="320" {...VAR}>r</text>
      <Formula x={532} y={384}>
        V = ⅓π<tspan fontStyle="italic">r</tspan>²
        <tspan fontStyle="italic">h</tspan>
      </Formula>

      {/* Piramida */}
      <path d="M644 330 H704 L729 310 M644 330 L686 246 L704 330 M686 246 L729 310" {...S} />
      <path d="M644 330 L669 310 H729 M669 310 L686 246" {...DASH} />
      <line x1="686" y1="246" x2="686" y2="320" {...DASH} />
      <text x="670" y="348" {...VAR}>ℓ</text>
      <text x="722" y="330" {...VAR}>w</text>
      <text x="690" y="290" {...VAR}>h</text>
      <Formula x={686} y={384}>
        V = ⅓<tspan fontStyle="italic">ℓwh</tspan>
      </Formula>

      {/* ---------- Qoidalar ---------- */}
      <g fontFamily="Georgia, 'Times New Roman', serif" fontSize="14.5" fill="#111827">
        <text x="20" y="424">The number of degrees of arc in a circle is 360.</text>
        <text x="20" y="446">The number of radians of arc in a circle is 2π.</text>
        <text x="20" y="468">The sum of the measures in degrees of the angles of a triangle is 180.</text>
      </g>
    </svg>
  );
}

export default function MathReferenceSheet({ onClose }) {
  return (
    <FloatingPanel title="Reference" icon={LuSigma} width={640} onClose={onClose}>
      <div className="p-4">
        <ReferenceFigure />
      </div>
    </FloatingPanel>
  );
}
