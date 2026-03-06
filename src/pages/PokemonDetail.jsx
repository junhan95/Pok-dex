import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPokemonDetails, fetchPokemonSpecies, getPokemonImageUrl, fetchEvolutionChain, fetchAllPokemonWithNames } from '../api/pokeApi';
import Loading from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';
import useSEO from '../hooks/useSEO';

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

// 폼 이름/레이블 파싱
const getFormInfo = (variantName, baseKoName, baseName) => {
    const suffix = variantName.replace(baseName + '-', '');
    const map = {
        'mega': { displayName: `메가${baseKoName}`, label: null },
        'mega-x': { displayName: `메가${baseKoName} X`, label: null },
        'mega-y': { displayName: `메가${baseKoName} Y`, label: null },
        'gmax': { displayName: baseKoName, label: '거다이맥스의 모습' },
        'alola': { displayName: baseKoName, label: '알로라의 모습' },
        'galar': { displayName: baseKoName, label: '가라르의 모습' },
        'hisui': { displayName: baseKoName, label: '히스이의 모습' },
        'paldea': { displayName: baseKoName, label: '팔데아의 모습' },
        'paldea-combat': { displayName: baseKoName, label: '팔데아의 모습 (격투)' },
        'paldea-blaze': { displayName: baseKoName, label: '팔데아의 모습 (화염)' },
        'paldea-aqua': { displayName: baseKoName, label: '팔데아의 모습 (수중)' },
    };
    return map[suffix] || { displayName: variantName, label: null };
};

