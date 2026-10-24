import React, { useEffect, useRef, useState } from 'react';
import { House, Volume2, VolumeX } from 'lucide-react';
import { AssessmentProvider, useAssessment } from './context/AssessmentContext';
import { isTeamIdentityComplete } from './utils/teamIdentity';
import { Navbar } from './components/layout/Navbar';
import { HomeView } from './components/views/HomeView';
import { RoleLandingView } from './components/views/RoleLandingView';
import { TrackSelectionView } from './components/views/TrackSelectionView';
import { TeamIdentityView } from './components/views/TeamIdentityView';
import { MissionsHubView } from './components/views/MissionsHubView';
import { MissionDetailView } from './components/views/MissionDetailView';
import { CountdownView } from './components/views/CountdownView';
import { PracticeQuestionsView } from './components/views/PracticeQuestionsView';
import { ResultsEvaluationView } from './components/views/ResultsEvaluationView';
import { PresentationView } from './components/views/PresentationView';
import { ReflectionView } from './components/views/ReflectionView';
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { TeacherLoginModal } from './components/modals/TeacherLoginModal';
import { ClassAccessView } from './components/views/ClassAccessView';
import { SchoolHeroIllustration } from './components/illustrations/Illustrations';
import { soundManager } from './utils/sound';
import { LoadingIndicator } from './components/LoadingIndicator';
import { WelcomeSplash } from './components/WelcomeSplash';
import { LearningJourneyView } from './components/views/LearningJourneyView';

function BackgroundMusic({ active, enabled }: { active: boolean; enabled: boolean }) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.28;
    if (!active || !enabled) {
      audio.pause();
      return;
    }

    // Coba mulai segera saat web dibuka. Browser tertentu membatasi autoplay bersuara;
    // jika diblokir, coba lagi pada interaksi pertama pengguna.
    const tryPlay = () => {
      void audio.play().catch(() => {
        // Autoplay bersuara dapat ditolak browser sebelum interaksi pengguna.
      });
    };

    tryPlay();
    const resumeAfterInteraction = () => {
      tryPlay();
      if (!audio.paused) {
        window.removeEventListener('pointerdown', resumeAfterInteraction);
        window.removeEventListener('keydown', resumeAfterInteraction);
        window.removeEventListener('touchstart', resumeAfterInteraction);
      }
    };
    window.addEventListener('pointerdown', resumeAfterInteraction, { passive: true });
    window.addEventListener('keydown', resumeAfterInteraction);
    window.addEventListener('touchstart', resumeAfterInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', resumeAfterInteraction);
      window.removeEventListener('keydown', resumeAfterInteraction);
      window.removeEventListener('touchstart', resumeAfterInteraction);
    };
  }, [active, enabled]);

  return <audio ref={audioRef} src="/music/musik-latar.mp3" loop preload="auto" autoPlay aria-hidden="true" />;
}

