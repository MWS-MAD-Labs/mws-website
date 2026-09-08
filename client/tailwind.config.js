/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        scrollcue: {
          "0%": { top: "-28px" },
          "60%, 100%": { top: "28px" },
        },
        marqueeScroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        scrollcue: "scrollcue 2.2s ease-in-out infinite",
        marqueeScroll: "marqueeScroll 25s linear infinite",
      },
    },
  },
  plugins: [],
}