const PokemonDetail = () => {
    const { id } = useParams();
    const { language, t } = useLanguage();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [evolutions, setEvolutions] = useState([]);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const pokeData = await fetchPokemonDetails(id);
                const speciesId = parseInt(pokeData.species.url.split('/').filter(Boolean).pop());
                const speciesData = await fetchPokemonSpecies(speciesId);
                setPokemon(pokeData);
                setSpecies(speciesData);

                // 진화 체인
                if (speciesData && speciesData.evolution_chain?.url) {
                    const evoData = await fetchEvolutionChain(speciesData.evolution_chain.url);
                    const evoIds = extractEvolutions(evoData.chain);
                    const allPokemon = await fetchAllPokemonWithNames();
                    const lineage = evoIds.map(eId => allPokemon.find(p => p.id === eId)).filter(Boolean);
                    setEvolutions(lineage);
                }

                // 모습(폼) – 기본종 기준으로 조회 (폼페이지에서도 올바르게 동작)
                if (speciesData.varieties && speciesData.varieties.length > 1) {
                    const formDetails = await Promise.all(
                        speciesData.varieties.map(async (v) => {
                            const fId = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
                            const details = await fetchPokemonDetails(v.pokemon.name);
                            return {
                                id: fId,
                                name: v.pokemon.name,
                                isDefault: v.is_default,
                                types: details.types.map(t => t.type.name),
                            };
                        })
                    );
                    setForms(formDetails);
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

    const langKey = language === 'ko' ? 'ko' : 'en';
    const flavorTextEntry = species?.flavor_text_entries?.find(entry => entry.language.name === langKey) || species?.flavor_text_entries?.find(entry => entry.language.name === 'en');
    const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f|\n/g, ' ') : '';
    const speciesLocalName = species?.names?.find(n => n.language.name === langKey)?.name || pokemon?.name || '';
    // 폼 페이지 진입 시: species 영문명과 pokemon 영문명이 다르면 폼 표시명 적용
    const isForm = pokemon && species && pokemon.name !== species.name;
    const localName = isForm
        ? getFormInfo(pokemon.name, speciesLocalName, species.name).displayName
        : speciesLocalName;

    const seoDescription = (() => {
        if (!pokemon) return '';
        const types = pokemon.types?.map(t => t.type.name).join('/') || '';
        const stats = pokemon.stats?.map(s => {
            const names = { hp: 'HP', attack: '공격', defense: '방어', 'special-attack': '특공', 'special-defense': '특방', speed: '스피드' };
            return `${names[s.stat.name] || s.stat.name} ${s.base_stat}`;
        }).join(' / ') || '';
        const size = `${pokemon.height / 10}m, ${pokemon.weight / 10}kg`;
        const evoNames = evolutions.length > 1 ? evolutions.map(e => e.ko || e.name).join(' → ') : '';
        const parts = [
            `${localName} #${String(pokemon.id).padStart(4, '0')}`,
            types ? `타입: ${types}` : '',
            stats ? `능력치: ${stats}` : '',
            size,
            evoNames ? `진화: ${evoNames}` : '',
        ].filter(Boolean);
        return parts.join(' | ');
    })();

    useSEO(pokemon ? {
        title: `${localName} #${String(pokemon.id).padStart(4, '0')} | Pokédex - 포켓몬 도감`,
        description: seoDescription,
        image: getPokemonImageUrl(pokemon.id),
        url: `https://pokemon-drawing-book.com/pokemon/${pokemon.id}`,
    } : undefined);

    if (loading) return <main className="container" style={{ padding: '4rem 0' }}><Loading /></main>;
    if (error) return <main className="container"><div className="error-message">{error}</div></main>;
    if (!pokemon) return null;

    const primaryImage = getPokemonImageUrl(pokemon.id);
    const fallbackImage = pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default;
    const baseName = species?.name || pokemon.name; // 항상 기본종 영문명 사용

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

            {/* 진화 섹션 */}
            {evolutions.length > 1 && (
                <div className="pokemon-section">
                    <h2 className="section-title">
                        <span className="section-title-icon">🔴</span>
                        {language === 'ko' ? '진화' : 'Evolution'}
                    </h2>
                    <div className="evo-chain">
                        {evolutions.map((evo, index) => (
                            <React.Fragment key={evo.id}>
                                <Link to={`/pokemon/${evo.id}`} className="evo-card">
                                    <div className="evo-img-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '120px' }}>
                                        <img
                                            src={getPokemonImageUrl(evo.id)}
                                            alt={evo.ko || evo.name}
                                            className="evo-card-img"
                                            style={{ width: '110px', height: '110px', objectFit: 'contain' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`; }}
                                        />
                                    </div>
                                    <p className="evo-card-no">No. {String(evo.id).padStart(4, '0')}</p>
                                    <p className="evo-card-name">{evo.ko || evo.name}</p>
                                    <div className="evo-card-types">
                                        {evo.types.map(typeName => (
                                            <span key={typeName} className="type-badge" style={{ backgroundColor: `var(--type-${typeName})` }}>
                                                {t(`type_${typeName}`)}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                                {index < evolutions.length - 1 && (
                                    <span className="evo-arrow">›</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* 모습(폼) 섹션 */}
            {forms.length > 1 && (
                <div className="pokemon-section">
                    <h2 className="section-title">
                        <span className="section-title-icon">🔴</span>
                        {language === 'ko' ? '모습' : 'Forms'}
                    </h2>
                    <div className="forms-grid">
                        {forms.map((form) => {
                            const { displayName, label } = form.isDefault
                                ? { displayName: speciesLocalName, label: null }
                                : getFormInfo(form.name, speciesLocalName, baseName);
                            return (
                                <Link key={form.id} to={`/pokemon/${form.id}`} className="evo-card">
                                    <div className="evo-img-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '120px' }}>
                                        <img
                                            src={getPokemonImageUrl(form.id)}
                                            alt={displayName}
                                            className="evo-card-img"
                                            style={{ width: '110px', height: '110px', objectFit: 'contain' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${form.id}.png`; }}
                                        />
                                    </div>
                                    <p className="evo-card-no">No. {String(species.id).padStart(4, '0')}</p>
                                    <p className="evo-card-name">{displayName}</p>
                                    {label && <p className="form-label">{label}</p>}
                                    <div className="evo-card-types">
                                        {form.types.map(typeName => (
                                            <span key={typeName} className="type-badge" style={{ backgroundColor: `var(--type-${typeName})` }}>
                                                {t(`type_${typeName}`)}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>
    );
};

export default PokemonDetail;
