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
        montserrat: ["Montserrat", "Bebas Neue", "ui-sans-serif", "system-ui"],
        sans: ["Open Sans", "Lato", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#1A3C40",
          foreground: "#F4F4F4",
        },
        secondary: {
          DEFAULT: "#F9A825",
          foreground: "#1A3C40",
        },
        accent: {
          DEFAULT: "#E65100",
          hover: "#cf4a05",
          foreground: "#fff",
        },
        fresh: {
          DEFAULT: "#009688",
          light: "#33bbae",
          dark: "#00695c",
        },
        textmain: "#263238",
        background: "#F4F4F4",
        "gray-light": "#F4F4F4",
        "african-line": "#F9A825",
        // Pour le dark mode, inversion
        "dm-bg": "#1A3C40",
        "dm-text": "#F4F4F4",
      },
      boxShadow: {
        cta: "0 2px 16px 0 #E6510033",
      },
      backgroundImage: {},
      transitionProperty: {
        "cta": "background, box-shadow, border, color, transform",
      },
      // Add these lines for the fade-in animation
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.4,0,0.2,1) both",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
} satisfies Config;
