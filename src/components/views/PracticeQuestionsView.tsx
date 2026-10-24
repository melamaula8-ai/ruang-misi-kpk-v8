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
    <div className="adventure-page max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <section className="practice-hero relative overflow-hidden rounded-[2rem] border-2 border-white bg-gradient-to-r from-[#FFF0D2] via-[#FFFDF6] to-[#EAF7D8] p-5 shadow-lg sm:p-7">
        <div className="absolute -right-6 -top-8 h-32 w-32 rounded-full bg-[#FFE082]/50 blur-xl" aria-hidden="true" />
        <div className="relative grid items-center gap-4 sm:grid-cols-[1fr_150px]">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#8A5A1F] shadow-sm"><Calculator className="h-4 w-4"/> PEMANASAN SEBELUM MISI</span><h2 className="mt-3 text-2xl font-black leading-tight text-[#3E2723] sm:text-3xl">Ayo asah otak, Penjelajah!</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#6D5A50]">Coba satu per satu. Tidak perlu buru-buru—pikirkan polanya, tulis strategimu, lalu periksa jawabanmu.</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-extrabold"><span className="rounded-full bg-white px-3 py-1.5 text-[#4A671E] shadow-sm">Belajar sambil bermain</span><span className="rounded-full bg-white px-3 py-1.5 text-[#9A5A18] shadow-sm">Boleh mencoba lagi</span></div></div>
          <div className="practice-tiko-stage"><TikoSays text={showAnswer ? (isKpkCorrect && isFinalCorrect ? 'Hebat! Kamu menemukan polanya!' : 'Yuk, kita periksa langkahnya bersama!') : 'Ayo pecahkan tantangan ini bersamaku!'} size={150} mood={showAnswer && isKpkCorrect && isFinalCorrect ? 'proud' : 'curious'} /></div>
        </div>
      </section>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
              Ruang Belajar Mandiri
            </span>
            <span className="text-xs text-[#8C7A70]">·</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#C5E68A]/40 text-[#4A671E]">
              Tanpa Batas Waktu
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight mt-1">
            Misi Latihan KPK bersama Tiko
          </h1>
          <p className="text-xs sm:text-sm text-[#6D5A50]">
            Baca tantangan, tulis jawaban, lalu pelajari cara menemukan KPK bersama Tiko.
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onNavigate('belajar');
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Materi</span>
        </button>
      </div>

      {/* Main Practice Card */}
      <div className="practice-question-card rounded-[1.75rem] border-2 border-white bg-white p-5 shadow-xl shadow-[#95634F]/10 sm:p-8 space-y-6">
        <div className="practice-question-top flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE3D9] pb-3">
          <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded bg-[#FFE082]/40 text-[#6F4736]">
            Soal {currentIdx + 1} dari {PRACTICE_BANK.length}
          </span>
          <span className="text-xs text-[#8C7A70] font-mono">
            Konteks: {q.unit === 'detik' ? 'Waktu Detik' : 'Kalender Hari'}
          </span>
        </div>

        <div className="practice-progress-track" role="progressbar" aria-label="Progres latihan" aria-valuemin={1} aria-valuemax={PRACTICE_BANK.length} aria-valuenow={currentIdx + 1}><span style={{ width: `${((currentIdx + 1) / PRACTICE_BANK.length) * 100}%` }} /></div>
        <div className="practice-route" aria-label={`Tantangan ${currentIdx + 1} dari ${PRACTICE_BANK.length}`}>{PRACTICE_BANK.map((item, index) => <span key={item.id} className={index === currentIdx ? 'is-current' : index < currentIdx ? 'is-passed' : ''}>{index + 1}</span>)}</div>

        {/* Story */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-[#3E2723]">{q.title}</h2>
          <p className="practice-story text-sm text-[#3E2723] bg-gradient-to-r from-[#FFF8DE] to-[#F4F9E9] p-5 rounded-2xl border border-[#F0D9A7] leading-relaxed font-semibold">
            {q.story}
          </p>
        </div>

        {/* Input Form */}
        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="practice-answer-box space-y-2 p-4 rounded-2xl bg-gradient-to-br from-[#F4F9E9] to-white border-2 border-[#DCE9C6] hover:border-[#A8D468] focus-within:border-[#FF913D] focus-within:ring-4 focus-within:ring-[#FF913D]/15 transition-all cursor-text"
            onClick={() => document.getElementById('practice_kpk_input')?.focus()}
          >
            <label htmlFor="practice_kpk_input" className="text-xs font-bold text-[#3E2723] block cursor-pointer select-none">
              1. Berapa nilai KPK dari {q.num1} dan {q.num2}?
            </label>
            <input
              autoComplete="off"
              id="practice_kpk_input"
              type="text"
              inputMode="numeric"
              value={studentKpk}
              onChange={(e) => setStudentKpk(e.target.value)}
              placeholder="Tuliskan nilai KPK di sini..."
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] focus:bg-white border border-[#D8CFC8] hover:border-[#95634F] focus:border-[#FF913D] rounded-xl text-xs sm:text-sm lg:text-base font-bold text-[#2D231E] focus:outline-none transition-colors"
            />
          </div>

          <div
            className="practice-answer-box space-y-2 p-4 rounded-2xl bg-gradient-to-br from-[#FFF7DC] to-white border-2 border-[#F0D9A7] hover:border-[#FFE082] focus-within:border-[#FF913D] focus-within:ring-4 focus-within:ring-[#FF913D]/15 transition-all cursor-text"
            onClick={() => document.getElementById('practice_final_input')?.focus()}
          >
            <label htmlFor="practice_final_input" className="text-xs font-bold text-[#3E2723] block cursor-pointer select-none">
              2. Jawaban akhir ({q.unit === 'detik' ? 'Detik bersama' : 'Tanggal bersama berikutnya'}):
            </label>
            <input
              autoComplete="off"
              id="practice_final_input"
              type="text"
              value={studentFinalAnswer}
              onChange={(e) => setStudentFinalAnswer(e.target.value)}
              placeholder={q.unit === 'detik' ? 'Tuliskan detik bersama di sini...' : 'Tuliskan tanggal bersama di sini...'}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F5] focus:bg-white border border-[#D8CFC8] hover:border-[#95634F] focus:border-[#FF913D] rounded-xl text-xs sm:text-sm lg:text-base font-bold text-[#2D231E] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Check Answer Button & Reset Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheckAnswer}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Jawab & Periksa Pembahasan</span>
          </button>

          {showAnswer && (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setShowAnswer(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EAE3D9] text-[#6D5A50] hover:text-[#3E2723] text-xs font-bold rounded-xl border border-[#D8CFC8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Coba Jawab Lagi</span>
            </button>
          )}
        </div>

        {/* Immediate Solution Display (Muncul setelah klik tombol Jawab) */}
        {showAnswer && (
          <div className="mt-6 pt-5 border-t border-[#EAE3D9] space-y-4 animate-in fade-in duration-300">
            {/* Feedback alert */}
            <div
              className={`p-4 rounded-xl flex items-center gap-3 text-xs ${
                isKpkCorrect && isFinalCorrect
                  ? 'bg-[#C5E68A]/30 border border-[#A8D468] text-[#2D231E]'
                  : 'bg-[#FFE082]/30 border border-[#FFE082] text-[#6F4736]'
              }`}
            >
              {isKpkCorrect && isFinalCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-[#4A671E] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#FF913D] shrink-0" />
              )}
              <div>
                <span className="font-extrabold block">
                  {isKpkCorrect && isFinalCorrect
                    ? 'Bagus sekali! Jawabanmu Tepat!'
                    : 'Mari kita periksa dan pelajari bersama langkah penyelesaiannya:'}
                </span>
                <span>
                  KPK yang diharapkan:{' '}
                  <strong>
                    {q.kpk} {q.unit}
                  </strong>{' '}
                  · Jawaban akhir yang diharapkan: <strong>{q.expectedFinalAnswer}</strong>
                </span>
              </div>
            </div>

            {/* Step by step explanation card */}
            <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#3E2723]">
                <BookOpen className="w-4 h-4 text-[#95634F]" />
                <span>Pembahasan Langkah Demi Langkah:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-[#E8DFD8]">
                <div>
                  <span className="text-[#8C7A70] font-semibold block">
                    Kelipatan {q.num1}:
                  </span>
                  <span className="font-mono font-bold text-[#3E2723]">{q.multiples1}</span>
                </div>
                <div>
                  <span className="text-[#8C7A70] font-semibold block">
                    Kelipatan {q.num2}:
                  </span>
                  <span className="font-mono font-bold text-[#3E2723]">{q.multiples2}</span>
                </div>
              </div>

              <p className="text-[#5D4E46] leading-relaxed bg-white p-3.5 rounded-xl border border-[#E8DFD8]">
                {q.explanation}
              </p>
            </div>
          </div>
        )}

        <div className="learning-card flex flex-col gap-3 rounded-2xl border border-[#F0D9A7] bg-gradient-to-r from-[#FFF7DC] to-[#F4F9E9] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-black text-[#3E2723]">Sudah siap masuk ke kelas?</p><p className="mt-1 text-xs leading-5 text-[#6D5A50]">Setelah belajar dan mencoba latihan tanpa timer, masukkan ID dari guru untuk melengkapi identitas tim dan memulai asesmen inti.</p></div>
          <button type="button" onClick={() => { soundManager.playNextStep(); onNavigate('kelas'); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#95634F] px-5 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#754936]"><KeyRound className="h-4 w-4"/> Masukkan ID Kelas <ArrowRight className="h-4 w-4"/></button>
        </div>

        {/* Bottom Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EAE3D9]">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EAE3D9] disabled:opacity-40 text-[#3E2723] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Soal Sebelumnya</span>
          </button>

          <span className="text-xs text-[#8C7A70] font-medium">
            {currentIdx + 1} / {PRACTICE_BANK.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIdx === PRACTICE_BANK.length - 1}
            className="flex items-center gap-1 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EAE3D9] disabled:opacity-40 text-[#3E2723] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <span>Soal Berikutnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
