import React, { useEffect, useState } from 'react';
import { fetchPokemonDetails, getPokemonImageUrl } from '../api/pokeApi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PokemonCard = React.memo(({ pokemon, index, favorited, onToggleFavorite }) => {
    const { language, t } = useLanguage();
    const [types, setTypes] = useState(pokemon.types || []);
    const [imageLoaded, setImageLoaded] = useState(false);

    const id = pokemon.id || parseInt(pokemon.url.split('/').filter(Boolean).pop());
    const displayName = language === 'ko' && pokemon.ko ? pokemon.ko : pokemon.name;

    // Only fetch details if types weren't provided by the parent (fallback for legacy data)
    useEffect(() => {
        if (types.length > 0) return;

        let isMounted = true;
        const fetchTypes = async () => {
            try {
                const data = await fetchPokemonDetails(id);
                if (isMounted) setTypes(data.types.map(t => t.type.name));
            } catch (err) {
                // silently fail
            }
        };
        fetchTypes();
        return () => { isMounted = false; };
    }, [id, types.length]);

    const fallbackImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const primaryImage = getPokemonImageUrl(id);

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onToggleFavorite) onToggleFavorite(id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                to={`/pokemon/${id}`}
                className="pokemon-card glass"
                aria-label={`View details for ${displayName}`}
            >
                <button
                    className={`favorite-btn ${favorited ? 'active' : ''}`}
                    onClick={handleFavorite}
                    aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {favorited ? '❤️' : '🤍'}
                </button>
                <div className="pokemon-card-image-container" style={{ position: 'relative' }}>
                    {/* Low-res sprite shown while loading high-res art */}
                    <img
                        src={fallbackImage}
                        alt=""
                        className="pokemon-card-image"
                        style={{
                            position: 'absolute',
                            opacity: imageLoaded ? 0 : 0.5,
                            transition: 'opacity 0.3s',
                            filter: 'blur(4px)'
                        }}
                        aria-hidden="true"
                    />
                    <img
                        src={primaryImage}
                        alt={displayName}
                        onLoad={() => setImageLoaded(true)}
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; setImageLoaded(true); }}
                        loading="lazy"
                        className="pokemon-card-image"
                        style={{
                            opacity: imageLoaded ? 1 : 0,
                            transition: 'opacity 0.3s'
                        }}
                    />
                </div>
                <div className="pokemon-card-info">
                    <span className="pokemon-id">#{String(id).padStart(4, '0')}</span>
                    <h3 className="pokemon-name" title={displayName}>{displayName}</h3>

                    <div className="pokemon-types">
                        {types.length > 0 ? types.map(typeName => (
                            <span
                                key={typeName}
                                className="type-badge"
                                style={{ backgroundColor: `var(--type-${typeName})` }}
                            >
                                {t(`type_${typeName}`)}
                            </span>
                        )) : <span className="type-badge loading-badge">...</span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
});

PokemonCard.displayName = 'PokemonCard';

export default PokemonCard;
