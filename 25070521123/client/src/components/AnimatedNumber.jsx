import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Smoothly animates between numeric values (used by the dashboard stats).
 */
export default function AnimatedNumber({ value, decimals = 0, duration = 650, fallback = '--' }) {
  const target = Number(value);
  const isValid = Number.isFinite(target);

  const [display, setDisplay] = useState(isValid ? target : null);
  const fromRef = useRef(isValid ? target : 0);

  useEffect(() => {
    if (!isValid) {
      setDisplay(null);
      return undefined;
    }

    if (prefersReducedMotion()) {
      fromRef.current = target;
      setDisplay(target);
      return undefined;
    }

    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;

      setDisplay(from + (target - from) * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, isValid]);

  if (display === null) return <span className="num">{fallback}</span>;

  const text = decimals > 0 ? display.toFixed(decimals) : String(Math.round(display));
  return <span className="num">{text}</span>;
}
