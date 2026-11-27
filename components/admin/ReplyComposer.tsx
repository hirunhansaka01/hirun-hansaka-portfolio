'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminMutate } from './api';

export type Reply = {
  id: string;
  body: string;
  subject: string | null;
  status: string;
  error: string | null;
  created_at: string;
};

const FIELD_NOTE: Record<string, string> = {
  sent: 'Sent',
  failed: 'Send failed',
  not_configured: 'Saved — email not configured',
};

export default function ReplyComposer({
  messageId,
  to,
  defaultSubject,
  replies,
  mailReady,
}: {
  messageId: string;
  to: string;
  defaultSubject: string;
  replies: Reply[];
  mailReady: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  async function send() {
    if (body.trim().length < 2) {
      setNotice({ ok: false, message: 'Write a reply first.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    const result = await adminMutate('sendReply', { messageId, body });
    setBusy(false);
    setNotice({ ok: Boolean(result.ok), message: result.message || 'Done.' });
    if (result.ok) {
      setBody('');
      router.refresh();
    } else {
      router.refresh(); // the reply is still saved on the thread
    }
  }

  return (
    <div className="a-reply">
      {replies.length ? (
        <ul className="a-thread">
          {replies.map((r) => (
            <li key={r.id} className={`a-thread-item a-thread-item--${r.status}`}>
              <div className="a-thread-head">
                <span className="a-thread-who">You replied</span>
                <span className="a-thread-when">
                  {new Date(r.created_at).toLocaleString()} · {FIELD_NOTE[r.status] ?? r.status}
                </span>
              </div>
              <p className="a-thread-body">{r.body}</p>
              {r.error ? <p className="a-thread-error">{r.error}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {!open ? (
        <button type="button" className="a-btn a-btn--sm" onClick={() => setOpen(true)}>
          {replies.length ? 'Reply again' : 'Reply'}
        </button>
      ) : (
        <div className="a-composer">
          <div className="a-composer-head">
            <span>
              To <strong>{to}</strong>
            </span>
            <button type="button" className="a-composer-close" onClick={() => setOpen(false)} aria-label="Close reply box">
              ×
            </button>
          </div>

          {!mailReady ? (
            <div className="a-notice a-notice--err" style={{ fontSize: '0.75rem' }}>
              SMTP is not configured. Add <code>SMTP_USER</code> and <code>SMTP_PASS</code> (Google App Password)
              in Vercel → Settings → Environment Variables, then redeploy. You can still draft here — replies are
              saved on the thread.
            </div>
          ) : null}

          <div className="a-field">
            <label htmlFor={`subject-${messageId}`}>Subject</label>
            <input id={`subject-${messageId}`} value={defaultSubject} readOnly />
          </div>

          <div className="a-field">
            <label htmlFor={`body-${messageId}`}>Message</label>
            <textarea
              id={`body-${messageId}`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="Hi, thanks for reaching out…"
              style={{ minHeight: '7rem' }}
            />
            <span className="hint">The original message is quoted automatically below your reply.</span>
          </div>

          {notice ? (
            <div className={`a-notice ${notice.ok ? 'a-notice--ok' : 'a-notice--err'}`} role="status">
              {notice.message}
            </div>
          ) : null}

          <div className="a-actions">
            <button type="button" className="a-btn a-btn--primary" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Send reply'}
            </button>
            <button type="button" className="a-btn a-btn--ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
