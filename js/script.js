/**
 * Pokédex App Logic
 */

// --- Constants & Config ---
const API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_ENDPOINT = `${API_BASE}/pokemon`;
const DEFAULT_POKEMON = '25'; // Pikachu
const ITEMS_PER_PAGE = 20;

// --- State ---
let currentOffset = 0;
let totalPokemon = 0;
const pokemonCache = new Map(); // Simple in-memory cache

// --- DOM Elements ---
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchMessage = document.getElementById('search-message');
const loadingState = document.getElementById('loading-state');
const pokemonCard = document.getElementById('pokemon-card');

// Card Elements
const pokemonImage = document.getElementById('pokemon-image');
const pokemonId = document.getElementById('pokemon-id');
const pokemonName = document.getElementById('pokemon-name');
const pokemonTypes = document.getElementById('pokemon-types');
const pokemonHeight = document.getElementById('pokemon-height');
const pokemonWeight = document.getElementById('pokemon-weight');
const pokemonStats = document.getElementById('pokemon-stats');
const pokemonAbilities = document.getElementById('pokemon-abilities');
const pokemonMoves = document.getElementById('pokemon-moves');

// Pagination / Browse Elements
const pokemonGrid = document.getElementById('pokemon-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');

// --- Initialization ---
async function init() {
    setupEventListeners();
    await fetchAndDisplayPokemon(DEFAULT_POKEMON);
    await fetchPokemonList();
}

// --- Event Listeners ---
function setupEventListeners() {
    searchForm.addEventListener('submit', handleSearch);
    prevBtn.addEventListener('click', () => changePage(-1));
    nextBtn.addEventListener('click', () => changePage(1));
}

// --- API Functions ---

/**
 * Fetch detailed data for a specific Pokémon (by name or ID)
 */
