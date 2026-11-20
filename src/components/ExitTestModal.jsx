import { LuTriangleAlert } from "react-icons/lu";

export default function ExitTestModal({ onCancel, onConfirm, confirming }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4">
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <LuTriangleAlert size={22} />
        </div>
        <h2 className="font-bold text-lg text-gray-900 mb-2">
          Testdan chiqmoqchimisiz?
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Hozirgi holatingiz saqlanadi, lekin testni faqat{" "}
          <span className="font-semibold text-gray-700">30 daqiqadan</span>{" "}
          so'ng qayta davom ettira olasiz.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 border border-gray-300 rounded-lg py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 bg-red-600 text-white rounded-lg py-2.5 font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {confirming ? "Chiqilmoqda..." : "Ha, chiqish"}
          </button>
        </div>
      </div>
    </div>
  );
}
