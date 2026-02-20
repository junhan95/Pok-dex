import React, { useEffect, useState } from 'react';
import { fetchPokemonDetails, getPokemonImageUrl } from '../api/pokeApi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PokemonCard = React.memo(({ pokemon, index }) => {
    const { language, t } = useLanguage();
    const [types, setTypes] = useState(pokemon.types || []);

    const id = pokemon.id || parseInt(pokemon.url.split('/').filter(Boolean).pop());
    const displayName = language === 'ko' && pokemon.ko ? pokemon.ko : pokemon.name;

    // Only fetch details if types weren't provided by the parent (fallback for legacy data)
    useEffect(() => {
        if (types.length > 0) return; // Already have types from GraphQL

        let isMounted = true;
        const fetchTypes = async () => {
            try {
                const data = await fetchPokemonDetails(id);
                if (isMounted) setTypes(data.types.map(t => t.type.name));
            } catch (err) {
                // silently fail, types just won't show
            }
        };
        fetchTypes();
        return () => { isMounted = false; };
    }, [id, types.length]);

    const fallbackImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const primaryImage = getPokemonImageUrl(id);

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
                <div className="pokemon-card-image-container">
                    <img
                        src={primaryImage}
                        alt={displayName}
                        onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                        loading="lazy"
                        className="pokemon-card-image"
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
