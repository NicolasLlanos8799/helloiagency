
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

    /* === Responsive dropdown fix === */ // Responsive audit
    const SEL_DD = '.dropdown';
    const SEL_TOGGLE = '.dropdown-toggle';
    const SEL_MENU = '.dropdown-menu';

    function closeDD(dd){
      dd.classList.remove('open');
      const t = dd.querySelector(SEL_TOGGLE);
      if (t) t.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
    }
    function openDD(dd){
      document.querySelectorAll(SEL_DD + '.open').forEach(o => o!==dd && closeDD(o));
      dd.classList.add('open');
      const t = dd.querySelector(SEL_TOGGLE);
      if (t) t.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
    }

    document.querySelectorAll(SEL_DD).forEach(dd=>{
      const toggle = dd.querySelector(SEL_TOGGLE);
      const menu = dd.querySelector(SEL_MENU);
      if(!toggle || !menu) return;

      toggle.addEventListener('click', e=>{
        e.preventDefault();
        dd.classList.contains('open') ? closeDD(dd) : openDD(dd);
      });

      // click fuera
      document.addEventListener('click', e=>{
        if(!dd.contains(e.target)) closeDD(dd);
      });

      // teclado
      dd.addEventListener('keydown', e=>{
        if(e.key === 'Escape'){ closeDD(dd); toggle.focus(); }
      });

      // evitar burbuja interna
      menu.addEventListener('click', e=> e.stopPropagation());
    });

    // cerrar al cambiar de breakpoint
    let mql = window.matchMedia('(max-width: 768px)');
    mql.addEventListener?.('change', ()=> {
      document.querySelectorAll(SEL_DD + '.open').forEach(closeDD);
    });
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();

