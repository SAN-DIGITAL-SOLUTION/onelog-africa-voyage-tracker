import { useState } from "react";
import { useIncident } from "@/hooks/useIncident";

export default function IncidentModal({ missionId, onClose }: { missionId: string, onClose: () => void }) {
  const [description, setDescription] = useState("");
  const { createIncident, loading, error, success } = useIncident();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createIncident(missionId, description);
    setDescription("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">Signaler un incident</h2>
        <textarea
          className="w-full border rounded p-2 mb-3"
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Décrivez l'incident..."
          required
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">Annuler</button>
          <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded" disabled={loading}>Envoyer</button>
        </div>
        {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
        {success && <div className="text-green-600 text-xs mt-2">Incident signalé !</div>}
      </form>
    </div>
  );
}
