'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'hh-intro-seen';

/**
 * First-visit loading sequence: animated wordmark + real document progress.
 * Shows once per browsing session, then hands over to a short reveal of the
 * page content (see `data-intro` on <html>, used by the CSS reveal rules).
 */
export default function Loader({ name }: { name: string }) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(8);
  const [seconds, setSeconds] = useState(0);
  const startedRef = useRef(0);

  // Only on the first entry of a session, and never on the dashboard.
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setShow(false);
      setDone(true);
      return;
    }
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      seen = false;
    }
    // The inline boot script already decided; honour it so there is no flash.
    if (seen || document.documentElement.dataset.intro === 'skip') {
      setShow(false);
      setDone(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        /* ignore */
      }
      setShow(false);
      setDone(true);
      return;
    }
    startedRef.current = performance.now();
    setShow(true);
    document.documentElement.dataset.intro = 'running';
  }, [pathname]);

  // Progress: follows document readiness, never stalls, always finishes.
  useEffect(() => {
    if (!show) return;

    let raf = 0;
    let ready = false;

    const tick = () => {
      const elapsed = performance.now() - startedRef.current;
      setSeconds(elapsed / 1000);

      const cap = ready ? 100 : 88;
      setProgress((p) => {
        const next = Math.min(p + Math.max(0.5, (cap - p) * 0.08), cap);
        return next;
      });

      if (ready && elapsed > 2100) {
        finish();
        return;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onLoad = () => {
      ready = true;
    };
    if (document.readyState === 'complete') ready = true;
    else window.addEventListener('load', onLoad, { once: true });

    const safety = window.setTimeout(() => {
      ready = true;
    }, 2600);

    raf = window.requestAnimationFrame(tick);

    function finish() {
      window.cancelAnimationFrame(raf);
      setProgress(100);
      window.setTimeout(() => {
        setDone(true);
        setShow(false);
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* ignore */
        }
        document.documentElement.dataset.intro = 'done';
        window.setTimeout(() => {
          delete document.documentElement.dataset.intro;
        }, 1400);
      }, 320);
    }

    // Hard ceiling so a slow DOM can never trap the visitor.
    const bail = window.setTimeout(finish, 6000);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('load', onLoad);
      window.clearTimeout(safety);
      window.clearTimeout(bail);
    };
  }, [show]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', show && !done);
    return () => document.body.classList.remove('no-scroll');
  }, [show, done]);

  if (!show) return null;

  const letters = (name || 'Hirun Hansaka').toUpperCase().split('');

  return (
    <div className="loader" data-done={done} role="status" aria-live="polite" aria-label="Loading the portfolio">
      <div className="loader-ink" aria-hidden="true" />

      <div className="loader-top">
        <span>Portfolio — {new Date().getFullYear()}</span>
        <span>Sri Lanka</span>
      </div>

      <div className="loader-center">
        <h1 className="loader-name" aria-hidden="true">
          {letters.map((ch, i) =>
            ch === ' ' ? (
              <span key={`s-${i}`} className="is-space" />
            ) : (
              <span key={i} style={{ animationDelay: `${120 + i * 42}ms` }}>
                {ch}
              </span>
            )
          )}
        </h1>
        <span className="loader-tagline">The Digital Canvas</span>
      </div>

      <div className="loader-foot">
        <div className="loader-bar">
          <span style={{ ['--p' as string]: `${progress}%` }} />
        </div>
        <div className="loader-meta">
          <span>{progress < 100 ? 'Preparing the canvas' : 'Ready'}</span>
          <span>
            {String(Math.round(progress)).padStart(3, '0')}%
            <span style={{ marginLeft: '1rem', opacity: 0.6 }}>{seconds.toFixed(1)}s</span>
          </span>
        </div>
      </div>
    </div>
  );
}
