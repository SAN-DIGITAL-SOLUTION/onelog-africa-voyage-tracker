// Ensemble de composants animés OneLog Africa (Framer Motion + Tailwind CSS)
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import React from 'react';

// 1. Bouton CTA animé
export function AnimatedCTAButton({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0px 4px 12px rgba(230, 81, 0, 0.3)' }}
      whileTap={{ scale: 0.95 }}
      className="bg-[#E65100] text-white font-semibold px-6 py-3 rounded-xl transition-colors duration-300"
    >
      {children}
    </motion.button>
  );
}

// 2. Carte animée
export function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
    >
      {children}
    </motion.div>
  );
}

// 3. Carte SVG d’Afrique animée
// NB: nécessite un fichier SVG stylisé dans src/assets/africa.svg
import AfricaSVG from '../assets/africa.svg';
export function AfricaMapAnimated() {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto"
    >
      <AfricaSVG className="w-full h-auto opacity-60" />
    </motion.div>
  );
}

// 4. Camion en mouvement (header)
export function TruckAnimation() {
  return (
    <motion.div
      animate={{ x: ['-100%', '100%'] }}
      transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      className="absolute bottom-0 left-0"
    >
      <Truck size={36} color="#F9A825" />
    </motion.div>
  );
}

// 5. Section témoignage client animée
export function TestimonialCard({ name, message }: { name: string; message: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 120 }}
      className="bg-[#F4F4F4] rounded-xl p-4 border-l-4 border-[#009688] shadow-sm"
    >
      <p className="text-[#263238] italic">“{message}”</p>
      <p className="text-sm text-right font-semibold mt-2">– {name}</p>
    </motion.div>
  );
}
