/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,TS,TSX,Jsx,JSX}",
  ],
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
    },
  },
  plugins: [],
}