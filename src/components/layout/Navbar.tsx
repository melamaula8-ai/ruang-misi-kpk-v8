import React, { useState } from 'react';
import {
  ShieldCheck,
  Menu,
  X,
  Users,
  Compass,
  BookOpen,
  Presentation,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  Dumbbell,
  Timer,
  Cloud,
  CloudOff,
  LoaderCircle,
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenTeacherLogin: () => void;
}

export const Navbar: React.FC<Props> = ({ currentView, onNavigate, onOpenTeacherLogin }) => {
  const { isTeacherLoggedIn, activeSubmission, timerSeconds, customLogoUrl, activeGroupToken, cloudStatus } = useAssessment();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  const navLinks = isTeacherLoggedIn
    ? [
        { id: 'beranda', label: 'Beranda', icon: BookOpen },
        { id: 'latihan', label: 'Latihan Mandiri', icon: Dumbbell },
        { id: 'gabung-kelas', label: 'Gabung Kelas', icon: Users },
        { id: 'pintu', label: 'Pintu Misi', icon: Compass },
        { id: 'evaluasi', label: 'Hasil', icon: Award },
      ]
    : [
        { id: 'beranda', label: 'Beranda', icon: BookOpen },
        { id: 'latihan', label: 'Latihan Mandiri', icon: Dumbbell },
        { id: 'gabung-kelas', label: 'Gabung Kelas', icon: Users },
        { id: 'pintu', label: 'Pintu Misi', icon: Compass },
        { id: 'misi', label: '4 Kasus', icon: Sparkles },
        { id: 'evaluasi', label: 'Hasil', icon: Award },
      ];

  const handleLinkClick = (id: string) => {
    soundManager.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playClick();
    }
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeLow = timerSeconds < 300;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#EAE3D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand logo + wordmark */}
          <button
            onClick={() => handleLinkClick('beranda')}
            className="flex min-w-0 items-center gap-2 sm:gap-2.5 text-left cursor-pointer group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#EAE3D9] bg-white shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center">
              <img
                src={customLogoUrl || '/app_logo.jpg'}
                alt="Logo Ruang Misi KPK"
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-sm sm:text-lg font-extrabold tracking-tight text-[#3E2723] whitespace-nowrap leading-tight">
                Ruang Misi KPK
              </span>
              <span className="text-[10px] text-[#95634F] font-semibold tracking-wide hidden xs:inline">
                Matematika Kelas V SD
              </span>
            </div>
          </button>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold text-[#6D5A50]">
            {navLinks.map((link) => {
              const isActive =
                currentView === link.id ||
                (link.id === 'misi' && currentView.startsWith('misi-'));
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#95634F] font-bold'
                      : 'hover:text-[#3E2723]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF913D] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Shared database status + Sound Toggle + Teacher Portal */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-lg border ${cloudStatus === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : cloudStatus === 'offline' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}
              title={cloudStatus === 'online' ? 'Database bersama tersambung' : cloudStatus === 'connecting' ? 'Menghubungkan database bersama…' : 'Database bersama offline — perubahan mungkin belum tersinkron'}
              aria-label={cloudStatus === 'online' ? 'Database bersama tersambung' : cloudStatus === 'connecting' ? 'Menghubungkan database bersama' : 'Database bersama offline'}
            >
              {cloudStatus === 'online' ? <Cloud size={16} /> : cloudStatus === 'offline' ? <CloudOff size={16} /> : <LoaderCircle size={16} className="animate-spin" />}
            </div>
            {/* Kelas aktif; ID sesi kelompok dikelola otomatis oleh sistem. */}
            {activeGroupToken?.className && (
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#C5E68A]/25 border border-[#C5E68A] text-[#4A671E] text-xs font-bold shadow-2xs"
                title={`Kelas aktif: ${activeGroupToken.className}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{activeGroupToken.className}</span>
              </div>
            )}

            {/* Countdown Badge in Navbar when on mission */}
            {(currentView === 'misi' || currentView === 'misi-detail') && (
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${
                  isTimeLow
                    ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                    : 'bg-[#FAF8F5] border-[#E8DFD8] text-[#3E2723]'
                }`}
                title="Sisa Waktu Pengerjaan 25 Menit"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{formattedTimer}</span>
              </div>
            )}

            {/* Sound Mute/Unmute Button */}
            <button
              onClick={handleToggleSound}
              className="hidden sm:block p-2 rounded-lg text-[#6D5A50] hover:text-[#3E2723] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
              title={isMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
              aria-label={isMuted ? 'Nyalakan Efek Suara' : 'Bisukan Efek Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-400" /> : <Volume2 className="w-4 h-4 text-[#95634F]" />}
            </button>

            {isTeacherLoggedIn ? (
              <button
                onClick={() => handleLinkClick('dashboard-guru')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  currentView === 'dashboard-guru'
                    ? 'bg-[#3E2723] text-white'
                    : 'bg-[#95634F] hover:bg-[#3E2723] text-white shadow-xs'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#FFE082]" />
                <span className="hidden sm:inline">Dashboard Guru</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenTeacherLogin();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#3E2723] bg-[#FAF8F5] hover:bg-[#EAE3D9] border border-[#E8DFD8] rounded-lg whitespace-nowrap transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#95634F]" />
                <span className="hidden sm:inline">Masuk Guru</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                soundManager.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="xl:hidden p-2 rounded-lg text-[#6D5A50] hover:text-[#3E2723] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Buka menu navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-[#EAE3D9] px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              currentView === link.id ||
              (link.id === 'misi' && currentView.startsWith('misi-'));
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#FAF8F5] text-[#95634F] font-bold border-l-4 border-[#FF913D]'
                    : 'text-[#6D5A50] hover:bg-neutral-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}
          {activeSubmission.team.teamName && (
            <div className="pt-2 text-xs text-[#8C7A70] px-3 border-t border-[#EAE3D9]">
              Kelompok aktif: <span className="font-bold text-[#3E2723]">{activeSubmission.team.teamName}</span>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
