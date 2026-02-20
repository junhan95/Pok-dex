import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', width: '100%' }}>
            <motion.div
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
                aria-label="Loading..."
            />
        </div>
    );
};

export default Loading;
