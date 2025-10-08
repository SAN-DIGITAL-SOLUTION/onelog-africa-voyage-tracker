// fichier : src/pages/DashboardAccueil.tsx
import { motion } from 'framer-motion';
import AnimatedCTAButton from '../components/ui/AnimatedCTAButton';
import AnimatedCard from '../components/ui/AnimatedCard';
import TruckAnimation from '../components/ui/TruckAnimation';
import AfricaMapAnimated from '../components/ui/AfricaMapAnimated';

export default function DashboardAccueil() {
  return (
    <div className="relative bg-[#F4F4F4] min-h-screen p-8">
      {/* Camion animé en bas de page */}
      <TruckAnimation />

      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-[#1A3C40]">Bienvenue dans le tableau de bord OneLog Africa</h1>
        <p className="text-[#263238] mt-2">
          Visualisez vos missions, chauffeurs et clients en temps réel.
        </p>
      </motion.header>

      {/* CTA principal */}
      <div className="mb-10">
        <AnimatedCTAButton>Créer une mission</AnimatedCTAButton>
      </div>

      {/* Cartes animées */}
      <div className="grid md:grid-cols-3 gap-6">
        <AnimatedCard>
          <h2 className="text-xl font-semibold text-[#1A3C40]">Missions actives</h2>
          <p className="text-[#263238] text-sm">24 missions en cours, 8 affectées ce matin.</p>
        </AnimatedCard>

        <AnimatedCard>
          <h2 className="text-xl font-semibold text-[#1A3C40]">Chauffeurs connectés</h2>
          <p className="text-[#263238] text-sm">12 chauffeurs géolocalisés en ce moment.</p>
        </AnimatedCard>

        <AnimatedCard>
          <h2 className="text-xl font-semibold text-[#1A3C40]">Alertes</h2>
          <p className="text-[#263238] text-sm">2 missions dépassent les délais estimés.</p>
        </AnimatedCard>
      </div>

      {/* Carte stylisée Afrique */}
      <div className="mt-16">
        <h3 className="text-2xl font-semibold text-[#1A3C40] mb-4">Vue d’ensemble géographique</h3>
        <AfricaMapAnimated />
      </div>
    </div>
  );
}
