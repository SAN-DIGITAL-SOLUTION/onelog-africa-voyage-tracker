import { useEffect, useRef, useState } from "react";

const ROAD_PATH =
  "M120,350 Q220,160 330,180 Q420,192 470,150 Q520,110 580,180 Q660,270 700,200"; // Chemin courbe sur la carte

// Hubs logistiques (x, y) sur le SVG
const HUBS = [
  { x: 145, y: 270 },
  { x: 225, y: 188 },
  { x: 312, y: 187 },
  { x: 410, y: 183 },
  { x: 470, y: 150 },
  { x: 597, y: 183 },
  { x: 668, y: 207 },
];

const CAMION_LENGTH = 36; // taille du camion sur la route

// Camion SVG stylisé (orange, accent)
function Camion({ x, y, angle }: { x: number; y: number; angle: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <rect
        x={-20}
        y={-10}
        rx={4}
        ry={4}
        width={36}
        height={18}
        fill="#E65100"
        stroke="#263238"
        strokeWidth={1.5}
        filter="url(#shadow)"
      />
      {/* Container arrière (plus foncé) */}
      <rect
        x={-20}
        y={-10}
        width={14}
        height={18}
        rx={3}
        ry={3}
        fill="#F9A825"
        stroke="#263238"
        strokeWidth={1}
      />
      {/* Fenêtre */}
      <rect x={8} y={-6} width={8} height={5} rx={1} fill="#FFF" opacity={0.85} />
      {/* Roues */}
      <ellipse cx={-16} cy={7} rx={2.6} ry={2.1} fill="#263238" />
      <ellipse cx={12} cy={7} rx={2.7} ry={2.1} fill="#263238" />
      {/* Calandre */}
      <rect x={14} y={2} width={4} height={7} rx={1} fill="#009688" />
      {/* Antenne/signal */}
      <line x1={17.5} y1={-10} x2={17.5} y2={-18} stroke="#F9A825" strokeWidth={2} />
      {/* Ombre soft */}
      <ellipse
        cx={0}
        cy={12}
        rx={17}
        ry={5}
        fill="#000"
        opacity={0.09}
      />
    </g>
  );
}

/**
 * Permet d’interpoler la position sur le chemin (route) pour l’animation du camion
 */
function useTruckAnimation() {
  const requestRef = useRef<number>();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const DURATION = 5200; // ms pour traverser la courbe

    function animateTruck(ts: number) {
      if (!start) start = ts;
      const elapsed = (ts - start) % DURATION;
      const prog = elapsed / DURATION;

      setProgress(prog);
      requestRef.current = requestAnimationFrame(animateTruck);
    }
    requestRef.current = requestAnimationFrame(animateTruck);
    return () => requestRef.current && cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return progress;
}

/**
 * Calcul des coordonnées sur le SVG pour le camion le long du chemin.
 * On utilise la méthode getPointAtLength pour suivre la courbe.
 */
function getPosOnPath(pathRef: SVGPathElement | null, progress: number) {
  if (!pathRef) return { x: 0, y: 0, angle: 0 };
  const total = pathRef.getTotalLength();
  const l = progress * (total - CAMION_LENGTH / 2);
  const p = pathRef.getPointAtLength(l);
  // Pour l'angle, une petite avance
  const delta = pathRef.getPointAtLength(Math.min(l + 2, total));
  const angle = (Math.atan2(delta.y - p.y, delta.x - p.x) * 180) / Math.PI;
  return { x: p.x, y: p.y, angle };
}

export default function LandingHeroIllustration() {
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useTruckAnimation();

  // Positions truck sur la route
  const { x, y, angle } = getPosOnPath(pathRef.current, progress);

  return (
    <svg
      viewBox="0 0 820 420"
      fill="none"
      aria-hidden="true"
      className="w-full h-full max-w-[760px] max-h-[360px] transition-all"
      style={{
        minWidth: 250,
        minHeight: 140,
      }}
    >
      {/* Définition pour l’ombre portée du camion */}
      <defs>
        <filter id="shadow" x="-40%" y="-50%" width="180%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#E65100" floodOpacity="0.25" />
        </filter>
        {/* Carte Afrique vectoriale, optimisée : fond vert */}
        <clipPath id="africa-mask">
          <path
            d="M221 93Q243 70 297 61Q355 51 416 74Q466 89 488 104Q505 114 520 128Q600 197 646 260Q692 323 689 359Q672 383 637 388Q602 393 508 398Q414 403 293 388Q232 379 188 364Q149 351 137 335Q130 324 131 308Q136 278 154 254Q164 241 185 219Q202 202 216 176Q228 153 221 93Z"
            transform="translate(90,40) scale(2.2)"
          />
        </clipPath>
      </defs>

      {/* Fond blanc - pour ne pas déborder */}
      <rect x="0" y="0" width="100%" height="100%" fill="#F4F4F4" />

      {/* Carte de l'Afrique */}
      <g clipPath="url(#africa-mask)">
        <rect x="75" y="40" width="660" height="340" fill="#1A3C40" />
        {/* texture motif léger */}
        <g opacity="0.02">
          <circle cx="180" cy="120" r="28" fill="#F9A825" />
          <circle cx="620" cy="330" r="41" fill="#009688" />
        </g>
      </g>

      {/* Chemin courbe (route) */}
      <path
        ref={pathRef}
        d={ROAD_PATH}
        stroke="#F9A825"
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#roadGlow)"
      />
      {/* Glow effet */}
      <defs>
        <filter id="roadGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hubs logistiques (effet pulsation accentué) */}
      {HUBS.map((hub, i) => (
        <g key={i}>
          {/* Cercles d'auréole pulsatiles */}
          <circle
            cx={hub.x}
            cy={hub.y}
            r="20"
            fill="#F9A825"
            opacity="0.20"
            className="animate-pulse-gps"
            style={{
              animationDelay: `${i * 0.23}s`,
              filter: "blur(3px)"
            }}
          />
          <circle
            cx={hub.x}
            cy={hub.y}
            r="14"
            fill="#009688"
            opacity="0.35"
            className="animate-pulse-gps"
            style={{
              animationDelay: `${i * 0.23}s`,
              filter: "blur(1.5px)"
            }}
          />
          {/* Point central */}
          <circle
            cx={hub.x}
            cy={hub.y}
            r="11"
            fill="#009688"
            stroke="#FFF"
            strokeWidth={3}
            className="animate-pulse"
            style={{
              animationDelay: `${i * 0.23}s`,
              filter: "drop-shadow(0 0 10px #009688bb)",
              opacity: 0.88,
            }}
          />
        </g>
      ))}

      {/* Camion animé */}
      <Camion x={x} y={y} angle={angle} />

    </svg>
  );
}

// NOTE: Ce fichier approche 200 lignes : il commence à devenir trop long. Après cette étape, pensez à demander un refactoring pour séparer SVG, animations, hooks, etc.
