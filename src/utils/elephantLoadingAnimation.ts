import loadingAnimation from '../assets/loading.json';

// Keep the animated elephant, but exclude the built-in text layer that renders as scribbles.
export const elephantLoadingAnimation = {
  ...loadingAnimation,
  layers: loadingAnimation.layers.filter((layer) => layer.nm !== 'LOADING.'),
};
