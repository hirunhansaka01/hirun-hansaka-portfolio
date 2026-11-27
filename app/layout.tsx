import type { Metadata, Viewport } from 'next';
import { Josefin_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getSettings } from '../lib/queries';
import SiteChrome from '../components/site/SiteChrome';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.site_title || 'Hirun Hansaka — The Digital Canvas';
  const description =
    s.meta_description ||
    'Personal portfolio of Hirun Hansaka — Sri Lankan web developer, graphic designer, and visual content creator.';

  return {
    title: {
      default: title,
      template: `%s — ${s.owner_name || 'Hirun Hansaka'}`,
    },
    description,
    applicationName: s.owner_name || 'Hirun Hansaka',
    authors: [{ name: s.owner_name || 'Hirun Hansaka' }],
    keywords: [
      'Hirun Hansaka',
      'Sri Lankan web developer',
      'portfolio',
      'graphic designer',
      'UI UX designer',
      'creative developer',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: s.owner_name || 'Hirun Hansaka',
      images: s.og_image_url ? [{ url: s.og_image_url }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: s.og_image_url ? [s.og_image_url] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: '#0B0B0B',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Set the theme before paint so there is no flash of the wrong mode.
 */
const THEME_BOOT = `(function(){var h=document.documentElement;try{var t=localStorage.getItem('hh-theme');if(t!=='light'&&t!=='dark'){t='__DEFAULT__';}h.dataset.theme=t;}catch(e){h.dataset.theme='__DEFAULT__';}h.dataset.intro='running';})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const boot = THEME_BOOT.replace(/__DEFAULT__/g, settings.default_theme || 'dark');

  return (
    <html
      lang="en"
      data-theme={settings.default_theme || 'dark'}
      className={`${josefin.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <SiteChrome name={settings.owner_name || 'Hirun Hansaka'} />
        {children}
      </body>
    </html>
  );
}
