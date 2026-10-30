import { useEffect, useState } from "react";
import { LuTriangleAlert, LuX } from "react-icons/lu";
import { Button, Field, inputClass } from "./ui";
import { useI18n } from "../i18n";

// ------------------------------------------------------------------
// Xavfli amalni tasdiqlash oynasi. `confirmWord` berilsa foydalanuvchi uni
// yozishi kerak; `askPassword` bo'lsa joriy parol ham so'raladi.
// onConfirm({ password }) — xato tashlasa, xabari oynada ko'rsatiladi.
// ------------------------------------------------------------------
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmWord,
  askPassword = false,
  onConfirm,
  onClose,
}) {
  const { t } = useI18n();
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Har safar ochilganda maydonlar tozalanadi.
  useEffect(() => {
    if (!open) return;
    setTyped("");
    setPassword("");
    setError("");
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const ready = (!confirmWord || typed.trim() === confirmWord) && (!askPassword || password.length > 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      await onConfirm({ password });
    } catch (err) {
      setError(err.message || t("common.error"));
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#12213D]/40 p-4 sm:items-center"
      onClick={() => !busy && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(18,33,61,0.45)]"
      >
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
            <LuTriangleAlert size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="font-display text-[17px] font-bold text-[#12213D]">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#12213D]/60">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t("common.close")}
            className="-mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#12213D]/40 hover:bg-[#12213D]/5 hover:text-[#12213D]"
          >
            <LuX size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 pb-5 sm:px-6">
          {confirmWord && (
            <Field label={t("confirm.typeWord", { word: confirmWord })}>
              <input
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className={inputClass}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
          )}
          {askPassword && (
            <Field label={t("confirm.currentPassword")}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#12213D]/[0.06] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={!ready || busy} className="!bg-red-600 !text-white hover:!bg-red-700 !shadow-none">
            {busy ? t("confirm.working") : confirmLabel || t("confirm.confirm")}
          </Button>
        </div>
      </form>
    </div>
  );
}
