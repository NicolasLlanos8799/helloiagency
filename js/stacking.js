
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
