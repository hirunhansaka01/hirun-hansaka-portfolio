'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'hh-intro-seen';

/**
 * First-visit loading sequence.
 *
 * A letter-by-letter wordmark, an orbit ring, a real document-progress counter
 * and a percentage bar — then two curtains split vertically to hand the page
 * over to the hero (which plays its own entrance animation, driven by the
 * `data-intro` attribute on <html>).
 *
 * Shows once per browsing session. Reduced-motion visitors skip it entirely.
 */
export default function Loader({ name }: { name: string }) {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(0);

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

  useEffect(() => {
    if (!show) return;

    let raf = 0;
    let ready = false;
    let finishing = false;

    const tick = () => {
      const elapsed = performance.now() - startedRef.current;
      const cap = ready ? 100 : 86;
      setProgress((p) => Math.min(p + Math.max(0.9, (cap - p) * 0.075), cap));

      if (ready && elapsed > 1800) {
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
    }, 2400);

    raf = window.requestAnimationFrame(tick);

    function finish() {
      if (finishing) return;
      finishing = true;
      window.cancelAnimationFrame(raf);
      setProgress(100);
      window.setTimeout(() => {
        setDone(true);
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          /* ignore */
        }
        // Hand over: the curtain takes 900ms, so the hero entrance starts as
        // soon as the page behind it is exposed.
        document.documentElement.dataset.intro = 'done';
        window.setTimeout(() => {
          setShow(false);
          delete document.documentElement.dataset.intro;
        }, 1500);
      }, 260);
    }

    const bail = window.setTimeout(finish, 5500);

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
  const pct = Math.round(progress);

  return (
    <div className="loader" data-done={done} role="status" aria-live="polite" aria-label="Loading the portfolio">
      {/* curtains: split vertically to reveal the page */}
      <div className="loader-curtain loader-curtain--top" aria-hidden="true" />
      <div className="loader-curtain loader-curtain--bottom" aria-hidden="true" />
      <div className="loader-ink" aria-hidden="true" />

      <div className="loader-inner">
        <div className="loader-top">
          <span>Portfolio — {new Date().getFullYear()}</span>
          <span>Sri Lanka</span>
        </div>

        <div className="loader-center">
          <span className="loader-orbit" aria-hidden="true" />
          <h1 className="loader-name" aria-hidden="true">
            {letters.map((ch, i) =>
              ch === ' ' ? (
                <span key={`s-${i}`} className="is-space" />
              ) : (
                <span key={i} className="loader-letter" style={{ animationDelay: `${90 + i * 38}ms` }}>
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
            <span>{pct < 100 ? 'Preparing the canvas' : 'Ready'}</span>
            <span className="loader-count">
              <span className="loader-count-num">{String(pct).padStart(3, '0')}</span>
              <span className="loader-count-sym">%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
