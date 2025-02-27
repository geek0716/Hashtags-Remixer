// Movies Page Script
document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    let totalPages = 0;
    let currentFilters = {
        genre: '',
        sortBy: 'popularity.desc',
        yearFrom: '',
        yearTo: ''
    };

    // Initialize page
    initPage();

    // Initialize the movies page
    async function initPage() {
        // Load genres for filter
        await loadGenres();
        
        // Set background image
        setParallaxBackground();
        
        // Load initial movies
        await loadMovies();
        
        // Set up filter listeners
        setupFilterListeners();
    }
    
    // Load movie genres from API
    async function loadGenres() {
        const genresData = await fetchFromAPI('/genre/movie/list');
        
        if (!genresData || !genresData.genres) {
            console.error('Failed to load genres');
            return;
        }
        
        const genreSelect = document.getElementById('genre-filter');
        
        genresData.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
        
        // Check URL params for preselected genre
        const urlParams = new URLSearchParams(window.location.search);
        const genreParam = urlParams.get('genre');
        
        if (genreParam) {
            genreSelect.value = genreParam;
            currentFilters.genre = genreParam;
        }
    }
    
    // Set parallax background with a popular movie
    async function setParallaxBackground() {
        const popularMovies = await fetchFromAPI('/movie/popular');
        
        if (popularMovies && popularMovies.results && popularMovies.results.length > 0) {
            // Get a random movie from top 5
            const randomIndex = Math.floor(Math.random() * 5);
            const movie = popularMovies.results[randomIndex];
            
            if (movie.backdrop_path) {
                const parallaxBg = document.getElementById('movies-header-bg');
                parallaxBg.style.backgroundImage = `url('${IMAGE_BASE_URL}${BACKDROP_SIZE}${movie.backdrop_path}')`;
            }
        }
    }
    
    // Load movies based on current filters and page
    async function loadMovies() {
        // Show loading state
        const gridContainer = document.getElementById('movies-grid');
        gridContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Prepare API parameters
        const params = {
            page: currentPage,
            sort_by: currentFilters.sortBy
        };
        
        // Add genre if selected
        if (currentFilters.genre) {
            params.with_genres = currentFilters.genre;
        }
        
        // Add year range if set
        if (currentFilters.yearFrom || currentFilters.yearTo) {
            // For movies, we use primary_release_date
            if (currentFilters.yearFrom) {
                params.primary_release_date_gte = `${currentFilters.yearFrom}-01-01`;
            }
            
            if (currentFilters.yearTo) {
                params.primary_release_date_lte = `${currentFilters.yearTo}-12-31`;
            }
        }
        
        // Fetch movies
        const moviesData = await fetchFromAPI('/discover/movie', params);
        
        if (!moviesData || !moviesData.results) {
            gridContainer.innerHTML = '<div class="error-message">Failed to load movies. Please try again.</div>';
            return;
        }
        
        // Update total pages
        totalPages = moviesData.total_pages;
        
        // Clear grid
        gridContainer.innerHTML = '';
        
        // Display movies
        moviesData.results.forEach(movie => {
            const movieCard = createMovieCard(movie);
            gridContainer.appendChild(movieCard);
        });
        
        // Update pagination
        updatePagination();
    }
    
    // Create movie card element
    function createMovieCard(movie) {
        const movieCard = document.createElement('div');
        movieCard.className = 'grid-item movie-card';
        
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        
        movieCard.innerHTML = `
            <a href="player.html?id=${movie.id}&type=movie">
                <div class="card-poster">
                    ${movie.poster_path ? 
                        `<img src="${IMAGE_BASE_URL}${POSTER_SIZE}${movie.poster_path}" alt="${movie.title}">` : 
                        '<div class="no-poster"><i class="fas fa-film"></i></div>'}
                    <div class="card-rating">
                        <i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${movie.title}</h3>
                    <div class="card-year">${releaseYear}</div>
                </div>
            </a>
        `;
        
        // Add hover effect with overview
        if (movie.overview) {
            const overviewElement = document.createElement('div');
            overviewElement.className = 'card-overview';
            overviewElement.innerHTML = `
                <h4>${movie.title}</h4>
                <p>${movie.overview.length > 150 ? movie.overview.substring(0, 150) + '...' : movie.overview}</p>
                <span class="view-button">Watch Now</span>
            `;
            
            movieCard.querySelector('a').appendChild(overviewElement);
        }
        
        return movieCard;
    }
    
    // Update pagination controls
    function updatePagination() {
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';
        
        // Don't show pagination if there's only one page
        if (totalPages <= 1) {
            return;
        }
        
        // Calculate pagination range
        const maxPages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        let endPage = Math.min(totalPages, startPage + maxPages - 1);
        
        // Adjust startPage if we're near the end
        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }
        
        // Create previous button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-button prev';
            prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevButton.addEventListener('click', () => goToPage(currentPage - 1));
            paginationContainer.appendChild(prevButton);
        }
        
        // Create page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'pagination-button';
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => goToPage(i));
            paginationContainer.appendChild(pageButton);
        }
        
        // Create next button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-button next';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextButton.addEventListener('click', () => goToPage(currentPage + 1));
            paginationContainer.appendChild(nextButton);
        }
    }
    
    // Change page and reload movies
    function goToPage(page) {
        if (page < 1 || page > totalPages) {
            return;
        }
        
        currentPage = page;
        
        // Scroll to top of grid
        const gridSection = document.querySelector('.content-grid');
        window.scrollTo({
            top: gridSection.offsetTop - 100,
            behavior: 'smooth'
        });
        
        loadMovies();
    }
    
    // Set up filter event listeners
    function setupFilterListeners() {
        const applyButton = document.getElementById('apply-filters');
        
        applyButton.addEventListener('click', () => {
            // Reset to page 1 when changing filters
            currentPage = 1;
            
            // Get filter values
            currentFilters.genre = document.getElementById('genre-filter').value;
            currentFilters.sortBy = document.getElementById('sort-filter').value;
            currentFilters.yearFrom = document.getElementById('year-from').value;
            currentFilters.yearTo = document.getElementById('year-to').value;
            
            // Update URL to reflect filters (for sharing/bookmarking)
            updateURL();
            
            // Reload movies with new filters
            loadMovies();
        });
        
        // Optional: Implement real-time filtering when changing dropdown
        document.getElementById('sort-filter').addEventListener('change', () => {
            document.getElementById('apply-filters').click();
        });
    }
    
    // Update URL parameters based on current filters
    function updateURL() {
        const urlParams = new URLSearchParams();
        
        if (currentFilters.genre) {
            urlParams.set('genre', currentFilters.genre);
        }
        
        if (currentFilters.sortBy !== 'popularity.desc') {
            urlParams.set('sort', currentFilters.sortBy);
        }
        
        if (currentFilters.yearFrom) {
            urlParams.set('from', currentFilters.yearFrom);
        }
        
        if (currentFilters.yearTo) {
            urlParams.set('to', currentFilters.yearTo);
        }
        
        if (currentPage > 1) {
            urlParams.set('page', currentPage);
        }
        
        const newURL = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
        window.history.pushState({ path: newURL }, '', newURL);
    }
});
