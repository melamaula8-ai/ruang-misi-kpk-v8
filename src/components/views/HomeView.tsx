import React from 'react';
import { ArrowRight, Compass, CheckCircle2, Lightbulb, Calendar, Target, Calculator, BookOpen } from 'lucide-react';
import { SchoolHeroIllustration } from '../illustrations/Illustrations';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';

interface Props {
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => {
  const { currentTrack, activeSubmission, customLogoUrl, learningContent } = useAssessment();

  const polyaSteps = [
    {
      step: '1',
      title: 'Memahami Masalah',
      desc: 'Membaca teliti dan mencatat hal-hal yang diketahui, ditanyakan, serta waktu awal kejadian.',
      color: 'bg-[#C5E68A]',
    },
    {
      step: '2',
      title: 'Menyusun Rencana',
      desc: 'Memilih strategi yang tepat, seperti mendaftar kelipatan atau mencari pola perulangan bersama.',
      color: 'bg-[#FFE082]',
    },
    {
      step: '3',
      title: 'Melaksanakan Rencana',
      desc: 'Melakukan perhitungan kelipatan, menentukan KPK terkecil, dan menghitung waktu kejadian berikutnya.',
      color: 'bg-[#FF913D]',
    },
    {
      step: '4',
      title: 'Memeriksa Kembali',
      desc: 'Menguji apakah KPK habis dibagi kedua bilangan dan memastikan tidak ada kelipatan positif yang lebih kecil.',
      color: 'bg-[#95634F]',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-5 sm:space-y-12 sm:px-6 sm:py-8">
      {/* Hero Section */}
      <section className="relative min-w-0 overflow-hidden rounded-2xl border border-[#EAE3D9] bg-white p-4 shadow-xs sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Logo Ruang Misi KPK" className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-2xl border-2 border-[#FFE082] shadow-sm bg-white p-1 shrink-0" />
              ) : (
                <div aria-label="Logo Ruang Misi KPK" className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-[#FFE082] bg-[#3E2723] text-base sm:text-lg font-black tracking-tight text-[#FFE082] shadow-sm">KPK</div>
              )}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFE082]/40 border border-[#FFE082] text-xs font-bold text-[#6F4736]">
                <Calculator className="w-4 h-4 text-[#4A671E]" />
                <span>Asesmen Formatif Matematika Kelas V SD/MI</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3E2723] tracking-tight leading-tight">
              Selamat Datang di <br />
              <span className="text-[#FF913D]">Ruang Misi KPK</span>
            </h1>

            <p className="text-lg italic font-semibold text-[#95634F]">
              “Temukan Polanya, Pecahkan Masalahnya.”
            </p>

            <p className="text-base text-[#5D4E46] leading-relaxed">
              Hari ini kamu akan membantu menyelesaikan masalah jadwal kegiatan di sekolah. Temukan pola, gunakan Kelipatan Persekutuan Terkecil (KPK), dan buktikan jawabanmu bersama kelompokmu.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  soundManager.playNextStep();
                  onNavigate('latihan');
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#FF913D] hover:bg-[#F2822B] text-white font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer text-base"
              >
                <span>Mulai dari Latihan</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  document.getElementById('konsep-kpk')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-2 px-5 py-3.5 bg-[#C5E68A]/40 hover:bg-[#C5E68A]/60 text-[#2D231E] border border-[#A8D468] font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                <Calculator className="w-4 h-4 text-[#4A671E]" />
                <span>Lihat Contoh KPK</span>
              </button>

            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-4 flex items-center justify-center">
              <SchoolHeroIllustration className="w-full h-auto drop-shadow-xs" />
            </div>
          </div>
        </div>
      </section>

      {/* Tujuan Pembelajaran: langkah belajar sebelum latihan dan akses kelas */}
      <section className="learning-card relative overflow-hidden rounded-[1.75rem] border border-[#DCE9C6] bg-gradient-to-r from-[#F4F9E9] via-white to-[#FFF7DC] p-6 sm:p-8">
        <div className="absolute -right-5 -top-7 h-28 w-28 rounded-full bg-[#C5E68A]/35 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#DCE9C6]"><BookOpen className="h-8 w-8 text-[#5A7A27]" /></div>
          <div className="flex-1">
            <span className="text-xs font-black uppercase tracking-[.16em] text-[#5A7A27]">Peta Belajar Hari Ini</span>
            <h2 className="mt-1 text-2xl font-black text-[#3E2723]">Tujuan pembelajaran</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5D4E46]">{learningContent.published.objective}</p>
            <p className="mt-3 max-w-3xl rounded-xl bg-white/80 px-4 py-3 text-sm leading-6 text-[#6D5A50]"><strong>Siapkan alat belajar:</strong> {learningContent.published.materials}<br/><strong>Petunjuk awal:</strong> {learningContent.published.hints}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-[#DCE9C6] bg-white px-3 py-1.5 text-xs font-bold text-[#4A671E]">Pahami</span>
            <span className="rounded-full border border-[#F4DFA1] bg-white px-3 py-1.5 text-xs font-bold text-[#8C6B1C]">Rencanakan</span>
            <span className="rounded-full border border-[#F6C69E] bg-white px-3 py-1.5 text-xs font-bold text-[#A9551B]">Buktikan</span>
          </div>
        </div>
      </section>

      {/* Konsep KPK dalam Kehidupan Nyata */}
      <section id="konsep-kpk" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3E2723]">
              Mengapa Kita Menggunakan KPK?
            </h2>
            <p className="text-sm text-[#6D5A50]">
              KPK digunakan untuk mencari kapan dua atau lebih peristiwa berulang akan terjadi pada saat yang sama.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#EAE3D9] rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5E68A]/30 flex items-center justify-center text-[#4A671E]">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3E2723]">Jadwal Ronda Desa</h3>
            <p className="text-xs text-[#6D5A50] leading-relaxed">
              Pak Budi ronda tiap 3 hari sekali dan Pak Joko tiap 4 hari sekali. KPK dari 3 dan 4 adalah 12, artinya mereka akan ronda bersama lagi setiap 12 hari sekali!
            </p>
          </div>

          <div className="bg-white border border-[#EAE3D9] rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFE082]/40 flex items-center justify-center text-[#8C6D1F]">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3E2723]">Lonceng Jam Sekolah</h3>
            <p className="text-xs text-[#6D5A50] leading-relaxed">
              Lonceng kelas bawah berdentang tiap 15 menit, dan lonceng kelas atas tiap 20 menit. KPK dari 15 dan 20 adalah 60 menit (1 jam). Mereka berdentang serempak tiap 1 jam sekali.
            </p>
          </div>

          <div className="bg-white border border-[#EAE3D9] rounded-xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#FF913D]/20 flex items-center justify-center text-[#B3530E]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#3E2723]">Pergantian Kalender</h3>
            <p className="text-xs text-[#6D5A50] leading-relaxed">
              Saat menghitung tanggal berikutnya, hasil KPK ditambahkan ke tanggal awal dengan memperhatikan jumlah hari tiap bulan (30 atau 31 hari, serta 28 hari di Februari).
            </p>
          </div>
        </div>
      </section>

      {/* 4 Tahap Polya */}
      <section className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">Metode Penyelidikan</span>
          <h2 className="text-2xl font-bold text-[#3E2723]">Empat Tahap Polya dalam Setiap Misi</h2>
          <p className="text-sm text-[#6D5A50]">
            Setiap misi matematika di Ruang Misi KPK dirancang dengan 4 tahap sistematis untuk melatih penalaranmu:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {polyaSteps.map((s) => (
            <div
              key={s.step}
              className="border border-[#EAE3D9] rounded-xl p-4 bg-[#FAF8F5] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full ${s.color} text-[#3E2723] flex items-center justify-center font-bold text-xs`}>
                    {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-[#3E2723]">{s.title}</h3>
                </div>
                <p className="text-xs text-[#6D5A50] leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="text-[11px] font-semibold text-[#95634F] flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#C5E68A]" />
                <span>Wajib Diperiksa</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Jump Bar */}
      <section className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-[#6D5A50]">
            Pintu Belajar Saat Ini:{' '}
            <span className="font-bold uppercase text-[#95634F]">
              {currentTrack}
            </span>
            {activeSubmission.team.teamName && (
              <span> · Kelompok: <strong>{activeSubmission.team.teamName}</strong></span>
            )}
          </div>
          <div className="text-sm font-semibold text-[#3E2723]">
            Siap menyelesaikan 4 tantangan jadwal sekolah?
          </div>
        </div>
        <button
          onClick={() => onNavigate('latihan')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#95634F] hover:bg-[#3E2723] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#FFE082]" />
          <span>Buka 4 Misi KPK</span>
        </button>
      </section>
    </div>
  );
};
