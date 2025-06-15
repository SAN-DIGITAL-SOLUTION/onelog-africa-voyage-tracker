
import React, { useRef, useEffect, useState } from "react";

// Coordonnées à ajuster pour coller au trajet sur l'image fournie (relatives à 500x500px car l'image jointe est plus carrée)
// Les valeurs sont données à titre indicatif pour placer 3 points sur la trajectoire noire.
const HUBS = [
  { x: 0.16, y: 0.28 }, // Ouest
  { x: 0.46, y: 0.35 }, // Centre du continent
  { x: 0.54, y: 0.71 }, // Sud-Est
];

// Animation pulsée des points GPS
function GPSPulse({ left, top, size = 38, delayS = 0 }: { left: string, top: string; size?: number; delayS?: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        width: size,
        height: size,
        transform: `translate(-50%, -50%)`,
        zIndex: 2,
      }}
    >
      {/* Pulse extérieur */}
      <span
        className="absolute w-full h-full rounded-full bg-[#F9A825] opacity-20 animate-pulse-gps"
        style={{
          animationDelay: `${delayS || 0}s`,
          filter: "blur(2.5px)",
        }}
      />
      {/* Pulse intérieur */}
      <span
        className="absolute w-3/4 h-3/4 left-1/8 top-1/8 rounded-full bg-[#009688] opacity-40 animate-pulse-gps"
        style={{
          animationDelay: `${delayS || 0}s`,
          filter: "blur(1.5px)",
        }}
      />
      {/* Centre (marqueur) */}
      <span
        className="absolute left-1/4 top-1/4 w-1/2 h-1/2 rounded-full bg-[#009688] border-2 border-white"
        style={{
          boxShadow: "0 0 9px 0 #009688aa",
        }}
      />
    </div>
  );
}

export default function LandingHeroIllustration() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Taille responsive
  const [box, setBox] = useState({ width: 420, height: 420 });
  useEffect(() => {
    function handle() {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      setBox({ width, height: width });
    }
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px] aspect-square mx-auto select-none">
      {/* Image "carte + camion + trajet" */}
      <img
        src="/lovable-uploads/ad2ed356-4438-4b30-b028-c3ac91515ba9.png"
        alt="Carte animée d'Afrique OneLog"
        className="absolute top-0 left-0 w-full h-full object-contain rounded-xl shadow-lg border border-gray-100"
        draggable={false}
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      />
      {/* Points GPS animés */}
      {HUBS.map((hub, i) => (
        <GPSPulse
          key={i}
          left={(hub.x * 100) + "%"}
          top={(hub.y * 100) + "%"}
          delayS={i * 0.18}
          size={38}
        />
      ))}
    </div>
  );
}
