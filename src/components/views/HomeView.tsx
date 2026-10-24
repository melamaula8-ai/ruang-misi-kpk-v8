import React from 'react';
import { ArrowRight } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface Props {
  onNavigate: (view: string) => void;
}

export const HomeView: React.FC<Props> = ({ onNavigate }) => (
  <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-8 sm:px-7 sm:py-12">
    <section className="grid w-full items-center gap-6 border-y border-[#EAE3D9] py-7 sm:grid-cols-[1fr_250px] sm:gap-12 sm:py-12">
      <div className="order-2 sm:order-1">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#74834A]">Matematika · Kelas V SD/MI</p>
        <h1 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-tight text-[#3E2723] sm:text-5xl">Selamat datang di Ruang Misi KPK</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-[#62564C] sm:text-lg sm:leading-8">Bersama Tiko, pelajari pola jadwal berulang dan siapkan dirimu untuk memecahkan misi matematika.</p>
        <button type="button" onClick={() => { soundManager.playNextStep(); onNavigate('belajar'); }} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#E9782E] px-5 py-3 text-base font-extrabold text-white transition hover:bg-[#C95F1F] focus:outline-none focus:ring-4 focus:ring-[#E9782E]/25">
          Mulai Belajar <ArrowRight size={19}/>
        </button>
      </div>
      <div className="order-1 flex justify-center sm:order-2">
        <img src="/assets/elephant.png" alt="Tiko, gajah biru teman petualangan matematika" className="h-40 w-52 object-contain sm:h-56 sm:w-64" />
      </div>
    </section>
  </main>
);
