import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Calculator,
  KeyRound,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';
import { checkSimilarity } from '../../utils/math';
import { TikoSays } from '../tiko/TikoSays';

interface PracticeQuestion {
  id: number;
  title: string;
  story: string;
  num1: number;
  num2: number;
  unit: string;
  startDate?: string;
  kpk: number;
  expectedFinalAnswer: string;
  multiples1: string;
  multiples2: string;
  explanation: string;
}

const PRACTICE_BANK: PracticeQuestion[] = [
  {
    id: 1,
    title: 'Latihan 1: Jadwal Ronda Malam',
    story:
      'Pak Ahmad bertugas ronda malam setiap 3 hari sekali, sedangkan Pak Budi setiap 4 hari sekali. Mereka ronda bersama pada tanggal 1 Mei. Setelah berapa hari mereka akan ronda bersama lagi, dan pada tanggal berapa?',
    num1: 3,
    num2: 4,
    unit: 'hari',
    startDate: '1 Mei',
    kpk: 12,
    expectedFinalAnswer: '13 Mei',
    multiples1: '3, 6, 9, 12, 15, 18',
    multiples2: '4, 8, 12, 16, 20',
    explanation:
      'Kelipatan 3 = 3, 6, 9, 12... Kelipatan 4 = 4, 8, 12... KPK dari 3 dan 4 adalah 12. Jadi mereka ronda bersama lagi setelah 12 hari. Tanggal berikutnya: 1 Mei + 12 hari = 13 Mei.',
  },
  {
    id: 2,
    title: 'Latihan 2: Kursus Musik & Gambar',
    story:
      'Lala mengikuti kursus biola setiap 2 hari sekali, sedangkan adiknya kursus melukis setiap 5 hari sekali. Mereka mulai kursus bersama pada hari Senin ke-1 (tanggal 2 Juni). Setelah berapa hari mereka akan kursus bersama lagi?',
    num1: 2,
    num2: 5,
    unit: 'hari',
    startDate: '2 Juni',
    kpk: 10,
    expectedFinalAnswer: '12 Juni',
    multiples1: '2, 4, 6, 8, 10, 12',
    multiples2: '5, 10, 15, 20',
    explanation:
      'Kelipatan 2 = 2, 4, 6, 8, 10... Kelipatan 5 = 5, 10, 15... KPK dari 2 dan 5 adalah 10 hari. Tanggal berikutnya: 2 Juni + 10 hari = 12 Juni.',
  },
  {
    id: 3,
    title: 'Latihan 3: Lampu Hias Panggung',
    story:
      'Dalam pentas seni sekolah, lampu panggung warna hijau berkedip setiap 3 detik dan lampu kuning berkedip setiap 6 detik. Keduanya berkedip bersama saat pertunjukan dimulai. Setelah berapa detik keduanya akan berkedip bersama lagi?',
    num1: 3,
    num2: 6,
    unit: 'detik',
    kpk: 6,
    expectedFinalAnswer: '6 detik',
    multiples1: '3, 6, 9, 12',
    multiples2: '6, 12, 18',
    explanation:
      'Kelipatan 3 = 3, 6, 9... Kelipatan 6 = 6, 12... Karena 6 merupakan kelipatan dari 3, maka KPK dari 3 dan 6 adalah 6. Keduanya berkedip bersama lagi setelah 6 detik.',
  },
  {
    id: 4,
    title: 'Latihan 4: Penggantian Air Akuarium',
    story:
      'Edo membersihkan akuarium ikan mas setiap 4 hari sekali, sedangkan Danu membersihkan akuarium ikan koki setiap 5 hari sekali. Mereka membersihkan bersama pada tanggal 3 Juli. Pada tanggal berapa mereka akan membersihkan bersama lagi?',
    num1: 4,
    num2: 5,
    unit: 'hari',
    startDate: '3 Juli',
    kpk: 20,
    expectedFinalAnswer: '23 Juli',
    multiples1: '4, 8, 12, 16, 20, 24',
    multiples2: '5, 10, 15, 20, 25',
    explanation:
      'Kelipatan 4 = 4, 8, 12, 16, 20... Kelipatan 5 = 5, 10, 15, 20... KPK dari 4 dan 5 adalah 20. Tanggal berikutnya: 3 Juli + 20 hari = 23 Juli.',
  },
];

interface Props {
  onNavigate: (view: string) => void;
}

