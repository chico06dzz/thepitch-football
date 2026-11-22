import React from 'react';

interface PitchLogoMarkProps {
  className?: string;
}

export const PitchLogoMark: React.FC<PitchLogoMarkProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="28" height="28" rx="7" fill="#059669" />
      <rect
        x="5.5"
        y="7.5"
        width="21"
        height="17"
        rx="2"
        stroke="white"
        strokeWidth="1.6"
        strokeOpacity="0.95"
      />
      <line x1="16" y1="7.5" x2="16" y2="24.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.9" />
      <circle cx="16" cy="16" r="3.4" stroke="white" strokeWidth="1.5" strokeOpacity="0.95" />
      <circle cx="16" cy="16" r="1.2" fill="white" />
      <path d="M5.5 12H8.8V20H5.5" stroke="white" strokeWidth="1.4" strokeOpacity="0.85" />
      <path d="M26.5 12H23.2V20H26.5" stroke="white" strokeWidth="1.4" strokeOpacity="0.85" />
    </svg>
  );
};
