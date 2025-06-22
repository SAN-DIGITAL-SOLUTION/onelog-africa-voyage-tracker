// fichier: src/pages/ClientDashboard.tsx
import { useEffect, useState } from 'react';
import { getClientMissions, getClientInvoices, getClientNotifications } from '../services/clientData';
import RequireAuth from '../components/RequireAuth';
import { SlideDownHeader } from '../components/SlideDownHeader';
import { CardFade } from '../components/CardFade';
import { AnimatedAfrica } from '../components/AnimatedAfrica';
import MissionList from '../components/MissionList';
import InvoiceList from '../components/InvoiceList';
import NotificationList from '../components/NotificationList';
import '../styles/animations.css';

export default function ClientDashboard() {
  const [missions, setMissions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getClientMissions().then(setMissions);
    getClientInvoices().then(setInvoices);
    getClientNotifications().then(setNotifications);
    // Analytics PostHog
    import('../services/analytics').then(({ trackEvent }) => {
      trackEvent('dashboard_viewed', { role: 'client' });
    });
  }, []);

  return (
    <RequireAuth role="client">
      <main className="flex flex-col gap-8 p-6">
        <SlideDownHeader
          title="Dashboard Client"
          illustration={<AnimatedAfrica />}
          onBack={() => window.history.back()}
        />
        <section>
          <CardFade>
            <h2 className="text-xl font-semibold mb-2">Missions récentes</h2>
            <MissionList missions={missions} />
          </CardFade>
        </section>
        <section className="flex flex-col sm:flex-row w-full gap-4">
          <CardFade className="w-full sm:w-1/2">
            <h2 className="text-xl font-semibold mb-2">Factures récentes</h2>
            <InvoiceList invoices={invoices} />
          </CardFade>
          <CardFade className="w-full sm:w-1/2">
            <h2 className="text-xl font-semibold mb-2">Notifications</h2>
            <NotificationList notifications={notifications} />
          </CardFade>
        </section>
      </main>
    </RequireAuth>
  );
}
