import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';
import { MissionContext } from '../../types';
import { queueMissionCelebrationAfterMission } from '../../utils/missionCelebration';
import { isMissionMarkedComplete } from '../../utils/missionProgress';
import { MissionSceneHeader } from '../mission/MissionSceneHeader';
import { MissionStoryCard } from '../mission/MissionStoryCard';
import { TikoHintBubble } from '../mission/TikoHintBubble';
import { PolyaStepper, MissionStep } from '../mission/PolyaStepper';
import { AnswerField } from '../mission/AnswerField';
import { MissionToolsDrawer } from '../mission/MissionToolsDrawer';

interface Props {
  missionNumber: number;
  onNavigate: (view: string) => void;
  onSelectMission: (missionNum: number) => void;
}

const accentByContext: Record<MissionContext, [string, string]> = {
  piket: ['#5AA865', '#EEF6EC'],
  lampu: ['#F7C948', '#FFF7DC'],
  olahraga: ['#E9782E', '#FFF0E5'],
  agenda: ['#8A5A33', '#F7F0E8'],
};
const stepLabels: Record<MissionStep, string> = {
  step1: 'Memahami masalah',
  step2: 'Menyusun rencana',
  step3: 'Melaksanakan rencana',
  step4: 'Memeriksa kembali',
};

