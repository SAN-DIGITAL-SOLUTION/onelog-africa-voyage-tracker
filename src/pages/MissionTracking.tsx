// fichier : src/pages/MissionTracking.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import RequireAuth from '../components/RequireAuth';
import { SlideDownHeader } from '../components/SlideDownHeader';
import { CardFade } from '../components/CardFade';
import { AnimatedTruck } from '../components/AnimatedTruck';
import '../styles/animations.css';

export default function MissionTracking() {
  const { missionId } = useParams<{ missionId: string }>();

  React.useEffect(() => {
    if (missionId) {
      import('../services/analytics').then(({ trackEvent }) => {
        trackEvent('tracking_live_opened', { missionId, role: 'chauffeur' });
      });
    }
  }, [missionId]);

  return (
    <RequireAuth role="chauffeur">
      <main className="p-6 flex flex-col gap-8">
        <SlideDownHeader
          title="Suivi en temps réel"
          illustration={<AnimatedTruck />}
          onBack={() => window.history.back()}
        />
        <section>
          <CardFade>
            {missionId ? <LiveMap missionId={missionId} /> : <p>ID de mission manquant.</p>}
          </CardFade>
        </section>
      </main>
    </RequireAuth>
  );
}
