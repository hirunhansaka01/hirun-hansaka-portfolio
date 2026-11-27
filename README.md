# HIRUN HANSAKA — THE DIGITAL CANVAS

A full-stack personal portfolio for **Hirun Hansaka** — Sri Lankan web developer, graphic designer and
visual content creator. Editorial dark/light design, asymmetric project showcase, a private admin
dashboard, Supabase-backed content and a live contact inbox.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · hand-written CSS (no Tailwind) ·
Supabase (Postgres + Storage) · Vercel.

---

## 1. What is actually implemented

Everything below is real, running code — not a prototype:

| Area | Status |
| --- | --- |
| Public homepage (hero, work, about, services, lab, contact, footer) | ✅ implemented |
| Dark / light theme with ink-spread transition, saved preference | ✅ implemented |
| Project grid with category filters, **View more**, and a **project card modal with a close button** | ✅ implemented |
| Dedicated project detail pages (`/work/[slug]`) with prev/next | ✅ implemented |
| `/work` archive with search + filters | ✅ implemented |
| Working contact form → stored in Supabase (`contact_messages`) + validation + success/error states | ✅ implemented |
| Admin authentication (signed, httpOnly session cookie, rate-limited login, protected routes) | ✅ implemented |
| Admin dashboard: stats, recent activity, projects CRUD, reorder, publish/unpublish, duplicate | ✅ implemented |
| Admin content editor: skills, services, experiments, social links, homepage copy, biography | ✅ implemented |
| Admin settings: site title, SEO, contact info, footer, **default theme + live colour tokens** | ✅ implemented |
| Image uploads to Supabase Storage (`media` bucket) | ✅ implemented |
| Message inbox: unread/read/archived, delete, reply-by-email | ✅ implemented |
| SEO: metadata, Open Graph, sitemap, robots, semantic HTML, image lazy-loading | ✅ implemented |

### What is *not* built (by design)

- **No email is sent** when the contact form is submitted — messages are stored in the database and read
  in the dashboard. To add email, wire a transactional provider into `app/api/contact/route.ts`.
- **No multi-user permissions.** There is one owner account. `admin_users.role` exists for future use.
- **No image cropping/optimisation pipeline.** Uploads are stored as-is in the `media` bucket.
  (The cover art in `public/covers/` is hand-authored SVG, so it stays sharp and tiny.)
- The original design brief asked for a Figma-type UI prototype document; this repository is the
  production implementation of that design instead.

---

## 2. Creative direction

**Concept — THE DIGITAL CANVAS.** The site behaves like a designer's working surface: an animated
geometric "canvas" object in the hero, a type-led editorial grid, mono-spaced metadata labels, and
hard 1px rules instead of rounded card stacks.

Deliberate anti-patterns avoided: no centred hero with two buttons, no three identical feature cards,
no random gradients or glow blobs, no repeated two-column sections, no emoji-as-design, no Tailwind.

Every section has its own composition:

| Section | Composition |
| --- | --- |
| Hero | Two-column intro: greeting + "I am Hirun Hansaka" + role line + short blurb + two CTAs on the left, portrait (colour, greyscales on hover) and scroll cue on the right; no decorative graphic |
| Work | 12-column asymmetric grid — 7/5, 6/6, 4/4/4 — with a scrolling marquee divider above |
| About | Portrait frame (grayscale → colour on hover) + numbered skill index table |
| Services | Full-width rule-separated list; row expands and title slides on hover |
| Contact | Word-wrapped display headline + contact index + bordered form panel |
| Footer | Oversized wordmark, minimal links, back-to-top |

---

## 3. Design system

Tokens live in `app/globals.css` as CSS custom properties and are **overridable from the dashboard**
(`site_settings.theme` JSON → injected as `<style>` by `components/site/ThemeProvider.tsx`).

### Colour

| Token | Dark | Light |
| --- | --- | --- |
| `--bg` | `#0B0B0B` | `#F5F5F2` |
| `--bg-elevated` | `#111111` | `#ECEBE6` |
| `--bg-raised` | `#1A1A19` | `#E2E0DA` |
| `--fg` | `#FFFFFF` | `#0B0B0B` |
| `--fg-muted` | `#929292` | `#6B6B68` |
| `--line` | `#232323` | `#DBD9D3` |
| `--accent` | `#FF6300` | `#FF6300` |
| `--accent-fg` | `#0B0B0B` | `#FFFFFF` |
| `--card` | `#121211` | `#FFFFFF` |

