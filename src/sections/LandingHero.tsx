import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import LandingHeroIllustration from "./LandingHeroIllustration";

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

      {/* Illustration Afrique + animation camion */}
      <LandingHeroIllustration />

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
