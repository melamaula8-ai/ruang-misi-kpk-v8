import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, Compass, Flag, LockKeyhole, Route, Sparkles, Star } from 'lucide-react';
import type { LearningTrack } from '../../types';
import { useAssessment } from '../../context/AssessmentContext';
import { TikoSays } from '../tiko/TikoSays';
import { SceneBackdrop } from '../tiko/SceneBackdrop';
import { TikoDoorSprite } from '../tiko/TikoDoorSprite';

interface Props { onNavigate: (view: string) => void; }

const paths: Array<{ id: LearningTrack; icon: React.FC<{ size?: number }>; tagline: string; level: string; color: string; line: string }> = [
  { id: 'penjelajah', icon: Route, tagline: 'Ikuti petunjuk untuk menemukan pola.', level: 'Terbimbing', color: 'green', line: 'Pintu Penjelajah terbuka. Kita telusuri langkahnya bersama!' },
  { id: 'pengembang', icon: Compass, tagline: 'Susun strategi dan cari kelipatanmu.', level: 'Mandiri', color: 'gold', line: 'Pintu Pengembang menantangmu menyusun strategi sendiri.' },
  { id: 'inovator', icon: Sparkles, tagline: 'Buktikan jawaban dengan alasanmu.', level: 'Tantangan', color: 'blue', line: 'Pintu Inovator menunggu ide hebatmu!' },
];
const statuses = ['submitted_pending_review', 'time_expired_pending_review', 'reviewed', 'results_published'];
type EntryStage = 'idle' | 'opening' | 'walking' | 'entering' | 'closing' | 'navigating';

