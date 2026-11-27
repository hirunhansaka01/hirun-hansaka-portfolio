'use client';

import { useState } from 'react';
import { adminMutate } from './api';

export default function MailTest({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
      {note ? (
        <span className={`a-notice ${note.ok ? 'a-notice--ok' : 'a-notice--err'}`} style={{ fontSize: '0.75rem' }}>
          {note.message}
        </span>
      ) : null}
      <button
        type="button"
        className="a-btn a-btn--sm"
        disabled={busy || !enabled}
        onClick={async () => {
          setBusy(true);
          const result = await adminMutate('testMail', {});
          setBusy(false);
          setNote({ ok: Boolean(result.ok), message: result.message || 'Done.' });
        }}
      >
        {busy ? 'Sending…' : 'Send test email'}
      </button>
    </div>
  );
}
