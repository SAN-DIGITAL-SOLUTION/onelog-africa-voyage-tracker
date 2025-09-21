// src/pages/TrackingMap.tsx

import React from "react";
import MapComponent from "@/components/MapComponent";
import { useRealtimePositions } from "@/hooks/useRealtimePositions";

const TrackingMap: React.FC = () => {
  // Récupère les positions en temps réel depuis le hook métier
  const { positions, isLoading, error } = useRealtimePositions();

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

  if (!positions || positions.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <MapComponent
        markers={positions.map((pos) => ({
          id: pos.vehicle_id,
          longitude: pos.longitude,
          latitude: pos.latitude,
        }))}
      />
    </div>
  );
};

export default TrackingMap;