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

async function fetchPokemonList() {
    // Disabled since sidebar list is removed
}

function changePage(direction) {
    // Disabled since sidebar list is removed
}

// --- UI Update Functions ---

function displayPokemon(data, speciesData) {
    // Basic Info
    pokemonName.textContent = data.name;
    pokemonId.textContent = `#${data.id.toString().padStart(3, '0')}`;
    
    // Category & Description
    let category = 'Unknown Pokémon';
    let description = 'No description available.';
    if (speciesData) {
        const genusEntry = speciesData.genera.find(g => g.language.name === 'en');
        if (genusEntry) category = genusEntry.genus;
        
        const flavorEntry = speciesData.flavor_text_entries.find(f => f.language.name === 'en');
        if (flavorEntry) {
            description = flavorEntry.flavor_text.replace(/[\n\f]/g, ' ');
        }
    }
    pokemonCategory.textContent = category;
    const descEl = document.getElementById('pokemon-description');
    if (descEl) descEl.textContent = description;

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

async function displayAbilities(abilities) {
    const pillsContainer = document.getElementById('pokemon-ability-pills');
    const descContainer = document.getElementById('pokemon-ability-desc');
    if (!pillsContainer || !descContainer) return;

    pillsContainer.innerHTML = '';
    descContainer.innerHTML = '';

    const abilityPromises = abilities.map(async (a) => {
        let pillName = a.ability.name.replace(/-/g, ' ');
        if (a.is_hidden) pillName += ' (Hidden)';
        
        let descText = 'No description available.';
        try {
            const res = await fetch(a.ability.url);
            const data = await res.json();
            const effectEntry = data.effect_entries.find(e => e.language.name === 'en');
            if (effectEntry) {
                descText = effectEntry.short_effect;
            } else {
                const flavorEntry = data.flavor_text_entries.find(f => f.language.name === 'en');
                if (flavorEntry) descText = flavorEntry.flavor_text.replace(/[\n\f]/g, ' ');
            }
        } catch(e) { console.error(e); }

        return { name: pillName, desc: descText };
    });

    const detailedAbilities = await Promise.all(abilityPromises);
    
    detailedAbilities.forEach(a => {
        const pill = document.createElement('div');
        pill.className = 'ability-pill';
        pill.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"></path></svg> ${a.name}`;
        pillsContainer.appendChild(pill);

        const descItem = document.createElement('div');
        descItem.className = 'ability-desc-item';
        descItem.innerHTML = `<h4>${a.name}</h4><p>${a.desc}</p>`;
        descContainer.appendChild(descItem);
    });
}

async function displayMoves(moves) {
    if (!pokemonMoves) return;
    pokemonMoves.innerHTML = '';
    const displayed = moves.slice(0, 5); // display top 5
    if (!displayed.length) {
        pokemonMoves.innerHTML = '<span>No moves.</span>';
        return;
    }

    const movePromises = displayed.map(async (m) => {
        try {
            const res = await fetch(m.move.url);
            const data = await res.json();
            return {
                name: data.name.replace(/-/g, ' '),
                type: data.type.name,
                power: data.power || '—',
                accuracy: data.accuracy ? `${data.accuracy}%` : '—'
            };
        } catch(e) {
            return {
                name: m.move.name.replace(/-/g, ' '),
                type: 'normal',
                power: '—',
                accuracy: '—'
            };
        }
    });

    const detailedMoves = await Promise.all(movePromises);

    detailedMoves.forEach(m => {
        const row = document.createElement('div');
        row.className = 'move-row';
        row.innerHTML = `
            <div class="move-name-col">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="var(--text-yellow)" stroke="none"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"></path></svg>
                <span>${m.name}</span>
            </div>
            <div class="move-type-pill" style="background-color: var(--type-${m.type}, #A8A878)">${m.type}</div>
            <div class="move-power">Power: ${m.power}</div>
            <div class="move-acc">Accuracy: ${m.accuracy}</div>
        `;
        pokemonMoves.appendChild(row);
    });
}

function renderSidebarList(results) {
    // Disabled since sidebar list is removed
}

function updateSidebarActiveState() {
    // Disabled since sidebar list is removed
}

function updatePaginationControls() {
    // Disabled since sidebar list is removed
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
