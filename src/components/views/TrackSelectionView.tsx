import React, { useState } from 'react';
import { ArrowRight, BookOpenCheck, Check, Compass, Flag, LockKeyhole, Route, Sparkles, Star } from 'lucide-react';
import type { LearningTrack } from '../../types';
import { useAssessment } from '../../context/AssessmentContext';
import { TikoSays } from '../tiko/TikoSays';
import { SceneBackdrop } from '../tiko/SceneBackdrop';

interface Props { onNavigate: (view: string) => void; }

const paths: Array<{ id: LearningTrack; icon: React.FC<{ size?: number }>; tagline: string; level: string; color: string; line: string }> = [
  { id: 'penjelajah', icon: Route, tagline: 'Ikuti petunjuk untuk menemukan pola.', level: 'Terbimbing', color: 'green', line: 'Pintu Penjelajah terbuka. Kita telusuri langkahnya bersama!' },
  { id: 'pengembang', icon: Compass, tagline: 'Susun strategi dan cari kelipatanmu.', level: 'Mandiri', color: 'gold', line: 'Pintu Pengembang menantangmu menyusun strategi sendiri.' },
  { id: 'inovator', icon: Sparkles, tagline: 'Buktikan jawaban dengan alasanmu.', level: 'Tantangan', color: 'blue', line: 'Pintu Inovator menunggu ide hebatmu!' },
];
const statuses = ['submitted_pending_review', 'time_expired_pending_review', 'reviewed', 'results_published'];

export const TrackSelectionView: React.FC<Props> = ({ onNavigate }) => {
  const { currentTrack, setCurrentTrack, trackLockConfig, learningContent, allSubmissions, activeSubmission } = useAssessment();
  const [tikoLine, setTikoLine] = useState('Pilih pintu yang pas untuk petualanganmu. Aku tunjukkan jalannya!');
  const activeCode = activeSubmission.groupCode || '';
  const lockedTrack = trackLockConfig.lockedTrack || 'penjelajah';
  const lockedTrackCompleted = allSubmissions.some((submission) => submission.track === lockedTrack && (activeCode ? submission.groupCode?.toUpperCase() === activeCode.toUpperCase() : submission.id === activeSubmission.id) && statuses.includes(submission.status));
  const trackIsRestricted = (track: LearningTrack) => trackLockConfig.isLocked && track !== lockedTrack && !lockedTrackCompleted;
  const getTrackSubmission = (track: LearningTrack) => allSubmissions.find((submission) => (activeCode ? submission.groupCode?.toUpperCase() === activeCode.toUpperCase() : submission.id === activeSubmission.id) && submission.track === track);
  const handleSelectTrack = (track: LearningTrack) => {
    if (trackLockConfig.isLocked) return;
    setCurrentTrack(track);
  };

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
        <section className="tk-gates" aria-label="Tiga pintu misi">
          {paths.map((path, index) => {
            const Icon = path.icon;
            const isSelected = currentTrack === path.id;
            const isRestricted = trackIsRestricted(path.id);
            const submission = getTrackSubmission(path.id);
            const isCompleted = Boolean(submission && statuses.includes(submission.status));
            const learningTrack = learningContent.published.tracks[path.id];
            return (
              <article key={path.id} className={`tk-gate tk-gate-${path.color}${isSelected ? ' is-selected' : ''}${isRestricted && !isSelected ? ' is-restricted' : ''}`} onMouseEnter={() => setTikoLine(path.line)}>
                <button type="button" className="tk-gate-select-area" onFocus={() => setTikoLine(path.line)} onClick={() => handleSelectTrack(path.id)} aria-pressed={isSelected} aria-disabled={isRestricted && !isSelected}>
                  <span className="tk-gate-lintel"><span className="tk-gate-icon"><Icon size={28} /></span><span><small>TINGKAT {index + 1}</small><strong>{learningTrack.name}</strong></span></span>
                  <span className="tk-gate-opening"><span className="tk-gate-light" /><span className="tk-gate-road" /></span>
                  <span className="tk-gate-copy"><span className="tk-level-sticker">{path.level}</span><strong>{path.tagline}</strong></span>
                </button>
                {isRestricted && !isSelected && <span className="tk-gate-state"><LockKeyhole size={15} /> Terkunci</span>}
                {isCompleted && <span className="tk-gate-state tk-gate-complete"><Flag size={15} /> Sudah dikirim</span>}
                {isSelected && <span className="tk-selected-ticket"><Check size={15} /> Pintu terpilih</span>}
                <details className="tk-gate-details"><summary><BookOpenCheck size={16} /> Lihat bekal pintu</summary><p>{learningTrack.material}</p><p>{learningTrack.activity} · {learningTrack.cases}</p></details>
                <button type="button" className="tk-btn tk-gate-choose" disabled={isRestricted && !isSelected} onClick={() => handleSelectTrack(path.id)}>{isSelected ? (isCompleted ? 'Buka Pintu Ini' : 'Pintu Ini Dipilih') : 'Pilih Pintu'}</button>
              </article>
            );
          })}
        </section>
        <footer className="tk-track-footer"><p>Progres tiap pintu tersimpan. Kamu bisa kembali dan melanjutkan jalur lain.</p><button type="button" className="tk-btn tk-btn-orange" onClick={() => onNavigate('misi')}>Masuk ke Peta Misi <ArrowRight size={19} /></button></footer>
      </div>
    </main>
  );
};
