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

  const applyProjectFilter = (selectedButton) => {
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
    filters.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  window.applyProjectFilter = applyProjectFilter;

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

  function updateSingleProjectTimeline() {
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
  }

  updateSingleProjectTimeline();
  window.addEventListener('resize', updateSingleProjectTimeline);

  filters.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    if (filters.scrollWidth <= filters.clientWidth) return;

    filters.scrollLeft += event.deltaY;
    event.preventDefault();
  }, { passive: false });

})();
