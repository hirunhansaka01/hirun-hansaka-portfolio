'use client';

import { useEffect } from 'react';

/**
 * Global scroll choreography, mounted once per page:
 *
 *  - `.reveal` elements get a data attribute when they hold the middle of the
 *    viewport, so CSS can scale/soften elements on their way in and out.
 *  - `[data-scrub]` words/lines animate from a muted wash to full ink as they
 *    cross the read line (used by the About + Contact headlines).
 *  - `--scroll-y` (page offset) and `--progress` (0–1) on <html> feed CSS
 *    parallax, the header rule and the section counters.
 *
 * Everything is rAF-throttled, respects prefers-reduced-motion, and unobserve
 * objects as soon as they have played.
 */
export default function ScrollFX() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      root.dataset.motion = 'reduced';
      document.querySelectorAll('[data-scrub]').forEach((n) => n.setAttribute('data-in', 'true'));
      return;
    }
    root.dataset.motion = 'full';

    /* ---------- 1. scroll variables for CSS parallax ---------- */
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty('--scroll-y', String(y));
        root.style.setProperty('--progress', String(max > 0 ? Math.min(y / max, 1) : 0));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /* ---------- 2. reveal + scrub observers ---------- */
    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.in = 'true';
          else if (e.boundingClientRect.top > 0) el.removeAttribute('data-in'); // replay on scroll back up
        });
      },
      { rootMargin: '-8% 0px -14% 0px', threshold: 0.05 }
    );

    // Staggered card entrance (each card carries --i for its delay).
    const growIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) el.dataset.grow = 'true';
          else if (e.boundingClientRect.top > 0) el.removeAttribute('data-grow');
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
    );

    const scrubIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          (e.target as HTMLElement).dataset.in = e.isIntersecting ? 'true' : 'false';
        });
      },
      { rootMargin: '0px 0px -35% 0px', threshold: 0.01 }
    );

    const scan = () => {
      document.querySelectorAll('.reveal').forEach((n) => revealIO.observe(n));
      document.querySelectorAll('[data-scrub]').forEach((n) => scrubIO.observe(n));
      document.querySelectorAll('[data-grow]').forEach((n) => growIO.observe(n));
    };
    scan();
    // content mounted by client components (project grid, filters) lands later
    const late = window.setTimeout(scan, 600);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.clearTimeout(late);
      if (frame) window.cancelAnimationFrame(frame);
      revealIO.disconnect();
      scrubIO.disconnect();
      growIO.disconnect();
    };
  }, []);

  return null;
}
