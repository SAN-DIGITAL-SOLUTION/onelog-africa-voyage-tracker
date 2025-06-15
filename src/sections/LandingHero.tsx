
import { motion } from "framer-motion";

/**
 * Hero storytelling : claim refait, nouvelle illustration animée (map Afrique, points, camion), micro-texte et CTA.
 */
export default function LandingHero() {
  // Liste des points GPS pour l’Afrique (simplifiés)
  const gpsPoints = [
    { cx: 170, cy: 80, delay: 0.32 },
    { cx: 155, cy: 115, delay: 0.54 },
    { cx: 188, cy: 130, delay: 0.68 },
    { cx: 220, cy: 98, delay: 0.78 },
    { cx: 206, cy: 65, delay: 0.91 },
    { cx: 252, cy: 120, delay: 1.03 },
    { cx: 210, cy: 153, delay: 1.11 },
    { cx: 135, cy: 66, delay: 1.19 },
  ];

  // Chemin du camion (ligne simple coupant l’Afrique, du nord-ouest vers le sud-est)
  const camionPath = "M140 50 Q195 80 220 150";

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[92vh] pt-36 pb-14 text-center select-none"
      style={{ background: "#F4F4F4" }}
    >
      {/* Illustration/effet de halo derrière */}
      <div className="absolute left-1/2 top-[18%] -translate-x-1/2 z-0 pointer-events-none">
        <div
          className="w-[430px] h-[170px] rounded-full blur-[60px] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at center, #F9A82599 20%, #F4F4F4 65%, #F4F4F400 100%)",
          }}
        />
      </div>
      {/* Illustration Afrique + points + camion */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full max-w-2xl mx-auto z-10"
        style={{ marginTop: 0 }}
      >
        <svg
          width="400"
          height="200"
          viewBox="0 0 340 200"
          fill="none"
          className="mx-auto relative z-10"
          aria-label="Carte de l'Afrique, points GPS, camion animé"
        >
          {/* Carte simplifiée de l’Afrique */}
          <motion.path
            d="M110,46 Q140,28 180,40 Q230,67 215,115 Q238,108 243,148 Q221,187 181,176 Q140,183 135,143 Q108,111 108,75 Q105,54 110,46 Z"
            fill="#FFD740"
            stroke="#263238"
            strokeWidth="2.5"
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.25 }}
            style={{ filter: "drop-shadow(0 2px 18px #F9A82533)" }}
          />
          {/* Points GPS animés */}
          {gpsPoints.map((pt, i) => (
            <motion.circle
              key={i}
              cx={pt.cx}
              cy={pt.cy}
              r="6"
              fill="#E65100"
              stroke="#fff"
              strokeWidth="2.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.92 }}
              transition={{ delay: pt.delay, type: "spring", stiffness: 170 }}
              style={{ filter: "drop-shadow(0 0 8px #E6510080)" }}
            />
          ))}
          {/* Chemin du camion */}
          <motion.path
            d={camionPath}
            fill="none"
            stroke="#1A3C40"
            strokeWidth="3.3"
            strokeDasharray="7 9"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.09, delay: 1.25 }}
            style={{ filter: "drop-shadow(0 0 8px #1A3C4040)" }}
          />
          {/* Camion animé suivant le chemin */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.37, duration: 0.3 }}
          >
            <motion.rect
              // Animation de déplacement du camion sur le chemin
              width="35"
              height="17"
              rx="4"
              fill="#E65100"
              style={{
                filter: "drop-shadow(0 2px 8px #E6510020)",
              }}
              initial={false}
              animate={{
                x: [140, 180, 217],
                y: [41, 73, 142],
                rotate: [0, 16, 27],
              }}
              transition={{
                duration: 2.1,
                delay: 1.36,
                repeat: Infinity,
                repeatType: "mirror",
                times: [0, 0.48, 1],
                ease: "easeInOut",
              }}
            />
            {/* Cabine du camion */}
            <motion.rect
              width="11"
              height="8"
              rx="2"
              fill="#F9A825"
              initial={false}
              animate={{
                x: [165, 205, 241],
                y: [44, 76, 146],
                rotate: [0, 16, 27],
              }}
              transition={{
                duration: 2.1,
                delay: 1.36,
                repeat: Infinity,
                repeatType: "mirror",
                times: [0, 0.48, 1],
                ease: "easeInOut",
              }}
            />
            {/* Roue avant */}
            <motion.ellipse
              rx="3"
              ry="3"
              fill="#263238"
              initial={false}
              animate={{
                cx: [147, 187, 224],
                cy: [57, 89, 158],
              }}
              transition={{
                duration: 2.1,
                delay: 1.36,
                repeat: Infinity,
                repeatType: "mirror",
                times: [0, 0.48, 1],
                ease: "easeInOut",
              }}
            />
            {/* Roue arrière */}
            <motion.ellipse
              rx="3"
              ry="3"
              fill="#1A3C40"
              initial={false}
              animate={{
                cx: [161, 201, 237],
                cy: [57, 89, 158],
              }}
              transition={{
                duration: 2.1,
                delay: 1.36,
                repeat: Infinity,
                repeatType: "mirror",
                times: [0, 0.48, 1],
                ease: "easeInOut",
              }}
            />
          </motion.g>
        </svg>
      </motion.div>
      {/* Titre principal ergonomique */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.12, delay: 1.54 }}
        className="mt-8 mb-3 text-3xl md:text-5xl font-extrabold tracking-tighter drop-shadow-2xl font-montserrat leading-tight"
        style={{
          color: "#E65100",
          textShadow: "0 2px 18px #1A3C4033",
          letterSpacing: "-0.01em",
        }}
      >
        🚛 Le futur de la logistique africaine<br className="hidden md:inline" /> commence ici
      </motion.h1>
      {/* Slogan / sous-titre inspirant */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, delay: 1.92 }}
        className="max-w-xl mx-auto mb-2 text-xl md:text-2xl font-bold text-primary"
        style={{ color: "#263238", opacity: 0.98 }}
      >
        🌍 Pensée en Afrique. Construite pour l’Afrique.
      </motion.p>
      {/* Description / pitch synthétique */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.05, delay: 2.10 }}
        className="max-w-xl mx-auto mb-3 text-base md:text-xl font-semibold text-primary"
        style={{ color: "#1A3C40", opacity: 0.89 }}
      >
        OneLog Africa est la solution digitale panafricaine qui réinvente le transport et la logistique, avec fierté, efficacité et technologie.<br className="hidden md:inline" />
        Fini les silences radio, les documents perdus, les camions fantômes.<br className="hidden md:inline" />
        🎯 Pilotez vos flux, tracez vos colis, optimisez vos coûts. En temps réel.
      </motion.p>
      {/* Micro-texte contextuel */}
      <motion.p
        initial={{ opacity: 0, y: 7 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2.38 }}
        className="max-w-lg mx-auto mb-7 text-[1.1rem] md:text-lg text-secondary font-medium"
        style={{ color: "#E65100", opacity: 0.91 }}
      >
        « Vous attendez encore sur WhatsApp pour savoir où est votre marchandise ? Il est temps de passer au niveau supérieur. »
      </motion.p>
      {/* CTA animé */}
      <motion.a
        href="#demo"
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.98, delay: 2.64 }}
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
          animate={{ scale: [1, 1.10, 1] }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.7,
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
