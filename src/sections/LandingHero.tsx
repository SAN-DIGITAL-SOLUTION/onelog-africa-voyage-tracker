
import { motion } from "framer-motion";
import { Truck } from "lucide-react";

export default function LandingHero() {
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

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[92vh] pt-36 pb-14 text-center select-none"
      style={{ background: "#F4F4F4" }}
    >
      {/* Effet halo logistique */}
      <div className="absolute left-1/2 top-[18%] -translate-x-1/2 z-0 pointer-events-none">
        <div
          className="w-[480px] h-[190px] rounded-full blur-[70px] opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, #F9A82588 30%, #F4F4F4 75%, #F4F4F400 100%)",
          }}
        />
      </div>
      {/* Illustration Afrique avec route & camion animé */}
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
      {/* Titre principal avec icône camion évocateur */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, delay: 1.7 }}
        className="mt-8 mb-3 flex items-center justify-center gap-3 text-3xl md:text-5xl font-extrabold tracking-tighter drop-shadow-2xl font-montserrat leading-tight"
        style={{
          color: "#E65100",
          textShadow: "0 2px 18px #1A3C4033",
          letterSpacing: "-0.01em",
        }}
      >
        <Truck size={42} style={{ color: "#1A3C40", background: "#F9A825", borderRadius: 7, boxShadow: "0 2px 8px #E6510033" }}/>
        <span>
          Le futur de la logistique africaine
          <br className="hidden md:inline" />
          commence ici
        </span>
      </motion.h1>
      {/* Slogan / sous-titre inspirant */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 2.0 }}
        className="max-w-xl mx-auto mb-2 text-xl md:text-2xl font-bold text-primary"
        style={{ color: "#263238", opacity: 0.97 }}
      >
        🌍 Conçue pour l’Afrique. Optimisée pour la logistique.
      </motion.p>
      {/* Description / pitch synthétique */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.19 }}
        className="max-w-xl mx-auto mb-3 text-base md:text-xl font-semibold text-primary"
        style={{ color: "#1A3C40", opacity: 0.90 }}
      >
        OneLog Africa révolutionne le transport et la logistique panafricaine : localisation des expéditions, pilotage du flux et suivi des camions en temps réel, partout, avec technologie & transparence.<br className="hidden md:inline" />
        Optimisez vos trajets, documentez sans stress, connectez aisément vos partenaires et vos clients.
      </motion.p>
      {/* Micro-texte contextuel */}
      <motion.p
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 2.4 }}
        className="max-w-lg mx-auto mb-7 text-[1.13rem] md:text-lg text-secondary font-medium"
        style={{ color: "#E65100", opacity: 0.91 }}
      >
        « Vous attendez encore sur WhatsApp ? Passez à la logistique de nouvelle génération. »
      </motion.p>
      {/* CTA animé */}
      <motion.a
        href="#demo"
        initial={{ opacity: 0, scale: 0.94, y: 11 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.62 }}
        className="btn-cta mb-1 px-8 py-3 rounded-full font-bold shadow-cta text-lg hover:scale-105 transition-transform animate-fade-in"
        style={{
          background: "#E65100",
          color: "#fff",
          boxShadow: "0 3px 20px 0 #E651004a",
          fontSize: "1.12rem",
          letterSpacing: "0.01em",
          display: "inline-block",
        }}
      >
        <motion.span
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.13, 1] }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          👉 Démarrer gratuitement&nbsp;–&nbsp;14&nbsp;jours sans engagement
        </motion.span>
        <div className="block text-xs mt-1 font-semibold" style={{ opacity: 0.98 }}>
          <span className="text-[#F9A825]">Essai sans CB</span>, support local inclus.
        </div>
      </motion.a>
      {/* Séparateur visuel arrondi en bas */}
      <div
        className="absolute z-0 w-full left-0 bottom-0 h-16 pointer-events-none select-none"
        style={{
          background: "linear-gradient(to bottom, #F4F4F4 10%, #1A3C40 100%)",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          opacity: 0.96,
        }}
      />
    </section>
  );
}
