import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
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
import { LoadingIndicator } from '../LoadingIndicator';
import { ReflectionData } from '../../types';
import { queueMissionCelebrationAfterSubmit } from '../../utils/missionCelebration';

interface Props {
  onNavigate: (view: string) => void;
  previewOpen: boolean;
  onPreviewOpen: (open: boolean) => void;
  onEditMission: (missionNumber: number) => void;
}

export const ReflectionView: React.FC<Props> = ({ onNavigate, previewOpen, onPreviewOpen, onEditMission }) => {
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
  const [submitLoading, setSubmitLoading] = useState(false);

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

  const handleFinalSubmit = async () => {
    if (!allCasesCompleted || !reflectionComplete || submitLoading) return;
    soundManager.playNextStep();
    setSubmitLoading(true);
    setSubmitFeedback(null);
    const finalReflection = { ...reflectionData, completed: true };
    updateReflection(finalReflection);
    const result = await submitAssessment(finalReflection);
    setSubmitFeedback(result);
    setSubmitLoading(false);
    if (result.success) {
      if (!isAlreadySubmitted) {
        const lastMission = currentQuestions.slice().sort((a, b) => a.missionNumber - b.missionNumber).at(-1);
        if (lastMission) {
          queueMissionCelebrationAfterSubmit(activeSubmission.id, lastMission.id, currentQuestions.length, true);
        }
      }
      setTimeout(() => {
        setSubmitModalOpen(false);
        onPreviewOpen(false);
        onNavigate(isAlreadySubmitted ? 'evaluasi' : 'misi');
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

  const renderSubmitConfirmation = () => submitModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#EAE3D9] bg-white p-6 shadow-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-[#3E2723]">{isAlreadySubmitted ? 'Kirim Pembaruan ke Guru?' : 'Kirim Seluruh Asesmen ke Guru?'}</h3>
          <p className="text-sm leading-relaxed text-[#5D4E46]">Pastikan kelompok <strong>{activeSubmission.team?.teamName || 'Tim'}</strong> sudah memeriksa jawaban empat kasus dan melengkapi refleksi. Nilai dihitung dari jawaban kasus; refleksi menjadi catatan belajar.</p>
        </div>
        {submitFeedback && <div role="status" className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${submitFeedback.success ? 'border border-[#A8D468] bg-[#C5E68A]/30 text-[#2D231E]' : 'border border-red-200 bg-red-50 text-red-700'}`}>
          {submitFeedback.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4A671E]" /> : <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />}
          <span>{submitFeedback.message}</span>
        </div>}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={() => { soundManager.playClick(); setSubmitModalOpen(false); }} className="min-h-11 rounded-xl border border-[#EAE3D9] bg-[#FAF8F5] px-4 py-2 text-sm font-bold text-[#3E2723]">Periksa Lagi</button>
          <button type="button" onClick={handleFinalSubmit} disabled={!allCasesCompleted || !reflectionComplete || submitLoading} className="min-h-11 rounded-xl bg-[#FF913D] px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitLoading ? 'Mengirim…' : 'Kirim jawaban'}</button>
        </div>
      </div>
    </div>
  );

  if (previewOpen) {
    return (
      <div className="answer-preview-page">
        <header className="answer-preview-header">
          <button type="button" onClick={() => { soundManager.playClick(); onPreviewOpen(false); }} className="answer-preview-back"><ArrowLeft size={18} /> Kembali ke refleksi</button>
          <div><span>RUANG MISI KPK · TINJAUAN AKHIR</span><h1>Pratinjau Jawaban</h1><p>Periksa jawaban kelompokmu sebelum dikirim kepada guru.</p></div>
          <img src="/assets/elephant.png" alt="Tiko menemani kelompok memeriksa jawaban" />
        </header>
        <main className="answer-preview-list" aria-label="Jawaban siswa sebelum dikirim">
          {currentQuestions.slice().sort((a, b) => a.missionNumber - b.missionNumber).map((question, index) => {
            const answers = activeSubmission.answers[question.id];
            const steps = [
              { key: 'step1' as const, title: question.step1Title, fields: question.step1Fields },
              { key: 'step2' as const, title: question.step2Title, fields: question.step2Fields },
              { key: 'step3' as const, title: question.step3Title, fields: question.step3Fields },
              { key: 'step4' as const, title: question.step4Title, fields: question.step4Fields },
            ];
            return <article key={question.id} className="answer-preview-mission">
              <div className="answer-preview-mission-heading"><div><span>MISI {question.missionNumber || index + 1}</span><h2>{question.title}</h2></div><button type="button" onClick={() => { soundManager.playClick(); onEditMission(question.missionNumber); }}><Pencil size={16} />Ubah jawaban</button></div>
              {steps.map((step) => <section className="answer-preview-step" key={step.key}>
                <h3>{step.title}</h3>
                <div className="answer-preview-fields">{step.fields.map((field) => {
                  const value = answers?.[step.key]?.[field.id]?.trim() || '';
                  return <div className={`answer-preview-field${value ? '' : ' is-unanswered'}`} key={field.id}>
                    <strong>{field.label}</strong>
                    <p>{value || 'Belum dijawab'}</p>
                    {!value && <span>Jawaban belum diisi</span>}
                  </div>;
                })}</div>
              </section>)}
            </article>;
          })}
        </main>
        <footer className="answer-preview-actions">
          <p>{!allCasesCompleted ? 'Selesaikan empat misi terlebih dahulu.' : !reflectionComplete ? 'Lengkapi refleksi sebelum mengirim jawaban.' : 'Jawaban yang masih kosong ditandai agar mudah ditemukan.'}</p>
          <div><button type="button" onClick={() => { soundManager.playClick(); onPreviewOpen(false); }} className="answer-preview-secondary">Kembali ke refleksi</button><button type="button" disabled={!allCasesCompleted || !reflectionComplete || isAlreadySubmitted} onClick={() => { soundManager.playClick(); setSubmitFeedback(null); setSubmitModalOpen(true); }} className="answer-preview-submit">Kirim jawaban <ArrowRight size={18} /></button></div>
        </footer>
        {renderSubmitConfirmation()}
        {submitLoading && <LoadingIndicator label="Mengirim jawaban..." overlay />}
      </div>
    );
  }

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
              autoComplete="off"
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
              setSubmitFeedback(null);
              onPreviewOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#FF913D] hover:bg-[#F2822B] disabled:bg-[#D8CFC8] disabled:text-[#8C7A70] disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            disabled={isAlreadySubmitted || !allCasesCompleted}
            title={!allCasesCompleted ? 'Selesaikan empat kasus terlebih dahulu.' : undefined}
          >
            <ArrowRight className="w-4 h-4" />
            <span>{isAlreadySubmitted ? 'Berkas Sudah Dikirim' : 'Pratinjau Jawaban'}</span>
          </button>
        </div>
      </div>

      {renderSubmitConfirmation()}
      {submitLoading && <LoadingIndicator label="Mengirim jawaban..." overlay />}
    </div>
  );
};
