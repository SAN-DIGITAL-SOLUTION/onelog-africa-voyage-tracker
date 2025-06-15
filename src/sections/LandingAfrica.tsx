
import { motion } from "framer-motion";

export default function LandingAfrica() {
  return (
    <section id="secteurs" className="py-16 px-4 md:px-10 bg-fresh/90 relative overflow-hidden">
      {/* Motif africain en fond */}
      <div className="absolute inset-0 african-texture z-0" aria-hidden />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className="w-full md:w-1/2"
        >
          {/* Interactive Africa map (minimal placeholder) */}
          <div className="rounded-2xl shadow-xl bg-gradient-to-br from-fresh/30 via-white/10 to-primary/90 p-6 md:p-10">
            <svg viewBox="0 0 200 200" width="220" height="180" className="mx-auto">
              {/* Simplified contour of Africa */}
              <path
                d="M38,28 Q70,7 136,24 Q163,19 170,49 Q185,113 156,165 Q130,201 76,183 Q35,153 38,78 Q39,45 38,28Z"
                fill="#1A3C40"
                stroke="#F9A825"
                strokeWidth={4}
              />
              {/* Markers (logistics points) */}
              <circle cx="70" cy="54" r="6" fill="#F9A825" />
              <circle cx="120" cy="42" r="5" fill="#E65100" />
              <circle cx="140" cy="82" r="5" fill="#009688" />
              <circle cx="100" cy="120" r="6" fill="#F9A825" />
              <circle cx="80" cy="170" r="5" fill="#009688" />
            </svg>
            <p className="text-sm text-center text-fresh mt-4 font-semibold">
              Plateforme panafricaine : +15 pays servis <span className="text-primary">🇸🇳 🇨🇮 🇧🇫 🇧🇯 🇨🇲 🇨🇩 🇬🇦 🇸🇨 …</span>
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-secondary mb-2 font-montserrat">
            Made in Africa
          </h2>
          <p className="text-lg text-primary/90 mb-2">
            Conçue sur le continent, par des logisticiens africains, pour relever vos défis et promouvoir l’excellence régionale.
          </p>
          {/* Témoignage sur fond africain */}
          <div className="relative bg-white/70 dark:bg-primary/80 rounded-lg p-5 shadow border border-secondary/20 flex flex-col gap-2">
            <div className="absolute inset-0 african-texture opacity-30 rounded-lg pointer-events-none z-0" aria-hidden />
            <span className="text-secondary font-bold relative z-10">“OneLog Africa nous a permis de digitaliser notre flotte et de dépasser nos objectifs !”</span>
            <span className="text-primary/70 text-sm mt-1 relative z-10">Seynabou N. — Transit Dakar</span>
          </div>
          <a
            href="#about"
            className="inline-block mt-2 px-6 py-2 text-white font-semibold rounded-full bg-fresh hover:scale-105 transition-transform ring-2 ring-fresh/40 shadow"
          >
            En savoir plus
          </a>
        </motion.div>
      </div>
    </section>
  );
}
