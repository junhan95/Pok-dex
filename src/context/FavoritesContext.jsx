import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

const STORAGE_KEY = 'pokedex_favorites';

const loadFavorites = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? [...new Set(parsed.filter(id => Number.isInteger(id) && id > 0))] : [];
    } catch {
        return [];
    }
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(loadFavorites);

    useEffect(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)); } catch { /* Keep session favorites when storage is unavailable. */ }
    }, [favorites]);

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(fId => fId !== id)
                : [...prev, id]
        );
    };

    const isFavorite = (id) => favorites.includes(id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Context hooks intentionally share the provider module.
// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);
