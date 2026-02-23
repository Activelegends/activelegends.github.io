# SEO & Prerender Guide — Active Legend

## Adding a new public page

1. **Register the route** in `scripts/seo-routes.json`:
   ```json
   { "path": "/your-page", "priority": 0.8, "changefreq": "monthly" }
   ```
   - `priority`: 0.0–1.0 (homepage usually 1.0)
   - `changefreq`: `always` | `hourly` | `daily` | `weekly` | `monthly` | `yearly` | `never`

2. **Regenerate sitemap** (optional; keeps `lastmod` fresh):
   ```bash
   npm run sitemap:generate
   ```
   This overwrites `public/sitemap.xml` from `scripts/seo-routes.json`.

3. **Prerender** uses the same JSON; running `npm run build:prerender` will create `dist/your-page/index.html`.

4. **In the new page component** add:
   - `<Helmet>` with `title`, `meta name="description"`, `link rel="canonical"`, and Open Graph / Twitter tags
   - One visible `<h1>` per page
   - `alt` on all images (or fallbacks in shared components)

## Route sources

- **Prerender:** `scripts/prerender.js` reads `scripts/seo-routes.json`.
- **Sitemap:** `public/sitemap.xml` can be hand-edited or regenerated with `npm run sitemap:generate` (from `scripts/seo-routes.json`).
- **App routing:** Still defined only in `src/App.tsx`; add new `<Route>` there as usual.

## JSON-LD (schema.org)

- **Home (Hero):** `WebSite` + `Organization` in `src/components/Hero.tsx`.
- **About:** `Organization` in `src/pages/About.tsx`.
- **Game detail:** `VideoGame` in `src/pages/GameDetail.tsx` (when game is loaded).

## Crawlability

- Internal links use React Router `<Link to="...">` (SPA); prerendered `index.html` per route lets crawlers see each URL.
- `public/robots.txt`: allows public paths, disallows `/admin/` and `/team-admin/`, points to `Sitemap: https://activelegend.ir/sitemap.xml`.

## Build & deploy

- **Build only:** `npm run build`
- **Build + prerender:** `npm run build:prerender`
- **Deploy:** `npm run deploy` (uses `predeploy` → `build:prerender`)
