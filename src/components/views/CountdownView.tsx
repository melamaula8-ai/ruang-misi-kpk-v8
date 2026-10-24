import React, { useEffect, useRef, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useAssessment } from '../../context/AssessmentContext';
import { RocketElephant } from '../RocketElephant';

interface Props {
  missionNumber: number;
  onNavigate: (view: string) => void;
}

export const CountdownView: React.FC<Props> = ({ missionNumber, onNavigate }) => {
  const [count, setCount] = useState(1);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const hasNavigatedRef = useRef(false);
  const { rubricConfig } = useAssessment();
  const durationMinutes = rubricConfig.durationMinutes ?? 25;

  useEffect(() => {
    let currentCount = 1;
    soundManager.playCountdownTick(currentCount);

    const interval = window.setInterval(() => {
      if (currentCount < 3) {
        currentCount += 1;
        setCount(currentCount);
        soundManager.playCountdownTick(currentCount);
        return;
      }

      window.clearInterval(interval);
      setRocketLaunched(true);
      soundManager.playStartSignal();
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
    // Countdown runs once for each selected case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionNumber]);

  const handleRocketLaunchComplete = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    onNavigate('misi-detail');
  };

  return (
    <main className="countdown-view">
      <section className="countdown-stage" aria-label={`Persiapan Kasus ${missionNumber}`}>
        <div className="countdown-heading">
          <span className="countdown-kicker"><Clock3 size={16} /> PETUALANGAN SIAP DIMULAI · KASUS {missionNumber}</span>
          <h1>Bersedia, Siap, Mulai!</h1>
          <p>Siapkan tim. Hitung mundur selesai, Tiko akan meluncur membawa kalian ke misi berikutnya!</p>
        </div>

        <div className={`countdown-scene ${rocketLaunched ? 'is-launching' : ''}`} aria-label="Tiko bersiap meluncur di dalam roket">
          <div className="countdown-scene-stars" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i><i>✧</i><i>✦</i></div>
          {!rocketLaunched && <div className="countdown-number" aria-live="assertive">{count}</div>}
          <div className="countdown-launch-pad" aria-hidden="true" />
          <RocketElephant launching={rocketLaunched} onLaunchComplete={handleRocketLaunchComplete} />
          <div className="countdown-smoke countdown-smoke-left" aria-hidden="true" />
          <div className="countdown-smoke countdown-smoke-right" aria-hidden="true" />
        </div>

        <div className="countdown-footer">
          <p className="countdown-state" aria-live="polite">{rocketLaunched ? 'Meluncur! Tiko siap menemani misimu!' : `Tiko bersiap... ${count}`}</p>
          <p className="countdown-duration"><Clock3 size={17} /> Batas waktu misi: <strong>{durationMinutes} menit</strong></p>
        </div>
      </section>
    </main>
  );
};
