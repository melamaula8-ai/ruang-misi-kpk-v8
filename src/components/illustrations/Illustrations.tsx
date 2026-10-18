import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 1. Beranda: Lingkungan sekolah, kalender, dan papan misi
 */
export const SchoolHeroIllustration: React.FC<IllustrationProps> = ({ className = 'w-full h-auto max-h-72', size }) => (
  <svg
    viewBox="0 0 600 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-label="Ilustrasi Petualangan Ruang Misi KPK di Lingkungan Sekolah"
  >
    {/* Ground / Path */}
    <rect x="0" y="270" width="600" height="90" fill="#EAE3D9" />
    <path d="M 0 280 Q 150 260 300 280 T 600 280" stroke="#95634F" strokeWidth="3" strokeDasharray="8 6" />

    {/* School Building */}
    <rect x="90" y="110" width="220" height="160" rx="4" fill="#FFFFFF" stroke="#95634F" strokeWidth="3" />
    <polygon points="70,110 200,40 330,110" fill="#95634F" stroke="#95634F" strokeWidth="3" />
    {/* Clock Tower / Bell */}
    <rect x="175" y="20" width="50" height="30" fill="#FFE082" stroke="#95634F" strokeWidth="2.5" />
    <circle cx="200" cy="35" r="9" fill="#FFFFFF" stroke="#95634F" strokeWidth="2" />
    <line x1="200" y1="35" x2="200" y2="29" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="200" y1="35" x2="205" y2="35" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    {/* Windows */}
    <rect x="115" y="130" width="35" height="40" rx="3" fill="#C5E68A" stroke="#95634F" strokeWidth="2" />
    <rect x="170" y="130" width="35" height="40" rx="3" fill="#FFE082" stroke="#95634F" strokeWidth="2" />
    <rect x="250" y="130" width="35" height="40" rx="3" fill="#C5E68A" stroke="#95634F" strokeWidth="2" />
    {/* School Door */}
    <rect x="180" y="200" width="40" height="70" rx="4" fill="#95634F" />
    <circle cx="212" cy="235" r="3" fill="#FFE082" />

    {/* Mission Board (Papan Misi) */}
    <rect x="360" y="90" width="180" height="130" rx="8" fill="#FFFFFF" stroke="#95634F" strokeWidth="3.5" />
    <rect x="375" y="105" width="150" height="24" rx="4" fill="#FFE082" />
    <text x="450" y="122" textAnchor="middle" fill="#3E2723" fontSize="13" fontWeight="bold">PAPAN MISI KPK</text>
    {/* Mission Checkpoints */}
    <circle cx="390" cy="150" r="7" fill="#C5E68A" stroke="#95634F" strokeWidth="2" />
    <text x="408" y="154" fill="#3E2723" fontSize="11" fontWeight="600">Misi 1: Piket Kelas</text>
    <circle cx="390" cy="175" r="7" fill="#FFE082" stroke="#95634F" strokeWidth="2" />
    <text x="408" y="179" fill="#3E2723" fontSize="11" fontWeight="600">Misi 2: Lampu Sinyal</text>
    <circle cx="390" cy="200" r="7" fill="#FF913D" stroke="#95634F" strokeWidth="2" />
    <text x="408" y="204" fill="#3E2723" fontSize="11" fontWeight="600">Misi 3 & 4: Olahraga & Agenda</text>
    {/* Board Stand */}
    <line x1="410" y1="220" x2="410" y2="280" stroke="#95634F" strokeWidth="4" />
    <line x1="490" y1="220" x2="490" y2="280" stroke="#95634F" strokeWidth="4" />

    {/* Mini School Plants & Sun */}
    <circle cx="530" cy="45" r="24" fill="#FFE082" />
    <circle cx="45" cy="265" r="22" fill="#C5E68A" />
    <circle cx="560" cy="265" r="20" fill="#C5E68A" />
  </svg>
);

/**
 * 2. Penjelajah: Jurnal investigasi, petunjuk bertahap, pola bilangan
 */
