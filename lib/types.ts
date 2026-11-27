export type Theme = 'dark' | 'light';

export type ThemeTokens = {
  dark?: Partial<Record<'bg' | 'bgElevated' | 'fg' | 'fgMuted' | 'line' | 'accent' | 'accentFg' | 'card', string>>;
  light?: Partial<Record<'bg' | 'bgElevated' | 'fg' | 'fgMuted' | 'line' | 'accent' | 'accentFg' | 'card', string>>;
};

export type SiteSettings = {
  id: number;
  site_title: string;
  meta_description: string | null;
  og_image_url: string | null;
  wordmark: string | null;
  owner_name: string | null;
  role_line: string | null;
  availability_text: string | null;
  location_label: string | null;
  hero_greeting: string | null;
  hero_line_1: string | null;
  hero_line_2: string | null;
  hero_line_3: string | null;
  hero_accent: string | null;
  hero_scroll_label: string | null;
  canvas_label: string | null;
  canvas_year: string | null;
  work_label: string | null;
  work_heading: string | null;
  about_label: string | null;
  about_heading: string | null;
  about_body: string | null;
  about_bio_long: string | null;
  profile_image_url: string | null;
  services_label: string | null;
  services_heading: string | null;
  experiments_label: string | null;
  experiments_heading: string | null;
  contact_label: string | null;
  contact_heading: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_location: string | null;
  footer_tagline: string | null;
  footer_note: string | null;
  default_theme: Theme;
  theme: ThemeTokens | null;
  updated_at: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  categories: string[];
  short_description: string | null;
  intro: string | null;
  challenges: string | null;
  process: string | null;
  technologies: string[];
  year: string | null;
  cover_image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  status: 'draft' | 'published';
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export type Skill = {
  id: string;
  label: string;
  group_name: string | null;
  sort_order: number;
};

export type Service = {
  id: string;
  number: string | null;
  title: string;
  note: string | null;
  sort_order: number;
};

export type Experiment = {
  id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: 'image' | 'video' | 'link' | 'none';
  link_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
  handle: string | null;
  sort_order: number;
};

export type ActivityLog = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

export type PublicSiteData = {
  settings: SiteSettings;
  projects: Project[];
  projectImages: Record<string, ProjectImage[]>;
  skills: Skill[];
  services: Service[];
  experiments: Experiment[];
  socials: SocialLink[];
};
