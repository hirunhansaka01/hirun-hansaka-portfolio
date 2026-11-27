import { supabaseAdmin, hasSupabaseEnv } from './supabase';
import type {
  ActivityLog,
  ContactMessage,
  Experiment,
  Project,
  ProjectImage,
  PublicSiteData,
  Service,
  SiteSettings,
  Skill,
  SocialLink,
} from './types';

export const FALLBACK_SETTINGS: SiteSettings = {
  id: 1,
  site_title: 'Hirun Hansaka — The Digital Canvas',
  meta_description:
    'Personal portfolio of Hirun Hansaka — Sri Lankan web developer, graphic designer, and visual content creator.',
  og_image_url: null,
  wordmark: 'HIRUN HANSAKA',
  owner_name: 'Hirun Hansaka',
  role_line: 'Web developer. Designer. Visual creator.',
  availability_text: 'Available for projects',
  location_label: 'Sri Lanka',
  hero_greeting: 'Hey there',
  hero_line_1: 'DESIGNING',
  hero_line_2: 'BEYOND',
  hero_line_3: 'THE ORDINARY.',
  hero_accent: 'BEYOND',
  hero_scroll_label: 'Scroll to explore',
  canvas_label: 'THE DIGITAL CANVAS',
  canvas_year: String(new Date().getFullYear()),
  work_label: '01 / SELECTED WORK',
  work_heading: "Things I've made.",
  about_label: '02 / ABOUT',
  about_heading: 'A little about what I do.',
  about_body:
    'A Sri Lankan web developer, graphic designer, and visual content creator interested in building meaningful digital experiences.',
  about_bio_long: null,
  profile_image_url: null,
  services_label: '03 / SERVICES',
  services_heading: 'What I can create.',
  experiments_label: '04 / CREATIVE LAB',
  experiments_heading: 'Curiosity in progress.',
  contact_label: '05 / CONTACT',
  contact_heading: 'HAVE SOMETHING INTERESTING IN MIND?',
  contact_email: 'hirunhansaka15@gmail.com',
  contact_phone: null,
  contact_whatsapp: null,
  contact_location: 'Sri Lanka',
  footer_tagline: 'Designed with curiosity. Built with purpose.',
  footer_note: null,
  default_theme: 'dark',
  theme: null,
  updated_at: new Date().toISOString(),
};

const EMPTY: PublicSiteData = {
  settings: FALLBACK_SETTINGS,
  projects: [],
  projectImages: {},
  skills: [],
  services: [],
  experiments: [],
  socials: [],
};

/**
 * Loads everything the public homepage needs in one pass.
 * If the database is unreachable we degrade to fallback content so the
 * marketing site never hard-crashes.
 */
export async function getPublicSiteData(): Promise<PublicSiteData> {
  if (!hasSupabaseEnv()) return EMPTY;

  try {
    const sb = supabaseAdmin();
    const [settings, projects, images, skills, services, experiments, socials] =
      await Promise.all([
        sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        sb
          .from('projects')
          .select('*')
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false }),
        sb.from('project_images').select('*').order('sort_order', { ascending: true }),
        sb.from('skills').select('*').order('sort_order', { ascending: true }),
        sb.from('services').select('*').order('sort_order', { ascending: true }),
        sb
          .from('experiments')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true }),
        sb.from('social_links').select('*').order('sort_order', { ascending: true }),
      ]);

    const projectList = (projects.data ?? []) as Project[];
    const imageList = (images.data ?? []) as ProjectImage[];

    const grouped: Record<string, ProjectImage[]> = {};
    for (const img of imageList) {
      const visibleIds = new Set(projectList.map((p) => p.id));
      if (!visibleIds.has(img.project_id)) continue;
      (grouped[img.project_id] ||= []).push(img);
    }

    return {
      settings: { ...FALLBACK_SETTINGS, ...((settings.data ?? {}) as SiteSettings) },
      projects: projectList,
      projectImages: grouped,
      skills: (skills.data ?? []) as Skill[],
      services: (services.data ?? []) as Service[],
      experiments: (experiments.data ?? []) as Experiment[],
      socials: (socials.data ?? []) as SocialLink[],
    };
  } catch (err) {
    console.error('[getPublicSiteData] falling back to static content:', err);
    return EMPTY;
  }
}

