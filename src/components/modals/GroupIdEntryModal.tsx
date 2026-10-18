import React, { useEffect, useState } from 'react';
import { ArrowRight, AlertCircle, BookOpen, X, CheckCircle2, Link2 } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { soundManager } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (classCode: string) => void;
  initialClassCode?: string;
}

export const GroupIdEntryModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, initialClassCode = '' }) => {
  const { validateStudentClassCode } = useAssessment();
  const [classCode, setClassCode] = useState(initialClassCode);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClassCode(initialClassCode.toUpperCase());
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialClassCode]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const code = classCode.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Masukkan kode kelas yang diberikan guru.');
      return;
    }

    setIsSubmitting(true);
    const result = await validateStudentClassCode(code);
    setIsSubmitting(false);

    if (result.success) {
      soundManager.playNextStep();
      setSuccessMsg(result.message);
      window.setTimeout(() => onSuccess(code), 500);
    } else {
      soundManager.playClick();
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D231E]/55 backdrop-blur-sm flex items-center justify-center p-4" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="join-class-title" className="w-full max-w-md rounded-3xl border border-[#EAE3D9] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 space-y-6">
        <div className="flex items-start justify-between gap-3 border-b border-[#EAE3D9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C5E68A]/35 border border-[#C5E68A] flex items-center justify-center text-[#4A671E] shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-extrabold uppercase tracking-wider text-[#95634F]">Langkah berikutnya</span>
              <h2 id="join-class-title" className="text-xl sm:text-2xl font-extrabold text-[#3E2723]">Gabung Kelas</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#8C7A70] hover:bg-[#FAF8F5]" aria-label="Tutup dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-[#5D4E46]">
          Masukkan kode kelas dari gurumu atau buka tautan undangan yang dibagikan. Kode kelas diperiksa terlebih dahulu. Setelah mempelajari materi dan menyelesaikan latihan mandiri, sistem akan membuat ID kelompok secara otomatis saat identitas tim dikirim.
        </p>

        {errorMsg && (
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div role="status" className="flex items-start gap-2.5 rounded-xl border border-[#A8D468] bg-[#C5E68A]/25 p-3.5 text-sm font-semibold text-[#3E5A1C]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="class-code" className="block text-sm font-bold text-[#3E2723]">Kode Kelas</label>
            <input
              id="class-code"
              type="text"
              value={classCode}
              onChange={(event) => { setClassCode(event.target.value.toUpperCase()); setErrorMsg(''); }}
              placeholder="Contoh: KELAS-AB23CD"
              autoComplete="off"
              autoFocus
              maxLength={24}
              disabled={isSubmitting}
              className="w-full rounded-xl border-2 border-[#D8CFC8] bg-[#FAF8F5] px-4 py-3.5 font-mono text-lg font-extrabold tracking-wider text-[#3E2723] placeholder:text-sm placeholder:font-normal focus:border-[#FF913D] focus:outline-none focus:ring-4 focus:ring-[#FF913D]/15 disabled:opacity-60"
            />
            <p className="flex items-center gap-2 text-xs text-[#6D5A50]"><Link2 className="h-4 w-4 shrink-0" />Tautan undangan dari guru akan mengisi kode ini secara otomatis.</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-[#EAE3D9] bg-white px-5 py-3 text-sm font-bold text-[#5D4E46] hover:bg-[#FAF8F5]">Nanti</button>
            <button type="submit" disabled={isSubmitting || Boolean(successMsg)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF913D] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#F2822B] disabled:cursor-wait disabled:opacity-60">
              <span>{isSubmitting ? 'Memeriksa kode…' : successMsg ? 'Kode Terverifikasi' : 'Periksa Kode Kelas'}</span>
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
