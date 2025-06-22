import { useUpdateDemande } from "@/hooks/useUpdateDemande";

export default function DemandeCard({ demande, onStatusChange }: { demande: any, onStatusChange: () => void }) {
  const { updateDemandeStatus, loading, error } = useUpdateDemande();

  const handleAction = async (newStatus: "validée" | "refusée") => {
    const ok = await updateDemandeStatus(demande.id, newStatus);
    if (ok) onStatusChange();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between">
      <div className="flex-1">
        <div className="font-semibold text-lg mb-1">{demande.typeMarchandise}</div>
        <div className="text-sm text-gray-600">Volume : {demande.volume}</div>
        <div className="text-sm text-gray-600">Départ : {demande.adresseDepart}</div>
        <div className="text-sm text-gray-600">Arrivée : {demande.adresseArrivee}</div>
        <div className="text-sm text-gray-600">Date : {demande.dateSouhaitee}</div>
        <div className="text-xs text-gray-400 mt-1">Demande #{demande.trackingId?.slice(0, 8)}</div>
      </div>
      <div className="flex flex-col gap-2 mt-3 md:mt-0 md:ml-6">
        <button
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={() => handleAction("validée")}
          disabled={loading}
        >
          Valider
        </button>
        <button
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
          onClick={() => handleAction("refusée")}
          disabled={loading}
        >
          Refuser
        </button>
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  );
}
