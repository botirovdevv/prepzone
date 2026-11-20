// Build vaqtida bosh sahifani tayyor HTML'ga aylantirish (SEO): scripts/prerender.mjs
// shu faylni Vite SSR bilan quradi va render() natijasini dist/home.html ga yozadi.
// Brauzerda ishlatilmaydi — u yerda React bu HTML'ni o'zi qaytadan chizadi.
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "./i18n";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";

export function render() {
  return renderToString(
    <ThemeProvider>
      <LanguageProvider>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export { default as homeMessages } from "./i18n/messages/home.js";
