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

// Initialize page interactions safely once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
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

    // ────────────────────────────────────────────────────────────────
    // Portfolio image preload — TARGETED, not blanket.
    //
    // Previously this eagerly fetched ALL ~50 PNG carousel images at
    // page load (multi-megabyte each), which destroyed mobile scores.
    // Now we only preload the FIRST slide of each project (the one
    // that's actually shown) and only when the user opens the
    // portfolio view. Subsequent slides are lazy-loaded by the
    // browser via loading="lazy" / IntersectionObserver.
    // ────────────────────────────────────────────────────────────────
    const toWebpVariant = (src, width) =>
        src.replace(/\.(png|jpe?g)$/i, `-${width}.webp`);

    const preloadPortfolioFirstSlides = function () {
        document.querySelectorAll('.project-carousel-wrapper[data-images]').forEach(function (wrapper) {
            let images = [];
            try { images = JSON.parse(wrapper.dataset.images || '[]'); }
            catch (e) { return; }
            if (!images.length) return;
            const first = images[0];
            if (!first) return;
            const img = new Image();
            img.decoding = 'async';
            // Use the lighter 640 w variant for the warm-up
            img.src = toWebpVariant(first, 640);
        });
    };

    // Only run when the user actually opens the portfolio
    document.addEventListener('click', function (e) {
        const opener = e.target.closest('#open-portfolio-link, #hero-open-portfolio');
        if (!opener) return;
        ('requestIdleCallback' in window ? window.requestIdleCallback : setTimeout)(
            preloadPortfolioFirstSlides, 0
        );
    }, { once: false });

    // Mobile menu toggle (works for both home and portfolio nav variants)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLists = Array.from(document.querySelectorAll('.nav-links'));
    const homeNav = document.getElementById('home-nav-links');
    const portfolioNav = document.getElementById('portfolio-nav-links');
    const homeView = document.getElementById('home-view');
    const portfolioView = document.getElementById('portfolio-view');

    function getVisibleNav() {
        const isPortfolioViewVisible = portfolioView && window.getComputedStyle(portfolioView).display !== 'none';

        if (isPortfolioViewVisible && portfolioNav) {
            return portfolioNav;
        }

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

        // Use a debounced resize listener to avoid layout thrashing
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 900) {
                    closeMobileMenu();
                }
            }, 200);
        });
    }
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

    // Form Field Focus Tracking using delegation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('focusin', function (e) {
            const eventName = e.target.getAttribute('data-track-cta');
            if (eventName && typeof gtag === 'function') {
                gtag('event', eventName, {
                    event_category: 'form',
                    event_label: e.target.name,
                    section: 'contact_form'
                });
            }
        });
    }

    // Contact form submit without redirect (Formspree AJAX)
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const contactSuccess = document.getElementById('contactSuccess');
    const contactError = document.getElementById('contactError');

    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            contactSuccess?.classList.remove('is-visible');
            contactError?.classList.remove('is-visible');
            contactSubmitBtn?.classList.add('is-loading');
            if (contactSubmitBtn) {
                contactSubmitBtn.disabled = true;
            }

            const formData = new FormData(contactForm);
            const endpoint = contactForm.getAttribute('action');

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Form submission failed');
                }

                contactForm.reset();
                contactSuccess?.classList.add('is-visible');

                if (typeof gtag === 'function') {
                    gtag('event', 'form_submit_success', {
                        event_category: 'form',
                        event_label: 'contact_form',
                        section: 'contact_form'
                    });
                }
            } catch (error) {
                console.error('Contact form submit error:', error);
                contactError?.classList.add('is-visible');

                if (typeof gtag === 'function') {
                    gtag('event', 'form_submit_error', {
                        event_category: 'form',
                        event_label: 'contact_form',
                        section: 'contact_form'
                    });
                }
            } finally {
                contactSubmitBtn?.classList.remove('is-loading');
                if (contactSubmitBtn) {
                    contactSubmitBtn.disabled = false;
                }
            }
        });
    }

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
            }, 4000);
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
