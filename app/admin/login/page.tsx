'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Unable to sign in.');
        setBusy(false);
        return;
      }
      router.push(next.startsWith('/admin') ? next : '/admin');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div className="admin-root" style={{ display: 'block', background: '#0B0B0B' }}>
      <div className="a-login-wrap">
        <div className="a-login-side">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#8b8b8b' }}>
            Hirun Hansaka — admin
          </div>
          <div>
            <h1>
              THE
              <br />
              CONTROL
              <br />
              <span>ROOM.</span>
            </h1>
            <p style={{ color: '#8b8b8b', maxWidth: '32ch', marginTop: '1.5rem', lineHeight: 1.6 }}>
              Private workspace for projects, content, messages and site identity.
            </p>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5b5b5b' }}>
            Authorised access only
          </div>
        </div>

        <div className="a-login-card">
          <form className="a-login-box a-form" onSubmit={submit}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#FF6300' }}>
                Sign in
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0.5rem 0 0', letterSpacing: '-0.02em', color: '#fff' }}>
                Admin dashboard
              </h2>
            </div>

            <div className="a-field">
              <label htmlFor="email" style={{ color: '#8b8b8b' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="a-field">
              <label htmlFor="password" style={{ color: '#8b8b8b' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? (
              <div className="a-notice a-notice--err" role="alert">
                {error}
              </div>
            ) : null}

            <button type="submit" className="a-login-btn" disabled={busy}>
              {busy ? 'Checking…' : 'Enter dashboard'}
            </button>

            <a href="/" style={{ fontSize: '0.75rem', color: '#6f6f6f', textAlign: 'center', marginTop: '0.5rem' }}>
              ← Back to the website
            </a>
          </form>
        </div>
      </div>
    </div>
  );
}
