import React from 'react';
import { fetchStatusHistory } from '@/services/mission-status-history';
import { MissionStatusHistory } from '@/types/mission-status-history';

interface MissionStatusTimelineProps {
  missionId: string;
}

export const MissionStatusTimeline: React.FC<MissionStatusTimelineProps> = ({ missionId }) => {
  const [history, setHistory] = React.useState<MissionStatusHistory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    fetchStatusHistory(missionId)
      .then(setHistory)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [missionId]);

  if (loading) return <div>Chargement de l’historique…</div>;
  if (error) return <div className="text-red-600">Erreur : {error}</div>;
  if (!history.length) return <div>Aucun changement de statut enregistré.</div>;

  return (
    <ul className="timeline timeline-vertical my-4">
      {history.map((h, i) => (
        <li key={h.changed_at + h.new_status + i} className="mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{h.new_status}</span>
            <span className="text-xs text-gray-500">{new Date(h.changed_at).toLocaleString()}</span>
            <span className="text-xs text-gray-400">par {h.changed_by}</span>
          </div>
          {i > 0 && (
            <div className="text-xs text-gray-400 ml-6">(depuis : {history[i-1].new_status})</div>
          )}
        </li>
      ))}
    </ul>
  );
};
