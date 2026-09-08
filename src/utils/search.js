export const normalizeSearch = value => String(value ?? '').normalize('NFKC').trim().toLocaleLowerCase().replace(/[\s’'’.:·-]/g, '');
export function matchesPokemon(pokemon, query) {
    const text = normalizeSearch(query);
    if (!text) return true;
    if (/^#?\d+$/.test(text)) return pokemon.id === Number(text.replace('#', ''));
    return [pokemon.name, pokemon.ko].some(name => normalizeSearch(name).includes(text));
}
export const clampPage = (page, count, size) => Math.max(1, Math.min(page, Math.ceil(count / size) || 1));
export const validCatalog = data => Array.isArray(data) && data.length > 0 && data.every(p => Number.isInteger(p.id) && typeof p.name === 'string' && Number.isInteger(p.gen) && Array.isArray(p.types) && p.types.length > 0);
