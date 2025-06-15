
import { motion } from "framer-motion";

// Coordonnées des hubs logistiques (points sur la carte)
const gpsPoints = [
  { cx: 172, cy: 90, delay: 0.25 },
  { cx: 150, cy: 124, delay: 0.38 },
  { cx: 194, cy: 132, delay: 0.47 },
  { cx: 218, cy: 100, delay: 0.55 },
  { cx: 201, cy: 68, delay: 0.63 },
  { cx: 243, cy: 130, delay: 0.72 },
  { cx: 210, cy: 157, delay: 0.80 },
  { cx: 140, cy: 77, delay: 0.89 },
];

// Points pour le trajet du camion
const truckPath = "M135 60 Q185 100 217 170";

// Pour l'animation du camion sur la route
const truckPathMove = [
  { x: 135, y: 60, r: -8 },
  { x: 175, y: 100, r: 8 },
  { x: 217, y: 170, r: 18 },
];

/**
 * Illustration SVG de l'Afrique, avec animation camion et hubs, pour la LandingHero.
 */
export default function LandingHeroIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative w-full max-w-2xl mx-auto z-10"
      style={{ marginTop: 0 }}
    >
      <svg
        width="400"
        height="220"
        viewBox="0 0 340 210"
        fill="none"
        className="mx-auto relative z-10"
        aria-label="Carte de l'Afrique logistique, hubs, route et camion animé"
      >
        {/* Carte simplifiée Afrique */}
        <motion.path
          d="M110,56 Q142,36 185,56 Q235,82 217,136 Q246,120 250,164 Q227,197 185,186 Q144,193 138,150 Q108,121 109,80 Q105,62 110,56 Z"
          fill="#FFD740"
          stroke="#263238"
          strokeWidth="2.5"
          initial={{ pathLength: 0, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.2 }}
          style={{ filter: "drop-shadow(0 2px 18px #F9A82533)" }}
        />
        {/* Route logistique */}
        <motion.path
          d={truckPath}
          fill="none"
          stroke="#1A3C40"
          strokeWidth="5"
          strokeDasharray="12 9"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          style={{ filter: "drop-shadow(0 0 10px #F9A82555)" }}
        />
        {/* Points/hubs animés */}
        {gpsPoints.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.cx}
            cy={pt.cy}
            r="7"
            fill="#fff"
            stroke="#E65100"
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: [0, 1.1, 1], opacity: [0.3, 1, 0.9] }}
            transition={{
              delay: pt.delay,
              repeat: Infinity,
              repeatType: "mirror",
              duration: 1.9,
              ease: "easeInOut",
            }}
            style={{ filter: "drop-shadow(0 0 14px #F9A82522)" }}
          />
        ))}
        {/* Camion animé sur la route */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.15, duration: 0.6 }}
        >
          {/* Camion principal style logistique */}
          <motion.g
            initial={false}
            animate={{
              x: [truckPathMove[0].x, truckPathMove[1].x, truckPathMove[2].x],
              y: [truckPathMove[0].y, truckPathMove[1].y, truckPathMove[2].y],
              rotate: [truckPathMove[0].r, truckPathMove[1].r, truckPathMove[2].r],
            }}
            transition={{
              duration: 2.4,
              delay: 1.2,
              repeat: Infinity,
              repeatType: "mirror",
              times: [0, 0.55, 1],
              ease: "easeInOut",
            }}
            style={{ cursor: "pointer" }}
          >
            {/* Remorque */}
            <rect
              x="0"
              y="0"
              width="37"
              height="15"
              rx="3.5"
              fill="#E65100"
              stroke="#fff"
              strokeWidth="2"
              filter="url(#remorque-shadow)"
            />
            {/* Cabine */}
            <rect
              x="28"
              y="-7"
              width="13"
              height="13"
              rx="2.5"
              fill="#1A3C40"
              stroke="#F9A825"
              strokeWidth="2"
            />
            {/* Vitre */}
            <rect
              x="32"
              y="-4"
              width="5"
              height="8"
              rx="1"
              fill="#F9A825"
              opacity="0.78"
            />
            {/* Roues */}
            <ellipse cx="8" cy="15" rx="3.3" ry="3.3" fill="#263238" />
            <ellipse cx="18.5" cy="15" rx="3.3" ry="3.3" fill="#263238" />
            <ellipse cx="36" cy="8" rx="3.3" ry="3.3" fill="#263238" />
          </motion.g>
          {/* Ombre sous le camion */}
          <ellipse
            cx="18"
            cy="20"
            rx="13"
            ry="3.8"
            fill="#1a3c4011"
            style={{ filter: "blur(2.5px)" }}
          />
        </motion.g>
        {/* Filtres SVG */}
        <defs>
          <filter id="remorque-shadow" x="-6" y="-1" width="50" height="20" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#E6510022" />
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}
