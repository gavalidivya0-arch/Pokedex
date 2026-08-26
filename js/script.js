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
const navSearchBtn = document.getElementById('nav-search-btn');
const navFavBtn = document.getElementById('nav-fav-btn');
const navGithubBtn = document.getElementById('nav-github-btn');

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
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));

    // Navbar Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            
            if(e.target.textContent === 'Home') {
                document.getElementById('explore-view').classList.add('hidden');
                document.getElementById('features-view').classList.add('hidden');
                document.getElementById('home-view').classList.remove('hidden');
                searchInput.value = '';
                fetchAndDisplayPokemon(DEFAULT_POKEMON);
            } else if (e.target.textContent === 'Explore') {
                document.getElementById('home-view').classList.add('hidden');
                document.getElementById('features-view').classList.add('hidden');
                document.getElementById('explore-view').classList.remove('hidden');
                if (window.initExplore) window.initExplore();
                if (window.showExplore) window.showExplore();
            } else if (e.target.textContent === 'Features') {
                document.getElementById('home-view').classList.add('hidden');
                document.getElementById('explore-view').classList.add('hidden');
                document.getElementById('features-view').classList.remove('hidden');
            } else {
                showError(`${e.target.textContent} section coming soon!`);
                setTimeout(hideError, 3000);
            }
        });
    });

    // Navbar Actions
    if(navSearchBtn) {
        navSearchBtn.addEventListener('click', () => {
            searchInput.focus();
        });
    }

    if(navFavBtn) {
        navFavBtn.addEventListener('click', () => {
            document.getElementById('home-view').classList.add('hidden');
            document.getElementById('features-view').classList.add('hidden');
            document.getElementById('explore-view').classList.remove('hidden');
            if (window.initExplore) window.initExplore();
            if (window.showFavorites) window.showFavorites();
        });
    }

    if(navGithubBtn) {
        navGithubBtn.addEventListener('click', () => {
            window.open('https://github.com/gavalidivya0-arch/Pok-dex', '_blank');
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

async function fetchPokemonList() {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    pokemonListContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Loading...</div>';

    const data = await getPokemonList(ITEMS_PER_PAGE, currentOffset);
    
    if (data) {
        totalPokemon = data.count;
        renderSidebarList(data.results);
        updatePaginationControls();
    } else {
        pokemonListContainer.innerHTML = '<div style="color: var(--pokedex-red); padding: 1rem;">Failed to load list.</div>';
    }
}

function changePage(direction) {
    currentOffset += direction * ITEMS_PER_PAGE;
    if (currentOffset < 0) currentOffset = 0;
    fetchPokemonList();
}

// --- UI Update Functions ---

function displayPokemon(data, speciesData) {
    // Basic Info
    pokemonName.textContent = data.name;
    pokemonId.textContent = `#${data.id.toString().padStart(3, '0')}`;
    
    // Category (Genus)
    let category = 'Unknown Pokémon';
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
    pokemonHeight.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="12" y1="2" x2="12" y2="22"></line><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="18" x2="16" y2="18"></line></svg> ${(data.height / 10).toFixed(1)} m`;
    pokemonWeight.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> ${(data.weight / 10).toFixed(1)} kg`;

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
        badge.className = 'type-badge';
        badge.textContent = name;
        badge.style.backgroundColor = `var(--type-${name}, #fff)`;
        pokemonTypes.appendChild(badge);
    });
}

function displayStats(stats) {
    pokemonStats.innerHTML = '';
    const nameMap = {
        'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
        'special-attack': 'SPA', 'special-defense': 'SPD', 'speed': 'SPE'
    };
    const MAX_STAT = 200; 

    stats.forEach(s => {
        const val = s.base_stat;
        const name = nameMap[s.stat.name] || s.stat.name;
        const pct = Math.min(100, (val / MAX_STAT) * 100);
        
        let color = 'var(--type-fire)'; 
        if (val >= 100) color = 'var(--type-grass)';
        else if (val >= 60) color = 'var(--type-electric)';
        else color = 'var(--pokedex-red)';
        
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <span class="stat-name">${name}</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: 0%; background-color: ${color}"></div>
            </div>
            <span class="stat-value">${val}</span>
        `;
        pokemonStats.appendChild(row);

        setTimeout(() => {
            const bar = row.querySelector('.stat-bar');
            if (bar) bar.style.width = `${pct}%`;
        }, 50);
    });
}

function displayAbilities(abilities) {
    pokemonAbilities.innerHTML = '';
    abilities.forEach(a => {
        const pill = document.createElement('div');
        pill.className = 'ability-pill';
        let name = a.ability.name.replace(/-/g, ' ');
        if (a.is_hidden) name += ' (Hidden)';
        pill.textContent = name;
        pokemonAbilities.appendChild(pill);
    });
}

function displayMoves(moves) {
    pokemonMoves.innerHTML = '';
    const displayed = moves.slice(0, 20);
    if (!displayed.length) {
        pokemonMoves.innerHTML = '<span>No moves.</span>';
        return;
    }
    displayed.forEach(m => {
        const pill = document.createElement('span');
        pill.className = 'move-pill';
        pill.textContent = m.move.name.replace(/-/g, ' ');
        pokemonMoves.appendChild(pill);
    });
}

function renderSidebarList(results) {
    pokemonListContainer.innerHTML = '';
    
    results.forEach((pokemon) => {
        const parts = pokemon.url.split('/');
        const id = parts[parts.length - 2];
        
        const item = document.createElement('div');
        item.className = `list-item ${id === activePokemonId ? 'active' : ''}`;
        item.dataset.id = id;
        
        const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        
        item.innerHTML = `
            <img src="${sprite}" alt="${pokemon.name}" class="list-item-img" loading="lazy">
            <div class="list-item-info">
                <span class="list-item-id">#${id.padStart(3, '0')}</span>
                <span class="list-item-name">${pokemon.name.replace(/-/g, ' ')}</span>
            </div>
        `;
        
        item.addEventListener('click', () => {
            searchInput.value = '';
            fetchAndDisplayPokemon(id);
        });
        
        pokemonListContainer.appendChild(item);
    });
}

function updateSidebarActiveState() {
    const items = pokemonListContainer.querySelectorAll('.list-item');
    items.forEach(item => {
        if (item.dataset.id === activePokemonId) {
            item.classList.add('active');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            item.classList.remove('active');
        }
    });
}

function updatePaginationControls() {
    const currentListEnd = Math.min(currentOffset + ITEMS_PER_PAGE, totalPokemon);
    pageInfo.textContent = `${currentOffset + 1} - ${currentListEnd} / ${totalPokemon}`;
    
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + ITEMS_PER_PAGE >= totalPokemon;
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
