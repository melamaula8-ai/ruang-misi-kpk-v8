import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, CalendarDays, Check, ChevronDown, GitBranch, PencilLine, Search, Send, Sparkles } from 'lucide-react';
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
const goalChoices = [
  { title: 'Cari pola', copy: 'Cari kegiatan yang berulang. Kapan kegiatan itu terjadi lagi?', Icon: Search },
  { title: 'Temukan KPK', copy: 'Susun kelipatan sampai ada angka yang sama. Cari yang paling kecil.', Icon: Calculator },
  { title: 'Ceritakan caramu', copy: 'Tunjukkan langkahmu supaya teman satu kelompok ikut paham.', Icon: Check },
];
const polyaSteps = [
  ['Pahami ceritanya', 'Baca pelan-pelan. Angka apa yang kamu tahu? Apa yang perlu dicari?', Search],
  ['Pilih caramu', 'Mau membuat daftar kelipatan atau tabel jadwal? Pilih cara yang paling nyaman.', GitBranch],
  ['Cari angka yang sama', 'Tulis kelipatan sampai ada angka yang sama. Ambil yang paling kecil.', Calculator],
  ['Cek sekali lagi', 'Coba bagi hasilnya dengan kedua bilangan. Kalau pas, jawabanmu masuk akal.', Check],
] as const;

