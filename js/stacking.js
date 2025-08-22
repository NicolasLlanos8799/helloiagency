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
  const onLoad = () => {
    // Equalize stack-card heights
    const heightCards = Array.from(document.querySelectorAll('.stack-card'));
    if (heightCards.length) {
      const tallest = Math.max(
        ...heightCards.map((c) => (c.querySelector('.card-inner')?.offsetHeight || c.offsetHeight))
      );
      heightCards.forEach((c) => (c.style.minHeight = Math.max(c.offsetHeight, tallest) + 'px'));
    }

    // AOS
    if (window.AOS && typeof AOS.init === 'function') {
      AOS.init({ duration: 800, once: true });
    }

    // Mobile nav toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    const nav = document.querySelector('.main-nav');
    if (menuToggle && navbar && nav) {
      menuToggle.addEventListener('click', () => {
        const open = navbar.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', open);
      });

      // Close nav on link click
      nav.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          if (navbar.classList.contains('is-open')) {
            navbar.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }

    /* =========================================================
       DROPDOWN: Portal fix (no clipping, 100% responsive)
       - Saca .dropdown-menu al <body> al abrir
       - Posiciona bajo el toggle (desktop) o como panel fijo (móvil)
       - Cierra con click fuera, ESC y al cambiar de breakpoint
    ========================================================== */
    const IS_MOBILE = () => window.matchMedia('(max-width: 768px)').matches;
    const SEL_DD = '.dropdown';
    const SEL_TOGGLE = '.dropdown-toggle';
    const SEL_MENU = '.dropdown-menu';

    function makePortal(menuEl, dd) {
      // wrapper que vivirá en <body>
      const portal = document.createElement('div');
      portal.className = 'dropdown-portal';

      // placeholders para restaurar
      dd.__placeholder = document.createComment('dropdown-placeholder');
      menuEl.parentNode.insertBefore(dd.__placeholder, menuEl);

      // mover contenido al portal
      while (menuEl.firstChild) portal.appendChild(menuEl.firstChild);
      // quitar contenedor original .dropdown-menu del DOM
      menuEl.remove();

      // guardar refs
      dd.__portal = portal;
      document.body.appendChild(portal);
      return portal;
    }

    function positionPortal(portal, toggleEl) {
      if (IS_MOBILE()) {
        // móvil: el CSS se encarga (fixed full‑width bajo el nav)
        return;
      }
      const r = toggleEl.getBoundingClientRect();
      const vw = window.innerWidth;

      // ancho deseado (clamp 720px..1200px con 88vw como target)
      const desired = Math.min(1200, Math.max(720, Math.round(vw * 0.88)));
      const margin = 12;

      // centrar respecto al toggle, con límites del viewport
      const leftCentered = r.left + r.width / 2 - desired / 2;
      const x = Math.min(vw - desired - margin, Math.max(margin, leftCentered));
      const y = Math.round(r.bottom + 12); // 12px de separación vertical

      portal.style.position = 'absolute';
      portal.style.width = desired + 'px';
      portal.style.left = x + 'px';
      portal.style.top = y + 'px';
      portal.style.transform = 'translateY(0)';
    }

    function openDD(dd) {
      // cierra otros
      document.querySelectorAll(SEL_DD + '.open').forEach((o) => o !== dd && closeDD(o));

      const toggle = dd.querySelector(SEL_TOGGLE);
      let menu = dd.querySelector(SEL_MENU);

      // crea portal si aún no existe (primera vez)
      const portal = dd.__portal || makePortal(menu, dd);

      // accesibilidad y flags
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      dd.classList.add('open');

      // posicionar y mostrar
      positionPortal(portal, toggle);
      portal.classList.add('open');

      // listeners para recálculo
      dd.__reposition = () => positionPortal(portal, toggle);
      window.addEventListener('resize', dd.__reposition);
      window.addEventListener('scroll', dd.__reposition, true);

      // evitar cierre por click dentro del portal
      portal.addEventListener('click', (e) => e.stopPropagation(), { once: false });
    }

    function closeDD(dd) {
      if (!dd.classList.contains('open')) return;
      const toggle = dd.querySelector(SEL_TOGGLE);
      const portal = dd.__portal;

      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');

      if (portal) portal.classList.remove('open');
      dd.classList.remove('open');

      window.removeEventListener('resize', dd.__reposition);
      window.removeEventListener('scroll', dd.__reposition, true);
      dd.__reposition = null;
    }

    // Delegación de eventos para cada dropdown
    document.querySelectorAll(SEL_DD).forEach((dd) => {
      const toggle = dd.querySelector(SEL_TOGGLE);
      if (!toggle) return;

      // Abrir/cerrar por click en el toggle
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dd.classList.contains('open') ? closeDD(dd) : openDD(dd);
      });

      // Click fuera (considera portal en <body>)
      document.addEventListener('click', (e) => {
        if (!dd.classList.contains('open')) return;
        const portal = dd.__portal;
        const clickInsideToggle = dd.contains(e.target);
        const clickInsidePortal = portal && portal.contains(e.target);
        if (!clickInsideToggle && !clickInsidePortal) closeDD(dd);
      });

      // Teclado: ESC cierra y devuelve foco
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dd.classList.contains('open')) {
          closeDD(dd);
          toggle.focus();
        }
      });

      // Cambio de breakpoint: recolocar si está abierto
      const mql = window.matchMedia('(max-width: 768px)');
      mql.addEventListener?.('change', () => {
        if (dd.classList.contains('open') && dd.__portal) {
          // en móvil no necesitamos recalcular coords; en desktop sí
          positionPortal(dd.__portal, toggle);
        }
      });
    });
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();
