// fichier: src/components/MissionList.tsx
import React from 'react';
import { checkIn, checkOut } from '../services/chauffeurData';

type Mission = {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date?: string;
  checked_in: boolean;
  checked_out: boolean;
};

export default function MissionList({ missions, onSelect }: { missions: Mission[]; onSelect?: (mission: Mission) => void }) {
  const handleCheckIn = async (missionId: string) => {
    await checkIn(missionId);
    window.location.reload();
  };

  const handleCheckOut = async (missionId: string) => {
    await checkOut(missionId);
    window.location.reload();
  };

  if (!missions.length) return <p>Aucune mission en cours.</p>;


  return (
    <ul className="space-y-4">
      {missions.map(m => (
        <li key={m.id} className="p-4 rounded bg-secondary/10 shadow cursor-pointer hover:bg-secondary/20" onClick={() => onSelect && onSelect(m)}>
          <div className="font-semibold text-lg">{m.title}</div>
          <div>Status : {m.status}</div>
          <div>Début : {new Date(m.start_date).toLocaleDateString()}</div>
          {m.end_date && <div>Fin : {new Date(m.end_date).toLocaleDateString()}</div>}
          <div className="mt-2 flex gap-2">
            {!m.checked_in && (
              <button
                onClick={() => handleCheckIn(m.id)}
                className="px-4 py-1 bg-green-600 text-white rounded"
              >
                ✅ Check-in
              </button>
            )}
            {m.checked_in && !m.checked_out && (
              <button
                onClick={() => handleCheckOut(m.id)}
                className="px-4 py-1 bg-yellow-600 text-white rounded"
              >
                🕓 Check-out
              </button>
            )}
            {m.checked_out && <span className="text-sm text-gray-500">✔ Mission terminée</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
