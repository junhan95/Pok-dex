import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllPokemonWithNames, fetchPokemonType } from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import Loading from '../components/Loading';
import { useLanguage } from '../context/LanguageContext';

const POKEMON_TYPES = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison',
    'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const Home = () => {
    const { t, language } = useLanguage();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);

    // Data State
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [typeDataCache, setTypeDataCache] = useState({}); // { typeName: Set<string> }
    const [searchLoading, setSearchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    // Fetch master list for search and pagination once
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
        setCurrentPage(1); // Reset to page 1 on filter change

        // Fetch type data if not cached and we are adding it
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

    // Derived State: Filtering (memoized to avoid recalculating on unrelated re-renders)
    const displayList = useMemo(() => {
        let list = allPokemonList;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            list = list.filter(p =>
                p.name.includes(lowerSearch) || (p.ko && p.ko.includes(lowerSearch)) || String(p.id) === lowerSearch
            );
        }

        if (selectedTypes.length > 0) {
            list = list.filter(p => {
                // Use pre-fetched types from GraphQL data
                if (p.types && p.types.length > 0) {
                    return selectedTypes.every(type => p.types.includes(type));
                }
                // Fallback to typeDataCache for REST-sourced data
                return selectedTypes.every(type => {
                    const typeSet = typeDataCache[type];
                    return typeSet ? typeSet.has(p.name) : false;
                });
            });
        }

        return list;
    }, [allPokemonList, searchTerm, selectedTypes, typeDataCache]);

    // Pagination logic
    const totalPages = Math.ceil(displayList.length / itemsPerPage);
    const paginatedList = displayList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Generate Pagination Array
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
        <main className="container">
            <div style={{ textAlign: 'center', margin: '3rem 0 1.5rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('welcome_title')}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                    {t('welcome_desc')}
                </p>
            </div>

            {/* Search Input Area */}
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

            {/* Type Filters Area */}
            <div className="type-filter-container container" style={{ maxWidth: '1000px' }}>
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

                    {/* Empty Search Results */}
                    {displayList.length === 0 && !searchLoading && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>{t('no_results')} "{searchTerm}"</p>
                        </div>
                    )}

                    {/* Loading State Overlay */}
                    {searchLoading && <Loading />}

                    {/* Grid */}
                    {displayList.length > 0 && (
                        <>
                            <div className="pokemon-grid">
                                {paginatedList.map((p, index) => (
                                    <PokemonCard key={p.id || p.name} pokemon={p} index={index} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
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
    );
};

export default Home;
