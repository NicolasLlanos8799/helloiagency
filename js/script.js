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
    // Elegant Preloader Handling
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', function() {
            // Give it a small extra buffer for a smoother entrance
            setTimeout(() => {
                document.body.classList.remove('is-loading');
            }, 600);
        });

        // Safety timeout (if window load takes too long)
        setTimeout(() => {
            if (document.body.classList.contains('is-loading')) {
                document.body.classList.remove('is-loading');
            }
        }, 3000);
    }

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

        window.addEventListener('resize', function () {
            if (window.innerWidth > 900) {
                closeMobileMenu();
            }
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

    // Contact form submit without redirect (Formspree AJAX)
    const contactForm = document.getElementById('contactForm');
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
