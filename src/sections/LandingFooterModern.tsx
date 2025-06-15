
import React from "react";
import { ArrowRight, ArrowUp, ArrowLeft, ArrowDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Animation for social icons and African motif
const socials = [
  {
    name: "Twitter",
    href: "https://twitter.com/",
    Icon: ArrowUp,
    color: "#1DA1F2",
    label: "Twitter",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/",
    Icon: ArrowRight,
    color: "#0077b5",
    label: "LinkedIn",
  }
];

export default function LandingFooterModern() {
  // For demonstration; newsletter submission not functional
  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    // Here, you could provide a toast or message to the user
  }

  return (
    <footer
      className="relative z-10 w-full bg-[#1A3C40] min-h-[350px] rounded-t-[2.5rem] border-t border-[#F9A825]/30 overflow-hidden font-sans"
      aria-label="Pied de page OneLog Africa"
    >
      {/* Animated gradient backdrop */}
      <div
        className="absolute inset-0 -z-10 animate-[african-gradient-move_12s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(circle at 60% 90%, #F9A82588 0%, #F9A82511 45%, #FFDAA723 80%, #1A3C40 100%)",
          filter: "blur(20px) brightness(1.07)",
        }}
        aria-hidden
      />
      {/* Decorative African lines (SVG, subtle) */}
      <svg
        className="absolute left-[-40px] bottom-[80px] md:left-[8vw] w-[120px] h-[120px] pointer-events-none opacity-45"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
      >
        <path
          d="M15,110 C68,65 105,78 105,22"
          stroke="#F9A825"
          strokeWidth="5"
          strokeDasharray="5 10"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="absolute right-[-35px] top-[45px] md:right-[8vw] w-[70px] h-[70px] pointer-events-none opacity-28"
        viewBox="0 0 70 70"
        fill="none"
        aria-hidden
      >
        <circle
          cx="35"
          cy="35"
          r="28"
          stroke="#F9A825"
          strokeWidth="3"
          strokeDasharray="6 11"
        />
      </svg>
      <div className="max-w-7xl mx-auto px-5 py-12 md:py-16 flex flex-col gap-14">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 w-full">
          {/* Column 1: Brand and contact */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-3 min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/favicon.ico"
                alt="OneLog Africa logo"
                className="h-9 w-9 bg-white rounded-full shadow border"
                draggable={false}
              />
              <span className="font-montserrat text-2xl font-extrabold text-[#F9A825]">
                OneLog Africa
              </span>
            </div>
            <p className="font-medium text-[#F4F4F4]/85 text-base text-center md:text-left max-w-xs">
              Conçu avec passion pour booster la logistique africaine.
            </p>
            <div className="flex gap-2 mt-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-full border border-[#F9A82522] p-2 transition hover:bg-[#F9A82512] hover:scale-110 focus-visible:ring-2 focus-visible:ring-[#F9A825]"
                >
                  <s.Icon
                    className="transition"
                    color={s.color}
                    size={23}
                    strokeWidth={2.5}
                  />
                </a>
              ))}
            </div>
            <span className="text-[#F9A825] text-sm mt-2 font-mono tracking-wide">
              🚀 Made in Africa
            </span>
          </div>
          {/* Column 2: Newsletter + Trust */}
          <div className="flex-1 flex flex-col gap-5 items-center min-w-[220px]">
            <form
              className="w-full flex flex-col gap-2"
              onSubmit={handleNewsletter}
              autoComplete="off"
              aria-label="Inscription newsletter"
            >
              <label
                htmlFor="newsletter-email"
                className="text-sm font-semibold text-[#F9A825] tracking-wide"
              >
                Recevez les actus et astuces logistiques
              </label>
              <div className="w-full flex gap-0">
                <Input
                  id="newsletter-email"
                  type="email"
                  aria-label="Email pour newsletter"
                  className="flex-1 rounded-l-full rounded-r-none bg-white placeholder:text-[#A4ADAA] text-gray-800 border-none shadow"
                  placeholder="Votre email"
                  required
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  className="rounded-l-none rounded-r-full bg-[#F9A825] hover:bg-[#cf4a05] text-white font-bold px-7"
                  aria-label="S'inscrire à la newsletter"
                >
                  S'inscrire
                  <ArrowRight size={17} className="ml-1" />
                </Button>
              </div>
            </form>
            <div className="flex flex-col gap-1 items-center">
              <span className="text-[#F9A825] text-xs font-extrabold uppercase tracking-wide">Engagement</span>
              <div className="flex gap-2 mt-0.5 items-center">
                <TrustBadge icon="🛡️" label="Sécurité" />
                <TrustBadge icon="🔒" label="Vie privée" />
                <TrustBadge icon="✅" label="Locaux" />
              </div>
            </div>
            <span className="mt-1 text-xs text-[#F4F4F4]/90">Aucune publicité. 100% africain.</span>
          </div>
          {/* Column 3: Useful links */}
          <nav className="flex-1 flex flex-col gap-3 items-center md:items-end min-w-[180px]" aria-label="Liens utiles">
            <span className="text-[#F9A825] text-base font-bold mb-1">Liens utiles</span>
            <ul className="flex flex-col gap-2 items-center md:items-end">
              <FooterLink href="/">Accueil</FooterLink>
              <FooterLink href="mailto:contact@onelog.africa">Contact</FooterLink>
              <FooterLink href="https://twitter.com/">Communauté</FooterLink>
              <FooterLink href="https://linkedin.com/">Partenaires</FooterLink>
              <FooterLink href="/#features">Fonctionnalités</FooterLink>
              {/* Ajoutez d'autres liens si besoin */}
            </ul>
            <div className="mt-5 text-xs text-[#F4F4F4]/80 flex flex-col gap-0 text-right">
              <span>contact@onelog.africa</span>
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
          </nav>
        </div>
        {/* Divider bar */}
        <div className="w-full border-t border-[#F9A82533] opacity-70 my-2" />
        {/* Copyright */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-2 text-[#fff]/70 text-sm font-normal">
          <span>
            © {new Date().getFullYear()} OneLog Africa. Tous droits réservés.
          </span>
          <span>Fièrement panafricain 🌍</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  // Always open external links in a new tab with rel="noopener"
  const isExternal = href.startsWith("http");
  return (
    <li>
      <a
        href={href}
        className="group px-3 py-1 rounded-md font-medium text-[#F4F4F4] opacity-90 hover:opacity-100 hover:underline hover:bg-[#F9A82533] transition-colors duration-150 flex items-center gap-1"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        <ArrowRight
          size={17}
          className="opacity-70 group-hover:translate-x-1.5 transition-transform"
          strokeWidth={2.15}
        />
        <span>{children}</span>
      </a>
    </li>
  );
}

function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1 bg-[#F9A82522] text-[#F9A825] px-2 py-0.5 rounded-full text-xs font-bold">
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

