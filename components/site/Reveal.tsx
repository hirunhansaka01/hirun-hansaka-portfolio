'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  style,
  id,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const Component = Tag as ElementType;
  return (
    <Component
      id={id}
      ref={ref as never}
      className={`reveal ${className}`}
      data-shown={shown}
      style={{ ['--reveal-delay' as string]: `${delay}ms`, ...style }}
    >
      {children}
    </Component>
  );
}
