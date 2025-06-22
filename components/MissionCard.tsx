import MissionActions from "@/components/MissionActions";

export default function MissionCard({ mission }: { mission: any }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <div className="font-semibold">{mission.typeMarchandise}</div>
      <div className="text-sm text-gray-600">Départ : {mission.adresseDepart}</div>
      <div className="text-sm text-gray-600">Arrivée : {mission.adresseArrivee}</div>
      <div className="text-sm text-gray-600">Statut : <span className="font-semibold">{mission.status}</span></div>
      <div className="text-xs text-gray-400 mt-1">Mission #{mission.id?.slice(0, 8)}</div>
      <MissionActions mission={mission} />
    </div>
  );
}
