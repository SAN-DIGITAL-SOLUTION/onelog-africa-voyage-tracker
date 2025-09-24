// src/pages/TrackingMap.tsx

import React from "react";
import MapComponent from "@/components/MapComponent";
import { useRealtimeMissions } from "@/hooks/useRealtimeMissions";

const TrackingMap: React.FC = () => {
  // Récupère les missions en temps réel depuis le hook métier
  const { missions, isLoading, error } = useRealtimeMissions();

  if (isLoading) {
    return <div className="p-4 text-center">Chargement des positions...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        Erreur lors du chargement des positions
      </div>
    );
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <MapComponent
        positions={missions}
      />
    </div>
  );
};

export default TrackingMap;