export const TrackSelectionView: React.FC<Props> = ({ onNavigate }) => {
  const { currentTrack, setCurrentTrack, trackLockConfig, learningContent, allSubmissions, activeSubmission } = useAssessment();
  const [tikoLine, setTikoLine] = useState('Pilih pintu yang pas untuk petualanganmu. Aku tunjukkan jalannya!');
  const [entryTrack, setEntryTrack] = useState<LearningTrack | null>(null);
  const [entryStage, setEntryStage] = useState<EntryStage>('idle');
  const gateCards = useRef<Partial<Record<LearningTrack, HTMLElement | null>>>({});
  const navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;
  const activeCode = activeSubmission.groupCode || '';
  const lockedTrack = trackLockConfig.lockedTrack || 'penjelajah';
  const lockedTrackCompleted = allSubmissions.some((submission) => submission.track === lockedTrack && (activeCode ? submission.groupCode?.toUpperCase() === activeCode.toUpperCase() : submission.id === activeSubmission.id) && statuses.includes(submission.status));
  const trackIsRestricted = (track: LearningTrack) => trackLockConfig.isLocked && track !== lockedTrack && !lockedTrackCompleted;
  const getTrackSubmission = (track: LearningTrack) => allSubmissions.find((submission) => (activeCode ? submission.groupCode?.toUpperCase() === activeCode.toUpperCase() : submission.id === activeSubmission.id) && submission.track === track);
  const handleSelectTrack = (track: LearningTrack) => {
    if (trackIsRestricted(track) || entryTrack) return;
    setCurrentTrack(track);
  };
  const handleEnterMap = () => {
    if (entryTrack || trackIsRestricted(currentTrack)) return;
    setEntryTrack(currentTrack);
  };

  useEffect(() => {
    if (!entryTrack) return;
    let cancelled = false;
    const animations: Animation[] = [];
    const card = gateCards.current[entryTrack];
    const leftDoor = card?.querySelector<HTMLElement>('.tk-gate-door-left');
    const rightDoor = card?.querySelector<HTMLElement>('.tk-gate-door-right');
    const tiko = card?.querySelector<HTMLElement>('.tk-gate-tiko');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = (normal: number) => reducedMotion ? 1 : normal;
    const play = (element: HTMLElement | null | undefined, keyframes: Keyframe[], milliseconds: number, easing = 'ease-in-out') => {
      if (!element) return Promise.resolve();
      const animation = element.animate(keyframes, { duration: duration(milliseconds), easing, fill: 'forwards' });
      animations.push(animation);
      return animation.finished;
    };

    const runEntry = async () => {
      if (!leftDoor || !rightDoor || !tiko) throw new Error('Elemen animasi pintu tidak tersedia');
      setEntryStage('opening');
      await Promise.all([
        play(leftDoor, [{ transform: 'rotateY(-58deg)' }, { transform: 'rotateY(-82deg)' }], 480),
        play(rightDoor, [{ transform: 'rotateY(58deg)' }, { transform: 'rotateY(82deg)' }], 480),
      ]);
      if (cancelled) return;

      setEntryStage('walking');
      tiko.style.visibility = 'visible';
      await play(tiko, [
        { transform: 'translate3d(0, 0, 0) scale(1)' },
        { transform: 'translate3d(0, -18%, -18px) scale(.86)' },
      ], 1050, 'cubic-bezier(.35,.05,.65,.65)');
      if (cancelled) return;

      setEntryStage('entering');
      await play(tiko, [
        { transform: 'translate3d(0, -18%, -18px) scale(.86)', opacity: 1 },
        { offset: .62, transform: 'translate3d(0, -58%, -45px) scale(.48)', opacity: 1 },
        { transform: 'translate3d(0, -106%, -86px) scale(.12)', opacity: 1 },
      ], 1180, 'cubic-bezier(.35,.05,.65,.35)');
      if (cancelled) return;

      setEntryStage('closing');
      await Promise.all([
        play(leftDoor, [{ transform: 'rotateY(-82deg)' }, { transform: 'rotateY(0deg)' }], 550),
        play(rightDoor, [{ transform: 'rotateY(82deg)' }, { transform: 'rotateY(0deg)' }], 550),
      ]);
      if (cancelled) return;
      setEntryStage('navigating');
      navigateRef.current('misi');
    };

    void runEntry().catch(() => {
      if (cancelled) return;
      animations.forEach((animation) => animation.cancel());
      setEntryTrack(null);
      setEntryStage('idle');
      navigateRef.current('misi');
    });
    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [entryTrack]);

  return (
    <main className="tk-track-page tk-scene-page">
      <SceneBackdrop className="tk-track-backdrop" />
      <div className="tk-track-content">
        <header className="tk-track-heading">
          <span className="tk-sticker">PILIH JALUR BELAJAR</span>
          <h1>Pintu petualanganmu</h1>
          <p>Tiga jalur, satu tujuan: menemukan KPK dengan caramu.</p>
          {trackLockConfig.isLocked && !lockedTrackCompleted && <p className="tk-track-notice"><LockKeyhole size={17} /> Selesaikan Pintu {learningContent.published.tracks[lockedTrack].name} lebih dahulu untuk membuka jalur lain.</p>}
          {lockedTrackCompleted && <p className="tk-track-notice"><Flag size={17} /> Pintu {learningContent.published.tracks[lockedTrack].name} selesai. Jalur lain kini dapat dipilih.</p>}
        </header>

        <div className="tk-track-companion"><TikoSays text={tikoLine} size={110} side="left" mood="curious" /></div>
        <section className={`tk-gates${entryTrack ? ' is-entering' : ''}`} aria-label="Tiga pintu misi">
          {paths.map((path, index) => {
            const Icon = path.icon;
            const isSelected = currentTrack === path.id;
            const isEntryTarget = entryTrack === path.id;
            const isRestricted = trackIsRestricted(path.id);
            const submission = getTrackSubmission(path.id);
            const isCompleted = Boolean(submission && statuses.includes(submission.status));
            const learningTrack = learningContent.published.tracks[path.id];
            return (
              <article ref={(node) => { gateCards.current[path.id] = node; }} key={path.id} data-track={path.id} data-enter-stage={isEntryTarget ? entryStage : undefined} className={`tk-gate tk-gate-${path.color}${isSelected ? ' is-selected' : ''}${isRestricted && !isSelected ? ' is-restricted' : ''}${isEntryTarget ? ' is-entering' : ''}`} onMouseEnter={() => { if (!entryTrack) setTikoLine(path.line); }}>
                <button type="button" className="tk-gate-select-area" onFocus={() => { if (!entryTrack) setTikoLine(path.line); }} onClick={() => handleSelectTrack(path.id)} aria-pressed={isSelected} aria-disabled={isRestricted && !isSelected} disabled={Boolean(entryTrack) || (isRestricted && !isSelected)}>
                  <span className="tk-gate-lintel"><span className="tk-gate-icon"><Icon size={28} /></span><span><small>TINGKAT {index + 1}</small><strong>{learningTrack.name}</strong></span></span>
                  <span className="tk-gate-opening"><span className="tk-gate-portal-depth"/><span className="tk-gate-road" />{isSelected && <span className={`tk-gate-tiko${entryTrack === path.id ? ' is-moving' : ''}`} aria-hidden="true"><TikoDoorSprite /></span>}<span className="tk-gate-door-leaf tk-gate-door-left"/><span className="tk-gate-door-leaf tk-gate-door-right"/></span>
                  <span className="tk-gate-copy"><span className="tk-level-sticker">{path.level}</span><strong>{path.tagline}</strong></span>
                </button>
                {isRestricted && !isSelected && <span className="tk-gate-state"><LockKeyhole size={15} /> Terkunci</span>}
                {isCompleted && <span className="tk-gate-state tk-gate-complete"><Flag size={15} /> Sudah dikirim</span>}
                {isSelected && <span className="tk-selected-ticket"><Check size={15} /> Pintu terpilih</span>}
                <details className="tk-gate-details"><summary><BookOpenCheck size={16} /> Lihat bekal pintu</summary><p>{learningTrack.material}</p><p>{learningTrack.activity} · {learningTrack.cases}</p></details>
                <button type="button" className="tk-btn tk-gate-choose" disabled={Boolean(entryTrack) || (isRestricted && !isSelected)} onClick={() => handleSelectTrack(path.id)}>{isSelected ? (isCompleted ? 'Buka Pintu Ini' : 'Pintu Ini Dipilih') : 'Pilih Pintu'}</button>
              </article>
            );
          })}
        </section>
        <footer className="tk-track-footer"><p>Progres tiap pintu tersimpan. Kamu bisa kembali dan melanjutkan jalur lain.</p><button type="button" className="tk-btn tk-btn-orange" onClick={handleEnterMap} disabled={Boolean(entryTrack) || trackIsRestricted(currentTrack)}>{entryTrack ? 'Tiko sedang masuk...' : 'Masuk ke Peta Misi'} <ArrowRight size={19} /></button></footer>
      </div>
      {entryTrack && <span className="sr-only" role="status" aria-live="polite">Tiko sedang {entryStage === 'opening' ? 'membuka pintu' : entryStage === 'walking' ? 'berjalan mendekati pintu' : entryStage === 'entering' ? 'masuk ke dalam pintu' : entryStage === 'closing' ? 'menutup pintu' : 'menuju peta misi'} {learningContent.published.tracks[entryTrack].name}.</span>}
    </main>
  );
};
