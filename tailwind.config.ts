
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["'PT Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Onelog Africa
        onelog: {
          nuit: "#21243B",
          bleu: "#2196F3",
          citron: "#B8FF28",
        },
        // Utilisé pour les accents
        primary: {
          DEFAULT: "#21243B",
          foreground: "#fff",
        },
        secondary: {
          DEFAULT: "#2196F3",
          foreground: "#fff",
        },
        success: "#B8FF28",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
