import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Award, Check, Clock3, Home, LockKeyhole, Timer } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';
import { consumeMissionCelebration } from '../../utils/missionCelebration';
import { MissionCelebrationOverlay } from './MissionCelebrationOverlay';

interface Props {
  onNavigate: (view: string) => void;
  onSelectMission: (missionNum: number) => void;
}

const missionIcons = ['/assets/misi1.png', '/assets/misi2.png', '/assets/misi3.png', '/assets/misi4.png'];
const desktopCarCenters = [206, 573, 855, 1137, 1362];
const phoneCarCenters = [52, 96, 178, 260, 342];
const missionNames = ['Jadwal Piket Kelas', 'Lampu Lalu Lintas', 'Jadwal Olahraga', 'Belajar Bersama'];

export const MissionsHubView: React.FC<Props> = ({ onNavigate, onSelectMission }) => {
  const { currentTrack, questions, activeSubmission, timerSeconds, rubricConfig, hasTimeExpired } = useAssessment();
  const [arrivalMarker] = useState(() => consumeMissionCelebration(activeSubmission.id));
  const [animationStage, setAnimationStage] = useState<'celebrating' | 'pause' | 'travel' | 'arrived'>(
    arrivalMarker ? 'celebrating' : 'arrived',
  );
  const [showStars, setShowStars] = useState(false);

  const currentQuestions = questions
    .filter((question) => question.track === currentTrack)
    .slice()
    .sort((a, b) => a.missionNumber - b.missionNumber);

  const statuses = currentQuestions.map((question) => {
    const answers = activeSubmission.answers[question.id];
    const steps = [
      ['step1', question.step1Fields], ['step2', question.step2Fields],
      ['step3', question.step3Fields], ['step4', question.step4Fields],
    ] as const;
    const totalFields = steps.reduce((count, [, fields]) => count + fields.length, 0);
    const filledCount = steps.reduce((count, [step, fields]) =>
      count + fields.filter((field) => Boolean(answers?.[step]?.[field.id]?.trim())).length, 0);
    const isComplete = activeSubmission.status === 'results_published' ||
      activeSubmission.status === 'submitted_pending_review' ||
      activeSubmission.status === 'time_expired_pending_review' ||
      (totalFields > 0 && (
        filledCount >= Math.max(3, totalFields * 0.7) ||
        (Boolean(answers?.step3 && Object.values(answers.step3).some((value) => value.trim())) &&
          Boolean(answers?.step4 && Object.values(answers.step4).some((value) => value.trim())))
      ));
    return { isComplete, filledCount, totalFields };
  });

  const allCasesCompleted = statuses.length > 0 && statuses.every((status) => status.isComplete);
  const contiguousDoneCount = statuses.reduce((count, status, index) =>
    index === count && status.isComplete ? count + 1 : count, 0);
  const visualDoneCount = arrivalMarker
    ? (animationStage === 'travel' || animationStage === 'arrived' ? arrivalMarker.toDone : arrivalMarker.fromDone)
    : contiguousDoneCount;
  const progressPercent = currentQuestions.length
    ? Math.round((visualDoneCount / currentQuestions.length) * 100)
    : 0;
  const isSubmitted = ['submitted_pending_review', 'time_expired_pending_review', 'reviewed', 'results_published'].includes(activeSubmission.status);
  const activeIndex = Math.min(visualDoneCount, Math.max(0, currentQuestions.length - 1));
  const activeQuestion = currentQuestions[activeIndex];
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const carCenters = currentQuestions.length === 4 ? desktopCarCenters : desktopCarCenters.slice(0, currentQuestions.length + 1);
  const phoneCenters = currentQuestions.length === 4 ? phoneCarCenters : phoneCarCenters.slice(0, currentQuestions.length + 1);
  const carStep = Math.min(visualDoneCount, carCenters.length - 1);
  const desktopCarCenter = carCenters[carStep] ?? desktopCarCenters[0];
  const phoneCarCenter = phoneCenters[carStep] ?? phoneCarCenters[0];
  const title = isSubmitted && allCasesCompleted && visualDoneCount >= currentQuestions.length
    ? 'Hore, petualanganmu selesai!'
    : visualDoneCount === 0 ? 'Empat misi, satu tim hebat!' : 'Ayo lanjutkan petualanganmu!';
  const subtitle = isSubmitted && allCasesCompleted && visualDoneCount >= currentQuestions.length
    ? 'Kamu dan Tiko sudah menemukan pola bilangan.'
    : allCasesCompleted
      ? 'Semua misi sudah terjawab. Periksa lagi jawabanmu, lalu kirim asesmen ke guru.'
      : 'Pilih misi aktif dan temukan pola bilangan bersama Tiko!';

  useEffect(() => {
    if (animationStage !== 'pause') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setAnimationStage('travel'), reducedMotion ? 350 : 850);
    return () => window.clearTimeout(timer);
  }, [animationStage]);

  useEffect(() => {
    if (animationStage !== 'travel') return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => {
      setAnimationStage('arrived');
      setShowStars(true);
    }, reducedMotion ? 0 : 1800);
    return () => window.clearTimeout(timer);
  }, [animationStage]);

  useEffect(() => {
    if (!showStars) return;
    const timer = window.setTimeout(() => setShowStars(false), 1500);
    return () => window.clearTimeout(timer);
  }, [showStars]);

  useEffect(() => {
    if (!hasTimeExpired) return;
    const timer = window.setTimeout(() => onNavigate('evaluasi'), 3500);
    return () => window.clearTimeout(timer);
  }, [hasTimeExpired, onNavigate]);

  const selectMission = (missionNumber: number) => {
    const index = currentQuestions.findIndex((question) => question.missionNumber === missionNumber);
    if (index < 0 || index > activeIndex) return;
    soundManager.playClick();
    onSelectMission(missionNumber);
  };

  return (
    <div className="mission-map-shell">
      <header className="mission-map-header">
        <div className="mission-map-brand">
          <img src="/app_logo.jpg" alt="" className="mission-map-logo" />
          <span>Ruang Misi KPK</span>
        </div>
        <button type="button" className="mission-map-home" onClick={() => { soundManager.playClick(); onNavigate('beranda'); }}>
          <Home size={17} aria-hidden="true" /><span>Halaman Utama</span>
        </button>
      </header>

      <main className="mission-map-main" aria-label="Peta misi siswa">
        <section className="mission-map-hero">
          <div className="mission-map-hero-art"><img src="/assets/elephant.png" alt="Tiko, gajah biru teman petualangan" /></div>
          <div className="mission-map-welcome">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <section className="mission-map-progress" aria-label="Progres misi">
            <div className="mission-map-progress-title"><Award size={22} aria-hidden="true" /><strong>Progres Misi</strong><span>{visualDoneCount} dari {currentQuestions.length}</span></div>
            <div className="mission-map-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={currentQuestions.length} aria-valuenow={visualDoneCount} aria-label={`${visualDoneCount} dari ${currentQuestions.length} misi selesai`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="mission-map-clock"><Timer size={15} aria-hidden="true" /><span>{hasTimeExpired ? 'Waktu selesai' : `Timer ${rubricConfig.durationMinutes ?? 25} menit · ${formattedTime}`}</span></div>
          </section>
        </section>

        {hasTimeExpired && <div className="mission-map-expired" role="status"><Clock3 size={17} /> Waktu pengerjaan habis. Jawaban tersimpan dan asesmen otomatis dikirim ke guru.</div>}

        <section className="mission-map-scene" aria-label="Jalur empat misi">
          <div className="mission-map-sun" aria-hidden="true" />
          <span className="mission-map-cloud mission-map-cloud-one" aria-hidden="true" />
          <span className="mission-map-cloud mission-map-cloud-two" aria-hidden="true" />
          <div className="mission-map-hill mission-map-hill-back" aria-hidden="true" />
          <div className="mission-map-hill mission-map-hill-mid" aria-hidden="true" />
          <div className="mission-map-hill mission-map-hill-front" aria-hidden="true" />
          <div className="mission-map-fence" aria-hidden="true" />
          <span className="mission-map-start-sign" aria-hidden="true">Mulai</span>
          <div className="mission-map-road" aria-hidden="true"><span style={{ width: `${currentQuestions.length ? Math.min(100, (visualDoneCount / currentQuestions.length) * 100) : 0}%` }} /></div>

          {currentQuestions.map((question, index) => {
            const isDone = index < visualDoneCount;
            const isActive = index === visualDoneCount && index === activeIndex;
            const isLocked = index > activeIndex;
            const missionLabel = question.title || missionNames[index] || `Misi ${index + 1}`;
            return (
              <div key={question.id} className={`mission-map-stop mission-map-stop-${index + 1}`} style={{ '--desktop-x': `${[30, 49.6, 69.2, 88.8][index] ?? 50}%`, '--phone-x': `${[24.6, 45.6, 66.7, 87.7][index] ?? 50}%` } as React.CSSProperties}>
                <span className={`mission-map-pin ${isDone ? 'is-done' : isActive ? 'is-active' : 'is-locked'}`} aria-hidden="true">{isDone ? <Check size={24} strokeWidth={3} /> : isLocked ? <LockKeyhole size={19} /> : index + 1}</span>
                <button
                  type="button"
                  className={`mission-map-bubble ${isDone ? 'is-done' : isActive ? 'is-active' : 'is-locked'}`}
                  onClick={() => selectMission(question.missionNumber)}
                  disabled={isLocked}
                  aria-label={`${isLocked ? 'Terkunci' : isDone ? 'Selesai, tinjau' : 'Misi aktif'}: ${missionLabel}`}
                  aria-current={isActive ? 'step' : undefined}
                  title={isLocked ? 'Selesaikan misi sebelumnya terlebih dahulu' : missionLabel}
                >
                  <img src={missionIcons[index % missionIcons.length]} alt="" />
                </button>
                <div className="mission-map-label"><strong>Misi {question.missionNumber}</strong><span>{missionNames[index] || missionLabel}</span></div>
                {showStars && arrivalMarker?.missionId === question.id && <div className="mission-map-stars" aria-hidden="true"><i>★</i><i>★</i><i>★</i><i>★</i></div>}
              </div>
            );
          })}

          <img
            className={`mission-map-traveler${animationStage === 'travel' ? ' is-traveling' : ''}`}
            src="/assets/car.png"
            alt="Tiko, gajah biru naik mobil berpindah menuju misi berikutnya"
            style={{
              '--desktop-center': `${desktopCarCenter}`,
              '--phone-center': `${phoneCarCenter}`,
              '--desktop-trail': `${Math.max(0, Math.min(100, ((desktopCarCenter - 108) / 1332) * 100))}%`,
              '--phone-trail': `${Math.max(0, Math.min(100, (phoneCarCenter / 390) * 100))}%`,
            } as React.CSSProperties}
          />
          <div className="mission-map-chalkboard" aria-hidden="true"><span>Matematika Itu Seru!</span></div>
          <div className="mission-map-flowers" aria-hidden="true">✿　✿　✿</div>
        </section>

        <div className="mission-map-action">
          <button
            type="button"
            disabled={!allCasesCompleted && !activeQuestion}
            onClick={() => {
              soundManager.playNextStep();
              if (allCasesCompleted) onNavigate(isSubmitted ? 'evaluasi' : 'refleksi');
              else if (activeQuestion) selectMission(activeQuestion.missionNumber);
            }}
          >
            {allCasesCompleted
              ? <>{isSubmitted ? 'Lihat Status Asesmen' : 'Tinjau Jawaban & Refleksi'}<ArrowRight size={19} /></>
              : <>{`Mulai Misi ${activeQuestion?.missionNumber ?? 1}`}<ArrowRight size={19} /></>}
          </button>
        </div>
      </main>
      {arrivalMarker && animationStage === 'celebrating' && (
        <MissionCelebrationOverlay
          missionId={arrivalMarker.missionId}
          isFinalMission={arrivalMarker.toDone >= currentQuestions.length}
          onComplete={() => setAnimationStage('pause')}
        />
      )}
    </div>
  );
};
