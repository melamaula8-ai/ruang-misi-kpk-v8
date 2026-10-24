import React from 'react';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';

interface WelcomeSplashProps {
  onStart: () => void;
  isExiting: boolean;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onStart, isExiting, musicEnabled, onToggleMusic }) => (
  <main className={`welcome-splash${isExiting ? ' is-leaving' : ''}`} aria-labelledby="welcome-splash-title" aria-busy={isExiting}>
    <button type="button" onClick={onToggleMusic} className="welcome-splash-music" aria-label={musicEnabled ? 'Matikan musik latar' : 'Nyalakan musik latar'} title={musicEnabled ? 'Matikan musik latar' : 'Nyalakan musik latar'}>
      {musicEnabled ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
      <span>Musik {musicEnabled ? 'ON' : 'OFF'}</span>
    </button>
    <svg className="welcome-splash-doodles" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path pathLength={1} className="doodle doodle-yellow" d="M125 245c45-64 100-72 145-36 22 18 28 45 15 68-14 24-45 27-63 8" />
      <path pathLength={1} className="doodle doodle-coral" d="M1230 210c-37-36-81-37-109-8-19 20-17 51 5 63 19 10 40 1 48-18" />
      <path pathLength={1} className="doodle doodle-green" d="M92 690c39 27 88 26 122-3 28-24 62-23 82-1" />
      <path pathLength={1} className="doodle doodle-blue" d="M1210 690c-22-40-12-81 22-99 30-16 65 1 67 33 2 23-14 40-35 40" />
      <path pathLength={1} className="doodle doodle-purple" d="M1115 420c31-29 64-31 90-8m-42 35 45-42" />
      <path pathLength={1} className="doodle doodle-orange" d="M290 430c22-20 45-21 64-4m-28 25 39-39" />
      <circle className="doodle-dot dot-yellow" cx="270" cy="310" r="8" />
      <circle className="doodle-dot dot-green" cx="1140" cy="610" r="7" />
      <circle className="doodle-dot dot-blue" cx="330" cy="640" r="6" />
      <circle className="doodle-dot dot-coral" cx="1100" cy="300" r="8" />
    </svg>
    <div className="welcome-splash-content">
      <img
        className="welcome-splash-logo"
        src="/app_logo.jpg"
        alt="Tiko, gajah biru dan logo Ruang Misi KPK"
        fetchPriority="high"
      />
      <p className="welcome-splash-eyebrow">RUANG BELAJAR MATEMATIKA KELAS V</p>
      <h1 id="welcome-splash-title">Selamat datang!</h1>
      <p className="welcome-splash-copy">Siapkan dirimu untuk menemukan pola dan menyelesaikan misi KPK.</p>
      <button className="welcome-splash-start" type="button" onClick={onStart} disabled={isExiting}>
        {isExiting ? 'TIKO MEMBUKA PETUALANGAN...' : 'AYO MULAI BERPETUALANG'} <ArrowRight size={20} aria-hidden="true" />
      </button>
      <p className="welcome-splash-credit">Web aplikasi ini dibuat oleh <strong>Mela Minkhatul Maula</strong></p>
    </div>
  </main>
);
