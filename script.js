/* ---------------- SHARED GLOBALS ---------------- */
// 1. Clear the hash (#) from the URL so the browser doesn't jump to it
if (window.location.hash) {
    history.replaceState("", document.title, window.location.pathname + window.location.search);
}

// 2. Force scroll restoration to manual
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// 3. Execute the scroll to top immediately and on load
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));
let hideTimeout = null;
let isNavHovered = false;
let lastScrollY = window.scrollY;
let lastTime = Date.now();
// Force the browser to start at the top on reload


window.scrollTo(0, 0);
document.addEventListener('DOMContentLoaded', () => {
    const navWrapper = document.querySelector('.nav-wrapper');
    const grid = document.querySelector('.poster-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.poster-item');
    const lightbox = document.getElementById('lightbox');

    if (!navWrapper) return;

    /* ---------------- HEADER HEIGHT ---------------- */
    function setNavHeight() {
        document.documentElement.style.setProperty(
            '--header-height',
            `${navWrapper.getBoundingClientRect().height}px`
        );
    }
    window.addEventListener('load', setNavHeight);
    window.addEventListener('resize', setNavHeight);
    setTimeout(setNavHeight, 250);

   /* ---------------- INITIAL PAGE SETUP ---------------- */
    const isPhotoPage = document.body.classList.contains('page-gallery');
    const isDesignPage = document.body.classList.contains('page-design');

 
if (grid) {
    // Only force grid-mode and auto-click filters if the Filter Bar exists
    const hasFilters = document.querySelector('.filter-bar') !== null;

    if ((isPhotoPage || isDesignPage) && hasFilters) {
        grid.classList.add('grid-mode');
        const defaultFilter = isPhotoPage ? 'specific' : 'branding'; 
        const startBtn = document.querySelector(`.filter-btn[data-filter="${defaultFilter}"]`);
        
        if (startBtn) {
            setTimeout(() => startBtn.click(), 50); 
        }
    } else {
        // If there is no filter bar (like on a specific project page),
        // remove grid-mode to allow the CSS masonry to take over.
        grid.classList.remove('grid-mode');
    }
}

    /* ---------------- FILTERING LOGIC ---------------- */
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            // TOGGLE GRID VS MASONRY
            // If it's Branding or Specific, use the 4:5 Grid. 
            // If it's 'All' or 'Graphic', use Masonry.
            if (filterValue === 'branding' || filterValue === 'specific') {
                grid.classList.add('grid-mode');
            } else {
                grid.classList.remove('grid-mode');
            }

            items.forEach(item => {
                let shouldShow = false;

                if (filterValue === 'all') {
                    // Show raw photos/posters, hide project-cards
                    shouldShow = !item.classList.contains('project-card');
                } else {
                    shouldShow = item.classList.contains(filterValue);
                }

                if (shouldShow) {
                    // Instead of '', use 'inline-block' so Masonry can actually wrap them
                    item.style.display = 'inline-block'; 
                    requestAnimationFrame(() => {
                        item.style.opacity = '1';
                    });
                } else {
                    item.style.opacity = '0';
                    item.style.display = 'none';
                }
            });
        });
    });

    /* ---------------- LIGHTBOX CLICK LOGIC (ADDED) ---------------- */
    if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            // 1. THE CRITICAL CHECK: If it's a project card, stop everything.
            if (item.classList.contains('project-card')) {
                return; // Do nothing. Let the <a> link take the user to the new page.
            }

            // 2. Otherwise, proceed with lightbox logic
            const mainImg = item.querySelector('img');
            const gallery = item.querySelector('.project-gallery');
            
            const oldCol = lightbox.querySelector('.lightbox-column');
            if (oldCol) oldCol.remove();

            if (gallery) {
                lightboxImg.style.display = 'none';
                const columnContainer = document.createElement('div');
                columnContainer.className = 'lightbox-column';
                gallery.querySelectorAll('img').forEach(img => {
                    const newImg = document.createElement('img');
                    newImg.src = img.src;
                    columnContainer.appendChild(newImg);
                });
                lightbox.querySelector('.lightbox-content').insertBefore(columnContainer, lightboxCaption);
            } else {
                lightboxImg.style.display = 'block';
                lightboxImg.src = mainImg.src;
            }
            
            lightboxCaption.textContent = mainImg.dataset.caption || '';
            document.body.classList.add('lightbox-open');
            lightbox.classList.add('active');
        });
    });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('.lightbox-content')) {
                closeLightbox();
            }
        });
    }

    /* ---------------- NAV INTERACTION ---------------- */
    navWrapper.addEventListener('mouseenter', () => { isNavHovered = true; showNav(); });
    navWrapper.addEventListener('mouseleave', () => { 
        isNavHovered = false; 
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (window.scrollY > 50) hideNav();
        }, 800); 
    });

    /* ---------------- SMART SCROLL LOGIC ---------------- */
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        if (currentScrollY <= 50) {
            showNav();
            lastScrollY = currentScrollY;
            return;
        }
        const deltaY = currentScrollY - lastScrollY;
        const deltaTime = currentTime - lastTime;
        const velocity = Math.abs(deltaY / deltaTime);

        if (deltaY > 0 && currentScrollY > 100 && !isNavHovered) {
            hideNav();
        }
        if (deltaY < 0 && velocity > 2.0) {
            showNav();
        }
        lastScrollY = currentScrollY;
        lastTime = currentTime;
    });
});

