import Link from 'next/link';
import { getDashboardStats, getActivity, getMessages, getAllProjects } from '../../lib/queries';

export const dynamic = 'force-dynamic';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function AdminOverview() {
  const [stats, activity, messages, projects] = await Promise.all([
    getDashboardStats(),
    getActivity(8),
    getMessages('unread'),
    getAllProjects(),
  ]);

  const recentProjects = projects.slice(0, 5);

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Overview</span>
          <h1 className="a-title">Overview</h1>
        </div>
        <div className="a-topbar-actions">
          <Link href="/admin/projects/new" className="a-btn a-btn--primary">
            + New project
          </Link>
          <a href="/" target="_blank" rel="noreferrer" className="a-btn">
            View site ↗
          </a>
        </div>
      </div>

      <div className="a-stats">
        <div className="a-stat">
          <div className="k">Total projects</div>
          <div className="v">{stats.total}</div>
        </div>
        <div className="a-stat">
          <div className="k">Published</div>
          <div className="v">{stats.published}</div>
        </div>
        <div className="a-stat">
          <div className="k">Drafts</div>
          <div className="v">{stats.drafts}</div>
        </div>
        <div className={`a-stat ${stats.unread > 0 ? 'a-stat--accent' : ''}`}>
          <div className="k">Unread messages</div>
          <div className="v">
            {stats.unread}
            {stats.read ? <small>{stats.read} read</small> : null}
          </div>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-head">
          <h2>Recent projects</h2>
          <Link href="/admin/projects" className="a-btn a-btn--sm">
            Manage all
          </Link>
        </div>
        <div className="a-panel-body a-panel-body--flush">
          {recentProjects.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="cell-title">
                        {p.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="thumb-xs" src={p.cover_image_url} alt="" />
                        ) : null}
                        {p.title}
                      </span>
                    </td>
                    <td>{p.category || p.categories[0] || '—'}</td>
                    <td>
                      <span className={`a-pill ${p.status === 'published' ? 'a-pill--live' : 'a-pill--draft'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--a-muted)' }}>{timeAgo(p.updated_at)}</td>
                    <td className="a-row-actions">
                      <Link href={`/admin/projects/${p.id}`} className="a-btn a-btn--sm">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">
              No projects yet. <Link href="/admin/projects/new">Create your first project →</Link>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: '1.25rem' }} className="a-ov-grid">
        <div className="a-panel" style={{ margin: 0 }}>
          <div className="a-panel-head">
            <h2>Recent activity</h2>
          </div>
          <div className="a-panel-body">
            {activity.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activity.map((a) => (
                  <li key={a.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', fontSize: '0.8125rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--a-accent)', flex: 'none', marginTop: '0.4rem' }} />
                    <span style={{ flex: 1 }}>{a.action}</span>
                    <span style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--a-muted)', margin: 0 }}>Activity will appear here as you edit the site.</p>
            )}
          </div>
        </div>

        <div className="a-panel" style={{ margin: 0 }}>
          <div className="a-panel-head">
            <h2>Newest messages</h2>
            <Link href="/admin/messages" className="a-btn a-btn--sm">
              Inbox
            </Link>
          </div>
          <div className="a-panel-body">
            {messages.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.slice(0, 4).map((m) => (
                  <li key={m.id} style={{ borderBottom: '1px solid var(--a-line-soft)', paddingBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.8125rem' }}>{m.name}</strong>
                      <span style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>
                        {timeAgo(m.created_at)}
                      </span>
                    </div>
                    <div style={{ color: 'var(--a-muted)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {(m.subject || m.message).slice(0, 70)}
                      {(m.subject || m.message).length > 70 ? '…' : ''}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--a-muted)', margin: 0 }}>Inbox is empty. Nice and quiet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .a-ov-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}