function MainApp() {
  const {
    isTeacherLoggedIn,
    currentTrack,
    learningContent,
    hasTimeExpired,
    hasVerifiedGroupToken,
    activeSubmission,
    cloudStatus,
    sessionDeletedNotice,
    dismissSessionDeletedNotice,
  } = useAssessment();
  const [currentView, setCurrentView] = useState<string>('beranda');
  const [showWelcomeSplash, setShowWelcomeSplash] = useState(true);
  const [showRoleLanding, setShowRoleLanding] = useState(true);
  const [roleEntryLoading, setRoleEntryLoading] = useState<'student' | 'teacher' | null>(null);
  const roleEntryStartedAt = React.useRef(0);
  const [activeMissionNumber, setActiveMissionNumber] = useState(1);
  const [showAnswerPreview, setShowAnswerPreview] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [classCodeFromLink] = useState(() => {
    try { const params = new URLSearchParams(window.location.search); return (params.get('kelas') || params.get('class') || params.get('token') || '').trim().toUpperCase(); } catch { return ''; }
  });
  const [identityValidationAttempt, setIdentityValidationAttempt] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicBlockedForPractice, setMusicBlockedForPractice] = useState(false);
  const [hasEnteredMissionMap, setHasEnteredMissionMap] = useState(false);
  const [learningStep, setLearningStep] = useState(1);
  const [maxLearningStep, setMaxLearningStep] = useState(1);
  const [learningJourneyComplete, setLearningJourneyComplete] = useState(false);
  const [hasOpenedPractice, setHasOpenedPractice] = useState(false);

  useEffect(() => {
    const playClickForButton = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest('button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]');
      if (!button || button.matches(':disabled, [aria-disabled="true"]')) return;
      soundManager.playButtonClick();
    };

    // Pasang pada document agar tombol di modal portal dan elemen aplikasi
    // lain di luar root React juga mendapat efek suara.
    document.addEventListener('click', playClickForButton, true);
    return () => document.removeEventListener('click', playClickForButton, true);
  }, []);

  useEffect(() => {
    if (!roleEntryLoading || cloudStatus === 'connecting') return;
    const remainingMinimum = Math.max(0, 2000 - (Date.now() - roleEntryStartedAt.current));
    const timer = window.setTimeout(() => {
      if (roleEntryLoading === 'student') {
        setShowRoleLanding(false);
        setLearningStep(1);
        setMaxLearningStep(1);
        setLearningJourneyComplete(false);
        setHasOpenedPractice(false);
        setCurrentView('beranda');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isTeacherLoggedIn) {
        setShowRoleLanding(false);
        setCurrentView('dashboard-guru');
      } else {
        setIsLoginModalOpen(true);
      }
      setRoleEntryLoading(null);
    }, remainingMinimum);
    return () => window.clearTimeout(timer);
  }, [roleEntryLoading, cloudStatus, isTeacherLoggedIn]);

  const beginRoleEntry = (role: 'student' | 'teacher') => {
    if (roleEntryLoading) return;
    roleEntryStartedAt.current = Date.now();
    setRoleEntryLoading(role);
  };

  // Halaman yang hanya boleh dibuka siswa yang sudah memverifikasi ID Kelompok.
  const STUDENT_SESSION_VIEWS = ['pintu', 'identitas', 'misi', 'countdown', 'misi-detail'];
  // Halaman kelanjutan misi: identitas kelompok wajib lengkap lebih dulu.
  const IDENTITY_REQUIRED_VIEWS = ['misi', 'countdown', 'misi-detail'];

  useEffect(() => {
    if (
      !isTeacherLoggedIn &&
      (cloudStatus === 'online' || sessionDeletedNotice) &&
      !hasVerifiedGroupToken &&
      STUDENT_SESSION_VIEWS.includes(currentView)
    ) {
      // Sesi dihapus guru atau ID belum diverifikasi: arahkan ke halaman ID kelas, bukan modal.
      setCurrentView('kelas');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloudStatus, currentView, hasVerifiedGroupToken, isTeacherLoggedIn, sessionDeletedNotice]);

  // Penjaga terakhir: apa pun jalur masuknya (menu, tombol, sinkronisasi dari perangkat lain),
  // siswa tidak bisa berada di halaman misi bila identitas kelompok belum lengkap.
  // Akses halaman misi tetap memerlukan identitas kelompok yang lengkap.
  useEffect(() => {
    if (isTeacherLoggedIn || !hasVerifiedGroupToken) return;
    if (!IDENTITY_REQUIRED_VIEWS.includes(currentView)) return;
    if (!isTeamIdentityComplete(activeSubmission.team)) {
      setCurrentView('identitas');
      setIdentityValidationAttempt((attempt) => attempt + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, activeSubmission.team, activeSubmission.status, hasTimeExpired, hasVerifiedGroupToken, isTeacherLoggedIn]);

  // Pemberitahuan sesi dihapus hilang sendiri begitu siswa memverifikasi ID untuk sesi baru.
  useEffect(() => {
    if (hasVerifiedGroupToken && sessionDeletedNotice) dismissSessionDeletedNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVerifiedGroupToken, sessionDeletedNotice]);

  const returnToIncompleteIdentity = () => {
    setCurrentView('identitas');
    setIdentityValidationAttempt((attempt) => attempt + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: string, identityValidated = false) => {
    soundManager.playClick();
    if (view === 'gabung-kelas') view = 'kelas';
    if (view === 'halaman-utama') {
      setIsLoginModalOpen(false);
      setCurrentView('beranda');
      setShowRoleLanding(true);
      setMusicBlockedForPractice(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'latihan' && !isTeacherLoggedIn && !learningJourneyComplete) {
      setCurrentView('belajar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (view === 'dashboard-guru' && !isTeacherLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    // Section A2: Guard student missions behind verified Group ID
    if (['pintu', 'identitas', 'misi', 'countdown', 'misi-detail'].includes(view) && !hasVerifiedGroupToken) {
      setCurrentView('kelas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (['misi', 'misi-detail'].includes(view) && !hasEnteredMissionMap) {
      if (currentView !== 'pintu') {
        setCurrentView('pintu');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setHasEnteredMissionMap(true);
    }

    if (
      ['misi', 'misi-detail'].includes(view) &&
      !identityValidated &&
      !isTeamIdentityComplete(activeSubmission.team)
    ) {
      returnToIncompleteIdentity();
      return;
    }

    if (view === 'latihan') setMusicBlockedForPractice(true);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMission = (missionNum: number) => {
    soundManager.playClick();
    if (!hasVerifiedGroupToken) {
      setCurrentView('kelas');
      return;
    }
    if (!isTeamIdentityComplete(activeSubmission.team)) {
      returnToIncompleteIdentity();
      return;
    }
    setActiveMissionNumber(missionNum);
    setCurrentView('countdown');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCountdownComplete = () => {
    // Countdown is only reachable after class and team identity checks in handleSelectMission.
    // Enter the selected student's assessment directly after the rocket animation finishes.
    setHasEnteredMissionMap(true);
    setCurrentView('misi-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateFromMissionDetail = (view: string) => {
    if (view === 'misi' && showAnswerPreview) {
      setCurrentView('refleksi');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleNavigate(view);
  };

  const editMissionFromPreview = (missionNum: number) => {
    if (!hasVerifiedGroupToken) {
      setCurrentView('kelas');
      return;
    }
    if (!isTeamIdentityComplete(activeSubmission.team)) {
      returnToIncompleteIdentity();
      return;
    }
    setActiveMissionNumber(missionNum);
    setCurrentView('misi-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showWelcomeSplash) return <>
    <BackgroundMusic active enabled={musicEnabled} />
    <WelcomeSplash onStart={() => setShowWelcomeSplash(false)} musicEnabled={musicEnabled} onToggleMusic={() => setMusicEnabled((enabled) => !enabled)} />
  </>;

  return (
    <div className="min-h-screen w-full max-w-full min-w-0 flex flex-col bg-[#FAF8F5] text-[#2D231E]">
      <BackgroundMusic active={!musicBlockedForPractice && (showRoleLanding || currentView === 'beranda')} enabled={musicEnabled} />
      {(showRoleLanding || currentView === 'beranda') && (
        <button type="button" onClick={() => setMusicEnabled((enabled) => !enabled)} aria-label={musicEnabled ? 'Matikan musik latar' : 'Nyalakan musik latar'} title={musicEnabled ? 'Matikan musik latar' : 'Nyalakan musik latar'} className={`fixed bottom-5 right-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white bg-[#3E2723] text-sm font-extrabold text-white shadow-xl transition hover:-translate-y-1 sm:bottom-7 sm:right-7 ${showRoleLanding ? 'w-12 justify-center p-0' : 'px-4'}`}>
          {musicEnabled ? <Volume2 size={18} className="text-[#FFE082]" /> : <VolumeX size={18} />}
          <span className={showRoleLanding ? 'sr-only' : ''}>{musicEnabled ? 'Musik ON' : 'Musik OFF'}</span>
        </button>
      )}
      {/* Landing page sengaja hanya menampilkan pilihan peran. */}
      {!showRoleLanding && currentView !== 'misi' && (
        <>
        <div className="border-b border-[#F0E4D7] bg-[#FFF7DC] px-4 py-2">
          <div className="mx-auto flex max-w-7xl justify-start">
            <button type="button" onClick={() => handleNavigate('halaman-utama')} className="inline-flex items-center gap-2 rounded-full border border-[#E8D6B8] bg-white px-4 py-2 text-sm font-extrabold text-[#704A36] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FFE082]/60">
              <House size={16} /> Halaman Utama
            </button>
          </div>
        </div>
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenTeacherLogin={() => setIsLoginModalOpen(true)}
        />
        </>
      )}

      {sessionDeletedNotice && (
        <div role="alert" className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            <span>
              Sesi kelompok ini telah dihapus oleh guru. Progres lama tidak dipulihkan. Masukkan ID Kelompok untuk memulai sesi baru.
            </span>
            <button
              type="button"
              onClick={dismissSessionDeletedNotice}
              className="shrink-0 font-bold underline cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className={`flex-1 ${currentView === 'misi' ? 'pb-0' : 'pb-16'}`}>
        {showRoleLanding ? (
          <RoleLandingView
            onStudent={() => beginRoleEntry('student')}
            onTeacher={() => beginRoleEntry('teacher')}
          />
        ) : (
          <>
        {currentView === 'beranda' && <HomeView onNavigate={handleNavigate} />}
        {currentView === 'belajar' && (
          <LearningJourneyView
            step={learningStep}
            maxStep={maxLearningStep}
            content={learningContent.published}
            trackName={currentTrack}
            onStepChange={(step) => {
              setLearningStep(step);
              setMaxLearningStep((maxStep) => Math.max(maxStep, step));
            }}
            onStart={() => {
              setLearningJourneyComplete(true);
              setHasOpenedPractice(true);
              setCurrentView('latihan');
              setMusicBlockedForPractice(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {currentView === 'kelas' && (
          <ClassAccessView
            preloadedCode={classCodeFromLink}
            onSuccess={() => { setCurrentView('identitas'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onBack={() => { setCurrentView(learningJourneyComplete ? 'latihan' : 'belajar'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}
        {currentView === 'pintu' && <TrackSelectionView onNavigate={handleNavigate} />}
        {currentView === 'identitas' && (
          <TeamIdentityView
            onNavigate={handleNavigate}
            validationAttempt={identityValidationAttempt}
          />
        )}
        {currentView === 'misi' && (
          <MissionsHubView
            onNavigate={handleNavigate}
            onSelectMission={handleSelectMission}
          />
        )}
        {currentView === 'countdown' && (
          <CountdownView missionNumber={activeMissionNumber} onNavigate={handleCountdownComplete} />
        )}
        {currentView === 'misi-detail' && (
          <MissionDetailView
            missionNumber={activeMissionNumber}
            onNavigate={navigateFromMissionDetail}
            onSelectMission={handleSelectMission}
          />
        )}
        {(currentView === 'latihan' || (hasOpenedPractice && currentView === 'belajar')) && (
          <div className={currentView === 'latihan' ? '' : 'hidden'}>
            <PracticeQuestionsView onNavigate={handleNavigate} />
          </div>
        )}
        {currentView === 'presentasi' && <PresentationView onNavigate={handleNavigate} />}
        {currentView === 'refleksi' && <ReflectionView
          onNavigate={handleNavigate}
          previewOpen={showAnswerPreview}
          onPreviewOpen={setShowAnswerPreview}
          onEditMission={editMissionFromPreview}
        />}

        {currentView === 'evaluasi' && <ResultsEvaluationView onNavigate={handleNavigate} />}
        {currentView === 'dashboard-guru' && (
          <TeacherDashboardView onNavigate={handleNavigate} />
        )}
          </>
        )}
      </main>

      {!showRoleLanding && !isTeacherLoggedIn && currentView !== 'misi' && ['identitas', 'pintu', 'misi', 'misi-detail', 'latihan', 'evaluasi'].includes(currentView) && (
        <div className="mx-auto mb-8 w-full max-w-6xl px-4 sm:px-6">
          <div className="learning-card flex items-center gap-4 overflow-hidden rounded-2xl border border-[#E8E9D1] bg-gradient-to-r from-[#F4F9E9] via-white to-[#FFF7DC] p-4 sm:p-5">
            <SchoolHeroIllustration className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1"><p className="text-sm font-black text-[#3E2723] sm:text-base">Tiko menyemangatimu!</p><p className="mt-1 text-xs leading-5 text-[#6D5A50]">Baca petunjuk dengan teliti, diskusikan strategi bersama anggota tim, dan jangan lupa memeriksa kembali jawabanmu.</p></div>
            <span className="hidden h-3 w-3 rounded-full bg-[#FF913D] shadow-sm sm:block" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Clean Educational Footer */}
      {currentView !== 'misi' && <footer className="border-t border-[#EAE3D9] bg-white py-8 text-xs text-[#6D5A50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#95634F] text-[#FFE082] flex items-center justify-center font-bold text-xs">
              KPK
            </div>
            <div>
              <span className="font-bold text-[#3E2723]">Ruang Misi KPK</span>
              <span className="text-[#8C7A70] ml-2">· Asesmen Formatif Matematika Kelas V SD/MI</span>
            </div>
          </div>

          <div className="text-center sm:text-right text-[#8C7A70]">
            <p>Web aplikasi ini dibuat oleh <strong className="text-[#6D5A50]">Mela Minkhatul Maula</strong></p>
            <p className="mt-1">Teaching at the Right Level (TaRL) · 4 Tahap Polya · 25 Menit Investigasi</p>
          </div>
        </div>
      </footer>}

      {/* Teacher Login Modal */}
      <TeacherLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setShowRoleLanding(false);
          setCurrentView('dashboard-guru');
        }}
      />

      {roleEntryLoading && (
        <LoadingIndicator
          label={roleEntryLoading === 'student' ? 'Menyiapkan ruang belajarmu...' : 'Menyiapkan ruang guru...'}
          overlay
        />
      )}

      {cloudStatus === 'connecting' && (
        (isTeacherLoggedIn && currentView === 'dashboard-guru') ||
        (hasVerifiedGroupToken && !isTeacherLoggedIn && ['identitas', 'pintu', 'misi', 'countdown', 'misi-detail', 'evaluasi'].includes(currentView))
      ) && <LoadingIndicator label={currentView === 'evaluasi' ? 'Memuat hasil siswa...' : 'Memvalidasi akses dan memuat halaman...'} overlay />}

    </div>
  );
}

export default function App() {
  return (
    <AssessmentProvider>
      <MainApp />
    </AssessmentProvider>
  );
}
