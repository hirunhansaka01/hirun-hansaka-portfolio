import { supabaseAdmin } from './supabase';
import { requireSession } from './auth';
import { logActivity } from './queries';

/**
 * Server-side admin operations. Every function re-checks the session so the API
 * route (and any future server action) cannot be used anonymously.
 * These are plain async functions — they are called from /api/admin/mutate.
 */

function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || `project-${Date.now().toString(36)}`;
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof value === 'string')
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  return [];
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/* ------------------------------- projects ------------------------------- */

export async function saveProjectOp(input: Record<string, unknown>) {
  await requireSession();

  const id = text(input.id);
  const title = text(input.title);
  if (!title) throw new Error('A project title is required.');

  const payload = {
    title,
    slug: slugify(text(input.slug) || title),
    category: text(input.category) || null,
    categories: toArray(input.categories),
    short_description: text(input.short_description) || null,
    intro: text(input.intro) || null,
    challenges: text(input.challenges) || null,
    process: text(input.process) || null,
    technologies: toArray(input.technologies),
    year: text(input.year) || null,
    cover_image_url: text(input.cover_image_url) || null,
    live_url: text(input.live_url) || null,
    github_url: text(input.github_url) || null,
    status: (input.status === 'draft' ? 'draft' : 'published') as 'draft' | 'published',
    featured: Boolean(input.featured),
    sort_order: Number(input.sort_order ?? 0) || 0,
    updated_at: new Date().toISOString(),
  };

  const sb = supabaseAdmin();
  let projectId = id;

  if (id) {
    const { error } = await sb.from('projects').update(payload).eq('id', id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from('projects').insert(payload).select('id').single();
    if (error) throw error;
    projectId = data.id as string;
  }

  if (Array.isArray(input.gallery)) {
    const urls = toArray(input.gallery);
    await sb.from('project_images').delete().eq('project_id', projectId);
    if (urls.length) {
      await sb.from('project_images').insert(
        urls.map((url, i) => ({ project_id: projectId, image_url: url, caption: null, sort_order: i }))
      );
    }
  }

  await logActivity(id ? 'Updated project' : 'Created project', 'project', projectId);
  return { id: projectId, slug: payload.slug };
}

export async function deleteProjectOp(id: string) {
  await requireSession();
  if (!id) throw new Error('Missing project id.');
  await supabaseAdmin().from('projects').delete().eq('id', id);
  await logActivity('Deleted project', 'project', id);
  return { ok: true };
}

export async function toggleProjectOp(id: string, next: string) {
  await requireSession();
  const status = next === 'draft' ? 'draft' : 'published';
  await supabaseAdmin()
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  await logActivity(status === 'published' ? 'Published project' : 'Moved project to draft', 'project', id);
  return { ok: true };
}

export async function moveProjectOp(id: string, dir: string) {
  await requireSession();
  const sb = supabaseAdmin();
  const { data } = await sb.from('projects').select('id, sort_order').order('sort_order');
  const list = (data ?? []) as { id: string; sort_order: number }[];
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Project not found.');
  const swap = dir === 'up' ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= list.length) return { ok: true };
  const a = list[idx];
  const b = list[swap];
  await sb.from('projects').update({ sort_order: b.sort_order }).eq('id', a.id);
  await sb.from('projects').update({ sort_order: a.sort_order }).eq('id', b.id);
  return { ok: true };
}

export async function duplicateProjectOp(id: string) {
  await requireSession();
  const sb = supabaseAdmin();
  const { data } = await sb.from('projects').select('*').eq('id', id).maybeSingle();
  if (!data) throw new Error('Project not found.');
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = data as Record<string, unknown>;
  const { error } = await sb.from('projects').insert({
    ...rest,
    title: `${rest.title} (copy)`,
    slug: `${rest.slug}-copy-${Date.now().toString(36)}`,
    status: 'draft',
  });
  if (error) throw error;
  await logActivity('Duplicated project', 'project', id);
  return { ok: true };
}

/* ------------------------------- messages ------------------------------- */

export async function setMessageStatusOp(id: string, status: string) {
  await requireSession();
  if (!['unread', 'read', 'archived'].includes(status)) throw new Error('Unknown status.');
  await supabaseAdmin().from('contact_messages').update({ status }).eq('id', id);
  return { ok: true };
}

