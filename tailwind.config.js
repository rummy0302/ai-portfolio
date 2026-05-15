/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        mono:    ["Share Tech Mono", "monospace"],
        body:    ["Exo 2", "sans-serif"],
      },
      colors: {
        "c-bg":     "#020408",
        "c-card":   "rgba(10,20,40,0.8)",
        "c-cyan":   "#00c8ff",
        "c-purple": "#7b5cff",
        "c-green":  "#00ff88",
        "c-pink":   "#ff2d9b",
        "c-text":   "#c8e8ff",
      },
      animation: {
        "spin-slow":   "spin 12s linear infinite",
        "spin-slower": "spin 20s linear infinite",
        "scanline":    "scanline 3s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%":   { transform: "translateY(0%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};
