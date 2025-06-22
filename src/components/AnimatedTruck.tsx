import React from "react";

export const AnimatedTruck: React.FC = () => (
  <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-fade-in">
    <g>
      <rect x="2" y="16" width="36" height="14" rx="3" fill="#E65100"/>
      <rect x="38" y="22" width="18" height="8" rx="2" fill="#FF9800"/>
      <circle cx="12" cy="34" r="5" fill="#263238">
        <animate attributeName="r" values="5;6;5" dur="1.1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="48" cy="34" r="5" fill="#263238">
        <animate attributeName="r" values="5;6;5" dur="1.1s" repeatCount="indefinite"/>
      </circle>
      <rect x="6" y="20" width="8" height="6" rx="1" fill="#FFF3E0"/>
    </g>
  </svg>
);
