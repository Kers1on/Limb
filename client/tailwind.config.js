/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        panGrid: "pan 60s linear infinite",
      },
      keyframes: {
        pan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "1000px 1000px" },
        },
      },
      backgroundImage: {
        "grid-white":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        "grid-black":
          "linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "20px 20px",
      },
    },
  },
  plugins: [],
};
