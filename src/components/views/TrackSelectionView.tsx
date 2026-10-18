import React from 'react';
import { ArrowRight, Check, Lock, Calculator } from 'lucide-react';
import { LearningTrack } from '../../types';
import {
  PenjelajahIllustration,
  PengembangIllustration,
  InovatorIllustration,
} from '../illustrations/Illustrations';
import { useAssessment } from '../../context/AssessmentContext';

interface Props {
  onNavigate: (view: string) => void;
}

export const TrackSelectionView: React.FC<Props> = ({ onNavigate }) => {
  const { currentTrack, setCurrentTrack, trackLockConfig } = useAssessment();

  const tracks: Array<{
    id: LearningTrack;
    title: string;
    tagline: string;
    description: string;
    supportStyle: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
    Illustration: React.FC<{ className?: string }>;
  }> = [
    {
      id: 'penjelajah',
      title: 'Penjelajah',
      tagline: 'Temukan pola dengan bantuan langkah demi langkah.',
      description:
        'Belajar dengan bimbingan terarah, pola bilangan bertahap, dan petunjuk terstruktur untuk menemukan Kelipatan Persekutuan Terkecil.',
      supportStyle: 'Isian terarah, deret bilangan berjarak terpandu, dan petunjuk didaktis terperinci.',
      accentColor: 'border-[#C5E68A]',
      badgeBg: 'bg-[#C5E68A]/30',
      badgeText: 'text-[#4A671E]',
      Illustration: PenjelajahIllustration,
    },
    {
      id: 'pengembang',
      title: 'Pengembang',
      tagline: 'Susun kelipatan dan temukan KPK dengan strategimu sendiri.',
      description:
        'Mengembangkan strategi penyelesaian, menyusun kelipatan mandiri, dan menggunakan pertanyaan reflektif untuk memecahkan masalah.',
      supportStyle: 'Penulisan kelipatan mandiri, eksplorasi strategi kelompok, dan pengujian solusi.',
      accentColor: 'border-[#FFE082]',
      badgeBg: 'bg-[#FFE082]/40',
      badgeText: 'text-[#8C6D1F]',
      Illustration: PengembangIllustration,
    },
    {
      id: 'inovator',
      title: 'Inovator',
      tagline: 'Pilih strategi, buktikan hasil, dan jelaskan alasanmu.',
      description:
        'Bekerja mandiri penuh, merumuskan alasan matematis, membuktikan minimalitas KPK, dan mengevaluasi efektivitas metode.',
      supportStyle: 'Pembuktian matematis, analisis rasionalitas strategi, dan penjelasan logis menyeluruh.',
      accentColor: 'border-[#95634F]',
      badgeBg: 'bg-[#95634F]/20',
      badgeText: 'text-[#6F4736]',
      Illustration: InovatorIllustration,
    },
  ];

  const handleSelectTrack = (trackId: LearningTrack) => {
    if (trackLockConfig.isLocked) return;
    setCurrentTrack(trackId);
  };

  return (
    <div className="adventure-page max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <section className="track-selection-hero relative overflow-hidden rounded-[2rem] border-2 border-white bg-gradient-to-r from-[#EAF6D8] via-white to-[#FFF0D2] p-5 shadow-lg sm:p-7"><span className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#4A671E] shadow-sm">PILIH JALUR BELAJAR</span><h2 className="mt-3 text-2xl font-black text-[#3E2723] sm:text-3xl">Pilih pintu petualanganmu!</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D5A50]">Setiap jalur punya tantangan yang sesuai. Pilih dengan percaya diri—kamu bisa berkembang selangkah demi selangkah.</p></section>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
          Teaching at the Right Level (TaRL)
        </span>
        <h1 className="text-3xl font-extrabold text-[#3E2723] tracking-tight">
          Pilih Pintu Misi Belajarmu
        </h1>
        <p className="text-sm text-[#5D4E46] leading-relaxed">
          Semua pintu mempelajari materi KPK yang sama pada 4 situasi sekolah nyata. Pilih pintu petualangan yang paling mendukung caramu belajar hari ini!
        </p>

        {trackLockConfig.isLocked && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE082]/40 border border-[#FFE082] text-xs font-bold text-[#6F4736]">
            <Lock className="w-3.5 h-3.5" />
            <span>Pintu belajar saat ini ditetapkan oleh guru untuk kelompokmu.</span>
          </div>
        )}
      </div>

      {/* 3 Tracks Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tracks.map((t) => {
          const isSelected = currentTrack === t.id;
          const Illustration = t.Illustration;

          return (
            <div
              key={t.id}
              onClick={() => handleSelectTrack(t.id)}
              className={`bg-white rounded-2xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                isSelected
                  ? `${t.accentColor} ring-2 ring-[#FF913D] shadow-md`
                  : 'border-[#EAE3D9] hover:border-[#D8CFC8]'
              } ${trackLockConfig.isLocked && !isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF913D] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Pintu Terpilih</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Visual Icon Illustration */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase ${t.badgeBg} ${t.badgeText}`}>
                    Pintu {t.title}
                  </span>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Illustration className="w-14 h-14" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#3E2723]">{t.title}</h3>
                  <p className="text-xs font-semibold text-[#95634F] italic mt-0.5">
                    “{t.tagline}”
                  </p>
                </div>

                <p className="text-xs text-[#5D4E46] leading-relaxed">
                  {t.description}
                </p>

                <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px] uppercase">
                    Bentuk Bantuan:
                  </span>
                  <p className="text-[#6D5A50] text-[11px] leading-relaxed">
                    {t.supportStyle}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-[#EAE3D9]">
                <button
                  type="button"
                  disabled={trackLockConfig.isLocked && !isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTrack(t.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-[#FF913D] hover:bg-[#F2822B] text-white shadow-xs'
                      : 'bg-[#FAF8F5] hover:bg-[#EAE3D9] text-[#3E2723] border border-[#E8DFD8]'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Aktif di Pintu Ini</span>
                    </>
                  ) : (
                    <span>Pilih Pintu {t.title}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#EAE3D9] rounded-xl p-5">
        <div className="text-xs text-[#6D5A50]">
          Setelah memilih pintu, lanjutkan dengan melengkapi identitas kelompok dan pembagian peran anggota tim.
        </div>
        <button
          onClick={() => onNavigate('identitas')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Lanjut ke Identitas Tim</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
