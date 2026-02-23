import React, { useEffect, useRef } from 'react';

/**
 * Google AdSense Banner Component
 * - In production with a valid AdSense ID, renders actual ads
 * - In development, renders a styled placeholder
 * 
 * Props:
 *   format: 'horizontal' | 'rectangle' (default: 'horizontal')
 *   slot: AdSense ad slot ID (string)
 *   style: optional inline style override
 */

const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // TODO: Replace with your real AdSense publisher ID

const AdBanner = ({ format = 'horizontal', slot = '', style = {} }) => {
    const adRef = useRef(null);
    const isProduction = import.meta.env.PROD && ADSENSE_CLIENT !== 'ca-pub-XXXXXXXXXXXXXXXX';

    useEffect(() => {
        if (isProduction && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('AdSense error:', e);
            }
        }
    }, [isProduction]);

    const containerClass = `ad-container ad-${format}`;

    // Development placeholder
    if (!isProduction) {
        return (
            <div className={containerClass} style={style}>
                <div className="ad-placeholder">
                    <span className="ad-placeholder-icon">📢</span>
                    <span className="ad-placeholder-text">Advertisement</span>
                </div>
            </div>
        );
    }

    // Production AdSense
    return (
        <div className={containerClass} style={style}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format === 'horizontal' ? 'auto' : 'rectangle'}
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdBanner;
