
import React, { useEffect, useRef } from "react";

// Import Google Maps types only for type checking (won't pull in runtime code)
import type {} from "google.maps";

type TrackingPoint = {
  id: string;
  mission_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
  created_at: string;
};

type GoogleMapProps = {
  apiKey: string;
  markers: TrackingPoint[];
  showDirections?: boolean;
  places?: any[];
};

// Specify the type directly instead of using the google.maps types before they are loaded
const DEFAULT_CENTER = { lat: 7.3775, lng: 12.3547 }; // Centrée Afrique centrale

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  markers,
  showDirections,
  places,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const markerRefs = useRef<google.maps.Marker[]>([]);

  // Charge Google Maps JS API dynamiquement
  useEffect(() => {
    if (!apiKey || typeof window === "undefined") return;
    // Déjà chargé ?
    if (window.google && window.google.maps) {
      initMap();
      return;
    }
    // Sinon charge le script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);
    // cleanup
    return () => {
      script.remove();
    };
    // eslint-disable-next-line
  }, [apiKey]);

  // Place/update les markers quand la map et les data sont prêts
  useEffect(() => {
    if (!googleMap.current || !markers) return;
    if (!(window.google && window.google.maps)) return; // Defensive for types
    // Supprime markers précédents
    markerRefs.current.forEach((marker) => marker.setMap(null));
    markerRefs.current = [];
    // Place les markers
    markers.forEach((pt) => {
      const marker = new window.google.maps.Marker({
        position: { lat: pt.latitude, lng: pt.longitude },
        map: googleMap.current!,
        title: `Mission: ${pt.mission_id}\n${pt.recorded_at}`,
      });
      const infowindow = new window.google.maps.InfoWindow({
        content: `
          <div class="font-mono text-gray-800">
            <strong>Mission :</strong> ${pt.mission_id}<br/>
            <strong>Point</strong> : ${pt.latitude.toFixed(5)}, ${pt.longitude.toFixed(5)}<br/>
            <small>${new Date(pt.recorded_at).toLocaleString()}</small>
          </div>
        `,
      });
      marker.addListener("click", () => {
        infowindow.open({ anchor: marker, map: googleMap.current! });
      });
      markerRefs.current.push(marker);
    });
    // Auto-center map
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((pt) =>
        bounds.extend({ lat: pt.latitude, lng: pt.longitude })
      );
      googleMap.current.fitBounds(bounds);
    }
  }, [markers]);

  function initMap() {
    if (!mapRef.current) return;
    if (!(window.google && window.google.maps)) return; // Defensive for types
    // Crée la carte - centrée Afrique
    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 6,
      mapTypeId: "roadmap",
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeControl: false,
    });
    // Place markers si déjà disponibles
    if (markers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((pt) =>
        bounds.extend({ lat: pt.latitude, lng: pt.longitude })
      );
      googleMap.current.fitBounds(bounds);
    }
    // Prépa extension : ajouter traces/itinéraires/places ici
  }

  return (
    <div className="relative w-full h-[450px] rounded-lg overflow-hidden border">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default GoogleMap;

