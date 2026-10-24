import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import GajahMisiBerhasil from '../GajahMisiBerhasil';

interface Props {
  isOpen: boolean;
  teamName: string;
  missionId: string;
  onMissionAnimationComplete: (missionId: string) => void;
  onProceedToPresentation: () => void;
  onClose: () => void;
}

export const CelebrationModal: React.FC<Props> = ({
  isOpen,
  teamName,
  missionId,
  onMissionAnimationComplete,
  onProceedToPresentation,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    soundManager.playSuccessFanfare();
    const body = document.body;
    const scrollY = window.scrollY;
    const previousStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    return () => {
      body.style.position = previousStyles.position;
      body.style.top = previousStyles.top;
      body.style.left = previousStyles.left;
      body.style.right = previousStyles.right;
      body.style.width = previousStyles.width;
      body.style.overflow = previousStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="final-celebration" role="presentation">
      <section className="final-celebration-stage" role="dialog" aria-modal="true" aria-labelledby="final-celebration-title">
        <div className="final-celebration-route" aria-hidden="true">
          <span>1</span><i /><span>2</span><i /><span>3</span><i /><span>4</span>
        </div>

        <p className="final-celebration-eyebrow">GARIS AKHIR PETUALANGAN</p>
        <h2 id="final-celebration-title" className="final-celebration-title">
          Hebat, {teamName || 'Tim Hebat'}!
        </h2>
        <p className="final-celebration-copy">Semua misi berhasil kalian selesaikan. Pola KPK kini sudah kalian taklukkan bersama.</p>

        <div className="final-celebration-mascot">
          <GajahMisiBerhasil key={missionId} size={245} onComplete={() => onMissionAnimationComplete(missionId)} />
        </div>

        <p className="final-celebration-message">Diskusi, ketelitian, dan kerja sama kalian membawa tim sampai ke tujuan.</p>
        <div className="final-celebration-actions">
          <button type="button" onClick={onClose} className="final-celebration-secondary">Kembali ke peta misi</button>
          <button type="button" onClick={() => { soundManager.playNextStep(); onProceedToPresentation(); }} className="final-celebration-primary">
            Lanjut ke refleksi <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
};
