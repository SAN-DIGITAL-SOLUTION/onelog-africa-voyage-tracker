
import React from "react";

type Mission = {
  ref: string;
  client: string;
  chauffeur?: string;
  date: string;
  status: string;
  type_de_marchandise?: string;
  volume?: number;
  poids?: number;
  lieu_enlevement?: string;
  lieu_livraison?: string;
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
      <div>
        <div className="text-sm text-gray-600">Type de marchandise</div>
        <div className="font-semibold">{mission.type_de_marchandise || <span className="italic text-onelog-nuit/40">Aucune</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Volume (m³)</div>
        <div className="font-semibold">{typeof mission.volume === "number" ? mission.volume : <span className="italic text-onelog-nuit/40">NC</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Poids (kg)</div>
        <div className="font-semibold">{typeof mission.poids === "number" ? mission.poids : <span className="italic text-onelog-nuit/40">NC</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Lieu d'enlèvement</div>
        <div className="font-semibold">{mission.lieu_enlevement || <span className="italic text-onelog-nuit/40">Non renseigné</span>}</div>
      </div>
      <div>
        <div className="text-sm text-gray-600">Lieu de livraison</div>
        <div className="font-semibold">{mission.lieu_livraison || <span className="italic text-onelog-nuit/40">Non renseigné</span>}</div>
      </div>
    </section>
  );
}
