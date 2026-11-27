'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Types the name out once, then keeps a soft caret blinking.
 * Falls back to plain text for reduced-motion users and before hydration.
 */
export default function Typewriter({
  text,
  startDelay = 520,
  speed = 78,
  className = '',
}: {
  text: string;
  startDelay?: number;
  speed?: number;
  className?: string;
}) {
  const full = text || 'Hirun Hansaka';
  const [typed, setTyped] = useState(0);
  const [started, setStarted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTyped(full.length);
      setStarted(true);
      return;
    }

    // Wait for the intro loader to hand over (if it ran this session).
    const begin = () => {
      window.setTimeout(() => {
        setStarted(true);
        let i = 0;
        const step = () => {
          i += 1;
          setTyped(i);
          if (i < full.length) {
            // Slight organic rhythm: pauses a touch after spaces.
            const pause = full[i - 1] === ' ' ? speed * 2.2 : speed;
            timer.current = window.setTimeout(step, pause);
          }
        };
        step();
      }, startDelay);
    };

    const state = document.documentElement.dataset.intro;
    if (state === 'running') {
      const wait = window.setInterval(() => {
        if (document.documentElement.dataset.intro === 'done' || !document.documentElement.dataset.intro) {
          window.clearInterval(wait);
          begin();
        }
      }, 120);
      return () => {
        window.clearInterval(wait);
        if (timer.current) window.clearTimeout(timer.current);
      };
    }

    begin();
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [full, speed, startDelay]);

  return (
    <span className={`typewriter ${className}`} aria-label={full}>
      <span aria-hidden="true">{started ? full.slice(0, typed) : ''}</span>
      <span className="caret" data-done={typed >= full.length} aria-hidden="true" />
    </span>
  );
}
