'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminMutate } from './api';
import Uploader from './Uploader';
import type { Project, ProjectImage } from '../../lib/types';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ProjectForm({
  project,
  images = [],
}: {
  project?: Project;
  images?: ProjectImage[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    category: project?.category ?? '',
    categories: project?.categories.join(', ') ?? '',
    year: project?.year ?? String(new Date().getFullYear()),
    short_description: project?.short_description ?? '',
    intro: project?.intro ?? '',
    challenges: project?.challenges ?? '',
    process: project?.process ?? '',
    technologies: project?.technologies.join(', ') ?? '',
    cover_image_url: project?.cover_image_url ?? '',
    live_url: project?.live_url ?? '',
    github_url: project?.github_url ?? '',
    status: project?.status ?? 'published',
    sort_order: String(project?.sort_order ?? 0),
    featured: project?.featured ?? false,
  });
  const [gallery, setGallery] = useState<string[]>(images.map((i) => i.image_url));
  const [galleryInput, setGalleryInput] = useState('');

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);

    const result = await adminMutate('saveProject', {
      ...form,
      id: project?.id,
      gallery,
      slug: form.slug || slugify(form.title),
    });

    setBusy(false);
    setNotice({ ok: result.ok, message: result.message || (result.ok ? 'Saved.' : 'Could not save.') });

    if (result.ok) {
      if (!project && typeof result.slug === 'string') {
        router.push(`/admin/projects/${result.id}`);
      } else {
        router.refresh();
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="a-form">
      {notice ? (
        <div className={`a-notice ${notice.ok ? 'a-notice--ok' : 'a-notice--err'}`} role="status">
          {notice.message}
        </div>
      ) : null}

      <div className="a-panel" style={{ margin: 0 }}>
        <div className="a-panel-head">
          <h2>Project details</h2>
          <span className="a-pill">{project ? 'Editing' : 'New'}</span>
        </div>
        <div className="a-panel-body a-form">
          <div className="a-grid-2">
            <div className="a-field">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                value={form.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!project) set('slug', slugify(e.target.value));
                }}
                required
              />
            </div>
            <div className="a-field">
              <label htmlFor="slug">URL slug</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="auto-generated from title"
              />
              <span className="hint">/work/{form.slug || slugify(form.title) || 'your-project'}</span>
            </div>
          </div>

          <div className="a-grid-3">
            <div className="a-field">
              <label htmlFor="category">Primary category</label>
              <input
                id="category"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder="Web Development"
              />
            </div>
            <div className="a-field">
              <label htmlFor="categories">All categories (comma separated)</label>
              <input
                id="categories"
                value={form.categories}
                onChange={(e) => set('categories', e.target.value)}
                placeholder="Web Development, UI/UX Design"
              />
            </div>
            <div className="a-field">
              <label htmlFor="year">Year</label>
              <input id="year" value={form.year} onChange={(e) => set('year', e.target.value)} />
            </div>
          </div>

          <div className="a-field">
            <label htmlFor="short_description">Short description</label>
            <textarea
              id="short_description"
              value={form.short_description}
              onChange={(e) => set('short_description', e.target.value)}
              placeholder="One or two lines shown on the work grid."
              style={{ minHeight: '3.5rem' }}
            />
          </div>

          <div className="a-field">
            <label htmlFor="intro">Introduction (project card &amp; page)</label>
            <textarea id="intro" value={form.intro} onChange={(e) => set('intro', e.target.value)} />
          </div>

          <div className="a-grid-2">
            <div className="a-field">
              <label htmlFor="challenges">Challenges</label>
              <textarea
                id="challenges"
                value={form.challenges}
                onChange={(e) => set('challenges', e.target.value)}
              />
            </div>
            <div className="a-field">
              <label htmlFor="process">Design &amp; development process</label>
              <textarea id="process" value={form.process} onChange={(e) => set('process', e.target.value)} />
            </div>
          </div>

          <div className="a-field">
            <label htmlFor="technologies">Technologies (comma separated)</label>
            <input
              id="technologies"
              value={form.technologies}
              onChange={(e) => set('technologies', e.target.value)}
              placeholder="Next.js, TypeScript, Supabase"
            />
          </div>
        </div>
      </div>

      <div className="a-panel" style={{ margin: 0 }}>
        <div className="a-panel-head">
          <h2>Media</h2>
        </div>
        <div className="a-panel-body a-form">
          <div className="a-field">
            <label htmlFor="cover_image_url">Cover image URL</label>
            <input
              id="cover_image_url"
              value={form.cover_image_url}
              onChange={(e) => set('cover_image_url', e.target.value)}
              placeholder="https://…"
            />
            <span className="hint">
              Paste any public image URL, or upload a file straight into Supabase Storage.
            </span>
            <div style={{ marginTop: '0.35rem' }}>
              <Uploader label="Upload cover" onUploaded={(url) => set('cover_image_url', url)} />
            </div>
          </div>

          {form.cover_image_url ? (
            <div style={{ border: '1px solid var(--a-line)', borderRadius: 4, overflow: 'hidden', maxWidth: 340 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.cover_image_url}
                alt="Cover preview"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          ) : null}

          <div className="a-divider" />

          <div className="a-field">
            <label>Gallery images</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                placeholder="Paste an image URL and press add"
              />
              <button
                type="button"
                className="a-btn"
                onClick={() => {
                  if (!galleryInput.trim()) return;
                  setGallery((g) => [...g, galleryInput.trim()]);
                  setGalleryInput('');
                }}
              >
                Add
              </button>
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <Uploader label="Upload gallery image" onUploaded={(url) => setGallery((g) => [...g, url])} />
            </div>
            {gallery.length ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: '0.5rem',
                  marginTop: '0.6rem',
                }}
              >
                {gallery.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    style={{
                      position: 'relative',
                      border: '1px solid var(--a-line)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setGallery((g) => g.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        background: '#000',
                        color: '#fff',
                        borderRadius: 3,
                        fontSize: '0.625rem',
                        padding: '0.1rem 0.35rem',
                      }}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="hint">No gallery images yet.</span>
            )}
          </div>
        </div>
      </div>

      <div className="a-panel" style={{ margin: 0 }}>
        <div className="a-panel-head">
          <h2>Links &amp; publishing</h2>
        </div>
        <div className="a-panel-body a-form">
          <div className="a-grid-2">
            <div className="a-field">
              <label htmlFor="live_url">Live project URL</label>
              <input
                id="live_url"
                value={form.live_url}
                onChange={(e) => set('live_url', e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="a-field">
              <label htmlFor="github_url">GitHub URL</label>
              <input
                id="github_url"
                value={form.github_url}
                onChange={(e) => set('github_url', e.target.value)}
                placeholder="https://github.com/…"
              />
            </div>
          </div>

          <div className="a-grid-3">
            <div className="a-field">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </div>
            <div className="a-field">
              <label htmlFor="sort_order">Sort order</label>
              <input
                id="sort_order"
                type="number"
                value={form.sort_order}
                onChange={(e) => set('sort_order', e.target.value)}
              />
              <span className="hint">Lower numbers appear first.</span>
            </div>
            <div className="a-field">
              <label htmlFor="featured">Featured</label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textTransform: 'none',
                  letterSpacing: 0,
                  fontSize: '0.8125rem',
                  color: 'var(--a-ink)',
                }}
              >
                <input
                  id="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  style={{ width: 'auto' }}
                />
                Highlight this project
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="a-actions">
        <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
          {busy ? 'Saving…' : project ? 'Save changes' : 'Create project'}
        </button>
        <Link href="/admin/projects" className="a-btn a-btn--ghost">
          Cancel
        </Link>
        {project ? (
          <a href={`/work/${project.slug}`} target="_blank" rel="noreferrer" className="a-btn a-btn--ghost">
            Preview ↗
          </a>
        ) : null}
      </div>
    </form>
  );
}
