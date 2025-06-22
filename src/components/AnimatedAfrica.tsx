import React from "react";

export const AnimatedAfrica: React.FC = () => (
  <svg width="64" height="40" viewBox="0 0 64 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-fade-in">
    <g>
      <path d="M32 6C37 6 42 12 42 18C42 24 37 34 32 34C27 34 22 24 22 18C22 12 27 6 32 6Z" fill="#E65100">
        <animate attributeName="d" values="M32 6C37 6 42 12 42 18C42 24 37 34 32 34C27 34 22 24 22 18C22 12 27 6 32 6Z;M32 8C36 8 40 13 40 18C40 23 36 32 32 32C28 32 24 23 24 18C24 13 28 8 32 8Z;M32 6C37 6 42 12 42 18C42 24 37 34 32 34C27 34 22 24 22 18C22 12 27 6 32 6Z" dur="2.2s" repeatCount="indefinite"/>
      </path>
      <circle cx="32" cy="20" r="8" fill="#FF9800" opacity="0.3">
        <animate attributeName="r" values="8;10;8" dur="2.2s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
);
