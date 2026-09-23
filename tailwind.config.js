/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,TS,TSX,Jsx,JSX}",
  ],
  // hover: effektlari faqat sichqonchali qurilmalarda — sensorli ekranda
  // bosilgandan keyin "yopishib qolgan" hover holati bo'lmaydi.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        bluebook: {
          blue: "#375DFB",
          darkblue: "#0B2265",
          navy: "#101F3C",
          headerbg: "#F3F4F6",
          border: "#D0D5DD",
        },
      },
      // Brauzerning standart "ease" egri chiziqlari juda sust — UI uchun
      // kuchliroq ease-out (tez boshlanib, yumshoq to'xtaydi).
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.23, 1, 0.32, 1)",
        "out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      // `scale` va `translate` alohida CSS xususiyatlari (bosilganda
      // kichrayish, kirish animatsiyasi) ham silliq o'tishi uchun.
      transitionProperty: {
        DEFAULT:
          "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, scale, translate",
      },
    },
  },
  plugins: [],
}
