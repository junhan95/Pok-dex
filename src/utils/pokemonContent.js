export function defenseMultipliers(types) {
    const result = {};
    for (const type of types) {
        for (const [key, multiplier] of [['double_damage_from', 2], ['half_damage_from', .5], ['no_damage_from', 0]]) {
            for (const other of type.damage_relations[key]) result[other.name] = (result[other.name] ?? 1) * multiplier;
        }
    }
    return result;
}
export function evolutionEdges(node) {
    return (node?.evolves_to || []).flatMap(child => [{ from: node.species, to: child.species, conditions: child.evolution_details || [] }, ...evolutionEdges(child)]);
}
export const resourceId = resource => resource.url.split('/').filter(Boolean).pop();
export const localizedText = (entries, language, field = 'flavor_text') => {
    const entry = entries?.find(e => e.language.name === language) || entries?.find(e => e.language.name === 'en');
    return entry ? {text: entry[field]?.replace(/\s+/g, ' ') || '', language: entry.language.name} : null;
};
