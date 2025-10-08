
import React, { useRef, useEffect, useState } from "react";
import { Truck } from "lucide-react";

// 5 points pour suivre le parcours blanc interne sur la carte.
// Les coordonnées sont ajustées à la main pour être cohérent (aide-toi du preview, affiner si besoin)
const HUBS = [
  { x: 0.16, y: 0.28 }, // Ouest, entrée
  { x: 0.34, y: 0.33 }, // Milieu Ouest
  { x: 0.46, y: 0.39 }, // Centre du continent
  { x: 0.62, y: 0.52 }, // Centre Sud-Est
  { x: 0.54, y: 0.71 }, // Sud-Est sortie
];

// Fonctions utiles
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function interpolatePolyline(points: { x: number; y: number }[], t: number) {
  if (points.length < 2) return points[0];
  const segments = points.length - 1;
  const segment = Math.min(Math.floor(t * segments), segments - 1);
  const localT = (t - segment / segments) * segments;
  const p0 = points[segment];
  const p1 = points[segment + 1];
  return {
    x: lerp(p0.x, p1.x, localT),
    y: lerp(p0.y, p1.y, localT),
  };
}

// Animation pulsée des points GPS
function GPSPulse({
  left,
  top,
  size = 38,
  delayS = 0,
}: { left: string; top: string; size?: number; delayS?: number }) {
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

// Camion animé qui suit la route
function AnimatedTruck({ box }: { box: { width: number; height: number } }) {
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let raf: number;
    let start: number;
    function animate(ts: number) {
      if (!start) start = ts;
      const DURATION = 4700; // Durée totale du trajet (ms)
      const progress = ((ts - start) % DURATION) / DURATION;
      setAnim(progress);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Interpolation du camion
  const position = interpolatePolyline(HUBS, anim);
  const xPx = position.x * box.width;
  const yPx = position.y * box.height;

  // Calcul direction (pour orienter légèrement le camion)
  const EPS = 0.002;
  const posAhead = interpolatePolyline(HUBS, Math.min(anim + EPS, 1));
  const dx = posAhead.x - position.x;
  const dy = posAhead.y - position.y;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  return (
    <div
      className="absolute"
      style={{
        left: `${xPx}px`,
        top: `${yPx}px`,
        transform: `translate(-50%, -60%) rotate(${angleDeg}deg)`,
        zIndex: 10,
        transition: "filter 0.2s",
        filter: "drop-shadow(0 3px 9px #26323833)",
        pointerEvents: "none",
      }}
      aria-label="Truck en mouvement"
    >
      <Truck
        size={38}
        strokeWidth={2.5}
        color="#E65100"
        style={{
          // Style épuré : plus de fond, plus de contour carré, plus de border, padding, boxShadow, etc.
          background: undefined,
          borderRadius: undefined,
          border: undefined,
          boxShadow: undefined,
          padding: 0,
          // Vibrer légèrement
          transform: `scale(1.10) rotate(-10deg)`,
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
        alt="Carte animée d'Afrique OneLog, illustrant le suivi GPS et le parcours des camions sur le continent africain."
        className="absolute top-0 left-0 w-full h-full object-contain rounded-xl shadow-lg border border-gray-100"
        draggable={false}
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
      />
      {/* Truck animé */}
      <AnimatedTruck box={box} />
      {/* Points GPS animés */}
      {HUBS.map((hub, i) => (
        <GPSPulse
          key={i}
          left={hub.x * 100 + "%"}
          top={hub.y * 100 + "%"}
          delayS={i * 0.16}
          size={32}
        />
      ))}
    </div>
  );
}
