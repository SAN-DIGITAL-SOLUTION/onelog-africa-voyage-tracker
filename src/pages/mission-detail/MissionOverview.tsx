
import React from "react";

type Mission = {
  ref: string;
  client: string;
  chauffeur?: string;
  date: string;
  status: string;
};

type Props = {
  mission: Mission;
};

export default function MissionOverview({ mission }: Props) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
      <div>
        <div className="text-sm text-gray-600">Référence</div>
        <div className="font-semibold">{mission.ref}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Client</div>
        <div className="font-semibold">{mission.client}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Chauffeur</div>
        <div className="font-semibold">{mission.chauffeur || <span className="italic text-onelog-nuit/40">Aucun</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Date</div>
        <div className="font-semibold">{mission.date}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Statut</div>
        <div className="font-semibold">{mission.status}</div>
      </div>
    </section>
  );
}