export async function getProjectBySlug(slug: string) {
  if (!hasSupabaseEnv()) return null;
  const sb = supabaseAdmin();
  const { data } = await sb.from('projects').select('*').eq('slug', slug).maybeSingle();
  if (!data) return null;
  const { data: images } = await sb
    .from('project_images')
    .select('*')
    .eq('project_id', data.id)
    .order('sort_order', { ascending: true });
  return { project: data as Project, images: (images ?? []) as ProjectImage[] };
}

/* ---------------- ADMIN QUERIES ---------------- */

export async function getAllProjects(): Promise<Project[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  return (data ?? []) as Project[];
}

export async function getProjectById(id: string) {
  if (!hasSupabaseEnv()) return null;
  const sb = supabaseAdmin();
  const { data } = await sb.from('projects').select('*').eq('id', id).maybeSingle();
  if (!data) return null;
  const { data: images } = await sb
    .from('project_images')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true });
  return { project: data as Project, images: (images ?? []) as ProjectImage[] };
}

export async function getMessages(status?: string): Promise<ContactMessage[]> {
  if (!hasSupabaseEnv()) return [];
  const sb = supabaseAdmin();
  let q = sb.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (status && status !== 'all') q = q.eq('status', status);
  const { data } = await q;
  return (data ?? []) as ContactMessage[];
}

export async function getSkills(): Promise<Skill[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await supabaseAdmin().from('skills').select('*').order('sort_order');
  return (data ?? []) as Skill[];
}

export async function getServices(): Promise<Service[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await supabaseAdmin().from('services').select('*').order('sort_order');
  return (data ?? []) as Service[];
}

export async function getExperiments(): Promise<Experiment[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await supabaseAdmin().from('experiments').select('*').order('sort_order');
  return (data ?? []) as Experiment[];
}

export async function getSocials(): Promise<SocialLink[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await supabaseAdmin().from('social_links').select('*').order('sort_order');
  return (data ?? []) as SocialLink[];
}

export async function getSettings(): Promise<SiteSettings> {
  if (!hasSupabaseEnv()) return FALLBACK_SETTINGS;
  const { data } = await supabaseAdmin().from('site_settings').select('*').eq('id', 1).maybeSingle();
  return { ...FALLBACK_SETTINGS, ...((data ?? {}) as SiteSettings) };
}

export async function getActivity(limit = 12): Promise<ActivityLog[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await supabaseAdmin()
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}

export async function getDashboardStats() {
  if (!hasSupabaseEnv()) {
    return { total: 0, published: 0, drafts: 0, unread: 0, read: 0, archived: 0 };
  }
  const sb = supabaseAdmin();
  const [projects, messages] = await Promise.all([
    sb.from('projects').select('status'),
    sb.from('contact_messages').select('status'),
  ]);
  const p = (projects.data ?? []) as { status: string }[];
  const m = (messages.data ?? []) as { status: string }[];
  return {
    total: p.length,
    published: p.filter((x) => x.status === 'published').length,
    drafts: p.filter((x) => x.status === 'draft').length,
    unread: m.filter((x) => x.status === 'unread').length,
    read: m.filter((x) => x.status === 'read').length,
    archived: m.filter((x) => x.status === 'archived').length,
  };
}

export async function logActivity(
  action: string,
  entityType?: string | null,
  entityId?: string | null,
  actor = 'admin'
) {
  if (!hasSupabaseEnv()) return;
  try {
    await supabaseAdmin()
      .from('activity_logs')
      .insert({ action, entity_type: entityType ?? null, entity_id: entityId ?? null, actor });
  } catch {
    /* logging must never break a request */
  }
}
