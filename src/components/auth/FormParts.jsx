// Auth formalarining kichik umumiy bo'laklari.

export function OrDivider({ children = "yoki email orqali" }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[13px] text-[#667085]" role="separator">
      <span className="h-px flex-1 bg-[#111827]/[0.08]" />
      {children}
      <span className="h-px flex-1 bg-[#111827]/[0.08]" />
    </div>
  );
}

export function FormAlert({ children, tone = "error" }) {
  if (!children) return null;
  const styles =
    tone === "error"
      ? "border-[#e5484d]/20 bg-[#fff5f5] text-[#c4252b]"
      : "border-[#087fd1]/15 bg-[#f0f8ff] text-[#0a5d99]";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`pz-fade rounded-[14px] border px-4 py-3 text-[14px] leading-[1.45] ${styles}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({ children, loading, loadingText, disabled, className = "", ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`pz-press flex h-12 w-full items-center justify-center rounded-[14px] bg-[#087fd1] text-[16px] font-semibold text-white shadow-[0_1px_2px_rgba(8,127,209,0.3),0_8px_20px_-8px_rgba(8,127,209,0.55)] hover:bg-[#0673bd] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
