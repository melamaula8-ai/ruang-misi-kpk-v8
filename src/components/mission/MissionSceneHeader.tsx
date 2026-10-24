import React from 'react';
import { ArrowLeft, Clock3 } from 'lucide-react';
import type { LearningTrack, MissionContext } from '../../types';

interface Props {
  missionNumber: number;
  missionCount: number;
  track: LearningTrack;
  context: MissionContext;
  title: string;
  completedMissions: boolean[];
  timerSeconds: number;
  isTimerActive: boolean;
  onNavigate: (view: string) => void;
}

const trackNames: Record<LearningTrack, string> = {
  penjelajah: 'Penjelajah',
  pengembang: 'Pengembang',
  inovator: 'Inovator',
};

export const MissionSceneHeader: React.FC<Props> = ({ missionNumber, missionCount, track, context, title, completedMissions, timerSeconds, isTimerActive, onNavigate }) => {
  const cleanTitle = title.replace(/^Misi\s+\d+\s*:\s*/i, '').replace(/\s*\((Penjelajah|Pengembang|Inovator)\)\s*$/i, '');
  const formatTime = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;

  return (
    <header className={`mq-scene mq-scene-${context}`}>
      <div className="mq-scene-hill mq-scene-hill-back" aria-hidden="true" />
      <div className="mq-scene-hill mq-scene-hill-front" aria-hidden="true" />
      <div className="mq-scene-topline">
        <button type="button" className="mq-back-map" onClick={() => onNavigate('misi')}><ArrowLeft size={18} aria-hidden="true"/> Peta Misi</button>
        <div className={`mq-timer${timerSeconds < 300 ? ' mq-timer-low' : ''}`} role="timer" aria-label={`Sisa waktu ${Math.floor(timerSeconds / 60)} menit ${timerSeconds % 60} detik`}>
          <Clock3 size={18} aria-hidden="true"/><strong>{formatTime}</strong><span>{isTimerActive ? 'Waktu misi' : 'Siap bermain'}</span>
        </div>
      </div>
      <div className="mq-scene-main">
        <div className="mq-scene-copy">
          <p className="mq-eyebrow">MISI {missionNumber} <span>·</span> PINTU {trackNames[track].toUpperCase()}</p>
          <h1>{cleanTitle || title}</h1>
          <p className="mq-mission-count">Misi {missionNumber} dari {missionCount}</p>
          <ol className="mq-map-dots" aria-label="Progres misi">
            {Array.from({ length: missionCount }, (_, index) => {
              const number = index + 1;
              const done = completedMissions[index];
              const active = number === missionNumber;
              return <li key={number} className={`${done ? 'is-done' : ''}${active ? ' is-active' : ''}`} aria-current={active ? 'step' : undefined} aria-label={`Misi ${number}${done ? ', selesai' : active ? ', saat ini' : ', belum selesai'}`}><span>{number}</span></li>;
            })}
          </ol>
        </div>
        <div className="mq-scene-mascots" aria-hidden="true">
          <div className="mq-mission-bubble"><img src={`/assets/misi${missionNumber}.png`} alt=""/></div>
          <img className="mq-tiko" src="/assets/elephant.png" alt=""/>
        </div>
      </div>
    </header>
  );
};
