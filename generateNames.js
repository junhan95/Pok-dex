import fs from 'fs';
import https from 'https';

async function fetchNames() {
    const query = `
  query {
    ko: pokemon_v2_pokemonspeciesname(where: {language_id: { _eq: 3 }}) {
      pokemon_species_id
      name
    }
    en: pokemon_v2_pokemonspeciesname(where: {language_id: { _eq: 9 }}) {
      pokemon_species_id
      name
    }
  }
  `;

    const options = {
        hostname: 'beta.pokeapi.co',
        path: '/graphql/v1beta',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Node.js Script'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                const map = {};

                json.data.en.forEach(item => {
                    map[item.pokemon_species_id] = { id: item.pokemon_species_id, en: item.name.toLowerCase() };
                });

                json.data.ko.forEach(item => {
                    if (map[item.pokemon_species_id]) {
                        map[item.pokemon_species_id].ko = item.name;
                    }
                });

                const arr = Object.values(map).sort((a, b) => a.id - b.id);

                if (!fs.existsSync('src/data')) fs.mkdirSync('src/data');
                fs.writeFileSync('src/data/pokemonNames.json', JSON.stringify(arr, null, 2));
                console.log(`Successfully generated pokemonNames.json with ${arr.length} entries`);
            } catch (e) {
                console.error("Parse Error:", e);
            }
        });
    });

    req.on('error', (e) => { console.error("Request Error:", e); });
    req.write(JSON.stringify({ query }));
    req.end();
}

fetchNames();
