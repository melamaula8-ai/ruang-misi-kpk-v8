import React from 'react';
import { Lottie } from 'lottie-react';
import { elephantRoadAnimation } from '../utils/elephantLoadingAnimation';

/** Reuses the loading mascot animation and moves it along the review road. */
export const RunningElephant: React.FC = () => (
  <div className="review-elephant-runner" aria-hidden="true">
    <Lottie src={elephantRoadAnimation} loop autoplay className="review-elephant-animation" aria-hidden="true" />
  </div>
);
