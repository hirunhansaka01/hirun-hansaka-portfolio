'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project, ProjectImage } from '../../lib/types';
import ProjectModal from './ProjectModal';

const INITIAL_COUNT = 6;
const STEP = 6;
// Uniform two-column rhythm — every card shares the same height so rows align.
const SIZES = ['card--half', 'card--half', 'card--half', 'card--half', 'card--half', 'card--half'];

function ArrowUpRight() {
  return (
    <svg className="project-arrow" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 12L12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.3" fill="none" />
    </svg>
  );
}

export default function WorkGrid({
  projects,
  images,
}: {
  projects: Project[];
  images: Record<string, ProjectImage[]>;
}) {
  const [filter, setFilter] = useState('All');
  const [visible, setVisible] = useState(INITIAL_COUNT);
  const [index, setIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set).slice(0, 8)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter((p) => p.categories.includes(filter) || p.category === filter);
  }, [projects, filter]);

  const list = useMemo(
    () => filtered.map((p) => ({ project: p, images: images[p.id] ?? [] })),
    [filtered, images]
  );

  const shown = list.slice(0, visible);

  if (!projects.length) {
    return (
      <div className="lab-card lab-card--text" style={{ padding: '2.5rem', borderStyle: 'dashed' }}>
        <div className="lab-body" style={{ borderTop: 0, padding: 0 }}>
          <span className="eyebrow eyebrow--muted">No projects yet</span>
          <p className="lab-desc" style={{ maxWidth: '46ch', marginTop: '0.6rem' }}>
            Add your first project from the admin dashboard — it will appear here instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {categories.length > 1 && (
        <div
          className="filters"
          role="group"
          aria-label="Filter projects by category"
          style={{ marginBottom: '2.5rem' }}
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={filter === c}
              onClick={() => {
                setFilter(c);
                setVisible(INITIAL_COUNT);
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="work-grid">
        {shown.map((entry, i) => {
          const p = entry.project;
          const size = SIZES[i % SIZES.length];
          return (
            <button
              key={p.id}
              type="button"
              className={`project-card ${size}`}
              onClick={() => setIndex(i)}
              aria-label={`Open ${p.title}`}
            >
              <div className="project-thumb">
                {p.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover_image_url} alt={`${p.title} preview`} loading="lazy" />
                ) : (
                  <div className="thumb-fallback">{p.title}</div>
                )}
                {p.category ? <span className="project-badge">{p.category}</span> : null}
              </div>
              <div className="project-info">
                <div>
                  <div className="meta" style={{ marginBottom: '0.4rem' }}>
                    {p.categories.length ? p.categories.join(' / ') : p.category || 'Project'}
                    {p.year ? ` — ${p.year}` : ''}
                  </div>
                  <h3 className="project-title">{p.title}</h3>
                  {p.short_description ? (
                    <p
                      className="body-muted"
                      style={{ margin: '0.4rem 0 0', fontSize: 'var(--step--1)', maxWidth: '42ch' }}
                    >
                      {p.short_description}
                    </p>
                  ) : null}
                </div>
                <ArrowUpRight />
              </div>
            </button>
          );
        })}
      </div>

      {list.length > visible && (
        <div className="view-more-row">
          <button type="button" className="btn" onClick={() => setVisible((v) => v + STEP)}>
            View more projects
            <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 1v10M2 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" fill="none" />
            </svg>
          </button>
          <span className="count-hint">
            Showing {shown.length} of {list.length}
          </span>
        </div>
      )}

      {list.length > INITIAL_COUNT && list.length <= visible && (
        <div className="view-more-row">
          <Link href="/work" className="btn">
            Open the full archive
          </Link>
          <span className="count-hint">That&rsquo;s all {list.length} projects here</span>
        </div>
      )}

      {index !== null && list[index] ? (
        <ProjectModal list={list} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
      ) : null}
    </>
  );
}
