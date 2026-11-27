import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ThemeProvider from '../../../components/site/ThemeProvider';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import BackToTop from '../../../components/site/BackToTop';
import { getProjectBySlug, getPublicSiteData } from '../../../lib/queries';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return { title: 'Project not found' };
  return {
    title: data.project.title,
    description: data.project.short_description ?? undefined,
    openGraph: {
      title: data.project.title,
      description: data.project.short_description ?? undefined,
      images: data.project.cover_image_url ? [{ url: data.project.cover_image_url }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data || data.project.status !== 'published') notFound();

  const { project, images } = data;
  const site = await getPublicSiteData();

  // Prev / next within the published list, wrapping around.
  const list = site.projects;
  const index = list.findIndex((p) => p.id === project.id);
  const prev = index > 0 ? list[index - 1] : list[list.length - 1];
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : list[0];

  return (
    <ThemeProvider defaultTheme={site.settings.default_theme} tokens={site.settings.theme}>
      <SiteHeader
        wordmark={site.settings.wordmark || 'HIRUN HANSAKA'}
        ownerName={site.settings.owner_name || 'Hirun Hansaka'}
      />

      <main className="page-enter">
        <section className="shell" style={{ paddingTop: 'clamp(2rem, 5vw, 4rem)' }}>
          <Link href="/#work" className="link-arrow">
            ← Back to work
          </Link>

          <div style={{ marginTop: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem', alignItems: 'baseline' }}>
            <span className="eyebrow">{project.category || project.categories[0] || 'Project'}</span>
            <span className="meta">{project.categories.join(' / ')}</span>
            <span className="meta">{project.year}</span>
          </div>

          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', marginTop: '1rem' }}>
            {project.title}
          </h1>

          {project.short_description ? (
            <p className="lede" style={{ marginTop: '1.5rem', maxWidth: '54ch' }}>
              {project.short_description}
            </p>
          ) : null}
        </section>

        {project.cover_image_url ? (
          <section className="shell" style={{ paddingTop: 'clamp(2rem, 4vw, 3.5rem)' }}>
            <div style={{ border: '1px solid var(--line)', overflow: 'hidden', background: 'var(--bg-raised)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.cover_image_url}
                alt={`${project.title} cover`}
                style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover' }}
              />
            </div>
          </section>
        ) : null}

        <section className="shell section">
          <div className="about-grid">
            <div>
              <span className="eyebrow eyebrow--muted">Details</span>
              <div style={{ marginTop: '1rem' }}>
                <div className="contact-list">
                  <span className="cl-label" style={{ display: 'block', padding: '0.6rem 0', borderBottom: '1px solid var(--line)' }}>
                    <span className="meta">Year</span>
                    <span style={{ display: 'block', color: 'var(--fg)', fontSize: 'var(--step-0)', textTransform: 'none', letterSpacing: 0, marginTop: '0.2rem' }}>
                      {project.year || '—'}
                    </span>
                  </span>
                  <span style={{ display: 'block', padding: '0.6rem 0', borderBottom: '1px solid var(--line)' }}>
                    <span className="meta">Discipline</span>
                    <span style={{ display: 'block', marginTop: '0.2rem' }}>
                      {project.categories.length ? project.categories.join(', ') : project.category || '—'}
                    </span>
                  </span>
                </div>

                {project.technologies.length ? (
                  <div style={{ marginTop: '1.5rem' }}>
                    <span className="meta">Technologies</span>
                    <div className="tech-row" style={{ marginTop: '0.6rem' }}>
                      {project.technologies.map((t) => (
                        <span className="tech-pill" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.75rem' }}>
                  {project.live_url ? (
                    <a className="btn btn--accent" href={project.live_url} target="_blank" rel="noreferrer noopener">
                      View live site
                    </a>
                  ) : null}
                  {project.github_url ? (
                    <a className="btn" href={project.github_url} target="_blank" rel="noreferrer noopener">
                      GitHub
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              {project.intro ? (
                <div style={{ marginBottom: '2rem' }}>
                  <span className="eyebrow eyebrow--muted">Introduction</span>
                  <p className="body-muted" style={{ whiteSpace: 'pre-line', marginTop: '0.75rem', maxWidth: '62ch' }}>
                    {project.intro}
                  </p>
                </div>
              ) : null}
              {project.challenges ? (
                <div style={{ marginBottom: '2rem' }}>
                  <span className="eyebrow eyebrow--muted">Challenges</span>
                  <p className="body-muted" style={{ whiteSpace: 'pre-line', marginTop: '0.75rem', maxWidth: '62ch' }}>
                    {project.challenges}
                  </p>
                </div>
              ) : null}
              {project.process ? (
                <div>
                  <span className="eyebrow eyebrow--muted">Design &amp; development process</span>
                  <p className="body-muted" style={{ whiteSpace: 'pre-line', marginTop: '0.75rem', maxWidth: '62ch' }}>
                    {project.process}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {images.length ? (
          <section className="shell section">
            <span className="eyebrow eyebrow--muted">Gallery</span>
            <div className="modal-gallery" style={{ marginTop: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={img.id} src={img.image_url} alt={img.caption || `${project.title} detail`} loading="lazy" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="shell section">
          <div className="modal-nav" style={{ borderTop: '1px solid var(--line)' }}>
            {prev ? (
              <Link href={`/work/${prev.slug}`} style={{ padding: '1.25rem 0', borderRight: '1px solid var(--line)', display: 'block' }}>
                <span className="meta">← Previous</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)', marginTop: '0.3rem' }}>
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} style={{ padding: '1.25rem 0', display: 'block', textAlign: 'right' }}>
                <span className="meta">Next →</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: 'var(--step-2)', marginTop: '0.3rem' }}>
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>

      <BackToTop />

      <SiteFooter
        wordmark={site.settings.wordmark || 'HIRUN HANSAKA'}
        tagline={site.settings.footer_tagline || 'Designed with curiosity. Built with purpose.'}
        note={site.settings.footer_note}
        socials={site.socials}
      />
    </ThemeProvider>
  );
}
