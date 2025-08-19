// Equalize stack-card heights to the tallest (progressive enhancement)
(function(){
  const cards = Array.from(document.querySelectorAll('.stack-card'));
  if (!cards.length) return;
  const tallest = Math.max(...cards.map(c => (c.querySelector('.card-inner')?.offsetHeight || c.offsetHeight)));
  cards.forEach(c => c.style.minHeight = Math.max(c.offsetHeight, tallest) + 'px');
})();
