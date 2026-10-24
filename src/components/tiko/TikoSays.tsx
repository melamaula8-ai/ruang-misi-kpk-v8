import React from 'react';

type TikoSaysProps = {
  text: string;
  size?: number;
  side?: 'left' | 'right';
  mood?: 'happy' | 'thinking' | 'curious' | 'proud';
  className?: string;
};

export const TikoSays: React.FC<TikoSaysProps> = ({ text, size = 160, side = 'right', mood = 'happy', className = '' }) => (
  <div className={`tk-tiko-says tk-tiko-${mood} tk-tiko-side-${side} ${className}`}>
    <img src="/assets/elephant.png" alt="Tiko, gajah biru teman petualangan" style={{ width: size, height: size }} />
    <div className="tk-bubble" role="status">{text}</div>
  </div>
);