export const MissionDetailView: React.FC<Props> = ({ missionNumber, onNavigate, onSelectMission }) => {
  const {
    currentTrack,
    learningContent,
    questions,
    activeSubmission,
    updateMissionAnswer,
    completeMission,
    unlockActiveSubmission,
    startMissionTimer,
    timerSeconds,
    isTimerActive,
    hasTimeExpired,
  } = useAssessment();

  const [activeStep, setActiveStep] = useState<MissionStep>('step1');
  const workCardRef = useRef<HTMLElement>(null);

  const question = questions.find((item) => item.missionNumber === missionNumber && item.track === currentTrack);
  const currentQuestions = questions.filter((item) => item.track === currentTrack).slice().sort((a, b) => a.missionNumber - b.missionNumber);
  const questionCount = currentQuestions.length;
  const currentAnswers = (question && activeSubmission.answers[question.id]) || { step1: {}, step2: {}, step3: {}, step4: {} };

  useEffect(() => {
    setActiveStep('step1');
  }, [missionNumber, question?.id]);

  useLayoutEffect(() => {
    if (question) workCardRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [activeStep, question?.id]);

  // Keep hooks unconditional; only start a timer for a valid mission question.
  useEffect(() => {
    if (question) startMissionTimer();
  }, [question?.id, startMissionTimer]);

  useEffect(() => {
    if (!hasTimeExpired) return;
    const timer = window.setTimeout(() => onNavigate('evaluasi'), 3500);
    return () => window.clearTimeout(timer);
  }, [hasTimeExpired, onNavigate]);

  if (!question) return <div className="mq-empty">Soal tidak ditemukan untuk pintu {currentTrack}.</div>;

  const isSubmissionLocked = Boolean(
    activeSubmission.status === 'submitted_pending_review' ||
    activeSubmission.status === 'time_expired_pending_review' ||
    activeSubmission.status === 'results_published' ||
    (activeSubmission.status === 'revision_requested' &&
      activeSubmission.allowedRevisionSections &&
      !activeSubmission.allowedRevisionSections.includes(`misi-${missionNumber}`)));

  const handleInputChange = (step: MissionStep, fieldId: string, value: string) => {
    updateMissionAnswer(question.id, step, fieldId, value);
  };

  const handleManualSave = () => soundManager.playClick();

  const completedMissions = currentQuestions.map((item) => {
    const answers = activeSubmission.answers[item.id];
    const steps = [
      ['step1', item.step1Fields], ['step2', item.step2Fields], ['step3', item.step3Fields], ['step4', item.step4Fields],
    ] as const;
    const totalFields = steps.reduce((count, [, fields]) => count + fields.length, 0);
    const filledCount = steps.reduce((count, [step, fields]) => count + fields.filter((field) => Boolean(answers?.[step]?.[field.id]?.trim())).length, 0);
    return isMissionMarkedComplete(activeSubmission.completedMissionIds, item.id) ||
      activeSubmission.status === 'results_published' ||
      activeSubmission.status === 'submitted_pending_review' ||
      activeSubmission.status === 'time_expired_pending_review' ||
      (totalFields > 0 && (filledCount >= Math.max(3, totalFields * 0.7) ||
        (Boolean(answers?.step3 && Object.values(answers.step3).some((value) => value.trim())) &&
          Boolean(answers?.step4 && Object.values(answers.step4).some((value) => value.trim())))));
  });

  const handleFinishCase = () => {
    soundManager.playNextStep();
    handleManualSave();
    completeMission(question.id);
    // Pressing "Selesai Misi" is the explicit completion action. Answer completeness
    // is still checked before final submission, but it must not trap the map on Misi 1.
    const shouldCelebrate = queueMissionCelebrationAfterMission(activeSubmission.id, question.id, missionNumber, true);
    if (shouldCelebrate) soundManager.prepareMissionCelebration();
    onNavigate('misi');
  };

  const fields = activeStep === 'step1' ? question.step1Fields
    : activeStep === 'step2' ? question.step2Fields
      : activeStep === 'step3' ? question.step3Fields : question.step4Fields;
  const stepTitle = activeStep === 'step1' ? question.step1Title
    : activeStep === 'step2' ? question.step2Title
      : activeStep === 'step3' ? question.step3Title : question.step4Title;
  const stepPrompt = activeStep === 'step1' ? question.step1Prompt
    : activeStep === 'step2' ? question.step2Prompt
      : activeStep === 'step3' ? question.step3Prompt : question.step4Prompt;
  const [accent, accentSoft] = accentByContext[question.context];

  const goNext = () => {
    soundManager.playNextStep();
    const nextStep: MissionStep = activeStep === 'step1' ? 'step2' : activeStep === 'step2' ? 'step3' : 'step4';
    setActiveStep(nextStep);
  };
  const goPrevious = () => {
    soundManager.playClick();
    const previousStep: MissionStep = activeStep === 'step4' ? 'step3' : activeStep === 'step3' ? 'step2' : 'step1';
    setActiveStep(previousStep);
  };

  return (
    <main className="mission-detail-page mq-page" style={{ '--mq-accent': accent, '--mq-accent-soft': accentSoft } as React.CSSProperties}>
      {isSubmissionLocked && <aside className="mq-lock-banner" role="status">
        <div><Lock size={20} aria-hidden="true"/><p>{activeSubmission.status === 'submitted_pending_review' || activeSubmission.status === 'time_expired_pending_review'
          ? 'Jawaban kelompok sudah dikirim. Kamu bisa membuka kunci jika perlu memeriksa atau merevisi.'
          : activeSubmission.status === 'results_published'
            ? 'Misi ini sudah diperiksa guru dan hasilnya telah dibagikan.'
            : 'Bagian misi ini sedang terkunci.'}</p></div>
        {activeSubmission.status !== 'results_published' && <button type="button" onClick={() => { soundManager.playClick(); unlockActiveSubmission(); }}>Buka kunci untuk mengedit</button>}
        {['submitted_pending_review', 'time_expired_pending_review', 'reviewed', 'results_published'].includes(activeSubmission.status) && <button type="button" onClick={() => onNavigate('pintu')}>Pilih pintu lain</button>}
      </aside>}

      <MissionSceneHeader missionNumber={missionNumber} missionCount={questionCount} track={currentTrack} context={question.context} title={question.title} completedMissions={completedMissions} timerSeconds={timerSeconds} isTimerActive={isTimerActive} onNavigate={onNavigate}/>
      <div className="mq-intro-grid">
        <MissionStoryCard question={question} track={currentTrack} missionNumber={missionNumber}/>
        <TikoHintBubble question={question} activeStep={activeStep} missionNumber={missionNumber} teacherHint={learningContent.published.instructions} onRequestHint={() => soundManager.playClick()}/>
      </div>
      <PolyaStepper activeStep={activeStep} answers={currentAnswers} onStepChange={(next) => { soundManager.playClick(); setActiveStep(next); }}/>

      <section ref={workCardRef} className="mq-work-card" aria-labelledby="mq-step-title">
        <header className="mq-work-heading"><div><span>TAHAP {Number(activeStep.slice(-1))} DARI 4</span><h2 id="mq-step-title">{stepTitle}</h2><p>{stepPrompt}</p></div><span className="mq-work-progress">{Object.values(currentAnswers[activeStep] || {}).filter((value) => value.trim()).length} jawaban diisi</span></header>
        <MissionToolsDrawer question={question} activeStep={activeStep}/>
        <div className="mq-fields">{fields.map((field) => <AnswerField key={field.id} field={field} value={currentAnswers[activeStep]?.[field.id] ?? ''} step={activeStep} inputId={`field_${question.id}_${activeStep}_${field.id}`} disabled={isSubmissionLocked} track={currentTrack} onChange={handleInputChange}/>)}</div>
        <div className="mq-action-bar">
          <span className="mq-saved-status"><CheckCircle2 size={18} aria-hidden="true"/> Tersimpan otomatis</span>
          <div className="mq-action-buttons">
            {activeStep !== 'step1' && <button type="button" className="mq-prev-button" onClick={goPrevious}><ArrowLeft size={18}/> Tahap sebelumnya</button>}
            {activeStep !== 'step4' ? <button type="button" className="mq-next-button" onClick={goNext}>Lanjut <ArrowRight size={18}/></button>
              : <button type="button" className="mq-finish-button" onClick={handleFinishCase}><CheckCircle2 size={19}/> Selesai Misi 🎉</button>}
          </div>
        </div>
      </section>
    </main>
  );
};
