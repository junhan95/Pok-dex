import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchAllPokemonWithNames, fetchPokemonType } from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import SkeletonGrid from '../components/SkeletonGrid';

import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import useDebounce from '../hooks/useDebounce';
import useSEO from '../hooks/useSEO';

const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const GENERATIONS = [
    { id: 1, label: 'Gen I', range: '1-151' },
    { id: 2, label: 'Gen II', range: '152-251' },
    { id: 3, label: 'Gen III', range: '252-386' },
    { id: 4, label: 'Gen IV', range: '387-493' },
    { id: 5, label: 'Gen V', range: '494-649' },
    { id: 6, label: 'Gen VI', range: '650-721' },
    { id: 7, label: 'Gen VII', range: '722-809' },
    { id: 8, label: 'Gen VIII', range: '810-905' },
    { id: 9, label: 'Gen IX', range: '906+' }
];

const Home = () => {
    const { t, language } = useLanguage();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    // SEO meta tags for home page
    useSEO();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedGen, setSelectedGen] = useState(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Data State
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [typeDataCache, setTypeDataCache] = useState({});
    const [searchLoading, setSearchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Fetch master list once
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setSearchLoading(true);
                const data = await fetchAllPokemonWithNames();
                setAllPokemonList(data);
                setError(null);
            } catch (err) {
                setError('Failed to load Pokémon. Please try again later.');
            } finally {
                setSearchLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Handle Type Selection
    const toggleType = async (type) => {
        const newSelected = selectedTypes.includes(type)
            ? selectedTypes.filter(t => t !== type)
            : [...selectedTypes, type];

        setSelectedTypes(newSelected);
        setCurrentPage(1);

        if (!typeDataCache[type] && !selectedTypes.includes(type)) {
            try {
                setSearchLoading(true);
                const data = await fetchPokemonType(type);
                const pokemonNames = new Set(data.pokemon.map(p => p.pokemon.name));
                setTypeDataCache(prev => ({ ...prev, [type]: pokemonNames }));
            } catch (err) {
                console.error("Error fetching type data:", err);
            } finally {
                setSearchLoading(false);
            }
        }
    };

    // Derived State: Filtering
    const displayList = useMemo(() => {
        let list = allPokemonList;

        if (showFavoritesOnly) {
            list = list.filter(p => favorites.includes(p.id));
        }

        if (selectedGen !== null) {
            list = list.filter(p => p.gen === selectedGen);
        }

        if (debouncedSearch) {
            const lowerSearch = debouncedSearch.toLowerCase();
            list = list.filter(p =>
                p.name.includes(lowerSearch) || (p.ko && p.ko.includes(lowerSearch)) || String(p.id) === lowerSearch
            );
        }

        if (selectedTypes.length > 0) {
            list = list.filter(p => {
                if (p.types && p.types.length > 0) {
                    return selectedTypes.every(type => p.types.includes(type));
                }
                return selectedTypes.every(type => {
                    const typeSet = typeDataCache[type];
                    return typeSet ? typeSet.has(p.name) : false;
                });
            });
        }

        return list;
    }, [allPokemonList, debouncedSearch, selectedTypes, typeDataCache, selectedGen, showFavoritesOnly, favorites]);

    // Pagination
    const totalPages = Math.ceil(displayList.length / itemsPerPage);
    const paginatedList = displayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedGen, showFavoritesOnly]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <>
            {/* Hero Banner */}
            <div className="hero-banner">
                <img src="/hero-banner.png" alt="Pokédex - 포켓몬 도감" className="hero-banner-img" />
            </div>

            <div className="main-layout">
                <main className="main-content">
                    <div style={{ textAlign: 'center', margin: '2rem 0 1.5rem' }}>
                        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {t('welcome_title')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            {t('welcome_desc')}
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="search-controls" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <label htmlFor="search-input" className="sr-only">{t('search')}</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            style={{
                                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(236, 72, 153, 0.3)',
                                padding: '1.2rem 2rem',
                                fontSize: '1.1rem'
                            }}
                        />
                    </div>

                    {/* Filter Controls Row */}
                    <div className="filter-controls-row">
                        {/* Favorites Toggle */}
                        <button
                            className={`filter-chip ${showFavoritesOnly ? 'active' : ''}`}
                            onClick={() => { setShowFavoritesOnly(prev => !prev); setCurrentPage(1); }}
                        >
                            ❤️ {language === 'ko' ? `즐겨찾기 (${favorites.length})` : `Favorites (${favorites.length})`}
                        </button>

                        {/* Generation Filter */}
                        {GENERATIONS.map(gen => (
                            <button
                                key={gen.id}
                                className={`filter-chip gen-chip ${selectedGen === gen.id ? 'active' : ''}`}
                                onClick={() => { setSelectedGen(prev => prev === gen.id ? null : gen.id); setCurrentPage(1); }}
                            >
                                {gen.label}
                            </button>
                        ))}
                    </div>

                    {/* Type Filters */}
                    <div className="type-filter-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {POKEMON_TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`type-filter-btn ${selectedTypes.includes(type) ? 'active' : ''}`}
                                style={{ backgroundColor: `var(--type-${type})` }}
                                aria-pressed={selectedTypes.includes(type)}
                            >
                                {t(`type_${type}`)} / {type.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    {error && paginatedList.length === 0 ? (
                        <div className="error-message" role="alert">{error}</div>
                    ) : (
                        <div className="pokemon-grid-container" style={{ paddingTop: '0' }}>

                            {/* Empty Results */}
                            {displayList.length === 0 && !searchLoading && (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>😢</p>
                                    <p>{showFavoritesOnly
                                        ? (language === 'ko' ? '즐겨찾기가 비어 있습니다. 하트를 눌러 추가해보세요!' : 'No favorites yet. Tap hearts to add!')
                                        : `${t('no_results')} "${searchTerm}"`
                                    }</p>
                                </div>
                            )}

                            {/* Skeleton Loading */}
                            {searchLoading && <SkeletonGrid count={24} />}

                            {/* Grid */}
                            {displayList.length > 0 && (
                                <>
                                    <div className="pokemon-grid">
                                        {paginatedList.map((p, index) => (
                                            <PokemonCard
                                                key={p.id || p.name}
                                                pokemon={p}
                                                index={index}
                                                favorited={isFavorite(p.id || parseInt((p.url || '').split('/').filter(Boolean).pop()))}
                                                onToggleFavorite={toggleFavorite}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="pagination-container">
                                            <button
                                                className="page-btn"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                &laquo;
                                            </button>

                                            {getPageNumbers().map(num => (
                                                <button
                                                    key={num}
                                                    className={`page-btn ${currentPage === num ? 'active' : ''}`}
                                                    onClick={() => setCurrentPage(num)}
                                                >
                                                    {num}
                                                </button>
                                            ))}

                                            <button
                                                className="page-btn"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >
                                                &raquo;
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default Home;
