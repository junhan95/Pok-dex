import { matchesPokemon, clampPage } from '../utils/search';
import './club.css';
import { Link, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { fetchAllPokemonWithNames } from '../api/pokeApi';
import PokemonCard from '../components/PokemonCard';
import SkeletonGrid from '../components/SkeletonGrid';
import DiscoveryGuide from '../components/DiscoveryGuide';

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
    const location = useLocation();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    // SEO meta tags for home page
    useSEO();

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState(() => new URLSearchParams(window.location.search).get('q') || '');
    const debouncedSearch = useDebounce(searchTerm, 300);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedGen, setSelectedGen] = useState(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Data State
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [retry, setRetry] = useState(0);
    const [searchLoading, setSearchLoading] = useState(true);
    const [error, setError] = useState(null);

    // Wait for the card grid to settle before scrolling to sections below it.
    useEffect(() => {
        if (!location.hash || (searchLoading && location.hash !== '#hero')) return;
        const target = document.getElementById(location.hash.slice(1));
        if (!target) return;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }, [location.key, location.hash, searchLoading]);

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
            } catch {
                setError(true);
            } finally {
                setSearchLoading(false);
            }
        };
        fetchAll();
    }, [retry]);

    useEffect(() => {
        setSearchTerm(new URLSearchParams(location.search).get('q') || '');
        setCurrentPage(1);
    }, [location.search]);

    const toggleType = type => {
        setSelectedTypes(previous => previous.includes(type) ? previous.filter(t => t !== type) : [...previous, type]);
        setCurrentPage(1);
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

        list = list.filter(p => matchesPokemon(p, debouncedSearch));
        if (selectedTypes.length) list = list.filter(p => selectedTypes.every(type => p.types.includes(type)));

        return list;
    }, [allPokemonList, debouncedSearch, selectedTypes, selectedGen, showFavoritesOnly, favorites]);

    // Pagination
    const totalPages = Math.ceil(displayList.length / itemsPerPage);
    const page = clampPage(currentPage, displayList.length, itemsPerPage);
    const paginatedList = displayList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, selectedGen, showFavoritesOnly]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
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
            <section id="hero" tabIndex={-1} className="hero-banner" aria-labelledby="hero-title">
                <div className="hero-panel">
                    <div className="hero-copy">
                        <span className="hero-eyebrow">THE POKÉDEX COLLECTION · {language === 'ko' ? '포켓몬 도감' : 'POKÉMON GUIDE'}</span>
                        <h1 id="hero-title">{language === 'ko' ? <>포켓몬 도감,<br /><em>발견하는 즐거움.</em></> : <>Explore the Pokédex.<br /><em>Find your favorites.</em></>}</h1>
                        <p>{language === 'ko' ? '이름부터 타입, 진화까지. 포켓몬의 세계를 탐험하고 나만의 즐겨찾기를 채워보세요.' : 'Names, types, and evolutions. Explore the world of Pokémon and build your favorites.'}</p>
                        <button className="hero-explore" onClick={() => document.getElementById('search-input')?.focus()}>
                            {language === 'ko' ? '포켓몬 찾아보기' : 'Find a Pokémon'} <span aria-hidden="true">↗</span>
                        </button>
                        <div className="hero-facts"><span>{language === 'ko' ? '9개 세대' : '9 generations'}</span><span>{language === 'ko' ? '18가지 타입' : '18 types'}</span><span>KR / EN</span></div>
                    </div>
                    <div className="hero-art">
                        <div className="hero-art-frame">
                            <img src="/hero-pokemon-cast.jpg" alt={language === 'ko' ? '피카츄와 여러 포켓몬, 지우 일행이 함께한 일러스트' : 'Pikachu, Pokémon, Ash and friends together'} className="hero-banner-img" width="736" height="1308" fetchPriority="high" />
                        </div>
                        <span className="hero-art-caption">A WORLD OF POKÉMON</span>
                    </div>
                </div>
            </section>

            <div className="main-layout">
                <main className="main-content">
                    <div className="section-heading dex-heading" id="pokedex" tabIndex={-1}>
                        <span className="section-kicker">EXPLORE THE POKÉDEX</span>
                        <h2>
                            {language === 'ko' ? '어떤 포켓몬을 찾고 있나요?' : 'Who are you looking for?'}
                        </h2>
                        <p>
                            {language === 'ko' ? '이름이나 도감 번호로 검색하고, 9개 세대와 18가지 타입으로 살펴보세요.' : 'Search by name or number. Explore 9 generations and 18 types.'}
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="search-controls" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <label htmlFor="search-input" className="sr-only">{t('search')}</label>
                        <input
                            id="search-input"
                            type="text"
                            placeholder={language === 'ko' ? '예: 피카츄, pikachu, 25' : 'Try pikachu or 25'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-describedby="search-hint"
                        />
                    </div>
                    <p id="search-hint" className="search-hint">{language === 'ko' ? '한국어·영어 검색 지원 · 카드를 선택하면 진화와 능력치를 볼 수 있어요.' : 'Korean & English names · Select a card for evolutions and stats.'}</p>

                    <section className="dex-filter-panel" aria-label={language === 'ko' ? '포켓몬 검색 필터' : 'Pokémon search filters'}>
                        <div className="dex-filter-toolbar">
                            <div><strong>{language === 'ko' ? '조건으로 찾아보기' : 'Refine your search'}</strong><span>{language === 'ko' ? '세대와 타입을 조합해 보세요' : 'Combine a generation and types'}</span></div>
                            <button className="dex-favorites" aria-pressed={showFavoritesOnly} onClick={() => {setShowFavoritesOnly(value => !value);setCurrentPage(1);}}><span aria-hidden="true">♡</span> {language === 'ko' ? '즐겨찾기만' : 'Favorites only'} <b>{favorites.length}</b></button>
                        </div>
                        <fieldset className="dex-filter-group"><legend>{language === 'ko' ? '세대' : 'Generation'} <small>{language === 'ko' ? '하나 선택' : 'Select one'}</small></legend>
                            <div className="dex-generation-grid"><button className="dex-generation" aria-pressed={selectedGen === null} onClick={() => {setSelectedGen(null);setCurrentPage(1);}}>{language === 'ko' ? '전체' : 'All'}</button>{GENERATIONS.map(gen => <button key={gen.id} className="dex-generation" aria-pressed={selectedGen === gen.id} onClick={() => {setSelectedGen(value => value === gen.id ? null : gen.id);setCurrentPage(1);}} title={gen.range}>{language === 'ko' ? `${gen.id}세대` : gen.label}</button>)}</div>
                        </fieldset>
                        <fieldset className="dex-filter-group"><legend>{language === 'ko' ? '타입' : 'Type'} <small>{language === 'ko' ? '선택한 타입을 모두 포함' : 'Matches all selected types'}</small></legend>
                            <div className="dex-type-grid">{POKEMON_TYPES.map(type => <button key={type} className="dex-type-choice" style={{'--filter-type': `var(--type-${type})`}} aria-pressed={selectedTypes.includes(type)} onClick={() => toggleType(type)}><span className="dex-type-dot" aria-hidden="true"/><span>{t(`type_${type}`)}</span><span className="dex-type-check" aria-hidden="true">{selectedTypes.includes(type) ? '✓' : '+'}</span></button>)}</div>
                        </fieldset>
                        <div className="dex-filter-bottom"><span aria-live="polite">{selectedGen === null && !selectedTypes.length && !showFavoritesOnly ? (language === 'ko' ? '모든 세대와 타입을 보고 있어요' : 'Showing all generations and types') : [selectedGen && (language === 'ko' ? `${selectedGen}세대` : `Gen ${selectedGen}`), ...selectedTypes.map(type => t(`type_${type}`)), showFavoritesOnly && (language === 'ko' ? '즐겨찾기' : 'Favorites')].filter(Boolean).join(' · ')}</span><button onClick={() => {setSelectedGen(null);setSelectedTypes([]);setShowFavoritesOnly(false);setCurrentPage(1);}} disabled={selectedGen === null && !selectedTypes.length && !showFavoritesOnly}>{language === 'ko' ? '조건 초기화' : 'Clear filters'}</button></div>
                    </section>

                    {/* Content Area */}
                    <div className="results-heading" id="pokemon-list" tabIndex={-1}><h3>{showFavoritesOnly ? (language === 'ko' ? '내가 저장한 포켓몬' : 'Your favorites') : (language === 'ko' ? '포켓몬 목록' : 'Pokémon directory')}</h3><span role="status">{searchLoading ? (language === 'ko' ? '불러오는 중…' : 'Loading…') : `${displayList.length.toLocaleString()} ${language === 'ko' ? '개의 검색 결과' : 'results'}`}</span><button className="reset-filters" onClick={() => { setSearchTerm(''); setSelectedTypes([]); setSelectedGen(null); setShowFavoritesOnly(false); setCurrentPage(1); }}>{language === 'ko' ? '필터 초기화' : 'Reset filters'}</button></div>
                    {error && paginatedList.length === 0 ? (
                        <div className="error-message" role="alert"><p>{language === 'ko' ? '도감을 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도하세요.' : 'Unable to load the Pokédex. Check your connection and try again.'}</p><button className="filter-chip" onClick={() => setRetry(value => value + 1)}>{language === 'ko' ? '다시 시도' : 'Retry'}</button></div>
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
                                                onClick={() => setCurrentPage(Math.max(page - 1, 1))}
                                                disabled={page === 1}
                                            >
                                                &laquo;
                                            </button>

                                            {getPageNumbers().map(num => (
                                                <button
                                                    key={num}
                                                    className={`page-btn ${page === num ? 'active' : ''}`}
                                                    onClick={() => setCurrentPage(num)}
                                                >
                                                    {num}
                                                </button>
                                            ))}

                                            <button
                                                className="page-btn"
                                                onClick={() => setCurrentPage(Math.min(page + 1, totalPages))}
                                                disabled={page === totalPages}
                                            >
                                                &raquo;
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    <section className="club-home"><h2>{language === 'ko' ? '좋아하는 포켓몬으로, 나만의 이야기' : 'Your Pokémon. Your story.'}</h2><p>{language === 'ko' ? '서로 비교하고, 테마로 발견하고, 친구에게 내 앨범을 보여주세요.' : 'Compare, explore themes, and show friends your collection.'}</p><div className="club-home-links"><Link to="/club"><strong>{language === 'ko' ? '포켓몬 비교 ↗' : 'Compare Pokémon ↗'}</strong><small>{language === 'ko' ? '최대 3마리의 능력치와 특성을 나란히' : 'Compare stats and abilities of up to 3 Pokémon'}</small></Link><Link to="/club?theme=eevee"><strong>{language === 'ko' ? '테마별 도감 ↗' : 'Theme collections ↗'}</strong><small>{language === 'ko' ? '이브이 진화부터 첫 파트너까지' : 'From Eevee evolutions to first partners'}</small></Link><Link to="/club?mode=album"><strong>{language === 'ko' ? '공유 앨범 만들기 ↗' : 'Create a shared album ↗'}</strong><small>{language === 'ko' ? '여섯 친구를 고르고 링크로 공유' : 'Pick six friends and share a link'}</small></Link></div></section>
                    <DiscoveryGuide />
                </main>
            </div>
        </>
    );
};

export default Home;