/* ---------------- HELPER FUNCTIONS ---------------- */
function showNav() {
    const nav = document.querySelector('.nav-wrapper');
    if(nav) nav.classList.remove('nav-hidden');
}

function hideNav() {
    const nav = document.querySelector('.nav-wrapper');
    if(nav && !isNavHovered) nav.classList.add('nav-hidden');
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card[data-images]');

    projectCards.forEach((card, index) => {
        const imagesStr = card.getAttribute('data-images');
        if (!imagesStr) return;

        const images = imagesStr.split(',').map(img => img.trim());
        if (images.length <= 1) return;

        const track = card.querySelector('.cycle-track');
        track.innerHTML = ''; // Clear previous images/clones

        // Build the stack
        const imageElements = images.map((src, i) => {
            const img = document.createElement('img');
            img.src = src;
            // Set first image as visible, others as hidden
            img.style.opacity = (i === 0) ? '1' : '0';
            track.appendChild(img);
            return img;
        });

        let currentIndex = 0;
        const intervalTime = 3000 + (index * 300);

        setInterval(() => {
            // Smoothly swap opacities
            imageElements[currentIndex].style.opacity = '0';
            currentIndex = (currentIndex + 1) % imageElements.length;
            imageElements[currentIndex].style.opacity = '1';
        }, intervalTime);
    });
});

const menuToggle = document.getElementById('mobile-menu');
const navOverlay = document.getElementById('nav-overlay');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    const isOpen = navOverlay.classList.toggle('open');
    
    // Disable scrolling when open, re-enable when closed
    if (isOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

// Important: Re-enable scrolling if a link is clicked
const navLinks = document.querySelectorAll('.overlay-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navOverlay.classList.remove('open');
        document.body.style.overflow = 'auto'; 
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const flipbook = document.getElementById('myFlipbook');
    if (!flipbook) return;

    const pages = flipbook.querySelectorAll('.flip-page');
    const nextBtn = flipbook.querySelector('.next');
    const prevBtn = flipbook.querySelector('.prev');
    let currentIndex = 0;

    function updatePage(newIndex) {
        pages[currentIndex].classList.remove('active');
        
        // Loop index
        currentIndex = (newIndex + pages.length) % pages.length;
        
        pages[currentIndex].classList.add('active');

       // --- THE UPDATED EXPANSION LOGIC ---
        const isFirstPage = (currentIndex === 0);
        const isLastPage = (currentIndex === pages.length - 1);

        if (isFirstPage || isLastPage) {
            // Shrink to single-page width (550px)
            flipbook.classList.remove('is-spread');
        } else {
            // Expand to double-page width (1100px)
            flipbook.classList.add('is-spread');
        }
    }

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updatePage(currentIndex + 1);
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updatePage(currentIndex - 1);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('videoWrapper');
    const video = document.getElementById('featureVideo');

    if (!wrapper || !video) return;

    wrapper.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            wrapper.classList.add('is-playing');
            // Optional: Show controls once it starts playing
            video.controls = true; 
        } else {
            video.pause();
            wrapper.classList.remove('is-playing');
            video.controls = false;
        }
    });

    // Handle the case where the video ends
    video.addEventListener('ended', () => {
        wrapper.classList.remove('is-playing');
        video.controls = false;
        video.load(); // Reset to poster image
    });
});