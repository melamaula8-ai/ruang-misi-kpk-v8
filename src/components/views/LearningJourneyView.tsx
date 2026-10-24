import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CalendarDays, Check, ChevronDown, Clock3, GitBranch, PencilLine, Search, Send, Sparkles } from 'lucide-react';
import type { LearningContent } from '../../context/AssessmentContext';

interface Props {
  step: number;
  maxStep: number;
  content: LearningContent;
  trackName: string;
  onStepChange: (step: number) => void;
  onStart: () => void;
}

const chapters = ['Tujuan Pembelajaran', 'Materi KPK', 'Petunjuk Pengerjaan'];
const polyaSteps = [
  ['Memahami masalah', 'Baca cerita. Catat informasi yang diketahui, pertanyaan, dan waktu awal kejadian.', Search],
  ['Menyusun rencana', 'Pilih cara mencari KPK, misalnya membuat daftar kelipatan atau melihat pola jadwal.', GitBranch],
  ['Melaksanakan rencana', 'Hitung kelipatan, temukan KPK terkecil, lalu tentukan waktu kejadian berikutnya.', Calculator],
  ['Memeriksa kembali', 'Pastikan hasil dapat dibagi oleh kedua bilangan dan tidak ada KPK yang lebih kecil.', Check],
] as const;

