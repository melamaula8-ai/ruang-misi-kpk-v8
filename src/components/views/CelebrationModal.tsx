import React, { useEffect } from 'react';
import { Award, ArrowRight, Heart, Users, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  teamName: string;
  onProceedToPresentation: () => void;
  onClose: () => void;
}

export const CelebrationModal: React.FC<Props> = ({
  isOpen,
  teamName,
  onProceedToPresentation,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playSuccessFanfare();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border-2 border-[#C5E68A] relative animate-in fade-in zoom-in-95 duration-300 text-center">
        {/* Celebration Trophy / Ribbon Badge */}
        <div className="relative mx-auto w-20 h-20 bg-[#FFE082]/30 rounded-full flex items-center justify-center border-4 border-[#FFE082] shadow-md">
          <Award className="w-10 h-10 text-[#FF913D]" />
          <div className="absolute -top-1 -right-1 bg-[#C5E68A] text-[#2D231E] rounded-full p-1.5 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#2D231E]" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5E68A]/40 text-[#3E521B] font-extrabold text-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>Apresiasi Keberhasilan Penyelidikan!</span>
          </span>

          <h2 className="text-2xl font-extrabold text-[#3E2723]">
            Luar Biasa, {teamName || 'Tim Hebat'}!
          </h2>

          <p className="text-sm font-semibold text-[#95634F]">
            Kalian telah berhasil menyelesaikan seluruh 4 Kasus Investigasi KPK!
          </p>
        </div>

        {/* Constructive feedback statement */}
        <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-4 text-xs text-[#5D4E46] leading-relaxed text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-[#3E2723]">
            <Users className="w-4 h-4 text-[#95634F]" />
            <span>Catatan Apresiasi untuk Seluruh Anggota:</span>
          </div>
          <p>
            Kalian telah membuktikan bahwa matematika adalah tentang menemukan pola dan bekerja sama. Melalui 4 tahap Polya, kelompokmu tekun memahami masalah, merencanakan strategi kelipatan, dan teliti memeriksa hasil penambahan kalender dan detik.
          </p>
          <p className="font-semibold text-[#4A671E]">
            Kerja keras, diskusi yang hidup, dan ketelitian kalian hari ini sungguh patut dibanggakan! Sekarang, saatnya membagikan temuan hebat ini kepada teman-teman sekelas.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#FAF8F5] hover:bg-neutral-100 text-[#6D5A50] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Lihat Dasbor Kasus
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playNextStep();
              onProceedToPresentation();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Lihat Hasil Kelompok</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
