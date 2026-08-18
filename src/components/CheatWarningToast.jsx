import { LuTriangleAlert } from "react-icons/lu";

export default function CheatWarningToast({ warning, maxWarnings }) {
  if (!warning) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md">
      <div className="bg-red-600 text-white rounded-xl shadow-2xl px-5 py-3.5 flex items-start gap-3">
        <LuTriangleAlert size={20} className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-bold">
            Ogohlantirish {warning.count}/{maxWarnings}
          </p>
          <p className="text-white/90">{warning.message}</p>
        </div>
      </div>
    </div>
  );
}
