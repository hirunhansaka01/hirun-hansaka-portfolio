'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Typewriter.
 *
 * Two modes:
 *  - `text`    types a single string once (used where a one-shot reveal is wanted)
 *  - `phrases` types each phrase, holds it, deletes it, and moves to the next,
 *              looping forever with a blinking caret (used for the hero roles)
 *
 * Starts after the intro loader hands over, and degrades to plain static text
 * for reduced-motion users, screen readers and no-JS visitors.
 */
export default function Typewriter({
  text,
  phrases,
  startDelay = 520,
  holdTime = 1500,
  speed = 62,
  deleteSpeed = 26,
  loop = true,
  caret = true,
  className = '',
}: {
  text?: string;
  phrases?: string[];
  startDelay?: number;
  holdTime?: number;
  speed?: number;
  deleteSpeed?: number;
  loop?: boolean;
  caret?: boolean;
  className?: string;
}) {
  const list = (phrases && phrases.length ? phrases : [text || '']).filter(Boolean);
  const rotating = list.length > 1;
  const full = list.join(', ');

  const [typed, setTyped] = useState(0);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!list.length) return;

    let cancelled = false;
    const startedRef = { current: false };
    let i = 0;
    let index = 0;
    let deleting = false;

    const clear = () => {
      if (timer.current) window.clearTimeout(timer.current);
    };

    const step = () => {
      if (cancelled) return;
      const phrase = list[index];

      if (!deleting) {
        i += 1;
        setTyped(i);
        if (i >= phrase.length) {
          if (!rotating || (!loop && index === list.length - 1)) return;
          deleting = true;
          timer.current = window.setTimeout(step, holdTime);
          return;
        }
        // Organic rhythm: pause a touch after spaces and punctuation.
        const ch = phrase[i - 1];
        const pause = ch === ' ' ? speed * 2.4 : /[,&.]/.test(ch) ? speed * 4 : speed;
        timer.current = window.setTimeout(step, pause);
        return;
      }

      i -= 1;
      setTyped(i);
      if (i <= 0) {
        deleting = false;
        index = (index + 1) % list.length;
        setCurrent(index);
        timer.current = window.setTimeout(step, 320);
        return;
      }
      timer.current = window.setTimeout(step, deleteSpeed);
    };

    const begin = () => {
      if (cancelled || startedRef.current) return;
      index = 0;
      i = 0;
      deleting = false;
      setCurrent(0);
      setTyped(0);
      startedRef.current = true;
      setStarted(true);
      timer.current = window.setTimeout(step, startDelay);
    };

    // Wait for the intro loader to hand over (when it ran this session).
    const state = document.documentElement.dataset.intro;
    let wait: number | null = null;
    if (state === 'running') {
      wait = window.setInterval(() => {
        const now = document.documentElement.dataset.intro;
        if (now === 'done' || !now) {
          if (wait) window.clearInterval(wait);
          wait = null;
          begin();
        }
      }, 100);
    } else {
      begin();
    }

    // Safety: if the loader never signals (blocked script, slow device), start
    // anyway rather than leaving an empty line on screen.
    const failsafe = window.setTimeout(() => {
      if (!startedRef.current) begin();
    }, 3200);

    return () => {
      window.clearTimeout(failsafe);
      cancelled = true;
      clear();
      if (wait) window.clearInterval(wait);
    };
  }, [full, speed, deleteSpeed, holdTime, startDelay, rotating, loop]); // eslint-disable-line react-hooks/exhaustive-deps

  const phrase = list[current] ?? '';
  const shown = started ? phrase.slice(0, Math.min(typed, phrase.length)) : '';

  return (
    <span className={`typewriter ${className}`} data-started={started}>
      {/* Real text for assistive tech and no-JS: the whole list, unanimated. */}
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">{shown}</span>
      {caret ? (
        <span className="caret" data-done={!rotating && typed >= phrase.length} aria-hidden="true" />
      ) : null}
    </span>
  );
}
