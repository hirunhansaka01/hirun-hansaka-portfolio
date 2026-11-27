'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

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

  /* The sequence runs on every hard page load (previously it was session-cached,
     so a reload in the same tab showed nothing — that is why it looked broken).
     Reduced-motion visitors still get the loader, just without the moving parts. */
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setShow(false);
      setDone(true);
      document.documentElement.dataset.intro = 'done';
      return;
    }
    startedRef.current = performance.now();
    document.documentElement.dataset.intro = 'running';
    setShow(true);
    setDone(false);
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

      const minimum = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1100 : 1900;
      if (ready && elapsed > minimum) {
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
        // Hand over: the curtain takes 900ms, so the hero entrance starts as
        // soon as the page behind it is exposed.
        document.documentElement.dataset.intro = 'done';
        window.setTimeout(() => {
          setShow(false);
          delete document.documentElement.dataset.intro;
        }, 1200);
      }, 260);
    }

    const bail = window.setTimeout(finish, 5000);

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
