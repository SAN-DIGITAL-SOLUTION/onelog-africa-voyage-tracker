// fichier: src/pages/ChauffeurDashboard.tsx
import { useEffect, useState, useRef } from 'react';
import { getChauffeurMissions, getChauffeurNotifications } from '../services/chauffeurData';
import { insertTrackingPoint } from '../services/chauffeurTracking';
import RequireAuth from '../components/RequireAuth';
import { SlideDownHeader } from '../components/SlideDownHeader';
import { CardFade } from '../components/CardFade';
import { AnimatedTruck } from '../components/AnimatedTruck';
import MissionList from '../components/MissionList';
import LiveMap from '../components/LiveMap';
import NotificationList from '../components/NotificationList';
import '../styles/animations.css';

export default function ChauffeurDashboard() {
  const [missions, setMissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    getChauffeurMissions().then(setMissions);
    getChauffeurNotifications().then(setNotifications);
    // Analytics PostHog
    import('../services/analytics').then(({ trackEvent }) => {
      trackEvent('dashboard_viewed', { role: 'chauffeur' });
    });
  }, []);

  // Géolocalisation live pour la mission sélectionnée
  useEffect(() => {
    if (!selectedMissionId) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          insertTrackingPoint(selectedMissionId, latitude, longitude).catch(console.error);
        },
        error => {
          console.error('Erreur géolocalisation:', error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [selectedMissionId]);

  return (
    <RequireAuth role="chauffeur">
      <main className="flex flex-col gap-8 p-6">
        <SlideDownHeader
          title="Dashboard Chauffeur"
          illustration={<AnimatedTruck />}
          onBack={() => window.history.back()}
        />
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="w-full lg:w-2/3">
            <CardFade>
              <h2 className="text-xl font-semibold mb-2">Missions à venir</h2>
              <MissionList missions={missions} onSelect={mission => setSelectedMissionId(mission.id)} />
            </CardFade>
            {selectedMissionId && (
              <CardFade className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Suivi en temps réel</h3>
                <LiveMap missionId={selectedMissionId} />
              </CardFade>
            )}
          </section>
          <section className="w-full lg:w-1/3">
            <CardFade>
              <h2 className="text-xl font-semibold mb-2">Notifications</h2>
              <NotificationList notifications={notifications} />
            </CardFade>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
