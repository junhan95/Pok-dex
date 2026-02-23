import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPokemonDetails, fetchPokemonSpecies, getPokemonImageUrl, fetchEvolutionChain, fetchAllPokemonWithNames } from '../api/pokeApi';
import Loading from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import PokemonCard from '../components/PokemonCard';

const extractEvolutions = (node, acc = []) => {
    if (node && node.species) {
        const id = parseInt(node.species.url.split('/').filter(Boolean).pop());
        acc.push(id);
        if (node.evolves_to && node.evolves_to.length > 0) {
            node.evolves_to.forEach(child => extractEvolutions(child, acc));
        }
    }
    return acc;
};

const PokemonDetail = () => {
    const { id } = useParams();
    const { language, t } = useLanguage();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [evolutions, setEvolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Scroll to top when ID changes (important for navigating click to evolution card)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [pokeData, speciesData] = await Promise.all([
                    fetchPokemonDetails(id),
                    fetchPokemonSpecies(id)
                ]);
                setPokemon(pokeData);
                setSpecies(speciesData);

                // Fetch evolution chain
                if (speciesData && speciesData.evolution_chain?.url) {
                    const evoData = await fetchEvolutionChain(speciesData.evolution_chain.url);
                    const evoIds = extractEvolutions(evoData.chain);

                    const allPokemon = await fetchAllPokemonWithNames();
                    // Filter down to only evolution lineage pokemon, maintain order
                    const lineage = evoIds.map(eId => allPokemon.find(p => p.id === eId)).filter(Boolean);
                    setEvolutions(lineage);
                }

                setError(null);
            } catch (err) {
                setError("Failed to load Pokémon details. It might not exist.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <main className="container" style={{ padding: '4rem 0' }}><Loading /></main>;
    if (error) return <main className="container"><div className="error-message">{error}</div></main>;
    if (!pokemon) return null;

    const primaryImage = getPokemonImageUrl(pokemon.id);
    const fallbackImage = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;

    // Get flavor text and name dynamically based on selected language
    const langKey = language === 'ko' ? 'ko' : 'en';
    const flavorTextEntry = species?.flavor_text_entries.find(entry => entry.language.name === langKey) || species?.flavor_text_entries.find(entry => entry.language.name === 'en');
    const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f|\n/g, ' ') : 'No description available.';
    const localName = species?.names?.find(n => n.language.name === langKey)?.name || pokemon.name;

    // Dynamic page title for SEO
    useEffect(() => {
        if (localName && pokemon?.id) {
            document.title = `${localName} #${String(pokemon.id).padStart(4, '0')} | Pokédex - 포켓몬 도감`;
        }
        return () => {
            document.title = 'Pokédex - 포켓몬 도감 | 모든 세대 포켓몬 검색';
        };
    }, [localName, pokemon?.id]);

    return (
        <main className="container pokemon-detail-page">
            <Link to="/" className="btn-back">{t('back')}</Link>

            <div className="pokemon-detail-header glass">
                <div className="pokemon-detail-image-wrapper">
                    <img
                        src={primaryImage}
                        alt={localName}
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                        className="pokemon-detail-image"
                    />
                </div>

                <div className="pokemon-detail-info">
                    <span className="pokemon-detail-id">#{String(pokemon.id).padStart(4, '0')}</span>
                    <h1 className="pokemon-detail-name">{localName}</h1>

                    <div className="pokemon-types" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
                        {pokemon.types.map(tData => (
                            <span key={tData.type.name} className="type-badge" style={{ backgroundColor: `var(--type-${tData.type.name})` }}>
                                {t(`type_${tData.type.name}`)}
                            </span>
                        ))}
                    </div>

                    <p className="pokemon-description">{description}</p>

                    <div className="pokemon-physical-stats">
                        <div className="stat-box">
                            <span className="stat-label">{t('height')}</span>
                            <span className="stat-value">{pokemon.height / 10} m</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">{t('weight')}</span>
                            <span className="stat-value">{pokemon.weight / 10} kg</span>
                        </div>
                        <div className="stat-box">
                            <span className="stat-label">{t('abilities')}</span>
                            <span className="stat-value" style={{ textTransform: 'capitalize' }}>
                                {pokemon.abilities.map(a => a.ability.name.replace('-', ' ')).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pokemon-base-stats glass">
                <h2>{t('base_stats')}</h2>
                <div className="stats-container">
                    {pokemon.stats.map(stat => (
                        <div key={stat.stat.name} className="stat-bar-container">
                            <span className="stat-bar-label">{t(`stat_${stat.stat.name}`)}</span>
                            <span className="stat-bar-number">{stat.base_stat}</span>
                            <div className="stat-bar-track">
                                <div
                                    className="stat-bar-fill"
                                    style={{
                                        width: `${Math.min(100, (stat.base_stat / 255) * 100)}%`,
                                        backgroundColor: `var(--type-${pokemon.types[0].type.name})`
                                    }}
                                    role="progressbar"
                                    aria-valuenow={stat.base_stat}
                                    aria-valuemin="0"
                                    aria-valuemax="255"
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Evolutions Section */}
            {evolutions.length > 1 && (
                <div className="pokemon-evolutions" style={{ marginTop: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                        {language === 'ko' ? '연관 몬스터 (발전형)' : 'Related Monsters (Evolutions)'}
                    </h2>
                    <div className="pokemon-grid">
                        {evolutions.map((evo, index) => (
                            <PokemonCard key={evo.id} pokemon={evo} index={index} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
};

export default PokemonDetail;
