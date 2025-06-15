
import React, { useRef, useEffect, useState } from "react";

// Corresponds visually to the `/lovable-uploads/91fd0505-b323-44ce-8632-1456882003e9.png` image.
// All coordinates below match the map image (420x420px), but get scaled with container.

// GPS hubs on the map (as percentages of image dimensions so it's responsive)
const HUBS = [
  { x: 0.173, y: 0.402 }, // Abidjan, CI
  { x: 0.300, y: 0.345 }, // Dakar, SN
  { x: 0.500, y: 0.320 }, // Lagos, NG
  { x: 0.644, y: 0.510 }, // Nairobi, KE
];

// Route for the animated truck (array of "waypoints", to interpolate along)
// These points should roughly match a path across Africa connecting some GPS hubs.
// The values are [x, y] as ratio (0-1) of image size.
const TRUCK_PATH = [
  { x: 0.16, y: 0.425 }, // near Abidjan
  { x: 0.23, y: 0.39 },  // Cameroon, 
  { x: 0.40, y: 0.36 },  // Niger
  { x: 0.536, y: 0.335 }, // Lagos area
  { x: 0.625, y: 0.45 }, // near Nairobi
  { x: 0.73, y: 0.59 },  // "East Africa"
];

// Truck SVG (accent styling)
function TruckSVG({ size = 32, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size * 0.65} viewBox="0 0 42 27" fill="none" style={style}>
      {/* Container back (yellow) */}
      <rect x="2" y="9" width="13" height="10" rx="2.8" fill="#F9A825" stroke="#E65100" strokeWidth="1" />
      {/* Cab (orange) */}
      <rect x="13" y="6" width="19" height="13" rx="3" fill="#E65100" stroke="#263238" strokeWidth="1.6"/>
      {/* Window */}
      <rect x="25" y="8.5" width="6.5" height="5" rx="1" fill="#fff" opacity="0.85" />
      {/* Wheels */}
      <ellipse cx="9" cy="21" rx="2.6" ry="2.1" fill="#263238"/>
      <ellipse cx="27" cy="21" rx="2.7" ry="2.1" fill="#263238"/>
      {/* Calandre */}
      <rect x="29.6" y="16" width="3.7" height="4.7" rx="1" fill="#009688"/>
      {/* Antenna */}
      <line x1="31.3" y1="6.2" x2="31.3" y2="1.6" stroke="#F9A825" strokeWidth="1.7"/>
      {/* Shadow */}
      <ellipse cx="20" cy="24.5" rx="11" ry="2.75" fill="#000" opacity="0.13"/>
    </svg>
  );
}

// Animated pulsating GPS marker (uses Tailwind CSS for animation)
function GPSPulse({ left, top, size = 32, delayS = 0 }: { left: string, top: string; size?: number; delayS?: number }) {
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
      {/* Outer accent pulse */}
      <span
        className="absolute w-full h-full rounded-full bg-[#F9A825] opacity-20 animate-pulse-gps"
        style={{
          animationDelay: `${delayS || 0}s`,
          filter: "blur(2.5px)",
        }}
      />
      {/* Inner accent pulse green */}
      <span
        className="absolute w-3/4 h-3/4 left-1/8 top-1/8 rounded-full bg-[#009688] opacity-40 animate-pulse-gps"
        style={{
          animationDelay: `${delayS || 0}s`,
          filter: "blur(1.5px)",
        }}
      />
      {/* Center marker white stroke */}
      <span
        className="absolute left-1/4 top-1/4 w-1/2 h-1/2 rounded-full bg-[#009688] border-2 border-white"
        style={{
          boxShadow: "0 0 9px 0 #009688aa",
        }}
      />
    </div>
  );
}

// Interpolate (x, y) along path, return {x, y} as percent of image, and angle for truck orientation.
function getTruckPosition(progress: number) {
  // Clamp between 0 and TRUCK_PATH.length-1
  const n = TRUCK_PATH.length;
  const seg = Math.floor(progress * (n - 1));
  const p1 = TRUCK_PATH[seg];
  const p2 = TRUCK_PATH[Math.min(seg + 1, n - 1)];
  const localT = (progress * (n - 1)) - seg;
  const x = p1.x + (p2.x - p1.x) * localT;
  const y = p1.y + (p2.y - p1.y) * localT;
  // Angle for truck (in degrees)
  const angle =
    Math.atan2((p2.y - p1.y), (p2.x - p1.x)) * 180 / Math.PI;
  return { x, y, angle };
}

// Animation hook for progress [0, 1]
function useProgress(duration = 6000) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame: number;
    let mounted = true;
    let start: number | null = null;
    function loop(ts: number) {
      if (!start) start = ts;
      const elapsed = ((ts - start) % duration);
      const prog = elapsed / duration;
      if (mounted) setProgress(prog);
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
    };
  }, [duration]);
  return progress;
}

export default function LandingHeroIllustration() {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useProgress(6200);

  // Responsive size
  const [box, setBox] = useState({width: 420, height: 420});
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

  // Calculate truck position (in pixels)
  const { x, y, angle } = getTruckPosition(progress);

  return (
    <div ref={containerRef} className="relative w-full max-w-[420px] aspect-square mx-auto select-none">
      {/* Map background */}
      <img
        ref={imgRef}
        src="/lovable-uploads/91fd0505-b323-44ce-8632-1456882003e9.png"
        alt="Carte de l'Afrique"
        className="absolute top-0 left-0 w-full h-full object-contain rounded-xl shadow-lg border border-gray-100"
        draggable={false}
        aria-hidden="true"
        style={{pointerEvents: "none"}}
      />
      {/* GPS points overlay */}
      {HUBS.map((hub, i) => (
        <GPSPulse
          key={i}
          left={(hub.x * 100) + "%"}
          top={(hub.y * 100) + "%"}
          delayS={i * 0.16}
          size={38}
        />
      ))}
      {/* Animated truck overlay */}
      <div
        className="absolute"
        style={{
          left: (x * 100) + "%",
          top: (y * 100) + "%",
          width: 42,
          height: 28,
          transform: `translate(-50%,-50%) rotate(${angle}deg)`,
          zIndex: 3,
        }}
      >
        <TruckSVG size={44} />
      </div>
    </div>
  );
}

// NOTE: This file is now quite long (approaching/exceeding 130 lines and logic is accumulating).
// It would be beneficial to split out the Truck, GPSPulse, and animation hook into their own files for clarity 
// after confirming visual parity and function is as expected.
