import Link from 'next/link';
import { getInbox } from '../../../lib/queries';
import RowAction from '../../../components/admin/RowActions';
import ReplyComposer from '../../../components/admin/ReplyComposer';
import MailTest from '../../../components/admin/MailTest';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'archived', label: 'Archived' },
];

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = 'all' } = await searchParams;
  const { messages, replies } = await getInbox(status);
  const mailReady = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Messages</span>
          <h1 className="a-title">Inbox</h1>
        </div>
        <div className="a-topbar-actions">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === 'all' ? '/admin/messages' : `/admin/messages?status=${t.key}`}
              className="a-btn a-btn--sm"
              style={
                status === t.key
                  ? { background: 'var(--a-ink)', color: '#fff', borderColor: 'var(--a-ink)' }
                  : undefined
              }
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="a-panel" style={{ marginBottom: '1rem' }}>
        <div className="a-panel-head">
          <h2>Email sending</h2>
          <span className={`a-pill ${mailReady ? 'a-pill--live' : 'a-pill--draft'}`}>
            {mailReady ? 'Google SMTP connected' : 'Not configured'}
          </span>
        </div>
        <div className="a-panel-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--a-muted)', fontSize: '0.8125rem', maxWidth: '58ch' }}>
            {mailReady
              ? `Replies are sent from ${process.env.SMTP_USER}.`
              : 'Add SMTP_USER and SMTP_PASS (a Google App Password, not your normal password) in Vercel, then redeploy to reply by email.'}
          </span>
          <MailTest enabled={mailReady} />
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-head">
          <h2>{messages.length} message{messages.length === 1 ? '' : 's'}</h2>
          <span style={{ color: 'var(--a-muted)', fontSize: '0.75rem' }}>
            Sent from the public contact form
          </span>
        </div>
        <div className="a-panel-body a-panel-body--flush">
          {messages.length ? (
            <div>
              {messages.map((m) => (
                <article
                  key={m.id}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--a-line-soft)',
                    background: m.status === 'unread' ? '#FFFBF7' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.875rem' }}>{m.name}</strong>
                      <a href={`mailto:${m.email}`} style={{ color: 'var(--a-muted)', fontSize: '0.75rem' }}>
                        {m.email}
                      </a>
                      <span className={`a-pill a-pill--${m.status}`}>{m.status}</span>
                    </div>
                    <span style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>

                  {m.subject ? (
                    <div style={{ fontWeight: 500, marginTop: '0.45rem', fontSize: '0.8125rem' }}>{m.subject}</div>
                  ) : null}

                  <p style={{ margin: '0.4rem 0 0.75rem', color: '#3b3b36', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: '0.8125rem' }}>
                    {m.message}
                  </p>

                  <ReplyComposer
                    messageId={m.id}
                    to={m.email}
                    defaultSubject={m.subject ? `Re: ${m.subject}` : 'Re: your message'}
                    replies={replies[m.id] ?? []}
                    mailReady={mailReady}
                  />

                  <div className="a-actions">
                    {m.status !== 'read' ? (
                      <RowAction op="setMessageStatus" payload={{ id: m.id, status: 'read' }} label="Mark read" />
                    ) : null}
                    {m.status !== 'unread' ? (
                      <RowAction
                        op="setMessageStatus"
                        payload={{ id: m.id, status: 'unread' }}
                        label="Mark unread"
                        variant="ghost"
                      />
                    ) : null}
                    {m.status !== 'archived' ? (
                      <RowAction
                        op="setMessageStatus"
                        payload={{ id: m.id, status: 'archived' }}
                        label="Archive"
                        variant="ghost"
                      />
                    ) : null}
                    <RowAction
                      op="deleteMessage"
                      payload={{ id: m.id }}
                      label="Delete"
                      variant="danger"
                      confirmText="Delete this message?"
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="a-empty">No messages in this view.</div>
          )}
        </div>
      </div>
    </>
  );
}
