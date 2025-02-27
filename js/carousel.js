// Class to handle carousel functionality
class Carousel {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.items = [];
        this.currentIndex = 0;
        this.options = {
            slidesToShow: options.slidesToShow || 6,
            autoplay: options.autoplay || false,
            autoplaySpeed: options.autoplaySpeed || 5000,
            type: options.type || 'slider', // 'slider' or 'hero'
            ...options
        };
        
        // Responsive breakpoints
        this.breakpoints = {
            480: 2,  // Show 2 slides at 480px or less
            768: 3,  // Show 3 slides at 768px or less
            1024: 4, // Show 4 slides at 1024px or less
            1200: 5  // Show 5 slides at 1200px or less
        };
        
        this.slidesToShow = this.getSlidesToShow();
        
        // Setup event listeners for controls
        this.setupControls();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.slidesToShow = this.getSlidesToShow();
            this.updateCarousel();
        });
        
        // Setup autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }
    
    // Get number of slides to show based on screen width
    getSlidesToShow() {
        const windowWidth = window.innerWidth;
        
        for (const [breakpoint, slides] of Object.entries(this.breakpoints).sort((a, b) => a[0] - b[0])) {
            if (windowWidth <= parseInt(breakpoint)) {
                return slides;
            }
        }
        
        return this.options.slidesToShow;
    }
    
    // Load items into carousel
    loadItems(items) {
        this.items = items;
        this.currentIndex = 0;
        this.renderItems();
        
        // Generate indicators for hero carousel
        if (this.options.type === 'hero' && this.options.indicatorsId) {
            this.generateIndicators();
        }
    }
    
    // Render carousel items
    renderItems() {
        if (!this.container || !this.items.length) return;
        
        this.container.innerHTML = '';
        
        if (this.options.type === 'hero') {
            // For hero carousel, show one item at a time
            const item = this.items[this.currentIndex];
            const isMovie = item.media_type === 'movie' || item.hasOwnProperty('title');
            const title = isMovie ? item.title : item.name;
            const overview = item.overview;
            const backdropPath = item.backdrop_path;
            const id = item.id;
            const type = isMovie ? 'movie' : 'tv';
            
            const heroItem = document.createElement('div');
            heroItem.className = 'hero-item';
            heroItem.innerHTML = `
                <div class="hero-backdrop" style="background-image: url('${getBackdropUrl(backdropPath)}')">
                    <div class="overlay"></div>
                </div>
                <div class="hero-content">
                    <h1>${title}</h1>
                    <p>${overview}</p>
                    <div class="hero-buttons">
                        <a href="player.html?id=${id}&type=${type}" class="btn btn-primary">
                            <i class="fas fa-play"></i> Watch Now
                        </a>
                        <button class="btn btn-secondary">
                            <i class="fas fa-info-circle"></i> More Info
                        </button>
                    </div>
                </div>
            `;
            
            this.container.appendChild(heroItem);
        } else {
            // For regular slider, show multiple items
            const startIndex = this.currentIndex;
            const endIndex = Math.min(startIndex + this.slidesToShow, this.items.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const item = this.items[i];
                const card = createContentCard(item);
                this.container.appendChild(card);
            }
        }
    }
    
    // Setup carousel controls
    setupControls() {
        const parentElement = this.container.closest('section');
        if (!parentElement) return;
        
        // For hero carousel
        if (this.options.type === 'hero') {
            const prevBtn = parentElement.querySelector('.carousel-prev');
            const nextBtn = parentElement.querySelector('.carousel-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                });
            }
        } 
        // For regular slider
        else {
            const prevBtn = parentElement.querySelector('.slider-prev');
            const nextBtn = parentElement.querySelector('.slider-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    this.prevSlide();
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    this.nextSlide();
                });
            }
        }
    }
    
    // Generate indicators for hero carousel
    generateIndicators() {
        const indicatorsContainer = document.getElementById(this.options.indicatorsId);
        if (!indicatorsContainer) return;
        
        indicatorsContainer.innerHTML = '';
        
        for (let i = 0; i < this.items.length; i++) {
            const indicator = document.createElement('button');
            indicator.className = `carousel-indicator ${i === this.currentIndex ? 'active' : ''}`;
            
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });
            
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // Update indicators
    updateIndicators() {
        if (this.options.type !== 'hero' || !this.options.indicatorsId) return;
        
        const indicators = document.querySelectorAll(`#${this.options.indicatorsId} .carousel-indicator`);
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    // Go to previous slide
    prevSlide() {
        if (this.options.type === 'hero') {
            this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        } else {
            this.currentIndex = Math.max(0, this.currentIndex - this.slidesToShow);
        }
        
        this.updateCarousel();
    }
    
    // Go to next slide
    nextSlide() {
        if (this.options.type === 'hero') {
            this.currentIndex = (this.currentIndex + 1) % this.items.length;
        } else {
            const maxStartIndex = Math.max(0, this.items.length - this.slidesToShow);
            this.currentIndex = Math.min(maxStartIndex, this.currentIndex + this.slidesToShow);
        }
        
        this.updateCarousel();
    }
    
    // Go to specific slide
    goToSlide(index) {
        if (index < 0 || index >= this.items.length) return;
        
        this.currentIndex = index;
        this.updateCarousel();
    }
    
    // Update carousel display
    updateCarousel() {
        this.renderItems();
        this.updateIndicators();
        
        // Reset autoplay if enabled
        if (this.options.autoplay) {
            this.startAutoplay();
        }
    }
    
    // Start autoplay
    startAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
        
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, this.options.autoplaySpeed);
    }
    
    // Stop autoplay
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
}