export const LearningJourneyView: React.FC<Props> = ({ step, maxStep, content, trackName, onStepChange, onStart }) => {
  const track = content.tracks[trackName as keyof LearningContent['tracks']] ?? content.tracks.penjelajah;
  const [activePolya, setActivePolya] = useState(0);
  const [showNumberLine, setShowNumberLine] = useState(true);
  const [activeGoal, setActiveGoal] = useState(0);
  const [selectedDay, setSelectedDay] = useState(12);
  const [activeInstruction, setActiveInstruction] = useState(0);

  const instructions = [
    { title: 'Baca ceritanya', description: content.instructions, Icon: BookOpen, nudge: 'Cari angka yang menunjukkan seberapa sering kegiatan itu berulang.' },
    { title: 'Tulis caramu', description: 'Catat angka yang diketahui, daftar kelipatan, hasil KPK, lalu tulis kesimpulanmu.', Icon: PencilLine, nudge: 'Contoh catatan: Ani = 3, 6, 9, 12… dan Bima = 4, 8, 12…' },
    { title: 'Cek dan kirim', description: 'Pastikan semua jawaban sudah tersimpan. Kalau sudah yakin, kirim ke guru.', Icon: Send, nudge: 'Periksa lagi jawabanmu, lalu tekan tombol “Kirim Jawaban”.' },
  ];

  const selectedDayText = selectedDay % 3 === 0 && selectedDay % 4 === 0
    ? `Pas! Hari ke-${selectedDay} Ani dan Bima piket bersama.`
    : selectedDay % 3 === 0 ? `Hari ke-${selectedDay}: Ani piket.`
      : selectedDay % 4 === 0 ? `Hari ke-${selectedDay}: Bima piket.`
        : `Hari ke-${selectedDay}: belum ada jadwal piket.`;

  return (
    <main className="learning-journey mx-auto w-full max-w-7xl px-4 py-5 sm:px-7 sm:py-8">
      <header className="learning-header">
        <div className="learning-title-row">
          <div><p className="learning-eyebrow">RUANG MISI KPK <span>·</span> BEKAL PETUALANG</p><h1>Ayo siapkan bekal!</h1></div>
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
              <p className="learning-friend-line">Tiko: “Kita cari tahu kapan dua jadwal bisa bertemu lagi. Siap?”</p>
              <div className="learning-goals" aria-label="Pilih bekal yang ingin kamu lihat">{goalChoices.map(({ title, Icon }, index) => <button key={title} type="button" onClick={() => setActiveGoal(index)} aria-pressed={activeGoal === index} className={activeGoal === index ? 'is-selected' : ''}><Icon size={17}/>{title}</button>)}</div>
              <p className="learning-goal-clue" aria-live="polite">{goalChoices[activeGoal].copy}</p>
            </div>
            <div className="learning-mascot-scene"><span className="scene-sun"/><span className="scene-cloud scene-cloud-one"/><span className="scene-cloud scene-cloud-two"/><img src="/assets/elephant.png" alt="Tiko, gajah biru teman belajar"/><span className="learning-speech"><Sparkles size={14}/> Yuk, kita mulai!</span></div>
          </div>
          <div className="learning-world-strip"><span className="learning-section-label">PETUALANGAN KITA ADA DI SEKITAR</span><div className="learning-worlds">
            <div><img src="/assets/misi1.png" alt="Jadwal menyiram tanaman"/><span>Jadwal tanaman</span></div>
            <div><img src="/assets/misi2.png" alt="Lampu lalu lintas"/><span>Lampu lalu lintas</span></div>
            <div><img src="/assets/misi3.png" alt="Jadwal olahraga"/><span>Waktu olahraga</span></div>
          </div></div>
          <div className="learning-supply-row"><div><span className="learning-section-label">BEKAL MISI</span><h3>Yang perlu disiapkan</h3></div><p>{content.materials}</p></div>
          <p className="learning-track-note"><strong>Bekal dari gurumu:</strong> {track.activity}</p>
        </>}

        {step === 2 && <>
          <div className="learning-section-heading"><div><span className="learning-kicker">MISI 02 · POLA JADWAL</span><h2>Kapan Ani dan Bima piket bareng?</h2></div><div className="learning-heading-art learning-material-art"><img src="/assets/misi2.png" alt="Ilustrasi lampu lalu lintas"/><span>Jadwal berulang ada di mana-mana</span></div></div>
          <p className="learning-intro">KPK adalah <strong>kelipatan persekutuan terkecil</strong>—angka paling kecil yang muncul di beberapa daftar kelipatan. Kita pakai KPK untuk mencari kapan jadwal berulang bertemu lagi.</p>
          <article className="learning-example">
            <div className="learning-example-top"><span className="example-icon"><CalendarDays size={22}/></span><div><span className="learning-section-label">CONTOH JADWAL PIKET</span><h3>Ani dan Bima punya jadwal berbeda</h3></div></div>
            <p>Ani piket setiap <strong>3 hari</strong>, Bima setiap <strong>4 hari</strong>. Yuk, lihat hari-harinya. Kapan mereka piket bersama lagi?</p>
            <div className="learning-multiples"><div><span className="multiple-dot ani-dot"/> Ani <strong>3 · 6 · 9 · 12</strong></div><div><span className="multiple-dot bima-dot"/> Bima <strong>4 · 8 · 12</strong></div></div>
            <button type="button" className="numberline-toggle" aria-expanded={showNumberLine} onClick={() => setShowNumberLine((shown) => !shown)}>{showNumberLine ? 'Sembunyikan kalender' : 'Buka kalender hari'} <ChevronDown size={17} className={showNumberLine ? 'is-open' : ''}/></button>
            {showNumberLine && <div className="learning-numberline" aria-label="Pilih hari untuk melihat jadwal Ani dan Bima"><div className="numberline-days">{Array.from({ length: 12 }, (_, index) => {
              const day = index + 1; const ani = day % 3 === 0; const bima = day % 4 === 0; const meet = ani && bima;
              return <button key={day} type="button" onClick={() => setSelectedDay(day)} aria-pressed={selectedDay === day} aria-label={`Hari ke-${day}${meet ? ', jadwal Ani dan Bima bertemu' : ani ? ', jadwal Ani' : bima ? ', jadwal Bima' : ', tidak ada jadwal piket'}`} className={`${meet ? 'meet-day' : ''}${selectedDay === day ? ' is-selected' : ''}`}><span className="day-number">{day}</span><span className={`day-mark ${ani ? 'ani-day' : ''}`}/><span className={`day-mark ${bima ? 'bima-day' : ''}`}/></button>;
            })}</div><div className="numberline-legend"><span><i className="ani-day"/> Ani</span><span><i className="bima-day"/> Bima</span><strong aria-live="polite">{selectedDayText}</strong></div></div>}
            <p className="learning-answer"><Check size={17}/> Keduanya bertemu di hari ke-12. Itulah KPK dari 3 dan 4.</p>
          </article>
          <div className="polya-guide"><div className="polya-heading"><div><span className="learning-section-label">CARA MENCARI JAWABAN</span><h3>Empat langkah Polya</h3></div><span>Pilih langkahnya, yuk</span></div>
            <ol className="polya-rail">{polyaSteps.map(([title, description, Icon], index) => <li key={title} className={activePolya === index ? 'is-expanded' : ''}>
              <button type="button" onClick={() => setActivePolya(index)} aria-expanded={activePolya === index}><span className="polya-step-icon"><Icon size={17}/></span><span className="polya-step-number">0{index + 1}</span><span className="polya-step-title">{title}</span><ChevronDown size={16} className="polya-chevron"/></button>
              {activePolya === index && <p>{description}</p>}
            </li>)}</ol>
          </div>
          <p className="learning-track-note"><strong>Contoh lain dari gurumu:</strong> {track.material} {track.cases}</p>
        </>}

        {step === 3 && <>
          <div className="learning-section-heading"><div><span className="learning-kicker">MISI 03 · SIAPKAN JAWABAN</span><h2>Begini cara mainnya</h2><p>Kerjakan bareng kelompokmu. Tekan satu langkah untuk melihat tipsnya.</p></div><div className="learning-heading-art learning-instructions-art"><img src="/assets/misi4.png" alt="Ilustrasi sekolah tempat misi berlangsung"/><span>Siap kirim ke guru!</span></div></div>
          <ol className="instruction-steps">
            {instructions.map(({ title, description, Icon, nudge }, index) => <li key={title} className={activeInstruction === index ? 'is-open' : ''}>
              <button type="button" onClick={() => setActiveInstruction(index)} aria-expanded={activeInstruction === index}><span className="instruction-number">0{index + 1}</span><span className="instruction-icon"><Icon size={21}/></span><span className="instruction-title">{title}</span><ChevronDown size={18} className="instruction-chevron"/></button>
              {activeInstruction === index && <div className="instruction-detail"><p>{description}</p><span><Sparkles size={15}/>{nudge}</span></div>}
            </li>)}
          </ol>
          <aside className="teacher-hint"><span className="learning-section-label">PESAN GURUMU</span><p>{content.hints}</p></aside>
          <div className="learning-mascot-tip"><img src="/assets/elephant.png" alt=""/><p><strong>Tiko:</strong> Santai saja, kerjakan satu langkah dulu. Aku temani!</p></div>
        </>}
      </section>

      <footer className="learning-footer">
        <button type="button" onClick={() => onStepChange(Math.max(1, step - 1))} disabled={step === 1} className="learning-back"><ArrowLeft size={18}/> Sebelumnya</button>
        <div className="learning-footer-dots" aria-hidden="true">{chapters.map((chapter, index) => <span key={chapter} className={index + 1 === step ? 'is-current' : index + 1 < step ? 'is-done' : ''}/>)}</div>
        <button type="button" onClick={() => step < 3 ? onStepChange(step + 1) : onStart()} className="learning-next">{step === 3 ? 'Aku Siap, Mulai Petualangan!' : 'Lanjut, yuk!'}<ArrowRight size={18}/></button>
      </footer>
    </main>
  );
};
