/**
 * Audio Apresiasi Ruang Misi KPK
 * Durasi target: ~5 detik
 * Menggabungkan arpeggio nada kemenangan Web Audio API + Sintesis Suara Bahasa Indonesia
 */

class AudioCelebrationManager {
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    try {
      this.isMuted = localStorage.getItem('ruang_misi_kpk_audio_muted') === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('ruang_misi_kpk_audio_muted', muted ? 'true' : 'false');
    } catch {}
    if (muted) {
      this.stop();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Memainkan chime nada ceria lembut dengan Web Audio API (~1.2 detik)
   */
  private playIntroChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
          resolve();
          return;
        }

        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioContextClass();
        }

        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const now = this.audioCtx.currentTime;
        const notes = [
          { freq: 523.25, time: 0.0, dur: 0.3 }, // C5
          { freq: 659.25, time: 0.25, dur: 0.35 }, // E5
          { freq: 783.99, time: 0.5, dur: 0.4 }, // G5
          { freq: 1046.5, time: 0.8, dur: 0.5 }, // C6
        ];

        notes.forEach((n) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, now + n.time);

          gain.gain.setValueAtTime(0, now + n.time);
          gain.gain.linearRampToValueAtTime(0.15, now + n.time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start(now + n.time);
          osc.stop(now + n.time + n.dur);
        });

        setTimeout(() => resolve(), 1000);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Memainkan kalimat apresiasi ramah Bahasa Indonesia (~3.8 detik)
   * Total durasi chime + speech: ~5.0 detik
   */
  public async playCelebration(
    message: string = 'Kerja bagus, tim! Pemahaman matematika kalian semakin hebat dan berkembang!',
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<boolean> {
    if (this.isMuted) {
      return false;
    }

    this.stop();
    this.isPlaying = true;
    onStart?.();

    // 1. Play intro chime (~1.0s)
    await this.playIntroChime();

    if (!this.isPlaying || this.isMuted) {
      this.isPlaying = false;
      onEnd?.();
      return false;
    }

    // 2. Play Indonesian Speech
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'id-ID';
        utterance.rate = 0.88; // Kecepatan terkalibrasi agar pengucapan santai, jelas, dan berdurasi total ~5 detik
        utterance.pitch = 1.05; // Nada ramah & ceria

        // Coba cari suara Bahasa Indonesia jika ada
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(
          (v) => v.lang.toLowerCase().includes('id') || v.lang.toLowerCase().includes('in')
        );
        if (idVoice) {
          utterance.voice = idVoice;
        }

        utterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          onEnd?.();
        };

        utterance.onerror = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          onEnd?.();
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        this.isPlaying = false;
        onEnd?.();
        return false;
      }
    } else {
      // Fallback timer if speech synthesis is not supported
      setTimeout(() => {
        this.isPlaying = false;
        onEnd?.();
      }, 4000);
      return true;
    }
  }

  public stop() {
    this.isPlaying = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    this.currentUtterance = null;
  }
}

export const audioCelebration = new AudioCelebrationManager();
