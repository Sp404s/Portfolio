(() => {
  const section = document.querySelector('[data-skills]');
  if (!section) return;

  const values = [...section.querySelectorAll('[data-skill-value]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = false;

  const showFinalValues = () => {
    values.forEach((element) => {
      element.textContent = `${element.dataset.skillValue}%`;
    });
  };

  const start = () => {
    if (started) return;
    started = true;
    section.classList.add('is-visible');

    if (reducedMotion) {
      showFinalValues();
      return;
    }

    const duration = 950;
    const startTime = performance.now();
    const update = (time) => {
      const progress = Math.min(1, (time - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      values.forEach((element) => {
        const target = Number(element.dataset.skillValue);
        element.textContent = `${Math.round(target * eased)}%`;
      });
      if (progress < 1) requestAnimationFrame(update);
      else showFinalValues();
    };
    requestAnimationFrame(update);
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    start();
  }, { threshold: 0.2 });
  observer.observe(section);
})();
