import React from 'react';
import {
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  ArrowLeft,
  Calendar,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { getQuestionAnswerRows } from '../../utils/questionAnswerRows';

interface Props {
  onNavigate: (view: string) => void;
}

export const ResultsEvaluationView: React.FC<Props> = ({ onNavigate }) => {
  const { activeSubmission, activeGroupToken, questions, rubricConfig } = useAssessment();

  const isPublished = activeSubmission.status === 'results_published';
  const isPending =
    activeSubmission.status === 'submitted_pending_review' ||
    activeSubmission.status === 'time_expired_pending_review' ||
    activeSubmission.status === 'reviewed';
  const isRevision = activeSubmission.status === 'revision_requested';
  const isReopened = activeSubmission.status === 'reopened';
  const isInProgress = activeSubmission.status === 'in_progress';

  const appreciationQuote = 'Kerja bagus, tim! Kesalahan membantu kita belajar dan terus berkembang!';

  // Questions of current track
  const currentQuestions = questions.filter((q) => q.track === activeSubmission.track);

  const evaluation = activeSubmission.evaluation;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
            Laporan Asesmen Formatif
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Hasil Evaluasi Misi KPK
          </h1>
          <p className="text-xs sm:text-sm text-[#6D5A50] mt-1">
            Kelompok:{' '}
            <strong className="text-[#3E2723]">
              {activeSubmission.team.teamName || 'Tanpa Nama'}
            </strong>{' '}
            {activeGroupToken?.className && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C5E68A]/30 text-[#4A671E] border border-[#C5E68A] ml-1.5">
                {activeGroupToken.className}
              </span>
            )}{' '}
            · Pintu: <strong className="uppercase text-[#95634F]">{activeSubmission.track}</strong>
          </p>
        </div>

        {isPublished && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#95634F]" />
              <span>Cetak Hasil</span>
            </button>
          </div>
        )}
      </div>

      {/* Case 1: Status NOT PUBLISHED (Section D: Exact text requirement) */}
      {!isPublished && (
        <div className="bg-white border border-[#EAE3D9] rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-[#FFE082]/30 text-[#8C6D1F] rounded-full flex items-center justify-center mx-auto border-2 border-[#FFE082]">
            <Clock className="w-10 h-10 text-[#FF913D]" />
          </div>

          <div className="space-y-3">
            {/* Section D: Pesan Wajib yang Ditetapkan */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#3E2723] leading-snug">
              {isPending
                ? 'Jawabanmu sudah dikirim. Guru sedang memeriksa hasil pekerjaan kelompokmu.'
                : isRevision
                ? 'Guru Meminta Revisi Jawaban'
                : isReopened
                ? 'Asesmen Dibuka Kembali oleh Guru'
                : 'Asesmen Masih Sedang Dikerjakan'}
            </h2>

            <p className="text-sm text-[#5D4E46] leading-relaxed">
              {isPending
                ? activeSubmission.status === 'time_expired_pending_review'
                  ? 'Waktu pengerjaan 25 menit telah selesai. Seluruh jawaban 4 kasus, slide presentasi, dan refleksi kelompokmu telah tersimpan rapi dan sedang menunggu koreksi guru.'
                  : 'Terima kasih atas kerja keras kelompokmu! Guru sedang menelaah seluruh langkah penyelesaian, perhitungan KPK, naskah presentasi, dan refleksi. Nilai akhir, rincian skor, komentar guru, dan apresiasi akan ditampilkan di sini setelah guru mengesahkan hasil penilaian.'
                : isRevision
                ? `Catatan dari guru: "${activeSubmission.revisionNotes || 'Silakan tinjau kembali langkah perhitungan dan presentasi.'}"`
                : isReopened
                ? `Asesmen dibuka kembali. Alasan: "${activeSubmission.reopenedReason || 'Pemberian kesempatan tambahan bagi kelompok.'}"`
                : 'Kelompokmu belum mengirimkan asesmen. Lengkapi keempat misi, naskah presentasi, dan refleksi terlebih dahulu.'}
            </p>
          </div>

          {/* Submission Details */}
          <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-4 text-xs inline-flex flex-col sm:flex-row items-center gap-4 text-[#6D5A50]">
            <div>
              Status:{' '}
              <span className="font-bold text-[#3E2723]">
                {activeSubmission.status === 'time_expired_pending_review'
                  ? 'Waktu Habis — Menunggu Koreksi Guru'
                  : isPending
                  ? 'Menunggu Koreksi Guru'
                  : isRevision
                  ? 'Revisi Diminta'
                  : isReopened
                  ? 'Dibuka Kembali'
                  : 'Sedang Berlangsung'}
              </span>
            </div>
            {activeSubmission.submittedAt && (
              <div>
                Waktu Pengiriman:{' '}
                <span className="font-mono font-medium text-[#3E2723]">
                  {new Date(activeSubmission.submittedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => onNavigate(isRevision || isReopened || isInProgress ? 'misi' : 'beranda')}
              className="px-6 py-2.5 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {isRevision || isReopened || isInProgress ? 'Lanjutkan Pengerjaan Misi' : 'Kembali ke Beranda'}
            </button>
          </div>
        </div>
      )}

      {/* Case 2: Status PUBLISHED (Full Results & Review Display) */}
      {isPublished && (
        <div className="space-y-8">
          {/* Ucapan Apresiasi */}
          <div className="bg-white border-2 border-[#C5E68A] rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4A671E]">
                  <Sparkles className="w-4 h-4 text-[#FF913D]" />
                  <span>Apresiasi Pembelajaran</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#3E2723] tracking-tight">
                  “{appreciationQuote}”
                </h3>
              </div>

          </div>
          </div>
          {/* Score Header Card */}
          <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5E68A]/30 text-[#4A671E] font-bold text-xs border border-[#C5E68A]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hasil Evaluasi Resmi Dipublikasikan</span>
                </span>
                <h2 className="text-2xl font-extrabold text-[#3E2723]">
                  Pencapaian Belajar KPK Kelompok
                </h2>
                <p className="text-xs text-[#6D5A50]">
                  Diperiksa oleh: <strong>{evaluation?.reviewedBy || 'Guru Matematika'}</strong> · Dipublikasikan pada:{' '}
                  {activeSubmission.publishedAt
                    ? new Date(activeSubmission.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Hari ini'}
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="bg-[#FAF8F5] border-2 border-[#C5E68A] p-5 rounded-2xl text-center min-w-[170px] shadow-xs">
                <span className="text-xs font-bold text-[#6D5A50] block uppercase tracking-wider">
                  Nilai Akhir
                </span>
                <div className="text-4xl font-extrabold text-[#3E2723] font-mono mt-1">
                  {evaluation?.totalScore ?? '—'}
                  <span className="text-lg text-[#8C7A70] font-normal"> / 100</span>
                </div>
              </div>
            </div>

            {/* General Teacher Feedback */}
            {evaluation?.generalFeedback && (
              <div className="mt-6 pt-5 border-t border-[#EAE3D9] bg-[#FFE082]/20 border border-[#FFE082] rounded-xl p-4 text-xs space-y-1">
                <span className="font-bold text-[#6F4736] block">
                  Umpan Balik & Catatan Guru:
                </span>
                <p className="text-[#3E2723] leading-relaxed italic">
                  “{evaluation.generalFeedback}”
                </p>
              </div>
            )}
          </div>

          {/* Section Breakdown per Mission */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#3E2723]">
              Rincian Evaluasi & Pembahasan {currentQuestions.length} Kasus
            </h2>

            {currentQuestions.map((q) => {
              const studentAnswers = activeSubmission.answers[q.id] || {
                step1: {},
                step2: {},
                step3: {},
                step4: {},
              };
              const missionEval = evaluation?.missions?.[q.missionNumber];
              const missionRubric = rubricConfig[`mission${q.missionNumber}`] || rubricConfig.mission1;
              const missionMaxScore = missionRubric.step1 + missionRubric.step2 + missionRubric.step3 + missionRubric.step4;

              return (
                <div
                  key={q.id}
                  className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs"
                >
                  {/* Mission Title & Score Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
                        Misi {q.missionNumber}
                      </span>
                      <h3 className="text-lg font-bold text-[#3E2723]">{q.title}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      {missionEval && (
                        <div className="text-right">
                          <span className="text-xs text-[#8C7A70]">Skor Misi:</span>
                          <span className="font-mono text-base font-bold text-[#3E2723] ml-1.5 bg-[#FAF8F5] px-2 py-0.5 border border-[#EAE3D9] rounded">
                            {missionEval.totalScore} / {missionMaxScore}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4 Polya Steps Detail */}
                  <div className="space-y-5">
                    {/* Step 1: Memahami Masalah */}
                    <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3E2723]">
                          Tahap 1: Memahami Masalah
                        </span>
                        <VerdictBadge verdict={missionEval?.step1?.verdict || 'pending'} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Jawaban Saya:</span>
                          <p className="text-[#2D231E] font-medium bg-white p-2 rounded border border-[#E8DFD8] mt-0.5">
                            {getQuestionAnswerRows(q, 'step1', studentAnswers).filter((row) => row.answer.trim()).map((row) => `${row.label}: ${row.answer}`).join('; ') || 'Belum diisi'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Jawaban yang Seharusnya:</span>
                          <p className="text-[#4A671E] font-medium bg-white p-2 rounded border border-[#C5E68A] mt-0.5">
                            {q.step1Fields.map((f) => `${f.label}: ${f.expectedAnswer}`).join('; ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Menyusun Rencana */}
                    <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3E2723]">
                          Tahap 2: Menyusun Rencana
                        </span>
                        <VerdictBadge verdict={missionEval?.step2?.verdict || 'pending'} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Strategi yang Ditulis Murid:</span>
                          <p className="text-[#2D231E] font-medium bg-white p-2 rounded border border-[#E8DFD8] mt-0.5">
                            {getQuestionAnswerRows(q, 'step2', studentAnswers).filter((row) => row.answer.trim()).map((row) => `${row.label}: ${row.answer}`).join('; ') || 'Belum diisi'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Kunci Rencana Pembahasan:</span>
                          <p className="text-[#4A671E] font-medium bg-white p-2 rounded border border-[#C5E68A] mt-0.5">
                            Mencari kelipatan bilangan {q.num1} dan {q.num2}, menentukan KPK terkecil, dan menjumlahkan ke tanggal/waktu awal.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Melaksanakan Rencana (Objektif KPK & Jawaban Akhir) */}
                    <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3E2723]">
                          Tahap 3: Melaksanakan Rencana (KPK & Hasil Akhir)
                        </span>
                        <VerdictBadge verdict={missionEval?.step3?.verdict || 'pending'} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Jawaban Saya:</span>
                          <div className="bg-white p-2 rounded border border-[#E8DFD8] mt-0.5 space-y-1 font-mono">
                            {getQuestionAnswerRows(q, 'step3', studentAnswers).filter((row) => row.answer.trim()).map((row) => <div key={row.id}>{row.label}: {row.answer}</div>)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Jawaban yang Seharusnya:</span>
                          <div className="bg-white p-2 rounded border border-[#C5E68A] mt-0.5 space-y-1 font-mono text-[#4A671E]">
                            <div>KPK: <strong>{q.internalKey.kpk}</strong></div>
                            <div>Jawaban Akhir: <strong>{q.internalKey.finalAnswer}</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Memeriksa Kembali */}
                    <div className="bg-[#FAF8F5] border border-[#EAE3D9] rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#3E2723]">
                          Tahap 4: Memeriksa Kembali
                        </span>
                        <VerdictBadge verdict={missionEval?.step4?.verdict || 'pending'} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Pemeriksaan Murid:</span>
                          <p className="text-[#2D231E] font-medium bg-white p-2 rounded border border-[#E8DFD8] mt-0.5">
                            {getQuestionAnswerRows(q, 'step4', studentAnswers).filter((row) => row.answer.trim()).map((row) => `${row.label}: ${row.answer}`).join('; ') || 'Belum diisi'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[#8C7A70] block font-semibold">Pembuktian Matematika:</span>
                          <p className="text-[#4A671E] font-medium bg-white p-2 rounded border border-[#C5E68A] mt-0.5">
                            KPK {q.internalKey.kpk} habis dibagi {q.num1} dan {q.num2} tanpa sisa, dan merupakan bilangan persekutuan positif terkecil.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pembahasan & Saran Latihan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EAE3D9] text-xs">
                    <div className="bg-[#FFE082]/20 border border-[#FFE082] rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-[#6F4736] block">
                        Pembahasan Konseptual:
                      </span>
                      <p className="text-[#3E2723] leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                    <div className="bg-[#C5E68A]/20 border border-[#C5E68A] rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-[#4A671E] block">
                        Saran Latihan & Tindak Lanjut:
                      </span>
                      <p className="text-[#3E2723] leading-relaxed">
                        {q.practiceAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Back Button */}
      <div className="pt-2">
        <button
          onClick={() => onNavigate('beranda')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>
    </div>
  );
};

function VerdictBadge({ verdict }: { verdict: 'correct' | 'partially_correct' | 'needs_revision' | 'pending' }) {
  if (verdict === 'correct') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#C5E68A] text-[#2D231E]">
        <CheckCircle2 className="w-3 h-3 text-[#2D231E]" />
        <span>Benar</span>
      </span>
    );
  }
  if (verdict === 'partially_correct') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#FFE082] text-[#6F4736]">
        <AlertTriangle className="w-3 h-3 text-[#FF913D]" />
        <span>Sebagian Benar</span>
      </span>
    );
  }
  if (verdict === 'needs_revision') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
        <AlertTriangle className="w-3 h-3 text-red-600" />
        <span>Perlu Diperbaiki</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-[#8C7A70]">
      <HelpCircle className="w-3 h-3 text-[#8C7A70]" />
      <span>Menunggu Penilaian Guru</span>
    </span>
  );
}