export const PracticeQuestionsView: React.FC<Props> = ({ onNavigate }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentKpk, setStudentKpk] = useState('');
  const [studentFinalAnswer, setStudentFinalAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const q = PRACTICE_BANK[currentIdx];

  const handleCheckAnswer = () => {
    soundManager.playNextStep();
    setShowAnswer(true);
  };

  const handleNext = () => {
    soundManager.playClick();
    if (currentIdx < PRACTICE_BANK.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setStudentKpk('');
      setStudentFinalAnswer('');
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setStudentKpk('');
      setStudentFinalAnswer('');
      setShowAnswer(false);
    }
  };

  const isKpkCorrect = studentKpk.trim() === String(q.kpk);
  const isFinalCorrect = checkSimilarity(q.expectedFinalAnswer, studentFinalAnswer);

  return (
    <div className="adventure-page practice-page">
      <header className="practice-lab-hero">
        <div className="practice-lab-copy">
          <button type="button" className="practice-back-link" onClick={() => { soundManager.playClick(); onNavigate('belajar'); }}>
            <ArrowLeft size={17} /> Kembali ke Materi
          </button>
          <span className="practice-lab-kicker"><Calculator size={15} /> RUANG LATIHAN MANDIRI <i /> TANPA TIMER</span>
          <h1>Temukan pola, satu tantangan demi satu.</h1>
          <p>Latihan kecil untuk mengasah cara berpikirmu. Coba dulu dengan versimu sendiri, lalu buka pembahasan bersama Tiko.</p>
          <div className="practice-lab-tags"><span><CheckCircle2 size={14} /> Bebas mencoba</span><span><BookOpen size={14} /> Ada pembahasan</span></div>
        </div>
        <div className="practice-lab-mascot">
          <span className="practice-mascot-spark practice-mascot-spark-one" aria-hidden="true">✦</span>
          <TikoSays text={showAnswer ? (isKpkCorrect && isFinalCorrect ? 'Keren! Kamu menemukan polanya!' : 'Kita pelajari caranya, yuk!') : 'Aku temani kamu berpikir.'} size={128} mood={showAnswer && isKpkCorrect && isFinalCorrect ? 'proud' : 'curious'} />
          <span className="practice-mascot-spark practice-mascot-spark-two" aria-hidden="true">✦</span>
        </div>
      </header>

      <section className="practice-progress-panel" aria-label="Progres latihan">
        <div className="practice-progress-caption">
          <div><span className="practice-section-eyebrow">JALUR LATIHAN</span><strong>{currentIdx + 1} <i>/</i> {PRACTICE_BANK.length}</strong></div>
          <span>{currentIdx === PRACTICE_BANK.length - 1 ? 'Tantangan terakhir!' : `${PRACTICE_BANK.length - currentIdx - 1} tantangan lagi`}</span>
        </div>
        <div className="practice-progress-track" role="progressbar" aria-label="Progres latihan" aria-valuemin={1} aria-valuemax={PRACTICE_BANK.length} aria-valuenow={currentIdx + 1}>
          <span style={{ width: `${((currentIdx + 1) / PRACTICE_BANK.length) * 100}%` }} />
        </div>
        <div className="practice-route" aria-label={`Tantangan ${currentIdx + 1} dari ${PRACTICE_BANK.length}`}>
          {PRACTICE_BANK.map((item, index) => <span key={item.id} className={index === currentIdx ? 'is-current' : index < currentIdx ? 'is-passed' : ''}>{index < currentIdx ? <CheckCircle2 size={15} /> : index + 1}</span>)}
        </div>
      </section>

      <main className="practice-journal">
        <div className="practice-journal-heading">
          <div className="practice-journal-number"><span>TANTANGAN</span><strong>0{currentIdx + 1}</strong></div>
          <div className="practice-journal-title"><span className="practice-section-eyebrow">{q.unit === 'detik' ? 'POLA WAKTU' : 'POLA KALENDER'} <i /> {q.unit.toUpperCase()}</span><h2>{q.title.replace(/^Latihan\s+\d+:\s*/i, '')}</h2></div>
          <span className="practice-no-clock"><span /> Waktu santai</span>
        </div>

        <section className="practice-story-card" aria-labelledby="practice-story-heading">
          <div className="practice-story-label"><BookOpen size={16} /><span>CERITANYA</span></div>
          <h3 id="practice-story-heading">Baca situasinya, lalu cari pola yang berulang.</h3>
          <p>{q.story}</p>
          <div className="practice-number-chips" aria-label={`Bilangan ${q.num1} dan ${q.num2}`}>
            <span><i>A</i> Setiap <strong>{q.num1}</strong> {q.unit}</span>
            <span><i>B</i> Setiap <strong>{q.num2}</strong> {q.unit}</span>
            {q.startDate && <span className="practice-start-date"><i>↗</i> Mulai {q.startDate}</span>}
          </div>
        </section>

        <section className="practice-answer-sheet" aria-labelledby="practice-answer-title">
          <div className="practice-answer-heading">
            <div className="practice-answer-emblem"><Sparkles size={18} /></div>
            <div><span className="practice-section-eyebrow">LEMBAR COBA</span><h3 id="practice-answer-title">Tulis jawabanmu</h3></div>
            <p>Dua langkah kecil menuju jawaban.</p>
          </div>
          <div className="practice-answer-rows">
            <label className="practice-answer-row" htmlFor="practice_kpk_input">
              <span className="practice-answer-step">01</span>
              <span className="practice-answer-prompt"><strong>Temukan KPK</strong><small>Berapa KPK dari {q.num1} dan {q.num2}?</small></span>
              <span className="practice-answer-input-wrap"><input autoComplete="off" id="practice_kpk_input" type="text" inputMode="numeric" value={studentKpk} onChange={(e) => setStudentKpk(e.target.value)} placeholder="Tulis angka" aria-label={`KPK dari ${q.num1} dan ${q.num2}`} /><i>{q.unit}</i></span>
            </label>
            <label className="practice-answer-row" htmlFor="practice_final_input">
              <span className="practice-answer-step practice-step-gold">02</span>
              <span className="practice-answer-prompt"><strong>Tulis hasil akhirnya</strong><small>{q.unit === 'detik' ? 'Kapan keduanya bersamaan lagi?' : 'Tanggal berapa mereka bertemu lagi?'}</small></span>
              <span className="practice-answer-input-wrap"><input autoComplete="off" id="practice_final_input" type="text" value={studentFinalAnswer} onChange={(e) => setStudentFinalAnswer(e.target.value)} placeholder={q.unit === 'detik' ? 'Contoh: 6 detik' : 'Contoh: 13 Mei'} /><i>{q.unit === 'detik' ? 'hasil' : 'tanggal'}</i></span>
            </label>
          </div>
          <div className="practice-answer-actions">
            <p><HelpCircle size={15} /> Tidak harus langsung benar. Coba pikirkan dulu.</p>
            <div>
              {showAnswer && <button type="button" className="practice-retry-button" onClick={() => { soundManager.playClick(); setShowAnswer(false); }}><RotateCcw size={16} /> Coba lagi</button>}
              <button type="button" className="practice-check-button" onClick={handleCheckAnswer}><CheckCircle2 size={17} /> Periksa & pelajari</button>
            </div>
          </div>
        </section>

        {showAnswer && (
          <section className={`practice-feedback ${isKpkCorrect && isFinalCorrect ? 'is-correct' : 'is-learning'}`} aria-live="polite">
            <div className="practice-feedback-heading">
              <span className="practice-feedback-icon">{isKpkCorrect && isFinalCorrect ? <CheckCircle2 size={21} /> : <Lightbulb size={21} />}</span>
              <div><span className="practice-section-eyebrow">{isKpkCorrect && isFinalCorrect ? 'POLA DITEMUKAN' : 'WAKTUNYA BELAJAR'}</span><h3>{isKpkCorrect && isFinalCorrect ? 'Jawabanmu tepat, hebat!' : 'Mari buka petunjuknya bersama.'}</h3></div>
              <div className="practice-answer-reveal"><small>KPK</small><strong>{q.kpk} {q.unit}</strong></div>
            </div>
            <div className="practice-explanation-grid">
              <div><span>Kelipatan {q.num1}</span><strong>{q.multiples1}</strong></div>
              <div><span>Kelipatan {q.num2}</span><strong>{q.multiples2}</strong></div>
            </div>
            <p className="practice-explanation-text"><BookOpen size={16} /> {q.explanation}</p>
            <p className="practice-expected-answer">Jawaban akhir: <strong>{q.expectedFinalAnswer}</strong></p>
          </section>
        )}

        <nav className="practice-question-nav" aria-label="Navigasi soal latihan">
          <button type="button" onClick={handlePrev} disabled={currentIdx === 0}><ArrowLeft size={17} /><span>Sebelumnya</span></button>
          <span>Tantangan <strong>{currentIdx + 1}</strong> dari {PRACTICE_BANK.length}</span>
          <button type="button" onClick={handleNext} disabled={currentIdx === PRACTICE_BANK.length - 1}><span>Tantangan berikutnya</span><ArrowRight size={17} /></button>
        </nav>
      </main>

      <aside className="practice-class-invitation">
        <div className="practice-class-icon"><KeyRound size={20} /></div>
        <div><span className="practice-section-eyebrow">LANGKAH BERIKUTNYA</span><h2>Siap masuk ke misi bersama tim?</h2><p>Masukkan ID dari guru untuk memulai asesmen inti bersama kelompokmu.</p></div>
        <button type="button" onClick={() => { soundManager.playNextStep(); onNavigate('kelas'); }}>Masukkan ID Kelas <ArrowRight size={17} /></button>
      </aside>
    </div>
  );
};
