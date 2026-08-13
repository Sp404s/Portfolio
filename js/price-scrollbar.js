(() => {
  const tableWrap = document.querySelector('.price-table-wrap');
  const scrollbar = document.querySelector('[data-price-scrollbar]');
  const thumb = document.querySelector('[data-price-scrollbar-thumb]');
  if (!tableWrap || !scrollbar || !thumb) return;

  let dragging = false;
  let pointerOffset = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const update = () => {
    const maxScroll = Math.max(0, tableWrap.scrollWidth - tableWrap.clientWidth);
    const trackWidth = scrollbar.clientWidth;
    const thumbWidth = maxScroll > 0
      ? Math.max(72, trackWidth * (tableWrap.clientWidth / tableWrap.scrollWidth))
      : trackWidth;
    const maxThumbLeft = Math.max(0, trackWidth - thumbWidth);
    const progress = maxScroll > 0 ? tableWrap.scrollLeft / maxScroll : 0;
    thumb.style.width = `${thumbWidth}px`;
    thumb.style.transform = `translateX(${progress * maxThumbLeft}px)`;
    scrollbar.hidden = maxScroll <= 0;
  };

  const scrollFromPointer = (clientX, offset = 0) => {
    const rect = scrollbar.getBoundingClientRect();
    const maxThumbLeft = Math.max(0, rect.width - thumb.offsetWidth);
    const thumbLeft = clamp(clientX - rect.left - offset, 0, maxThumbLeft);
    const progress = maxThumbLeft > 0 ? thumbLeft / maxThumbLeft : 0;
    tableWrap.scrollLeft = progress * Math.max(0, tableWrap.scrollWidth - tableWrap.clientWidth);
    update();
  };

  thumb.addEventListener('pointerdown', (event) => {
    dragging = true;
    pointerOffset = event.clientX - thumb.getBoundingClientRect().left;
    thumb.classList.add('is-dragging');
    thumb.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  thumb.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    scrollFromPointer(event.clientX, pointerOffset);
    event.preventDefault();
  });
  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove('is-dragging');
    thumb.releasePointerCapture?.(event.pointerId);
  };
  thumb.addEventListener('pointerup', stopDragging);
  thumb.addEventListener('pointercancel', stopDragging);
  scrollbar.addEventListener('pointerdown', (event) => {
    if (event.target === thumb) return;
    scrollFromPointer(event.clientX, thumb.offsetWidth / 2);
  });
  tableWrap.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update, { once: true });
  update();
})();
