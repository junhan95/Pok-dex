// prerender.js
// Post-build script that uses Puppeteer to pre-render key pages to static HTML
// This allows search engines to see fully rendered content without JS execution

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';

const DIST_DIR = resolve('dist');
const PORT = 4567;
const DOMAIN = 'https://pokemon-drawing-book.com';

// Key pages to prerender (homepage + popular Pokemon)
const ROUTES = [
    '/',
    '/pokemon/1', '/pokemon/2', '/pokemon/3',     // Bulbasaur line
    '/pokemon/4', '/pokemon/5', '/pokemon/6',     // Charmander line
    '/pokemon/7', '/pokemon/8', '/pokemon/9',     // Squirtle line
    '/pokemon/25', '/pokemon/26',                  // Pikachu, Raichu
    '/pokemon/130',                                // Gyarados
    '/pokemon/143',                                // Snorlax
    '/pokemon/150', '/pokemon/151',                // Mewtwo, Mew
    // Gen II starters
    '/pokemon/152', '/pokemon/155', '/pokemon/158',
    '/pokemon/249', '/pokemon/250',                // Lugia, Ho-oh
    // Gen III starters
    '/pokemon/252', '/pokemon/255', '/pokemon/258',
    '/pokemon/384',                                // Rayquaza
    // Gen IV starters
    '/pokemon/387', '/pokemon/390', '/pokemon/393',
    // Gen V starters
    '/pokemon/495', '/pokemon/498', '/pokemon/501',
    // Gen VI starters
    '/pokemon/650', '/pokemon/653', '/pokemon/656',
    // Gen VII starters
    '/pokemon/722', '/pokemon/725', '/pokemon/728',
    // Gen VIII starters
    '/pokemon/810', '/pokemon/813', '/pokemon/816',
    // Gen IX starters
    '/pokemon/906', '/pokemon/909', '/pokemon/912',
];

// Simple static file server for the dist folder
function createStaticServer() {
    const mimeTypes = {
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
        '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
        '.xml': 'application/xml', '.txt': 'text/plain',
    };

    return createServer((req, res) => {
        let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

        // SPA fallback: serve index.html for non-file routes
        if (!existsSync(filePath) || (!extname(filePath) && !existsSync(filePath))) {
            filePath = join(DIST_DIR, 'index.html');
        }

        try {
            const content = readFileSync(filePath);
            const ext = extname(filePath);
            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
            res.end(content);
        } catch {
            // Fallback to index.html for SPA routes
            const content = readFileSync(join(DIST_DIR, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
}

async function prerender() {
    console.log('🚀 Starting prerender...');

    const server = createStaticServer();
    await new Promise(r => server.listen(PORT, r));
    console.log(`📡 Static server running on port ${PORT}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    let rendered = 0;
    for (const route of ROUTES) {
        try {
            const page = await browser.newPage();
            await page.goto(`http://localhost:${PORT}${route}`, {
                waitUntil: 'networkidle0',
                timeout: 30000,
            });

            // Wait for React to render content
            await page.waitForSelector('#root > *', { timeout: 15000 });

            // For Pokemon detail pages, wait for the actual content to load
            if (route !== '/') {
                try {
                    await page.waitForSelector('.pokemon-detail-page', { timeout: 15000 });
                } catch { /* homepage or loading state */ }
            }

            // Wait for dynamic meta tags to settle
            await new Promise(r => setTimeout(r, 2000));

            const html = await page.content();

            // Determine output path
            const outputDir = route === '/'
                ? DIST_DIR
                : join(DIST_DIR, ...route.split('/').filter(Boolean));

            mkdirSync(outputDir, { recursive: true });
            writeFileSync(join(outputDir, 'index.html'), html);

            rendered++;
            console.log(`  ✅ [${rendered}/${ROUTES.length}] ${route}`);
            await page.close();
        } catch (err) {
            console.error(`  ❌ Failed: ${route} - ${err.message}`);
        }
    }

    await browser.close();
    server.close();
    console.log(`\n🎉 Prerendered ${rendered}/${ROUTES.length} pages`);
}

prerender().catch(console.error);
