'use client';

import { useEffect } from 'react';

/**
 * Hero-only motion: a gentle pointer parallax on the portrait plus a
 * scroll-linked drift, both written to CSS custom properties so the actual
 * movement stays in the stylesheet. Disabled for reduced-motion and on
 * coarse pointers (touch), where it would just cost frames.
 */
export default function HeroParallax() {
  useEffect(() => {
    const stage = document.querySelector<HTMLElement>('[data-hero-stage]');
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      raf = 0;
      stage.style.setProperty('--px', tx.toFixed(3));
      stage.style.setProperty('--py', ty.toFixed(3));
    };

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      tx = (e.clientX / w - 0.5) * 2;
      ty = (e.clientY / h - 0.5) * 2;
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