export const PenjelajahIllustration: React.FC<IllustrationProps> = ({ className = 'w-24 h-24', size }) => (
  <svg viewBox="0 0 160 160" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Journal Book with Soft Green cover */}
    <rect x="25" y="25" width="100" height="110" rx="8" fill="#C5E68A" stroke="#95634F" strokeWidth="3" />
    <rect x="35" y="35" width="80" height="90" rx="4" fill="#FFFFFF" stroke="#95634F" strokeWidth="2" />
    {/* Steps inside journal */}
    <line x1="45" y1="52" x2="105" y2="52" stroke="#95634F" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="45" y1="68" x2="95" y2="68" stroke="#95634F" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="45" y1="84" x2="100" y2="84" stroke="#95634F" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="50" cy="102" r="6" fill="#C5E68A" />
    <circle cx="70" cy="102" r="6" fill="#C5E68A" />
    <circle cx="90" cy="102" r="6" fill="#FF913D" />
    {/* Magnifying Glass */}
    <circle cx="105" cy="105" r="22" fill="#FFFFFF" fillOpacity="0.8" stroke="#95634F" strokeWidth="3.5" />
    <line x1="121" y1="121" x2="142" y2="142" stroke="#95634F" strokeWidth="5" strokeLinecap="round" />
    <path d="M 97 105 Q 105 97 113 105" stroke="#FF913D" strokeWidth="2.5" fill="none" />
  </svg>
);

/**
 * 3. Pengembang: Tabel kelipatan, kalender, proses menyusun strategi
 */
export const PengembangIllustration: React.FC<IllustrationProps> = ({ className = 'w-24 h-24', size }) => (
  <svg viewBox="0 0 160 160" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Strategy Table / Blueprint with Warm Yellow */}
    <rect x="20" y="25" width="120" height="105" rx="8" fill="#FFE082" stroke="#95634F" strokeWidth="3" />
    <rect x="30" y="38" width="100" height="80" rx="4" fill="#FFFFFF" stroke="#95634F" strokeWidth="2" />
    {/* Grid of multiples */}
    <line x1="30" y1="58" x2="130" y2="58" stroke="#95634F" strokeWidth="1.5" />
    <line x1="30" y1="78" x2="130" y2="78" stroke="#95634F" strokeWidth="1.5" />
    <line x1="30" y1="98" x2="130" y2="98" stroke="#95634F" strokeWidth="1.5" />
    <line x1="63" y1="38" x2="63" y2="118" stroke="#95634F" strokeWidth="1.5" />
    <line x1="96" y1="38" x2="96" y2="118" stroke="#95634F" strokeWidth="1.5" />
    {/* Matching highlight */}
    <rect x="64" y="59" width="31" height="18" fill="#FF913D" fillOpacity="0.35" />
    <text x="80" y="73" textAnchor="middle" fill="#3E2723" fontSize="11" fontWeight="bold">KPK</text>
    {/* Pencil */}
    <polygon points="120,20 135,35 110,60 95,45" fill="#FF913D" stroke="#95634F" strokeWidth="2" />
    <polygon points="95,45 110,60 90,65" fill="#3E2723" stroke="#95634F" strokeWidth="1" />
  </svg>
);

/**
 * 4. Inovator: Pembuktian, analisis kompas, dan pemaparan hasil
 */
export const InovatorIllustration: React.FC<IllustrationProps> = ({ className = 'w-24 h-24', size }) => (
  <svg viewBox="0 0 160 160" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Brown leather portfolio / easel */}
    <rect x="22" y="24" width="116" height="110" rx="10" fill="#95634F" stroke="#3E2723" strokeWidth="3" />
    <rect x="32" y="34" width="96" height="90" rx="6" fill="#FAF8F5" stroke="#95634F" strokeWidth="2" />
    {/* Geometric Compass & Proof Spark */}
    <circle cx="80" cy="74" r="28" stroke="#95634F" strokeWidth="2" strokeDasharray="4 3" />
    <circle cx="80" cy="74" r="5" fill="#FF913D" />
    <line x1="80" y1="46" x2="80" y2="102" stroke="#95634F" strokeWidth="2" />
    <line x1="52" y1="74" x2="108" y2="74" stroke="#95634F" strokeWidth="2" />
    {/* Lightbulb of Discovery */}
    <circle cx="80" cy="40" r="12" fill="#FFE082" stroke="#95634F" strokeWidth="2" />
    <path d="M 74 52 L 86 52" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="80" y1="20" x2="80" y2="24" stroke="#FF913D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 5. Misi 1: Tanaman kelas, penyiram tanaman, dan kalender
 */
