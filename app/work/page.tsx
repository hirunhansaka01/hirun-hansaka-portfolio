import type { Metadata } from 'next';
import ThemeProvider from '../../components/site/ThemeProvider';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import BackToTop from '../../components/site/BackToTop';
import AllProjects from '../../components/site/AllProjects';
import { getPublicSiteData } from '../../lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Work',
  description: 'Every project — web development, UI/UX, graphic design, applications and experiments.',
};

export default async function WorkIndexPage() {
  const { settings, projects, projectImages, socials } = await getPublicSiteData();

  return (
    <ThemeProvider defaultTheme={settings.default_theme} tokens={settings.theme}>
      <SiteHeader wordmark={settings.wordmark || 'HIRUN HANSAKA'} ownerName={settings.owner_name || 'Hirun Hansaka'} />
      <main className="page-enter">
        <section className="shell" style={{ paddingTop: 'clamp(2.5rem, 6vw, 5rem)', paddingBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <span className="eyebrow">Archive</span>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)', marginTop: '1rem' }}>
            ALL
            <br />
            <span className="accent">PROJECTS.</span>
          </h1>
          <p className="lede" style={{ marginTop: '1.5rem' }}>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} built and shipped — or
            still being tinkered with.
          </p>
        </section>

        <section className="shell" style={{ paddingBottom: 'clamp(4rem, 8vw, 8rem)' }}>
          <AllProjects projects={projects} images={projectImages} />
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
