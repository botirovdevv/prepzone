// Modul topshirilib, keyingisi yuklanayotgan paytdagi oraliq ekran
// (Bluebook'dagi kabi, inglizcha).
export default function ModuleTransition() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <div className="mb-6 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-3 w-3 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">This module is over</h1>
      <p className="mt-2 max-w-sm text-[15px] text-gray-600">
        Hang tight while we get your next module ready. Don&apos;t refresh or close this page.
      </p>
    </div>
  );
}
