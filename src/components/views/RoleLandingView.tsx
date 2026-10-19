import React, { useState } from 'react';
import { BookOpen, ShieldCheck, ArrowRight, Calculator } from 'lucide-react';
import { SchoolHeroIllustration } from '../illustrations/Illustrations';

interface Props { onStudent: () => void; onTeacher: () => void; }

export const RoleLandingView: React.FC<Props> = ({ onStudent, onTeacher }) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  return (
    <main className="role-landing relative isolate flex min-h-screen items-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />
      <div className="absolute right-[12%] top-[18%] h-4 w-4 rounded-full bg-[#FF913D]/70" aria-hidden="true" />
      <div className="absolute bottom-[14%] left-[8%] h-5 w-5 rounded-full bg-[#C5E68A]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-extrabold text-[#704A36] shadow-sm backdrop-blur"><BookOpen size={15} className="text-[#FF913D]"/> PETUALANGAN MATEMATIKA KELAS V</div>
        </div>
        <section className="landing-shell overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/90 shadow-2xl shadow-[#95634F]/15 backdrop-blur">
          <div className="grid items-center gap-4 lg:grid-cols-[1.03fr_.97fr]">
            <div className="relative z-10 px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-12 lg:px-12 lg:py-14">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F0D9A7] bg-[#FFF7DC] px-3 py-1.5 text-xs font-black text-[#795329]">BELAJAR · BERLATIH · TEMUKAN POLA</div>
              <h1 className="max-w-xl text-4xl font-black leading-[1.06] tracking-tight text-[#3E2723] sm:text-5xl xl:text-6xl">Ayo masuk ke <span className="text-[#E9782E]">Ruang Misi KPK!</span></h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#6D5A50] sm:text-lg">Pecahkan teka-teki matematika, temukan pola bilangan, dan selesaikan misi bersama timmu. Siap menjelajah?</p>
              <div className="mt-8 grid gap-3 sm:max-w-xl">
                <button type="button" onClick={onStudent} className="role-choice role-choice-student group flex items-center gap-4 rounded-2xl border-2 border-[#A8D468] bg-[#F2F9E5] p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#C5E68A]/50 sm:p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4A671E] shadow-sm ring-1 ring-[#DCE9C6]"><BookOpen size={29}/></span>
                  <span className="min-w-0 flex-1"><span className="block text-lg font-black text-[#2D231E] sm:text-xl">Masuk sebagai Murid</span><span className="mt-1 block text-sm leading-5 text-[#5D4E46]">Mulai dari tujuan, materi, dan latihan sebelum masuk kelas.</span></span>
                  <ArrowRight className="shrink-0 text-[#4A671E] transition group-hover:translate-x-1" size={23}/>
                </button>
                <button type="button" onClick={onTeacher} className="role-choice role-choice-teacher group flex items-center gap-4 rounded-2xl border-2 border-[#D8C4B9] bg-[#FBF5F1] p-4 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#95634F]/20 sm:p-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#95634F] shadow-sm ring-1 ring-[#E8D8CE]"><ShieldCheck size={29}/></span>
                  <span className="min-w-0 flex-1"><span className="block text-lg font-black text-[#3E2723] sm:text-xl">Masuk sebagai Guru</span><span className="mt-1 block text-sm leading-5 text-[#6D5A50]">Buat ID atau link kelas, pantau kelompok, dan beri umpan balik.</span></span>
                  <ArrowRight className="shrink-0 text-[#95634F] transition group-hover:translate-x-1" size={23}/>
                </button>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-bold text-[#795D4D]"><span className="rounded-full bg-[#FFF7DC] px-3 py-1.5">4 misi investigasi</span><span className="rounded-full bg-[#F2F9E5] px-3 py-1.5">Kerja sama tim</span><span className="rounded-full bg-[#FBEDE2] px-3 py-1.5">25 menit asesmen inti</span></div>
              
            </div>
            <div className="relative flex min-w-0 flex-col justify-center gap-4 px-4 pb-5 pt-2 sm:px-10 sm:pb-8 lg:min-h-[600px] lg:px-7 lg:py-10">
              <div className="absolute inset-4 rounded-[2rem] bg-gradient-to-br from-[#FFF3D1] via-[#FFFDF7] to-[#E6F3D2] sm:inset-6" />
              <div className="relative z-10 mx-auto w-full max-w-[20rem] lg:max-w-md lg:py-10">
                <div className="absolute left-0 top-0 hidden animate-float-soft rounded-2xl border border-white bg-white/90 p-3 shadow-md lg:block"><span className="inline-block h-3 w-3 rounded-full bg-[#FF913D]" aria-hidden="true"/><span className="ml-2 text-xs font-black text-[#95634F]">Ayo berpikir!</span></div>
                <div className="absolute bottom-5 right-0 hidden animate-float-delayed rounded-2xl border border-white bg-white/90 p-3 shadow-md lg:block"><span className="text-xl" aria-hidden="true">●</span><span className="ml-2 text-sm font-black text-[#4A671E]">Temukan pola</span></div>
                <div className="math-float-card absolute right-0 top-10 z-20 hidden rotate-3 rounded-2xl border-2 border-white bg-[#FFE082] px-4 py-3 text-center shadow-lg lg:block"><div className="flex items-center justify-center gap-2 text-[#704A36]"><Calculator size={18}/><span className="text-xs font-black uppercase tracking-wide">Tantangan angka</span></div><p className="mt-1 text-2xl font-black text-[#3E2723]">2 × 3 = {selectedNumber === null ? "?" : selectedNumber}</p><p className="mt-1 text-xs font-bold text-[#704A36]" aria-live="polite">{selectedNumber === null ? "Pilih angka di bawah!" : selectedNumber === 6 ? "Hebat, jawabanmu benar!" : "Belum tepat, coba lagi ya."}</p></div>
                <div className="math-number-strip absolute bottom-12 left-0 z-20 hidden -rotate-3 gap-1.5 rounded-2xl border-2 border-white bg-white/95 p-2 shadow-lg lg:flex">{[2,4,6,8].map((n) => <button type="button" key={n} onClick={() => setSelectedNumber(n)} aria-label={`Pilih jawaban ${n}`} aria-pressed={selectedNumber === n} className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-black transition hover:-translate-y-1 hover:rotate-3 focus:outline-none focus:ring-2 focus:ring-[#FF913D] ${selectedNumber === n ? (n === 6 ? "bg-[#C5E68A] text-[#29420D]" : "bg-[#FFE082] text-[#704A36]") : "bg-[#EAF6D8] text-[#42631D]"}`}>{n}</button>)}</div>
                <div className="relative z-10 w-full animate-hero-bob"><SchoolHeroIllustration className="h-auto w-full drop-shadow-md"/></div>
              </div>
              <div className="relative z-10 grid w-full grid-cols-1 gap-3 lg:hidden">
                <div className="rounded-2xl border border-[#E8D59B] bg-[#FFE082] p-4 text-center shadow-sm"><div className="flex items-center justify-center gap-2 text-[#704A36]"><Calculator size={18}/><span className="text-xs font-black uppercase tracking-wide">Tantangan angka</span></div><p className="mt-1 text-2xl font-black text-[#3E2723]">2 × 3 = {selectedNumber === null ? "?" : selectedNumber}</p><p className="mt-1 text-sm font-bold text-[#704A36]" aria-live="polite">{selectedNumber === null ? "Pilih angka di bawah!" : selectedNumber === 6 ? "Hebat, jawabanmu benar!" : "Belum tepat, coba lagi ya."}</p><div className="math-number-strip mt-3 flex justify-center gap-2">{[2,4,6,8].map((n) => <button type="button" key={n} onClick={() => setSelectedNumber(n)} aria-label={`Pilih jawaban ${n}`} aria-pressed={selectedNumber === n} className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-black transition focus:outline-none focus:ring-2 focus:ring-[#FF913D] ${selectedNumber === n ? (n === 6 ? "bg-[#C5E68A] text-[#29420D]" : "bg-white text-[#704A36]") : "bg-white/80 text-[#42631D]"}`}>{n}</button>)}</div></div>
                <div className="rounded-2xl border border-white bg-white/90 px-4 py-3 text-center shadow-sm"><p className="text-sm font-black text-[#3E2723]">Temukan Polanya, Pecahkan Masalahnya</p><p className="mt-1 text-xs font-semibold text-[#6D5A50]">Satu langkah kecil menuju penemuan besar.</p></div>
              </div>
            </div>
          </div>
        </section>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#795D4D]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#FF913D]"/> Ruang belajar interaktif untuk petualang matematika SD/MI</div>
      </div>
    </main>
  );
};
