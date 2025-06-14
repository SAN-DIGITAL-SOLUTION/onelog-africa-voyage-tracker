
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
  // (À terme : stocker Key dans un secret Supabase → edge function)
  return (
    <main className="container mx-auto pt-8">
      <h1 className="text-2xl font-bold mb-4">Suivi GPS des missions</h1>
      <div className="mb-4 space-y-2">
        <label className="block font-semibold" htmlFor="google-maps-apikey">
          Clé API Google Maps <span className="text-red-500">*</span> :
        </label>
        <input
          id="google-maps-apikey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Collez votre clé publique Google Maps ici !"
          className="border p-2 rounded w-full max-w-lg"
        />
        <small>
          <a
            target="_blank"
            href="https://console.cloud.google.com/apis/credentials"
            className="underline text-onelog-bleu ml-1"
            rel="noopener noreferrer"
          >
            Où trouver sa clé ?
          </a>
        </small>
      </div>
      {apiKey && (
        <GoogleMap
          apiKey={apiKey}
          markers={trackingPoints}
          showDirections={false}
          places={[]}
        />
      )}
      {loading && (
        <div className="text-gray-400 py-8 text-center">Chargement des points...</div>
      )}
      {!loading && trackingPoints.length === 0 && (
        <div className="mt-4 text-orange-700 bg-orange-50 px-4 py-2 rounded">
          Aucun point de tracking n’a été trouvé pour l’instant.
        </div>
      )}
      <div className="mt-6 text-gray-500 text-xs">
        <span>
          Ce module s’appuie sur Supabase pour récupérer les points GPS de mission, et Google Maps pour l’affichage interactif. Directions et Places pourront être ajoutés.
        </span>
      </div>
    </main>
  );
}
