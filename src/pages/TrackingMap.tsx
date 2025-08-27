import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import GoogleMap from "@/components/GoogleMap";

type TrackingPoint = {
  id: string;
  mission_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  created_at: string;
};

export default function TrackingMap() {
  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [apiKey, setApiKey] = useState<string>(""); // TODO: Stocker via secret Supabase
  const [loading, setLoading] = useState(false);

  // Récupère côté Supabase tous les tracking points (pour le MVP, on prend tout)
  useEffect(() => {
    setLoading(true);
    supabase
      .from("tracking_points")
      .select("*")
      .then((res) => {
        setTrackingPoints(res.data ?? []);
        setLoading(false);
      });
  }, []);

  // Pour la démo, invite à coller la clé API
  // (À terme : stocker Key dans un secret Supabase → edge function)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">🌍 Suivi GPS des missions</h1>
            <p className="text-blue-100">Géolocalisation en temps réel des véhicules OneLog Africa</p>
          </div>

          {/* API Key Section */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="max-w-2xl">
              <label className="block text-lg font-semibold text-gray-700 mb-3" htmlFor="google-maps-apikey">
                🔑 Clé API Google Maps <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  id="google-maps-apikey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Collez votre clé publique Google Maps ici..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <a
                  target="_blank"
                  href="https://console.cloud.google.com/apis/credentials"
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  rel="noopener noreferrer"
                >
                  📋 Obtenir une clé
                </a>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                💡 La clé API permet d'afficher la carte interactive avec les positions GPS des véhicules
              </p>
            </div>
          </div>

          {/* Map Container */}
          <div className="p-6">
            {apiKey ? (
              <div className="rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
                <GoogleMap
                  apiKey={apiKey}
                  markers={trackingPoints}
                  showDirections={false}
                  places={[]}
                />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Carte Google Maps
                </h3>
                <p className="text-gray-600 mb-4">
                  Saisissez votre clé API Google Maps ci-dessus pour afficher la carte interactive
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    🚛 Cette carte affichera en temps réel les positions GPS de tous vos véhicules en mission
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div className="px-6 pb-6">
            {loading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                <span className="text-yellow-800 font-medium">Chargement des points GPS...</span>
              </div>
            )}
            
            {!loading && trackingPoints.length === 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-orange-800 font-medium">Aucun point de tracking trouvé</p>
                  <p className="text-orange-600 text-sm">Les positions GPS des véhicules apparaîtront ici une fois les missions démarrées</p>
                </div>
              </div>
            )}
            
            {!loading && trackingPoints.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-green-800 font-medium">
                    {trackingPoints.length} point{trackingPoints.length > 1 ? 's' : ''} GPS détecté{trackingPoints.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-green-600 text-sm">Positions des véhicules mises à jour en temps réel</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">🔧</span>
              <span>
                <strong>Fonctionnement :</strong> Ce module récupère les coordonnées GPS depuis Supabase (table tracking_points) 
                et les affiche sur Google Maps pour un suivi logistique en temps réel.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
