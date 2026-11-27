import Link from 'next/link';
import { getMessages } from '../../../lib/queries';
import RowAction from '../../../components/admin/RowActions';

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
  const messages = await getMessages(status);

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
                    <a
                      className="a-btn a-btn--sm a-btn--ghost"
                      href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'Your message')}`}
                    >
                      Reply by email
                    </a>
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
