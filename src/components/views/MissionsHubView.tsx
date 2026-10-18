import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
  Timer,
  Lock,
  AlertCircle,
} from 'lucide-react';
import {
  PiketIllustration,
  TrafficIllustration,
  SportsIllustration,
  AgendaIllustration,
} from '../illustrations/Illustrations';
import { CelebrationModal } from './CelebrationModal';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';

interface Props {
  onNavigate: (view: string) => void;
  onSelectMission: (missionNum: 1 | 2 | 3 | 4) => void;
}

export const MissionsHubView: React.FC<Props> = ({ onNavigate, onSelectMission }) => {
  const {
    currentTrack,
    questions,
    activeSubmission,
    timerSeconds,
    hasTimeExpired,
    startMissionTimer,
  } = useAssessment();

  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const missionsMeta = [
    {
      num: 1 as const,
      id: 'piket',
      title: 'Kasus 1: Jadwal Piket Kelas',
      subtitle: 'Menyiram tanaman kelas dan tugas berkala',
      Illustration: PiketIllustration,
    },
    {
      num: 2 as const,
      id: 'lampu',
      title: 'Kasus 2: Lampu Lalu Lintas',
      subtitle: 'Simulasi sinyal laboratorium berkala',
      Illustration: TrafficIllustration,
    },
    {
      num: 3 as const,
      id: 'olahraga',
      title: 'Kasus 3: Jadwal Olahraga',
      subtitle: 'Jadwal latihan dan kalender bersama',
      Illustration: SportsIllustration,
    },
    {
      num: 4 as const,
      id: 'agenda',
      title: 'Kasus 4: Agenda Sekolah',
      subtitle: 'Kegiatan literasi dan penelusuran tanggal',
      Illustration: AgendaIllustration,
    },
  ];

  // Helper to compute mission completion status
  const getMissionStatus = (missionNum: 1 | 2 | 3 | 4) => {
    const q = questions.find(
      (item) => item.missionNumber === missionNum && item.track === currentTrack
    );
    if (!q) return { label: 'Belum dimulai', status: 'not_started', count: 0, isComplete: false };

    const answers = activeSubmission.answers[q.id];
    if (!answers) return { label: 'Belum dimulai', status: 'not_started', count: 0, isComplete: false };

    const step1Filled = Object.values(answers.step1 || {}).filter((v) => v.trim() !== '').length;
    const step2Filled = Object.values(answers.step2 || {}).filter((v) => v.trim() !== '').length;
    const step3Filled = Object.values(answers.step3 || {}).filter((v) => v.trim() !== '').length;
    const step4Filled = Object.values(answers.step4 || {}).filter((v) => v.trim() !== '').length;

    const totalFields =
      q.step1Fields.length +
      q.step2Fields.length +
      q.step3Fields.length +
      q.step4Fields.length;
    const filledCount = step1Filled + step2Filled + step3Filled + step4Filled;

    // Consider complete if key steps or majority answered
    const isComplete =
      filledCount >= Math.max(3, totalFields * 0.7) ||
      (step3Filled > 0 && step4Filled > 0);

    if (activeSubmission.status === 'results_published') {
      return { label: 'Selesai diperiksa', status: 'reviewed', count: filledCount, total: totalFields, isComplete: true };
    }
    if (activeSubmission.status === 'submitted_pending_review') {
      return { label: 'Tersimpan & Dikirim', status: 'pending_review', count: filledCount, total: totalFields, isComplete: true };
    }
    if (isComplete) {
      return { label: 'Kasus Selesai', status: 'complete', count: filledCount, total: totalFields, isComplete: true };
    }
    if (filledCount > 0) {
      return { label: 'Sedang dikerjakan', status: 'in_progress', count: filledCount, total: totalFields, isComplete: false };
    }
    return { label: 'Belum dimulai', status: 'not_started', count: 0, total: totalFields, isComplete: false };
  };

  const statuses = missionsMeta.map((m) => getMissionStatus(m.num));
  const completeCount = statuses.filter((s) => s.isComplete).length;
  const allCasesCompleted = completeCount === 4;
  const progressPercent = Math.round((completeCount / 4) * 100);

  // Trigger celebration modal when all 4 cases are finished for the first time
  React.useEffect(() => {
    if (allCasesCompleted && !hasCelebrated) {
      setCelebrationOpen(true);
      setHasCelebrated(true);
    }
  }, [allCasesCompleted, hasCelebrated]);

  // Format 25-minute timer
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeLow = timerSeconds < 300; // less than 5 minutes

  const handleCaseSelect = (num: 1 | 2 | 3 | 4) => {
    soundManager.playClick();
    startMissionTimer();
    onSelectMission(num);
  };

  const handleProceedToPresentation = () => {
    if (!allCasesCompleted) return;
    soundManager.playNextStep();
    onNavigate('evaluasi');
  };

  // Auto-redirect to presentation when time expires (Section B3)
  React.useEffect(() => {
    if (hasTimeExpired) {
      const timer = setTimeout(() => {
        onNavigate('evaluasi');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [hasTimeExpired, onNavigate]);

  return (
    <div className="adventure-page max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <section className="mission-hub-hero relative overflow-hidden rounded-[2rem] border-2 border-white bg-gradient-to-r from-[#FFF0D2] via-white to-[#E8F5D8] p-5 shadow-lg sm:p-7">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#FFE082]/50 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><span className="inline-flex rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#9A5A18] shadow-sm">PETA PETUALANGANMU</span><h2 className="mt-3 text-2xl font-black text-[#3E2723] sm:text-3xl">Empat misi, satu tim hebat!</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D5A50]">Pilih kasus, diskusikan strategi, dan isi empat langkah pemecahan masalah. Setiap kemajuan membawamu lebih dekat ke garis akhir.</p></div><div className="flex items-center gap-2" aria-hidden="true"><span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-[#C5E68A] text-lg font-black text-[#42631D] shadow-sm">×</span><span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-[#FFE082] text-lg font-black text-[#704A36] shadow-sm">÷</span><span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-[#FF913D] text-lg font-black text-white shadow-sm">=</span></div></div>
      </section>
      {/* Time Expired Notification Banner */}
      {hasTimeExpired && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#FF913D] shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong>Waktu Pengerjaan 25 Menit Telah Selesai.</strong> Seluruh jawaban kelompok telah otomatis disimpan dan dikirim ke sistem data guru. Mengarahkan ke hasil kelompok...
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onNavigate('evaluasi');
            }}
            className="px-4 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Lihat Hasil Kelompok &rarr;
          </button>
        </div>
      )}

      {/* Header & 25-Minute Countdown Timer Strip */}
      <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
                Dasbor 4 Kasus Investigasi
              </span>
              <span className="text-xs text-[#8C7A70]">·</span>
              <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A]">
                Pintu {currentTrack}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight">
              Pilih Kasus yang Ingin Dikerjakan
            </h1>
            <p className="text-xs sm:text-sm text-[#6D5A50]">
              Kelompokmu bebas memilih kasus mana dulu yang ingin diselesaikan. Selesaikan keempat kasus untuk melihat hasil kelompok.
            </p>
          </div>

          {/* 25-Minute Timer Display */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#EAE3D9] p-3 rounded-2xl shrink-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isTimeLow ? 'bg-red-100 text-red-600' : 'bg-[#FFE082]/40 text-[#6F4736]'
              }`}
            >
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A70] block">
                Timer Pengerjaan (25 Menit):
              </span>
              <div
                className={`text-2xl font-extrabold font-mono tracking-wider ${
                  isTimeLow ? 'text-red-600 animate-pulse' : 'text-[#3E2723]'
                }`}
              >
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#6D5A50]">
              Progres Kasus Selesai:
            </span>
            <span className="font-mono font-bold text-[#3E2723]">
              {completeCount} / 4 Kasus ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-[#FAF8F5] border border-[#EAE3D9] rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#C5E68A] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Mission Cards (Siswa bebas memilih mana dulu yang dikerjakan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missionsMeta.map((m) => {
          const Illustration = m.Illustration;
          const statusInfo = getMissionStatus(m.num);

          let badgeColor = 'text-[#6D5A50] bg-neutral-100';
          let StatusIcon = PlayCircle;

          if (statusInfo.isComplete) {
            badgeColor = 'text-[#2D231E] bg-[#C5E68A] font-bold';
            StatusIcon = CheckCircle2;
          } else if (statusInfo.status === 'in_progress') {
            badgeColor = 'text-[#8C6D1F] bg-[#FFE082] font-semibold';
            StatusIcon = Clock;
          }

          return (
            <div
              key={m.num}
              onClick={() => handleCaseSelect(m.num)}
              className="bg-white border-2 border-[#EAE3D9] hover:border-[#FF913D] rounded-2xl p-6 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] ${badgeColor}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusInfo.label}</span>
                  </span>
                  <h3 className="text-lg font-bold text-[#3E2723] pt-1 group-hover:text-[#FF913D] transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-[#6D5A50]">{m.subtitle}</p>
                </div>

                <div className="w-20 h-20 shrink-0 flex items-center justify-center bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] p-1">
                  <Illustration className="w-16 h-16" />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between text-xs">
                <span className="text-[#8C7A70] font-medium">
                  Tahap 1 s.d. 4 Polya
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCaseSelect(m.num);
                  }}
                  className="flex items-center gap-1.5 font-bold text-[#FF913D] group-hover:text-[#F2822B]"
                >
                  <span>{statusInfo.isComplete ? 'Tinjau / Edit Kasus' : 'Kerjakan Kasus Ini'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer navigation to Results (locked until all 4 cases are complete) */}
      <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-xs text-[#6D5A50] text-center sm:text-left">
          <div className="flex items-center gap-1.5 font-bold text-[#3E2723]">
            {allCasesCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-[#4A671E]" />
            ) : (
              <Lock className="w-4 h-4 text-[#FF913D]" />
            )}
            <span>Syarat Membuka Hasil Kelompok:</span>
          </div>
          <p>
            {allCasesCompleted
              ? 'Selamat! Seluruh 4 kasus telah selesai dikerjakan. Hasil kelompok kini dapat dilihat.'
              : `Kelompokmu telah menyelesaikan ${completeCount} dari 4 kasus. Selesaikan seluruh 4 kasus untuk melihat hasil kelompok.`}
          </p>
        </div>

        <button
          disabled={!allCasesCompleted}
          onClick={handleProceedToPresentation}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold rounded-xl transition-all ${
            allCasesCompleted
              ? 'bg-[#FF913D] hover:bg-[#F2822B] text-white shadow-md cursor-pointer'
              : 'bg-[#EAE3D9] text-[#8C7A70] cursor-not-allowed opacity-75'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{allCasesCompleted ? 'Lihat Hasil Kelompok' : `Terkunci (${completeCount}/4 Kasus Selesai)`}</span>
        </button>
      </div>

      {/* Celebration Modal when 4th case is finished */}
      <CelebrationModal
        isOpen={celebrationOpen}
        teamName={activeSubmission.team.teamName}
        onProceedToPresentation={() => {
          setCelebrationOpen(false);
          onNavigate('evaluasi');
        }}
        onClose={() => setCelebrationOpen(false)}
      />
    </div>
  );
};
