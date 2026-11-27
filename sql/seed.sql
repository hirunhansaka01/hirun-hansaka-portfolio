-- Seed content for the Hirun Hansaka portfolio.
-- Safe to re-run: guarded by NOT EXISTS checks.

insert into site_settings (id) values (1)
on conflict (id) do nothing;

update site_settings set
  site_title = 'Hirun Hansaka — The Digital Canvas',
  meta_description = 'Portfolio of Hirun Hansaka — Sri Lankan web developer, graphic designer and visual content creator building meaningful digital experiences.',
  wordmark = 'HIRUN HANSAKA',
  owner_name = 'Hirun Hansaka',
  role_line = 'Web developer. Designer. Visual creator.',
  availability_text = 'Available for projects',
  location_label = 'Sri Lanka',
  hero_line_1 = 'DESIGNING',
  hero_line_2 = 'BEYOND',
  hero_line_3 = 'THE ORDINARY.',
  hero_accent = 'BEYOND',
  hero_scroll_label = 'Scroll to explore',
  canvas_label = 'THE DIGITAL CANVAS',
  canvas_year = '2026',
  work_label = '01 / SELECTED WORK',
  work_heading = 'Things I''ve made.',
  about_label = '02 / ABOUT',
  about_heading = 'A little about what I do.',
  about_body = 'A Sri Lankan developer and creative professional passionate about building useful digital experiences through software, design and emerging technologies.',
  about_bio_long = 'I enjoy turning ideas into practical products — from responsive websites and full-stack applications to AI-powered tools and visual content. Always learning, always experimenting.',
  services_label = '03 / SERVICES',
  services_heading = 'What I can create.',
  experiments_label = '04 / CREATIVE LAB',
  experiments_heading = 'Curiosity in progress.',
  contact_label = '05 / CONTACT',
  contact_heading = 'HAVE SOMETHING INTERESTING IN MIND?',
  contact_email = 'hirunhansaka15@gmail.com',
  contact_location = 'Sri Lanka',
  footer_tagline = 'Designed with curiosity. Built with purpose.',
  default_theme = 'dark',
  theme = '{}'::jsonb
where id = 1;

-- ---------------------------------------------------------------- projects
insert into projects (slug, title, category, categories, short_description, intro, challenges, process, technologies, year, cover_image_url, live_url, github_url, status, sort_order)
select * from (values
  (
    'ink-studio', 'Ink Studio', 'Web Development',
    array['Web Development','UI/UX Design'],
    'A creative digital studio identity and web experience built around visual storytelling.',
    'Ink Studio is a creative web design project focused on visual storytelling, distinctive branding and engaging digital experiences. The work centred on translating a studio''s personality into an interface rather than a brochure.',
    'The main challenge was balancing an expressive visual language with clarity — the site had to feel art-directed without hiding the work itself.',
    'Built the layout system first, then layered the motion and typography on top. Everything was prototyped in the browser rather than static mockups.',
    array['HTML','CSS','JavaScript','Figma'],
    '2025', '/covers/ink-studio.svg', null, null, 'published', 1
  ),
  (
    'scanix', 'SCANIX', 'Applications',
    array['Applications','UI/UX Design'],
    'Application interface and product design for a scanning and organisation tool.',
    'SCANIX is an application interface and product design project — focused on making a dense, data-heavy tool feel calm and quick to navigate.',
    'Keeping a large amount of structured information readable without resorting to endless tables, and designing states that stay consistent across screens.',
    'Started from flows and information architecture, then designed the component set, then built the interface out screen by screen.',
    array['React','TypeScript','CSS'],
    '2025', '/covers/scanix.svg', null, null, 'published', 2
  ),
  (
    'vybe-guitar', 'VYBE Guitar', 'Applications',
    array['Applications','Web Development'],
    'An interactive music application built for guitarists.',
    'VYBE Guitar is a music application concept that brings practice tools, chords and progress tracking into one simple interface.',
    'Designing an interface that disappears while you play — large targets, high contrast, and no unnecessary navigation.',
    'Wireframed around real practice routines, then iterated on the interaction between chord selection and the fretboard view.',
    array['JavaScript','Node.js','CSS'],
    '2024', '/covers/vybe-guitar.svg', null, null, 'published', 3
  ),
  (
    'rig-music', 'Rig Music', 'Web Development',
    array['Web Development','Applications'],
    'A modular music technology application and audio workflow platform.',
    'Rig Music is a modular music technology application — a gear library, practice tracker and audio workflow tool in one place.',
    'The data model was the hard part: gear, presets, practice sessions and songs all relate to each other, so the schema had to be designed before the UI.',
    'Modelled the database first, then built the read views, then the editing flows.',
    array['Next.js','TypeScript','Supabase','PostgreSQL'],
    '2025', '/covers/rig-music.svg', null, null, 'published', 4
  ),
  (
    'weligama-bay-eco-villa', 'Weligama Bay Eco Villa', 'Web Development',
    array['Web Development','Graphic Design'],
    'A coastal hospitality website with an editorial visual identity.',
    'Weligama Bay Eco Villa needed a website that felt like the place: quiet, warm, and clearly designed rather than templated.',
    'Communicating atmosphere through layout and photography instead of long descriptive copy.',
    'Started with the visual identity and typographic tone, then built a responsive page structure around imagery and negative space.',
    array['WordPress','CSS','Photoshop'],
    '2024', '/covers/weligama-bay.svg', null, null, 'published', 5
  ),
  (
    'heritagelk', 'HeritageLK', 'Creative Experiments',
    array['Creative Experiments','UI/UX Design'],
    'A Sri Lankan heritage discovery concept — exploring places, artefacts and stories.',
    'HeritageLK is a discovery concept for Sri Lankan heritage: a way to move through places, periods and artefacts without a dry catalogue interface.',
    'Making a browsing experience feel exploratory rather than encyclopaedic while keeping the structure navigable.',
    'Mapped the content relationships, then designed an arched visual motif that carries through the whole interface.',
    array['Figma','React','CSS'],
    '2024', '/covers/heritagelk.svg', null, null, 'published', 6
  ),
  (
    'edith', 'EDITH', 'Creative Experiments',
    array['Creative Experiments','Applications'],
    'An experimental AI-powered desktop assistant exploring intelligent interaction and automation.',
    'EDITH is an experimental desktop assistant exploring practical AI integrations — natural language commands, automation pipelines and local tooling.',
    'The interesting problems were reliability and trust: assistant output has to be predictable, and failures have to be legible.',
    'Prototyped command parsing, then wired up the automation layer, then iterated on feedback states.',
    array['Python','Google Gemini','Automation'],
    '2025', '/covers/edith.svg', null, 'https://github.com/hirunhansaka01', 'published', 7
  ),
  (
    'rcpas-website-design', 'RCPAS Website Design', 'UI/UX Design',
    array['UI/UX Design','Web Development'],
    'A professional website design focused on clear information architecture and responsive layouts.',
    'A website design project for a professional body — the priority was legibility, clear hierarchy and a usable structure for a wide audience.',
    'Organising a large amount of institutional content without making the interface feel heavy.',
    'Content inventory first, then architecture, then a restrained visual system and responsive layout.',
    array['Figma','HTML','CSS'],
    '2024', '/covers/rcpas.svg', null, null, 'published', 8
  )
) as v
where not exists (select 1 from projects where slug = v.slug);

