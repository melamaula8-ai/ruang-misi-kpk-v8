/**
 * Web Audio API Sound Synthesizer
 * Memberikan efek suara klik, tombol berikutnya, dan fanfare keberhasilan
 * tanpa ketergantungan file audio eksternal.
 */

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const soundManager = {
  getIsMuted(): boolean {
    return isMuted;
  },

  toggleMute(): boolean {
    isMuted = !isMuted;
    return isMuted;
  },

  setMuted(muted: boolean) {
    isMuted = muted;
  },

  /**
   * Suara klik standar pada tombol biasa (lembut dan menyenangkan)
   */
  playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  },

  /**
   * Suara khusus tombol "Berikutnya / Lanjut Tahap" (nada naik ceria, berbeda dari klik biasa)
   */
  playNextStep() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Nada melangkah naik: G4 (392Hz) -> C5 (523Hz)
      osc.frequency.setValueAtTime(392, now);
      osc.frequency.setValueAtTime(523.25, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  },

  /**
   * Suara musik scoring keberhasilan / fanfare apresiasi saat menyelesaikan 4 misi
   */
  playSuccessFanfare() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Melodi arpeggio C-major ceria: C5, E5, G5, C6 (panjang)
      const notes = [
        { freq: 523.25, time: 0, duration: 0.12 },
        { freq: 659.25, time: 0.12, duration: 0.12 },
        { freq: 783.99, time: 0.24, duration: 0.15 },
        { freq: 1046.5, time: 0.39, duration: 0.45 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(0.2, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.duration);
      });
    } catch {}
  },
};
