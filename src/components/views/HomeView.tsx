import React from 'react';
import { ArrowRight, BookOpen, CalendarDays, Clock3 } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { TikoSays } from '../tiko/TikoSays';
import { SceneBackdrop } from '../tiko/SceneBackdrop';

interface Props { onNavigate: (view: string) => void; }

export const HomeView: React.FC<Props> = ({ onNavigate }) => (
  <main className="tk-home-page tk-scene-page">
    <SceneBackdrop className="tk-home-backdrop" />
    <section className="tk-home-board">
      <div className="tk-home-copy">
        <span className="tk-sticker">MATEMATIKA · KELAS V SD/MI</span>
        <h1>Selamat datang di Ruang Misi KPK</h1>
        <p>Temukan pola kegiatan berulang dan siapkan dirimu memecahkan misi matematika bersama Tiko.</p>
        <button type="button" onClick={() => { soundManager.playNextStep(); onNavigate('belajar'); }} className="tk-btn tk-btn-orange">Mulai Belajar <ArrowRight /></button>
        <div className="tk-home-facts"><span><CalendarDays size={18} /> Jadwal berulang</span><i /><span><Clock3 size={18} /> Empat misi seru</span></div>
      </div>
      <div className="tk-home-mascot"><TikoSays text="Halo! Siap mencari kapan jadwal bertemu lagi?" size={255} side="left" mood="happy" /><span className="tk-home-stamp"><BookOpen size={18} /> Ayo mulai!</span></div>
    </section>
  </main>
);
