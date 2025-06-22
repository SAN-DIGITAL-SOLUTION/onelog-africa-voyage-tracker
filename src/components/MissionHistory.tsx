// fichier : src/components/MissionHistory.tsx
import React from 'react';

type Mission = {
  id: string;
  title: string;
  status: string;
  check_in_time: string;
  check_out_time: string;
};

function formatDuration(start: string, end: string) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const minutes = Math.floor((d2.getTime() - d1.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
}

export default function MissionHistory({ missions }: { missions: Mission[] }) {
  if (!missions.length) return <p>Aucune mission terminée.</p>;

  return (
    <ul className="space-y-3">
      {missions.map(m => (
        <li key={m.id} className="bg-secondary/10 p-4 rounded">
          <div className="font-semibold text-lg">{m.title}</div>
          <div>Début : {new Date(m.check_in_time).toLocaleString()}</div>
          <div>Fin : {new Date(m.check_out_time).toLocaleString()}</div>
          <div>Durée : {formatDuration(m.check_in_time, m.check_out_time)}</div>
        </li>
      ))}
    </ul>
  );
}
