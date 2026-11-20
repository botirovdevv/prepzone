import { Component } from "react";
import { LuTriangleAlert, LuRotateCw } from "react-icons/lu";
import { translate as t } from "../i18n";

const RELOAD_KEY = "pz_chunk_reload";

// Yangi deploy'dan keyin eski sahifa o'chirilgan chunk'ni so'rasa
// ("Failed to fetch dynamically imported module") — bir marta avtomatik
// yangilaymiz. Boshqa xatolarda oq ekran o'rniga tushunarli xabar.
function isChunkError(error) {
  const msg = String(error?.message || error);
  return /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i.test(msg);
}

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Kutilmagan xatolik:", error, info?.componentStack);
    if (isChunkError(error)) {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last > 30_000) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
        }
      } catch {
        /* ignore */
      }
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunk = isChunkError(this.state.error);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <LuTriangleAlert size={28} />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          {chunk ? t("crash.updatedTitle") : t("crash.title")}
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
          {chunk ? t("crash.updatedText") : t("crash.text")}
        </p>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent"
          >
            <LuRotateCw size={16} /> {t("crash.reload")}
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-xl border border-ink/15 bg-surface px-5 py-2.5 text-sm font-semibold text-ink"
          >
            {t("crash.home")}
          </a>
        </div>
      </div>
    );
  }
}
