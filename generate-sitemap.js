// generate-sitemap.js
// Fetches all Pokemon IDs from PokeAPI GraphQL and generates a full sitemap.xml

const DOMAIN = 'https://pokemon-drawing-book.com';

async function generateSitemap() {
    console.log('📍 Fetching all Pokemon IDs from PokeAPI...');

    const query = `
    query {
      pokemon: pokemon_v2_pokemonspecies(order_by: {id: asc}) {
        id
      }
    }
    `;

    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await response.json();
    const pokemonIds = json.data.pokemon.map(p => p.id);

    console.log(`✅ Found ${pokemonIds.length} Pokemon`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Homepage
    xml += `  <url>\n    <loc>${DOMAIN}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // All Pokemon pages
    for (const id of pokemonIds) {
        xml += `  <url>\n    <loc>${DOMAIN}/pokemon/${id}</loc>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>\n`;

    const fs = await import('fs');
    const path = await import('path');

    // Write to both public/ (for dev) and dist/ (for deploy)
    const publicPath = path.resolve('public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xml);
    console.log(`📝 Written to ${publicPath}`);

    const distPath = path.resolve('dist', 'sitemap.xml');
    if (fs.existsSync(path.resolve('dist'))) {
        fs.writeFileSync(distPath, xml);
        console.log(`📝 Written to ${distPath}`);
    }

    console.log(`🗺️  Sitemap generated with ${pokemonIds.length + 1} URLs`);
}

generateSitemap().catch(console.error);
