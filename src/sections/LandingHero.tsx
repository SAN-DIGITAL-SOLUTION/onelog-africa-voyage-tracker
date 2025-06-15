
import { motion } from "framer-motion";
import { Truck } from "lucide-react";
import LandingHeroIllustration from "./LandingHeroIllustration";

export default function LandingHero() {
  return (
    <section
      className="relative flex items-center justify-center min-h-[730px] md:min-h-[88vh] pb-0 md:pb-8 lg:pb-12 pt-20 md:pt-32 bg-[#F4F4F4] select-none"
      style={{ overflow: "hidden" }}
    >
      {/* Halo effet */}
      <div className="absolute left-1/2 top-[16%] -translate-x-1/2 z-0 pointer-events-none">
        <div
          className="w-[850px] h-[320px] rounded-full blur-[100px] opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, #F9A82577 34%, #F4F4F4 70%, #F4F4F400 100%)",
          }}
        />
      </div>

      {/* FLEX CONTAINER : deux colonnes */}
      <div className="relative flex flex-col md:flex-row gap-y-12 md:gap-y-0 w-full max-w-[1340px] px-3 sm:px-5 md:px-10 z-10">
        {/* COLONNE : Texte */}
        <div className="flex flex-col justify-center md:basis-1/2 w-full text-left md:pr-8">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 1.7 }}
            className="mb-4 flex items-center gap-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter drop-shadow-2xl font-montserrat leading-tight"
            style={{
              color: "#E65100",
              textShadow: "0 2px 18px #1A3C4033",
              letterSpacing: "-0.01em",
            }}
          >
            <Truck size={38} style={{ color: "#1A3C40", background: "#F9A825", borderRadius: 7, boxShadow: "0 2px 8px #E6510033" }}/>
            <span>
              Le futur de la logistique africaine<br className="hidden lg:inline" />
              commence ici
            </span>
          </motion.h1>

          {/* Slogan */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 2.0 }}
            className="max-w-xl mb-2 text-lg md:text-xl font-bold text-primary"
            style={{ color: "#263238", opacity: 0.97 }}
          >
            🌍 Conçue pour l’Afrique. Optimisée pour la logistique.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.19 }}
            className="max-w-xl mb-3 text-base md:text-lg font-semibold text-primary"
            style={{ color: "#1A3C40", opacity: 0.90 }}
          >
            OneLog Africa révolutionne le transport et la logistique panafricaine : localisation des expéditions, pilotage du flux et suivi des camions en temps réel, partout, avec technologie & transparence.<br className="hidden md:inline" />
            Optimisez vos trajets, documentez sans stress, connectez aisément vos partenaires et vos clients.
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 2.4 }}
            className="max-w-lg mb-7 text-[1.10rem] md:text-base text-secondary font-medium"
            style={{ color: "#E65100", opacity: 0.91 }}
          >
            « Vous attendez encore sur WhatsApp ? Passez à la logistique de nouvelle génération. »
          </motion.p>

          {/* CTA */}
          <motion.a
            href="#demo"
            initial={{ opacity: 0, scale: 0.94, y: 11 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.62 }}
            className="btn-cta mb-1 px-8 py-3 rounded-full font-bold shadow-cta text-lg hover:scale-105 transition-transform animate-fade-in w-fit"
            style={{
              background: "#E65100",
              color: "#fff",
              boxShadow: "0 3px 20px 0 #E651004a",
              fontSize: "1.10rem",
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
        </div>
        
        {/* COLONNE : Illustration */}
        <div className="flex items-center justify-center md:basis-1/2 w-full mt-4 md:mt-0">
          <div className="w-full max-w-[470px]">
            <LandingHeroIllustration />
          </div>
        </div>
      </div>

      {/* bas visuel */}
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
