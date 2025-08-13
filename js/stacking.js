
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

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navbar nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}


// --- Enhancements: AOS init, click-outside to close, ESC, ARIA, close nav on link click ---
(function(){
  const onLoad = () => {
    if (window.AOS && typeof AOS.init === 'function') {
      AOS.init({ duration: 800, once: true });
    }

    // Mobile nav toggle close on link click
    const nav = document.querySelector('.main-nav');
    if (nav) {
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          const wrapper = document.querySelector('.navbar nav, .main-nav');
          if (wrapper && wrapper.classList.contains('open')) {
            wrapper.classList.remove('open');
          }
        });
      });
    }

    // Dropdown behavior
    document.querySelectorAll('.dropdown').forEach(dd => {
      const toggle = dd.querySelector('.dropdown-toggle');
      const menu = dd.querySelector('.dropdown-menu');
      if (!toggle || !menu) return;

      const open = () => {
        dd.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      };
      const close = () => {
        dd.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      };

      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dd.classList.toggle('open');
        const isOpen = dd.classList.contains('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
      });

      // Click outside
      document.addEventListener('click', (e) => {
        if (!dd.contains(e.target)) {
          close();
        }
      });

      // ESC to close
      dd.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          close();
          toggle.focus();
        }
      });
    });
  };

  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad);
})();

