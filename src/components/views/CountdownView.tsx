import React, { useEffect, useState } from 'react';
import { Clock3, Rocket, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { useAssessment } from '../../context/AssessmentContext';

interface Props {
  missionNumber: number;
  onNavigate: (view: string) => void;
}

export const CountdownView: React.FC<Props> = ({ missionNumber, onNavigate }) => {
  const [count, setCount] = useState(3);
  const [rocketLaunched, setRocketLaunched] = useState(false);
  const { rubricConfig } = useAssessment();
  const durationMinutes = rubricConfig.durationMinutes ?? 25;

  useEffect(() => {
    let currentCount = 3;
    let launchTimeout: number | undefined;
    soundManager.playCountdownTick(currentCount);

    const interval = window.setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCount(currentCount);
        soundManager.playCountdownTick(currentCount);
        return;
      }

      window.clearInterval(interval);
      setCount(0);
      setRocketLaunched(true);
      soundManager.playStartSignal();
      launchTimeout = window.setTimeout(() => onNavigate('misi-detail'), 1050);
    }, 1000);

    return () => {
      window.clearInterval(interval);
      if (launchTimeout !== undefined) window.clearTimeout(launchTimeout);
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
        <div className="relative overflow-hidden px-6 py-10 sm:px-10">
          <div aria-live="assertive" className={`mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[8px] border-[#FFE082] bg-[#C5E68A]/30 text-7xl font-black text-[#3E2723] shadow-inner ${count > 0 ? 'animate-pulse' : 'scale-105 transition-transform'}`}>
            {count > 0 ? count : <Sparkles className="h-14 w-14 text-[#95634F]" />}
          </div>
          <div aria-hidden="true" className={`pointer-events-none absolute bottom-10 left-1/2 text-[#FF913D] ${rocketLaunched ? 'rocket-launch' : 'translate-y-24 opacity-0'}`}>
            <Rocket className="h-16 w-16 -rotate-45 fill-[#FFE082] drop-shadow-lg" />
          </div>
          <p className="mt-6 text-lg font-extrabold text-[#3E2723]">
            {count > 0 ? 'Tarik napas, siapkan strategi tim!' : rocketLaunched ? 'Mulai! Roket meluncur!' : 'Mulai!'}
          </p>
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[#EAE3D9] bg-[#FAF8F5] px-4 py-2 text-sm font-bold text-[#6D5A50]"><Clock3 className="h-4 w-4 text-[#FF913D]" />Batas waktu: {durationMinutes} menit</div>
        </div>
      </section>
    </main>
  );
};
