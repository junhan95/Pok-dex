import React from 'react';

const SkeletonCard = () => (
    <div className="pokemon-card glass skeleton-card" aria-hidden="true">
        <div className="pokemon-card-image-container">
            <div className="skeleton-pulse skeleton-image"></div>
        </div>
        <div className="pokemon-card-info">
            <div className="skeleton-pulse skeleton-id"></div>
            <div className="skeleton-pulse skeleton-name"></div>
            <div className="pokemon-types">
                <div className="skeleton-pulse skeleton-badge"></div>
                <div className="skeleton-pulse skeleton-badge"></div>
            </div>
        </div>
    </div>
);

const SkeletonGrid = ({ count = 24 }) => (
    <div className="pokemon-grid">
        {Array.from({ length: count }, (_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default SkeletonGrid;
