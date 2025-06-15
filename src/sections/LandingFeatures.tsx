
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Nouveaux textes et répartition bénéfices concrets.
 */
const features = [
  {
    title: "Présence en temps réel",
    desc: "Repérez instantanément vos camions et marchandises où qu’ils soient, sur une carte lisible et réactive.",
    icon: (
      <span className="inline-block">
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="12" fill="#1A3C40" />
          <circle cx="13" cy="13" r="7" fill="#009688" />
        </svg>
      </span>
    ),
  },
  {
    title: "Orchestration simple",
    desc: "Créez, confiez et suivez toutes vos missions sans effort — un vrai centre de commandement digitalisé.",
    icon: (
      <span className="inline-block">
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="12" fill="#1A3C40" />
          <rect x="7" y="12" width="12" height="3" rx="1.5" fill="#fff" />
        </svg>
      </span>
    ),
  },
  {
    title: "Analyse instantanée",
    desc: "Surveillez vos performances, réduisez vos coûts, optimisez vos flux — grâce à des KPIs concrets.",
    icon: (
      <span className="inline-block">
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="12" fill="#F9A825" />
          <rect x="10" y="9" width="3" height="8" fill="#fff" />
          <rect x="15" y="12" width="3" height="5" fill="#fff" />
        </svg>
      </span>
    ),
  },
  {
    title: "Alertes intelligentes",
    desc: "Recevez chaque notification « actionnable » : incidents, retards ou déchargements. Ne ratez plus rien.",
    icon: (
      <span className="inline-block">
        <svg width="26" height="26" viewBox="0 0 26 26">
          <circle cx="13" cy="13" r="12" fill="#B0BEC5" />
          <rect x="11" y="6" width="4" height="10" rx="2" fill="#fff" />
          <circle cx="13" cy="18.5" r="1" fill="#fff" />
        </svg>
      </span>
    ),
  },
];

const themeColors = [
  {
    border: "#1A3C40", // pétrol blue
    card: "border-[#1A3C40]",
    shadow: "0 0 32px 0 #1A3C4066",
  },
  {
    border: "#1A3C40",
    card: "border-[#1A3C40]",
    shadow: "0 0 16px 0 #1A3C4033",
  },
  {
    border: "#F9A825",
    card: "border-[#F9A825]",
    shadow: "0 0 24px 0 #F9A82555",
  },
  {
    border: "#B0BEC5",
    card: "border-[#B0BEC5]",
    shadow: "0 0 8px 0 #B0BEC533",
  },
];

export default function LandingFeatures() {
  // Fade-in on scroll using Intersection Observer API
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const elements = Array.from(el.querySelectorAll<HTMLDivElement>("[data-fade]"));
    function fadeIn() {
      const windowHeight = window.innerHeight * 0.9;
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
      className="py-24 px-2 sm:px-6 md:px-12 transition-all"
      style={{
        background: "#1A3C40"
      }}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-12 text-center font-montserrat drop-shadow"
          style={{ color: "#F9A825" }}
        >
          Vos bénéfices<span className="hidden md:inline"> –</span> grâce à notre plateforme
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-9">
          {features.map((f, i) => (
            <div
              key={f.title}
              data-fade
              className={`relative rounded-xl p-8 pt-11 flex flex-col gap-6 items-center bg-white transition-transform hover:scale-105 hover:shadow-2xl min-h-[224px] border-2 ${themeColors[i].card} shadow group`}
              style={{
                boxShadow: themeColors[i].shadow,
                color: "#263238",
                animationDelay: `${0.16 + i * 0.18}s`
              }}
            >
              <div className="rounded-full mb-2 group-hover:scale-110 transition-transform duration-200" style={{ marginBottom: "14px" }}>
                {f.icon}
              </div>
              <h3 className="text-xl font-extrabold text-center font-montserrat mb-2" style={{ color: "#1A3C40" }}>{f.title}</h3>
              <p className="text-base text-center" style={{ color: "#263238" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Séparateur vague */}
      <div
        className="w-full absolute left-0 bottom-0 z-0"
        style={{
          height: "42px",
          background: "linear-gradient(to bottom,#1A3C40 55%, #F4F4F4 100%)",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
        }} />
    </section>
  );
}
