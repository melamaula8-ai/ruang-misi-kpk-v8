import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import GajahMisiBerhasil from '../GajahMisiBerhasil';
import { soundManager } from '../../utils/sound';

interface Props {
  missionId: string;
  isFinalMission: boolean;
  onComplete: () => void;
}

export const MissionCelebrationOverlay: React.FC<Props> = ({ missionId, isFinalMission, onComplete }) => {
  useEffect(() => {
    soundManager.playMissionCelebration();
    return () => soundManager.stopMissionCelebration();
  }, [missionId]);

  return createPortal(
    <div className="mission-celebration-overlay" role="status" aria-live="polite">
      <span className="mission-celebration-word" aria-hidden="true">{isFinalMission ? 'SEMUA MISI SELESAI!' : 'MISI SELESAI!'}</span>
      <span className="mission-celebration-math" aria-hidden="true">KPK!</span>
      <div className="mission-celebration-mascot" aria-hidden="true">
        <GajahMisiBerhasil key={missionId} size={360} onComplete={onComplete} />
      </div>
      <span className="sr-only">Hebat! Satu misi berhasil kamu selesaikan.</span>
    </div>,
    document.body,
  );
};
