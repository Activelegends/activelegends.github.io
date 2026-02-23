import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://activelegend.ir';

const routes = JSON.parse(readFileSync(join(__dirname, 'seo-routes.json'), 'utf8'));
const lastmod = new Date().toISOString().split('T')[0];

const urlEntries = routes
  .map(
    (r) => `  <url>
    <loc>${SITE_URL}${r.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <priority>${r.priority}</priority>
    <changefreq>${r.changefreq}</changefreq>
  </url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

writeFileSync(join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('✅ sitemap.xml generated from scripts/seo-routes.json');
console.log(`   ${routes.length} URLs written to public/sitemap.xml`);