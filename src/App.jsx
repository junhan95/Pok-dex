import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CgPokemon } from 'react-icons/cg';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Home from './pages/Home';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import BuyMeACoffee from './components/BuyMeACoffee';
import './index.css';

const PokemonDetail = React.lazy(() => import('./pages/PokemonDetail'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [theme, setTheme] = React.useState(() => localStorage.getItem('pokedex_theme') || 'dark');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pokedex_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <header className="glass" style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          textDecoration: 'none', color: 'var(--text-main)',
          fontSize: '1.5rem', fontWeight: 800
        }}>
          <CgPokemon size={32} color="var(--accent-primary)" />
          Pokédex
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            className="lang-toggle-btn"
            style={{
              background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--text-main)',
              padding: '0.3rem 0.6rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 600,
              transition: 'all 0.2s ease', fontSize: '1rem'
            }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            onClick={toggleLanguage}
            className="lang-toggle-btn"
            style={{
              background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--text-main)',
              padding: '0.3rem 0.8rem', borderRadius: '20px', cursor: 'pointer', fontWeight: 600,
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
          >
            {language === 'ko' ? 'EN' : 'KR'}
          </button>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="site-footer">
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <a
        href="https://ctee.kr/place/pokemon"
        target="_blank"
        rel="noopener noreferrer"
        className="footer-bmc-link"
      >
        ☕ Buy me a coffee
      </a>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
        © {new Date().getFullYear()} Pokédex — Data from <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>PokéAPI</a>
      </p>
    </div>
  </footer>
);

function App() {
  return (
    <LanguageProvider>
      <FavoritesProvider>
        <ErrorBoundary>
          <Router>
            <Navbar />
            <Suspense fallback={<main className="container" style={{ padding: '4rem 0' }}><Loading /></main>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pokemon/:id" element={<PokemonDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
            <BuyMeACoffee />
          </Router>
        </ErrorBoundary>
      </FavoritesProvider>
    </LanguageProvider>
  );
}

export default App;