-- ---------------------------------------------------------------- skills
insert into skills (label, group_name, sort_order)
select * from (values
  ('Web Development', 'Practice', 1),
  ('Python', 'Language', 2),
  ('TypeScript', 'Language', 3),
  ('UI & Graphic Design', 'Practice', 4),
  ('AI & Automation', 'Curiosity', 5),
  ('Video Editing', 'Practice', 6),
  ('Music', 'Curiosity', 7),
  ('Creative Technology', 'Curiosity', 8)
) as v(label, group_name, sort_order)
where not exists (select 1 from skills limit 1);

-- ---------------------------------------------------------------- services
insert into services (number, title, note, sort_order)
select * from (values
  ('01', 'Web Development', 'Responsive, fast, accessible', 1),
  ('02', 'UI/UX Design', 'Interfaces that make sense', 2),
  ('03', 'Graphic Design', 'Identity, posters, visuals', 3),
  ('04', 'WordPress Development', 'Content-managed sites', 4),
  ('05', 'Application Development', 'Products and internal tools', 5),
  ('06', 'Creative Digital Solutions', 'AI, automation, experiments', 6)
) as v(number, title, note, sort_order)
where not exists (select 1 from services limit 1);

-- ---------------------------------------------------------------- experiments
insert into experiments (title, description, media_url, media_type, link_url, published, sort_order)
select * from (values
  ('Ink fields', 'Generative line studies — pattern systems built in the browser.', '/covers/ink-studio.svg', 'image', null, true, 1),
  ('Interface sketches', 'Quick UI studies exploring density and hierarchy.', '/covers/scanix.svg', 'image', null, true, 2),
  ('Modular sound', 'Experimenting with audio tooling and gear data models.', '/covers/rig-music.svg', 'image', null, true, 3),
  ('Assistant prototypes', 'Testing practical AI automation in a desktop context.', '/covers/edith.svg', 'image', null, true, 4)
) as v(title, description, media_url, media_type, link_url, published, sort_order)
where not exists (select 1 from experiments limit 1);

-- ---------------------------------------------------------------- socials
insert into social_links (label, url, handle, sort_order)
select * from (values
  ('GitHub', 'https://github.com/hirunhansaka01', '@hirunhansaka01', 1),
  ('Instagram', 'https://instagram.com/', null, 2),
  ('LinkedIn', 'https://linkedin.com/', null, 3)
) as v(label, url, handle, sort_order)
where not exists (select 1 from social_links limit 1);
