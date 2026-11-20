// SEO: bosh sahifani (/) build vaqtida tayyor HTML qilib yozadi.
//   1) src/entry-prerender.jsx Vite SSR bilan quriladi (dist-ssr/, vaqtinchalik);
//   2) render() natijasi dist/index.html nusxasiga joylanadi + canonical va JSON-LD;
//   3) natija dist/home.html — Caddy "/" so'rovini shu faylga yo'naltiradi.
// Boshqa yo'llar (dashboard va h.k.) oddiy dist/index.html'dan foydalanadi.
import { build } from "vite";
import { readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://prep-zone.uz";
const ssrOut = path.join(root, "dist-ssr");

await build({
  root,
  logLevel: "warn",
  build: { ssr: "src/entry-prerender.jsx", outDir: ssrOut, emptyOutDir: true },
});

const mod = await import(pathToFileURL(path.join(ssrOut, "entry-prerender.js")).href);
const appHtml = mod.render();
const faq = mod.homeMessages.uz.home.faq || [];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Prepzone",
    url: `${SITE}/`,
    logo: `${SITE}/Logo-sm.png`,
    sameAs: ["https://t.me/prepzonesat"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Prepzone",
    alternateName: "Prepzone — Digital SAT mock testlar",
    url: `${SITE}/`,
    inLanguage: "uz",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  },
];

const ldScripts = jsonLd
  .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`)
  .join("\n    ");

const template = await readFile(path.join(root, "dist/index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("index.html: #root topilmadi");

const html = template
  .replace("</head>", `    <link rel="canonical" href="${SITE}/" />\n    <meta property="og:url" content="${SITE}/" />\n    ${ldScripts}\n  </head>`)
  .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

await writeFile(path.join(root, "dist/home.html"), html);
await rm(ssrOut, { recursive: true, force: true });
console.log(`[prerender] dist/home.html (${Math.round(html.length / 1024)} KB, FAQ: ${faq.length})`);
