import React, { useEffect, useRef, useState } from 'react';
import { LottieSvg } from 'lottie-react';
import { Clock3 } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useAssessment } from '../../context/AssessmentContext';

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

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-4xl items-center justify-center px-4 py-12">
      <section className="w-full overflow-hidden rounded-[2rem] border border-[#EAE3D9] bg-white text-center shadow-lg">
        <div className="bg-[#3E2723] px-6 py-8 text-white sm:px-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFE082]/50 bg-[#FFE082]/15 text-[#FFE082]"><Clock3 className="h-7 w-7" /></div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#FFE082]">Persiapan Kasus {missionNumber}</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Bersedia, Siap, Mulai!</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/80">Siapkan tim. Setelah hitung mundur dan roket meluncur, kasus akan dimulai.</p>
        </div>
        <div className="relative flex min-h-[18rem] flex-col items-center justify-center overflow-hidden px-4 py-8 sm:min-h-[22rem] sm:px-10 sm:py-10">
          {!rocketLaunched ? (
            <div aria-live="assertive" className="flex h-32 w-32 animate-pulse items-center justify-center rounded-full border-[8px] border-[#FFE082] bg-[#C5E68A]/30 text-7xl font-black text-[#3E2723] shadow-inner sm:h-36 sm:w-36">
              {count}
            </div>
          ) : (
            <div className="flex w-full items-center justify-center" aria-label="Animasi roket meluncur">
              <LottieSvg
                src="/rocket-launch.json"
                autoplay
                loop={false}
                className="h-[min(72vw,22rem)] w-[min(72vw,22rem)] max-w-full"
                subscriptions={{
                  complete: () => {
                    if (hasNavigatedRef.current) return;
                    hasNavigatedRef.current = true;
                    onNavigate('misi-detail');
                  },
                }}
              />
            </div>
          )}
          <p className="mt-6 text-lg font-extrabold text-[#3E2723]">
            {rocketLaunched ? 'Mulai! Roket meluncur!' : `Bersiap... ${count}`}
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAE3D9] bg-[#FAF8F5] px-4 py-2 text-sm font-bold text-[#6D5A50]"><Clock3 className="h-4 w-4 text-[#FF913D]" />Batas waktu: {durationMinutes} menit</div>
        </div>
      </section>
    </main>
  );
};