export const LearningJourneyView: React.FC<Props> = ({ step, maxStep, content, trackName, onStepChange, onStart }) => {
  const track = content.tracks[trackName as keyof LearningContent['tracks']] ?? content.tracks.penjelajah;
  const [activePolya, setActivePolya] = useState(0);
  const [showNumberLine, setShowNumberLine] = useState(true);

  return (
    <main className="learning-journey mx-auto w-full max-w-6xl px-4 py-5 sm:px-7 sm:py-8">
      <header className="learning-header">
        <div className="learning-title-row">
          <div><p className="learning-eyebrow">RUANG MISI KPK <span>·</span> BEKAL PETUALANG</p><h1>Siapkan diri, penjelajah!</h1></div>
          <p className="learning-stage-count">Tahap <strong>{step}</strong> dari 3</p>
        </div>
        <div className="learning-progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Tahap ${step} dari 3`}><span style={{ width: `${(step / 3) * 100}%` }} /></div>
        <nav className="learning-chapters" aria-label="Bab materi">
          {chapters.map((chapter, index) => {
            const number = index + 1;
            const available = number <= maxStep;
            return <button key={chapter} type="button" disabled={!available} onClick={() => onStepChange(number)} aria-current={step === number ? 'step' : undefined} className={step === number ? 'is-active' : available ? 'is-available' : ''}>
              <span className="learning-chapter-number">0{number}</span><span>{chapter}</span>
            </button>;
          })}
        </nav>
      </header>

      <section key={step} className="learning-page" aria-live="polite">
        {step === 1 && <>
          <div className="learning-hero learning-hero-objective">
            <div className="learning-hero-copy"><span className="learning-kicker">MISI DIMULAI · 01</span><h2>Hari ini kita jadi detektif jadwal!</h2><p>{content.objective}</p>
              <div className="learning-goals" aria-label="Yang akan dipelajari"><span><Search size={17}/> Temukan pola berulang</span><span><Calculator size={17}/> Cari KPK</span><span><Check size={17}/> Jelaskan jawaban</span></div>
            </div>
            <div className="learning-mascot-scene"><span className="scene-sun"/><span className="scene-cloud scene-cloud-one"/><span className="scene-cloud scene-cloud-two"/><img src="/assets/elephant.png" alt="Tiko, gajah biru teman belajar"/><span className="learning-speech"><Sparkles size={14}/> Halo! Ikuti petunjukku, ya.</span></div>
          </div>
          <div className="learning-supply-row"><div><span className="learning-section-label">BEKAL MISI</span><h3>Siapkan rasa ingin tahumu</h3></div><p>{content.materials}</p></div>
          <p className="learning-track-note"><strong>Jalur {track.name}:</strong> {track.activity}</p>
        </>}

        {step === 2 && <>
          <div className="learning-section-heading"><div><span className="learning-kicker">MISI 02 · POLA YANG BERULANG</span><h2>Kapan jadwal mereka bertemu lagi?</h2></div><div className="learning-heading-art"><CalendarDays size={25}/><Clock3 size={22}/></div></div>
          <p className="learning-intro">KPK adalah <strong>kelipatan persekutuan terkecil</strong>. Kita memakainya untuk mencari waktu paling cepat saat beberapa kegiatan berulang terjadi bersama lagi.</p>
          <article className="learning-example">
            <div className="learning-example-top"><span className="example-icon"><CalendarDays size={22}/></span><div><span className="learning-section-label">CONTOH JADWAL PIKET</span><h3>Ani dan Bima bertugas bergantian</h3></div></div>
            <p>Ani piket setiap <strong>3 hari</strong>. Bima setiap <strong>4 hari</strong>. Kalau mulai hari ini, berapa hari lagi mereka piket bersama?</p>
            <div className="learning-multiples"><div><span className="multiple-dot ani-dot"/> Ani <strong>3 · 6 · 9 · 12</strong></div><div><span className="multiple-dot bima-dot"/> Bima <strong>4 · 8 · 12</strong></div></div>
            <button type="button" className="numberline-toggle" aria-expanded={showNumberLine} onClick={() => setShowNumberLine((shown) => !shown)}>{showNumberLine ? 'Sembunyikan garis hari' : 'Lihat garis hari'} <ChevronDown size={17} className={showNumberLine ? 'is-open' : ''}/></button>
            {showNumberLine && <div className="learning-numberline" aria-label="Garis hari Ani dan Bima"><div className="numberline-days">{Array.from({ length: 12 }, (_, index) => {
              const day = index + 1; const ani = day % 3 === 0; const bima = day % 4 === 0; const meet = ani && bima;
              return <div key={day} className={meet ? 'meet-day' : ''}><span className="day-number">{day}</span><span className={`day-mark ${ani ? 'ani-day' : ''}`}/><span className={`day-mark ${bima ? 'bima-day' : ''}`}/></div>;
            })}</div><div className="numberline-legend"><span><i className="ani-day"/> Ani</span><span><i className="bima-day"/> Bima</span><strong>Hari ke-12 mereka bertemu!</strong></div></div>}
            <p className="learning-answer"><Check size={17}/> Jadi, KPK dari 3 dan 4 adalah <strong>12</strong>. Mereka piket bersama lagi 12 hari kemudian.</p>
          </article>
          <div className="polya-guide"><div className="polya-heading"><div><span className="learning-section-label">STRATEGI DETEKTIF</span><h3>Empat langkah Polya</h3></div><span>Ketuk langkah untuk membaca</span></div>
            <ol className="polya-rail">{polyaSteps.map(([title, description, Icon], index) => <li key={title} className={activePolya === index ? 'is-expanded' : ''}>
              <button type="button" onClick={() => setActivePolya(index)} aria-expanded={activePolya === index}><span className="polya-step-icon"><Icon size={17}/></span><span className="polya-step-number">0{index + 1}</span><span className="polya-step-title">{title}</span><ChevronDown size={16} className="polya-chevron"/></button>
              {activePolya === index && <p>{description}</p>}
            </li>)}</ol>
          </div>
          <p className="learning-track-note"><strong>Bekal dari gurumu · {track.name}:</strong> {track.material} {track.cases}</p>
        </>}

        {step === 3 && <>
          <div className="learning-section-heading"><div><span className="learning-kicker">MISI 03 · SIAPKAN JAWABAN</span><h2>Cara menyelesaikan tantangan</h2><p>Kerjakan bersama kelompok. Tunjukkan caramu berpikir, ya!</p></div><div className="learning-heading-art"><PencilLine size={24}/><Send size={22}/></div></div>
          <ol className="instruction-steps">
            <li><span className="instruction-number">01</span><span className="instruction-icon"><BookOpen size={21}/></span><div><h3>Baca dan diskusikan</h3><p>{content.instructions}</p></div><span className="instruction-side">PAHAMI</span></li>
            <li><span className="instruction-number">02</span><span className="instruction-icon"><PencilLine size={21}/></span><div><h3>Tuliskan langkahmu</h3><p>Catat informasi yang diketahui, strategi atau daftar kelipatan, hasil KPK, dan kesimpulan pada kolom jawaban.</p></div><span className="instruction-side">TULIS</span></li>
            <li><span className="instruction-number">03</span><span className="instruction-icon"><Send size={20}/></span><div><h3>Periksa lalu kirim</h3><p>Pastikan jawaban tersimpan dan sudah diperiksa, lalu tekan tombol kirim jawaban setelah selesai.</p></div><span className="instruction-side">KIRIM</span></li>
          </ol>
          <aside className="teacher-hint"><span className="learning-section-label">PESAN DARI GURU</span><p>{content.hints}</p></aside>
          <div className="learning-mascot-tip"><img src="/assets/elephant.png" alt=""/><p><strong>Tiko:</strong> Jawaban bagus selalu punya langkah yang jelas. Kamu pasti bisa!</p></div>
        </>}
      </section>

      <footer className="learning-footer">
        <button type="button" onClick={() => onStepChange(Math.max(1, step - 1))} disabled={step === 1} className="learning-back"><ArrowLeft size={18}/> Sebelumnya</button>
        <div className="learning-footer-dots" aria-hidden="true">{chapters.map((chapter, index) => <span key={chapter} className={index + 1 === step ? 'is-current' : index + 1 < step ? 'is-done' : ''}/>)}</div>
        <button type="button" onClick={() => step < 3 ? onStepChange(step + 1) : onStart()} className="learning-next">{step === 3 ? 'Aku Siap, Mulai Petualangan!' : 'Lanjut'}<ArrowRight size={18}/></button>
      </footer>
    </main>
  );
};
