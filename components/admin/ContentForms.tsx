'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminMutate } from './api';

type Row = { id: string };

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(op: string, payload: Record<string, unknown>, onDone?: () => void) {
    setBusy(true);
    setError('');
    const result = await adminMutate(op, payload);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return false;
    }
    onDone?.();
    router.refresh();
    return true;
  }

  return { submit, busy, error };
}

function Notice({ error }: { error: string }) {
  return error ? (
    <div className="a-notice a-notice--err" style={{ fontSize: '0.75rem' }}>
      {error}
    </div>
  ) : null;
}

export function SkillAdder() {
  const { submit, busy, error } = useSubmit();
  const [label, setLabel] = useState('');
  const [group, setGroup] = useState('');

  return (
    <form
      className="a-form"
      style={{ marginBottom: '1rem' }}
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await submit('addContent', { kind: 'skill', data: { label, group_name: group } });
        if (ok) {
          setLabel('');
          setGroup('');
        }
      }}
    >
      {error ? <Notice error={error} /> : null}
      <div className="a-grid-3">
        <div className="a-field">
          <label htmlFor="skill-label">Label</label>
          <input
            id="skill-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Web Development"
            required
          />
        </div>
        <div className="a-field">
          <label htmlFor="skill-group">Group</label>
          <input
            id="skill-group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="Practice / Tool / Curiosity"
          />
        </div>
        <div className="a-field">
          <label>&nbsp;</label>
          <button className="a-btn a-btn--primary" type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add skill'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ServiceAdder() {
  const { submit, busy, error } = useSubmit();
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  return (
    <form
      className="a-form"
      style={{ marginBottom: '1rem' }}
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await submit('addContent', { kind: 'service', data: { title, note } });
        if (ok) {
          setTitle('');
          setNote('');
        }
      }}
    >
      {error ? <Notice error={error} /> : null}
      <div className="a-grid-3">
        <div className="a-field">
          <label htmlFor="service-title">Service title</label>
          <input
            id="service-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Web Development"
            required
          />
        </div>
        <div className="a-field">
          <label htmlFor="service-note">Short note (optional)</label>
          <input
            id="service-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Responsive, fast, accessible"
          />
        </div>
        <div className="a-field">
          <label>&nbsp;</label>
          <button className="a-btn a-btn--primary" type="submit" disabled={busy}>
            {busy ? 'Adding…' : 'Add service'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ExperimentAdder() {
  const { submit, busy, error } = useSubmit();
  const [form, setForm] = useState({ title: '', media_type: 'image', media_url: '', description: '', link_url: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="a-form"
      style={{ marginBottom: '1rem' }}
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await submit('addContent', { kind: 'experiment', data: form });
        if (ok) setForm({ title: '', media_type: 'image', media_url: '', description: '', link_url: '' });
      }}
    >
      {error ? <Notice error={error} /> : null}
      <div className="a-grid-3">
        <div className="a-field">
          <label htmlFor="exp-title">Title</label>
          <input id="exp-title" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div className="a-field">
          <label htmlFor="exp-type">Media type</label>
          <select id="exp-type" value={form.media_type} onChange={(e) => set('media_type', e.target.value)}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link only</option>
            <option value="none">Text only</option>
          </select>
        </div>
        <div className="a-field">
          <label htmlFor="exp-media">Media URL</label>
          <input id="exp-media" value={form.media_url} onChange={(e) => set('media_url', e.target.value)} />
        </div>
      </div>
      <div className="a-grid-2">
        <div className="a-field">
          <label htmlFor="exp-desc">Short description</label>
          <input id="exp-desc" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="a-field">
          <label htmlFor="exp-link">External link (optional)</label>
          <input id="exp-link" value={form.link_url} onChange={(e) => set('link_url', e.target.value)} />
        </div>
      </div>
      <div className="a-actions">
        <button className="a-btn a-btn--primary" type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add experiment'}
        </button>
      </div>
    </form>
  );
}

export function SocialAdder() {
  const { submit, busy, error } = useSubmit();
  const [form, setForm] = useState({ label: '', handle: '', url: '' });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      className="a-form"
      style={{ marginBottom: '1rem' }}
      onSubmit={async (e) => {
        e.preventDefault();
        const ok = await submit('addContent', { kind: 'social', data: form });
        if (ok) setForm({ label: '', handle: '', url: '' });
      }}
    >
      {error ? <Notice error={error} /> : null}
      <div className="a-grid-3">
        <div className="a-field">
          <label htmlFor="social-label">Label</label>
          <input id="social-label" value={form.label} onChange={(e) => set('label', e.target.value)} required />
        </div>
        <div className="a-field">
          <label htmlFor="social-handle">Handle (display)</label>
          <input id="social-handle" value={form.handle} onChange={(e) => set('handle', e.target.value)} />
        </div>
        <div className="a-field">
          <label htmlFor="social-url">URL</label>
          <input id="social-url" value={form.url} onChange={(e) => set('url', e.target.value)} required />
        </div>
      </div>
      <div className="a-actions">
        <button className="a-btn a-btn--primary" type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add link'}
        </button>
      </div>
    </form>
  );
}

export function DeleteContentButton({ kind, id }: { kind: string; id: string }) {
  const { submit, busy } = useSubmit();
  return (
    <button
      type="button"
      className="a-btn a-btn--sm a-btn--danger"
      disabled={busy}
      onClick={() => submit('deleteContent', { kind, id })}
    >
      Remove
    </button>
  );
}

/** Generic row action used by the content page. */
export function ContentRowActions({ rows }: { rows: Row[] }) {
  return <>{rows.length}</>;
}
