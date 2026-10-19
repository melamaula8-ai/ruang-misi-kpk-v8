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
  const { currentTrack, setCurrentTrack, trackLockConfig, learningContent, allSubmissions, activeSubmission } = useAssessment();
  const activeTokenCode = activeSubmission.groupCode || '';
  const lockedTrack = trackLockConfig.lockedTrack || 'penjelajah';
  const completedStatuses = ['submitted_pending_review', 'time_expired_pending_review', 'reviewed', 'results_published'];
  const lockedTrackCompleted = allSubmissions.some((submission) =>
    submission.track === lockedTrack &&
    (activeTokenCode
      ? submission.groupCode?.toUpperCase() === activeTokenCode.toUpperCase()
      : submission.id === activeSubmission.id) &&
    completedStatuses.includes(submission.status)
  );
  const trackIsRestricted = (track: LearningTrack) =>
    trackLockConfig.isLocked && track !== lockedTrack && !lockedTrackCompleted;
  const getTrackSubmission = (track: LearningTrack) => allSubmissions.find((submission) =>
    (activeTokenCode
      ? submission.groupCode?.toUpperCase() === activeTokenCode.toUpperCase()
      : submission.id === activeSubmission.id) && submission.track === track
  );

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
          {learningContent.published.instructions}
        </p>

        {trackLockConfig.isLocked && !lockedTrackCompleted && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFE082]/40 border border-[#FFE082] text-xs font-bold text-[#6F4736]">
            <Lock className="w-3.5 h-3.5" />
            <span>Selesaikan dan kirim pintu {learningContent.published.tracks[lockedTrack].name} terlebih dahulu. Setelah itu, pintu lainnya dapat dipilih.</span>
          </div>
        )}
        {lockedTrackCompleted && (
          <p className="text-xs font-bold text-[#4A671E]">Pintu {learningContent.published.tracks[lockedTrack].name} sudah dikirim. Kelompok kini dapat melanjutkan pintu lain.</p>
        )}
      </div>

      {/* 3 Tracks Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {tracks.map((t) => {
          const isSelected = currentTrack === t.id;
          const isRestricted = trackIsRestricted(t.id);
          const trackSubmission = getTrackSubmission(t.id);
          const isCompleted = Boolean(trackSubmission && completedStatuses.includes(trackSubmission.status));
          const Illustration = t.Illustration;
          const learningTrack = learningContent.published.tracks[t.id];

          return (
            <div
              key={t.id}
              onClick={() => handleSelectTrack(t.id)}
              className={`bg-white rounded-2xl border-2 p-6 flex flex-col justify-between transition-all cursor-pointer relative shadow-xs hover:shadow-md ${
                isSelected
                  ? `${t.accentColor} ring-2 ring-[#FF913D] shadow-md`
                  : 'border-[#EAE3D9] hover:border-[#D8CFC8]'
              } ${isRestricted && !isSelected ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF913D] text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Pintu Terpilih</span>
                </div>
              )}
              {isCompleted && (
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#C5E68A] bg-[#F4F9E9] px-2.5 py-1 text-[10px] font-extrabold text-[#4A671E]">
                  <Check className="h-3 w-3" /> Sudah dikirim
                </div>
              )}

              <div className="space-y-4">
                {/* Visual Icon Illustration */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase ${t.badgeBg} ${t.badgeText}`}>
                    Pintu {learningTrack.name}
                  </span>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Illustration className="w-14 h-14" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[#3E2723]">{learningTrack.name}</h3>
                  <span className="mt-1 inline-flex rounded-full bg-[#FFF7DC] px-2.5 py-1 text-xs font-black text-[#8C6D1F]">Tingkat: {learningTrack.difficulty}</span>
                  <p className="text-xs font-semibold text-[#95634F] italic mt-0.5">
                    “{t.tagline}”
                  </p>
                </div>

                <p className="text-xs text-[#5D4E46] leading-relaxed">
                    {learningTrack.material}
                </p>

                <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-[#3E2723] block text-[11px] uppercase">
                    Bentuk Bantuan:
                  </span>
                  <p className="text-[#6D5A50] text-[11px] leading-relaxed">
                    {learningTrack.activity} · {learningTrack.cases}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-[#EAE3D9]">
                <button
                  type="button"
                  disabled={isRestricted && !isSelected}
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
                      <span>{isCompleted ? 'Lihat Pintu Ini' : 'Aktif di Pintu Ini'}</span>
                    </>
                  ) : (
                    <span>Pilih Pintu {learningTrack.name}</span>
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
          Progres setiap pintu disimpan terpisah. Kelompok dapat kembali ke sini untuk melanjutkan pintu lainnya.
        </div>
        <button
          onClick={() => onNavigate('misi')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <span>Masuk ke Peta Misi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
