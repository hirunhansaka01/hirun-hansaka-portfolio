'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';

const LINKS = [
  { href: '/#top', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/#about', label: 'About' },
  { href: '/#services', label: 'Services' },
  { href: '/#lab', label: 'Lab' },
  { href: '/#contact', label: 'Contact' },
];

export default function SiteHeader({ wordmark, ownerName }: { wordmark: string; ownerName: string }) {
  const { theme, toggle } = useTheme();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  return (
    <>
      <header className="site-header" data-stuck={stuck}>
        <div className="shell header-inner">
          <Link href="/#top" className="wordmark" aria-label={`${ownerName} — home`}>
            <span className="dot" aria-hidden="true" />
            {wordmark}
          </Link>

          <nav className="nav" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-link">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              data-theme={theme}
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              <span className="orb" aria-hidden="true" />
              <span className="label">{theme}</span>
            </button>

            <button
              type="button"
              className="menu-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-sheet" data-open={open} aria-hidden={!open}>
        {LINKS.map((l, i) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
            <span>{String(i + 1).padStart(2, '0')}</span>
          </Link>
        ))}
        <div style={{ marginTop: 'auto' }} className="meta">
          {ownerName} — portfolio
        </div>
      </div>
    </>
  );
}