### Typography

- **Display:** Space Grotesk (300–700) — headlines, project titles, service list. Tight negative
  tracking (`-0.03em` to `-0.045em`), line-height 0.82–0.96.
- **Body:** Inter — prose, forms, UI.
- **Mono:** JetBrains Mono — metadata, labels, counters, technical captions.
- Fluid scale tuned small: body 14–15px, section headings up to 44px, hero name up to 54px.
- All three are self-hosted through `next/font/google` (no render-time CDN dependency, no layout shift).
- Fluid type scale `--step--1 … --step-hero`, all defined with `clamp()`.

### Spacing & shape

`--pad-x`, `--gutter`, `--section-y` are fluid. Radii are intentionally restricted: `3px` for inputs,
`999px` only for pills/chips/buttons. Cards are rectangles with 1px borders — no soft shadows.

---

## 4. Page structure

```
/                      Home (hero, work, about, services, contact)
/work                  Full project archive (search + category filter)
/work/[slug]           Project detail page (cover, intro, gallery, challenges, process, prev/next)
/admin/login           Admin sign-in (own dark visual language)
/admin                 Dashboard overview: stats, recent projects, activity, newest messages
/admin/projects        Project table: reorder, publish/unpublish, duplicate, delete
/admin/projects/new    Create project
/admin/projects/[id]   Edit project (+ gallery manager)
/admin/messages        Contact inbox with status tabs
/admin/content         Homepage/about copy, skills, services, experiments, social links
/admin/settings        Identity, contact, footer, SEO, default theme, colour tokens
/api/contact           POST  — public contact form
/api/auth/login        POST  — admin sign-in
/api/auth/logout       POST  — sign-out
/api/admin/mutate      POST  — all authenticated dashboard mutations
/api/upload            POST  — image upload to Supabase Storage
/sitemap.xml  /robots.txt
```

---

## 5. Component structure

```
app/
  layout.tsx               fonts, metadata, no-flash theme boot script
  page.tsx                 homepage composition (server component)
  globals.css              entire design system + admin styles import
  work/page.tsx            archive
  work/[slug]/page.tsx     detail page
  not-found.tsx
  admin/…                  dashboard routes, admin.css
  api/…                    route handlers

components/site/
  ThemeProvider.tsx        theme state, localStorage, ink-spread overlay, token injection
  SiteHeader.tsx           nav, mobile sheet, theme switcher
  Reveal.tsx               IntersectionObserver scroll reveal
  WorkGrid.tsx             filters + asymmetric grid + View more + modal
  AllProjects.tsx          archive list + search
  ProjectModal.tsx         project card overlay with Close, Esc, ←/→, prev/next
  ContactForm.tsx          validated form + states
  SiteFooter.tsx           footer + back to top
  Loader.tsx               first-visit loading sequence (animated wordmark + real progress)
  BackToTop.tsx            floating go-to-top with reading-progress ring

components/admin/
  AdminShell.tsx           sidebar + mobile nav
  ProjectForm.tsx          full project editor
  SettingsForm.tsx         settings with live colour pickers
  ContentForms.tsx         skill/service/experiment/social adders
  RowActions.tsx           inline mutation buttons
  DeleteProjectButton.tsx
  Uploader.tsx             file → /api/upload → URL
  api.ts                   adminMutate() fetch helper

lib/
  supabase.ts              server-only service-role client
  queries.ts               all read queries + activity logging + fallbacks
  admin-ops.ts             all authenticated write operations
  auth.ts                  scrypt password hashing, HMAC session tokens
  types.ts                 shared domain types
middleware.ts              edge session check for /admin/*
```

---

## 6. Frontend architecture

- **Server Components** render every public page; data is fetched in `lib/queries.ts` with the
  Supabase **service-role** client (never shipped to the browser).
- **Client Components** are limited to interaction: theme switcher, grid + modal, form, reveal,
  admin forms.
- `export const revalidate = 60` on public pages, plus `revalidatePath()` after every admin mutation
  so edits appear immediately.
