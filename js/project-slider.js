const slider = document.querySelector('[data-project-slider]');
const track = document.querySelector('[data-project-slider-track]');
const firstGroup = track?.querySelector('.project-slider__group');

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
});

if (slider && track && firstGroup) {
  let position = 0;
  let groupWidth = 0;
  let lastTime = performance.now();
  let isDragging = false;
  let startX = 0;
  let startPosition = 0;

  const speed = 55;

  const updateWidth = () => {
    groupWidth = firstGroup.offsetWidth;
  };

  const normalizePosition = () => {
    if (!groupWidth) return;

    while (position <= -groupWidth) {
      position += groupWidth;
    }

    while (position > 0) {
      position -= groupWidth;
    }
  };

  const render = () => {
    normalizePosition();
    track.style.transform = `translateX(${position}px)`;
  };

  const tick = (time) => {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    if (!isDragging) {
      position -= speed * delta;
      render();
    }

    requestAnimationFrame(tick);
  };

  const startDrag = (event) => {
    isDragging = true;
    startX = event.clientX;
    startPosition = position;
    slider.classList.add('is-dragging');
    slider.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!isDragging) return;

    position = startPosition + event.clientX - startX;
    render();
  };

  const endDrag = (event) => {
    if (!isDragging) return;

    isDragging = false;
    slider.classList.remove('is-dragging');

    if (slider.hasPointerCapture(event.pointerId)) {
      slider.releasePointerCapture(event.pointerId);
    }
  };

  updateWidth();
  render();
  requestAnimationFrame(tick);

  window.addEventListener('resize', () => {
    updateWidth();
    render();
  });

  slider.addEventListener('pointerdown', startDrag);
  slider.addEventListener('pointermove', moveDrag);
  slider.addEventListener('pointerup', endDrag);
  slider.addEventListener('pointercancel', endDrag);
  slider.addEventListener('dragstart', (event) => event.preventDefault());
}
