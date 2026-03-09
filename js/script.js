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
});
