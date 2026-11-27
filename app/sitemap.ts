import type { MetadataRoute } from 'next';
import { getPublicSiteData } from '../lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://hirun-hansaka.vercel.app';
  let projects: { slug: string; updated_at: string }[] = [];
  try {
    const data = await getPublicSiteData();
    projects = data.projects.map((p) => ({ slug: p.slug, updated_at: p.updated_at }));
  } catch {
    /* sitemap still works without project entries */
  }

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
