const projectSections = Array.from(document.querySelectorAll('.project-section'));
const standaloneItems = Array.from(document.querySelectorAll('.city-video, .project-slider'));

const setRevealState = (elements, state) => {
  elements.forEach((element) => {
    element.classList.toggle('is-visible', state === 'visible');
    element.classList.toggle('is-past', state === 'past');
  });
};

const getSectionItems = (section) => Array.from(section.querySelectorAll(
  ':scope > .project-copy, :scope > .project-image'
));

const setDirection = (element) => {
  const isLeftSide = /--left|--square/.test(element.className);

  element.classList.add('project-reveal-item');
  element.classList.toggle('from-left', isLeftSide);
  element.classList.toggle('from-right', !isLeftSide);
};

const initProjectReveal = () => {
  const revealGroups = projectSections.map((section) => ({
    trigger: section,
    items: getSectionItems(section)
  })).concat(standaloneItems.map((element) => ({
    trigger: element,
    items: [element]
  })));

  if (!revealGroups.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || !('IntersectionObserver' in window)) {
    revealGroups.forEach(({ items }) => setRevealState(items, 'visible'));
    return;
  }

  revealGroups.forEach(({ items }) => {
    items.forEach((element) => {
      setDirection(element);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const group = revealGroups.find(({ trigger }) => trigger === entry.target);

      if (!group) return;

      if (entry.isIntersecting) {
        setRevealState(group.items, 'visible');
        return;
      }

      setRevealState(group.items, entry.boundingClientRect.top < 0 ? 'past' : 'hidden');
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -10% 0px'
  });

  revealGroups.forEach(({ trigger }) => observer.observe(trigger));
};

initProjectReveal();
