import Link from 'next/link';
import { getAllProjects } from '../../../lib/queries';
import RowAction from '../../../components/admin/RowActions';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <div className="a-topbar">
        <div>
          <span className="a-crumb">Dashboard / Projects</span>
          <h1 className="a-title">Projects ({projects.length})</h1>
        </div>
        <div className="a-topbar-actions">
          <Link href="/admin/projects/new" className="a-btn a-btn--primary">
            + New project
          </Link>
        </div>
      </div>

      <div className="a-panel">
        <div className="a-panel-head">
          <h2>All projects</h2>
          <span style={{ color: 'var(--a-muted)', fontSize: '0.75rem' }}>
            Order controls the sequence on the public site.
          </span>
        </div>
        <div className="a-panel-body a-panel-body--flush">
          {projects.length ? (
            <table className="a-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Project</th>
                  <th>Categories</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--a-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                      {String(i + 1).padStart(2, '0')}
                    </td>
                    <td>
                      <span className="cell-title">
                        {p.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="thumb-xs" src={p.cover_image_url} alt="" />
                        ) : null}
                        <span>
                          {p.title}
                          <span style={{ display: 'block', color: 'var(--a-muted)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                            /{p.slug}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--a-muted)' }}>{p.categories.join(', ') || p.category || '—'}</td>
                    <td style={{ color: 'var(--a-muted)' }}>{p.year || '—'}</td>
                    <td>
                      <span className={`a-pill ${p.status === 'published' ? 'a-pill--live' : 'a-pill--draft'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="a-row-actions" style={{ alignItems: 'center' }}>
                        <RowAction op="moveProject" payload={{ id: p.id, dir: 'up' }} label="↑" variant="ghost" />
                        <RowAction op="moveProject" payload={{ id: p.id, dir: 'down' }} label="↓" variant="ghost" />
                        <RowAction
                          op="toggleProject"
                          payload={{ id: p.id, next: p.status === 'published' ? 'draft' : 'published' }}
                          label={p.status === 'published' ? 'Unpublish' : 'Publish'}
                        />
                        <RowAction op="duplicateProject" payload={{ id: p.id }} label="Copy" variant="ghost" />
                        <Link href={`/admin/projects/${p.id}`} className="a-btn a-btn--sm">
                          Edit
                        </Link>
                        <RowAction
                          op="deleteProject"
                          payload={{ id: p.id }}
                          label="Delete"
                          variant="danger"
                          confirmText={`Delete "${p.title}"? This cannot be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="a-empty">
              No projects yet. <Link href="/admin/projects/new">Add your first project →</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
