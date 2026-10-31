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

/* ---------------- MAGAZINE PAGE TURNS ---------------- */
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('magazineBook');
    if (!container) return;

    const reader = container.closest('.magazine-reader');
    const previous = document.getElementById('magazinePrev');
    const next = document.getElementById('magazineNext');
    const autoButton = document.getElementById('magazineAuto');
    const status = document.getElementById('magazineStatus');

    // advert_01.jpg ... advert_36.jpg (change 36 if the page count changes)
    const pageCount = 36;
    const pageImages = Array.from({ length: pageCount }, (_, i) =>
        `magazine/Pages/advert_${String(i + 1).padStart(2, '0')}.jpg`
    );

    // TIMING SETTINGS (milliseconds)
    const openingDelay = 300;     // wait before the cover opens
    const readingDelay = 3000;    // pause on each spread
    const turningDuration = 500;  // length of the page-turn animation

    previous.disabled = true;
    next.disabled = true;
    autoButton.disabled = true;
    status.textContent = 'Loading magazine…';

    let loadedImages;

    try {
        if (!window.St?.PageFlip) {
            throw new Error('The page-flip library could not load.');
        }

        loadedImages = await Promise.all(
            pageImages.map(src => new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = () => reject(new Error(`Could not load ${src}`));
                image.src = src;
            }))
        );
    } catch (error) {
        status.textContent = error.message;
        return;
    }

    const pageWidth = 550;
    const pageHeight = Math.round(
        pageWidth * loadedImages[0].naturalHeight / loadedImages[0].naturalWidth
    );

    const book = new St.PageFlip(container, {
        width: pageWidth,
        height: pageHeight,
        size: 'stretch',
        minWidth: 280,
        maxWidth: pageWidth,
        minHeight: Math.round(280 * pageHeight / pageWidth),
        maxHeight: pageHeight,
        showCover: true,
        usePortrait: true,
        autoSize: true,
        drawShadow: true,
        maxShadowOpacity: 0.35,
        flippingTime: turningDuration,
        mobileScrollSupport: false
    });

    let timer = null;
    let visible = false;
    let ready = false;
    let turning = false;
    let opened = false;
    let autoplay = true;

    function stopTimer() {
        clearTimeout(timer);
        timer = null;
    }

    function atEnd() {
        return book.getCurrentPageIndex() >= book.getPageCount() - 1;
    }

    function updateControls() {
        previous.disabled = book.getCurrentPageIndex() === 0;
        next.disabled = atEnd();
    }

    // Runs a page turn, then unlocks once the animation should be done.
    function turn(direction) {
        if (!ready || turning) return;

        stopTimer();
        turning = true;
        opened = true;

        if (direction === 'next') book.flipNext('bottom');
        else book.flipPrev('bottom');

        setTimeout(() => {
            turning = false;
            updateControls();
            scheduleTurn();
        }, turningDuration + 150);
    }

    // Fade out, jump back to the cover, fade back in.
    function restart() {
        stopTimer();
        turning = true;
        container.style.opacity = '0';

        setTimeout(() => {
            book.turnToPage(0);
            container.style.opacity = '1';
            updateControls();

            setTimeout(() => {
                turning = false;
                scheduleTurn();   // cover shows for readingDelay, then opens again
            }, 400);
        }, 400);
    }

    function scheduleTurn() {
        stopTimer();

        if (!ready || !visible || !autoplay || turning || document.hidden) return;

        timer = setTimeout(() => {
            if (atEnd()) restart();
            else turn('next');
        }, opened ? readingDelay : openingDelay);
    }

    book.on('init', () => {
        console.log('Magazine ready');
        ready = true;
        status.textContent = '';
        autoButton.disabled = false;
        updateControls();
        scheduleTurn();
    });

    book.on('flip', updateControls);

    previous.addEventListener('click', () => turn('prev'));
    next.addEventListener('click', () => turn('next'));

    autoButton.addEventListener('click', () => {
        autoplay = !autoplay;
        autoButton.textContent = autoplay ? 'Pause autoplay' : 'Resume autoplay';
        scheduleTurn();
    });

    // Only autoplay while the magazine is on screen.
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        console.log('Magazine visible:', visible);
        scheduleTurn();
    }, { threshold: 0.1 });

    observer.observe(reader);
    document.addEventListener('visibilitychange', scheduleTurn);

    const htmlPages = loadedImages.map((image, index) => {
        const page = document.createElement('div');
        page.className = 'magazine-page';
        image.alt = `Magazine page ${index + 1}`;
        image.draggable = false;
        page.appendChild(image);
        container.appendChild(page);
        return page;
    });

    book.loadFromHTML(htmlPages);
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