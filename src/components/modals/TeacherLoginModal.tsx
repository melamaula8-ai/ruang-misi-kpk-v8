
import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, Lock, User, AlertCircle, Mail } from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { LoadingIndicator } from '../LoadingIndicator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>
          ) => void;
        };
      };
    };
  }
}

type Mode = 'login' | 'register';

export const TeacherLoginModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginTeacher, loginTeacherWithGoogle, registerTeacher, customLogoUrl } = useAssessment();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credential, setCredential] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleButtonRef = useRef<HTMLDivElement>(null);
  // Callback Google dibuat sekali per render tombol; simpan versi terbaru agar tidak memakai closure usang.
  const latest = useRef({ loginTeacherWithGoogle, onSuccess, onClose });
  latest.current = { loginTeacherWithGoogle, onSuccess, onClose };

  useEffect(() => {
    if (!isOpen || (mode === 'register' && credential)) return;

    let cancelled = false;

    const initializeGoogle = async () => {
      try {
        const configResponse = await fetch('/api/teacher-google-config', { headers: { Accept: 'application/json' } });
        let config: { clientId?: unknown; error?: unknown; ready?: unknown; problems?: unknown } = {};
        try {
          config = await configResponse.json();
        } catch {
          throw new Error('Server aplikasi tidak menjawab. Jalankan lewat "npm run pages:dev" (bukan hanya "npm run dev") atau deploy ke Cloudflare Pages.');
        }
        if (!configResponse.ok) {
          throw new Error(typeof config.error === 'string' ? config.error : 'Konfigurasi Google belum tersedia.');
        }

        if (!config.clientId || typeof config.clientId !== 'string') {
          throw new Error('Google Client ID belum dikonfigurasi.');
        }
        if (config.ready === false && Array.isArray(config.problems) && config.problems.length) {
          if (!cancelled) setError(config.problems.filter((p): p is string => typeof p === 'string').join(' '));
        }

        if (!window.google) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector<HTMLScriptElement>(
              'script[data-google-identity]'
            );

            if (existingScript) {
              if (window.google) {
                resolve();
              } else {
                existingScript.addEventListener('load', () => resolve(), {
                  once: true,
                });
                existingScript.addEventListener(
                  'error',
                  () => reject(new Error('Google Sign-In gagal dimuat.')),
                  { once: true }
                );
              }
              return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.dataset.googleIdentity = 'true';
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error('Google Sign-In gagal dimuat.'));
            document.head.appendChild(script);
          });
        }

        if (cancelled || !window.google || !googleButtonRef.current) return;

        googleButtonRef.current.innerHTML = '';

        window.google.accounts.id.initialize({
          client_id: config.clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError('Verifikasi Google tidak menghasilkan kredensial.');
              return;
            }
            setError('');
            if (mode === 'register') {
              setCredential(response.credential);
              return;
            }
            setLoading(true);
            try {
              const result = await latest.current.loginTeacherWithGoogle(response.credential);
              if (!result.success) { setError(result.message); return; }
              latest.current.onSuccess();
              latest.current.onClose();
            } finally { setLoading(false); }
          },
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'register' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: 300,
          locale: 'id',
        });

        setGoogleReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Google Sign-In belum dapat dimuat.'
          );
        }
      }
    };

    setGoogleReady(false);
    void initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, credential]);

  if (!isOpen) return null;

  const resetForm = (nextMode: Mode) => {
    setMode(nextMode);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setCredential('');
    setGoogleReady(false);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginTeacher(username, password);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setUsername('');
      setPassword('');
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credential) {
      setError('Verifikasi akun Google terlebih dahulu.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username harus terdiri dari minimal 3 karakter.');
      return;
    }

    if (password.length < 10) {
      setError('Kata sandi harus terdiri dari minimal 10 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi belum sama.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerTeacher(
        credential,
        username.trim(),
        password,
        confirmPassword
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setCredential('');
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {loading && <LoadingIndicator label="Memvalidasi akses guru..." overlay />}
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#EAE3D9] relative animate-in fade-in duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8C7A70] hover:text-[#3E2723] p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Tutup portal guru"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 text-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white mx-auto mb-1 border-2 border-[#FFE082] shadow-sm flex items-center justify-center p-1">
            <img
              src={customLogoUrl || '/app_logo.jpg'}
              alt="Logo Ruang Misi KPK"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-[#3E2723]">
            Portal Guru & Evaluator
          </h2>
          <p className="text-xs text-[#6D5A50]">
            Masuk atau buat akun untuk mengakses dashboard guru.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF8F5] rounded-xl">
          <button
            type="button"
            onClick={() => resetForm('login')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#3E2723] shadow-sm border border-[#EAE3D9]'
                : 'text-[#8C7A70] hover:text-[#3E2723]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => resetForm('register')}
            className={`py-2.5 rounded-lg text-xs font-bold transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#3E2723] shadow-sm border border-[#EAE3D9]'
                : 'text-[#8C7A70] hover:text-[#3E2723]'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2 text-center">
          <p className="text-xs font-bold text-[#3E2723]">{mode === 'register' ? 'Verifikasi dengan Google' : 'Masuk dengan Google'}</p>
          <div className="flex justify-center min-h-[42px]" ref={googleButtonRef} />
          <p className="text-[11px] text-[#8C7A70]">{!googleReady && !error && !(mode === 'register' && credential) ? 'Memuat tombol Google...' : mode === 'register' ? (credential ? 'Google terverifikasi. Lengkapi data akun di bawah.' : 'Pilih akun Google sebelum membuat akun guru.') : 'Google hanya dapat masuk jika akun guru sudah terdaftar.'}</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E2723] block">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E2723] block">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs font-medium text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF913D] hover:bg-[#F2822B] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Memeriksa akun...' : 'Masuk ke Dashboard Guru'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="flex justify-center">
                <ShieldCheck className="w-6 h-6 text-[#95634F]" />
              </div>
              <h3 className="text-sm font-bold text-[#3E2723]">
                {credential ? 'Buat Akun Guru' : 'Verifikasi Akun Google'}
              </h3>
              <p className="text-xs text-[#6D5A50]">
                {credential
                  ? 'Google terverifikasi. Lengkapi username dan kata sandi akun Anda.'
                  : 'Gunakan akun Google untuk memverifikasi identitas sebelum membuat akun.'}
              </p>
            </div>

            {!credential ? (
              <div className="space-y-2">
                <div className="flex justify-center min-h-11">
                </div>
                {!googleReady && !error && (
                  <p className="text-center text-xs text-[#8C7A70]">
                    Memuat verifikasi Google...
                  </p>
                )}
                <p className="text-center text-[11px] text-[#8C7A70]">
                  Tombol Google memerlukan koneksi internet dan konfigurasi
                  Google Client ID yang benar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>Verifikasi Google berhasil.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3E2723]">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Buat username"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
                  />
                  <p className="text-[10px] text-[#8C7A70]">
                    Gunakan 3–30 karakter: huruf, angka, titik, garis bawah,
                    atau tanda hubung.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3E2723]">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    maxLength={128}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 10 karakter"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3E2723]">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    minLength={10}
                    maxLength={128}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#D8CFC8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF913D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF913D] hover:bg-[#F2822B] disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {loading ? 'Menyimpan akun...' : 'Daftar dan Masuk'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCredential('');
                    setPassword('');
                    setConfirmPassword('');
                    setError('');
                  }}
                  className="w-full py-2 text-xs font-bold text-[#95634F] hover:text-[#3E2723]"
                >
                  Gunakan akun Google lain
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};
