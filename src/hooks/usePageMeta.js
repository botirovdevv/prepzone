import { useEffect } from "react";

const SITE = "https://prep-zone.uz";

// Ochiq (indekslanadigan) sahifalar uchun sarlavha va canonical havola.
// Sahifadan chiqilganda avvalgi qiymatlar qaytariladi.
export function usePageMeta({ title, path }) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    let link = document.querySelector('link[rel="canonical"]');
    const prevHref = link?.getAttribute("href") ?? null;
    if (path) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${SITE}${path}`;
    }

    return () => {
      document.title = prevTitle;
      if (!path || !link) return;
      if (prevHref === null) link.remove();
      else link.setAttribute("href", prevHref);
    };
  }, [title, path]);
}
