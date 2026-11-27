'use client';

import { useEffect } from 'react';

/**
 * Single source of scroll choreography (mounted once, in the root layout).
 *
 *  - Sets `html[data-fx='on']` so CSS only hides things it can animate. If this
 *    script never runs, every section is simply visible — no stuck-invisible page.
 *  - `--scroll-y` / `--progress` feed the progress rail and any CSS parallax.
 *  - `.reveal` / `[data-grow]` / `[data-scrub]` observers, re-scanned when new
 *    nodes appear (filtered grids, pagination).
 *
 * Everything is rAF-throttled and disabled under prefers-reduced-motion.
 */
export default function ScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Fades and re-traces always run; only the moving parts are dropped when the
    // visitor asks for reduced motion. This way the page never looks "stuck".
    root.dataset.fx = 'on';
    const applyMotion = () => {
      root.dataset.motion = reduce.matches ? 'reduced' : 'full';
    };
    applyMotion();
    reduce.addEventListener?.('change', applyMotion);

    /* ---------- scroll variables ---------- */
    let frame = 0;
    const paint = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.style.setProperty('--scroll-y', String(y));
      root.style.setProperty('--progress', String(max > 0 ? Math.min(y / max, 1) : 0));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /* ---------- observers ---------- */
    const revealIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.shown = 'true';
          else if (e.boundingClientRect.top > 0) delete el.dataset.shown; // replay on the way back up
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    const growIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.grow = 'true';
          else if (e.boundingClientRect.top > 0) delete el.dataset.grow;
        }),
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );

    const scrubIO = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          (e.target as HTMLElement).dataset.in = e.isIntersecting ? 'true' : 'false';
        }),
      { rootMargin: '0px 0px -30% 0px', threshold: 0.01 }
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll('.reveal').forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        revealIO.observe(n);
      });
      document.querySelectorAll('[data-grow]').forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        growIO.observe(n);
      });
      document.querySelectorAll('[data-scrub]').forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        scrubIO.observe(n);
      });
    };

    scan();
    // client components (filters, "view more") mount later — rescan a few times
    const timers = [120, 400, 900, 1800].map((t) => window.setTimeout(scan, t));
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      timers.forEach((t) => window.clearTimeout(t));
      mo.disconnect();
      revealIO.disconnect();
      growIO.disconnect();
      scrubIO.disconnect();
      reduce.removeEventListener?.('change', applyMotion);
      delete root.dataset.fx;
    };
  }, []);

  return null;
}
