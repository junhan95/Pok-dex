// pokeApi.js
// Service to fetch data from PokeAPI

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (limit = 20, offset = 0) => {
    try {
        const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch pokemon list');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching pokemon list:', error);
        throw error;
    }
};

let allPokemonCache = null;
const CACHE_KEY_ALL_POKEMON = 'pokedex_all_pokemon_data';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const fetchAllPokemonWithNames = async () => {
    if (allPokemonCache) return allPokemonCache;

    // Check localStorage cache
    try {
        const cached = localStorage.getItem(CACHE_KEY_ALL_POKEMON);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TTL_MS) {
                allPokemonCache = data;
                return data;
            } else {
                localStorage.removeItem(CACHE_KEY_ALL_POKEMON);
            }
        }
    } catch (e) {
        console.warn('Failed to read from localStorage cache', e);
    }

    const query = `
    query {
      pokemon: pokemon_v2_pokemonspecies(order_by: {id: asc}) {
        id
        generation_id
        names: pokemon_v2_pokemonspeciesnames(where: {language_id: {_in: [3, 9]}}) {
          name
          language_id
        }
        pokemons: pokemon_v2_pokemons(limit: 1) {
          types: pokemon_v2_pokemontypes(order_by: {slot: asc}) {
            type: pokemon_v2_type {
              name
            }
          }
        }
      }
    }
    `;
    try {
        const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const json = await response.json();

        allPokemonCache = json.data.pokemon.map(species => {
            const enName = species.names.find(n => n.language_id === 9);
            const koName = species.names.find(n => n.language_id === 3);
            const pokemon = species.pokemons[0];
            const types = pokemon ? pokemon.types.map(t => t.type.name) : [];

            return {
                id: species.id,
                name: enName ? enName.name.toLowerCase() : `pokemon-${species.id}`,
                ko: koName ? koName.name : null,
                types,
                gen: species.generation_id
            };
        });

        // Save to cache
        try {
            localStorage.setItem(CACHE_KEY_ALL_POKEMON, JSON.stringify({
                data: allPokemonCache,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to save to localStorage cache', e);
        }

        return allPokemonCache;
    } catch (e) {
        console.error('GraphQL fetch failed, falling back to REST list', e);
        const fallback = await fetchPokemonList(1300, 0);
        allPokemonCache = fallback.results.map(p => {
            const parts = p.url.split('/');
            const id = parseInt(parts[parts.length - 2]);
            return { id, name: p.name, ko: p.name, types: [] };
        });
        return allPokemonCache;
    }
};

const detailsCache = new Map();

export const fetchPokemonDetails = async (nameOrId) => {
    const key = String(nameOrId);
    if (detailsCache.has(key)) return detailsCache.get(key);

    try {
        const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
        if (!response.ok) throw new Error(`Failed to fetch details for ${nameOrId}`);
        const data = await response.json();
        detailsCache.set(key, data);
        return data;
    } catch (error) {
        console.error(`Error fetching details for ${nameOrId}:`, error);
        throw error;
    }
};

export const fetchPokemonSpecies = async (nameOrId) => {
    try {
        const response = await fetch(`${BASE_URL}/pokemon-species/${nameOrId}`);
        if (!response.ok) throw new Error(`Failed to fetch species for ${nameOrId}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching species for ${nameOrId}:`, error);
        throw error;
    }
};

export const fetchEvolutionChain = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch evolution chain');
        return await response.json();
    } catch (error) {
        console.error('Error fetching evolution chain:', error);
        throw error;
    }
};

export const fetchPokemonType = async (typeName) => {
    try {
        const response = await fetch(`${BASE_URL}/type/${typeName}`);
        if (!response.ok) throw new Error(`Failed to fetch type ${typeName}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching type ${typeName}:`, error);
        throw error;
    }
};

// Helper to get image URL directly as raw data fetching can be slow for all images
export const getPokemonImageUrl = (id) => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
};
