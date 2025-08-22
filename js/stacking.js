
  const cards = document.querySelectorAll('.stack-card');

  function revealCardsOnScroll() {
    let visibleCount = 0;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight - 100) {
        card.classList.add('visible');
        card.style.zIndex = visibleCount + 1; // ahora el último que aparece tiene el z-index más alto
        visibleCount++;
      }
    });
  }

window.addEventListener('scroll', revealCardsOnScroll);
window.addEventListener('load', revealCardsOnScroll);
// --- Enhancements: AOS init, click-outside to close, ESC, ARIA, close nav on link click ---
(function(){
  const onLoad = () => {
    // Equalize stack-card heights
    const heightCards = Array.from(document.querySelectorAll('.stack-card'));
    if (heightCards.length) {
      const tallest = Math.max(...heightCards.map(c => (c.querySelector('.card-inner')?.offsetHeight || c.offsetHeight)));
      heightCards.forEach(c => c.style.minHeight = Math.max(c.offsetHeight, tallest) + 'px');
    }

    if (window.AOS && typeof AOS.init === 'function') {
      AOS.init({ duration: 800, once: true });
    }

    // Mobile nav toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (menuToggle && navbar) {
      menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('is-open');
      });
    }

    // Close nav on link click
    const nav = document.querySelector('.main-nav');
    if (nav && navbar) {
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if (navbar.classList.contains('is-open')) {
            navbar.classList.remove('is-open');
          }
        });
      });
    }

      // Responsive dropdown fix
      const DROPDOWN_SELECTOR = '.dropdown';
      const TOGGLE_SELECTOR = '.dropdown-toggle';
      const MENU_SELECTOR = '.dropdown-menu';

      // Responsive dropdown fix
      function closeDropdown(dd) {
        dd.classList.remove('open');
        const toggle = dd.querySelector(TOGGLE_SELECTOR);
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
      }

      // Responsive dropdown fix
      function openDropdown(dd) {
        document.querySelectorAll(DROPDOWN_SELECTOR + '.open')
          .forEach(o => o !== dd && closeDropdown(o));
        dd.classList.add('open');
        const toggle = dd.querySelector(TOGGLE_SELECTOR);
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('menu-open');
      }

      // Responsive dropdown fix
      document.querySelectorAll(DROPDOWN_SELECTOR).forEach(dd => {
        const toggle = dd.querySelector(TOGGLE_SELECTOR);
        const menu = dd.querySelector(MENU_SELECTOR);
        if (!toggle || !menu) return;

        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          dd.classList.contains('open') ? closeDropdown(dd) : openDropdown(dd);
        });

        document.addEventListener('click', (e) => {
          if (!dd.contains(e.target)) closeDropdown(dd);
        });

        dd.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            closeDropdown(dd);
            toggle.focus();
          }
        });

        menu.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });

      // Responsive dropdown fix
      let lastIsMobile = window.matchMedia('(max-width: 768px)').matches;
      window.addEventListener('resize', () => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile !== lastIsMobile) {
          document.querySelectorAll(DROPDOWN_SELECTOR + '.open')
            .forEach(dd => closeDropdown(dd));
          lastIsMobile = isMobile;
        }
      });
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();

