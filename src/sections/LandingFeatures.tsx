
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
    <section id="features" ref={ref} className="py-20 px-2 sm:px-6 md:px-12 bg-gradient-to-br from-[#23264a]/80 to-[#181c33]/90 dark:from-[#222748] dark:to-[#181c33]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-10 text-center animate-fade-in">
          Fonctionnalités clés
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-7">
          {features.map((f, i) => (
            <div
              key={f.title}
              data-fade
              className={`relative rounded-xl p-7 pt-10 flex flex-col gap-5 items-center bg-gradient-to-b ${f.color} ${f.glow} border border-white/10 min-h-[220px] transition-transform hover:scale-105 hover:shadow-xl`}
              style={{
                animationDelay: `${0.15 + i * 0.18}s`,
              }}
            >
              <motion.div
                initial={{ scale: 0.68, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.13 }}
                className="rounded-full bg-black/40 p-3 mb-2"
              >
                {f.icon}
              </motion.div>
              <h3 className="text-lg font-extrabold text-white tracking-wide text-center">{f.title}</h3>
              <p className="text-base text-white/90 text-center">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
