
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

// Bandeau notification visuel
export function NotificationBanner() {
  return (
    <div className="banner-notif" role="status" aria-live="polite">
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
      <header className="fixed z-50 top-0 left-0 w-full bg-gradient-to-r from-primary/80 via-fresh/70 to-secondary/40 dark:from-dm-bg/90 dark:to-fresh/40 shadow-lg backdrop-blur-2xl mt-[36px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 relative">
          {/* Motif africain en fond */}
          <div className="absolute inset-0 african-texture pointer-events-none" aria-hidden />
          <div className="flex items-center gap-3 relative z-10">
            {/* SVG camion animée */}
            <svg width="39" height="36" viewBox="0 0 48 38" className="h-9 w-9 shrink-0" aria-label="Logo camion OneLog Africa" fill="none">
              <g>
                <rect x="1" y="15" width="19" height="12" rx="6" fill="#E65100">
                  <animate attributeName="x" values="1;14;1" dur="1.4s" repeatCount="indefinite" />
                </rect>
                <rect x="16" y="21" width="12" height="6" rx="3" fill="#009688" />
                <ellipse cx="6" cy="33" rx="5" ry="4" fill="#1A3C40">
                  <animate attributeName="cx" values="6;18;6" dur="1.4s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="17" cy="33" rx="5" ry="4" fill="#263238" />
              </g>
            </svg>
            <span className="font-montserrat font-bold text-2xl tracking-wide text-primary dark:text-dm-text drop-shadow-lg">
              OneLog Africa
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-base relative z-10">
            <a href="#features" className="text-primary hover:text-accent transition story-link">Fonctionnalités</a>
            <a href="#secteurs" className="text-primary hover:text-accent transition story-link">Secteurs desservis</a>
            <a href="#about" className="text-primary hover:text-accent transition story-link">À propos</a>
            <Button asChild variant="secondary" size="sm" className="font-bold">
              <a href="/auth">Connexion</a>
            </Button>
          </nav>
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-secondary/40 outline-none focus:ring-4 focus:ring-secondary transition text-primary dark:text-secondary"
              aria-label="Basculer le mode sombre"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="ml-2 md:hidden">
              {/* Hamburger mobile */}
              <Button variant="secondary" size="icon" asChild>
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
