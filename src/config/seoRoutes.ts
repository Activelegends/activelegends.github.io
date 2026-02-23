/**
 * Single source of truth for public SEO routes.
 * Used by: prerender script, sitemap generation, and any SEO tooling.
 * Add new public pages here to keep prerender + sitemap in sync.
 */
const SITE_URL = 'https://activelegend.ir';

export interface SeoRoute {
  path: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

export const SEO_ROUTES: SeoRoute[] = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/games', priority: 0.9, changefreq: 'weekly' },
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/my-games', priority: 0.7, changefreq: 'weekly' },
  { path: '/terms', priority: 0.6, changefreq: 'yearly' },
  { path: '/game', priority: 0.5, changefreq: 'monthly' },
];

export { SITE_URL };
