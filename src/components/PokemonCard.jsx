import React, { useEffect, useRef, useState } from 'react';
import { fetchPokemonDetails, fetchPokemonSpecies, fetchLocalizedResource, getPokemonImageUrl } from '../api/pokeApi';
import { Link } from 'react-router-dom';
import '../styles/card-holo.css';
import '../styles/type-holo.css';
import { localizedText } from '../utils/pokemonContent';
import { localizedName } from '../utils/pokemonLocalization';
import { TYPE_HOLO } from '../utils/typeHolo';
import { useLanguage } from '../context/LanguageContext';

const PokemonCard = React.memo(({ pokemon, favorited, onToggleFavorite }) => {
    const { language, t } = useLanguage();
    const [types, setTypes] = useState(pokemon.types || []);
    const id = pokemon.id || parseInt(pokemon.url.split('/').filter(Boolean).pop());
    const displayName = language === 'ko' && pokemon.ko ? pokemon.ko : pokemon.name;
    const ko = language === 'ko';
    const [profile, setProfile] = useState(null);
    const species = profile?.id === id ? profile.species : null;
    const description = localizedText(species?.flavor_text_entries, language);
    const genus = species?.genera?.find(entry => entry.language.name === language)?.genus;
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                // REST fallback lists may contain forms; resolve their parent species.
                const speciesId = id > 1025
                    ? (await fetchPokemonDetails(id)).species.url.split('/').filter(Boolean).pop()
                    : id;
                const data = await fetchPokemonSpecies(speciesId);
                if (active) setProfile({ id, species: data });
            } catch {
                if (active) setProfile({ id, species: null });
            }
        };
        load();
        return () => { active = false; };
    }, [id]);
    const primaryType = types[0] || 'normal';
    const holo = TYPE_HOLO[primaryType] || TYPE_HOLO.normal;
    const [battle, setBattle] = useState(null);
    const details = battle?.id === id ? battle.details : null;
    const ability = battle?.id === id ? battle.ability : null;
    const abilityText = localizedText(ability?.flavor_text_entries, language);
    useEffect(() => {
        let active = true;
        fetchPokemonDetails(id).then(async data => {
            if (!active) return;
            setTypes(data.types.map(type => type.type.name));
            setBattle({ id, details: data, ability: null });
            const first = data.abilities.find(a => !a.is_hidden) || data.abilities[0];
            const abilityData = first ? await fetchLocalizedResource('ability', first.ability.name).catch(() => null) : null;
            if (active) setBattle({ id, details: data, ability: abilityData });
        }).catch(() => {});
        return () => { active = false; };
    }, [id]);

    const cardRef = useRef(null);
    const animation = useRef({ frame: null, x: .5, y: .5, targetX: .5, targetY: .5 });
    useEffect(() => () => cancelAnimationFrame(animation.current.frame), []);

    const animateLight = () => {
        const state = animation.current;
        const card = cardRef.current;
        if (!card) return;
        // Time-based damping keeps movement consistent across display refresh rates.
        const tick = (time) => {
            const dt = Math.min(40, time - (state.time || time - 16));
            state.time = time;
            const blend = 1 - Math.exp(-dt / 75);
            state.x += (state.targetX - state.x) * blend;
            state.y += (state.targetY - state.y) * blend;
            const settled = Math.abs(state.x - state.targetX) + Math.abs(state.y - state.targetY) < .001;
            if (settled) { state.x = state.targetX; state.y = state.targetY; }
            const x = state.x, y = state.y;
            card.style.setProperty('--pointer-x', `${x * 100}%`);
            card.style.setProperty('--pointer-y', `${y * 100}%`);
            card.style.setProperty('--pointer-distance', String(Math.min(1, Math.hypot(x - .5, y - .5) * 2)));
            card.style.setProperty('--foil-x', `${30 + x * 40}%`);
            card.style.setProperty('--foil-y', `${70 - y * 40}%`);
            card.style.setProperty('--rotate-x', `${(.5 - y) * 18}deg`);
            card.style.setProperty('--rotate-y', `${(x - .5) * 18}deg`);
            state.frame = settled ? null : requestAnimationFrame(tick);
            if (settled) state.time = null;
        };
        if (state.frame === null) state.frame = requestAnimationFrame(tick);
    };
    const moveLight = (event) => {
        if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        // Measure the stationary slot, so the rotating face cannot cause pointer jitter.
        const bounds = event.currentTarget.getBoundingClientRect();
        animation.current.targetX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        animation.current.targetY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        animateLight();
    };
    const resetLight = () => {
        animation.current.targetX = .5;
        animation.current.targetY = .5;
        animateLight();
    };
    return (
        <article className="tcg-slot" onPointerMove={moveLight} onPointerLeave={resetLight} onPointerCancel={resetLight}>
            <div ref={cardRef} className="tcg-card" data-holo={holo.family} data-holo-type={primaryType} style={{ '--card-type': `var(--type-${types[0] || 'normal'})` }}>
            <Link className="tcg-link" to={`/pokemon/${id}`} aria-label={ko ? `${displayName} 도감 상세 보기` : `View details for ${displayName}`}>
                <div className="tcg-surface">
                    <header className="tcg-header"><span className="tcg-label">POKÉDEX</span><h3 title={displayName}>{displayName}</h3><span className="tcg-hp" title={ko ? '게임 기본 체력 수치' : 'Base HP in the video games'} aria-label={`${ko ? '기본 체력' : 'Base HP'} ${details?.stats.find(stat => stat.stat.name === 'hp')?.base_stat ?? '—'}`}><small>HP</small><b>{details?.stats.find(stat => stat.stat.name === 'hp')?.base_stat ?? '—'}</b></span></header>
                    <div className="tcg-art">
                        <span className="tcg-foil" aria-hidden="true" />
                        <img src={getPokemonImageUrl(id)} alt={displayName} loading="lazy" width="300" height="300" onError={(event) => { const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`; if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback; }} />
                        <span className="tcg-glare" aria-hidden="true" />
                        <span className="tcg-art-caption" title={genus}>No. {String(id).padStart(4, '0')} · {genus || displayName} · {details ? `${details.height / 10} m · ${details.weight / 10} kg` : '— m · — kg'}</span>
                    </div>
                    <div className="tcg-details">
                        <div className="tcg-ability">
                            <div className="tcg-ability-title"><span>{ko ? '특성' : 'ABILITY'}</span><strong>{localizedName(ability?.names, language, ko ? '특성 정보' : 'Ability info')}</strong></div>
                            <p lang={abilityText?.language || language} title={abilityText?.text}>{abilityText?.text || (ko ? '특성 설명은 상세 도감에서 확인하세요.' : 'See the detail page for ability information.')}</p>
                            {abilityText && abilityText.language !== language && <small>{ko ? '영문 설명' : 'Original text'}</small>}
                        </div>
                        <div className="tcg-base-stats"><span>{ko ? '기본 능력치' : 'BASE STATS'}</span><div>{[['hp',ko?'체력':'HP'],['attack',ko?'공격':'ATK'],['defense',ko?'방어':'DEF']].map(([key,label]) => <span key={key}>{label} <b>{details?.stats.find(stat => stat.stat.name === key)?.base_stat ?? '—'}</b></span>)}</div></div>
                        <div className="tcg-type-row"><span>{ko ? '타입' : 'TYPE'}</span><div>{types.map(type => <span className="tcg-type" key={type}>{t(`type_${type}`)}</span>)}</div></div>
                        <div className="tcg-flavor"><span>{ko ? '도감 설명' : 'POKÉDEX NOTE'}{description && description.language !== language ? (ko ? ' · 영문' : ' · Original') : ''}</span><p lang={description?.language || language} title={description?.text}>{description?.text || (profile?.id !== id ? (ko ? '도감 설명을 불러오는 중…' : 'Loading Pokédex entry…') : (ko ? '제공되는 도감 설명이 없습니다.' : 'No Pokédex entry is available.'))}</p></div>
                        <footer className="tcg-footer"><span>FAN COLLECTION ✦</span><span>{ko ? '도감 열기' : 'Explore'} ↗</span></footer>
                    </div>
                </div>
            </Link>
            <button className="tcg-favorite" aria-pressed={favorited} aria-label={ko ? `${displayName} 즐겨찾기 ${favorited ? '해제' : '추가'}` : `${favorited ? 'Remove' : 'Save'} ${displayName} ${favorited ? 'from' : 'to'} favorites`} onClick={() => onToggleFavorite?.(id)}>{favorited ? '♥' : '♡'}</button>
            </div>
        </article>
    );
});
PokemonCard.displayName = 'PokemonCard';
export default PokemonCard;
