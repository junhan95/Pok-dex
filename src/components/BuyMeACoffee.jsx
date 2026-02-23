import React from 'react';

/**
 * Floating "Buy Me a Coffee" button
 * Fixed to bottom-right corner with hover expansion animation
 */

const BMC_URL = 'https://ctee.kr/place/pokemon';

const BuyMeACoffee = () => {
    return (
        <a
            href={BMC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bmc-float"
            aria-label="Buy me a coffee"
            title="Buy me a coffee ☕"
        >
            <span className="bmc-float-icon">☕</span>
            <span className="bmc-float-text">Buy me a coffee</span>
        </a>
    );
};

export default BuyMeACoffee;
