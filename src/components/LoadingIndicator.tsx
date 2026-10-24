import React from 'react';
import { Lottie } from 'lottie-react';
import { elephantLoadingAnimation } from '../utils/elephantLoadingAnimation';

interface LoadingIndicatorProps {
  label: string;
  overlay?: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ label, overlay = false }) => {
  const content = (
    <div className="loading-indicator-content" role="status" aria-live="polite" aria-label={label}>
      <div className="loading-mascot-wrap" aria-hidden="true">
        <span className="loading-mascot-orbit" />
        <Lottie src={elephantLoadingAnimation} loop autoplay className="loading-mascot-animation" aria-hidden="true" />
        <span className="loading-mascot-dot loading-mascot-dot-one" />
        <span className="loading-mascot-dot loading-mascot-dot-two" />
        <span className="loading-mascot-dot loading-mascot-dot-three" />
      </div>
      <span className="loading-indicator-label">{label}</span>
      <span className="loading-indicator-caption" aria-hidden="true">Sebentar ya, Tiko sedang menyiapkannya</span>
    </div>
  );

  return overlay ? (
    <div className="loading-indicator-overlay" aria-label={label}>
      {content}
    </div>
  ) : content;
};
