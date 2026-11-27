'use client';

import { useRef, useState } from 'react';

/**
 * Drop-in image uploader. Calls /api/upload and hands the public URL back to
 * the parent form field.
 */
export default function Uploader({
  onUploaded,
  label = 'Upload image',
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Upload failed.');
        return;
      }
      onUploaded(data.url as string);
    } catch {
      setError('Network error during upload.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          className="a-btn a-btn--sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Uploading…' : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handle(e.target.files?.[0])}
        />
        <span className="hint" style={{ fontSize: '0.6875rem', color: 'var(--a-muted)' }}>
          JPEG · PNG · WebP · SVG · max 6 MB
        </span>
      </div>
      {error ? <span style={{ fontSize: '0.6875rem', color: 'var(--a-err)' }}>{error}</span> : null}
    </div>
  );
}
