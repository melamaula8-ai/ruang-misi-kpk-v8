import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  HelpCircle,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Table,
  Clock3,
} from 'lucide-react';
import {
  PiketIllustration,
  TrafficIllustration,
  SportsIllustration,
  AgendaIllustration,
} from '../illustrations/Illustrations';
import { NeutralMultiplesTable } from '../tools/NeutralMultiplesTable';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';
import { MissionSubmissionAnswers } from '../../types';

interface Props {
  missionNumber: number;
  onNavigate: (view: string) => void;
  onSelectMission: (missionNum: number) => void;
}

export const MissionDetailView: React.FC<Props> = ({
  missionNumber,
  onNavigate,
  onSelectMission,
}) => {
  const {
    currentTrack,
    learningContent,
    questions,
    activeSubmission,
    updateMissionAnswer,
    unlockActiveSubmission,
    startMissionTimer,
    timerSeconds,
    isTimerActive,
    hasTimeExpired,
  } = useAssessment();

  // Reset to step1 whenever missionNumber changes
  const [activeStep, setActiveStep] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');
  const [showHints, setShowHints] = useState(false);
  const [showMultiplesTable, setShowMultiplesTable] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Find question matching current track and missionNumber
  const question = questions.find(
    (q) => q.missionNumber === missionNumber && q.track === currentTrack
  );
  const questionCount = questions.filter((q) => q.track === currentTrack).length;

  // Submission answers for this question
  const currentAnswers = (question && activeSubmission.answers[question.id]) || {
    step1: {},
    step2: {},
    step3: {},
    step4: {},
  };

  // Local state for instant typing responsiveness and zero dropped keystrokes
  const [localAnswers, setLocalAnswers] = useState<MissionSubmissionAnswers>(
    () => currentAnswers
  );

  useEffect(() => {
    setActiveStep('step1');
    setShowHints(false);
    setShowMultiplesTable(false);
    if (question) {
      setLocalAnswers(activeSubmission.answers[question.id] || { step1: {}, step2: {}, step3: {}, step4: {} });
    }
  }, [missionNumber, question?.id]);

  useEffect(() => {
    if (question && activeSubmission.answers[question.id]) {
      setLocalAnswers(activeSubmission.answers[question.id]);
    }
  }, [activeSubmission.answers]);

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-[#6D5A50]">
        Soal tidak ditemukan untuk pintu {currentTrack}.
      </div>
    );
  }

  // Auto-start 25-minute timer when student enters mission investigation
  useEffect(() => {
    startMissionTimer();
  }, [startMissionTimer]);

  // Auto-redirect to results when time expires (Section B3)
  useEffect(() => {
    if (hasTimeExpired) {
      const timer = setTimeout(() => {
        onNavigate('evaluasi');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [hasTimeExpired, onNavigate]);

  // Check read-only status
  const isSubmissionLocked =
    activeSubmission.status === 'submitted_pending_review' ||
    activeSubmission.status === 'time_expired_pending_review' ||
    activeSubmission.status === 'results_published' ||
    (activeSubmission.status === 'revision_requested' &&
      activeSubmission.allowedRevisionSections &&
      !activeSubmission.allowedRevisionSections.includes(`misi-${missionNumber}`));

  const handleInputChange = (
    step: 'step1' | 'step2' | 'step3' | 'step4',
    fieldId: string,
    val: string
  ) => {
    // Immediate local update so the UI never freezes or rejects keystrokes
    setLocalAnswers((prev) => ({
      ...prev,
      [step]: {
        ...(prev[step] || {}),
        [fieldId]: val,
      },
    }));
    updateMissionAnswer(question.id, step, fieldId, val);
  };

  const handleManualSave = () => {
    soundManager.playClick();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const illustrationMap = {
    piket: PiketIllustration,
    lampu: TrafficIllustration,
    olahraga: SportsIllustration,
    agenda: AgendaIllustration,
  };
  const Illustration = illustrationMap[question.context];

  const polyaSteps = [
    { id: 'step1' as const, label: 'Tahap 1: Memahami Masalah' },
    { id: 'step2' as const, label: 'Tahap 2: Menyusun Rencana' },
    { id: 'step3' as const, label: 'Tahap 3: Melaksanakan Rencana' },
    { id: 'step4' as const, label: 'Tahap 4: Memeriksa Kembali' },
  ];

  const handleNextStep = () => {
    soundManager.playNextStep();
    const idx = polyaSteps.findIndex((s) => s.id === activeStep);
    if (idx < 3) {
      setActiveStep(polyaSteps[idx + 1].id);
    }
  };

  const handlePrevStep = () => {
    soundManager.playClick();
    const idx = polyaSteps.findIndex((s) => s.id === activeStep);
    if (idx > 0) {
      setActiveStep(polyaSteps[idx - 1].id);
    }
  };

  const handleFinishCase = () => {
    soundManager.playNextStep();
    handleManualSave();
    // Return to the dashboard of 4 cases
    onNavigate('misi');
  };

  return (
    <div className="mission-detail-page relative isolate w-full max-w-6xl min-w-0 mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE3D9] pb-4">
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('misi');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6D5A50] hover:text-[#3E2723] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor 4 Kasus</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8C7A70]">Pintu Belajar:</span>
            <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A]">
              {currentTrack}
            </span>
          </div>
          <div role="timer" aria-label={`Sisa waktu ${Math.floor(timerSeconds / 60)} menit ${timerSeconds % 60} detik`} className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-black tabular-nums lg:hidden ${timerSeconds < 300 ? 'border-red-200 bg-red-50 text-red-700' : 'border-[#F0D9A7] bg-[#FFF7DC] text-[#704A36]'}`}>
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span>{String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}</span>
            {isTimerActive && <span className="font-semibold">· berjalan</span>}
          </div>
        </div>
      </div>

      {isSubmissionLocked && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#FAF8F5] border border-[#FFE082] text-[#6F4736] text-xs rounded-xl font-bold">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[#FF913D] shrink-0" />
            <span>
              {activeSubmission.status === 'submitted_pending_review'
                ? 'Jawaban sebelumnya telah dikirim ke data guru. Kamu dapat membuka kunci jika ingin memeriksa atau merevisi jawaban.'
                : activeSubmission.status === 'results_published'
                ? 'Asesmen ini telah selesai diperiksa dan hasil evaluasi sudah dipublikasikan.'
                : 'Bagian kasus ini sebelumnya terkunci.'}
            </span>
          </div>
          {activeSubmission.status !== 'results_published' && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                unlockActiveSubmission();
              }}
              className="px-3.5 py-1.5 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              Buka Kunci untuk Edit Jawaban
            </button>
          )}
        </div>
      )}

      {saveToast && (
        <div className="flex items-center gap-2 p-3 bg-[#C5E68A]/30 border border-[#A8D468] text-[#2D231E] text-xs rounded-xl font-bold">
          <CheckCircle2 className="w-4 h-4 text-[#4A671E] shrink-0" />
          <span>Jawaban berhasil disimpan ke data kelompok!</span>
        </div>
      )}

      {/* Story and challenge introduction */}
      <section className="mission-story-card min-w-0 bg-white border border-[#EAE3D9] rounded-2xl p-4 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex max-w-full flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase bg-[#FFE082]/55 text-[#6F4736]">
              Kasus {missionNumber} dari {questionCount} · Orientasi Masalah
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3E2723]">
              {question.title}
            </h1>
            <p className="text-sm text-[#4A3931] leading-relaxed whitespace-pre-line bg-[#FAF8F5] p-4 rounded-xl border border-[#EAE3D9] font-medium">
              {question.story}
            </p>
            <p className="rounded-xl border border-[#DCE9C6] bg-[#F4F9E9] p-3 text-sm leading-6 text-[#42631D]"><strong>Petunjuk guru:</strong> {learningContent.published.instructions}</p>
          </div>

          <div className="md:col-span-4 flex justify-center">
            <div className="mission-illustration flex h-36 w-full max-w-[15rem] items-center justify-center rounded-2xl border border-[#EAE3D9] bg-[#FAF8F5] p-3 sm:h-48 sm:max-w-none">
              <Illustration className="h-full w-full max-w-[13rem]" />
            </div>
          </div>
        </div>

        {/* Neutral Multiples Assistance Strip */}
        <div className="pt-5 mt-5 border-t border-[#EAE3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#6D5A50]">
            Perlu bantuan memeriksa perkalian atau deret kelipatan secara mandiri?
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowMultiplesTable(!showMultiplesTable);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              showMultiplesTable
                ? 'bg-[#FF913D] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#3E2723] border border-[#E8DFD8] hover:bg-neutral-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{showMultiplesTable ? 'Sembunyikan Tabel Bantuan' : 'Buka Tabel Bantuan Kelipatan'}</span>
          </button>
        </div>

        {/* Opened Neutral Multiples Table */}
        {showMultiplesTable && (
          <div className="mt-4 pt-4 border-t border-[#EAE3D9]">
            <NeutralMultiplesTable />
          </div>
        )}
      </section>

      {/* 4 Tahap Polya Navigation Tabs */}
      <div className="mission-step-nav grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-[#EAE3D9] bg-white/85 p-2 shadow-sm">
        {polyaSteps.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              onClick={() => {
                soundManager.playClick();
                setActiveStep(step.id);
              }}
              className={`min-h-12 min-w-0 rounded-xl border px-2 py-2 text-xs font-bold transition-all cursor-pointer sm:px-4 ${
                isActive
                  ? 'border-[#FF913D] text-[#3E2723] bg-[#FFF7DC] shadow-sm'
                  : 'border-transparent text-[#6D5A50] hover:border-[#EAE3D9] hover:bg-white hover:text-[#3E2723]'
              }`}
            >
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Polya Step Work Area */}
      <section className="practice-question-card mission-work-card min-w-0 space-y-6 rounded-2xl border border-[#EAE3D9] bg-white p-4 pt-6 shadow-md sm:p-8 sm:pt-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EAE3D9] bg-gradient-to-r from-[#F4F9E9] via-white to-[#FFF7DC] px-4 py-3">
          <div><span className="text-xs font-black uppercase tracking-wider text-[#95634F]">Ruang kerja kelompok</span><p className="mt-0.5 text-sm font-bold text-[#3E2723]">Kasus {missionNumber} dari {questionCount} · Langkah {Number(activeStep.slice(-1))} dari 4</p></div>
          <div className="flex items-center gap-1.5" aria-label={`Langkah ${Number(activeStep.slice(-1))} dari 4`}>
            {polyaSteps.map((step, index) => <span key={step.id} className={`h-2.5 w-7 rounded-full sm:w-10 ${index < Number(activeStep.slice(-1)) ? 'bg-[#FF913D]' : 'bg-[#EAE3D9]'}`} />)}
          </div>
        </div>
        {/* Step Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#95634F]">
              {activeStep === 'step1'
                ? 'Tahap 1'
                : activeStep === 'step2'
                ? 'Tahap 2'
                : activeStep === 'step3'
                ? 'Tahap 3'
                : 'Tahap 4'}
            </span>
            <h2 className="text-lg font-bold text-[#3E2723]">
              {activeStep === 'step1'
                ? question.step1Title
                : activeStep === 'step2'
                ? question.step2Title
                : activeStep === 'step3'
                ? question.step3Title
                : question.step4Title}
            </h2>
            <p className="text-xs text-[#6D5A50] mt-0.5">
              {activeStep === 'step1'
                ? question.step1Prompt
                : activeStep === 'step2'
                ? question.step2Prompt
                : activeStep === 'step3'
                ? question.step3Prompt
                : question.step4Prompt}
            </p>
          </div>

          {/* Didactic Hints Toggle */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowHints(!showHints);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFE082]/40 hover:bg-[#FFE082]/70 text-[#6F4736] border border-[#FFE082] text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#FF913D]" />
            <span>Petunjuk Berpikir</span>
            {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Hints Drawer (Bagian 6) */}
        {showHints && (
          <div className="bg-[#FAF8F5] border border-[#FFE082] rounded-xl p-4 text-xs space-y-2">
            <span className="font-bold text-[#6F4736] block">
              Pertanyaan Pemandu (Diskusikan bersama kelompok):
            </span>
            <ul className="list-disc list-inside space-y-1 text-[#5D4E46]">
              {(question.didacticHints[activeStep] || []).map((hint, i) => (
                <li key={i} className="leading-relaxed">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Dynamic Fields for the active Polya step without spoiler placeholders */}
        <div className="min-w-0 space-y-4">
          {(activeStep === 'step1'
            ? question.step1Fields
            : activeStep === 'step2'
            ? question.step2Fields
            : activeStep === 'step3'
            ? question.step3Fields
            : question.step4Fields
          ).map((field) => {
            const val = localAnswers[activeStep]?.[field.id] ?? (currentAnswers[activeStep]?.[field.id] || '');
            const inputId = `field_${question.id}_${activeStep}_${field.id}`;

            return (
              <div
                key={field.id}
                className="min-w-0 space-y-2 p-3 sm:p-4 rounded-xl bg-white border-2 border-[#E8DFD8] hover:border-[#95634F] focus-within:border-[#FF913D] focus-within:ring-2 focus-within:ring-[#FF913D]/20 transition-all cursor-text shadow-xs"
                onClick={() => {
                  const el = document.getElementById(inputId);
                  if (el) el.focus();
                }}
              >
                <label
                  htmlFor={inputId}
                  className="text-xs font-bold text-[#3E2723] block cursor-pointer select-none"
                >
                  {field.label}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    id={inputId}
                    rows={5}
                    autoComplete="off"
                    value={val}
                    onChange={(e) =>
                      handleInputChange(activeStep, field.id, e.target.value)
                    }
                    placeholder="Tuliskan cara kamu menemukan jawabannya di sini…"
                    className="mission-answer-textarea box-border h-auto min-h-[9.5rem] w-full min-w-0 resize-y rounded-xl border border-[#D8CFC8] bg-[#FAF8F5] px-4 py-3 text-sm lg:text-base font-medium leading-6 text-[#2D231E] transition-colors placeholder:text-[#8C7A70] hover:border-[#95634F] focus:border-[#FF913D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF913D]/15"
                  />
                ) : (
                  <div className="min-w-0 space-y-1.5">
                    <input
                      id={inputId}
                      type="text"
                      autoComplete="off"
                      inputMode={field.type === 'number' ? 'numeric' : undefined}
                      value={val}
                      onChange={(e) =>
                        handleInputChange(activeStep, field.id, e.target.value)
                      }
                      placeholder="Tuliskan jawaban kelompok di sini..."
                      className="box-border h-14 w-full min-w-0 px-4 bg-[#FAF8F5] focus:bg-white border border-[#D8CFC8] hover:border-[#95634F] focus:border-[#FF913D] rounded-xl text-sm lg:text-base font-medium text-[#2D231E] focus:outline-none transition-colors"
                    />
                    {field.scaffoldSuffix && (
                      <span className="block text-xs font-bold text-[#6D5A50]">
                        {field.scaffoldSuffix}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons within step */}
        <div className="pt-6 border-t border-[#EAE3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isSubmissionLocked && (
              <button
                type="button"
                onClick={handleManualSave}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#D8CFC8] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#95634F]" />
                <span>Simpan Jawaban</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeStep !== 'step1' && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EAE3D9] text-[#3E2723] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tahap Sebelumnya
              </button>
            )}

            {activeStep !== 'step4' ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <span>Lanjut ke Tahap Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishCase}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C5E68A]" />
                <span>Selesai Kasus Ini & Kembali ke Dasbor 4 Kasus</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
