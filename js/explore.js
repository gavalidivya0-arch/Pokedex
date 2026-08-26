/**
 * Explore Page Logic
 */

// --- Explore State ---
const exploreState = {
    isInitialized: false,
    allPokemon: [], // Array of { id, name, sprite, types: [] }
    filteredPokemon: [],
    typesList: ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'],
    currentPage: 1,
    perPage: 20,
    sortBy: 'id-asc',
    filters: {
        search: '',
        type: 'all',
        gen: 'all'
    },
    loading: false
};

const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
};

const genRanges = {
    '1': [1, 151], '2': [152, 251], '3': [252, 386],
    '4': [387, 493], '5': [494, 649], '6': [650, 721],
    '7': [722, 809], '8': [810, 905], '9': [906, 1025]
};

// --- DOM Elements ---
const exploreView = document.getElementById('explore-view');
const homeView = document.getElementById('home-view');
const exploreGrid = document.getElementById('explore-grid');
const exploreLoading = document.getElementById('explore-loading');
const explorePagination = document.getElementById('explore-pagination');
const explorePageInfo = document.getElementById('explore-page-info');

// Filters
const exploreSearchInput = document.getElementById('explore-search');
const typeFilterGrid = document.getElementById('type-filter-grid');
const genSelect = document.getElementById('gen-select');
const resetFiltersBtn = document.getElementById('reset-filters');
const applyFiltersBtn = document.getElementById('apply-filters');
const sortSelect = document.getElementById('sort-select');
const perPageSelect = document.getElementById('per-page-select');

// --- Initialization ---
async function initExplore() {
    if (exploreState.isInitialized) return;
    
    renderTypeFilters();
    setupExploreListeners();
    
    await fetchInitialExploreData();
    exploreState.isInitialized = true;
}

function setupExploreListeners() {
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', resetFilters);
    
    exploreSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });

    sortSelect.addEventListener('change', (e) => {
        exploreState.sortBy = e.target.value;
        applyFilters();
    });

    perPageSelect.addEventListener('change', (e) => {
        exploreState.perPage = parseInt(e.target.value);
        exploreState.currentPage = 1;
        renderExploreGrid();
    });
}

function renderTypeFilters() {
    typeFilterGrid.innerHTML = '';
    const visibleTypes = exploreState.typesList.slice(0, 8); // show 8 initially as per mockup
    
    visibleTypes.forEach(type => {
        const btn = document.createElement('button');
        btn.className = 'type-filter-btn';
        btn.dataset.type = type;
        
        const icon = document.createElement('span');
        icon.className = 'type-filter-icon';
        icon.style.backgroundColor = typeColors[type];
        
        const text = document.createElement('span');
        text.textContent = type;
        
        btn.appendChild(icon);
        btn.appendChild(text);
        
        btn.addEventListener('click', () => {
            // toggle selection
            document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            exploreState.filters.type = type;
            applyFilters();
        });
        
        typeFilterGrid.appendChild(btn);
    });
}

// --- Data Fetching ---
async function fetchInitialExploreData() {
    showExploreLoading();
    
    try {
        // Fetch up to Gen 9
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await res.json();
        
        // Map basic data
        exploreState.allPokemon = data.results.map((p, index) => {
            const id = index + 1;
            return {
                id: id,
                name: p.name,
                url: p.url,
                sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
                types: [] // We'll lazy load or fetch types in batch
            };
        });
        
        exploreState.filteredPokemon = [...exploreState.allPokemon];
        applyFilters(); // will sort and render
        
    } catch (err) {
        console.error('Failed to load explore data', err);
        exploreGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem;">Error loading data. Please refresh.</div>';
    } finally {
        hideExploreLoading();
    }
}

// Lazy load types for a batch of pokemon
async function fetchTypesForBatch(pokemonList) {
    const promises = pokemonList.map(async (p) => {
        if (p.types.length > 0) return p; // already fetched
        try {
            const res = await fetch(p.url);
            const data = await res.json();
            p.types = data.types.map(t => t.type.name);
        } catch (e) {
            console.error(e);
        }
        return p;
    });
    await Promise.all(promises);
}

