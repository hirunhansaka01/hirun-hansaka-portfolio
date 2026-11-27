-- ============================================================
-- HIRUN HANSAKA — portfolio schema
-- Run in the Supabase SQL editor (or as a migration).
-- ============================================================
create extension if not exists "pgcrypto";

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists site_settings (
  id int primary key default 1 check (id = 1),
  site_title text not null default 'Hirun Hansaka — The Digital Canvas',
  meta_description text,
  og_image_url text,
  wordmark text default 'HIRUN HANSAKA',
  owner_name text default 'Hirun Hansaka',
  role_line text default 'Web developer. Designer. Visual creator.',
  availability_text text default 'Available for projects',
  location_label text default 'Sri Lanka',
  hero_line_1 text default 'DESIGNING',
  hero_line_2 text default 'BEYOND',
  hero_line_3 text default 'THE ORDINARY.',
  hero_accent text default 'BEYOND',
  hero_scroll_label text default 'Scroll to explore',
  canvas_label text default 'THE DIGITAL CANVAS',
  canvas_year text default '2026',
  work_label text default '01 / SELECTED WORK',
  work_heading text default 'Things I''ve made.',
  about_label text default '02 / ABOUT',
  about_heading text default 'A little about what I do.',
  about_body text,
  about_bio_long text,
  profile_image_url text,
  services_label text default '03 / SERVICES',
  services_heading text default 'What I can create.',
  experiments_label text default '04 / CREATIVE LAB',
  experiments_heading text default 'Curiosity in progress.',
  contact_label text default '05 / CONTACT',
  contact_heading text default 'HAVE SOMETHING INTERESTING IN MIND?',
  contact_email text,
  contact_phone text,
  contact_whatsapp text,
  contact_location text default 'Sri Lanka',
  footer_tagline text default 'Designed with curiosity. Built with purpose.',
  footer_note text,
  default_theme text not null default 'dark' check (default_theme in ('dark','light')),
  theme jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,
  categories text[] not null default '{}',
  short_description text,
  intro text,
  challenges text,
  process text,
  technologies text[] not null default '{}',
  year text,
  cover_image_url text,
  live_url text,
  github_url text,
  status text not null default 'published' check (status in ('draft','published')),
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  group_name text,
  sort_order int not null default 0
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  number text,
  title text not null,
  note text,
  sort_order int not null default 0
);

create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video','link','none')),
  link_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now()
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  handle text,
  sort_order int not null default 0
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor text,
  action text not null,
  entity_type text,
  entity_id text,
  created_at timestamptz not null default now()
);

create index if not exists projects_status_idx on projects (status, sort_order);
create index if not exists project_images_project_idx on project_images (project_id, sort_order);
create index if not exists contact_messages_status_idx on contact_messages (status, created_at desc);
create index if not exists activity_logs_created_idx on activity_logs (created_at desc);

-- Lock everything down: only the server (service role) touches these tables.
alter table admin_users enable row level security;
alter table site_settings enable row level security;
alter table projects enable row level security;
alter table project_images enable row level security;
alter table skills enable row level security;
alter table services enable row level security;
alter table experiments enable row level security;
alter table contact_messages enable row level security;
alter table social_links enable row level security;
alter table activity_logs enable row level security;

-- Storage: create a PUBLIC bucket named "media"
-- (Dashboard → Storage → New bucket → name: media → Public: on)
