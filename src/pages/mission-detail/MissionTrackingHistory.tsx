
import React from "react";

// TODO: Adapter selon votre modèle de donnée
type TrackingPoint = {
  id: string | number;
  label: string;
  timestamp: string;
};

type Props = {
  points: TrackingPoint[];
};

export default function MissionTrackingHistory({ points }: Props) {
  if (!points || points.length === 0) {
    return (
      <section className="pt-4">
        <div className="italic text-onelog-nuit/40">Aucun historique de suivi trouvé.</div>
      </section>
    );
  }
  return (
    <section className="pt-4">
      <h3 className="font-semibold mb-2">Historique de suivi</h3>
      <ul className="space-y-1">
        {points.map((pt) => (
          <li key={pt.id} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-onelog-bleu rounded-full inline-block" />
            <span>{pt.label}</span>
            <span className="ml-auto text-xs text-gray-400">{pt.timestamp}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
