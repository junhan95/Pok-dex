import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        home: 'Home',
        search: 'Search',
        welcome_title: 'Explore the Pokédex',
        welcome_desc: 'Discover and learn about all your favorite Pokémon from every generation.',
        search_placeholder: 'Search by name (e.g., pikachu)...',
        load_more: 'Load More',
        no_results: 'No Pokémon found matching',
        start_typing: 'Start typing to search the entire Pokédex! (Fast Client-side Search)',
        back: '← Back',
        base_stats: 'Base Stats',
        height: 'Height',
        weight: 'Weight',
        abilities: 'Abilities',

        stat_hp: 'HP',
        stat_attack: 'Attack',
        stat_defense: 'Defense',
        'stat_special-attack': 'Sp. Atk',
        'stat_special-defense': 'Sp. Def',
        stat_speed: 'Speed',

        type_normal: 'Normal',
        type_fire: 'Fire',
        type_water: 'Water',
        type_electric: 'Electric',
        type_grass: 'Grass',
        type_ice: 'Ice',
        type_fighting: 'Fighting',
        type_poison: 'Poison',
        type_ground: 'Ground',
        type_flying: 'Flying',
        type_psychic: 'Psychic',
        type_bug: 'Bug',
        type_rock: 'Rock',
        type_ghost: 'Ghost',
        type_dragon: 'Dragon',
        type_dark: 'Dark',
        type_steel: 'Steel',
        type_fairy: 'Fairy'
    },
    ko: {
        home: '홈',
        search: '검색',
        welcome_title: '포켓몬 도감 탐험하기',
        welcome_desc: '모든 세대의 다양한 포켓몬을 발견하고 알아보세요.',
        search_placeholder: '이름으로 검색 (예: 피카츄)...',
        load_more: '더 보기',
        no_results: '검색 결과가 없습니다:',
        start_typing: '포켓몬 이름을 검색해보세요! (빠른 클라이언트 검색)',
        back: '← 뒤로가기',
        base_stats: '기본 능력치',
        height: '키',
        weight: '몸무게',
        abilities: '특성',

        stat_hp: '체력',
        stat_attack: '공격',
        stat_defense: '방어',
        'stat_special-attack': '특수공격',
        'stat_special-defense': '특수방어',
        stat_speed: '스피드',

        type_normal: '노말',
        type_fire: '불꽃',
        type_water: '물',
        type_electric: '전기',
        type_grass: '풀',
        type_ice: '얼음',
        type_fighting: '격투',
        type_poison: '독',
        type_ground: '땅',
        type_flying: '비행',
        type_psychic: '에스퍼',
        type_bug: '벌레',
        type_rock: '바위',
        type_ghost: '고스트',
        type_dragon: '드래곤',
        type_dark: '악',
        type_steel: '강철',
        type_fairy: '페어리'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('ko'); // Default to Korean as per user request context

    const toggleLanguage = () => {
        setLanguage(prev => (prev === 'ko' ? 'en' : 'ko'));
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