- If Supabase env vars are missing or the database is unreachable, `getPublicSiteData()` degrades to
  fallback settings and an empty project list — the site never hard-crashes.
- **No CSS framework.** One hand-written stylesheet with custom properties, BEM-ish flat class names
  and a dedicated `admin.css` for the dashboard.

---

## 7. Backend architecture

```
Browser ──► Next.js server (Vercel)
              ├── Server Components ──► lib/queries.ts ──► Supabase (service role)
              ├── /api/contact        ──► insert contact_messages
              ├── /api/auth/login     ──► scrypt verify ──► signed httpOnly cookie
              ├── /api/admin/mutate   ──► lib/admin-ops.ts (session-checked) ──► Supabase
              └── /api/upload         ──► Supabase Storage (bucket: media)
```

- **Authentication:** single owner account. Password stored as `scrypt:<salt>:<hash>` in
  `admin_users`; if no row exists yet, the `ADMIN_EMAIL` / `ADMIN_PASSWORD` env pair works as a
  bootstrap login. Sessions are HMAC-SHA256 signed tokens (`AUTH_SECRET`) in an `httpOnly`,
  `sameSite=lax`, `secure`-in-production cookie, valid 8 hours. `middleware.ts` verifies the token
  on the edge with Web Crypto before `/admin/*` renders.
- **Every write** re-checks the session inside `lib/admin-ops.ts` — the API is not protected by the
  UI alone.
- **Validation** happens server-side on every mutation and on the contact endpoint.
- **Rate limiting:** login (8 attempts / 10 min / IP+email) and contact (5 posts / min / IP).
- **Logging:** every mutation writes to `activity_logs`, shown on the dashboard.

---

## 8. Database schema

All tables have **RLS enabled with no anon policies** — the browser cannot read or write the database
directly. Access is only through server code holding the service-role key.

```
admin_users      id uuid pk · email unique · name · password_hash · role · created_at · last_login_at
site_settings    id=1 · site_title · meta_description · og_image_url · wordmark · owner_name
                 role_line · availability_text · location_label
                 hero_line_1..3 · hero_accent · hero_scroll_label · canvas_label · canvas_year
                 work_label · work_heading · about_label · about_heading · about_body · about_bio_long
                 profile_image_url · services_label · services_heading
                 experiments_label · experiments_heading · contact_label · contact_heading
                 contact_email · contact_phone · contact_whatsapp · contact_location
                 footer_tagline · footer_note · default_theme · theme jsonb · updated_at
projects         id uuid pk · slug unique · title · category · categories text[]
                 short_description · intro · challenges · process · technologies text[]
                 year · cover_image_url · live_url · github_url
                 status ('draft'|'published') · featured · sort_order · created_at · updated_at
project_images   id uuid pk · project_id → projects(id) on delete cascade · image_url · caption
                 sort_order · created_at
skills           id uuid pk · label · group_name · sort_order
services         id uuid pk · number · title · note · sort_order
experiments      id uuid pk · title · description · media_url
                 media_type ('image'|'video'|'link'|'none') · link_url · published · sort_order · created_at
contact_messages id uuid pk · name · email · subject · message
                 status ('unread'|'read'|'archived') · created_at
message_replies  id uuid pk · message_id → contact_messages(id) on delete cascade
                 body · subject · sent_by
                 status ('sent'|'failed'|'not_configured') · provider_id · error · created_at
social_links     id uuid pk · label · url · handle · sort_order
activity_logs    id uuid pk · actor · action · entity_type · entity_id · created_at
```

Relationships: `projects 1—N project_images` (cascade delete), `contact_messages 1—N message_replies`
(cascade delete). `site_settings` is a singleton row.
Indexes exist on `projects(status, sort_order)`, `project_images(project_id, sort_order)`,
`contact_messages(status, created_at)`, `activity_logs(created_at)`.

The exact DDL used lives in `sql/schema.sql`; starter content is in `sql/seed.sql`.

---

