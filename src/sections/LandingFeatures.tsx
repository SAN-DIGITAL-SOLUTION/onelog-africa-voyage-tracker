import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";

const features = [
  {
    title: "Suivi en temps réel",
    desc: "Visualisez vos missions et vos camions à chaque instant sur la carte.",
    icon: <ArrowRight size={30} className="text-onelog-citron drop-shadow-lg" />,
    color: "from-onelog-citron via-green-300 to-onelog-bleu",
    glow: "shadow-[0_4px_26px_2px_#B8FF28cc]",
  },
  {
    title: "Gestion des missions",
    desc: "Organisez, créez et suivez chaque opération en toute fluidité.",
    icon: <ArrowLeft size={30} className="text-onelog-bleu drop-shadow-lg" />,
    color: "from-onelog-bleu via-sky-400 to-onelog-citron",
    glow: "shadow-[0_4px_18px_2px_#2196F3bb]",
  },
  {
    title: "Analyse de performance",
    desc: "Statistiques et KPIs pour optimiser vos flux et coûts.",
    icon: <ArrowUp size={30} className="text-yellow-200 drop-shadow-lg" />,
    color: "from-yellow-200 via-onelog-citron to-onelog-bleu",
    glow: "shadow-[0_4px_18px_2px_#f6f47fb0]",
  },
  {
    title: "Notifications intelligentes",
    desc: "Soyez alerté en temps réel des incidents et actions à traiter.",
    icon: <ArrowDown size={30} className="text-white drop-shadow-lg" />,
    color: "from-white via-onelog-bleu to-onelog-citron",
    glow: "shadow-[0_6px_20px_4px_#2196F399]",
  },
];

const themeColors = [
  {
    border: "#B8FF28", // citron fluo (pour le suivi)
    icon: "#009688",    // fresh
    title: "Suivi en temps réel",
    card: "border-[#B8FF28]",
  },
  {
    border: "#2196F3", // bleu vif (pour missions)
    icon: "#2196F3",
    title: "Gestion des missions",
    card: "border-[#2196F3]",
  },
  {
    border: "#F9A825", // jaune gold (charte)
    icon: "#F9A825",
    title: "Analyse de performance",
    card: "border-[#F9A825]",
  },
  {
    border: "#B0BEC5", // gris neutre pour notifs
    icon: "#757575",
    title: "Notifications intelligentes",
    card: "border-[#B0BEC5]",
  },
];

export default function LandingFeatures() {
  // We'll use fade-in on scroll using Intersection Observer API
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const elements = Array.from(el.querySelectorAll<HTMLDivElement>("[data-fade]"));
    function fadeIn() {
      const windowHeight = window.innerHeight * 0.8;
      for (const elem of elements) {
        const rect = elem.getBoundingClientRect();
        if (rect.top < windowHeight) {
          elem.classList.add("animate-fade-in");
        }
      }
    }
    fadeIn();
    window.addEventListener("scroll", fadeIn);
    return () => window.removeEventListener("scroll", fadeIn);
  }, []);

  return (
    <section
      id="features"
      ref={ref}
      className="py-20 px-2 sm:px-6 md:px-12"
      style={{
        background: "#1A3C40"
      }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold mb-10 text-center font-montserrat"
          style={{ color: "#fff" }}
        >
          Fonctionnalités clés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {[
            {
              title: "Suivi en temps réel",
              desc: "Visualisez vos missions et vos camions à chaque instant sur la carte.",
              icon: <span className="inline-block"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#B8FF28" /><circle cx="13" cy="13" r="7" fill="#009688" /></svg></span>,
            },
            {
              title: "Gestion des missions",
              desc: "Organisez, créez et suivez chaque opération en toute fluidité.",
              icon: <span className="inline-block"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#2196F3" /><rect x="7" y="12" width="12" height="3" rx="1.5" fill="#fff" /></svg></span>,
            },
            {
              title: "Analyse de performance",
              desc: "Statistiques et KPIs pour optimiser vos flux et coûts.",
              icon: <span className="inline-block"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#F9A825" /><rect x="10" y="9" width="3" height="8" fill="#fff"/><rect x="15" y="12" width="3" height="5" fill="#fff"/></svg></span>,
            },
            {
              title: "Notifications intelligentes",
              desc: "Soyez alerté en temps réel des incidents et actions à traiter.",
              icon: <span className="inline-block"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="12" fill="#B0BEC5" /><rect x="11" y="6" width="4" height="10" rx="2" fill="#fff" /><circle cx="13" cy="18.5" r="1" fill="#fff"/></svg></span>,
            },
          ].map((f, i) => (
            <div
              key={f.title}
              data-fade
              className={`relative rounded-xl p-7 pt-10 flex flex-col gap-5 items-center bg-white transition-transform hover:scale-105 hover:shadow-xl min-h-[220px] border-2 ${themeColors[i].card} shadow`}
              style={{
                boxShadow: i === 0
                  ? "0 0 32px 0 #B8FF2870"
                  : i === 1
                  ? "0 0 16px 0 #2196F345"
                  : i === 2
                  ? "0 0 24px 0 #F9A82555"
                  : "0 0 8px 0 #B0BEC555",
                color: "#263238",
                animationDelay: `${0.15 + i * 0.18}s`
              }}
            >
              <div className="rounded-full mb-2" style={{ marginBottom: "14px" }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-extrabold text-center font-montserrat mb-2" style={{ color: "#1A3C40" }}>{f.title}</h3>
              <p className="text-base text-center" style={{ color: "#263238" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
