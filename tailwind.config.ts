import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        architect: {
          50:'#edf1e6',100:'#173e43',200:'#214e53',300:'#285e63',400:'#28696d',500:'#21676c',600:'#21676c',700:'#1c565c',800:'#91b7aa',900:'#c9ded3',950:'#bdd5ca',
        },
        stone: {
          50:'#163b36',100:'#183e42',200:'#254b4c',300:'#355854',400:'#45665f',500:'#48675f',600:'#4b6b61',700:'#a8bfb3',800:'#c2d2c5',850:'#d7e3d9',900:'#e1eae0',950:'#f0efe6',
        },
      },
      fontFamily: {
        sans:  ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      animation: {
        "fade-up":    "fadeUp 0.7s ease forwards",
        "fade-in":    "fadeIn 0.5s ease forwards",
        "slide-left": "slideLeft 0.6s ease forwards",
        "draw":       "draw 2s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideLeft: {
          "0%":   { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        draw: {
          "0%":   { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
