import { LuCalculator } from "react-icons/lu";
import FloatingPanel from "./FloatingPanel";

// Desmos kalkulyatori hozircha ulanmagan (rasmiy API kaliti kerak).
// Bluebook'dagi kabi oyna ochiladi, ichida "coming soon" ogohlantirishi.
export default function DesmosCalculator({ onClose }) {
  return (
    <FloatingPanel
      title="Calculator"
      icon={LuCalculator}
      width={420}
      initial={{ x: 16, y: 96 }}
      onClose={onClose}
    >
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
        <span className="mb-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
          Coming soon
        </span>
        <LuCalculator size={30} className="text-gray-300" />
        <p className="text-sm font-semibold text-gray-800">The Desmos graphing calculator isn&apos;t available yet.</p>
        <p className="max-w-xs text-xs leading-relaxed text-gray-500">
          Use the Reference sheet and scratch paper for now. On the real SAT, the Desmos calculator is built
          into Bluebook.
        </p>
      </div>
    </FloatingPanel>
  );
}