export async function deleteMessageOp(id: string) {
  await requireSession();
  await supabaseAdmin().from('contact_messages').delete().eq('id', id);
  await logActivity('Deleted message', 'contact_message', id);
  return { ok: true };
}

/* ------------------------------- settings ------------------------------- */

export { TEXT_KEYS } from './settings-keys';
import { TEXT_KEYS } from './settings-keys';

export async function saveSettingsOp(input: Record<string, unknown>) {
  await requireSession();

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of TEXT_KEYS) {
    if (key in input) {
      const value = text(input[key]);
      update[key] = value || (key === 'site_title' ? 'Hirun Hansaka — The Digital Canvas' : null);
    }
  }
  if ('default_theme' in input) {
    update.default_theme = input.default_theme === 'light' ? 'light' : 'dark';
  }
  if ('theme' in input) {
    const theme = input.theme;
    update.theme = typeof theme === 'object' && theme ? theme : {};
  }

  const sb = supabaseAdmin();
  const { data: existing } = await sb.from('site_settings').select('id').eq('id', 1).maybeSingle();
  if (existing) {
    const { error } = await sb.from('site_settings').update(update).eq('id', 1);
    if (error) throw error;
  } else {
    const { error } = await sb.from('site_settings').insert({ id: 1, ...update });
    if (error) throw error;
  }

  await logActivity('Updated site settings', 'site_settings', '1');
  return { ok: true };
}

/* ---------------------------- content lists ---------------------------- */

export async function addContentOp(kind: string, payload: Record<string, unknown>) {
  await requireSession();
  const sb = supabaseAdmin();

  if (kind === 'skill') {
    const label = text(payload.label);
    if (!label) throw new Error('Skill label is required.');
    const { count } = await sb.from('skills').select('*', { count: 'exact', head: true });
    const { error } = await sb
      .from('skills')
      .insert({ label, group_name: text(payload.group_name) || null, sort_order: (count ?? 0) + 1 });
    if (error) throw error;
    return { ok: true };
  }

  if (kind === 'service') {
    const title = text(payload.title);
    if (!title) throw new Error('Service title is required.');
    const { count } = await sb.from('services').select('*', { count: 'exact', head: true });
    const n = (count ?? 0) + 1;
    const { error } = await sb.from('services').insert({
      title,
      number: String(n).padStart(2, '0'),
      note: text(payload.note) || null,
      sort_order: n,
    });
    if (error) throw error;
    return { ok: true };
  }

  if (kind === 'experiment') {
    const title = text(payload.title);
    if (!title) throw new Error('Experiment title is required.');
    const { count } = await sb.from('experiments').select('*', { count: 'exact', head: true });
    const mediaType = ['image', 'video', 'link', 'none'].includes(text(payload.media_type))
      ? (text(payload.media_type) as 'image' | 'video' | 'link' | 'none')
      : 'none';
    const { error } = await sb.from('experiments').insert({
      title,
      description: text(payload.description) || null,
      media_url: text(payload.media_url) || null,
      media_type: mediaType,
      link_url: text(payload.link_url) || null,
      published: true,
      sort_order: (count ?? 0) + 1,
    });
    if (error) throw error;
    return { ok: true };
  }

  if (kind === 'social') {
    const label = text(payload.label);
    const url = text(payload.url);
    if (!label || !url) throw new Error('Label and URL are required.');
    const { count } = await sb.from('social_links').select('*', { count: 'exact', head: true });
    const { error } = await sb
      .from('social_links')
      .insert({ label, url, handle: text(payload.handle) || null, sort_order: (count ?? 0) + 1 });
    if (error) throw error;
    return { ok: true };
  }

  throw new Error('Unknown content type.');
}

export async function deleteContentOp(kind: string, id: string) {
  await requireSession();
  if (!id) throw new Error('Missing id.');
  const table =
    kind === 'skill'
      ? 'skills'
      : kind === 'service'
        ? 'services'
        : kind === 'experiment'
          ? 'experiments'
          : kind === 'social'
            ? 'social_links'
            : null;
  if (!table) throw new Error('Unknown content type.');
  const { error } = await supabaseAdmin().from(table).delete().eq('id', id);
  if (error) throw error;
  return { ok: true };
}
