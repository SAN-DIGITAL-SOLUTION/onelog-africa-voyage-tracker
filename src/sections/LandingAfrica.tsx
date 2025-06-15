
import { motion } from "framer-motion";

export default function LandingAfrica() {
  return (
    <section id="secteurs" className="py-16 px-4 md:px-10 bg-[#253d59]/90">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className="w-full md:w-1/2"
        >
          {/* Interactive Africa map (minimal placeholder) */}
          <div className="rounded-2xl shadow-xl bg-gradient-to-br from-onelog-citron/30 via-white/10 to-onelog-nuit/90 p-6 md:p-10">
            <svg viewBox="0 0 200 200" width="220" height="180" className="mx-auto">
              {/* Simplified contour of Africa */}
              <path
                d="M38,28 Q70,7 136,24 Q163,19 170,49 Q185,113 156,165 Q130,201 76,183 Q35,153 38,78 Q39,45 38,28Z"
                fill="#21243B"
                stroke="#B8FF28"
                strokeWidth={4}
              />
              {/* Markers (logistics points) */}
              <circle cx="70" cy="54" r="6" fill="#2196F3" />
              <circle cx="120" cy="42" r="5" fill="#B8FF28" />
              <circle cx="140" cy="82" r="5" fill="#B8FF28" />
              <circle cx="100" cy="120" r="6" fill="#2196F3" />
              <circle cx="80" cy="170" r="5" fill="#B8FF28" />
            </svg>
            <p className="text-sm text-center text-onelog-citron mt-4 font-semibold">
              Plateforme panafricaine : opérez dans plus de 15 pays <span className="text-white">🇸🇳 🇨🇮 🇧🇫 🇧🇯 🇨🇲 🇨🇩 🇬🇦 🇸🇨 ...</span>
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.15 }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-onelog-citron mb-2">
            Made in Africa
          </h2>
          <p className="text-lg text-white/90 mb-2">
            Conçue en Afrique, par des logisticiens africains, pour répondre aux défis logistiques et 
            promouvoir l’excellence locale et régionale.
          </p>
          {/* Témoignage/simple highlight */}
          <div className="bg-white/10 rounded-lg p-5 shadow backdrop-blur-lg border border-onelog-citron/20 flex flex-col gap-2">
            <span className="text-onelog-citron font-bold">“OneLog Africa nous a permis de digitaliser totalement notre flotte et de dépasser nos objectifs de ponctualité !”</span>
            <span className="text-white/70 text-sm mt-1">Seynabou N. — Transit Dakar</span>
          </div>
          <a
            href="#about"
            className="inline-block mt-2 px-6 py-2 text-white font-semibold rounded-full bg-onelog-bleu hover:scale-105 transition-transform ring-2 ring-onelog-bleu/40 shadow"
          >
            En savoir plus
          </a>
        </motion.div>
      </div>
    </section>
  );
}
