import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes to prerender
const routes = [
  '/',
  '/games',
  '/about',
  '/contact',
  '/my-games',
  '/terms',
  '/game'
];

// Read the built index.html
const indexPath = join(__dirname, '../dist/index.html');
const indexHtml = readFileSync(indexPath, 'utf8');

// Create prerendered files for each route
routes.forEach(route => {
  const routeDir = join(__dirname, '../dist', route);
  
  // Create directory if it doesn't exist
  if (!existsSync(routeDir)) {
    mkdirSync(routeDir, { recursive: true });
  }
  
  // Write index.html for the route
  const routeIndexPath = join(routeDir, 'index.html');
  writeFileSync(routeIndexPath, indexHtml);
  
  console.log(`✅ Prerendered: ${route}`);
});

console.log('🎉 Prerendering completed!');
