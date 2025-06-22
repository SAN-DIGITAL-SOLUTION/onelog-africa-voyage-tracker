import { useState } from "react";
import { useChauffeursDisponibles } from "@/hooks/useChauffeursDisponibles";
import { useCreateMission } from "@/hooks/useCreateMission";
import { notifyChauffeur } from "@/services/notificationService";

export default function AffectationForm({ demande, onAffectation }: { demande: any, onAffectation: () => void }) {
  const { chauffeurs, loading: loadingChauffeurs, error: errorChauffeurs } = useChauffeursDisponibles();
  const { createMission, loading: loadingMission, error: errorMission } = useCreateMission();
  const [chauffeurId, setChauffeurId] = useState("");
  // Optionnel: gérer le véhicule
  const [vehiculeId, setVehiculeId] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chauffeurId) return;
    const mission = await createMission({ demande_id: demande.id, chauffeur_id: chauffeurId, vehicule_id: vehiculeId || undefined });
    if (mission) {
      await notifyChauffeur(chauffeurId, `Nouvelle mission assignée (demande #${demande.trackingId})`);
      setSuccess(true);
      onAffectation();
    }
  };

  if (success) return <div className="p-4 text-green-700">Affectation réussie !</div>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded shadow">
      <label>Chauffeur disponible :</label>
      <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)} required className="input">
        <option value="">Sélectionner un chauffeur</option>
        {chauffeurs.map((ch) => (
          <option key={ch.id} value={ch.id}>{ch.nom} {ch.prenom} ({ch.phone})</option>
        ))}
      </select>
      {/* Optionnel: sélection véhicule */}
      {/* <input value={vehiculeId} onChange={e => setVehiculeId(e.target.value)} placeholder="ID véhicule (optionnel)" className="input" /> */}
      <button type="submit" disabled={loadingMission || loadingChauffeurs} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
        Affecter le chauffeur
      </button>
      {errorChauffeurs && <span className="text-red-500">{errorChauffeurs}</span>}
      {errorMission && <span className="text-red-500">{errorMission}</span>}
    </form>
  );
}
