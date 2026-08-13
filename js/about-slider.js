(() => {
  document.querySelectorAll('img').forEach((image) => {
    image.decoding = 'async';
    if (!image.closest('.about-hero, .site-loader')) image.loading = 'lazy';
  });

  const grid = document.querySelector('.software-grid');
  if (!grid || grid.dataset.sliderReady === 'true') return;

  const cards = Array.from(grid.children);
  if (!cards.length) return;

  const makeSet = (hidden = false) => {
    const set = document.createElement('div');
    set.className = 'software-set';
    if (hidden) set.setAttribute('aria-hidden', 'true');
    cards.forEach((card) => set.appendChild(hidden ? card.cloneNode(true) : card));
    return set;
  };

  const track = document.createElement('div');
  track.className = 'software-track';
  track.append(makeSet(), makeSet(true));
  grid.replaceChildren(track);
  grid.dataset.sliderReady = 'true';
})();
