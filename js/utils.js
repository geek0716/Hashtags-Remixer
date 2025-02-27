// Format date to MMM DD, YYYY format
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get year from date string
function getYear(dateString) {
    if (!dateString) return '';
    return new Date(dateString).getFullYear();
}

// Format runtime to hours and minutes
function formatRuntime(minutes) {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Format vote average to one decimal place
function formatRating(rating) {
    if (!rating) return 'N/A';
    return rating.toFixed(1);
}

// Create poster path URL
function getPosterUrl(posterPath, size = POSTER_SIZE) {
    if (!posterPath) return 'images/no-poster.jpg';
    return `${IMG_BASE_URL}${size}${posterPath}`;
}

// Create backdrop path URL
function getBackdropUrl(backdropPath, size = BACKDROP_SIZE) {
    if (!backdropPath) return 'images/no-backdrop.jpg';
    return `${IMG_BASE_URL}${size}${backdropPath}`;
}

// Create profile path URL
function getProfileUrl(profilePath, size = PROFILE_SIZE) {
    if (!profilePath) return 'images/no-profile.jpg';
    return `${IMG_BASE_URL}${size}${profilePath}`;
}

// Create video URL (YouTube or Vimeo)
function getVideoUrl(video) {
    if (!video) return '';
    
    const site = video.site.toLowerCase();
    if (site === 'youtube') {
        return `https://www.youtube.com/embed/${video.key}`;
    } else if (site === 'vimeo') {
        return `https://player.vimeo.com/video/${video.key}`;
    }
    
    return '';
}

// Get player URL based on content type (movie or TV show)
function getPlayerUrl(id, type, season = 1, episode = 1) {
    if (type === 'movie') {
        return `https://vidlink.pro/movie/${id}`;
    } else if (type === 'tv') {
        return `https://vidlink.pro/tv/${id}/${season}/${episode}`;
    }
    return '';
}

// Create a movie/TV show card element
function createContentCard(item) {
    const card = document.createElement('div');
    card.className = 'content-card';
    
    // Determine if it's a movie or TV show
    const isMovie = item.media_type === 'movie' || item.hasOwnProperty('title');
    const title = isMovie ? item.title : item.name;
    const releaseDate = isMovie ? item.release_date : item.first_air_date;
    const year = getYear(releaseDate);
    const type = isMovie ? 'movie' : 'tv';
    const id = item.id;
    
    // Create rating badge
    const ratingClass = item.vote_average >= 7 ? 'high' : item.vote_average >= 5 ? 'medium' : 'low';
    
    card.innerHTML = `
        <a href="player.html?id=${id}&type=${type}">
            <div class="card-poster">
                <img src="${getPosterUrl(item.poster_path)}" alt="${title} Poster">
                <div class="rating-badge ${ratingClass}">${formatRating(item.vote_average)}</div>
            </div>
            <div class="card-info">
                <h3>${title}</h3>
                <p>${year ? year : ''}</p>
            </div>
        </a>
    `;
    
    return card;
}

// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

// Generate pagination
function generatePagination(currentPage, totalPages, elementId) {
    const paginationElement = document.getElementById(elementId);
    paginationElement.innerHTML = '';
    
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.dataset.page = currentPage - 1;
        paginationElement.appendChild(prevBtn);
    }
    
    // First page
    if (startPage > 1) {
        const firstPageBtn = document.createElement('button');
        firstPageBtn.className = 'pagination-btn';
        firstPageBtn.textContent = '1';
        firstPageBtn.dataset.page = 1;
        paginationElement.appendChild(firstPageBtn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.dataset.page = i;
        paginationElement.appendChild(pageBtn);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationElement.appendChild(ellipsis);
        }
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'pagination-btn';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.dataset.page = totalPages;
        paginationElement.appendChild(lastPageBtn);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.dataset.page = currentPage + 1;
        paginationElement.appendChild(nextBtn);
    }
    
    return paginationElement;
}

// Load genres into select element
async function loadGenres(type, selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    
    const genresData = type === 'movie' ? await getMovieGenres() : await getTVGenres();
    
    if (genresData && genresData.genres) {
        genresData.genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            selectElement.appendChild(option);
        });
    }
}

// Load genres as tags
async function loadGenreTags(elementId) {
    const genresElement = document.getElementById(elementId);
    if (!genresElement) return;
    
    const movieGenres = await getMovieGenres();
    const tvGenres = await getTVGenres();
    
    // Combine and deduplicate genres
    const allGenres = {};
    
    if (movieGenres && movieGenres.genres) {
        movieGenres.genres.forEach(genre => {
            allGenres[genre.id] = genre.name;
        });
    }
    
    if (tvGenres && tvGenres.genres) {
        tvGenres.genres.forEach(genre => {
            allGenres[genre.id] = genre.name;
        });
    }
    
    // Create genre tags
    for (const [id, name] of Object.entries(allGenres)) {
        const tag = document.createElement('div');
        tag.className = 'genre-tag';
        tag.dataset.genreId = id;
        tag.textContent = name;
        genresElement.appendChild(tag);
    }
}
