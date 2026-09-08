import React, { useEffect, useState } from 'react';
import { fetchPokemonDetails, getPokemonImageUrl } from '../api/pokeApi';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PokemonCard = React.memo(({ pokemon, favorited, onToggleFavorite }) => {
    const { language, t } = useLanguage();
    const [types, setTypes] = useState(pokemon.types || []);
    const id = pokemon.id || parseInt(pokemon.url.split('/').filter(Boolean).pop());
    const displayName = language === 'ko' && pokemon.ko ? pokemon.ko : pokemon.name;
    const ko = language === 'ko';
    useEffect(() => {
        if (types.length) return;
        let active = true;
        fetchPokemonDetails(id).then(data => {
            if (active) setTypes(data.types.map(type => type.type.name));
        }).catch(() => {});
        return () => { active = false; };
    }, [id, types.length]);

    const moveLight = (event) => {
        if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const card = event.currentTarget;
        const bounds = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
        card.style.setProperty('--pointer-x', `${x * 100}%`);
        card.style.setProperty('--pointer-y', `${y * 100}%`);
        card.style.setProperty('--rotate-x', `${(0.5 - y) * 12}deg`);
        card.style.setProperty('--rotate-y', `${(x - 0.5) * 12}deg`);
    };
    const resetLight = (event) => {
        ['--pointer-x', '--pointer-y', '--rotate-x', '--rotate-y'].forEach(name => event.currentTarget.style.removeProperty(name));
    };
    return (
        <article className="tcg-card" style={{ '--card-type': `var(--type-${types[0] || 'normal'})` }} onPointerMove={moveLight} onPointerLeave={resetLight} onPointerCancel={resetLight}>
            <Link className="tcg-link" to={`/pokemon/${id}`} aria-label={ko ? `${displayName} 도감 상세 보기` : `View details for ${displayName}`}>
                <div className="tcg-surface">
                    <header className="tcg-header"><span className="tcg-label">POKÉDEX</span><h3 title={displayName}>{displayName}</h3><span className="tcg-number">No.<b>{String(id).padStart(4, '0')}</b></span></header>
                    <div className="tcg-art">
                        <span className="tcg-orbit" aria-hidden="true" />
                        <img src={getPokemonImageUrl(id)} alt={displayName} loading="lazy" width="300" height="300" onError={(event) => { const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`; if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback; }} />
                        <span className="tcg-art-caption">POKÉMON / {ko ? '포켓몬 도감' : 'FIELD COLLECTION'}</span>
                    </div>
                    <div className="tcg-details"><div className="tcg-type-row"><span>{ko ? '타입' : 'TYPE'}</span><div>{types.length ? types.map(type => <span className="tcg-type" key={type}>{t(`type_${type}`)}</span>) : '…'}</div></div><div className="tcg-discover"><strong>{ko ? '어떤 포켓몬일까요?' : 'Discover this Pokémon'}</strong><p>{ko ? '진화 과정, 특성과 기본 능력치를 도감에서 확인하세요.' : 'Explore evolutions, abilities, and base stats in the Pokédex.'}</p></div><footer className="tcg-footer"><span>FAN COLLECTION <span aria-hidden="true">✦</span></span><span>{ko ? '도감 열기' : 'Explore'} ↗</span></footer></div>
                </div>
                <span className="tcg-foil" aria-hidden="true" /><span className="tcg-glare" aria-hidden="true" />
            </Link>
            <button className="tcg-favorite" aria-pressed={favorited} aria-label={ko ? `${displayName} 즐겨찾기 ${favorited ? '해제' : '추가'}` : `${favorited ? 'Remove' : 'Save'} ${displayName} ${favorited ? 'from' : 'to'} favorites`} onClick={() => onToggleFavorite?.(id)}>{favorited ? '♥' : '♡'}</button>
        </article>
    );
});
PokemonCard.displayName = 'PokemonCard';
export default PokemonCard;
