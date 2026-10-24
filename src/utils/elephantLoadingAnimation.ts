import loadingAnimation from '../assets/loading.json';

// Keep the animated elephant, but exclude the built-in text layer that renders as scribbles.
export const elephantLoadingAnimation = {
  ...loadingAnimation,
  layers: loadingAnimation.layers.filter((layer) => layer.nm !== 'LOADING.'),
};

// The waiting road reuses the exact loading mascot, with only its circular backdrop removed.
export const elephantRoadAnimation = {
  ...elephantLoadingAnimation,
  layers: elephantLoadingAnimation.layers.filter((layer) => layer.nm !== 'Shape Layer 2'),
};
