// API configuration
const API_KEY = '8b38fdbfc051bcd57c89da7fc2e5bdef'; // Replace with your actual TMDB API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
const BACKDROP_SIZE = '/w1280';
const POSTER_SIZE = '/w500';
const PROFILE_SIZE = '/w185';

// Helper function to make API requests
async function fetchFromAPI(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        ...params
    });
    
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching from API:', error);
        return null;
    }
}

// Get trending movies/TV shows
async function getTrending(mediaType = 'all', timeWindow = 'day') {
    return await fetchFromAPI(`/trending/${mediaType}/${timeWindow}`);
}

// Get popular movies
async function getPopularMovies(page = 1) {
    return await fetchFromAPI('/movie/popular', { page });
}

// Get top rated TV shows
async function getTopRatedTVShows(page = 1) {
    return await fetchFromAPI('/tv/top_rated', { page });
}

// Get upcoming movies
async function getUpcomingMovies(page = 1) {
    return await fetchFromAPI('/movie/upcoming', { page });
}

// Get movie details
async function getMovieDetails(movieId) {
    return await fetchFromAPI(`/movie/${movieId}`, { append_to_response: 'videos,credits,recommendations' });
}

// Get TV show details
async function getTVShowDetails(tvId) {
    return await fetchFromAPI(`/tv/${tvId}`, { append_to_response: 'videos,credits,recommendations,seasons' });
}

// Get TV season details
async function getTVSeasonDetails(tvId, seasonNumber) {
    return await fetchFromAPI(`/tv/${tvId}/season/${seasonNumber}`);
}

// Search for movies and TV shows
async function searchMulti(query, page = 1) {
    if (!query) return null;
    return await fetchFromAPI('/search/multi', { query, page });
}

// Get filtered movies
async function getDiscoverMovies(params = {}) {
    return await fetchFromAPI('/discover/movie', params);
}

// Get filtered TV shows
async function getDiscoverTVShows(params = {}) {
    return await fetchFromAPI('/discover/tv', params);
}

// Get movie genres
async function getMovieGenres() {
    return await fetchFromAPI('/genre/movie/list');
}

// Get TV show genres
async function getTVGenres() {
    return await fetchFromAPI('/genre/tv/list');
}

// Get recommendations
async function getRecommendations(type, id, page = 1) {
    return await fetchFromAPI(`/${type}/${id}/recommendations`, { page });
}
