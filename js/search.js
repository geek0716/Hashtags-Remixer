// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const advancedSearchToggle = document.getElementById('advanced-search-toggle');
const filterOptions = document.getElementById('filter-options');
const applyFiltersBtn = document.getElementById('apply-filters');

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Search for content
const performSearch = debounce(async (query) => {
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }

    const searchData = await searchMulti(query);
    displaySearchResults(searchData);
}, 500);

// Display search results
function displaySearchResults(data) {
    if (!data || !data.results || data.results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        searchResults.classList.add('active');
        return;
    }

    searchResults.innerHTML = '';
    
    // Only display movies and TV shows, limit to 8 results
    const filteredResults = data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .slice(0, 8);
    
    filteredResults.forEach(item => {
        // Determine if it's a movie or TV show
        const isMovie = item.media_type === 'movie';
        const title = isMovie ? item.title : item.name;
        const releaseDate = isMovie ? item.release_date : item.first_air_date;
        const year = releaseDate ? getYear(releaseDate) : '';
        const type = isMovie ? 'movie' : 'tv';
        
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="search-result-image">
                <img src="${getPosterUrl(item.poster_path, '/w92')}" alt="${title}">
            </div>
            <div class="search-result-info">
                <h4>${title}</h4>
                <p>${year} • ${isMovie ? 'Movie' : 'TV Show'}</p>
            </div>
        `;
        
        // Add click event to redirect to player
        resultItem.addEventListener('click', () => {
            window.location.href = `player.html?id=${item.id}&type=${type}`;
        });
        
        searchResults.appendChild(resultItem);
    });
    
    searchResults.classList.add('active');
}

// Filter functionality
function setupFilters() {
    // Handle advanced search toggle
    if (advancedSearchToggle) {
        advancedSearchToggle.addEventListener('click', () => {
            filterOptions.classList.toggle('active');
        });
    }
    
    // Handle genre tag selection
    const genreTags = document.querySelectorAll('.genre-tag');
    genreTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    // Handle rating range input
    const ratingFilter = document.getElementById('rating-filter');
    const ratingValue = document.getElementById('rating-value');
    if (ratingFilter && ratingValue) {
        ratingFilter.addEventListener('input', () => {
            ratingValue.textContent = `${ratingFilter.value}+`;
        });
    }
    
    // Apply filters button
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    // Load genre tags
    loadGenreTags('genre-filters');
}

// Apply search filters
function applyFilters() {
    const activeGenres = Array.from(document.querySelectorAll('.genre-tag.active'))
        .map(tag => tag.dataset.genreId)
        .join(',');
    
    const yearFrom = document.getElementById('year-from').value;
    const yearTo = document.getElementById('year-to').value;
    const minRating = document.getElementById('rating-filter').value;
    
    // Redirect to movies page with filters
    let url = 'movies.html?';
    const params = new URLSearchParams();
    
    if (activeGenres) params.append('with_genres', activeGenres);
    if (yearFrom) params.append('primary_release_date.gte', `${yearFrom}-01-01`);
    if (yearTo) params.append('primary_release_date.lte', `${yearTo}-12-31`);
    if (minRating > 0) params.append('vote_average.gte', minRating);
    
    window.location.href = url + params.toString();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search input event
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
    
    // Search button click event
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
    
    // Setup filters
    setupFilters();
});
