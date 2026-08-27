/**
 * Pokédex App Logic
 */

// --- Constants & Config ---
const API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_ENDPOINT = `${API_BASE}/pokemon`;
const SPECIES_ENDPOINT = `${API_BASE}/pokemon-species`;
const DEFAULT_POKEMON = '25'; // Pikachu
const ITEMS_PER_PAGE = 20;

// --- State ---
let currentOffset = 0;
let totalPokemon = 0;
const pokemonCache = new Map(); 
const speciesCache = new Map();
let activePokemonId = null;

// --- DOM Elements ---
const navLinks = document.querySelectorAll('.nav-links a');
const navFavBtn = document.getElementById('nav-fav-btn');
const navSearchInput = document.getElementById('nav-search-input');

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchMessage = document.getElementById('search-message');
const loadingState = document.getElementById('loading-state');
const appContent = document.getElementById('app-content');

// Detail Elements
const pokemonImage = document.getElementById('pokemon-image');
const pokemonId = document.getElementById('pokemon-id');
const pokemonName = document.getElementById('pokemon-name');
const pokemonCategory = document.getElementById('pokemon-category');
const pokemonTypes = document.getElementById('pokemon-types');
const pokemonHeight = document.getElementById('pokemon-height');
const pokemonWeight = document.getElementById('pokemon-weight');
const pokemonStats = document.getElementById('pokemon-stats');
const pokemonAbilities = document.getElementById('pokemon-abilities');
const pokemonMoves = document.getElementById('pokemon-moves');

// Sidebar Elements
const pokemonListContainer = document.getElementById('pokemon-list');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// --- Initialization ---
async function init() {
    setupEventListeners();
    await fetchPokemonList();
    await fetchAndDisplayPokemon(DEFAULT_POKEMON);
}

// --- Event Listeners ---
function setupEventListeners() {
    searchForm.addEventListener('submit', handleSearch);
    if (prevBtn) prevBtn.addEventListener('click', () => changePage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changePage(1));

    // Navbar Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            if(e.target.textContent === 'Home') {
                document.getElementById('explore-view').classList.add('hidden');
                document.getElementById('features-view').classList.add('hidden');
                document.getElementById('about-view').classList.add('hidden');
                document.getElementById('home-view').classList.remove('hidden');
                searchInput.value = '';
                fetchAndDisplayPokemon(DEFAULT_POKEMON);
            } else if (e.target.textContent === 'Explore') {
                document.getElementById('home-view').classList.add('hidden');
                document.getElementById('features-view').classList.add('hidden');
                document.getElementById('about-view').classList.add('hidden');
                document.getElementById('explore-view').classList.remove('hidden');
                if (window.initExplore) window.initExplore();
                if (window.showExplore) window.showExplore();
            } else if (e.target.textContent === 'Features') {
                document.getElementById('home-view').classList.add('hidden');
                document.getElementById('explore-view').classList.add('hidden');
                document.getElementById('about-view').classList.add('hidden');
                document.getElementById('features-view').classList.remove('hidden');
            } else if (e.target.textContent === 'About') {
                document.getElementById('home-view').classList.add('hidden');
                document.getElementById('explore-view').classList.add('hidden');
                document.getElementById('features-view').classList.add('hidden');
                document.getElementById('about-view').classList.remove('hidden');
            } else {
                showError(`${e.target.textContent} section coming soon!`);
                setTimeout(hideError, 3000);
            }
        });
    });

    // Navbar Actions
    if(navSearchInput) {
        navSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = navSearchInput.value.trim();
                if (query) {
                    // Switch to Home view first
                    document.getElementById('explore-view').classList.add('hidden');
                    document.getElementById('features-view').classList.add('hidden');
                    document.getElementById('about-view').classList.add('hidden');
                    document.getElementById('home-view').classList.remove('hidden');
                    
                    // Update nav active state
                    navLinks.forEach(l => l.classList.remove('active'));
                    navLinks[0].classList.add('active'); // Home link
                    
                    // Trigger search
                    document.getElementById('search-input').value = ''; // clear home search
                    fetchAndDisplayPokemon(query);
                    
                    navSearchInput.value = '';
                    navSearchInput.blur();
                }
            }
        });
    }

    if(navFavBtn) {
        navFavBtn.addEventListener('click', () => {
            document.getElementById('home-view').classList.add('hidden');
            document.getElementById('features-view').classList.add('hidden');
            document.getElementById('about-view').classList.add('hidden');
            document.getElementById('explore-view').classList.remove('hidden');
            if (window.initExplore) window.initExplore();
            if (window.showFavorites) window.showFavorites();
            
            navLinks.forEach(l => l.classList.remove('active'));
            navLinks[1].classList.add('active'); // Explore link
        });
    }
}

// --- API Functions ---

