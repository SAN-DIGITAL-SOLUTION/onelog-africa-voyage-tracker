
import { motion } from "framer-motion";

// Plus de hubs pour un effet "réseau"
const hubs = [
  { cx: 250, cy: 100, d: 0.15 },
  { cx: 180, cy: 120, d: 0.2 },
  { cx: 205, cy: 175, d: 0.23 },
  { cx: 140, cy: 152, d: 0.25 },
  { cx: 150, cy: 70,  d: 0.31 },
  { cx: 190, cy: 55,  d: 0.35 },
  { cx: 230, cy: 60,  d: 0.39 },
  { cx: 102, cy: 104, d: 0.4 },
  { cx: 95,  cy: 140, d: 0.42 },
  { cx: 290, cy: 145, d: 0.44 },
  { cx: 240, cy: 155, d: 0.47 },
  { cx: 135, cy: 95,  d: 0.5 },
  { cx: 172, cy: 85,  d: 0.59 },
  { cx: 89,  cy: 77,  d: 0.63 },
  { cx: 212, cy: 78,  d: 0.67 },
  { cx: 289, cy: 91,  d: 0.77 },
];

const logisticRoutes = [
  // network of multiple curves for a sense of complex logistics
  "M65 110 Q140 100 215 68",   // Ouagadougou > Lagos
  "M100 80 Q180 70 245 100",   // Dakar > Cotonou
  "M140 150 Q180 125 250 100", // Abidjan > Lagos
  "M230 60 Q250 100 205 175",  // Nord > Sud 
  "M115 96 Q170 140 220 184",  // Afrique centrale Sud > Sud Est
];

// Trajet principal du camion animé
const truckPath = [
  { x: 85, y: 145, r: -8 },
  { x: 130, y: 120, r: -1 },
  { x: 180, y: 135, r: 9 },
  { x: 240, y: 111, r: 14 },
  { x: 270, y: 82, r: 22 },
];

export default function LandingHeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative flex justify-center items-center w-full z-10 select-none"
      style={{
        minHeight: "300px",
        height: "30vw", // Ratio pour desktop, adaptatif
        maxHeight: 470,
        minWidth: 270,
        marginTop: "-20px",
        marginBottom: "3px",
      }}
    >
      <svg
        viewBox="0 0 360 220"
        width="98%"
        height="auto"
        className="mx-auto drop-shadow-xl"
        fill="none"
        style={{
          maxWidth: 830,
          minWidth: 270,
          width: "100%",
          height: "auto",
          zIndex: 2,
        }}
        aria-label="Carte de l'Afrique : réseau logistique animé"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Shape stylisée du continent */}
        <motion.path
          d="M80,60 Q110,38 188,54 Q265,80 240,136 Q290,120 296,170 Q265,212 194,206 Q135,202 131,152 Q95,120 95,84 Q82,70 80,60 Z"
          fill="#FFD740"
          stroke="#263238"
          strokeWidth="2.8"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          style={{ filter: "drop-shadow(0 5px 40px #F9A82544)" }}
        />
        {/* Réseau de routes */}
        {logisticRoutes.map((p, idx) => (
          <motion.path
            key={idx}
            d={p}
            fill="none"
            stroke="#F9A825"
            strokeWidth="6"
            strokeDasharray="20 11"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2 + idx * 0.05, delay: 0.65 + idx * 0.08 }}
            style={{ opacity: 0.55, filter: "drop-shadow(0 0 10px #F9A82530)" }}
          />
        ))}
        {/* Hubs animés (cercle pulsant doux) */}
        {hubs.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.cx}
            cy={pt.cy}
            r="9"
            fill="#fff"
            stroke="#E65100"
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0.21 }}
            animate={{ scale: [0, 1.18, 1], opacity: [0.21, 1, 0.86] }}
            transition={{
              delay: pt.d,
              repeat: Infinity,
              repeatType: "mirror",
              duration: 2.3,
              ease: "easeInOut",
            }}
            style={{ filter: "drop-shadow(0 0 23px #F9A82522)" }}
          />
        ))}
        {/* Camion animé : suit le réseau principal */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.09, duration: 0.6 }}
        >
          <motion.g
            initial={false}
            animate={{
              x: truckPath.map((p) => p.x),
              y: truckPath.map((p) => p.y),
              rotate: truckPath.map((p) => p.r),
            }}
            transition={{
              duration: 3.7,
              delay: 1.25,
              repeat: Infinity,
              repeatType: "mirror",
              times: [0, 0.26, 0.5, 0.78, 1],
              ease: "easeInOut",
            }}
            style={{ cursor: "pointer" }}
          >
            {/* remorque */}
            <rect
              x="0"
              y="0"
              width="38"
              height="14"
              rx="3.5"
              fill="#E65100"
              stroke="#fff"
              strokeWidth="2"
              filter="url(#remorque-shadow)"
            />
            {/* cabine */}
            <rect
              x="29"
              y="-7"
              width="13"
              height="13"
              rx="2.5"
              fill="#1A3C40"
              stroke="#F9A825"
              strokeWidth="2"
            />
            {/* vitre */}
            <rect
              x="32"
              y="-4"
              width="6"
              height="7"
              rx="1"
              fill="#F9A825"
              opacity="0.84"
            />
            {/* roues */}
            <ellipse cx="10" cy="13.5" rx="3.3" ry="3.3" fill="#263238" />
            <ellipse cx="21" cy="13.5" rx="3.3" ry="3.3" fill="#263238" />
            <ellipse cx="36" cy="8" rx="3.3" ry="3.3" fill="#263238" />
          </motion.g>
          {/* ombre camion */}
          <ellipse
            cx="18"
            cy="23"
            rx="15"
            ry="4"
            fill="#1a3c4013"
            style={{ filter: "blur(3.5px)" }}
          />
        </motion.g>
        {/* Filtres */}
        <defs>
          <filter id="remorque-shadow" x="-4" y="1" width="54" height="18" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="2.8" floodColor="#E6510022" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
