import React from 'react';

/** Transparent, looping running mascot for the waiting-for-review road scene. */
export const RunningElephant: React.FC = () => (
  <div className="review-elephant-runner" aria-hidden="true">
    <svg className="review-elephant-art" viewBox="0 0 210 180" role="presentation">
      <ellipse cx="105" cy="162" rx="68" ry="9" fill="#314d65" opacity=".16" />
      <g className="review-elephant-legs">
        <path className="review-elephant-leg leg-back" d="M74 123c-5 13-15 24-18 36-2 7 3 11 10 9l21-8 8-25z" fill="#4388c5" stroke="#24548a" strokeWidth="5" strokeLinejoin="round" />
        <path className="review-elephant-leg leg-front" d="M128 124c3 14 11 24 13 36 1 7-4 10-11 8l-20-10-4-25z" fill="#579fe0" stroke="#24548a" strokeWidth="5" strokeLinejoin="round" />
        <path d="M71 139c-5 7-8 13-10 19m63-24c5 7 9 14 11 21" fill="none" stroke="#24548a" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g className="review-elephant-body">
      <path d="M66 91c4-25 29-38 57-34 26 4 43 23 39 47-4 22-22 32-51 31-33-1-52-15-45-44z" fill="#4388c5" stroke="#24548a" strokeWidth="6" />
      <path d="M68 92c-19 8-33-4-34-23-1-20 13-39 32-37 15 2 25 15 25 31z" fill="#78b7ef" stroke="#24548a" strokeWidth="6" />
      <path d="M43 69c2-17 12-26 23-23 10 2 15 12 14 24-1 13-8 23-18 22-12-1-20-10-19-23z" fill="#a5d2f6" />
      <path d="M83 80c-8-20 2-46 23-55 23-10 48 4 53 28 5 22-7 43-28 50-19 7-40-1-48-23z" fill="#67a9e1" stroke="#24548a" strokeWidth="6" />
      <path d="M108 36c2-17 12-28 21-25 9 3 10 14 7 24" fill="#67a9e1" stroke="#24548a" strokeWidth="6" strokeLinecap="round" />
      <path d="M147 74c18-5 29 4 29 18 0 12-8 20-16 28-7 7-4 14 5 15 9 1 15-6 17-13" fill="none" stroke="#24548a" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M147 74c18-5 29 4 29 18 0 12-8 20-16 28-7 7-4 14 5 15 9 1 15-6 17-13" fill="none" stroke="#67a9e1" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M141 91c7-4 12-4 16-1" fill="none" stroke="#24548a" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="139" cy="74" rx="8" ry="10" fill="#fff" />
      <circle cx="142" cy="76" r="4.2" fill="#20354e" />
      <circle cx="143" cy="74.5" r="1.4" fill="#fff" />
      <ellipse cx="120" cy="93" rx="9" ry="5.5" fill="#f39a99" opacity=".9" />
      <path d="M136 107c5 2 9 1 12-2-2 8-9 11-15 6z" fill="#e95855" stroke="#24548a" strokeWidth="3" strokeLinejoin="round" />
      <path d="M88 111c8 8 20 12 35 12" fill="none" stroke="#ffbd3e" strokeWidth="9" strokeLinecap="round" />
      <path d="M86 110c-4 10-4 19 1 27" fill="none" stroke="#ffbd3e" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);
