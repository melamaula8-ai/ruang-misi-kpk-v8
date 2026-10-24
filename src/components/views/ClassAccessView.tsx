import React, { useEffect, useState } from 'react';
import { ArrowRight, KeyRound, ShieldCheck, AlertCircle, CheckCircle2, LoaderCircle, BookOpen, Users } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { LoadingIndicator } from '../LoadingIndicator';
import { TikoSays } from '../tiko/TikoSays';
import { SceneBackdrop } from '../tiko/SceneBackdrop';

interface Props {
  preloadedCode?: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const ClassAccessView: React.FC<Props> = ({ preloadedCode = '', onSuccess, onBack }) => {
  const { verifyAndClaimGroupToken, validateStudentClassCode, activeGroupToken } = useAssessment();
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
      // A teacher may share a group ID directly. Resolve it first so this group
      // keeps the exact server record owned by that teacher.
      const directGroupResult = await verifyAndClaimGroupToken(code.trim());
      if (directGroupResult.success) {
        setMessage(directGroupResult.message);
        window.setTimeout(onSuccess, 450);
        return;
      }

      // Also support a class invitation code: validate the class, then allocate
      // a distinct group ID that is stored under the class owner's account.
      const classResult = await validateStudentClassCode(code.trim());
      if (!classResult.success) {
        setError(classResult.message || directGroupResult.message);
        return;
      }
      const response = await fetch('/api/group-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ classCode: code.trim().toUpperCase() }),
      });
      const groupData = await response.json().catch(() => ({}));
      if (!response.ok || typeof groupData.token?.code !== 'string') {
        setError(groupData.error || 'Sesi kelompok belum berhasil dibuat. Silakan coba lagi.');
        return;
      }
      const result = await verifyAndClaimGroupToken(groupData.token.code);
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
    <>
      {busy && <LoadingIndicator label="Memvalidasi akses murid..." overlay />}
      <main className="tk-class-page tk-scene-page">
        <SceneBackdrop className="tk-class-backdrop" />
        <section className="tk-class-content">
          <header className="tk-class-heading">
            <span className="tk-sticker"><KeyRound size={15} /> GERBANG SEKOLAH</span>
            <h1>Gabung ke ruang misi</h1>
            <p>Masukkan kode dari gurumu. Setelah terhubung, siapkan tim dan mulai tantangan KPK.</p>
          </header>
          <div className="tk-class-layout">
            <div className="tk-class-form-area">
              <TikoSays text={busy ? 'Sebentar, Tiko sedang memeriksa kode…' : error || message || 'Tiket masuknya di sini! Masukkan kode yang diberikan gurumu.'} size={132} side="left" mood={error ? 'thinking' : message ? 'proud' : busy ? 'thinking' : 'happy'} />
              {activeGroupToken && <div className="tk-active-token"><CheckCircle2 size={20} /><span><small>ID yang dikenali</small><strong>{activeGroupToken.code}</strong></span></div>}
              {error && <p className="tk-class-alert" role="alert"><AlertCircle size={18} />{error}</p>}
              {message && <p className="tk-class-success" role="status"><CheckCircle2 size={18} />{message}</p>}
              <form onSubmit={submit} className="tk-ticket-form">
                <label htmlFor="class-code">ID kelas dari guru</label>
                <div className="tk-ticket tk-ticket-input"><KeyRound size={21} aria-hidden="true" /><input id="class-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} autoComplete="off" maxLength={40} placeholder="CONTOH: KPK-4A-82" disabled={busy} /></div>
                <button type="submit" className="tk-btn tk-btn-orange" disabled={busy || !code.trim()}>{busy ? <><LoaderCircle className="animate-spin" /> Memeriksa kode…</> : <>Verifikasi dan lanjut <ArrowRight /></>}</button>
              </form>
              <p className="tk-class-footnote"><ShieldCheck size={17} /> Jawaban kelompok tersimpan dalam sesi yang sesuai.</p>
              <button type="button" onClick={onBack} className="tk-back-link"><BookOpen size={17} /> Kembali ke materi dan latihan</button>
            </div>
            <aside className="tk-school-scene" aria-label="Tiko menunggu di gerbang sekolah">
              <div className="tk-school-sun" /><div className="tk-school-building"><span /><span /><b>SEKOLAH</b></div>
              <div className="tk-school-gate"><i /><i /><i /><i /><i /><strong>SELAMAT DATANG</strong></div>
              <TikoSays text="Satu tim, satu misi!" size={178} side="right" mood="happy" />
            </aside>
          </div>
        </section>
      </main>
    </>
  );
};
