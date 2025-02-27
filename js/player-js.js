// Player Page Script
document.addEventListener('DOMContentLoaded', () => {
    // Get content ID and type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const contentType = urlParams.get('type'); // 'movie' or 'tv'
    let currentSeason = urlParams.get('season') || 1;
    let currentEpisode = urlParams.get('episode') || 1;
    
    // Back button functionality
    document.getElementById('back-btn').addEventListener('click', () => {
        window.history.back();
    });
    
    // Initialize the player
    if (contentId && contentType) {
        initializePlayer(contentId, contentType);
    } else {
        showError('Invalid content. Please go back and try again.');
    }
    
    // Initialize the player based on content type
    async function initializePlayer(id, type) {
        try {
            if (type === 'movie') {
                await loadMovie(id);
            } else if (type === 'tv') {
                await loadTVShow(id, currentSeason, currentEpisode);
            }
        } catch (error) {
            console.error('Error initializing player:', error);
            showError('Failed to load content. Please try again.');
        }
    }
    
    // Load movie details and set up player
    async function loadMovie(movieId) {
        const movieData = await fetchFromAPI(`/movie/${movieId}`, {
            append_to_response: 'credits,recommendations'
        });
        
        if (!movieData) {
            showError('Movie data not found');
            return;
        }
        
        // Set the video player source
        const videoSrc = `https://vidlink.pro/movie/${movieId}`;
        setVideoSource(videoSrc);
        
        // Update content info
        updateContentInfo(movieData);
        
        // Hide seasons/episodes section for movies
        document.getElementById('seasons-episodes').style.display = 'none';
        
        // Load cast
        loadCast(movieData.credits.cast);
        
        // Load recommendations
        loadRecommendations(movieData.recommendations.results, 'movie');
        
        // Update page title
        document.title = `StreamFlix - ${movieData.title}`;
    }
    
    // Load TV show details, seasons, and episodes
    async function loadTVShow(showId, season, episode) {
        const showData = await fetchFromAPI(`/tv/${showId}`, {
            append_to_response: 'credits,recommendations'
        });
        
        if (!showData) {
            showError('TV show data not found');
            return;
        }
        
        // Update content info
        updateContentInfo(showData);
        
        // Load seasons dropdown
        loadSeasons(showData.seasons, showId, season);
        
        // Load episodes
        await loadEpisodes(showId, season, episode);
        
        // Load cast
        loadCast(showData.credits.cast);
        
        // Load recommendations
        loadRecommendations(showData.recommendations.results, 'tv');
        
        // Update page title
        document.title = `StreamFlix - ${showData.name}`;
    }
    
    // Update content information (title, overview, etc.)
    function updateContentInfo(data) {
        const contentInfoEl = document.getElementById('content-info');
        const isMovie = 'title' in data;
        
        const title = isMovie ? data.title : data.name;
        const releaseDate = isMovie 
            ? formatDate(data.release_date) 
            : `First Air Date: ${formatDate(data.first_air_date)}`;
        
        const genres = data.genres.map(genre => genre.name).join(', ');
        const voteAverage = data.vote_average.toFixed(1);
        const voteCount = data.vote_count.toLocaleString();
        
        contentInfoEl.innerHTML = `
            <div class="content-backdrop" style="background-image: url('${IMAGE_BASE_URL}${BACKDROP_SIZE}${data.backdrop_path}')">
                <div class="backdrop-overlay"></div>
            </div>
            <div class="content-poster">
                <img src="${IMAGE_BASE_URL}${POSTER_SIZE}${data.poster_path}" alt="${title} Poster">
            </div>
            <div class="content-text">
                <h1>${title}</h1>
                <div class="content-meta">
                    <span class="release-date">${releaseDate}</span>
                    <span class="genres">${genres}</span>
                    <span class="rating">
                        <i class="fas fa-star"></i> ${voteAverage}/10 (${voteCount} votes)
                    </span>
                </div>
                <div class="content-overview">
                    <h3>Overview</h3>
                    <p>${data.overview}</p>
                </div>
            </div>
        `;
    }
    
    // Load seasons into dropdown
    function loadSeasons(seasons, showId, currentSeason) {
        const seasonsSelect = document.getElementById('seasons-select');
        seasonsSelect.innerHTML = '';
        
        // Add seasons to dropdown
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = season.name;
            
            if (season.season_number == currentSeason) {
                option.selected = true;
            }
            
            seasonsSelect.appendChild(option);
        });
        
        // Handle season change
        seasonsSelect.addEventListener('change', async () => {
            const selectedSeason = seasonsSelect.value;
            await loadEpisodes(showId, selectedSeason, 1);
        });
    }
    
    // Load episodes for a season
    async function loadEpisodes(showId, seasonNumber, selectedEpisode) {
        const episodeData = await fetchFromAPI(`/tv/${showId}/season/${seasonNumber}`);
        
        if (!episodeData || !episodeData.episodes || episodeData.episodes.length === 0) {
            showError('No episodes found for this season');
            return;
        }
        
        // Populate episodes dropdown
        const episodesSelect = document.getElementById('episodes-select');
        episodesSelect.innerHTML = '';
        
        episodeData.episodes.forEach(episode => {
            const option = document.createElement('option');
            option.value = episode.episode_number;
            option.textContent = `E${episode.episode_number}: ${episode.name}`;
            
            if (episode.episode_number == selectedEpisode) {
                option.selected = true;
            }
            
            episodesSelect.appendChild(option);
        });
        
        // Show episodes list
        const episodesList = document.getElementById('episodes-list');
        episodesList.innerHTML = '';
        
        episodeData.episodes.forEach(episode => {
            const episodeItem = document.createElement('div');
            episodeItem.className = 'episode-item';
            if (episode.episode_number == selectedEpisode) {
                episodeItem.classList.add('active');
            }
            
            // Format air date
            const airDate = episode.air_date ? formatDate(episode.air_date) : 'TBA';
            
            episodeItem.innerHTML = `
                <div class="episode-number">E${episode.episode_number}</div>
                <div class="episode-details">
                    <h4 class="episode-title">${episode.name}</h4>
                    <div class="episode-meta">
                        <span class="episode-date">${airDate}</span>
                        <span class="episode-rating"><i class="fas fa-star"></i> ${episode.vote_average.toFixed(1)}</span>
                    </div>
                    <p class="episode-overview">${episode.overview || 'No description available.'}</p>
                </div>
                <div class="episode-img">
                    ${episode.still_path ? 
                        `<img src="${IMAGE_BASE_URL}w300${episode.still_path}" alt="Episode ${episode.episode_number}">` : 
                        '<div class="no-image">No Image</div>'}
                </div>
            `;
            
            // Make episode item clickable
            episodeItem.addEventListener('click', () => {
                loadEpisodePlayer(showId, seasonNumber, episode.episode_number);
                
                // Update UI
                const activeItems = episodesList.querySelectorAll('.episode-item.active');
                activeItems.forEach(item => item.classList.remove('active'));
                episodeItem.classList.add('active');
                
                // Update dropdown
                episodesSelect.value = episode.episode_number;
            });
            
            episodesList.appendChild(episodeItem);
        });
        
        // Handle episode dropdown change
        episodesSelect.addEventListener('change', () => {
            const selectedEpisodeNumber = episodesSelect.value;
            loadEpisodePlayer(showId, seasonNumber, selectedEpisodeNumber);
            
            // Update active state in episodes list
            const activeItems = episodesList.querySelectorAll('.episode-item.active');
            activeItems.forEach(item => item.classList.remove('active'));
            
            const newActiveItem = episodesList.children[selectedEpisodeNumber - 1];
            if (newActiveItem) {
                newActiveItem.classList.add('active');
                newActiveItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        
        // Set initial episode
        loadEpisodePlayer(showId, seasonNumber, selectedEpisode);
    }
    
    // Load specific episode in player
    function loadEpisodePlayer(showId, seasonNumber, episodeNumber) {
        const videoSrc = `https://vidlink.pro/tv/${showId}/${seasonNumber}/${episodeNumber}`;
        setVideoSource(videoSrc);
        
        // Update URL without refreshing page
        const newUrl = `player.html?id=${showId}&type=tv&season=${seasonNumber}&episode=${episodeNumber}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        
        // Update current values
        currentSeason = seasonNumber;
        currentEpisode = episodeNumber;
    }
    
    // Load cast carousel
    function loadCast(cast) {
        const castCarousel = document.getElementById('cast-carousel');
        castCarousel.innerHTML = '';
        
        // Limit to top 20 cast members
        const topCast = cast.slice(0, 20);
        
        topCast.forEach(person => {
            const castItem = document.createElement('div');
            castItem.className = 'cast-item';
            
            castItem.innerHTML = `
                <div class="cast-profile ${!person.profile_path ? 'no-image' : ''}">
                    ${person.profile_path ? 
                        `<img src="${IMAGE_BASE_URL}${PROFILE_SIZE}${person.profile_path}" alt="${person.name}">` : 
                        '<i class="fas fa-user"></i>'}
                </div>
                <div class="cast-info">
                    <h4>${person.name}</h4>
                    <p>${person.character}</p>
                </div>
            `;
            
            castCarousel.appendChild(castItem);
        });
    }
    
    // Load recommendations
    function loadRecommendations(recommendations, type) {
        const recommCarousel = document.getElementById('recommendations-carousel');
        recommCarousel.innerHTML = '';
        
        const slicedRecommendations = recommendations.slice(0, 12);
        
        slicedRecommendations.forEach(item => {
            const title = type === 'movie' ? item.title : item.name;
            const recommItem = document.createElement('div');
            recommItem.className = 'recommendation-item';
            
            recommItem.innerHTML = `
                <a href="player.html?id=${item.id}&type=${type}">
                    <div class="recommendation-poster">
                        ${item.poster_path ? 
                            `<img src="${IMAGE_BASE_URL}w185${item.poster_path}" alt="${title}">` : 
                            '<div class="no-poster"><i class="fas fa-film"></i></div>'}
                        <div class="recommendation-rating">
                            <i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}
                        </div>
                    </div>
                    <h4>${title}</h4>
                </a>
            `;
            
            recommCarousel.appendChild(recommItem);
        });
    }
    
    // Set iframe source
    function setVideoSource(src) {
        const videoPlayer = document.getElementById('video-player');
        videoPlayer.src = src;
    }
    
    // Display error message
    function showError(message) {
        const container = document.getElementById('content-info');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.history.back()">Go Back</button>
            </div>
        `;
    }
    
    // Format date to readable format
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
});
