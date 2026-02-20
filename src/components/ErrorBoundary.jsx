import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                    <div className="glass" style={{
                        padding: '3rem', maxWidth: '500px', margin: '0 auto',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                            ⚠️ 오류 발생
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            예상치 못한 오류가 발생했습니다.<br />
                            페이지를 새로고침하거나 홈으로 돌아가 주세요.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                border: 'none', color: '#fff', padding: '0.8rem 2rem',
                                borderRadius: '30px', cursor: 'pointer', fontSize: '1rem',
                                fontWeight: 600, fontFamily: 'inherit',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                            새로고침
                        </button>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