async function getPokemon(query) {
    const formattedQuery = query.toString().toLowerCase().trim();
    if (!formattedQuery) throw new Error('Please enter a Pokémon name or ID.');

    if (pokemonCache.has(formattedQuery)) return pokemonCache.get(formattedQuery);

    try {
        const response = await fetch(`${POKEMON_ENDPOINT}/${formattedQuery}`);
        if (!response.ok) {
            if (response.status === 404) throw new Error('Pokémon not found.');
            throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        pokemonCache.set(data.name, data);
        pokemonCache.set(data.id.toString(), data);
        return data;
    } catch (error) {
        throw error;
    }
}

async function getPokemonSpecies(idOrName) {
    if (speciesCache.has(idOrName)) return speciesCache.get(idOrName);
    try {
        const response = await fetch(`${SPECIES_ENDPOINT}/${idOrName}`);
        if (!response.ok) return null;
        const data = await response.json();
        speciesCache.set(idOrName, data);
        return data;
    } catch (error) {
        return null;
    }
}

async function getPokemonList(limit, offset) {
    const cacheKey = `list_${limit}_${offset}`;
    if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey);

    try {
        const response = await fetch(`${POKEMON_ENDPOINT}?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch list');
        const data = await response.json();
        pokemonCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// --- Controller Functions ---

async function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value;
    if (!query.trim()) return showError('Enter a Pokémon name or ID.');
    await fetchAndDisplayPokemon(query);
    searchInput.blur();
}

async function fetchAndDisplayPokemon(query) {
    showLoading();
    hideError();

    try {
        const data = await getPokemon(query);
        const speciesData = await getPokemonSpecies(data.id);
        
        activePokemonId = data.id.toString();
        displayPokemon(data, speciesData);
        updateSidebarActiveState();
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

const FEATURED_POKEMON = [
    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
    { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' },
    { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon/133/' },
    { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
    { name: 'mewtwo', url: 'https://pokeapi.co/api/v2/pokemon/150/' }
];

async function fetchPokemonList() {
    if (!pokemonListContainer) return;
    
    if (currentOffset === 0) {
        totalPokemon = 1302;
        renderSidebarList(FEATURED_POKEMON);
        updatePaginationControls();
        return;
    }

    pokemonListContainer.innerHTML = '<div class="spinner"></div>';
    const data = await getPokemonList(ITEMS_PER_PAGE, currentOffset);
    if (!data) return;
    
    totalPokemon = data.count;
    renderSidebarList(data.results);
    updatePaginationControls();
}

function changePage(direction) {
    const newOffset = currentOffset + (direction * ITEMS_PER_PAGE);
    if (newOffset >= 0 && newOffset < totalPokemon) {
        currentOffset = newOffset;
        fetchPokemonList();
    }
}

// --- UI Update Functions ---

function displayPokemon(data, speciesData) {
    // Basic Info
    pokemonName.textContent = data.name.toUpperCase();
    pokemonId.textContent = `#${data.id.toString().padStart(3, '0')}`;
    
    // Category & Description
    let category = 'Pokémon';
    if (speciesData) {
        const genusEntry = speciesData.genera.find(g => g.language.name === 'en');
        if (genusEntry) category = genusEntry.genus;
    }
    pokemonCategory.textContent = category;

    // Image
    const imageUrl = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
    pokemonImage.src = imageUrl || '';
    pokemonImage.alt = data.name;

    // Dimensions
    pokemonHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
    pokemonWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;

    displayTypes(data.types);
    displayStats(data.stats);
    displayAbilities(data.abilities);
    displayMoves(data.moves);

    hideLoading();
}

function displayTypes(types) {
    pokemonTypes.innerHTML = '';
    types.forEach(t => {
        const name = t.type.name;
        const badge = document.createElement('span');
        badge.className = 'type-badge-exact';
        badge.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>
            <span>${name.toUpperCase()}</span>
        `;
        pokemonTypes.appendChild(badge);
    });
}

function displayStats(stats) {
    pokemonStats.innerHTML = '';
    const statConfig = {
        'hp': { label: 'HP', color: '#22c55e' },
        'attack': { label: 'Attack', color: '#f97316' },
        'defense': { label: 'Defense', color: '#eab308' },
        'special-attack': { label: 'Sp. Attack', color: '#38bdf8' },
        'special-defense': { label: 'Sp. Defense', color: '#06b6d4' },
        'speed': { label: 'Speed', color: '#a855f7' }
    };
    const MAX_VISUAL_STAT = 130; 

    stats.forEach(s => {
        const config = statConfig[s.stat.name] || { label: s.stat.name, color: 'var(--text-yellow)' };
        const val = s.base_stat;
        const pct = Math.min(100, Math.max(10, (val / MAX_VISUAL_STAT) * 100));
        
        const row = document.createElement('div');
        row.className = 'stat-row-exact';
        row.innerHTML = `
            <span class="stat-name-exact">${config.label}</span>
            <div class="stat-bar-container-exact">
                <div class="stat-bar-exact" style="width: 0%; background-color: ${config.color}"></div>
            </div>
            <span class="stat-val-exact">${val}</span>
        `;
        pokemonStats.appendChild(row);

        setTimeout(() => {
            const bar = row.querySelector('.stat-bar-exact');
            if (bar) bar.style.width = `${pct}%`;
        }, 50);
    });
}

function displayAbilities(abilities) {
    const pillsContainer = document.getElementById('pokemon-ability-pills');
    if (!pillsContainer) return;
    pillsContainer.innerHTML = '';

    abilities.forEach(a => {
        let name = a.ability.name.replace(/-/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        if (a.is_hidden) name += ' (Hidden)';

        const pill = document.createElement('div');
        pill.className = 'ability-pill-exact';
        pill.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>
            <span>${name}</span>
        `;
        pillsContainer.appendChild(pill);
    });
}

const SIGNATURE_MOVES = {
    '25': ['thunder-shock', 'iron-tail', 'quick-attack', 'electro-ball']
};

function displayMoves(moves) {
    if (!pokemonMoves) return;
    pokemonMoves.innerHTML = '';
    
    let moveList = moves.map(m => m.move.name);
    if (activePokemonId && SIGNATURE_MOVES[activePokemonId]) {
        const preferred = SIGNATURE_MOVES[activePokemonId];
        const matched = preferred.filter(p => moveList.includes(p));
        const others = moveList.filter(m => !preferred.includes(m));
        moveList = [...matched, ...others];
    }
    
    // Top 4 moves for 2x2 grid
    const displayed = moveList.slice(0, 4);
    if (!displayed.length) {
        pokemonMoves.innerHTML = '<span class="move-item-exact">No moves listed</span>';
        return;
    }

    displayed.forEach(name => {
        let moveName = name.replace(/-/g, ' ');
        moveName = moveName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const item = document.createElement('div');
        item.className = 'move-item-exact';
        item.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>
            <span>${moveName}</span>
        `;
        pokemonMoves.appendChild(item);
    });
}

// Map known Pokemon IDs to their signature theme color
const POKEMON_ID_COLORS = {
    '1': '#7AC74C',  // Bulbasaur
    '2': '#7AC74C',  // Ivysaur
    '3': '#7AC74C',  // Venusaur
    '4': '#EE8130',  // Charmander
    '5': '#EE8130',  // Charmeleon
    '6': '#EE8130',  // Charizard
    '7': '#6390F0',  // Squirtle
    '8': '#6390F0',  // Wartortle
    '9': '#6390F0',  // Blastoise
    '25': '#FFCB05', // Pikachu
    '133': '#C69D7A', // Eevee
    '150': '#A33EA1', // Mewtwo
};

async function renderSidebarList(results) {
    if (!pokemonListContainer) return;
    pokemonListContainer.innerHTML = '';
    
    for (const p of results) {
        const urlParts = p.url.split('/');
        const id = urlParts[urlParts.length - 2];
        const paddedId = id.padStart(3, '0');
        const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        const idColor = POKEMON_ID_COLORS[id] || 'var(--text-yellow)';

        const card = document.createElement('div');
        card.className = 'list-card';
        card.dataset.id = id;
        if (id === activePokemonId) card.classList.add('active');
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${p.name}" loading="lazy" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
            <span class="list-id" style="color: ${idColor}">#${paddedId}</span>
            <span class="list-name">${p.name}</span>
        `;
        
        card.addEventListener('click', () => {
            fetchAndDisplayPokemon(id);
        });
        
        pokemonListContainer.appendChild(card);
    }
}

function updateSidebarActiveState() {
    if (!pokemonListContainer) return;
    const cards = pokemonListContainer.querySelectorAll('.list-card');
    cards.forEach(c => {
        if (c.dataset.id === activePokemonId) {
            c.classList.add('active');
            c.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            c.classList.remove('active');
        }
    });
}

function updatePaginationControls() {
    if (prevBtn) prevBtn.disabled = currentOffset === 0;
    if (nextBtn) nextBtn.disabled = currentOffset + ITEMS_PER_PAGE >= totalPokemon;
    if (prevBtn) prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
    if (nextBtn) nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
}

// --- Utility Functions ---
function showLoading() {
    appContent.classList.add('hidden');
    loadingState.classList.remove('hidden');
    searchMessage.textContent = '';
}

function hideLoading() {
    loadingState.classList.add('hidden');
    appContent.classList.remove('hidden');
}

function showError(msg) {
    searchMessage.textContent = msg;
}

function hideError() {
    searchMessage.textContent = '';
}

document.addEventListener('DOMContentLoaded', init);
