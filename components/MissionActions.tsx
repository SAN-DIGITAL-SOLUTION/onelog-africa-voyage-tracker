import { useState } from "react";
import { useMissionActions } from "@/hooks/useMissionActions";
import IncidentModal from "@/components/IncidentModal";
import SignatureModal from "@/components/SignatureModal";

export default function MissionActions({ mission }: { mission: any }) {
  const { acceptMission, refuseMission, startMission, completeMission, loading, error } = useMissionActions();
  const [showIncident, setShowIncident] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {mission.status === "en_attente" && (
        <>
          <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50" onClick={() => acceptMission(mission.id)} disabled={loading}>Accepter</button>
          <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50" onClick={() => refuseMission(mission.id)} disabled={loading}>Refuser</button>
        </>
      )}
      {mission.status === "acceptée" && (
        <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50" onClick={() => startMission(mission.id)} disabled={loading}>Démarrer mission</button>
      )}
      {(mission.status === "en_cours" || mission.status === "acceptée") && (
        <button className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50" onClick={() => setShowIncident(true)} disabled={loading}>Signaler incident</button>
      )}
      {mission.status === "en_cours" && (
        <button className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 disabled:opacity-50" onClick={() => setShowSignature(true)} disabled={loading}>Terminer mission</button>
      )}
      {error && <span className="text-red-500 text-xs">{error}</span>}
      {showIncident && <IncidentModal missionId={mission.id} onClose={() => setShowIncident(false)} />}
      {showSignature && <SignatureModal missionId={mission.id} onClose={() => setShowSignature(false)} />}
    </div>
  );
}
