import type { ReactNode } from 'react';

/**
 * Splits a heading into words that light up one-by-one as the block scrolls
 * into the read line. Pure markup — the observer lives in <ScrollFX />.
 * Keeps the plain text in an aria-label so screen readers read one sentence.
 */
export default function ScrubText({ text, className }: { text: string; className?: string }): ReactNode {
  const words = (text || '').split(/\s+/).filter(Boolean);
  return (
    <span data-scrub className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="scrub-word" style={{ ['--w' as string]: i }} aria-hidden="true">
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </span>
  );
}