## 9. API endpoints

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/contact` | public | `{name,email,subject,message,website?}` | `200 {ok:true}` · `422 {errors}` · `429` · `503` |
| POST | `/api/auth/login` | public | `{email,password}` | `200 {ok:true}` + cookie · `401` · `429` |
| POST | `/api/auth/logout` | session | – | `200 {ok:true}` |
| POST | `/api/admin/mutate` | session | `{op,payload}` | `200 {ok:true,…}` · `400 {error}` · `401` |
| POST | `/api/upload` | session | multipart `file` | `200 {url,path}` · `413` · `415` · `503` |

`op` values for `/api/admin/mutate`:
`saveProject`, `deleteProject`, `toggleProject`, `moveProject`, `duplicateProject`,
`setMessageStatus`, `deleteMessage`, `saveSettings`, `addContent` (`kind: skill|service|experiment|social`),
`deleteContent`.

---

## 10. Image storage

- Supabase Storage bucket **`media`**, public read.
- Upload path: `YYYY/<timestamp><random>.<ext>`, sent with `cacheControl: 31536000`.
- Allowed: JPEG, PNG, WebP, AVIF, GIF, SVG · max **6 MB**.
- The dashboard exposes an **Upload** button next to every image field (cover, gallery, profile photo,
  OG image). You can also paste any external URL.
- Create the bucket once (see §12) — the upload route returns a clear error if it is missing.

---

## 11. Responsive behaviour

Breakpoints: `560px`, `640px`, `760px`, `860px`, `899px`, `900px`.

- **Desktop (>1200px):** full asymmetric 12-column work grid; hero split 62/38 with the canvas frame
  matching the headline block height.
- **Laptop (900–1200px):** same structure, tighter type scale via `clamp()`; canvas becomes 16:11.
- **Tablet (760–899px):** navigation collapses to a full-screen sheet with numbered links; services
  lose their note column; hero stacks.
- **Mobile (<760px):** single-column grid, hero canvas below the headline, project modal becomes a
  full-height sheet, admin tables drop their secondary columns and gain a horizontal tab bar.

Reduced-motion users get all transitions and animations disabled (`prefers-reduced-motion`).

---

## 11a. Motion & loading sequence

Everything is hand-written CSS + a little vanilla JS — no animation library.

| Layer | What it does | Where |
|---|---|---|
| **Loading sequence** | First visit per session: letter-by-letter wordmark, orbiting accent ring, live percentage counter and bar, then two curtains split vertically to reveal the page. Document-readiness driven, hard-capped at ~5.5s, session-flagged, skipped for reduced motion and never shown in `/admin`. | `components/site/Loader.tsx` + `LOADING SEQUENCE` block in `globals.css` |
| **Hero entrance** | After the curtains open, header drops in, greeting/name/role/blurb/CTAs stagger upward, portrait fades in — driven by `html[data-intro='done']`. | `POST-LOAD ENTRANCE` block |
| **Typewriter** | The hero **role line** types each role in turn — "Web developer" → "Graphic designer" → "Visual content creator" — holds it, deletes back, and loops. The name stays static. Phrases are parsed from the editable `role_line` setting, so changing it in the dashboard changes the loop; a single‑role line simply types once. | `components/site/Typewriter.tsx` + `heroRoles()` in `app/page.tsx` |
| **Scroll reveals** | Every section/card fades up out of a soft blur, staggered by index; replayable when you scroll back. | `Reveal.tsx` + `ScrollFX.tsx` |
| **Scrub headlines** | Section + contact headlines light word-by-word from a muted wash to full ink as they reach the read line. | `ScrubText.tsx` + `ScrollFX.tsx` |
| **Project grid** | Cards rise in sequence with `--i` delays, image scales on hover. | `WorkGrid.tsx` + `.work-grid .project-card` |
| **Parallax** | Portrait drifts with the pointer (fine pointers only) via `--px/--py`. | `HeroParallax.tsx` |
| **Progress rail** | 2px accent line under the header fills with page progress (`--progress`). | `ScrollFX.tsx` + `.scroll-rail` |
| **Reduced motion** | Loader, parallax, blur, scrub and rail all switch off; content renders final-state. | `globals.css` media query |

## 11b. Replying to messages (Google SMTP)

The admin inbox at `/admin/messages` is a two-way inbox, not a mailto link.

1. A visitor submits the public contact form → the row is stored in `contact_messages`
   and shown in **Admin → Messages**.
2. Open the message and press **Reply**. The composer writes to `message_replies`
   and sends the mail through Google SMTP with `nodemailer`.
3. The outgoing mail uses a branded HTML shell (the reply text at the top, the
   original message quoted underneath) and sets `Reply-To` to the visitor, so
   they can answer straight into the same Gmail inbox.
4. Every reply is stored on the thread with its status:
   `sent` (accepted by Google), `failed` (SMTP error is recorded on the row) or
   `not_configured` (draft saved, no credentials). The dashboard shows the whole
   thread under each message, so nothing is lost when SMTP is down.
5. **Admin → Messages → Send test email** sends a one-line check to `SMTP_USER`
   so you can confirm credentials without waiting for a real customer.

### Getting the App Password

Google no longer accepts a normal account password over SMTP.

1. Enable **2-Step Verification** on the Google account.
2. Go to <https://myaccount.google.com/apppasswords>.
3. Create an app password named e.g. `portfolio` → copy the 16-character code.
4. Add `SMTP_USER` (the full Gmail address) and `SMTP_PASS` (that 16-character code)
   to `.env.local` and to Vercel → Settings → Environment Variables → Production,
   then redeploy.

If the two variables are missing the site keeps working: messages still arrive and
replies are saved as `not_configured` drafts, and the dashboard shows a banner
explaining what to add.

## 12. Environment variables

```bash
# Supabase (server only — never prefixed with NEXT_PUBLIC)
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Admin session signing
AUTH_SECRET=<long random string>

