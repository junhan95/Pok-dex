import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CgPokemon } from 'react-icons/cg';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Home from './pages/Home';
import PokemonDetail from './pages/PokemonDetail';
import './index.css';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();

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

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
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

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetail />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
