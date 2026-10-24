import React from 'react';

/** Original rear-view Tiko sprite: an explorer elephant facing into the mission door. */
export const TikoDoorSprite: React.FC = () => (
  <svg className="tk-tiko-door-sprite" viewBox="0 0 180 190" role="img" aria-label="Tiko si gajah biru berdiri menghadap pintu misi">
    <ellipse cx="90" cy="179" rx="55" ry="8" fill="#253f52" opacity=".2" />
    {/* rounded blue body, viewed from behind */}
    <path d="M53 96 Q54 76 69 70 L111 70 Q128 76 128 98 L123 139 Q112 154 90 155 Q68 154 57 139Z" fill="#55a9dc" stroke="#245184" strokeWidth="6" strokeLinejoin="round" />
    <path d="M64 83 Q72 76 82 76 M116 83 Q108 76 98 76" fill="none" stroke="#91d2ef" strokeWidth="5" strokeLinecap="round" opacity=".8" />
    {/* explorer pack and shoulder straps, visible over the back */}
    <path d="M54 91 Q35 117 41 160 L59 167 Q62 135 76 119 M125 91 Q145 117 139 160 L121 167 Q117 135 103 119" fill="#f3b938" stroke="#245184" strokeWidth="6" strokeLinejoin="round" />
    <path d="M62 118 Q90 103 118 118 L121 163 Q91 177 59 163Z" fill="#f3b938" stroke="#245184" strokeWidth="6" strokeLinejoin="round" />
    <path d="M72 129 Q90 123 108 129 L108 153 Q90 160 72 153Z" fill="#ffd66c" stroke="#245184" strokeWidth="4" />
    <path d="M80 137h20v8H80z" fill="#fff2bb" />
    {/* broad ears show the familiar elephant silhouette without a front-facing face */}
    <path d="M57 49 Q22 28 18 62 Q13 95 53 105 L67 83Z" fill="#55a9dc" stroke="#245184" strokeWidth="6" />
    <path d="M123 49 Q158 28 162 62 Q167 95 127 105 L113 83Z" fill="#55a9dc" stroke="#245184" strokeWidth="6" />
    <path d="M27 62 Q37 50 54 65 L55 88 Q37 86 27 62 M153 62 Q143 50 126 65 L125 88 Q143 86 153 62" fill="#9bd5ef" />
    <path d="M49 44 Q51 20 77 18 Q83 3 96 16 Q120 18 131 44 Q137 67 122 85 Q109 96 90 96 Q70 96 56 84 Q42 67 49 44Z" fill="#55a9dc" stroke="#245184" strokeWidth="6" strokeLinejoin="round" />
    <path d="M64 32 Q77 23 88 25 M116 32 Q103 23 92 25" fill="none" stroke="#91d2ef" strokeWidth="5" strokeLinecap="round" opacity=".7" />
    {/* tail and feet */}
    <path d="M90 151 Q87 163 91 170" fill="none" stroke="#245184" strokeWidth="5" strokeLinecap="round" />
    <path d="M91 166 Q83 167 83 173 Q89 177 95 171Z" fill="#245184" />
    <g className="tk-tiko-foot tk-tiko-foot-left"><path d="M59 145 Q51 156 48 174 Q47 182 55 183 H79 Q85 182 82 175 L71 150Z" fill="#55a9dc" stroke="#245184" strokeWidth="5" strokeLinejoin="round" /><path d="M56 176h8" stroke="#dff6ff" strokeWidth="3" strokeLinecap="round" /></g>
    <g className="tk-tiko-foot tk-tiko-foot-right"><path d="M109 145 Q119 156 124 174 Q126 182 118 183 H94 Q87 182 91 175 L99 150Z" fill="#55a9dc" stroke="#245184" strokeWidth="5" strokeLinejoin="round" /><path d="M108 176h8" stroke="#dff6ff" strokeWidth="3" strokeLinecap="round" /></g>
  </svg>
);
