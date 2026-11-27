'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Project, ProjectImage } from '../../lib/types';
import ProjectModal from './ProjectModal';

export default function AllProjects({
  projects,
  images,
}: {
  projects: Project[];
  images: Record<string, ProjectImage[]>;
}) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set)];
  }, [projects]);

  const list = useMemo(
    () =>
      projects
        .filter((p) => {
          const okCat = filter === 'All' || p.categories.includes(filter) || p.category === filter;
          const okQuery =
            !query.trim() ||
            `${p.title} ${p.short_description ?? ''} ${p.technologies.join(' ')}`
              .toLowerCase()
              .includes(query.toLowerCase());
          return okCat && okQuery;
        })
        .map((p) => ({ project: p, images: images[p.id] ?? [] })),
    [projects, images, filter, query]
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects"
          aria-label="Search projects"
          className="archive-search"
        />
      </div>

      <div className="work-grid">
        {list.map((entry, i) => {
          const p = entry.project;
          return (
            <button
              key={p.id}
              type="button"
              className="project-card card--half"
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
                    {p.categories.join(' / ') || p.category} {p.year ? `— ${p.year}` : ''}
                  </div>
                  <h3 className="project-title">{p.title}</h3>
                </div>
                <svg className="project-arrow" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 12L12 4M6 4h6v6" stroke="currentColor" strokeWidth="1.3" fill="none" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {!list.length ? (
        <p className="meta" style={{ padding: '3rem 0' }}>
          No projects match that filter.
        </p>
      ) : null}

      <div style={{ marginTop: '3rem' }}>
        <Link href="/" className="link-arrow">
          ← Back home
        </Link>
      </div>

      {index !== null && list[index] ? (
        <ProjectModal list={list} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
      ) : null}
    </>
  );
}
