<div align="center">

# ⚡ Pokédex — Modern Pokémon Encyclopedia

A beautiful, blazing-fast Pokédex web application built with **React + Vite**.  
Browse **1,000+ Pokémon** across all 9 generations with full **Korean & English** language support.

🌐 **[Live Demo → junhan95.github.io/Pok-dex](https://junhan95.github.io/Pok-dex/)**

</div>

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔍 **Instant Search** | Search by name in English or Korean (e.g., "pikachu" or "피카츄") with 300ms debounce |
| 🏷️ **18 Type Filters** | Filter by one or multiple types (Fire, Water, Grass...) with intersection logic |
| 📊 **Generation Filter** | Filter Pokémon by generation (Gen I through Gen IX) |
| ❤️ **Favorites** | Save your favorite Pokémon with one click — persisted in localStorage |
| 🌙 **Dark / Light Mode** | Toggle between premium dark theme and clean light theme |
| 🌐 **Bilingual (KR / EN)** | Full Korean translation: names, stats, types, descriptions, and UI |
| 🧬 **Evolution Chains** | View the complete evolutionary lineage on each Pokémon's detail page |
| 📱 **PWA Ready** | Install as a standalone app on mobile and desktop |
| ♿ **Accessible** | Semantic HTML, ARIA attributes, screen-reader labels, and keyboard navigation |

---

## 🖼️ Screenshots

### 🌑 Dark Mode — Home Page
> Browse Pokémon with type filters, generation chips, and favorites toggle.

### 🌕 Light Mode — Home Page
> A clean, bright theme for comfortable daytime browsing.

### 📋 Detail Page
> View high-res artwork, translated descriptions, base stat bars, and evolution chains.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **npm** 9+ (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/junhan95/Pok-dex.git

# 2. Navigate into the project
cd Pok-dex

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at **http://localhost:5173** 🎉

### Build for Production

```bash
npm run build      # Creates optimized build in ./dist
npm run preview    # Preview the production build locally
```

### Deploy to GitHub Pages

```bash
npm run deploy     # Builds + publishes to gh-pages branch
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Bundler** | Vite 7 |
| **Routing** | React Router v7 (HashRouter) |
| **Animation** | Framer Motion |
| **Icons** | React Icons |
| **Styling** | Vanilla CSS with CSS Variables |
| **API** | [PokéAPI](https://pokeapi.co/) (REST + GraphQL) |
| **Deployment** | GitHub Pages + GitHub Actions CI/CD |

---

## 🏗️ Architecture

```
src/
├── api/
│   └── pokeApi.js          # API service layer (REST + GraphQL + caching)
├── components/
│   ├── ErrorBoundary.jsx    # Global error handler
│   ├── Loading.jsx          # Spinner component
│   ├── PokemonCard.jsx      # Memoized card with favorite button
│   └── SkeletonGrid.jsx     # Skeleton loading placeholder
├── context/
│   ├── FavoritesContext.jsx  # Favorites state (localStorage)
│   └── LanguageContext.jsx   # i18n translations (KR/EN)
├── hooks/
│   └── useDebounce.js       # Custom debounce hook
├── pages/
│   ├── Home.jsx             # Main page (search, filters, grid)
│   ├── NotFound.jsx         # 404 error page
│   └── PokemonDetail.jsx    # Detail view + evolution chain
├── App.jsx                   # Router + Navbar + Theme toggle
├── index.css                 # Design system (CSS variables, themes)
└── main.jsx                  # Entry point
```

---

## ⚡ Performance Optimizations

These optimizations were implemented to ensure a smooth user experience:

- **GraphQL Batch Fetching** — A single GraphQL query fetches names, types, and generation data for all 1,000+ Pokémon. This eliminates the N+1 API call problem where each card would individually fetch its own data.
- **React.memo** — `PokemonCard` is wrapped with `React.memo` to prevent unnecessary re-renders when parent state changes (e.g., pagination, search input).
- **useMemo** — The filtered Pokémon list is memoized. Filtering only recalculates when search/filter inputs actually change.
- **API Response Cache** — A `Map`-based cache stores `fetchPokemonDetails` responses so revisiting a Pokémon detail page is instant.
- **Code Splitting** — `PokemonDetail` and `NotFound` pages are lazy-loaded with `React.lazy` + `Suspense`, reducing the initial bundle by ~5KB.
- **Search Debounce** — A 300ms debounce prevents excessive re-filtering during fast typing.
- **Skeleton Loading** — Pulse-animated skeleton cards match the exact layout of real cards, preventing layout shift during data loading.

---

## 🔑 Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **HashRouter** over BrowserRouter | GitHub Pages doesn't support server-side routing; hash-based routing avoids 404s on page refresh |
| **GraphQL + REST hybrid** | GraphQL for bulk name/type data; REST for individual Pokémon details and species data |
| **CSS Variables** over CSS-in-JS | Zero runtime cost, easy theming (dark/light), and type-specific color mapping |
| **localStorage** for favorites | Simple, no backend required, persists across sessions |
| **Module-level caching** | Avoids redundant network requests without adding state management libraries |

---

## 📁 Project Structure

```
Pok-dex/
├── .github/workflows/
│   └── deploy.yml          # Auto-deploy on push to main
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # SEO crawling rules
│   └── vite.svg            # Custom Pokéball app icon
├── src/                    # Application source code
├── index.html              # SEO-optimized entry (OG tags, meta)
├── package.json            # Dependencies & scripts
└── vite.config.js          # Vite configuration (base path)
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build + deploy to GitHub Pages |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **[PokéAPI](https://pokeapi.co/)** — The free RESTful & GraphQL Pokémon API
- **[PokeAPI Sprites](https://github.com/PokeAPI/sprites)** — Official Pokémon artwork
- **[React](https://react.dev/)** & **[Vite](https://vite.dev/)** — Modern web development tools

---

<div align="center">

Made with ❤️ by [junhan95](https://github.com/junhan95)

</div>
