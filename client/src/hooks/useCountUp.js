// Custom hook: animates a number from 0 up to `target` (e.g. stat cards).
// requestAnimationFrame updates it in step with the screen's refresh rate.
import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../utils/motion.js';

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3; // "ease-out": fast at first, then slows down
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame); // stop if the component disappears
  }, [target, duration]);

  return value;
}