# Bootstrap admin login (used until an admin_users row exists)
ADMIN_EMAIL=hirunhansaka15@gmail.com
ADMIN_PASSWORD=<your password>

# Public canonical URL (used by sitemap/robots)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 13. Local development

```bash
npm install
cp .env.example .env.local     # fill in the values
npm run dev                    # http://localhost:3000
npm run build                  # production build
```

Set up the database once:

1. Create a Supabase project.
2. Run `sql/schema.sql` in the SQL editor (creates tables, indexes, RLS).
3. Run `sql/seed.sql` for starter content.
4. Create a **public** Storage bucket named `media`.
5. Sign in at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Optional: create a real `admin_users` row (hashed password) instead of relying on the env fallback:

```bash
node scripts/create-admin.mjs you@example.com "your password" "Your Name"
```

---

## 14. Deployment

1. Push the repository to GitHub.
2. In Vercel → **Add New Project** → import the repo (framework auto-detected: Next.js).
3. Add the five environment variables from §12 (Production + Preview).
4. Deploy. `/api/*` and `/admin/*` are dynamic; the public pages revalidate every 60s.
5. Set `NEXT_PUBLIC_SITE_URL` to the final domain so the sitemap is correct.
6. Optional: add a custom domain in Vercel → Settings → Domains.

---

## 15. Security notes

- The service-role key is **only** read in server files. Nothing sensitive is bundled to the client.
- RLS is on for every table with no permissive policies — the anon key cannot touch the data even if a
  browser gets hold of it (the app never sends it anyway).
- Sessions: HMAC-signed, `httpOnly`, 8h expiry, verified in middleware *and* in every mutation.
- Passwords hashed with `scrypt` (N=default, 64-byte digest, per-user salt).
- Server-side validation on the contact form, project editor and content endpoints; honeypot field
  plus per-IP rate limits guard the contact endpoint; login is rate limited.
- `/admin` and `/api` are excluded in `robots.txt`; the admin layout sets `robots: noindex`.

---

## 16. Editing the site (no code required)

Sign in at `/admin/login`, then:

- **Settings** — wordmark, name, role line, availability, location, contact details, footer, SEO,
  default theme, and every colour token for both dark and light modes (with live colour pickers).
- **Content** — hero greeting, name, role line and blurb, section labels/headings,
  biography, profile photograph (upload), skills, services, experiments, social links.
- **Projects** — create/edit/delete, reorder, publish/unpublish, duplicate, cover + gallery images,
  live/GitHub URLs.
- **Messages** — read, mark read/unread, archive, delete, reply by email.

Changes appear on the public site immediately after saving.

---

## 17. Credits

Design and build for **Hirun Hansaka**. Typefaces: Space Grotesk (Florian Karsten), Inter (Rasmus
Andersson), JetBrains Mono (JetBrains) — all via Google Fonts / `next/font`.
