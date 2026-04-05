// Updated script.js with form validation, email/phone validation, XSS prevention in carousel, and error handling for external dependencies

// Function to validate email
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate phone numbers
function validatePhone(phone) {
    const re = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    return re.test(String(phone));
}

// Function to prevent XSS in carousel
function sanitizeInput(input) {
    const element = document.createElement('div');
    element.innerText = input;
    return element.innerHTML;
}

// Error handling function for external dependencies
function handleExternalError(error) {
    console.error('External dependency error: ', error);
    alert('An error occurred while loading external resources. Please try again later.');
}

// Initialize page interactions safely once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    // Example usage of validation functions (only when fields exist)
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            if (!validateEmail(emailInput.value)) {
                alert('Invalid email format!');
            }
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function () {
            if (!validatePhone(phoneInput.value)) {
                alert('Invalid phone number!');
            }
        });
    }

    // Preload project images early so portfolio carousels render faster on first open
    const preloadFromCarouselData = function () {
        const wrappers = document.querySelectorAll('.project-carousel-wrapper[data-images]');

        wrappers.forEach(function (wrapper) {
            let images = [];

            try {
                images = JSON.parse(wrapper.dataset.images || '[]');
            } catch (error) {
                console.warn('Invalid carousel data-images JSON', error);
            }

            images.forEach(function (src) {
                if (!src) return;

                const img = new Image();
                img.decoding = 'async';
                img.loading = 'eager';
                img.src = src;
            });
        });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadFromCarouselData, { timeout: 1000 });
    } else {
        setTimeout(preloadFromCarouselData, 0);
    }

    // Mobile menu toggle (works for both home and portfolio nav variants)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLists = Array.from(document.querySelectorAll('.nav-links'));
    const homeNav = document.getElementById('home-nav-links');
    const homeView = document.getElementById('home-view');
    const portfolioView = document.getElementById('portfolio-view');
    const logoHomeLink = document.getElementById('logo-home-link');
    const backHomeLink = document.getElementById('back-home-link');
    const portfolioContactLink = document.getElementById('portfolio-contact-link');
    const defaultTitle = 'Leba | Diseño de Sistemas Digitales';
    const portfolioTitle = 'Leba | Portfolio';
    const navHashTargets = new Set(['#soluciones', '#proceso', '#contacto', '#contacto-form']);

    function getVisibleNav() {
        if (homeView && window.getComputedStyle(homeView).display !== 'none' && homeNav) {
            return homeNav;
        }

        return navLists.find(function (list) {
            return window.getComputedStyle(list).display !== 'none';
        }) || navLists[0];
    }

    function closeMobileMenu() {
        navLists.forEach(function (nav) {
            nav.classList.remove('active');
        });
        mobileToggle?.setAttribute('aria-expanded', 'false');
    }

    if (mobileToggle && navLists.length > 0) {
        mobileToggle.setAttribute('aria-expanded', 'false');

        mobileToggle.addEventListener('click', function () {
            const visibleNav = getVisibleNav();
            if (!visibleNav) return;

            navLists.forEach(function (nav) {
                if (nav !== visibleNav) nav.classList.remove('active');
            });

            const isOpen = visibleNav.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        navLists.forEach(function (nav) {
            nav.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeMobileMenu);
            });
        });

        document.addEventListener('click', function (event) {
            if (!event.target.closest('.navbar')) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) {
                closeMobileMenu();
            }
        });
    }

    function refreshAnimations() {
        if (typeof AOS !== 'undefined' && typeof AOS.refreshHard === 'function') {
            AOS.refreshHard();
        }
    }

    function scrollToTarget(selector, smooth = true) {
        if (!selector || selector === '#') return;
        const target = document.querySelector(selector);
        if (!target) return;

        const headerOffset = 80;
        const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }

    function showHome(options = {}) {
        const target = options.target || null;
        const smooth = options.smooth !== false;
        const updateHash = options.updateHash !== false;

        if (homeView) homeView.style.display = 'block';
        if (portfolioView) portfolioView.style.display = 'none';
        if (homeNav) homeNav.style.display = 'flex';

        document.title = defaultTitle;
        closeMobileMenu();
        window.scrollTo({ top: 0, behavior: 'auto' });

        if (updateHash) {
            const nextHash = target && navHashTargets.has(target) ? target : '';
            history.replaceState(null, '', nextHash || (window.location.pathname + window.location.search));
        }

        setTimeout(function () {
            refreshAnimations();
            if (target) {
                scrollToTarget(target, smooth);
            }
        }, 50);
    }

    function showPortfolio(options = {}) {
        const updateHash = options.updateHash !== false;

        if (homeView) homeView.style.display = 'none';
        if (portfolioView) portfolioView.style.display = 'block';
        if (homeNav) homeNav.style.display = 'flex';

        document.title = portfolioTitle;
        closeMobileMenu();
        window.scrollTo({ top: 0, behavior: 'auto' });

        if (updateHash) {
            history.replaceState(null, '', '#portfolio');
        }

        setTimeout(refreshAnimations, 50);
    }

    window.showHome = showHome;
    window.showPortfolio = showPortfolio;
    window.scrollToTarget = scrollToTarget;
    window.closeMobileMenu = closeMobileMenu;

    function handleInitialRouteFromHash() {
        const hash = window.location.hash;
        if (hash === '#portfolio') {
            showPortfolio({ updateHash: false });
            return;
        }

        if (hash && navHashTargets.has(hash)) {
            showHome({ target: hash, smooth: false, updateHash: false });
            return;
        }

        showHome({ updateHash: false });
    }

    document.querySelectorAll('[data-portfolio-trigger], #open-portfolio-link').forEach(function (trigger) {
        trigger.addEventListener('click', function (event) {
            event.preventDefault();
            showPortfolio();
        });
    });

    if (logoHomeLink) {
        logoHomeLink.addEventListener('click', function (event) {
            event.preventDefault();
            showHome();
        });
    }

    if (backHomeLink) {
        backHomeLink.addEventListener('click', function (event) {
            event.preventDefault();
            showHome();
        });
    }

    if (portfolioContactLink) {
        portfolioContactLink.addEventListener('click', function (event) {
            event.preventDefault();
            showHome({ target: '#contacto' });
        });
    }

    document.querySelectorAll('a[href^="#"], [data-scroll-target]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            const target = link.getAttribute('data-scroll-target') || link.getAttribute('href');
            if (!target || target === '#' || target === '#portfolio') return;
            if (!target.startsWith('#')) return;

            event.preventDefault();

            if (portfolioView && window.getComputedStyle(portfolioView).display !== 'none') {
                showHome({ target: target });
            } else {
                scrollToTarget(target, true);
                if (navHashTargets.has(target)) {
                    history.replaceState(null, '', target);
                }
                closeMobileMenu();
            }
        });
    });

    window.addEventListener('hashchange', function () {
        if (window.location.hash === '#portfolio') {
            showPortfolio({ updateHash: false });
        } else if (navHashTargets.has(window.location.hash)) {
            showHome({ target: window.location.hash, smooth: false, updateHash: false });
        }
    });

    handleInitialRouteFromHash();

    // Centralized Tracking Architecture
    document.addEventListener('click', function (e) {
        const trackEl = e.target.closest('[data-track-cta]');
        if (!trackEl) return;

        const eventName = trackEl.getAttribute('data-track-cta');
        const eventCategory = trackEl.getAttribute('data-track-type') || 'engagement';
        const eventLabel = trackEl.getAttribute('data-track-label') || '';
        const eventSection = trackEl.getAttribute('data-track-section') || '';

        if (typeof gtag === 'function') {
            gtag('event', eventName, {
                event_category: eventCategory,
                event_label: eventLabel,
                section: eventSection
            });
        }
    });

    // Form Field Focus Tracking
    const trackableFields = document.querySelectorAll('#contactForm input, #contactForm textarea');
    trackableFields.forEach(field => {
        field.addEventListener('focus', function () {
            const eventName = this.getAttribute('data-track-cta');
            if (eventName && typeof gtag === 'function') {
                gtag('event', eventName, {
                    event_category: 'form',
                    event_label: this.name,
                    section: 'contact_form'
                });
            }
        });
    });

    // Cookie Consent Banner Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const declineCookiesBtn = document.getElementById('decline-cookies');
    const openCookiesBtns = document.querySelectorAll('.open-cookies');

    if (cookieBanner && acceptCookiesBtn && declineCookiesBtn) {
        // Open cookies banner manually from footers
        openCookiesBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                cookieBanner.classList.add('show');
            });
        });

        const isConsentSet = localStorage.getItem('cookieConsent');
        
        if (!isConsentSet) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                });
                // Explicit event to track acceptance
                gtag('event', 'cookie_consent_accepted', {
                    event_category: 'cookie_banner',
                    event_label: 'accepted'
                });
            }
        });

        declineCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('show');
            if (typeof gtag === 'function') {
                gtag('consent', 'update', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied'
                });
                // Explicit event to track rejection
                gtag('event', 'cookie_consent_declined', {
                    event_category: 'cookie_banner',
                    event_label: 'declined'
                });
            }
        });
    }
});
