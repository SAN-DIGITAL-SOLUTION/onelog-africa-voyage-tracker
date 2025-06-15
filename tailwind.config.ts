
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
        "african-pattern": "0 0 0 3px #F9A82555",
      },
      backgroundImage: {
        // Motif géométrique africain en SVG inline
        "african-pattern": "url(\"data:image/svg+xml,%3Csvg width='96' height='96' viewBox='0 0 96 96' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='96' height='96' fill='%23F4F4F4'/%3E%3Ccircle cx='48' cy='48' r='36' stroke='%23F9A825' stroke-width='3' fill='none'/%3E%3Cpath d='M24,24L72,72' stroke='%23E65100' stroke-width='2'/%3E%3Cpath d='M72,24L24,72' stroke='%23009688' stroke-width='2'/%3E%3C/svg%3E\")",
      },
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
