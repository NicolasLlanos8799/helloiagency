/* ===== Stack cards reveal on scroll ===== */
const cards = document.querySelectorAll('.stack-card');

function revealCardsOnScroll() {
  let visibleCount = 0;

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (rect.top < windowHeight - 100) {
      card.classList.add('visible');
      card.style.zIndex = visibleCount + 1; // el último visible queda arriba
      visibleCount++;
    }
  });
}

window.addEventListener('scroll', revealCardsOnScroll);
window.addEventListener('load', revealCardsOnScroll);

/* ===== App boot / enhancements ===== */
(function () {
  const selectors = {
    dropdown: '.dropdown',
    toggle: '.dropdown-toggle',
    menu: '.dropdown-menu',
    panel: '.dropdown-panel',
  };

  const mediaQueries = {
    mobile: '(max-width: 768px)',
  };

  const isMobile = () => window.matchMedia(mediaQueries.mobile).matches;

  const equalizeStackCards = () => {
    const stackCards = Array.from(document.querySelectorAll('.stack-card'));
    if (!stackCards.length) return;

    const tallest = Math.max(
      ...stackCards.map((card) => card.querySelector('.card-inner')?.offsetHeight || card.offsetHeight)
    );

    stackCards.forEach((card) => {
      const minHeight = Math.max(card.offsetHeight, tallest) + 'px';
      card.style.minHeight = minHeight;
    });
  };

  const initAOS = () => {
    if (window.AOS && typeof AOS.init === 'function') {
      AOS.init({ duration: 800, once: true });
    }
  };

  const initMobileNav = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const nav = document.querySelector('.main-nav');

    if (!(menuToggle && navbar && nav)) return;

    const closeNav = () => {
      navbar.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    const toggleNav = () => {
      const open = navbar.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open); // FIX: Bloquear scroll al abrir
    };

    menuToggle.addEventListener('click', toggleNav);

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbar.classList.contains('is-open')) {
        closeNav();
        menuToggle.focus();
      }
    });

    const setScrolledState = () => {
      const scrolled = window.scrollY > 12;
      navbar.classList.toggle('scrolled', scrolled);
    };

    setScrolledState();
    window.addEventListener('scroll', setScrolledState, { passive: true });
  };

  /* =========================================================
     DROPDOWN: Portal fix (no clipping, 100% responsive)
     - Saca .dropdown-menu al <body> al abrir
     - Posiciona bajo el toggle (desktop) o como panel fijo (móvil)
     - Cierra con click fuera, ESC y al cambiar de breakpoint
  ========================================================== */
  const makePortal = (menuElement, dropdown) => {
    const portal = document.createElement('div');
    portal.className = 'dropdown-portal';

    dropdown.__placeholder = document.createComment('dropdown-placeholder');
    menuElement.parentNode.insertBefore(dropdown.__placeholder, menuElement);

    while (menuElement.firstChild) portal.appendChild(menuElement.firstChild);
    menuElement.remove();

    dropdown.__portal = portal;
    document.body.appendChild(portal);
    return portal;
  };

  const positionPortal = (portal, toggleEl) => {
    if (isMobile()) return; // móvil: el CSS se encarga

    const rect = toggleEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const desiredWidth = Math.min(1200, Math.max(720, Math.round(viewportWidth * 0.88)));
    const margin = 12;

    const leftCentered = rect.left + rect.width / 2 - desiredWidth / 2;
    const left = Math.min(viewportWidth - desiredWidth - margin, Math.max(margin, leftCentered));
    const top = Math.round(rect.bottom + 12);

    Object.assign(portal.style, {
      position: 'absolute',
      width: desiredWidth + 'px',
      left: left + 'px',
      top: top + 'px',
      transform: 'translateY(0)',
    });
  };

  const openDropdown = (dropdown) => {
    document.querySelectorAll(selectors.dropdown + '.open').forEach((openDropdownEl) => {
      if (openDropdownEl === dropdown) return;
      openDropdownEl.classList.contains('dd-simple') ? closeSimpleDropdown(openDropdownEl) : closeDropdown(openDropdownEl);
    });

    const toggle = dropdown.querySelector(selectors.toggle);
    const menu = dropdown.querySelector(selectors.menu);
    const portal = dropdown.__portal || makePortal(menu, dropdown);

    toggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    dropdown.classList.add('open');

    positionPortal(portal, toggle);
    portal.classList.add('open');

    dropdown.__reposition = () => positionPortal(portal, toggle);
    window.addEventListener('resize', dropdown.__reposition);
    window.addEventListener('scroll', dropdown.__reposition, true);

    portal.addEventListener('click', (event) => event.stopPropagation(), { once: false });
  };

  const closeDropdown = (dropdown) => {
    if (!dropdown.classList.contains('open')) return;

    const toggle = dropdown.querySelector(selectors.toggle);
    const portal = dropdown.__portal;

    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');

    portal?.classList.remove('open');
    dropdown.classList.remove('open');

    window.removeEventListener('resize', dropdown.__reposition);
    window.removeEventListener('scroll', dropdown.__reposition, true);
    dropdown.__reposition = null;
  };

  // === Simple dropdown (Support) ===
  const openSimpleDropdown = (dropdown) => {
    document.querySelectorAll(selectors.dropdown + '.open').forEach((openDropdownEl) => {
      if (openDropdownEl === dropdown) return;
      openDropdownEl.classList.contains('dd-simple')
        ? closeSimpleDropdown(openDropdownEl)
        : closeDropdown(openDropdownEl);
    });

    const toggle = dropdown.querySelector(selectors.toggle);
    toggle?.setAttribute('aria-expanded', 'true');
    dropdown.classList.add('open');

    dropdown.__docClick = (event) => {
      if (!dropdown.contains(event.target)) closeSimpleDropdown(dropdown);
    };
    document.addEventListener('click', dropdown.__docClick);

    dropdown.__esc = (event) => {
      if (event.key === 'Escape') {
        closeSimpleDropdown(dropdown);
        toggle?.focus();
      }
    };
    document.addEventListener('keydown', dropdown.__esc);

    dropdown.__scroll = () => closeSimpleDropdown(dropdown);
    window.addEventListener('scroll', dropdown.__scroll, { once: true });
  };

  const closeSimpleDropdown = (dropdown) => {
    if (!dropdown.classList.contains('open')) return;

    const toggle = dropdown.querySelector(selectors.toggle);
    toggle?.setAttribute('aria-expanded', 'false');
    dropdown.classList.remove('open');

    document.removeEventListener('click', dropdown.__docClick);
    document.removeEventListener('keydown', dropdown.__esc);
    window.removeEventListener('scroll', dropdown.__scroll);
    dropdown.__docClick = dropdown.__esc = dropdown.__scroll = null;
  };

  const wireDropdown = (dropdown) => {
    const toggle = dropdown.querySelector(selectors.toggle);
    if (!toggle) return;

    if (dropdown.classList.contains('dd-simple')) {
      const panel = dropdown.querySelector(selectors.panel);
      const items = panel ? Array.from(panel.querySelectorAll('a')) : [];

      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        dropdown.classList.contains('open') ? closeSimpleDropdown(dropdown) : openSimpleDropdown(dropdown);
      });

      toggle.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (!dropdown.classList.contains('open')) openSimpleDropdown(dropdown);
          items[0]?.focus();
        }
      });

      panel?.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
        event.preventDefault();

        const currentIndex = items.indexOf(document.activeElement);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
        if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;

        items[nextIndex]?.focus();
      });

      items.forEach((item) => item.addEventListener('click', () => closeSimpleDropdown(dropdown)));
      return;
    }

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      dropdown.classList.contains('open') ? closeDropdown(dropdown) : openDropdown(dropdown);
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.classList.contains('open')) return;
      const portal = dropdown.__portal;
      const clickInsideToggle = dropdown.contains(event.target);
      const clickInsidePortal = portal && portal.contains(event.target);
      if (!clickInsideToggle && !clickInsidePortal) closeDropdown(dropdown);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dropdown.classList.contains('open')) {
        closeDropdown(dropdown);
        toggle.focus();
      }
    });

    const mobileMedia = window.matchMedia(mediaQueries.mobile);
    mobileMedia.addEventListener?.('change', () => {
      if (dropdown.classList.contains('open') && dropdown.__portal) {
        positionPortal(dropdown.__portal, toggle);
      }
    });
  };

  const onLoad = () => {
    equalizeStackCards();
    initAOS();
    initMobileNav();
    document.querySelectorAll(selectors.dropdown).forEach(wireDropdown);
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();
