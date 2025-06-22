import { useEffect, useState } from 'react';
import { getAllUsers, getAllMissions, getAllInvoices } from '../services/adminData';
import RequireAuth from '../components/RequireAuth';
import { SlideDownHeader } from '../components/SlideDownHeader';
import { CardFade } from '../components/CardFade';
import { AnimatedAfrica } from '../components/AnimatedAfrica';
import '../styles/animations.css';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    import('../services/analytics').then(({ trackEvent }) => {
      trackEvent('dashboard_viewed', { role: 'admin' });
    });
    getAllUsers().then(setUsers);
    getAllMissions().then(setMissions);
    getAllInvoices().then(setInvoices);
  }, []);

  return (
    <RequireAuth role="admin">
      <main className="flex flex-col gap-8 p-6">
        <SlideDownHeader
          title="Dashboard Exploitant / Admin"
          illustration={<AnimatedAfrica />}
          onBack={() => window.history.back()}
        />
        <section>
          <CardFade>
            <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
            <p>{users.length} utilisateur(s) enregistrés</p>
          </CardFade>
        </section>
        <section>
          <CardFade>
            <h2 className="text-xl font-semibold mb-2">Missions</h2>
            <p>{missions.length} mission(s) suivie(s)</p>
          </CardFade>
        </section>
        <section>
          <CardFade>
            <h2 className="text-xl font-semibold mb-2">Factures</h2>
            <p>{invoices.length} facture(s) générée(s)</p>
          </CardFade>
        </section>
      </main>
    </RequireAuth>
  );
}
