<div align="center">

# ⚡ POKÉDEX

**A next-generation, glassmorphic Pokédex web application powered by the official PokéAPI.**

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PokéAPI](https://img.shields.io/badge/API-Pok%C3%A9API-EE1515?style=for-the-badge&logo=pokemon&logoColor=white)](https://pokeapi.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-integration) • [Roadmap](#-future-roadmap)

---

</div>

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [UI & Design System](#-ui--design-system)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [API Integration & Performance](#-api-integration--performance)
- [Pages & Views](#-pages--views)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Pokédex** is a dynamic, high-performance web application designed with a sleek dark-mode glassmorphic aesthetic. It connects seamlessly with the official **[PokéAPI](https://pokeapi.co/)** to deliver deep statistics, 3D models, move sets, abilities, and classification data for all Pokémon generations.

> [!TIP]
> Built purely with **Vanilla HTML5, CSS3, and modern ES6+ JavaScript** — zero heavy frameworks, zero build steps, and lightning-fast loading speeds!

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🎨 3D Pokémon HOME Models** | Features studio-lit, high-resolution 3D models from Pokémon HOME with ambient depth and dynamic lighting. |
| **🔍 Real-Time Search** | Search by Pokémon name or national Pokédex ID with instant autocomplete and error recovery. |
| **📊 Dynamic Stat Bars** | Visualized animated progress bars for HP, Attack, Defense, Sp. Atk, Sp. Def, and Speed. |
| **⚡ Multi-Perspective Layout** | Detailed 3-column detail view: Identity & traits (Left), 3D Artwork & Glowing Floor Rings (Center), and Battle Metrics (Right). |
| **🎠 Interactive Carousel Tray** | Bottom glassmorphic navigation tray showcasing quick-switch Pokémon cards with pagination dots. |
| **⭐ Favorites System** | Save your favorite Pokémon with persistent client-side storage (`localStorage`). |
| **🧭 Comprehensive Explore Mode** | Multi-generation grid and list views with multi-criteria sorting (ID, Name, Generation). |
| **🚀 In-Memory Caching** | High-performance `Map`-based caching to eliminate redundant network requests and maximize speed. |

---

## 🎨 UI & Design System

The application is built on a custom design system with custom CSS tokens:

```css
:root {
    --bg-dark: #0B1021;           /* Deep Blue-Black Canvas */
    --pokedex-red: #EE1515;       /* Signature Pokédex Red */
    --text-yellow: #FFCB05;       /* Electric Yellow Accents */
    --card-bg: rgba(26, 31, 46, 0.7); /* Frosted Glass Layer */
    --border-glass: rgba(255, 255, 255, 0.08);
}
```

### Color-Coded Stats Palette

- 🟩 **HP**: `#22C55E`
- 🟧 **Attack**: `#F97316`
- 🟨 **Defense**: `#EAB308`
- 🟦 **Sp. Attack**: `#38BDF8`
- 🩵 **Sp. Defense**: `#06B6D4`
- 🟪 **Speed**: `#A855F7`

---

## 📂 Project Architecture

```
Pokédex/
├── 📄 index.html        # Main entry point & single-page view structure
├── 📁 css/
│   └── 🎨 style.css     # Complete design system, glassmorphism & responsive rules
├── 📁 js/
│   ├── ⚡ script.js      # Core controller, caching, DOM bindings & Home detail view
│   └── 🧭 explore.js     # Explore grid, filtering, sorting & favorites management
├── 📁 images/           # Local visual assets & icons
└── 📄 README.md         # Documentation & project guide
```

---

## 🚀 Getting Started

No build tooling or package installation is required. You can run the application instantly:

### Option 1: Using a Local HTTP Server (Recommended)

Using a local server prevents potential browser CORS limitations:

```bash
# Using Python 3
python -m http.server 8000

# OR using Node.js
npx serve .
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Option 2: Direct File Execution

Simply double-click `index.html` or open it directly in any modern browser:
```
file:///path/to/Pokédex/index.html
```

---

## 🔌 API Integration & Performance

This project consumes data from the official [PokéAPI](https://pokeapi.co/):

| Endpoint | Purpose | Example |
| :--- | :--- | :--- |
| `GET /api/v2/pokemon/{id_or_name}` | Main Pokémon metrics, types, abilities, moves & stats | `/api/v2/pokemon/25` |
| `GET /api/v2/pokemon-species/{id}` | Genus classification, habitat, color & description | `/api/v2/pokemon-species/25` |
| `GET /api/v2/pokemon?limit=20&offset=0` | Paginated index for browsing and carousels | `/api/v2/pokemon?limit=20` |

### Client-Side Cache Strategy

To provide instantaneous transitions, network responses are cached using JavaScript `Map` collections:

```javascript
const pokemonCache = new Map();
const speciesCache = new Map();

// Queries are resolved from memory before initiating network requests
if (pokemonCache.has(query)) return pokemonCache.get(query);
```

---

## 📱 Pages & Views

### 1. Home View (`#home-view`)
- **Left Column**: Identity badge, ID number, category pill (`Mouse Pokémon`), type tags, and height/weight indicators.
- **Center Stage**: 3D Pokémon model floating over perspective golden floor glow rings and faint Pokéball watermark outline.
- **Right Column**: Animated stat meters, abilities pills, and a 2×2 signature move matrix.
- **Bottom Tray**: Glassmorphic carousel tray with type-tinted cards and circular navigation buttons.

### 2. Explore View (`#explore-view`)
- Filter and search through hundreds of Pokémon across all regions.
- Toggle between interactive Grid and compact List layouts.
- Sort by ID (Asc/Desc) and Name (A-Z / Z-A).

### 3. Features View (`#features-view`)
- Interactive feature highlights including Battle Comparison, Type Matchup Matrix, Evolution Trees, and Move Dex.

### 4. About View (`#about-view`)
- Application overview, tech stack documentation, PokéAPI acknowledgments, and repository links.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Made with <span style="color: #EE1515;">♥</span> for the Pokémon Community</sub>
</div>
