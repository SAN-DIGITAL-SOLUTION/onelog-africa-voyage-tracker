
import { useEffect, useRef } from "react";
// Pour MVP, input clé API mapbox (voir instructions plus bas)
const MAPBOX_PUBLIC_TOKEN = "<votre-mapbox-public-token>";

export default function TrackingMap() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // À faire : intégrer la carte Mapbox GL JS avec MAPBOX_PUBLIC_TOKEN après config.
    // Placeholder pour l'intégration.
  }, []);

  return (
    <main className="container mx-auto pt-8">
      <h1 className="text-2xl font-bold mb-4">Carte de suivi missions</h1>
      <div className="border rounded-lg shadow-lg bg-white h-[450px] flex items-center justify-center text-gray-400">
        <span>À venir : intégration Mapbox pour tracer les missions en temps réel.</span>
      </div>
      <div className="mt-4">
        <label className="block font-semibold mb-1" htmlFor="mapbox-token">
          Token public Mapbox :
        </label>
        <input
          id="mapbox-token"
          type="text"
          className="border p-2 rounded w-full max-w-lg"
          placeholder="Collez votre clé publique Mapbox ici !"
        />
        <small>
          <a
            target="_blank"
            href="https://account.mapbox.com/access-tokens/"
            className="underline text-onelog-bleu ml-1"
            rel="noopener noreferrer"
          >
            Où trouver sa clé ?
          </a>
        </small>
      </div>
    </main>
  );
}
