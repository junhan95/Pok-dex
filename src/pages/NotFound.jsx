import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <main className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '8rem', lineHeight: 1 }}>🔍</span>
        </div>
        <h1 style={{
            fontSize: '4rem', marginBottom: '1rem',
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
            404
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem', marginBottom: '2.5rem' }}>
            페이지를 찾을 수 없습니다
        </p>
        <Link
            to="/"
            style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: '#fff', padding: '0.9rem 2.5rem',
                borderRadius: '30px', textDecoration: 'none',
                fontWeight: 600, fontSize: '1.1rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
            }}
            onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 8px 25px rgba(236, 72, 153, 0.5)'; }}
            onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)'; }}
        >
            홈으로 돌아가기
        </Link>
    </main>
);

export default NotFound;
