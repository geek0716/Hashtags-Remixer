// Initialize carousels
let heroCarousel;
let trendingCarousel;
let popularMoviesCarousel;
let topTVShowsCarousel;
let upcomingCarousel;
let recommendationsCarousel;

// DOM elements
const trendingToggle = document.getElementById('trending-toggle');
const timeSwitch = document.querySelector('.time-switch');
let trendingTimeWindow = 'day';

// Initialize home page
async function initHomePage() {
    // Set up hero carousel with trending content
    heroCarousel = new Carousel('hero-carousel', {
        type: 'hero',
        autoplay: true,
        autoplaySpeed: 7000,
        indicatorsId: 'hero-indicators'
    });
    
    // Load hero content (trending all)
    const trendingData = await getTrending('all', 'day');
    if (trendingData && trendingData.results) {
        // Get first 5 items for hero carousel
        heroCarousel.loadItems(trendingData.results.slice(0, 5));
    }
    
    // Set up other carousels
    trendingCarousel = new Carousel('trending-carousel');
    popularMoviesCarousel = new Carousel('popular-movies-carousel');
    topTVShowsCarousel = new Carousel('top-tvshows-carousel');
    upcomingCarousel = new Carousel('upcoming-carousel');
    recommendationsCarousel = new Carousel('recommendations-carousel');
    
    // Load trending content
    loadTrendingContent(trendingTimeWindow);
    
    // Load popular movies
    const popularMoviesData = await getPopularMovies();
    if (popularMoviesData && popularMoviesData.results) {
        popularMoviesCarousel.loadItems(popularMoviesData.results);
    }
    
    // Load top TV shows
    const topTVData = await getTopRatedTVShows();
    if (topTVData && topTVData.results) {
        topTVShowsCarousel.loadItems(topTVData.results);
    }
    
    // Load upcoming movies
    const upcomingData = await getUpcomingMovies();
    if (upcomingData && upcomingData.results) {
        upcomingCarousel.loadItems(upcomingData.results);
    }
    
    // Load personalized recommendations
    // For demo, we'll use popular movies as recommendations
    // In a real app, you would use user data and the recommendations API
    const recommendationsData = await getPopularMovies(2);
    if (recommendationsData && recommendationsData.results) {
        recommendationsCarousel.loadItems(recommendationsData.results);
    }
}

// Load trending content based on time window
async function loadTrendingContent(timeWindow) {
    const trendingData = await getTrending('all', timeWindow);
    if (trendingData && trendingData.results) {
        trendingCarousel.loadItems(trendingData.results);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Trending toggle
    if (trendingToggle) {
        trendingToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const trendingSection = document.getElementById('trending-section');
            if (trendingSection) {
                trendingSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Time switch buttons
    if (timeSwitch) {
        const timeSwitchButtons = timeSwitch.querySelectorAll('button');
        timeSwitchButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                timeSwitchButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update time window and reload trending content
                trendingTimeWindow = button.dataset.time;
                loadTrendingContent(trendingTimeWindow);
            });
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
    setupEventListeners();
});
