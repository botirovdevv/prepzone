// Auth formalarining kichik umumiy bo'laklari.

export function OrDivider({ children = "yoki" }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[13px] text-[#86868b]" role="separator">
      <span className="h-px flex-1 bg-black/[0.08]" />
      {children}
      <span className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

export function FormAlert({ children, tone = "error" }) {
  if (!children) return null;
  const styles = tone === "error" ? "bg-[#fff1f1] text-[#c4252b]" : "bg-[#eef6ff] text-[#0a5d99]";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`pz-fade rounded-[14px] px-4 py-3 text-[14px] leading-[1.45] ${styles}`}
    >
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
    />
  );
}

export function PrimaryButton({ children, loading, loadingText, disabled, className = "", ...props }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={`pz-press flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#087fd1] text-[17px] font-semibold tracking-[-0.01em] text-white hover:bg-[#0673bd] active:bg-[#066fb8] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {loading ? loadingText : children}
    </button>
  );
}
