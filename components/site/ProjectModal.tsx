'use client';

import { useEffect, useRef } from 'react';
import type { Project, ProjectImage } from '../../lib/types';

type Entry = { project: Project; images: ProjectImage[] };

export type ModalProps = {
  list: Entry[];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
};

export default function ProjectModal({ list, index, onIndex, onClose }: ModalProps) {
  const entry = list[index];
  if (!entry) return null;
  const project = entry.project;
  const images = entry.images ?? [];
  const prev = list.length > 1 ? list[(index - 1 + list.length) % list.length].project : null;
  const next = list.length > 1 ? list[(index + 1) % list.length].project : null;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && list.length > 1) onIndex((index + 1) % list.length);
      if (e.key === 'ArrowLeft' && list.length > 1) onIndex((index - 1 + list.length) % list.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [onClose, onIndex, index, list.length]);

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-label={`${project.title} — project details`}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-card" ref={cardRef}>
        <div className="modal-bar">
          <button type="button" className="modal-close" onClick={onClose} ref={closeRef} aria-label="Close project">
            Close
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          </button>
        </div>

        {project.cover_image_url ? (
          <div className="modal-cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.cover_image_url} alt={`${project.title} cover`} />
          </div>
        ) : null}

        <div className="modal-body">
          <div>
            <span className="eyebrow">{project.category || project.categories[0] || 'Project'}</span>
            <h2 className="modal-title" style={{ marginTop: '0.6rem' }}>
              {project.title}
            </h2>
          </div>

          <div className="modal-meta">
            <div>
              <span className="k">Year</span>
              <span className="v">{project.year || '—'}</span>
            </div>
            <div>
              <span className="k">Discipline</span>
              <span className="v">{project.categories.length ? project.categories.join(' / ') : (project.category || '—')}</span>
            </div>
            <div>
              <span className="k">Status</span>
              <span className="v">{project.status === 'published' ? 'Live' : 'Draft'}</span>
            </div>
          </div>

          {project.short_description ? (
            <p className="lede" style={{ margin: 0 }}>
              {project.short_description}
            </p>
          ) : null}

          {project.intro ? (
            <div className="modal-prose">
              <span className="eyebrow eyebrow--muted">Introduction</span>
              <p style={{ marginTop: '0.6rem' }}>{project.intro}</p>
            </div>
          ) : null}

          {project.challenges ? (
            <div className="modal-prose">
              <span className="eyebrow eyebrow--muted">Challenges</span>
              <p style={{ marginTop: '0.6rem' }}>{project.challenges}</p>
            </div>
          ) : null}

          {project.process ? (
            <div className="modal-prose">
              <span className="eyebrow eyebrow--muted">Process</span>
              <p style={{ marginTop: '0.6rem' }}>{project.process}</p>
            </div>
          ) : null}

          {images.length ? (
            <div>
              <span className="eyebrow eyebrow--muted">Gallery</span>
              <div className="modal-gallery" style={{ marginTop: '0.75rem' }}>
                {images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={img.image_url} alt={img.caption || `${project.title} detail`} loading="lazy" />
                ))}
              </div>
            </div>
          ) : null}

          {project.technologies.length ? (
            <div>
              <span className="eyebrow eyebrow--muted">Technologies</span>
              <div className="tech-row" style={{ marginTop: '0.6rem' }}>
                {project.technologies.map((t) => (
                  <span className="tech-pill" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {project.live_url ? (
              <a
                className="btn btn--accent"
                href={project.live_url}
                target="_blank"
                rel="noreferrer noopener"
              >
                View live project
                <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 10L10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.4" fill="none" />
                </svg>
              </a>
            ) : null}
            {project.github_url ? (
              <a className="btn" href={project.github_url} target="_blank" rel="noreferrer noopener">
                Source code
              </a>
            ) : null}
            <a className="btn" href={`/work/${project.slug}`}>
              Full case page
            </a>
          </div>
        </div>

        {(prev || next) && (
          <div className="modal-nav">
            <button type="button" onClick={() => prev && onIndex((index - 1 + list.length) % list.length)} disabled={!prev}>
              <span className="k">Previous</span>
              <span className="v">{prev ? prev.title : '—'}</span>
            </button>
            <button type="button" onClick={() => next && onIndex((index + 1) % list.length)} disabled={!next}>
              <span className="k">Next</span>
              <span className="v">{next ? next.title : '—'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
