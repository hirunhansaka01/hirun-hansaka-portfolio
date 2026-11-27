'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Theme, ThemeTokens } from '../../lib/types';

type Ctx = { theme: Theme; toggle: (e: React.MouseEvent<HTMLElement>) => void };
const ThemeCtx = createContext<Ctx>({ theme: 'dark', toggle: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

/** Applies admin-configured token overrides on top of the CSS defaults. */
export function TokenStyle({ tokens }: { tokens: ThemeTokens | null }) {
  if (!tokens) return null;
  const map: Record<string, string> = {
    bg: 'bg',
    bgElevated: 'bg-elevated',
    fg: 'fg',
    fgMuted: 'fg-muted',
    line: 'line',
    accent: 'accent',
    accentFg: 'accent-fg',
    card: 'card',
  };
  const build = (mode: 'dark' | 'light') => {
    const group = tokens[mode];
    if (!group) return '';
    const decls = Object.entries(group)
      .filter(([, v]) => typeof v === 'string' && v)
      .map(([k, v]) => `--${map[k] ?? k}: ${v};`)
      .join('');
    if (!decls) return '';
    return mode === 'light' ? `html[data-theme='light']{${decls}}` : `:root{${decls}}`;
  };
  const css = `${build('dark')}\n${build('light')}`;
  if (!css.trim()) return null;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

export default function ThemeProvider({
  defaultTheme,
  tokens,
  children,
}: {
  defaultTheme: Theme;
  tokens: ThemeTokens | null;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('hh-theme') as Theme | null;
    const next = stored === 'light' || stored === 'dark' ? stored : defaultTheme;
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, [defaultTheme]);

  const toggle = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (busy.current) return;
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
      const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

      const commit = () => {
        document.documentElement.dataset.theme = next;
        setTheme(next);
        window.localStorage.setItem('hh-theme', next);
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', next === 'dark' ? '#0B0B0B' : '#F5F5F2');
      };

      if (reduce || !overlayRef.current) {
        commit();
        return;
      }

      busy.current = true;
      const overlay = overlayRef.current;
      overlay.style.setProperty('--ink-x', `${x}%`);
      overlay.style.setProperty('--ink-y', `${y}%`);
      overlay.style.setProperty(
        '--ink-color',
        next === 'dark' ? '#0B0B0B' : '#F5F5F2'
      );
      overlay.dataset.active = 'true';

      window.setTimeout(() => {
        commit();
        window.setTimeout(() => {
          overlay.dataset.active = 'false';
          window.setTimeout(() => {
            busy.current = false;
          }, 320);
        }, 120);
      }, 260);
    },
    [theme]
  );

  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <TokenStyle tokens={tokens} />
      <div className="ink-overlay" ref={overlayRef} aria-hidden="true" />
      {children}
    </ThemeCtx.Provider>
  );
}
