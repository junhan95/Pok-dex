import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPokemonDetails, fetchPokemonSpecies, getPokemonImageUrl, fetchEvolutionChain, fetchAllPokemonWithNames, fetchLocalizedResource } from '../api/pokeApi';
import Loading from '../components/Loading';
import {PokemonMedia, PokemonInsights, EvolutionPaths} from '../components/PokemonContent';
import PokemonGameData from '../components/PokemonGameData';
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

import { localizedName, formInfo } from '../utils/pokemonLocalization';

const PokemonDetail = () => {
    const { id } = useParams();
    const { language, t } = useLanguage();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [evolutionTree, setEvolutionTree] = useState(null);
    const [evolutions, setEvolutions] = useState([]);
    const [forms, setForms] = useState([]);
    const [abilityNames, setAbilityNames] = useState({});
    const [currentForm, setCurrentForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        let active = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                setEvolutionTree(null); setEvolutions([]); setForms([]); setAbilityNames({}); setCurrentForm(null);
                const pokeData = await fetchPokemonDetails(id);
                const speciesId = parseInt(pokeData.species.url.split('/').filter(Boolean).pop());
                const speciesData = await fetchPokemonSpecies(speciesId);
                if (!active) return;
                setPokemon(pokeData);
                setSpecies(speciesData);

                const abilityEntries = await Promise.all(pokeData.abilities.map(async a => [a.ability.name, await fetchLocalizedResource('ability', a.ability.name).catch(() => null)]));
                if (!active) return;
                setAbilityNames(Object.fromEntries(abilityEntries));
                const formData = pokeData.forms?.[0] ? await fetchLocalizedResource('pokemon-form', pokeData.forms[0].name).catch(() => null) : null;
                if (!active) return;
                setCurrentForm(formData);

                // 진화 체인
                if (speciesData && speciesData.evolution_chain?.url) {
                    const evoData = await fetchEvolutionChain(speciesData.evolution_chain.url);
                    const evoIds = extractEvolutions(evoData.chain);
                    const allPokemon = await fetchAllPokemonWithNames();
                    const lineage = evoIds.map(eId => allPokemon.find(p => p.id === eId)).filter(Boolean);
                    if (!active) return;
                    setEvolutions(lineage);
                    setEvolutionTree(evoData.chain);
                }

                // 모습(폼) – 기본종 기준으로 조회 (폼페이지에서도 올바르게 동작)
                if (speciesData.varieties && speciesData.varieties.length > 1) {
                    const formDetails = await Promise.all(
                        speciesData.varieties.map(async (v) => {
                            const fId = parseInt(v.pokemon.url.split('/').filter(Boolean).pop());
                            const details = await fetchPokemonDetails(v.pokemon.name);
                            const localized = details.forms?.[0] ? await fetchLocalizedResource('pokemon-form', details.forms[0].name).catch(() => null) : null;
                            return {
                                id: fId,
                                name: v.pokemon.name,
                                isDefault: v.is_default,
                                localized,
                                types: details.types.map(t => t.type.name),
                            };
                        })
                    );
                    if (!active) return;
                    setForms(formDetails);
                }

                setError(null);
            } catch {
                if (active) setError(true);
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchData();
        return () => { active = false; };
    }, [id]);

    const langKey = language === 'ko' ? 'ko' : 'en';
    const flavorTextEntry = species?.flavor_text_entries?.find(entry => entry.language.name === langKey) || species?.flavor_text_entries?.find(entry => entry.language.name === 'en');
    const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\s+/g, ' ') : (language === 'ko' ? '제공되는 도감 설명이 없습니다.' : 'No Pokédex description is available.');
    const speciesLocalName = species?.names?.find(n => n.language.name === langKey)?.name || pokemon?.name || '';
    // 폼 페이지 진입 시: species 영문명과 pokemon 영문명이 다르면 폼 표시명 적용
    const isForm = pokemon && species && pokemon.name !== species.name;
    const localName = isForm
        ? formInfo(currentForm, speciesLocalName, language).displayName
        : speciesLocalName;

    const seoDescription = (() => {
        if (!pokemon) return '';
        const types = pokemon.types?.map(type => t(`type_${type.type.name}`)).join('/') || '';
        const stats = pokemon.stats?.map(s => {
            return `${t(`stat_${s.stat.name}`)} ${s.base_stat}`;
        }).join(' / ') || '';
        const size = `${pokemon.height / 10}m, ${pokemon.weight / 10}kg`;
        const evoNames = evolutions.length > 1 ? evolutions.map(e => language === 'ko' ? (e.ko || e.name) : e.name).join(', ') : '';
        const parts = [
            `${localName} #${String(pokemon.id).padStart(4, '0')}`,
            types ? `${language === 'ko' ? '타입' : 'Types'}: ${types}` : '',
            stats ? `${t('base_stats')}: ${stats}` : '',
            size,
            evoNames ? `${language === 'ko' ? '진화' : 'Evolution'}: ${evoNames}` : '',
        ].filter(Boolean);
        return parts.join(' | ');
    })();

    useSEO(pokemon ? {
        title: `${localName} #${String(pokemon.id).padStart(4, '0')} | ${language === 'ko' ? 'Pokédex - 포켓몬 도감' : 'Pokédex'}`,
        description: seoDescription,
        image: getPokemonImageUrl(pokemon.id),
        url: `https://pokemon-drawing-book.com/pokemon/${pokemon.id}`,
    } : undefined);

    if (loading) return <main className="container" style={{ padding: '4rem 0' }}><Loading /></main>;
    if (error) return <main className="container"><div className="error-message" role="alert">{language === 'ko' ? '포켓몬 정보를 불러오지 못했습니다. 주소를 확인하거나 잠시 후 다시 시도하세요.' : 'Unable to load this Pokémon. Check the address or try again later.'}</div><Link to="/" className="btn-back">{t('back')}</Link></main>;
    if (!pokemon) return null;



    return (
        <main className="container pokemon-detail-page">
            <Link to="/" className="btn-back">{t('back')}</Link>

            <div className="pokemon-detail-header glass">
                <PokemonMedia key={pokemon.id} pokemon={pokemon} name={localName} />

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

                    <p className="pokemon-description" lang={flavorTextEntry?.language.name || language}>{description}</p>
                    {flavorTextEntry && flavorTextEntry.language.name !== language && <p>{language === 'ko' ? '한국어 설명이 없어 영어 원문을 표시합니다.' : 'Showing the available original description.'}</p>}
                    {isForm && formInfo(currentForm, speciesLocalName, language).label && <p className="form-label">{formInfo(currentForm, speciesLocalName, language).label}</p>}

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
                                {pokemon.abilities.map(a => `${localizedName(abilityNames[a.ability.name]?.names, language, a.ability.name.replaceAll('-', ' '))}${a.is_hidden ? (language === 'ko' ? ' (숨겨진 특성)' : ' (Hidden Ability)') : ''}`).join(', ')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <PokemonInsights key={pokemon.id} pokemon={pokemon} species={species} abilities={abilityNames} />

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
                                    aria-label={t(`stat_${stat.stat.name}`)}
                                    aria-valuenow={stat.base_stat}
                                    aria-valuemin="0"
                                    aria-valuemax="255"
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <EvolutionPaths key={pokemon.id} tree={evolutionTree} names={evolutions} />

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
                                : formInfo(form.localized, speciesLocalName, language);
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
            <PokemonGameData key={pokemon.id} pokemon={pokemon} />
        </main>
    );
};

export default PokemonDetail;
