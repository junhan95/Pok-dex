import React from 'react';
import { motion as Motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const Loading = () => {
    const { language } = useLanguage();
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', width: '100%' }}>
            <Motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid var(--bg-card)',
                    borderTopColor: 'var(--accent-primary)',
                    borderRadius: '50%'
                }}
                role="status"
                aria-label={language === 'ko' ? '불러오는 중…' : 'Loading…'}
            />
        </div>
    );
};

export default Loading;