export const PiketIllustration: React.FC<IllustrationProps> = ({ className = 'w-32 h-32', size }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Classroom Pot */}
    <polygon points="40,110 50,155 100,155 110,110" fill="#95634F" stroke="#3E2723" strokeWidth="3" />
    <rect x="36" y="102" width="78" height="10" rx="3" fill="#FFE082" stroke="#95634F" strokeWidth="2" />
    {/* Lush Classroom Plant */}
    <path d="M 75 102 C 60 70 30 75 40 95 C 45 105 75 102 75 102 Z" fill="#C5E68A" stroke="#95634F" strokeWidth="2.5" />
    <path d="M 75 102 C 90 60 120 65 110 88 C 105 100 75 102 75 102 Z" fill="#A8D468" stroke="#95634F" strokeWidth="2.5" />
    <path d="M 75 102 C 75 50 70 35 75 35 C 80 35 75 50 75 102 Z" stroke="#95634F" strokeWidth="3" />
    <circle cx="75" cy="35" r="12" fill="#C5E68A" stroke="#95634F" strokeWidth="2" />
    {/* Watering Can */}
    <rect x="110" y="90" width="36" height="32" rx="4" fill="#FFE082" stroke="#95634F" strokeWidth="2.5" />
    <path d="M 146 95 L 165 80" stroke="#95634F" strokeWidth="3" strokeLinecap="round" />
    <circle cx="166" cy="79" r="4" fill="#95634F" />
    <path d="M 110 100 C 95 100 95 118 110 118" stroke="#95634F" strokeWidth="3" fill="none" />
    {/* Calendar Marker */}
    <rect x="115" y="25" width="45" height="45" rx="5" fill="#FFFFFF" stroke="#95634F" strokeWidth="2.5" />
    <rect x="115" y="25" width="45" height="14" fill="#FF913D" />
    <text x="137" y="58" textAnchor="middle" fill="#3E2723" fontSize="16" fontWeight="bold">1</text>
  </svg>
);

/**
 * 6. Misi 2: Persimpangan dan lampu indikator simulasi
 */
export const TrafficIllustration: React.FC<IllustrationProps> = ({ className = 'w-32 h-32', size }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Laboratory simulation stand */}
    <rect x="30" y="20" width="55" height="120" rx="8" fill="#3E2723" stroke="#95634F" strokeWidth="3" />
    <rect x="95" y="20" width="55" height="120" rx="8" fill="#3E2723" stroke="#95634F" strokeWidth="3" />
    {/* Light A Indicators */}
    <circle cx="57" cy="45" r="14" fill="#FF913D" stroke="#FFE082" strokeWidth="3" />
    <circle cx="57" cy="80" r="14" fill="#FFE082" />
    <circle cx="57" cy="115" r="14" fill="#C5E68A" />
    <text x="57" y="155" textAnchor="middle" fill="#3E2723" fontSize="12" fontWeight="bold">Lampu A</text>
    {/* Light B Indicators */}
    <circle cx="122" cy="45" r="14" fill="#FF913D" stroke="#FFE082" strokeWidth="3" />
    <circle cx="122" cy="80" r="14" fill="#FFE082" />
    <circle cx="122" cy="115" r="14" fill="#C5E68A" />
    <text x="122" y="155" textAnchor="middle" fill="#3E2723" fontSize="12" fontWeight="bold">Lampu B</text>
    {/* Synchronized Flash Pulse Signal */}
    <path d="M 57 45 L 89 25 L 122 45" stroke="#FF913D" strokeWidth="2.5" strokeDasharray="3 3" />
    <circle cx="89" cy="25" r="5" fill="#FF913D" />
  </svg>
);

/**
 * 7. Misi 3: Perlengkapan olahraga dan kalender latihan
 */
export const SportsIllustration: React.FC<IllustrationProps> = ({ className = 'w-32 h-32', size }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Soccer Ball */}
    <circle cx="58" cy="110" r="32" fill="#FFFFFF" stroke="#3E2723" strokeWidth="3" />
    <polygon points="58,95 72,105 67,122 49,122 44,105" fill="#3E2723" />
    {/* Shuttlecock / Bulu Tangkis */}
    <circle cx="125" cy="115" r="10" fill="#FFE082" stroke="#95634F" strokeWidth="2" />
    <polygon points="120,110 105,75 135,70 130,110" fill="#FFFFFF" stroke="#95634F" strokeWidth="2" />
    {/* Whistle */}
    <path d="M 85 45 C 75 45 65 52 65 62 C 65 72 75 80 88 80 L 110 80 L 110 65 L 88 65" fill="#FF913D" stroke="#3E2723" strokeWidth="2.5" />
    <circle cx="80" cy="62" r="5" fill="#FFFFFF" stroke="#3E2723" strokeWidth="1.5" />
    {/* Training Calendar */}
    <rect x="110" y="25" width="46" height="42" rx="4" fill="#FFFFFF" stroke="#95634F" strokeWidth="2" />
    <rect x="110" y="25" width="46" height="12" fill="#C5E68A" />
    <text x="133" y="55" textAnchor="middle" fill="#3E2723" fontSize="13" fontWeight="bold">OKT</text>
  </svg>
);

