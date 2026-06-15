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

// Global state to avoid forced reflows (getComputedStyle)
window.__lebaViewState = 'home';

// Initialize page interactions safely once DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            if (!validateEmail(emailInput.value)) alert('Invalid email format!');
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', function () {
            if (!validatePhone(phoneInput.value)) alert('Invalid phone number!');
        });
    }

    // Offload non-critical logic to idle time to keep the main thread free for LCP/FCP.
    const idleInit = function() {
        const toWebpVariant = (src, width) => src.replace(/\.(png|jpe?g)$/i, `-${width}.webp`);

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
                img.src = toWebpVariant(first, 640);
            });
        };

        document.addEventListener('click', function (e) {
            const opener = e.target.closest('#open-portfolio-link, #hero-open-portfolio');
            if (!opener) return;
            preloadPortfolioFirstSlides();
        }, { once: false });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navLists = Array.from(document.querySelectorAll('.nav-links'));
        const homeNav = document.getElementById('home-nav-links');
        const portfolioNav = document.getElementById('portfolio-nav-links');

        // ZERO-REFLOW NAV FINDER: uses global state instead of getComputedStyle
        function getVisibleNav() {
            if (window.__lebaViewState === 'portfolio' && portfolioNav) return portfolioNav;
            return homeNav || navLists[0];
        }

        function closeMobileMenu() {
            navLists.forEach(nav => nav.classList.remove('active'));
            mobileToggle?.setAttribute('aria-expanded', 'false');
        }

        if (mobileToggle && navLists.length > 0) {
            mobileToggle.addEventListener('click', function () {
                const visibleNav = getVisibleNav();
                if (!visibleNav) return;
                navLists.forEach(nav => { if (nav !== visibleNav) nav.classList.remove('active'); });
                const isOpen = visibleNav.classList.toggle('active');
                mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
            navLists.forEach(nav => {
                nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
            });
            document.addEventListener('click', (e) => { if (!e.target.closest('.navbar')) closeMobileMenu(); });
        }

        // Tracking
        document.addEventListener('click', function (e) {
            const trackEl = e.target.closest('[data-track-cta]');
            if (!trackEl || typeof gtag !== 'function') return;
            gtag('event', trackEl.getAttribute('data-track-cta'), {
                event_category: trackEl.getAttribute('data-track-type') || 'engagement',
                event_label: trackEl.getAttribute('data-track-label') || '',
                section: trackEl.getAttribute('data-track-section') || ''
            });
        });

        // Form handlers
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('focusin', function (e) {
                const eventName = e.target.getAttribute('data-track-cta');
                if (eventName && typeof gtag === 'function') {
                    gtag('event', eventName, { event_category: 'form', event_label: e.target.name, section: 'contact_form' });
                }
            });

            const contactSubmitBtn = document.getElementById('contactSubmitBtn');
            contactForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                contactSubmitBtn?.classList.add('is-loading');
                if (contactSubmitBtn) contactSubmitBtn.disabled = true;
                const formData = new FormData(contactForm);
                try {
                    const response = await fetch(contactForm.getAttribute('action'), {
                        method: 'POST', headers: { 'Accept': 'application/json' }, body: formData
                    });
                    if (response.ok) {
                        contactForm.reset();
                        document.getElementById('contactSuccess')?.classList.add('is-visible');
                    }
                } catch (error) {
                    document.getElementById('contactError')?.classList.add('is-visible');
                } finally {
                    contactSubmitBtn?.classList.remove('is-loading');
                    if (contactSubmitBtn) contactSubmitBtn.disabled = false;
                }
            });
        }

        // Custom cursor
        var cursor = document.querySelector('.cursor');
        if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            document.addEventListener('mousemove', function(e) {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
            }, { passive: true });
            document.addEventListener('mouseleave', function() { cursor.classList.add('is-hidden'); });
            document.addEventListener('mouseenter', function() { cursor.classList.remove('is-hidden'); });
            document.addEventListener('mouseover', function(e) {
                var interactive = e.target.closest('a, button, [role="button"], label, .btn, .solution-block, .card, .step, .carousel-btn, .carousel-dot, .mobile-toggle');
                cursor.classList.toggle('is-hovering', !!interactive);
            }, { passive: true });
        }

        // Navbar solidify on scroll
        var mainNavbar = document.getElementById('main-navbar');
        if (mainNavbar) {
            window.addEventListener('scroll', function() {
                mainNavbar.classList.toggle('is-scrolled', window.scrollY > 40);
            }, { passive: true });
        }

        // Count-up animation for stats section
        const statItems = document.querySelectorAll('.stat-item[data-count]');
        if (statItems.length && 'IntersectionObserver' in window) {
            const countObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (!entry.isIntersecting) return;
                    countObserver.unobserve(entry.target);
                    const target = parseInt(entry.target.dataset.count, 10);
                    const numberEl = entry.target.querySelector('.stat-number');
                    if (!numberEl) return;
                    const duration = 1200;
                    const start = performance.now();
                    function tick(now) {
                        const progress = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        numberEl.textContent = Math.floor(eased * target);
                        if (progress < 1) requestAnimationFrame(tick);
                        else numberEl.textContent = target;
                    }
                    requestAnimationFrame(tick);
                });
            }, { threshold: 0.4 });
            statItems.forEach(function(el) { countObserver.observe(el); });
        }

        // Scrollspy: active nav link based on visible section
        const homeNavLinks = document.querySelectorAll('#home-nav-links a[href^="#"]');
        if (homeNavLinks.length && 'IntersectionObserver' in window) {
            const navMap = {};
            homeNavLinks.forEach(function(link) {
                const id = link.getAttribute('href').replace('#', '');
                navMap[id] = link;
            });
            const spyObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        homeNavLinks.forEach(function(l) { l.classList.remove('is-active'); });
                        const link = navMap[entry.target.id];
                        if (link) link.classList.add('is-active');
                    }
                });
            }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });
            ['soluciones', 'proceso', 'contacto-form'].forEach(function(id) {
                const el = document.getElementById(id);
                if (el) spyObserver.observe(el);
            });
        }

        // Cookie Consent logic
        const cookieBanner = document.getElementById('cookie-banner');
        if (cookieBanner) {
            const isConsentSet = localStorage.getItem('cookieConsent');
            if (!isConsentSet) {
                setTimeout(() => { 
                    requestAnimationFrame(() => cookieBanner.classList.add('show'));
                }, 4000);
            }
            document.getElementById('accept-cookies')?.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'accepted');
                cookieBanner.classList.remove('show');
                if (typeof gtag === 'function') gtag('consent', 'update', { 'analytics_storage': 'granted', 'ad_storage': 'granted' });
            });
            document.getElementById('decline-cookies')?.addEventListener('click', () => {
                localStorage.setItem('cookieConsent', 'declined');
                cookieBanner.classList.remove('show');
                if (typeof gtag === 'function') gtag('consent', 'update', { 'analytics_storage': 'denied', 'ad_storage': 'denied' });
            });
        }
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(idleInit);
    } else {
        setTimeout(idleInit, 1000);
    }
});
