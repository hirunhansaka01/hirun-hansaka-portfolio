import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0B0B0B',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', letterSpacing: '0.2em', color: '#FF6300' }}>
          404
        </span>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(2.5rem, 8vw, 6rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            margin: '1rem 0',
            textTransform: 'uppercase',
          }}
        >
          This page
          <br />
          isn&rsquo;t here.
        </h1>
        <p style={{ color: '#929292', maxWidth: '34ch', margin: '0 auto 2rem' }}>
          The link may be old, or the project may have been moved. Let&rsquo;s get you back.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.8rem 1.6rem',
            border: '1px solid #FF6300',
            color: '#FF6300',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
