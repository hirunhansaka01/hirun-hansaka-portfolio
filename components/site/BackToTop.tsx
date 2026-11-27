'use client';

import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';

const ACCENT = '#FF6300';

/**
 * Floating "go to top" control. Appears once the page has been scrolled past
 * ~60vh, and shows reading progress as a ring around the button.
 */
export default function BackToTop() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const ratio = scrollable > 0 ? Math.min(y / scrollable, 1) : 0;
      setProgress(ratio);
      setVisible(y > window.innerHeight * 0.6);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const R = 21;
  const C = 2 * Math.PI * R;

  return (
    <button
      type="button"
      className="to-top"
      data-visible={visible}
      aria-label="Go to top of page"
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      }}
    >
      <svg className="to-top-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke={ACCENT}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <svg className="to-top-arrow" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
      <span className="sr-only">{theme === 'dark' ? 'Back to top' : 'Back to top'}</span>
    </button>
  );
}