/**
 * 8. Misi 4: Buku agenda dan kegiatan literasi
 */
export const AgendaIllustration: React.FC<IllustrationProps> = ({ className = 'w-32 h-32', size }) => (
  <svg viewBox="0 0 180 180" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Open Agenda Book */}
    <path d="M 25 125 C 50 120 85 122 90 135 C 95 122 130 120 155 125 L 155 55 C 130 50 95 52 90 65 C 85 52 50 50 25 55 Z" fill="#FFFFFF" stroke="#95634F" strokeWidth="3" />
    {/* Spine */}
    <line x1="90" y1="65" x2="90" y2="135" stroke="#95634F" strokeWidth="3" />
    {/* Ribbon Bookmark */}
    <path d="M 90 65 L 90 148 L 96 142 L 102 148 L 102 65" fill="#FF913D" />
    {/* Text Lines */}
    <line x1="40" y1="75" x2="75" y2="75" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="90" x2="70" y2="90" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="40" y1="105" x2="75" y2="105" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="105" y1="75" x2="140" y2="75" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    <line x1="105" y1="90" x2="135" y2="90" stroke="#95634F" strokeWidth="2" strokeLinecap="round" />
    {/* Reading Glasses */}
    <circle cx="65" cy="40" r="12" fill="none" stroke="#3E2723" strokeWidth="2.5" />
    <circle cx="100" cy="40" r="12" fill="none" stroke="#3E2723" strokeWidth="2.5" />
    <path d="M 77 40 Q 82 35 88 40" stroke="#3E2723" strokeWidth="2.5" fill="none" />
  </svg>
);

/**
 * 9. Presentasi: Papan pemaparan hasil & podium
 */
export const PresentationIllustration: React.FC<IllustrationProps> = ({ className = 'w-28 h-28', size }) => (
  <svg viewBox="0 0 160 160" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Easel Stand */}
    <line x1="80" y1="30" x2="40" y2="145" stroke="#95634F" strokeWidth="4" />
    <line x1="80" y1="30" x2="120" y2="145" stroke="#95634F" strokeWidth="4" />
    <line x1="80" y1="40" x2="80" y2="145" stroke="#95634F" strokeWidth="3" />
    {/* Presentation Board */}
    <rect x="25" y="30" width="110" height="75" rx="6" fill="#FFFFFF" stroke="#95634F" strokeWidth="3" />
    <rect x="35" y="40" width="90" height="15" fill="#FFE082" rx="3" />
    <line x1="40" y1="68" x2="95" y2="68" stroke="#95634F" strokeWidth="2.5" />
    <line x1="40" y1="82" x2="80" y2="82" stroke="#95634F" strokeWidth="2.5" />
    {/* Pin / Clip */}
    <circle cx="80" cy="27" r="5" fill="#FF913D" stroke="#95634F" strokeWidth="2" />
  </svg>
);

/**
 * 10. Refleksi: Jurnal belajar, pemikiran dan perjalanan misi
 */
export const ReflectionIllustration: React.FC<IllustrationProps> = ({ className = 'w-28 h-28', size }) => (
  <svg viewBox="0 0 160 160" fill="none" className={className} style={size ? { width: size, height: size } : undefined}>
    {/* Reflection Notebook */}
    <rect x="30" y="25" width="95" height="115" rx="6" fill="#FFFFFF" stroke="#95634F" strokeWidth="3" />
    <rect x="24" y="25" width="12" height="115" rx="3" fill="#95634F" />
    {/* Growth Sprout emerging from book */}
    <path d="M 75 80 Q 72 50 85 45 Q 98 48 90 70 Z" fill="#C5E68A" stroke="#95634F" strokeWidth="2" />
    <path d="M 80 80 Q 82 55 70 50 Q 60 55 68 72 Z" fill="#A8D468" stroke="#95634F" strokeWidth="2" />
    <line x1="77" y1="80" x2="77" y2="95" stroke="#95634F" strokeWidth="2.5" />
    {/* Stars / Sparks of reflection */}
    <circle cx="115" cy="40" r="4" fill="#FFE082" />
    <circle cx="48" cy="45" r="3" fill="#FFE082" />
    <circle cx="110" cy="110" r="5" fill="#FF913D" />
  </svg>
);