async function getPokemon(query) {
    const formattedQuery = query.toString().toLowerCase().trim();
    
    if (!formattedQuery) {
        throw new Error('Please enter a Pokémon name or ID.');
    }

    // Check Cache
    if (pokemonCache.has(formattedQuery)) {
        return pokemonCache.get(formattedQuery);
    }

    try {
        const response = await fetch(`${POKEMON_ENDPOINT}/${formattedQuery}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Pokémon not found. Please check the name or Pokédex number and try again.');
            }
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache the result by both name and ID
        pokemonCache.set(data.name, data);
        pokemonCache.set(data.id.toString(), data);
        
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Fetch a paginated list of Pokémon
 */
async function getPokemonList(limit, offset) {
    const cacheKey = `list_${limit}_${offset}`;
    if (pokemonCache.has(cacheKey)) {
        return pokemonCache.get(cacheKey);
    }

    try {
        const response = await fetch(`${POKEMON_ENDPOINT}?limit=${limit}&offset=${offset}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Pokémon list');
        }
        
        const data = await response.json();
        pokemonCache.set(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Error fetching list:', error);
        return null;
    }
}

// --- Controller Functions ---

async function handleSearch(e) {
    e.preventDefault();
    const query = searchInput.value;
    
    if (!query.trim()) {
        showError('Please enter a Pokémon name or ID.');
        return;
    }

    await fetchAndDisplayPokemon(query);
    searchInput.blur(); // dismiss keyboard on mobile
}

async function fetchAndDisplayPokemon(query) {
    showLoading();
    hideError();

    try {
        const data = await getPokemon(query);
        displayPokemon(data);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

async function fetchPokemonList() {
    // Disable buttons while loading
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading list...</div>';

    const data = await getPokemonList(ITEMS_PER_PAGE, currentOffset);
    
    if (data) {
        totalPokemon = data.count;
        renderPokemonList(data.results);
        updatePaginationControls();
    } else {
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--pokedex-red);">Failed to load Pokémon list.</div>';
    }
}

function changePage(direction) {
    currentOffset += direction * ITEMS_PER_PAGE;
    if (currentOffset < 0) currentOffset = 0;
    fetchPokemonList();
}

// --- UI Update Functions ---

function displayPokemon(data) {
    // Update basic info
    pokemonName.textContent = data.name;
    pokemonId.textContent = `#${data.id.toString().padStart(3, '0')}`;
    
    // Update image
    // Prefer official artwork if available, fallback to front_default sprite
    const imageUrl = data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default;
    
    pokemonImage.src = imageUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+'; // Placeholder if missing
    pokemonImage.alt = `Sprite of ${data.name}`;

    // Update dimensions
    // Height is in decimeters (1/10 of a meter) -> m
    pokemonHeight.textContent = `${(data.height / 10).toFixed(1)} m`;
    // Weight is in hectograms (1/10 of a kilogram) -> kg
    pokemonWeight.textContent = `${(data.weight / 10).toFixed(1)} kg`;

    displayTypes(data.types);
    displayStats(data.stats);
    displayAbilities(data.abilities);
    displayMoves(data.moves);

    // Show card, hide loading
    hideLoading();
    pokemonCard.classList.remove('hidden');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayTypes(types) {
    pokemonTypes.innerHTML = '';
    types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        const badge = document.createElement('span');
        badge.className = 'type-badge';
        badge.textContent = typeName;
        // Apply inline CSS variable for background color using our CSS variables
        badge.style.backgroundColor = `var(--type-${typeName}, var(--text-secondary))`;
        pokemonTypes.appendChild(badge);
    });
}

function displayStats(stats) {
    pokemonStats.innerHTML = '';
    
    // Format stat names for better readability
    const statNameMap = {
        'hp': 'HP',
        'attack': 'ATK',
        'defense': 'DEF',
        'special-attack': 'SPA',
        'special-defense': 'SPD',
        'speed': 'SPE'
    };

    // Calculate a reasonable max for the progress bars (255 is absolute max in games, but 150 is more common high end)
    const MAX_STAT_VALUE = 200; 

    stats.forEach(statInfo => {
        const baseValue = statInfo.base_stat;
        const rawName = statInfo.stat.name;
        const displayName = statNameMap[rawName] || rawName;
        
        // Calculate percentage for progress bar
        const percentage = Math.min(100, (baseValue / MAX_STAT_VALUE) * 100);
        
        // Determine color based on value
        let barColor = 'var(--type-fire)'; // Default red/orange
        if (baseValue > 100) barColor = 'var(--type-grass)'; // Green for great stats
        else if (baseValue > 60) barColor = 'var(--type-electric)'; // Yellow for decent stats
        
        const row = document.createElement('div');
        row.className = 'stat-row';
        row.innerHTML = `
            <span class="stat-name">${displayName}</span>
            <span class="stat-value">${baseValue}</span>
            <div class="stat-bar-container">
                <div class="stat-bar" style="width: 0%; background-color: ${barColor}"></div>
            </div>
        `;
        
        pokemonStats.appendChild(row);

        // Animate the bar filling up
        setTimeout(() => {
            const bar = row.querySelector('.stat-bar');
            if (bar) bar.style.width = `${percentage}%`;
        }, 50);
    });
}

function displayAbilities(abilities) {
    pokemonAbilities.innerHTML = '';
    abilities.forEach(abilityInfo => {
        const isHidden = abilityInfo.is_hidden;
        const pill = document.createElement('div');
        pill.className = 'ability-pill';
        
        // Format ability name (replace dashes with spaces)
        let name = abilityInfo.ability.name.replace(/-/g, ' ');
        if (isHidden) {
            name += ' <span style="font-size: 0.8em; color: var(--text-secondary);">(Hidden)</span>';
        }
        
        pill.innerHTML = name;
        pokemonAbilities.appendChild(pill);
    });
}

function displayMoves(moves) {
    pokemonMoves.innerHTML = '';
    
    // Only show first 20 moves to prevent excessive length
    const MAX_MOVES = 20;
    const displayedMoves = moves.slice(0, MAX_MOVES);
    
    if (displayedMoves.length === 0) {
        pokemonMoves.innerHTML = '<span class="text-secondary">No moves available.</span>';
        return;
    }

    displayedMoves.forEach(moveInfo => {
        const pill = document.createElement('span');
        pill.className = 'move-pill';
        pill.textContent = moveInfo.move.name.replace(/-/g, ' ');
        pokemonMoves.appendChild(pill);
    });
}

function renderPokemonList(results) {
    pokemonGrid.innerHTML = '';
    
    results.forEach((pokemon, index) => {
        // Extract ID from url: https://pokeapi.co/api/v2/pokemon/25/
        const urlParts = pokemon.url.split('/');
        const id = urlParts[urlParts.length - 2];
        
        const card = document.createElement('div');
        card.className = 'grid-item';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        
        // Use sprite for grid view for performance
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        
        card.innerHTML = `
            <img src="${spriteUrl}" alt="Sprite of ${pokemon.name}" class="grid-image" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5NiIgaGVpZ2h0PSI5NiI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=='">
            <span class="grid-id">#${id.toString().padStart(3, '0')}</span>
            <span class="grid-name">${pokemon.name.replace(/-/g, ' ')}</span>
        `;
        
        // Add click and keyboard event to load this Pokémon
        const loadThisPokemon = () => {
            searchInput.value = '';
            fetchAndDisplayPokemon(id);
        };
        
        card.addEventListener('click', loadThisPokemon);
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadThisPokemon();
            }
        });
        
        pokemonGrid.appendChild(card);
    });
}

function updatePaginationControls() {
    const currentPage = Math.floor(currentOffset / ITEMS_PER_PAGE) + 1;
    const totalPages = Math.ceil(totalPokemon / ITEMS_PER_PAGE);
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + ITEMS_PER_PAGE >= totalPokemon;
}

// --- Utility Functions ---

function showLoading() {
    pokemonCard.classList.add('hidden');
    loadingState.classList.remove('hidden');
    searchMessage.textContent = '';
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(msg) {
    searchMessage.textContent = msg;
    // Don't hide the card if we already have one showing, unless it's the initial load
    if (pokemonName.textContent === 'Loading') {
        pokemonCard.classList.add('hidden');
    }
}

function hideError() {
    searchMessage.textContent = '';
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
