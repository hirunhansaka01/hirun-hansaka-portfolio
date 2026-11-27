import Link from 'next/link';
import ThemeProvider from '../components/site/ThemeProvider';
import SiteHeader from '../components/site/SiteHeader';
import WorkGrid from '../components/site/WorkGrid';
import ContactForm from '../components/site/ContactForm';
import Reveal from '../components/site/Reveal';
import SiteFooter from '../components/site/SiteFooter';
import BackToTop from '../components/site/BackToTop';
import Loader from '../components/site/Loader';
import { getPublicSiteData } from '../lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const { settings, projects, projectImages, skills, services, socials } =
    await getPublicSiteData();

  return (
    <ThemeProvider defaultTheme={settings.default_theme} tokens={settings.theme}>
      <Loader name={settings.owner_name || 'Hirun Hansaka'} />

      <a className="skip-link" href="#work">
        Skip to work
      </a>

      <SiteHeader wordmark={settings.wordmark || 'HIRUN HANSAKA'} ownerName={settings.owner_name || 'Hirun Hansaka'} />

      <main id="top" className="page-enter">
        {/* ---------------- HERO ---------------- */}
        <section className="shell hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-greet">
                <span className="hero-greet-rule" aria-hidden="true" />
                {settings.hero_greeting || 'Hey there'}
              </span>

              <h1 className="hero-intro" data-ready="true">
                <span className="split-line">
                  <span style={{ ['--line-delay' as string]: '120ms' }}>I am</span>
                </span>
                <span className="split-line">
                  <span className="hero-name" style={{ ['--line-delay' as string]: '210ms' }}>
                    {settings.owner_name || 'Hirun Hansaka'}
                  </span>
                </span>
              </h1>

              <p className="hero-role">
                {settings.role_line || 'Web developer, graphic designer & visual content creator.'}
              </p>

              <p className="hero-blurb">
                {settings.about_body ||
                  'A Sri Lankan developer and creative professional building useful, considered digital experiences.'}
              </p>

              <div className="hero-actions">
                <a className="btn btn--accent" href="#work">
                  View my work
                </a>
                <a className="btn" href="#contact">
                  Start a project
                </a>
              </div>
            </div>

            <div className="hero-media">
              <div className="portrait-frame portrait-frame--hero">
                {settings.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.profile_image_url}
                    alt={`Portrait of ${settings.owner_name || 'Hirun Hansaka'}`}
                  />
                ) : (
                  <div className="portrait-placeholder">
                    Profile photograph
                    <br />
                    upload from dashboard
                  </div>
                )}
                <span className="frame-tag">Portfolio — {settings.location_label || 'Sri Lanka'}</span>
              </div>

              <a className="scroll-cue hero-scroll" href="#work">
                {settings.hero_scroll_label || 'Scroll to explore'}
                <svg width="11" height="14" viewBox="0 0 12 16" aria-hidden="true">
                  <path d="M6 1v12M2 9l4 5 4-5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                </svg>
              </a>
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
                <div className="about-actions">
                  <a className="link-arrow" href="#contact">
                    Work with me
                    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 10L10 2M4 2h6v6" stroke="currentColor" strokeWidth="1.3" fill="none" />
                    </svg>
                  </a>
                  <a className="link-arrow" href="/work">
                    All projects
                  </a>
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

      <BackToTop />

      <SiteFooter
        wordmark={settings.wordmark || 'HIRUN HANSAKA'}
        tagline={settings.footer_tagline || 'Designed with curiosity. Built with purpose.'}
        note={settings.footer_note}
        socials={socials}
      />
    </ThemeProvider>
  );
}
