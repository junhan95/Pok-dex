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

export const fetchAllPokemonWithNames = async () => {
    if (allPokemonCache) return allPokemonCache;

    const query = `
    query {
      ko: pokemon_v2_pokemonspeciesname(where: {language_id: { _eq: 3 }}) {
        id: pokemon_species_id
        name
      }
      en: pokemon_v2_pokemonspeciesname(where: {language_id: { _eq: 9 }}) {
        id: pokemon_species_id
        name
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

        const map = {};
        json.data.en.forEach(item => {
            map[item.id] = { id: item.id, name: item.name.toLowerCase() };
        });
        json.data.ko.forEach(item => {
            if (map[item.id]) {
                map[item.id].ko = item.name;
            }
        });

        allPokemonCache = Object.values(map).sort((a, b) => a.id - b.id);
        return allPokemonCache;
    } catch (e) {
        console.error('GraphQL fetch failed, falling back to REST list', e);
        const fallback = await fetchPokemonList(1300, 0);
        allPokemonCache = fallback.results.map(p => {
            const parts = p.url.split('/');
            const id = parseInt(parts[parts.length - 2]);
            return { id, name: p.name, ko: p.name };
        });
        return allPokemonCache;
    }
};

export const fetchPokemonDetails = async (nameOrId) => {
    try {
        const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
        if (!response.ok) throw new Error(`Failed to fetch details for ${nameOrId}`);
        return await response.json();
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
