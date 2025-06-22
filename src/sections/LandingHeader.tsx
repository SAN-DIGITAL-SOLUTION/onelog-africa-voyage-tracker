
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
      Découvrez la nouvelle génération de logistique digitale, conçue POUR l’Afrique. 🇦🇫🚀
    </div>
  );
}

/**
 * Header revisité : claim renforcé, logo plus visible, menu clair et équilibré.
 */
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

  // Détermine la couleur du texte des liens selon le mode
  const linkColor =
    dark
      ? "#fff"
      : "#1A3C40";

  return (
    <>
      <NotificationBanner />
      <header
        className="fixed z-50 top-0 left-0 w-full shadow-lg backdrop-blur-2xl mt-[36px]"
        style={{
          background: "#1A3C40"
        }}
        data-testid="landing-header"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 relative">
          <div className="flex items-center gap-3 relative z-10">
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
            <span className="font-montserrat font-extrabold text-2xl tracking-wide" style={{ color: "#fff", textShadow: "0 1px 8px #26323855" }}>
              OneLog Africa
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold text-base relative z-10">
            <a
              href="#features"
              className="story-link transition-colors"
              style={{ color: linkColor }}
              onMouseOver={e => (e.currentTarget.style.color = "#F9A825")}
              onMouseOut={e => (e.currentTarget.style.color = linkColor)}
              tabIndex={0}
            >
              Fonctionnalités
            </a>
            <a
              href="#secteurs"
              className="story-link transition-colors"
              style={{ color: linkColor }}
              onMouseOver={e => (e.currentTarget.style.color = "#F9A825")}
              onMouseOut={e => (e.currentTarget.style.color = linkColor)}
              tabIndex={0}
            >
              Secteurs
            </a>
            <a
              href="#about"
              className="story-link transition-colors"
              style={{ color: linkColor }}
              onMouseOver={e => (e.currentTarget.style.color = "#F9A825")}
              onMouseOut={e => (e.currentTarget.style.color = linkColor)}
              tabIndex={0}
            >
              Notre histoire
            </a>
            <Button asChild variant="secondary" size="sm" className="font-bold" style={{ background: "#F9A825", color: "#1A3C40" }}>
              <a href="/auth" tabIndex={0} style={{ color: "#1A3C40" }}>
                Accès client
              </a>
            </Button>
          </nav>
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/20 hover:bg-secondary/40 outline-none focus:ring-4 focus:ring-secondary transition"
              aria-label="Basculer le mode sombre"
              title={dark ? "Mode clair" : "Mode sombre"}
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="ml-2 md:hidden">
              <Button variant="secondary" size="icon" asChild style={{ background: "#F9A825", color: "#1A3C40" }}>
                <a href="/auth">
                  <span className="sr-only">Accès client</span>
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
