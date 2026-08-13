(() => {
  const filters = document.querySelector('.project-filters');
  const projects = document.querySelector('.home-projects');

  if (!filters || !projects) return;

  const buttons = Array.from(filters.querySelectorAll('[data-project-filter]'));
  const cards = Array.from(projects.querySelectorAll('.home-project-card'));
  const hero = document.querySelector('.hero');
  const heroAction = document.querySelector('.hero__content--redesign .hero__action');
  const projectsTitle = projects.querySelector('.home-projects__title');
  const timeline = projects.querySelector('[data-home-timeline]');
  const timelineThumb = projects.querySelector('[data-timeline-thumb]');
  const timelineYear = projects.querySelector('[data-timeline-year]');

  const normalize = (value) => value.trim().toLocaleLowerCase('ru-RU');

  cards.forEach((card) => {
    const category = card.querySelector('.home-project-card__top p');
    card.dataset.projectCategory = category ? normalize(category.textContent) : '';
  });

  const setMobileProjectsGap = () => {
    if (!hero || !heroAction || !projectsTitle) return;

    if (!window.matchMedia('(max-width: 768px)').matches) {
      projects.style.removeProperty('margin-top');
      hero.style.removeProperty('height');
      hero.style.removeProperty('min-height');
      return;
    }

    hero.style.removeProperty('height');
    hero.style.removeProperty('min-height');
    projects.style.setProperty('margin-top', '0px', 'important');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const currentGap = projectsTitle.getBoundingClientRect().top
          - heroAction.getBoundingClientRect().bottom;
        const projectsOffset = 46 - currentGap;

        projects.style.setProperty('margin-top', `${projectsOffset}px`, 'important');
      });
    });
  };

  setMobileProjectsGap();
  window.addEventListener('load', setMobileProjectsGap, { once: true });
  window.addEventListener('resize', setMobileProjectsGap);
  window.setTimeout(setMobileProjectsGap, 1200);

  if (document.fonts?.ready) {
    document.fonts.ready.then(setMobileProjectsGap);
  }

  const updateSingleProjectTimeline = () => {
    if (!timeline || !window.matchMedia('(max-width: 768px)').matches) {
      projects.classList.remove('has-single-project');
      return;
    }

    requestAnimationFrame(() => {
      const visibleCards = cards.filter((card) => !card.hidden);
      const hasSingleProject = visibleCards.length === 1;
      projects.classList.toggle('has-single-project', hasSingleProject);

      if (!hasSingleProject) return;

      const card = visibleCards[0];
      const year = card.dataset.projectYear || '';

      timeline.style.setProperty('top', `${card.offsetTop}px`, 'important');
      timeline.style.setProperty('height', `${card.offsetHeight}px`, 'important');
      timelineThumb.dataset.year = year;
      timelineYear.textContent = year;
    });
  };

  updateSingleProjectTimeline();
  window.addEventListener('resize', updateSingleProjectTimeline);

  let mouseDragStart = 0;
  let mouseScrollStart = 0;
  let isMouseDragging = false;
  let blockMouseClick = false;

  filters.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    mouseDragStart = event.clientX;
    mouseScrollStart = filters.scrollLeft;
    isMouseDragging = true;
    blockMouseClick = false;
    filters.setPointerCapture?.(event.pointerId);
  });

  filters.addEventListener('pointermove', (event) => {
    if (!isMouseDragging || event.pointerType !== 'mouse') return;
    const distance = event.clientX - mouseDragStart;
    if (Math.abs(distance) > 5) blockMouseClick = true;
    filters.scrollLeft = mouseScrollStart - distance;
  });

  const stopMouseDragging = (event) => {
    if (!isMouseDragging || event.pointerType !== 'mouse') return;
    isMouseDragging = false;
    filters.releasePointerCapture?.(event.pointerId);
  };

  filters.addEventListener('pointerup', stopMouseDragging);
  filters.addEventListener('pointercancel', stopMouseDragging);

  filters.addEventListener('click', (event) => {
    if (blockMouseClick) {
      event.preventDefault();
      blockMouseClick = false;
      return;
    }

    const selectedButton = event.target.closest('[data-project-filter]');
    if (!selectedButton) return;

    const selectedCategory = normalize(selectedButton.dataset.projectFilter);

    buttons.forEach((button) => {
      const isActive = button === selectedButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    cards.forEach((card) => {
      card.hidden = selectedCategory !== 'all'
        && card.dataset.projectCategory !== selectedCategory;
    });

    updateSingleProjectTimeline();

    const targetLeft = selectedButton.offsetLeft
      - ((filters.clientWidth - selectedButton.offsetWidth) / 2);
    if (typeof filters.scrollTo === 'function') {
      filters.scrollTo({ left: targetLeft, behavior: 'smooth' });
    } else {
      filters.scrollLeft = targetLeft;
    }
  });
})();
