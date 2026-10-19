import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Printer,
  Maximize2,
  Minimize2,
  Users,
  Sparkles,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { PresentationIllustration } from '../illustrations/Illustrations';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';

interface Props {
  onNavigate: (view: string) => void;
}

export const PresentationView: React.FC<Props> = ({ onNavigate }) => {
  const {
    activeSubmission,
    questions,
    currentTrack,
    updatePresentation,
    updateReflection,
  } = useAssessment();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [speakerNote, setSpeakerNote] = useState(
    activeSubmission.presentation.groupConclusion ||
      'Halo teman-teman dan Ibu/Bapak Guru, kami dari kelompok siap memaparkan hasil penyelidikan KPK...'
  );

  const [reflectionInputs, setReflectionInputs] = useState({
    lcmLearning: activeSubmission.reflection?.lcmLearning || '',
    challengingMission: activeSubmission.reflection?.challengingMission || '',
    easyPart: activeSubmission.reflection?.easyPart || '',
    confusingPart: activeSubmission.reflection?.confusingPart || '',
  });

  const handleReflectionChange = (
    key: 'lcmLearning' | 'challengingMission' | 'easyPart' | 'confusingPart',
    value: string
  ) => {
    setReflectionInputs((prev) => ({ ...prev, [key]: value }));
    updateReflection({ [key]: value, completed: true });
  };

  const team = activeSubmission.team;
  const currentQuestions = questions.filter((q) => q.track === currentTrack);

  // Get answers per mission
  const getMissionAns = (num: number) => {
    const q = currentQuestions.find((item) => item.missionNumber === num);
    if (!q) return null;
    const ans = activeSubmission.answers[q.id];
    return {
      q,
      ans,
      step1: ans?.step1 || {},
      step2: ans?.step2 || {},
      step3: ans?.step3 || {},
      step4: ans?.step4 || {},
    };
  };

  const m1 = getMissionAns(1);
  const m2 = getMissionAns(2);
  const m3 = getMissionAns(3);
  const m4 = getMissionAns(4);

  // Slide definitions
  const slides = [
    // Slide 1: Cover / Tim
    {
      title: 'Bahan Presentasi: Penyelidikan KPK di Sekolah',
      subtitle: 'Pemaparan Hasil Diskusi & Pemecahan Masalah Matematika',
      badge: `Pintu Belajar: ${currentTrack.toUpperCase()}`,
      content: (
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="p-6 bg-[#FAF8F5] border-2 border-[#EAE3D9] rounded-2xl space-y-2">
            <h2 className="text-3xl font-extrabold text-[#3E2723]">
              {team.teamName || 'Kelompok Belajar Kelas V'}
            </h2>
            <p className="text-sm font-semibold text-[#95634F]">
              {team.schoolName || 'SD/MI'} · Asesmen Formatif Matematika
            </p>
          </div>

          <div className="space-y-2 text-left bg-white p-5 rounded-2xl border border-[#EAE3D9]">
            <span className="text-xs font-bold text-[#8C7A70] uppercase block">
              Susunan Anggota & Peran Tim:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {team.members.filter((m) => m.name).length > 0 ? (
                team.members
                  .filter((m) => m.name)
                  .map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5]">
                      <span className="font-bold text-[#3E2723]">{m.name}</span>
                      <span className="text-[#8C7A70] italic">({m.role})</span>
                    </div>
                  ))
              ) : (
                <div className="text-[#8C7A70] italic col-span-2">
                  Nama anggota dapat dilengkapi pada Identitas Tim.
                </div>
              )}
            </div>
          </div>

          {team.agreement && (
            <div className="p-3.5 bg-[#FFE082]/30 rounded-xl border border-[#FFE082] text-xs text-[#6F4736] italic">
              “{team.agreement}”
            </div>
          )}
        </div>
      ),
    },

    // Slide 2: Kasus 1 (Piket)
    {
      title: 'Kasus 1: Jadwal Piket Menyiram Tanaman',
      subtitle: m1?.q.title || 'Misi Piket',
      badge: 'Kasus 1 dari 4',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D9] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#95634F]">Masalah yang Dihadapi:</span>
              <p className="text-xs text-[#3E2723] leading-relaxed">
                {m1?.q.story}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#8C7A70] block">Strategi Kelompok:</span>
              <p className="text-[#3E2723] bg-white p-2.5 rounded-xl border border-[#E8DFD8]">
                {m1?.step2?.strategy_plan || '(Belum diisi oleh kelompok)'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#C5E68A] space-y-4 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase text-[#4A671E] block">
              Temuan Solusi Kelompok Kami:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5]">
                <span className="font-semibold text-[#6D5A50]">Kelipatan Bilangan:</span>
                <span className="font-mono font-bold text-[#3E2723]">
                  {m1?.step3?.multiples_num1 || '-'} & {m1?.step3?.multiples_num2 || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5]">
                <span className="font-semibold text-[#6D5A50]">Nilai KPK yang Ditemukan:</span>
                <span className="font-mono text-base font-extrabold text-[#FF913D]">
                  {m1?.step3?.lcm_value || m1?.step3?.days_interval ? `${m1?.step3?.lcm_value || m1?.step3?.days_interval} hari` : '(Belum diisi)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#C5E68A]/30 border border-[#C5E68A]">
                <span className="font-bold text-[#2D231E]">Jadwal Bersama Berikutnya:</span>
                <span className="text-sm font-extrabold text-[#2D231E]">
                  {m1?.step3?.final_date || '(Belum diisi)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Kasus 2 (Lampu Sinyal)
    {
      title: 'Kasus 2: Simulasi Lampu Sinyal Persimpangan',
      subtitle: m2?.q.title || 'Misi Lampu Lalu Lintas',
      badge: 'Kasus 2 dari 4',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D9] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#95634F]">Masalah yang Dihadapi:</span>
              <p className="text-xs text-[#3E2723] leading-relaxed">
                {m2?.q.story}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#8C7A70] block">Rencana Penyelesaian:</span>
              <p className="text-[#3E2723] bg-white p-2.5 rounded-xl border border-[#E8DFD8]">
                {m2?.step2?.strategy_plan || m2?.step2?.strategy_choice || '(Belum diisi oleh kelompok)'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#FFE082] space-y-4 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase text-[#8C6D1F] block">
              Temuan Solusi Kelompok Kami:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5]">
                <span className="font-semibold text-[#6D5A50]">KPK Waktu Sinyal:</span>
                <span className="font-mono text-base font-extrabold text-[#FF913D]">
                  {m2?.step3?.lcm_value ? `${m2.step3.lcm_value} detik` : '(Belum diisi)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FFE082]/40 border border-[#FFE082]">
                <span className="font-bold text-[#3E2723]">Kedua Lampu Menyala Bersama:</span>
                <span className="text-sm font-extrabold text-[#3E2723]">
                  {m2?.step3?.final_answer || '(Belum diisi)'}
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-[#6D5A50]">
                <strong>Alasan Menggunakan KPK:</strong> {m2?.step4?.explain_why_lcm || '(Belum diisi oleh kelompok)'}
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Kasus 3 (Olahraga)
    {
      title: 'Kasus 3: Jadwal Latihan Olahraga',
      subtitle: m3?.q.title || 'Misi Jadwal Olahraga',
      badge: 'Kasus 3 dari 4',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D9] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#95634F]">Masalah yang Dihadapi:</span>
              <p className="text-xs text-[#3E2723] leading-relaxed">
                {m3?.q.story}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#8C7A70] block">Langkah Penyelidikan:</span>
              <p className="text-[#3E2723] bg-white p-2.5 rounded-xl border border-[#E8DFD8]">
                {m3?.step2?.strategy_plan || '(Belum diisi oleh kelompok)'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#FF913D] space-y-4 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase text-[#FF913D] block">
              Temuan Solusi Kelompok Kami:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5]">
                <span className="font-semibold text-[#6D5A50]">KPK Hari Olahraga:</span>
                <span className="font-mono text-base font-extrabold text-[#FF913D]">
                  {m3?.step3?.lcm_value || m3?.step3?.days_interval ? `${m3?.step3?.lcm_value || m3?.step3?.days_interval} hari` : '(Belum diisi)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FF913D]/20 border border-[#FF913D]/40">
                <span className="font-bold text-[#3E2723]">Tanggal Latihan Bersama:</span>
                <span className="text-sm font-extrabold text-[#3E2723]">
                  {m3?.step3?.final_date || '(Belum diisi)'}
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-[#6D5A50]">
                <strong>Cara Memeriksa Kembali:</strong> {m3?.step4?.check_calendar || '(Belum diisi oleh kelompok)'}
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 5: Kasus 4 (Agenda Sekolah)
    {
      title: 'Kasus 4: Agenda Sekolah & Penelusuran Tanggal',
      subtitle: m4?.q.title || 'Misi Agenda Sekolah',
      badge: 'Kasus 4 dari 4',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D9] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#95634F]">Masalah yang Dihadapi:</span>
              <p className="text-xs text-[#3E2723] leading-relaxed">
                {m4?.q.story}
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <span className="font-bold text-[#8C7A70] block">Strategi Kalender Multi-Bulan:</span>
              <p className="text-[#3E2723] bg-white p-2.5 rounded-xl border border-[#E8DFD8]">
                {m4?.step2?.strategy_plan || '(Belum diisi oleh kelompok)'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#95634F] space-y-4 flex flex-col justify-center">
            <span className="text-xs font-extrabold uppercase text-[#95634F] block">
              Temuan Solusi Kelompok Kami:
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#FAF8F5]">
                <span className="font-semibold text-[#6D5A50]">KPK Hari Agenda:</span>
                <span className="font-mono text-base font-extrabold text-[#FF913D]">
                  {m4?.step3?.lcm_value || m4?.step3?.days_interval ? `${m4?.step3?.lcm_value || m4?.step3?.days_interval} hari` : '(Belum diisi)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#95634F]/20 border border-[#95634F]/40">
                <span className="font-bold text-[#3E2723]">Kegiatan Bersama Berikutnya:</span>
                <span className="text-sm font-extrabold text-[#3E2723]">
                  {m4?.step3?.final_date || '(Belum diisi)'}
                </span>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-[#6D5A50]">
                <strong>Hasil Pengujian:</strong> {m4?.step4?.check_calendar || '(Belum diisi oleh kelompok)'}
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 6: Kesimpulan Presentasi & Refleksi Kelompok
    {
      title: 'Kesimpulan & Refleksi Pembelajaran Kelompok',
      subtitle: 'Pesan Utama tentang Cara Kerja KPK',
      badge: 'Penutup Presentasi',
      content: (
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <div className="p-4 bg-white border-2 border-[#C5E68A] rounded-2xl text-center space-y-2">
            <Sparkles className="w-6 h-6 text-[#FF913D] mx-auto" />
            <h3 className="text-lg font-bold text-[#3E2723]">
              “KPK Membantu Menemukan Titik Temu dari Pola yang Berulang”
            </h3>
            <p className="text-xs text-[#5D4E46] leading-relaxed">
              Dari jadwal piket, sinyal lampu, latihan olahraga, hingga agenda sekolah, Kelipatan Persekutuan Terkecil memungkinkan kita memprediksi waktu kejadian bersama secara tepat.
            </p>
          </div>

          {/* Interactive Reflection Columns right on Slide 6 */}
          <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#EAE3D9] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-[#EAE3D9] pb-2">
              <span className="font-extrabold text-[#3E2723] text-xs uppercase tracking-wide">
                Kolom Refleksi Pembelajaran Tim:
              </span>
              <span className="text-[10px] font-bold text-[#4A671E] bg-[#C5E68A]/40 px-2 py-0.5 rounded border border-[#C5E68A]">
                Dapat Diketik & Diedit Langsung
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3E2723] block">
                1. Pelajaran Bermakna tentang Cara Kerja KPK:
              </label>
              <textarea
                autoComplete="off"
                rows={6}
                value={reflectionInputs.lcmLearning}
                onChange={(e) => handleReflectionChange('lcmLearning', e.target.value)}
                placeholder="Tuliskan pemahaman baru kelompokmu tentang bagaimana kelipatan persekutuan terkecil bekerja..."
                className="box-border h-40 min-h-[140px] max-h-[180px] w-full min-w-0 resize-y px-4 py-3 bg-white border border-[#D8CFC8] focus:border-[#FF913D] rounded-xl text-sm lg:text-base text-[#2D231E] placeholder:text-[#A8988F] focus:outline-none focus:ring-2 focus:ring-[#FF913D]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3E2723] block">
                2. Tantangan Terbesar & Solusi Tim:
              </label>
              <textarea
                autoComplete="off"
                rows={6}
                value={reflectionInputs.challengingMission}
                onChange={(e) => handleReflectionChange('challengingMission', e.target.value)}
                placeholder="Ceritakan tantangan perhitungan atau kalender dan cara tim menyelesaikannya..."
                className="box-border h-40 min-h-[140px] max-h-[180px] w-full min-w-0 resize-y px-4 py-3 bg-white border border-[#D8CFC8] focus:border-[#FF913D] rounded-xl text-sm lg:text-base text-[#2D231E] placeholder:text-[#A8988F] focus:outline-none focus:ring-2 focus:ring-[#FF913D]/30"
              />
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[11px] text-[#8C7A70]">
                Tersimpan otomatis ke dalam data asesmen kelompok.
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('refleksi');
                }}
                className="text-xs font-bold text-[#95634F] hover:text-[#3E2723] underline cursor-pointer"
              >
                Buka Jurnal Refleksi Lengkap (4 Pertanyaan) &rarr;
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[currentSlideIndex];

  const handleNextSlide = () => {
    soundManager.playNextStep();
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    soundManager.playClick();
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-[#FAF8F5] p-6 max-w-none overflow-y-auto' : ''}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
            Presentasi Hasil Pemecahan Masalah
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Bahan Presentasi Kelompok
          </h1>
          <p className="text-xs sm:text-sm text-[#6D5A50] mt-1">
            Slide interaktif otomatis dirangkum dari hasil penyelidikan 4 kasus kelompokmu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#95634F]" />
            <span>Cetak Slide</span>
          </button>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="bg-white border-2 border-[#EAE3D9] rounded-3xl p-6 sm:p-10 shadow-md min-h-[440px] flex flex-col justify-between space-y-6">
        {/* Slide Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE3D9] pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FFE082]/40 text-[#6F4736] border border-[#FFE082]">
              {currentSlide.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E2723]">
              {currentSlide.title}
            </h2>
            <p className="text-xs text-[#6D5A50]">{currentSlide.subtitle}</p>
          </div>

          <div className="font-mono text-xs font-bold text-[#8C7A70] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EAE3D9]">
            Slide {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 flex flex-col justify-center py-4">
          {currentSlide.content}
        </div>

        {/* Slide Bottom Controls */}
        <div className="pt-4 border-t border-[#EAE3D9] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EAE3D9] disabled:opacity-40 text-[#3E2723] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Slide Sebelumnya</span>
          </button>

          {/* Slide Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playClick();
                  setCurrentSlideIndex(idx);
                }}
                className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx
                    ? 'bg-[#FF913D] w-6'
                    : 'bg-[#EAE3D9] hover:bg-[#D8CFC8]'
                }`}
                aria-label={`Buka slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span>Slide Berikutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Speaker Notes Box (Catatan Presenter untuk berbicara di depan kelas) */}
      <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3E2723]">
          <MessageSquare className="w-4 h-4 text-[#95634F]" />
          <span>Catatan Pembicara (Panduan Berbicara di Depan Kelas):</span>
        </div>
        <textarea
          autoComplete="off"
          rows={6}
          value={speakerNote}
          onChange={(e) => {
            setSpeakerNote(e.target.value);
            updatePresentation({ groupConclusion: e.target.value });
          }}
          placeholder="Tuliskan kata pembuka atau catatan yang ingin dibacakan penyaji hasil..."
          className="box-border h-40 min-h-[140px] max-h-[180px] w-full min-w-0 resize-y px-4 py-3 bg-white border border-[#D8CFC8] rounded-xl text-sm lg:text-base text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
        />
      </div>

      {/* Navigation to Reflection */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('misi');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dasbor Kasus</span>
        </button>

        <button
          onClick={() => {
            soundManager.playNextStep();
            onNavigate('refleksi');
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Lanjut ke Tahap Refleksi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
