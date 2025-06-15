
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function LandingHeader() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
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
    <header className="fixed z-50 top-0 left-0 w-full bg-gradient-to-r from-black/60 via-onelog-nuit/80 to-black/30 dark:bg-gradient-to-r dark:from-black/50 dark:via-onelog-nuit/80 dark:to-black/20 shadow-lg backdrop-blur-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/favicon.ico" alt="OneLog Africa" className="h-8 w-8 rounded shadow" />
          <span className="font-bold text-xl tracking-wide text-white drop-shadow-lg">OneLog Africa</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-semibold text-base">
          <a href="#features" className="text-white/90 hover:text-onelog-citron transition">Fonctionnalités</a>
          <a href="#secteurs" className="text-white/90 hover:text-onelog-citron transition">Secteurs desservis</a>
          <a href="#about" className="text-white/90 hover:text-onelog-citron transition">À propos</a>
          <Button asChild variant="secondary" size="sm">
            <a href="/auth">Connexion</a>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 hover:bg-onelog-citron/30 transition text-white"
            aria-label="Basculer le mode sombre"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="ml-2 md:hidden">
            {/* Hamburger or mobile */}
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
  );
}
