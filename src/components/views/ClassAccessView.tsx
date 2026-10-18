import React, { useEffect, useState } from 'react';
import { ArrowRight, KeyRound, ShieldCheck, AlertCircle, CheckCircle2, LoaderCircle, BookOpen, Users } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { SchoolHeroIllustration } from '../illustrations/Illustrations';

interface Props {
  preloadedCode?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const ClassAccessView: React.FC<Props> = ({ preloadedCode = '', onSuccess, onBack }) => {
  const { verifyAndClaimGroupToken, activeGroupToken } = useAssessment();
  const [code, setCode] = useState(preloadedCode.toUpperCase());
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const autoStartRef = React.useRef(false);

  useEffect(() => {
    if (!preloadedCode || autoStartRef.current) return;
    autoStartRef.current = true;
    const verifyLink = async () => {
      setBusy(true);
      setError('');
      const result = await verifyAndClaimGroupToken(preloadedCode);
      setBusy(false);
      if (result.success) {
        setMessage(result.message);
        window.setTimeout(onSuccess, 450);
      } else {
        setCode(preloadedCode.toUpperCase());
        setError(`Link kelas belum dapat digunakan: ${result.message} Anda dapat memasukkan ID kelas secara manual.`);
      }
    };
    void verifyLink();
    // Hanya dicoba sekali saat halaman kelas dibuka; fungsi verifikasi membaca state terbaru dari provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!code.trim()) {
      setError('Masukkan ID kelas yang diberikan guru.');
      return;
    }
    setBusy(true);
    try {
      const result = await verifyAndClaimGroupToken(code.trim());
      if (result.success) {
        setMessage(result.message);
        window.setTimeout(onSuccess, 450);
      } else {
        setError(result.message);
      }
    } catch {
      setError('ID kelas belum dapat diverifikasi. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="adventure-page learning-page-enter relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute -right-3 top-8 h-24 w-24 rounded-full bg-[#FFE082]/60 blur-2xl" aria-hidden="true" />
      <div className="class-access-card relative grid items-center gap-8 overflow-hidden rounded-[2rem] border-2 border-white bg-white p-5 shadow-xl shadow-[#95634F]/10 sm:p-8 lg:grid-cols-[1fr_.8fr] lg:p-10">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFE082] bg-[#FFF7D6] px-3 py-1.5 text-xs font-extrabold text-[#76512C]">
            <KeyRound size={15} /> LANGKAH BERIKUTNYA · AKSES KELAS
          </div>
          <div>
            <h1 className="text-3xl font-black leading-tight text-[#3E2723] sm:text-4xl">Siap bergabung ke <span className="text-[#B7652B]">ruang misi?</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#6D5A50] sm:text-base">Masukkan ID kelas dari guru. Setelah ID terverifikasi, isi identitas kelompok dan anggota sebelum mulai mengerjakan empat misi KPK.</p>
          </div>
          {activeGroupToken && <div className="flex items-center gap-3 rounded-2xl border border-[#A8D468] bg-[#F4F9E9] p-4"><CheckCircle2 className="shrink-0 text-[#4A671E]" /><div><p className="text-xs font-bold text-[#4A671E]">ID yang dikenali di perangkat ini</p><p className="font-mono text-lg font-black tracking-wide text-[#3E2723]">{activeGroupToken.code}</p></div></div>}
          {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/><span>{error}</span></div>}
          {message && <div role="status" className="flex gap-2 rounded-xl border border-[#A8D468] bg-[#F4F9E9] p-3 text-sm font-semibold text-[#42631D]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0"/><span>{message}</span></div>}
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="class-code" className="block text-sm font-extrabold text-[#3E2723]">ID Kelas dari Guru</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#95634F]" />
              <input id="class-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" maxLength={40} placeholder="Contoh: KPK-4A-82" className="w-full rounded-2xl border-2 border-[#E4D5C8] bg-[#FFFCF7] py-4 pl-12 pr-4 font-mono text-lg font-black tracking-widest text-[#3E2723] outline-none transition focus:border-[#FF913D] focus:ring-4 focus:ring-[#FF913D]/15" disabled={busy} />
            </div>
            <button type="submit" disabled={busy || !code.trim()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF913D] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#FF913D]/20 transition hover:-translate-y-0.5 hover:bg-[#E77A28] disabled:cursor-wait disabled:opacity-60">
              {busy ? <><LoaderCircle className="h-5 w-5 animate-spin"/> Memeriksa ID...</> : <>Verifikasi dan Lanjut <ArrowRight className="h-5 w-5"/></>}
            </button>
          </form>
          <div className="grid gap-3 border-t border-[#EFE4DA] pt-4 sm:grid-cols-2">
            <div className="flex gap-2 text-xs leading-5 text-[#6D5A50]"><Users className="mt-0.5 h-4 w-4 shrink-0 text-[#95634F]"/><span>Gunakan ID yang diberikan guru untuk kelompokmu.</span></div>
            <div className="flex gap-2 text-xs leading-5 text-[#6D5A50]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#95634F]"/><span>Jawaban kelompok tersimpan dalam sesi yang sesuai.</span></div>
          </div>
          <button type="button" onClick={onBack} className="text-sm font-bold text-[#95634F] underline decoration-[#D8C4B9] underline-offset-4 hover:text-[#3E2723]"><BookOpen className="mr-1 inline h-4 w-4"/> Kembali ke materi dan latihan</button>
        </div>
        <div className="relative mx-auto w-full max-w-sm rounded-[1.75rem] border border-[#F0D9A7] bg-gradient-to-br from-[#FFF8D9] via-[#FFFDF7] to-[#E9F5D8] p-5 sm:p-7">
          <div className="absolute right-5 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFE082] text-xl font-black text-[#704A36] shadow-sm" aria-hidden="true">÷</div>
          <SchoolHeroIllustration className="mx-auto h-auto w-full drop-shadow-sm" />
          <div className="mt-3 rounded-2xl border border-white/90 bg-white/85 p-4 text-center shadow-sm"><p className="font-black text-[#3E2723]">Satu tim, satu misi!</p><p className="mt-1 text-xs leading-5 text-[#6D5A50]">Pastikan nama kelompok dan anggota siap sebelum memulai.</p></div>
        </div>
      </div>
    </section>
  );
};
