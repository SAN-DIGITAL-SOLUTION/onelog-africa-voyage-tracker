import { useEffect, useState } from 'react';
import { Button, Card, Badge } from '@/components/ui-system';
// Les composants Alert, Tabs, TabsList, TabsTrigger, TabsContent sont à créer ou à remplacer par des versions du UI Kit maison

export default function AdminHomePage() {
  const [stats, setStats] = useState({ missions: 0, chauffeurs: 0, clients: 0 });

  useEffect(() => {
    // TODO : appeler une API ou Supabase pour charger les stats
    setStats({ missions: 42, chauffeurs: 12, clients: 30 });
  }, []);

  return (
    <div className="min-h-screen p-6 bg-[#F4F4F4] text-[#263238]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A3C40]">Dashboard Exploitant</h1>
        <p className="text-lg mt-1 text-gray-700">Vue d’ensemble en temps réel</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <h2 className="text-xl font-semibold">Missions</h2>
          <p className="text-3xl mt-2 font-bold text-[#E65100]">{stats.missions}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Chauffeurs</h2>
          <p className="text-3xl mt-2 font-bold text-[#E65100]">{stats.chauffeurs}</p>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold">Clients</h2>
          <p className="text-3xl mt-2 font-bold text-[#E65100]">{stats.clients}</p>
        </Card>
      </section>

      {/* Alert de maintenance (à remplacer par NotificationBanner ou composant Alert maison) */}
      <section className="mt-10">
        <div className="bg-[#F9A825] text-[#1A3C40] py-3 px-4 rounded shadow font-semibold">
          <span className="block text-lg">Maintenance planifiée</span>
          <span>Un redémarrage du service est prévu ce samedi à 2h GMT. Merci de prévenir vos clients.</span>
        </div>
      </section>

      {/* Tabs à remplacer par une version UI maison ou Radix UI si déjà intégré */}
      <section className="mt-10">
        <div className="flex gap-4 border-b mb-4">
          <button className="px-4 py-2 font-semibold text-[#E65100] border-b-2 border-[#E65100] bg-transparent">📦 Missions</button>
          <button className="px-4 py-2 font-semibold text-gray-500 border-b-2 border-transparent bg-transparent">🚚 Chauffeurs</button>
          <button className="px-4 py-2 font-semibold text-gray-500 border-b-2 border-transparent bg-transparent">👥 Clients</button>
        </div>
        <div>Contenu Missions à insérer ici</div>
      </section>
    </div>
  );
}
