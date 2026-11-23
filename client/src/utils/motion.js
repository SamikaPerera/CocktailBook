// True when the user asked their device to reduce motion (accessibility setting).
// JavaScript-driven animations check this; CSS animations are handled in index.css.
export const prefersReducedMotion = () =>
  Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
