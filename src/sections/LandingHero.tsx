
import { motion } from "framer-motion";

export default function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[85vh] pt-32 pb-10 text-center select-none">
      {/* Animated SVG illustration for "wahou" effect */}
      <motion.div
        initial={{ opacity: 0, y: 45, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-3xl mx-auto"
      >
        {/* Big African map background */}
        <motion.svg
          width="480"
          height="320"
          viewBox="0 0 480 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto absolute inset-0 pointer-events-none filter blur-[2.5px] drop-shadow-xl"
        >
          <motion.path
            d="M55,60 Q71,40 160,60 Q192,36 228,57 Q241,44 293,61 Q376,86 417,140 Q458,194 431,256 Q410,303 352,293 Q288,283 240,308 Q215,320 189,312 Q132,294 87,250 Q48,212 63,142 Q62,123 55,60Z"
            fill="url(#africa-gradient)"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.1, delay: 0.2, type: "spring", stiffness: 18 }}
            style={{ filter: "drop-shadow(0 0 60px #2196f3cc)" }}
          />
          <defs>
            <radialGradient id="africa-gradient" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#2196F3" stopOpacity="0.78" />
              <stop offset="60%" stopColor="#21243B" stopOpacity="0.94" />
              <stop offset="100%" stopColor="#060c18" stopOpacity="1" />
            </radialGradient>
          </defs>
        </motion.svg>
        {/* The truck, road, digital flows */}
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
            fill="#21243b"
            opacity="0.8"
            initial={{ x: 10 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.9, delay: 1.05 }}
          />
          {/* Truck (animated in) */}
          <motion.g
            initial={{ x: -100 }}
            animate={{ x: 135 }}
            transition={{ duration: 1.2, delay: 1.2, type: "spring", stiffness: 28 }}
          >
            <rect x="0" y="109" width="80" height="35" rx="6" fill="#2196F3" />
            <rect x="65" y="116" width="17" height="19" rx="3" fill="#B8FF28" />
            {/* Wheels */}
            <ellipse cx="16" cy="149" rx="7" ry="7" fill="#21243B" />
            <ellipse cx="59" cy="148" rx="7" ry="7" fill="#21243B" />
            {/* Cab window */}
            <rect x="7" y="115" width="26" height="13" rx="3" fill="#fff" opacity="0.85" />
          </motion.g>
          {/* Digital flows (dotted line animating rightwards) */}
          <motion.line
            x1={132}
            y1={140}
            x2={312}
            y2={140}
            stroke="#B8FF28"
            strokeWidth={3}
            strokeDasharray="8 8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.7, delay: 2.25 }}
            style={{ filter: "drop-shadow(0 0 16px #B8FF28b0)" }}
          />
          {/* African logistician with tablet */}
          <motion.g
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.98, type: "spring" }}
          >
            <ellipse cx="332" cy="98" rx="21" ry="28" fill="#353968" opacity="0.95" />
            {/* Head */}
            <ellipse cx="332" cy="88" rx="12" ry="14" fill="#FBD0A2" />
            {/* Tablet (glowing effect) */}
            <rect x="321" y="108" width="22" height="12" rx="3" fill="#2196F3" style={{ filter: "drop-shadow(0 0 10px #2196f3)" }} />
            {/* Tablet screen line */}
            <rect x="326" y="112" width="12" height="2" rx="1" fill="#B8FF28" />
          </motion.g>
        </motion.svg>
      </motion.div>
      {/* Slogan */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, delay: 2.45 }}
        className="mt-8 mb-4 text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-2xl"
      >
        <span className="inline-block">🚛💡 Digitalisez votre logistique<br />avec une solution 100% africaine.</span>
      </motion.h1>
      {/* CTA */}
      <motion.a
        href="#demo"
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.8 }}
        className="inline-block mt-2 px-9 py-3 rounded-full bg-onelog-citron text-onelog-nuit font-bold text-xl shadow-lg hover:scale-105 hover:bg-lime-400/90 transition-all ring-2 ring-onelog-citron/70 focus:ring-4 focus:ring-onelog-bleu/40 animate-pulse"
      >
        Demander une démo
      </motion.a>
    </section>
  );
}
