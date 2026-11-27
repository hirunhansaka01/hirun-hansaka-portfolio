'use client';

import type { SocialLink } from '../../lib/types';

export default function SiteFooter({
  wordmark,
  tagline,
  note,
  socials,
}: {
  wordmark: string;
  tagline: string;
  note: string | null;
  socials: SocialLink[];
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div>
            <h2 className="footer-wordmark">{wordmark}</h2>
            <p className="footer-tagline">{tagline}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '12rem' }}>
            <div className="social-row">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target={s.url.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="link-arrow"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="link-arrow"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ alignSelf: 'flex-start' }}
            >
              Back to top ↑
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} {wordmark}
          </span>
          {note ? <span>{note}</span> : null}
          <span>All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}
