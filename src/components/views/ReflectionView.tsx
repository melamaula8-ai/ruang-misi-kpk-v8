import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react';
import { ReflectionIllustration } from '../illustrations/Illustrations';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';
import { ReflectionData } from '../../types';

interface Props {
  onNavigate: (view: string) => void;
}

export const ReflectionView: React.FC<Props> = ({ onNavigate }) => {
  const {
    activeSubmission,
    questions,
    currentTrack,
    updateReflection,
    submitAssessment,
  } = useAssessment();

  const [reflectionData, setReflectionData] = useState<ReflectionData>({
    easyPart: activeSubmission.reflection?.easyPart || '',
    confusingPart: activeSubmission.reflection?.confusingPart || '',
    challengingMission: activeSubmission.reflection?.challengingMission || '',
    mostHelpfulSupport: activeSubmission.reflection?.mostHelpfulSupport || '',
    didRecheck: activeSubmission.reflection?.didRecheck || '',
    correctionPlan: activeSubmission.reflection?.correctionPlan || '',
    lcmLearning: activeSubmission.reflection?.lcmLearning || '',
    futureDifference: activeSubmission.reflection?.futureDifference || '',
    completed: activeSubmission.reflection?.completed || false,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const isAlreadySubmitted =
    activeSubmission.status === 'submitted_pending_review' ||
    activeSubmission.status === 'reviewed' ||
    activeSubmission.status === 'results_published';

  const requiredReflectionFields = ['lcmLearning', 'challengingMission', 'easyPart', 'confusingPart'] as const;
  const reflectionComplete = requiredReflectionFields.every((field) => reflectionData[field].trim());
  const currentQuestions = questions.filter((question) => question.track === currentTrack);
  const allCasesCompleted = currentQuestions.length > 0 && currentQuestions.every((question) => {
    const answers = activeSubmission.answers[question.id];
    const steps = [
      ['step1', question.step1Fields], ['step2', question.step2Fields],
      ['step3', question.step3Fields], ['step4', question.step4Fields],
    ] as const;
    const totalFields = steps.reduce((count, [, fields]) => count + fields.length, 0);
    const filledCount = steps.reduce((count, [step, fields]) => count + fields.filter((field) => Boolean(answers?.[step]?.[field.id]?.trim())).length, 0);
    return activeSubmission.status === 'results_published' || (totalFields > 0 && (
      filledCount >= Math.max(3, totalFields * 0.7) ||
      (Boolean(answers?.step3 && Object.values(answers.step3).some((value) => value.trim())) &&
        Boolean(answers?.step4 && Object.values(answers.step4).some((value) => value.trim())))
    ));
  });

  // Synchronize state whenever activeSubmission changes (e.g. reload or switching group)
  useEffect(() => {
    if (activeSubmission?.reflection) {
      setReflectionData({
        easyPart: activeSubmission.reflection.easyPart || '',
        confusingPart: activeSubmission.reflection.confusingPart || '',
        challengingMission: activeSubmission.reflection.challengingMission || '',
        mostHelpfulSupport: activeSubmission.reflection.mostHelpfulSupport || '',
        didRecheck: activeSubmission.reflection.didRecheck || '',
        correctionPlan: activeSubmission.reflection.correctionPlan || '',
        lcmLearning: activeSubmission.reflection.lcmLearning || '',
        futureDifference: activeSubmission.reflection.futureDifference || '',
        completed: activeSubmission.reflection.completed || false,
      });
      setIsDirty(false);
    }
  }, [activeSubmission.id]);

  const handleChange = (key: keyof ReflectionData, val: string) => {
    const updated = { ...reflectionData, [key]: val, completed: true };
    setReflectionData(updated);
    setIsDirty(true);
    setSaveSuccess(false);
    // Real-time synchronization to context & localStorage
    updateReflection({ [key]: val, completed: true });
  };

  const handleSave = () => {
    soundManager.playClick();
    updateReflection({ ...reflectionData, completed: true });
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleFinalSubmit = () => {
    if (!allCasesCompleted || !reflectionComplete) return;
    soundManager.playNextStep();
    updateReflection({ ...reflectionData, completed: true });
    const result = submitAssessment();
    setSubmitFeedback(result);
    if (result.success) {
      setTimeout(() => {
        setSubmitModalOpen(false);
        onNavigate('evaluasi');
      }, 1500);
    }
  };

  // Empat pertanyaan refleksi berdasarkan pengalaman asesmen dan rubrik penilaian
  const questionsList = [
    {
      id: 'lcmLearning' as const,
      num: 1,
      badge: 'Pemahaman Konsep KPK',
      q: 'Apa hal paling menarik atau bermakna yang kelompokmu pelajari tentang cara kerja KPK hari ini?',
      placeholder: 'Tuliskan pemahaman barumu tentang bagaimana kelipatan persekutuan terkecil membantu memprediksi jadwal pertemuan berulang...',
    },
    {
      id: 'challengingMission' as const,
      num: 2,
      badge: 'Pemecahan Masalah & Solusi',
      q: 'Tantangan apa yang paling menantang bagi kelompokmu selama menyelesaikan misi, dan bagaimana kalian berhasil mengatasinya bersama?',
      placeholder: 'Ceritakan tantangan perhitungan, penentuan kelipatan, atau penanggalan kalender dan cara tim menyelesaikannya...',
    },
    {
      id: 'easyPart' as const,
      num: 3,
      badge: 'Kemudahan Belajar',
      q: 'Bagian mana dalam proses 4 langkah (Polya) atau penyelidikan kasus yang dirasa paling mudah atau menyenangkan dikerjakan tim?',
      placeholder: 'Contoh: membaca masalah bersama, menulis deret kelipatan, atau memeriksa hasil perhitungan...',
    },
    {
      id: 'confusingPart' as const,
      num: 4,
      badge: 'Evaluasi Diri',
      q: 'Apakah ada konsep, istilah, atau tahapan yang sempat membingungkan, dan bagaimana kelompok memastikan jawaban akhir sudah tepat?',
      placeholder: 'Jelaskan bagaimana kalian saling bertanya, memeriksa ulang di kalender, atau memanfaatkan petunjuk didaktis...',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE3D9] pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#95634F]">
            Refleksi dan Evaluasi Proses Belajar
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3E2723] tracking-tight">
            Refleksi Perjalanan Misi Tim
          </h1>
          <p className="text-xs sm:text-sm text-[#6D5A50] mt-1">
            Renungkan pengalaman belajarmu agar pemahaman matematika dan keterampilan kolaborasi terus bertumbuh.
          </p>
        </div>

        {/* Live Save Status Indicator */}
        <div className="flex items-center gap-2">
          {isDirty ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Ada perubahan belum disimpan manual</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#C5E68A]/30 border border-[#A8D468] text-[#2D231E] text-xs font-semibold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A671E]" />
              <span>Semua refleksi tersimpan rapi</span>
            </div>
          )}
        </div>
      </div>

      {/* Notice if already submitted */}
      {isAlreadySubmitted && (
        <div className="flex items-center gap-2.5 p-3.5 bg-[#FAF8F5] border border-[#FFE082] text-[#6F4736] text-xs rounded-xl font-medium">
          <Info className="w-4 h-4 text-[#FF913D] shrink-0" />
          <span>
            Berkas asesmen kelompok <strong>{activeSubmission.team?.teamName || 'Tim'}</strong> sedang berada dalam sistem guru. Kamu tetap dapat mengedit, menambah catatan, dan menekan <strong>Simpan Refleksi</strong> kapan saja.
          </span>
        </div>
      )}

      {/* Notification Toast */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-3.5 bg-[#C5E68A]/40 border border-[#A8D468] text-[#2D231E] text-xs sm:text-sm rounded-xl font-bold shadow-xs transition-all animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#4A671E] shrink-0" />
          <span>Jawaban refleksi tim berhasil disimpan ke sistem!</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xs">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FAF8F5] rounded-xl border border-[#EAE3D9] flex items-center justify-center p-2 shrink-0">
          <ReflectionIllustration className="w-20 h-20" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFE082]/40 text-[#6F4736] text-[11px] font-extrabold uppercase border border-[#FFE082]">
            <Sparkles className="w-3 h-3 text-[#FF913D]" />
            <span>Kolom Terbuka untuk Diketik & Diedit</span>
          </div>
          <h2 className="text-lg font-bold text-[#3E2723]">
            Jurnal Evaluasi Diri & Pengalaman Belajar
          </h2>
          <p className="text-xs text-[#5D4E46] leading-relaxed">
            Diskusikan bersama kelompokmu untuk menjawab 4 pertanyaan refleksi di bawah ini secara jujur dan terbuka. Seluruh kolom bebas diklik, diketik, dan diedit kapan saja.
          </p>
        </div>
      </div>

      {/* 4 Reflection Questions - Always Clickable & Editable */}
      <div className="bg-white border border-[#EAE3D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {questionsList.map((item) => (
          <div key={item.id} className="space-y-2.5 border-b border-[#EAE3D9]/60 pb-6 last:border-b-0 last:pb-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={`reflection-${item.id}`}
                className="text-xs sm:text-sm font-bold text-[#3E2723] block leading-snug cursor-pointer"
              >
                {item.num}. {item.q}
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#8C7A70] border border-[#EAE3D9]">
                {item.badge}
              </span>
            </div>

            {/* Input area: completely accessible, no disabled/readonly, interactive cursor */}
            <textarea
              id={`reflection-${item.id}`}
              rows={6}
              value={reflectionData[item.id] || ''}
              onChange={(e) => handleChange(item.id, e.target.value)}
              placeholder={item.placeholder}
              className="box-border h-40 min-h-[140px] max-h-[180px] w-full min-w-0 resize-y px-4 py-3 bg-[#FAF8F5] hover:bg-white focus:bg-white border border-[#D8CFC8] focus:border-[#FF913D] rounded-xl text-xs sm:text-sm lg:text-base font-medium text-[#2D231E] placeholder:text-[#A8988F] focus:outline-none focus:ring-2 focus:ring-[#FF913D]/30 transition-all cursor-text shadow-2xs"
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onNavigate('misi');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#EAE3D9] text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kasus</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Always Available Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#3E2723] border border-[#D8CFC8] hover:border-[#95634F] text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Simpan jawaban refleksi ke dalam data kelompok"
          >
            <Save className="w-4 h-4 text-[#95634F]" />
            <span>Simpan Refleksi</span>
          </button>

          {/* Submit to Teacher Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setSubmitModalOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF913D] hover:bg-[#F2822B] disabled:bg-[#D8CFC8] disabled:text-[#8C7A70] disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            disabled={isAlreadySubmitted || !allCasesCompleted || !reflectionComplete}
            title={!allCasesCompleted ? 'Selesaikan empat kasus terlebih dahulu.' : !reflectionComplete ? 'Isi keempat pertanyaan refleksi terlebih dahulu.' : undefined}
          >
            <Send className="w-4 h-4" />
            <span>{isAlreadySubmitted ? 'Berkas Sudah Dikirim' : 'Kirim Asesmen ke Guru'}</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#EAE3D9] animate-in zoom-in-95">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#3E2723]">
                {isAlreadySubmitted ? 'Kirim Pembaruan ke Guru?' : 'Kirim Seluruh Asesmen ke Guru?'}
              </h3>
              <p className="text-xs text-[#5D4E46] leading-relaxed">
                Pastikan kelompok <strong>{activeSubmission.team?.teamName || 'Tim'}</strong> telah menyelesaikan empat kasus dan menjawab seluruh pertanyaan refleksi. Nilai hanya dihitung dari jawaban empat kasus. Refleksi menjadi catatan belajar dan tidak memengaruhi nilai.
              </p>
            </div>

            {submitFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  submitFeedback.success
                    ? 'bg-[#C5E68A]/30 border border-[#A8D468] text-[#2D231E]'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {submitFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4A671E]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <span>{submitFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setSubmitModalOpen(false);
                }}
                className="px-4 py-2 bg-[#FAF8F5] hover:bg-neutral-100 text-[#3E2723] text-xs font-bold rounded-xl border border-[#EAE3D9] cursor-pointer"
              >
                Periksa Lagi
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!allCasesCompleted || !reflectionComplete}
                className="px-5 py-2 bg-[#FF913D] hover:bg-[#F2822B] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Ya, Kirim Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
