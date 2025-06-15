
import { motion } from "framer-motion";

/**
 * Nouvelle Hero section : texte clarifié + effet visuel « halo » et transitions adoucies.
 */
export default function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] pt-44 pb-14 text-center select-none" style={{ background: "#F4F4F4" }}>
      {/* Halo effet derrière l’illustration principale */}
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 z-0 pointer-events-none">
        <div className="w-[380px] h-[115px] rounded-full blur-[42px] opacity-45"
          style={{ background: "radial-gradient(ellipse at center, #F9A82588 10%, #F4F4F4 60%, #F4F4F400 100%)" }} />
      </div>
      {/* Animated SVG illustration for "wahou" effect" */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.05, ease: "easeOut" }}
        className="relative w-full max-w-3xl mx-auto z-10"
      >
        {/* Camion, route, flows digitaux, logistique humaine */}
        <motion.svg
          width="420"
          height="180"
          viewBox="0 0 440 180"
          fill="none"
          className="mx-auto relative z-10"
          style={{ position: "relative", top: "30px" }}
        >
          {/* Road */}
          <motion.rect
            x="50"
            y="130"
            width="330"
            height="14"
            rx="8"
            fill="#263238"
            opacity="0.88"
            initial={{ x: 10 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9, delay: 1.05 }}
          />
          {/* Truck (animated in) */}
          <motion.g
            initial={{ x: -100 }}
            animate={{ x: 135 }}
            transition={{ duration: 1.18, delay: 1.22, type: "spring", stiffness: 28 }}
          >
            <rect x="0" y="109" width="80" height="35" rx="7" fill="#E65100" />
            <rect x="65" y="116" width="17" height="19" rx="3" fill="#F9A825" />
            {/* Wheels */}
            <ellipse cx="16" cy="149" rx="7" ry="7" fill="#1A3C40" />
            <ellipse cx="59" cy="148" rx="7" ry="7" fill="#263238" />
            {/* Cab window */}
            <rect x="7" y="115" width="26" height="13" rx="3" fill="#F4F4F4" opacity="0.85" />
          </motion.g>
          {/* Digital flows (dotted line animating rightwards) */}
          <motion.line
            x1={132}
            y1={140}
            x2={312}
            y2={140}
            stroke="#1A3C40"
            strokeWidth={3}
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.55, delay: 2.05 }}
            style={{ filter: "drop-shadow(0 0 16px #1A3C40a0)" }}
          />
          {/* African logistician with tablet */}
          <motion.g
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.08, delay: 1.82, type: "spring" }}
          >
            <ellipse cx="332" cy="98" rx="21" ry="28" fill="#263238" opacity="0.92" />
            {/* Head */}
            <ellipse cx="332" cy="88" rx="12" ry="14" fill="#F9A825" />
            {/* Tablet (glowing effect) */}
            <rect x="321" y="108" width="22" height="12" rx="3" fill="#009688" style={{ filter: "drop-shadow(0 0 10px #009688)" }} />
            {/* Tablet screen line */}
            <rect x="326" y="112" width="12" height="2" rx="1" fill="#F4F4F4" />
          </motion.g>
        </motion.svg>
      </motion.div>
      {/* Nouveau slogan, plus percutant et contrasté */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, delay: 2.38 }}
        className="mt-12 mb-7 text-4xl md:text-6xl font-extrabold tracking-tighter drop-shadow-2xl font-montserrat leading-tight"
        style={{
          color: "#E65100",
          textShadow: "0 2px 18px #1A3C4033",
          letterSpacing: "-0.01em"
        }}
      >
        La logistique<br className="hidden md:inline" />
        conçue pour<br className="hidden sm:inline" />
        l’Afrique du futur
      </motion.h1>
      {/* Baseline sous le slogan */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.7 }}
        className="max-w-xl mx-auto mb-8 text-lg md:text-2xl font-semibold text-primary"
        style={{ color: "#263238", opacity: 0.93 }}
      >
        Pilotez chaque convoi — et chaque mission — avec une technologie accessible, humaine et pensée pour la réalité du terrain africain.
      </motion.p>
      {/* CTA amélioré */}
      <motion.a
        href="#demo"
        initial={{ opacity: 0, scale: 0.93, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.07, delay: 2.95 }}
        className="btn-cta"
        style={{
          background: "#E65100",
          color: "#fff",
          boxShadow: "0 3px 20px 0 #E651004a",
          fontSize: "1.19rem"
        }}
      >
        Tester gratuitement
      </motion.a>
      {/* Séparateur visuel arrondi en bas */}
      <div className="absolute z-0 w-full left-0 bottom-0 h-16 pointer-events-none select-none"
        style={{
          background: "linear-gradient(to bottom, #F4F4F4 10%, #1A3C40 100%)",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          opacity: 0.96
        }} />
    </section>
  );
}
