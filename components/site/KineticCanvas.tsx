'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Interactive "digital canvas" sculpture: layered planes that respond to
 * pointer movement with a subtle parallax. Pure SVG + transform, no WebGL,
 * so it stays cheap on mobile.
 */
export default function KineticCanvas({
  label,
  year,
}: {
  label: string;
  year: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = root.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    root.style.setProperty('--px', String(px));
    root.style.setProperty('--py', String(py));
    const l1 = root.querySelector<SVGGElement>('#layer-a');
    const l2 = root.querySelector<SVGGElement>('#layer-b');
    const l3 = root.querySelector<SVGGElement>('#layer-c');
    if (l1) l1.style.transform = `translate(${px * 14}px, ${py * 14}px) rotate(${px * 5}deg)`;
    if (l2) l2.style.transform = `translate(${px * -22}px, ${py * -18}px) rotate(${-px * 7}deg)`;
    if (l3) l3.style.transform = `translate(${px * 34}px, ${py * 26}px)`;
  }, []);

  const onLeave = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    ['#layer-a', '#layer-b', '#layer-c'].forEach((sel) => {
      const el = root.querySelector<SVGGElement>(sel);
      if (el) el.style.transform = '';
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let t = 0;
    const spin = () => {
      t += 0.0022;
      const ring = root.querySelector<SVGGElement>('#layer-spin');
      if (ring) ring.style.transform = `rotate(${(t * 180) / Math.PI}deg)`;
      raf = requestAnimationFrame(spin);
    };
    raf = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="canvas-frame" ref={rootRef} onPointerMove={onMove} onPointerLeave={onLeave}>
      <svg viewBox="0 0 360 450" role="img" aria-label="Abstract digital canvas composition">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g stroke="var(--fg)" strokeOpacity="0.12" strokeWidth="1">
          <line x1="0" y1="112" x2="360" y2="112" />
          <line x1="0" y1="225" x2="360" y2="225" />
          <line x1="0" y1="338" x2="360" y2="338" />
          <line x1="90" y1="0" x2="90" y2="450" />
          <line x1="180" y1="0" x2="180" y2="450" />
          <line x1="270" y1="0" x2="270" y2="450" />
        </g>

        <rect x="46" y="46" width="268" height="358" fill="none" stroke="var(--fg)" strokeOpacity="0.28" />

        <g id="layer-b" className="morph-shape">
          <polygon
            points="180,86 288,282 72,282"
            fill="url(#fade)"
            stroke="var(--fg)"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
        </g>

        <g id="layer-a" className="morph-shape">
          <circle cx="180" cy="216" r="104" fill="none" stroke="var(--fg)" strokeOpacity="0.5" />
        </g>

        <g id="layer-spin" className="morph-shape">
          <circle
            cx="180"
            cy="216"
            r="72"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeDasharray="5 6"
          />
        </g>

        <g id="layer-c" className="morph-shape">
          <line x1="180" y1="46" x2="180" y2="404" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.85" />
          <circle cx="180" cy="216" r="5" fill="var(--accent)" />
          <rect x="138" y="330" width="84" height="1" fill="var(--accent)" />
        </g>

        <text x="56" y="68" fill="var(--fg)" fillOpacity="0.5" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.6">
          CANVAS // 01
        </text>
        <text x="238" y="392" fill="var(--accent)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.6">
          SYS.ACTIVE
        </text>
      </svg>

      <div className="canvas-caption">
        <span>{label}</span>
        <span style={{ color: 'var(--accent)' }}>{year}</span>
      </div>
    </div>
  );
}
