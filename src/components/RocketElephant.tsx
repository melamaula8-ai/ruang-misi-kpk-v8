import React from 'react';

interface RocketElephantProps {
  launching: boolean;
  onLaunchStart: () => void;
  onLaunchComplete: () => void;
}

/** Mascot flying inside a colorful learning rocket. */
export const RocketElephant: React.FC<RocketElephantProps> = ({ launching, onLaunchStart, onLaunchComplete }) => (
  <svg
    className={`countdown-rocket ${launching ? 'is-launching' : ''}`}
    viewBox="0 0 400 500"
    role="img"
    aria-label="Tiko bersiap meluncur di dalam roket"
    xmlns="http://www.w3.org/2000/svg"
    onAnimationStart={(event) => {
      if (event.target === event.currentTarget && event.animationName === 'countdown-rocket-launch') onLaunchStart();
    }}
    onAnimationEnd={(event) => {
      if (launching && event.target === event.currentTarget) onLaunchComplete();
    }}
  >
    <defs>
      <clipPath id="rocket-elephant-window"><circle cx="200" cy="185" r="49" /></clipPath>
      <linearGradient id="rocket-body" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" />
        <stop offset="1" stopColor="#dceeff" />
      </linearGradient>
      <linearGradient id="rocket-flame" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#ffe879" />
        <stop offset=".55" stopColor="#ffae3d" />
        <stop offset="1" stopColor="#ff704b" />
      </linearGradient>
    </defs>

    <g className="rocket-stars" fill="#f2b93d">
      <path d="M73 124l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" />
      <path d="M318 91l5 12 12 5-12 5-5 12-5-12-12-5 12-5z" />
      <circle cx="302" cy="233" r="5" />
      <circle cx="95" cy="262" r="4" fill="#62a879" />
      <circle cx="282" cy="62" r="4" fill="#4388c5" />
    </g>

    <g className="rocket-smoke">
      <ellipse cx="200" cy="408" rx="83" ry="22" fill="#d9e9f6" opacity=".82" />
      <circle cx="133" cy="400" r="20" fill="#edf5fa" />
      <circle cx="267" cy="399" r="24" fill="#edf5fa" />
    </g>

    <g className="rocket-flames">
      <path d="M163 321c-6 29 2 54 19 85 4-24 11-38 18-51 8 19 14 34 18 52 18-34 26-62 17-86z" fill="url(#rocket-flame)" />
      <path d="M184 325c-2 18 5 34 16 52 9-19 15-34 14-52z" fill="#fff3a6" />
    </g>

    <g className="rocket-craft">
      <path d="M148 269c-24 13-42 38-48 75 27-5 49-17 67-35z" fill="#ff913d" stroke="#9a573d" strokeWidth="7" strokeLinejoin="round" />
      <path d="M252 269c24 13 42 38 48 75-27-5-49-17-67-35z" fill="#69ad72" stroke="#477b54" strokeWidth="7" strokeLinejoin="round" />
      <path d="M200 35c-39 39-76 91-76 157v99c0 20 15 36 35 36h82c20 0 35-16 35-36v-99c0-66-37-118-76-157z" fill="url(#rocket-body)" stroke="#315b85" strokeWidth="8" strokeLinejoin="round" />
      <path d="M200 35c-20 20-39 43-52 68h104c-13-25-32-48-52-68z" fill="#ff785b" stroke="#315b85" strokeWidth="8" strokeLinejoin="round" />
      <path d="M128 250h144v42c0 20-15 35-35 35h-74c-20 0-35-15-35-35z" fill="#4388c5" />
      <circle cx="200" cy="185" r="60" fill="#ffdb76" stroke="#315b85" strokeWidth="9" />
      <g clipPath="url(#rocket-elephant-window)">
        <rect x="148" y="132" width="104" height="108" fill="#d9effb" />
        <image href="/assets/elephant.png" x="149" y="132" width="102" height="102" preserveAspectRatio="xMidYMid slice" />
      </g>
      <circle cx="200" cy="185" r="50" fill="none" stroke="#fff" strokeWidth="5" opacity=".9" />
      <circle cx="200" cy="185" r="60" fill="none" stroke="#315b85" strokeWidth="8" />
      <path d="M150 111c-8 15-13 30-16 46" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity=".8" />
      <circle cx="166" cy="279" r="7" fill="#ffe082" />
      <circle cx="234" cy="279" r="7" fill="#ffe082" />
    </g>
  </svg>
);
