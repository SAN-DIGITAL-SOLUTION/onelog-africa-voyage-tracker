
import { useEffect, useRef } from "react";
import { MapPin, FileText, BarChart3, RefreshCw, Smartphone } from "lucide-react";

const features = [
  {
    icon: <MapPin size={30} className="text-primary bg-secondary/20 rounded-full p-1"/>,
    title: "Géolocalisation en temps réel",
    desc: "Visualisez vos camions, chauffeurs et trajets à chaque seconde.",
  },
  {
    icon: <FileText size={30} className="text-primary bg-secondary/20 rounded-full p-1"/>,
    title: "Documents centralisés et numériques",
    desc: "Fini les oublis. Bons, factures et contrats stockés en un clic.",
  },
  {
    icon: <BarChart3 size={30} className="text-primary bg-secondary/20 rounded-full p-1"/>,
    title: "Tableaux de bord intelligents",
    desc: "Suivez vos KPIs sans ouvrir un fichier Excel.",
  },
  {
    icon: <RefreshCw size={30} className="text-primary bg-secondary/20 rounded-full p-1"/>,
    title: "Automatisation logistique",
    desc: "Alertes clients, notifications SMS, optimisation de tournées.",
  },
  {
    icon: <Smartphone size={30} className="text-primary bg-secondary/20 rounded-full p-1"/>,
    title: "Mobile d’abord, offline aussi",
    desc: "Application légère, adaptée aux chauffeurs terrain.",
  },
];

export default function LandingKeyFeatures() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLDivElement>("[data-feature]"));

    function fadeCards() {
      const windowHeight = window.innerHeight * 0.95;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.top < windowHeight) {
          card.classList.add("animate-fade-in");
        }
      });
    }
    fadeCards();
    window.addEventListener("scroll", fadeCards);
    return () => {
      window.removeEventListener("scroll", fadeCards);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="w-full flex flex-col items-center bg-[#fff] py-16 md:py-24 px-3 sm:px-5 md:px-12 border-b border-gray-100"
      aria-labelledby="key-features-title"
    >
      <h2
        id="key-features-title"
        className="font-montserrat text-2xl md:text-3xl font-extrabold mb-10 flex items-center gap-2 text-[#E65100]"
      >
        <span className="text-2xl md:text-3xl">🔧</span>
        Fonctionnalités clés
      </h2>
      <div className="w-full max-w-5xl grid gap-7 md:gap-9 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            data-feature
            className="flex flex-col items-start bg-[#f9fafb] border border-[#F9A825]/15 rounded-2xl shadow-sm p-7 min-h-[155px] group transition-transform hover:scale-105"
            style={{ animationDelay: `${0.14 + i * 0.14}s` }}
          >
            <div className="mb-3">
              {f.icon}
            </div>
            <h3 className="font-montserrat font-bold text-lg md:text-xl mb-1 text-[#1A3C40]">{f.title}</h3>
            <p className="text-base md:text-lg text-[#263238] opacity-90 font-medium">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
