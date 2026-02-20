import React, { useEffect, useState } from 'react';
import { fetchPokemonDetails, getPokemonImageUrl } from '../api/pokeApi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const PokemonCard = ({ pokemon, index }) => {
    const { language, t } = useLanguage();
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(false);

    // Extract ID from url if available, otherwise use exact ID from new GraphQL payload
    const id = pokemon.id || parseInt(pokemon.url.split('/').filter(Boolean).pop());

    // Determine localized name depending on current context language
    const displayName = language === 'ko' && pokemon.ko ? pokemon.ko : pokemon.name;

    useEffect(() => {
        let isMounted = true;
        const fetchTypes = async () => {
            try {
                const data = await fetchPokemonDetails(id);
                if (isMounted) setDetails(data);
            } catch (err) {
                if (isMounted) setError(true);
            }
        };
        fetchTypes();

        return () => { isMounted = false; };
    }, [id]);

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
                        {details ? details.types.map(tData => (
                            <span
                                key={tData.type.name}
                                className="type-badge"
                                style={{ backgroundColor: `var(--type-${tData.type.name})` }}
                            >
                                {t(`type_${tData.type.name}`)}
                            </span>
                        )) : <span className="type-badge loading-badge">...</span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default PokemonCard;
