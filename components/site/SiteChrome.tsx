'use client';

import { usePathname } from 'next/navigation';
import Loader from './Loader';
import ScrollFX from './ScrollFX';

/**
 * Site-wide chrome: the intro loader and the scroll engine, mounted once in the
 * root layout so every public route gets them (the loader used to live only on
 * the homepage, which is why /work never showed it).
 */
export default function SiteChrome({ name }: { name: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <Loader name={name} />
      <ScrollFX />
      <div className="scroll-rail" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
