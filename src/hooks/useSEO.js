import { useEffect } from 'react';

const toCDN = (url) =>
    `https://res.cloudinary.com/dfwddomdw/image/fetch/${encodeURIComponent(url)}`;

const DEFAULT_SEO = {
    title: '포켓몬 도감 | 이름·타입·진화·능력치 검색 - Pokédex',
    description: '1~9세대 포켓몬을 한국어·영어 이름과 도감 번호로 검색하세요. 18가지 타입과 세대별 필터로 탐색하고, 진화·기본 능력치·특성을 확인하며 즐겨찾기를 모아보세요.',
    image: toCDN('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'),
    url: 'https://pokemon-drawing-book.com/',
};

const setMetaTag = (attr, key, content) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
};

const useSEO = ({ title, description, image, url } = {}) => {
    useEffect(() => {
        const t = title || DEFAULT_SEO.title;
        const d = description || DEFAULT_SEO.description;
        const img = image ? toCDN(image) : DEFAULT_SEO.image;
        const u = url || DEFAULT_SEO.url;

        // Title
        document.title = t;

        // Standard meta
        setMetaTag('name', 'description', d);

        // Open Graph
        setMetaTag('property', 'og:title', t);
        setMetaTag('property', 'og:description', d);
        setMetaTag('property', 'og:image', img);
        setMetaTag('property', 'og:url', u);

        // Twitter
        setMetaTag('name', 'twitter:title', t);
        setMetaTag('name', 'twitter:description', d);
        setMetaTag('name', 'twitter:image', img);

        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', u);

        return () => {
            document.title = DEFAULT_SEO.title;
            setMetaTag('name', 'description', DEFAULT_SEO.description);
            setMetaTag('property', 'og:title', DEFAULT_SEO.title);
            setMetaTag('property', 'og:description', DEFAULT_SEO.description);
            setMetaTag('property', 'og:image', DEFAULT_SEO.image);
            setMetaTag('property', 'og:url', DEFAULT_SEO.url);
            setMetaTag('name', 'twitter:title', DEFAULT_SEO.title);
            setMetaTag('name', 'twitter:description', DEFAULT_SEO.description);
            setMetaTag('name', 'twitter:image', DEFAULT_SEO.image);
            if (canonical) canonical.setAttribute('href', DEFAULT_SEO.url);
        };
    }, [title, description, image, url]);
};

export default useSEO;
