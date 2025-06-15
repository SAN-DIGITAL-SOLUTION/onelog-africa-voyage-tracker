
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

// Bandeau notification visuel
export function NotificationBanner() {
  return (
    <div
      className="banner-notif bg-secondary text-primary border-b-2 border-accent shadow"
      role="status"
      aria-live="polite"
      style={{
        background: "#F9A825",
        color: "#1A3C40",
        borderBottom: "2px solid #E65100",
      }}
    >
      Nouvelle version : Digitalisez votre logistique africaine ! 🚀
    </div>
  );
}

export default function LandingHeader() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  const toggleTheme = () => {
    setDark((d) => {
      const newMode = !d;
      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newMode;
    });
  };

  return (
    <>
      <NotificationBanner />
      <header
        className="fixed z-50 top-0 left-0 w-full shadow-lg backdrop-blur-2xl mt-[36px]"
        style={{
          background: "#1A3C40",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 relative">
          <div className="flex items-center gap-3 relative z-10">
            {/* SVG camion animée */}
            <svg width="39" height="36" viewBox="0 0 48 38" className="h-9 w-9 shrink-0" aria-label="Logo camion OneLog Africa" fill="none">
              <g>
                <rect x="1" y="15" width="19" height="12" rx="6" fill="#E65100">
                  <animate attributeName="x" values="1;14;1" dur="1.4s" repeatCount="indefinite" />
                </rect>
                <rect x="16" y="21" width="12" height="6" rx="3" fill="#1A3C40" />
                <ellipse cx="6" cy="33" rx="5" ry="4" fill="#1A3C40">
                  <animate attributeName="cx" values="6;18;6" dur="1.4s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="17" cy="33" rx="5" ry="4" fill="#263238" />
              </g>
            </svg>
            <span className="font-montserrat font-bold text-2xl tracking-wide" style={{ color: "#1A3C40" }}>
              OneLog Africa
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-base relative z-10">
            <a href="#features" className="story-link" style={{ color: "#1A3C40" }}>Fonctionnalités</a>
            <a href="#secteurs" className="story-link" style={{ color: "#1A3C40" }}>Secteurs desservis</a>
            <a href="#about" className="story-link" style={{ color: "#1A3C40" }}>À propos</a>
            <Button asChild variant="secondary" size="sm" className="font-bold" style={{ background: "#F9A825", color: "#1A3C40" }}>
              <a href="/auth">Connexion</a>
            </Button>
          </nav>
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-secondary/40 outline-none focus:ring-4 focus:ring-secondary transition"
              aria-label="Basculer le mode sombre"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="ml-2 md:hidden">
              {/* Hamburger mobile */}
              <Button variant="secondary" size="icon" asChild style={{ background: "#F9A825", color: "#1A3C40" }}>
                <a href="/auth">
                  <span className="sr-only">Connexion</span>
                  <svg width={22} height={22} fill="none" stroke="currentColor">
                    <rect x={5} y={7} width={12} height={2} rx={1} />
                    <rect x={5} y={13} width={12} height={2} rx={1} />
                  </svg>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
