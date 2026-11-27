import Link from 'next/link';
import ThemeProvider from '../components/site/ThemeProvider';
import SiteHeader from '../components/site/SiteHeader';
import KineticCanvas from '../components/site/KineticCanvas';
import WorkGrid from '../components/site/WorkGrid';
import ContactForm from '../components/site/ContactForm';
import Reveal from '../components/site/Reveal';
import SiteFooter from '../components/site/SiteFooter';
import { getPublicSiteData } from '../lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const { settings, projects, projectImages, skills, services, experiments, socials } =
    await getPublicSiteData();

  const heroLines = [settings.hero_line_1 ?? 'DESIGNING', settings.hero_line_2 ?? 'BEYOND', settings.hero_line_3 ?? 'THE ORDINARY.'];
  const accent = (settings.hero_accent ?? 'BEYOND').toUpperCase();

  return (
    <ThemeProvider defaultTheme={settings.default_theme} tokens={settings.theme}>
      <a className="skip-link" href="#work">
        Skip to work
      </a>

      <SiteHeader wordmark={settings.wordmark || 'HIRUN HANSAKA'} ownerName={settings.owner_name || 'Hirun Hansaka'} />

      <main id="top" className="page-enter">
        {/* ---------------- HERO ---------------- */}
        <section className="shell hero">
          <div className="hero-grid">
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div className="hero-status">
                <span className="pill">
                  <span className="pulse" aria-hidden="true" />
                  {settings.availability_text || 'Available for projects'}
                </span>
                <span className="meta">{settings.location_label || 'Sri Lanka'}</span>
                <span className="meta" style={{ marginLeft: 'auto' }}>
                  06°55′N 79°51′E
                </span>
              </div>

              <h1 className="hero-title" data-ready="true">
                {heroLines.map((line, i) => {
                  const isAccent = line.toUpperCase().includes(accent);
                  const parts = isAccent
                    ? (() => {
                        const idx = line.toUpperCase().indexOf(accent);
                        return [
                          line.slice(0, idx),
                          <span className="accent" key="a">
                            {line.slice(idx, idx + accent.length)}
                          </span>,
                          line.slice(idx + accent.length),
                        ];
                      })()
                    : [line];
                  return (
                    <span className="split-line" key={i}>
                      <span style={{ ['--line-delay' as string]: `${140 + i * 110}ms` }}>{parts}</span>
                    </span>
                  );
                })}
              </h1>

              <div className="hero-lower">
                <p className="lede" style={{ maxWidth: '30ch', margin: 0 }}>
                  {settings.role_line || 'Web developer. Designer. Visual creator.'}
                </p>
                <a className="scroll-cue" href="#work">
                  {settings.hero_scroll_label || 'Scroll to explore'}
                  <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
                    <path d="M6 1v12M2 9l4 5 4-5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <KineticCanvas
                label={settings.canvas_label || 'THE DIGITAL CANVAS'}
                year={settings.canvas_year || String(new Date().getFullYear())}
              />
            </div>
          </div>
        </section>

        {/* ---------------- MARQUEE ---------------- */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((dup) => (
              <span key={dup}>
                WEB DEVELOPMENT · UI/UX · GRAPHIC DESIGN · APPLICATIONS · CREATIVE EXPERIMENTS ·
                PYTHON · TYPESCRIPT · AI &amp; AUTOMATION · VIDEO EDITING · MUSIC · WORDPRESS ·
              </span>
            ))}
          </div>
        </div>

        {/* ---------------- 01 / WORK ---------------- */}
        <section id="work" className="shell section" style={{ borderTop: 0 }}>
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">{settings.work_label || '01 / SELECTED WORK'}</span>
              <h2 className="title-section" style={{ marginTop: '0.9rem' }}>
                {settings.work_heading || "Things I've made."}
              </h2>
            </div>
            <Link href="/work" className="link-arrow">
              All projects
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2 10L10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.3" fill="none" />
              </svg>
            </Link>
          </Reveal>

          <Reveal delay={80}>
            <WorkGrid projects={projects} images={projectImages} />
          </Reveal>
        </section>

        {/* ---------------- 02 / ABOUT ---------------- */}
        <section id="about" className="shell section">
          <div className="about-grid">
            <div>
              <Reveal>
                <span className="eyebrow">{settings.about_label || '02 / ABOUT'}</span>
                <h2 className="title-section" style={{ marginTop: '0.9rem' }}>
                  {settings.about_heading || 'A little about what I do.'}
                </h2>
                <p className="lede" style={{ marginTop: '1.25rem' }}>
                  {settings.about_body}
                </p>
                {settings.about_bio_long ? (
                  <p className="body-muted" style={{ maxWidth: '46ch' }}>
                    {settings.about_bio_long}
                  </p>
                ) : null}
              </Reveal>

              <Reveal delay={120} style={{ marginTop: '2rem' }}>
                <div className="portrait-frame">
                  {settings.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={settings.profile_image_url} alt={`Portrait of ${settings.owner_name}`} loading="lazy" />
                  ) : (
                    <div className="portrait-placeholder">
                      Profile photograph
                      <br />
                      upload from dashboard
                    </div>
                  )}
                  <span className="frame-tag">{settings.location_label || 'Sri Lanka'}</span>
                </div>
              </Reveal>
            </div>

            <div>
              <Reveal delay={60}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <span className="meta">Disciplines &amp; curiosities</span>
                  <span className="meta" style={{ color: 'var(--accent)' }}>
                    {String(skills.length).padStart(2, '0')} focus areas
                  </span>
                </div>
              </Reveal>

              <div className="skill-index">
                {skills.length ? (
                  skills.map((s, i) => (
                    <Reveal key={s.id} delay={i * 40} as="div" className="skill-row">
                      <span className="num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">{s.label}</span>
                      <span className="group">{s.group_name || 'Practice'}</span>
                    </Reveal>
                  ))
                ) : (
                  <div className="skill-row">
                    <span className="num">01</span>
                    <span className="name">Add your skills in the dashboard</span>
                    <span className="group">—</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 03 / SERVICES ---------------- */}
        <section id="services" className="shell section">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">{settings.services_label || '03 / SERVICES'}</span>
              <h2 className="title-section" style={{ marginTop: '0.9rem' }}>
                {settings.services_heading || 'What I can create.'}
              </h2>
            </div>
          </Reveal>

          <div className="service-list">
            {services.length ? (
              services.map((s, i) => (
                <Reveal key={s.id} delay={i * 50} as="div" className="service-item">
                  <span className="s-num">{s.number || String(i + 1).padStart(2, '0')}</span>
                  <span className="s-title">{s.title}</span>
                  <span className="s-note">{s.note || ''}</span>
                </Reveal>
              ))
            ) : (
              <div className="service-item">
                <span className="s-num">01</span>
                <span className="s-title">Add services in the dashboard</span>
                <span className="s-note" />
              </div>
            )}
          </div>
        </section>

        {/* ---------------- 04 / LAB ---------------- */}
        <section id="lab" className="shell section">
          <Reveal className="section-head">
            <div>
              <span className="eyebrow">{settings.experiments_label || '04 / CREATIVE LAB'}</span>
              <h2 className="title-section" style={{ marginTop: '0.9rem' }}>
                {settings.experiments_heading || 'Curiosity in progress.'}
              </h2>
            </div>
            <span className="meta">Prototypes · visual studies · code sketches</span>
          </Reveal>

          <div className="lab-grid">
            <Reveal className="lab-card lab-card--big lab-card--tall lab-card--text">
              <div className="lab-body">
                <span className="eyebrow eyebrow--muted">Now exploring</span>
                <p className="lab-quote" style={{ margin: '0.75rem 0 0' }}>
                  AI, automation
                  <br />
                  &amp; the web.
                </p>
                <p className="lab-desc" style={{ marginTop: '0.9rem', maxWidth: '34ch' }}>
                  Small experiments in interaction, tooling and visual systems — the unfinished work
                  that keeps the craft moving.
                </p>
              </div>
            </Reveal>

            {experiments.length ? (
              experiments.slice(0, 5).map((ex, i) => (
                <Reveal
                  key={ex.id}
                  delay={i * 60}
                  className={`lab-card ${i % 3 === 0 ? 'lab-card--small' : 'lab-card--big'}`}
                >
                  {ex.media_url && ex.media_type === 'image' ? (
                    <div className="lab-media">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ex.media_url} alt={ex.title} loading="lazy" />
                    </div>
                  ) : ex.media_url && ex.media_type === 'video' ? (
                    <div className="lab-media">
                      <video src={ex.media_url} muted loop playsInline autoPlay preload="metadata" />
                    </div>
                  ) : null}
                  <div className="lab-body">
                    <span className="lab-title">{ex.title}</span>
                    {ex.description ? <p className="lab-desc">{ex.description}</p> : null}
                    {ex.link_url ? (
                      <a className="link-arrow lab-link" href={ex.link_url} target="_blank" rel="noreferrer noopener">
                        Open experiment ↗
                      </a>
                    ) : null}
                  </div>
                </Reveal>
              ))
            ) : (
              <Reveal delay={60} className="lab-card lab-card--big">
                <div className="lab-media" />
                <div className="lab-body">
                  <span className="lab-title">Nothing published yet</span>
                  <p className="lab-desc">Experiments you add in the dashboard will show up here.</p>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ---------------- 05 / CONTACT ---------------- */}
        <section id="contact" className="shell section">
          <div className="contact-grid">
            <div>
              <Reveal>
                <span className="eyebrow">{settings.contact_label || '05 / CONTACT'}</span>
                <h2 className="contact-heading" style={{ marginTop: '1rem' }}>
                  {(settings.contact_heading || 'HAVE SOMETHING INTERESTING IN MIND?')
                    .split(' ')
                    .reduce<string[][]>((lines, word) => {
                      const last = lines[lines.length - 1];
                      if (last && last.join(' ').length + word.length < 16) last.push(word);
                      else lines.push([word]);
                      return lines;
                    }, [])
                    .map((line, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        {line.join(' ')}
                      </span>
                    ))}
                </h2>
              </Reveal>

              <Reveal delay={100} style={{ marginTop: '2rem' }}>
                <div className="contact-list">
                  {settings.contact_email ? (
                    <a href={`mailto:${settings.contact_email}`}>
                      <span className="cl-label">Email</span>
                      <span>{settings.contact_email}</span>
                    </a>
                  ) : null}
                  {settings.contact_whatsapp ? (
                    <a href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer noopener">
                      <span className="cl-label">WhatsApp</span>
                      <span>{settings.contact_phone || settings.contact_whatsapp}</span>
                    </a>
                  ) : null}
                  {settings.contact_location ? (
                    <a href="#contact" aria-disabled="true" style={{ pointerEvents: 'none' }}>
                      <span className="cl-label">Based in</span>
                      <span>{settings.contact_location}</span>
                    </a>
                  ) : null}
                  {socials.map((s) => (
                    <a key={s.id} href={s.url} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener">
                      <span className="cl-label">{s.label}</span>
                      <span>{s.handle || s.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={140}>
              <div style={{ border: '1px solid var(--line)', padding: 'clamp(1.25rem, 3vw, 2rem)', background: 'var(--bg-elevated)' }}>
                <span className="eyebrow eyebrow--muted">Start a project</span>
                <div style={{ marginTop: '1.25rem' }}>
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter
        wordmark={settings.wordmark || 'HIRUN HANSAKA'}
        tagline={settings.footer_tagline || 'Designed with curiosity. Built with purpose.'}
        note={settings.footer_note}
        socials={socials}
      />
    </ThemeProvider>
  );
}
