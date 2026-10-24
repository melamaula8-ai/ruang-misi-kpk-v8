import React from 'react';

export const SceneBackdrop: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`tk-scene ${className}`} aria-hidden="true">
    <span className="tk-sun" />
    <span className="tk-cloud tk-cloud-one" />
    <span className="tk-cloud tk-cloud-two" />
    <span className="tk-hill tk-hill-back" />
    <span className="tk-hill tk-hill-front" />
    <span className="tk-road"><i /></span>
  </div>
);