// --- Filtering & Sorting ---
async function applyFilters() {
    exploreState.filters.search = exploreSearchInput.value.toLowerCase().trim();
    exploreState.filters.gen = genSelect.value;
    
    // First, if filtering by type, we need to ensure we have the type data or use the /type endpoint
    // To make it instant without fetching 1000 detailed records, we fetch from /type endpoint if a type is selected
    let baseList = exploreState.allPokemon;
    
    if (exploreState.filters.type !== 'all') {
        showExploreLoading();
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/type/${exploreState.filters.type}`);
            const typeData = await res.json();
            const typeIds = new Set(typeData.pokemon.map(p => {
                const parts = p.pokemon.url.split('/');
                return parseInt(parts[parts.length - 2]);
            }));
            
            baseList = exploreState.allPokemon.filter(p => typeIds.has(p.id));
        } catch (e) {
            console.error(e);
        }
        hideExploreLoading();
    }
    
    // Apply Search
    let result = baseList;
    if (exploreState.filters.search) {
        result = result.filter(p => p.name.includes(exploreState.filters.search) || p.id.toString() === exploreState.filters.search);
    }
    
    // Apply Gen
    if (exploreState.filters.gen !== 'all') {
        const range = genRanges[exploreState.filters.gen];
        result = result.filter(p => p.id >= range[0] && p.id <= range[1]);
    }
    
    // Apply Sort
    result.sort((a, b) => {
        switch(exploreState.sortBy) {
            case 'id-asc': return a.id - b.id;
            case 'id-desc': return b.id - a.id;
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            default: return a.id - b.id;
        }
    });
    
    exploreState.filteredPokemon = result;
    exploreState.currentPage = 1;
    renderExploreGrid();
}

function resetFilters() {
    exploreSearchInput.value = '';
    genSelect.value = 'all';
    exploreState.filters.type = 'all';
    document.querySelectorAll('.type-filter-btn').forEach(b => b.classList.remove('selected'));
    
    applyFilters();
}

// --- Rendering ---
async function renderExploreGrid() {
    showExploreLoading();
    
    const start = (exploreState.currentPage - 1) * exploreState.perPage;
    const end = start + exploreState.perPage;
    const pageItems = exploreState.filteredPokemon.slice(start, end);
    
    // Ensure we have type data for the displayed items
    await fetchTypesForBatch(pageItems);
    
    exploreGrid.innerHTML = '';
    
    if (pageItems.length === 0) {
        exploreGrid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-secondary);">No Pokémon found matching these filters.</div>';
    } else {
        pageItems.forEach(p => {
            const card = document.createElement('div');
            card.className = 'explore-card';
            
            let typeBadges = '';
            if (p.types && p.types.length > 0) {
                typeBadges = p.types.map(t => `<span class="card-type-badge" style="background-color: ${typeColors[t] || '#fff'}">${t}</span>`).join('');
            }
            
            card.innerHTML = `
                <div class="card-header">
                    <span>#${p.id.toString().padStart(3, '0')}</span>
                    <button class="star-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                </div>
                <img src="${p.sprite}" alt="${p.name}" class="card-image" loading="lazy">
                <div class="card-name">${p.name.replace(/-/g, ' ')}</div>
                <div class="card-types">${typeBadges}</div>
            `;
            
            // Add click to show detail (could switch to home view and load it)
            card.addEventListener('click', (e) => {
                if(e.target.closest('.star-btn')) {
                    e.target.closest('.star-btn').classList.toggle('favorited');
                    return;
                }
                
                // Switch to home view and load
                document.getElementById('nav-home').click();
                document.getElementById('search-input').value = '';
                fetchAndDisplayPokemon(p.id); // From script.js
            });
            
            exploreGrid.appendChild(card);
        });
    }
    
    renderPagination();
    hideExploreLoading();
}

function renderPagination() {
    const totalItems = exploreState.filteredPokemon.length;
    const totalPages = Math.ceil(totalItems / exploreState.perPage) || 1;
    
    explorePagination.innerHTML = '';
    
    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-num-btn';
    prevBtn.innerHTML = '&lt; Previous';
    prevBtn.disabled = exploreState.currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (exploreState.currentPage > 1) {
            exploreState.currentPage--;
            renderExploreGrid();
        }
    });
    explorePagination.appendChild(prevBtn);
    
    // Page Numbers (simplified logic: show first few, current, and last)
    let startPage = Math.max(1, exploreState.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pBtn = document.createElement('button');
        pBtn.className = `page-num-btn ${i === exploreState.currentPage ? 'active' : ''}`;
        pBtn.textContent = i;
        pBtn.addEventListener('click', () => {
            exploreState.currentPage = i;
            renderExploreGrid();
        });
        explorePagination.appendChild(pBtn);
    }
    
    if (endPage < totalPages) {
        const dots = document.createElement('span');
        dots.style.color = 'var(--text-secondary)';
        dots.style.alignSelf = 'center';
        dots.textContent = '...';
        explorePagination.appendChild(dots);
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'page-num-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', () => {
            exploreState.currentPage = totalPages;
            renderExploreGrid();
        });
        explorePagination.appendChild(lastBtn);
    }
    
    // Next
    const nxtBtn = document.createElement('button');
    nxtBtn.className = 'page-num-btn';
    nxtBtn.innerHTML = 'Next &gt;';
    nxtBtn.disabled = exploreState.currentPage === totalPages;
    nxtBtn.addEventListener('click', () => {
        if (exploreState.currentPage < totalPages) {
            exploreState.currentPage++;
            renderExploreGrid();
        }
    });
    explorePagination.appendChild(nxtBtn);
    
    // Info text
    const startIdx = totalItems === 0 ? 0 : (exploreState.currentPage - 1) * exploreState.perPage + 1;
    const endIdx = Math.min(exploreState.currentPage * exploreState.perPage, totalItems);
    explorePageInfo.textContent = `Showing ${startIdx} to ${endIdx} of ${totalItems} Pokémon`;
}

function showExploreLoading() {
    exploreLoading.classList.remove('hidden');
}
function hideExploreLoading() {
    exploreLoading.classList.add('hidden');
}

// Expose init function globally
window.initExplore = initExplore;
