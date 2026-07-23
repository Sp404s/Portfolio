const homeTrack = document.querySelector('[data-home-track]');
const homePage = document.querySelector('.home-page');
const projectCards = Array.from(document.querySelectorAll('.home-project-card'));
const timelineThumb = document.querySelector('[data-timeline-thumb]');
const shouldOpenProjects = window.location.hash === '#projects';

if (shouldOpenProjects && homePage) {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
}

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
});

const initBlurHeroText = () => {
  const elements = document.querySelectorAll('[data-blur-text]');

  elements.forEach((element, elementIndex) => {
    const words = (element.textContent || '').trim().split(/\s+/);
    element.textContent = '';
    element.classList.add('blur-text');

    words.forEach((word, wordIndex) => {
      const span = document.createElement('span');
      span.className = 'blur-text__word';
      span.textContent = word;
      span.style.setProperty('--blur-delay', `${elementIndex * 220 + wordIndex * 160}ms`);
      element.append(span);

      if (wordIndex < words.length - 1) {
        element.append(document.createTextNode('\u00A0'));
      }
    });
  });

  window.setTimeout(() => {
    elements.forEach((element) => element.classList.add('is-visible'));
  }, 80);
};

let currentX = 0;
let targetX = 0;
let maxX = 0;
let activeProjectIndex = -1;
let wheelLocked = false;
let projectsStarted = false;
let wheelGestureTimer = null;

const lockWheelGesture = () => {
  wheelLocked = true;
  window.clearTimeout(wheelGestureTimer);
  wheelGestureTimer = window.setTimeout(() => {
    wheelLocked = false;
  }, 180);
};

const resetNativeScroll = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollLeft = 0;
  document.body.scrollLeft = 0;
};

const isHomeHorizontal = () => (
  Boolean(homeTrack)
  && window.matchMedia('(min-width: 769px)').matches
  && !homePage?.classList.contains('is-intro')
);

const setActiveProject = (index) => {
  if (!projectCards[index] || activeProjectIndex === index) return;

  activeProjectIndex = index;
  projectCards.forEach((card, cardIndex) => {
    card.classList.toggle('is-active', cardIndex === index);
  });

  if (timelineThumb) {
    const progress = projectCards.length > 1 ? index / (projectCards.length - 1) : 0;
    timelineThumb.textContent = projectCards[index].dataset.projectYear || '';
    timelineThumb.style.left = `${progress * 100}%`;
    timelineThumb.classList.add('is-visible');
  }
};

const updateHomeLimits = () => {
  if (!homeTrack || !isHomeHorizontal()) return;

  maxX = Math.max(0, homeTrack.scrollWidth - window.innerWidth);
  currentX = Math.min(currentX, maxX);
  targetX = Math.min(targetX, maxX);
};

const scrollHomeTo = (nextX) => {
  updateHomeLimits();
  targetX = Math.max(0, Math.min(nextX, maxX));
};

const enterProjects = (immediate = false) => {
  const projectsSection = document.querySelector('#projects');
  if (!projectsSection || !isHomeHorizontal()) return;

  projectsStarted = true;
  setActiveProject(0);

  window.requestAnimationFrame(() => {
    updateHomeLimits();
    const nextPosition = Math.max(0, Math.min(projectsSection.offsetLeft, maxX));

    if (immediate) {
      currentX = nextPosition;
      targetX = nextPosition;
      homeTrack.style.transform = `translateX(${-currentX}px)`;
      document.documentElement.classList.remove('open-projects');
      return;
    }

    scrollHomeTo(nextPosition);
  });
};

const getCardFocusPosition = (card) => {
  const rect = card.getBoundingClientRect();
  return currentX + rect.left + rect.width / 2 - window.innerWidth / 2;
};

const focusProject = (index, immediate = false) => {
  const card = projectCards[index];
  if (!card || !isHomeHorizontal()) return;

  projectsStarted = true;
  setActiveProject(index);
  window.requestAnimationFrame(() => {
    updateHomeLimits();
    const nextPosition = Math.max(0, Math.min(getCardFocusPosition(card), maxX));

    if (immediate) {
      currentX = nextPosition;
      targetX = nextPosition;
      homeTrack.style.transform = `translateX(${-currentX}px)`;
      return;
    }

    scrollHomeTo(nextPosition);
  });
};

const updateHorizontalActiveProject = () => {
  if (!isHomeHorizontal() || !projectCards.length) return;

  let nearestIndex = activeProjectIndex;
  let nearestDistance = Number.POSITIVE_INFINITY;

  projectCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2);

    if (rect.right > 0 && rect.left < window.innerWidth && distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  });

  if (nearestDistance < window.innerWidth * 0.36) setActiveProject(nearestIndex);
};

const scrollHomeToProjects = (isInitialLoad = false) => {
  enterProjects(isInitialLoad);
};

const animateHomeTrack = () => {
  if (homeTrack && isHomeHorizontal()) {
    updateHomeLimits();
    currentX += (targetX - currentX) * 0.12;

    if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;
    homeTrack.style.transform = `translateX(${-currentX}px)`;
  }

  requestAnimationFrame(animateHomeTrack);
};

const updateMobileActiveProject = () => {
  if (isHomeHorizontal() || !projectCards.length) return;

  const projectsSection = document.querySelector('#projects');
  if (projectsSection && homePage) {
    const sectionTop = projectsSection.getBoundingClientRect().top;
    homePage.classList.toggle('has-projects-timeline', sectionTop <= window.innerHeight * 0.8);
  }

  let nearestIndex = activeProjectIndex;
  let nearestDistance = Number.POSITIVE_INFINITY;

  projectCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);

    if (rect.bottom > 0 && rect.top < window.innerHeight && distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  });

  if (nearestDistance < window.innerHeight * 0.32) setActiveProject(nearestIndex);
};

window.addEventListener('load', () => {
  initBlurHeroText();
  setActiveProject(0);

  if (shouldOpenProjects) {
    resetNativeScroll();
    homePage?.classList.remove('is-intro');
    homePage?.classList.add('is-ready');
    window.setTimeout(() => scrollHomeToProjects(true), 80);
  }

  window.setTimeout(() => {
    homePage?.classList.remove('is-intro');
    homePage?.classList.add('is-ready');
    updateHomeLimits();
  }, 500);
});

window.addEventListener('resize', () => {
  updateHomeLimits();
  if (isHomeHorizontal() && projectsStarted) focusProject(activeProjectIndex, true);
});

window.addEventListener('scroll', updateMobileActiveProject, { passive: true });

window.addEventListener('wheel', (event) => {
  if (!isHomeHorizontal()) return;

  event.preventDefault();
  if (wheelLocked) {
    lockWheelGesture();
    return;
  }

  const direction = event.deltaY > 0 ? 1 : -1;
  if (direction < 0 && projectsStarted && activeProjectIndex === 0) {
    projectsStarted = false;
    targetX = 0;
    lockWheelGesture();
    return;
  }

  if (direction > 0 && !projectsStarted) {
    lockWheelGesture();
    enterProjects();
    return;
  }

  const nextIndex = Math.max(0, Math.min(projectCards.length - 1, activeProjectIndex + direction));

  if (nextIndex === activeProjectIndex) return;

  lockWheelGesture();
  focusProject(nextIndex);
}, { passive: false });

document.querySelectorAll('[data-home-scroll="projects"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!isHomeHorizontal()) return;

    event.preventDefault();
    resetNativeScroll();
    homePage?.classList.remove('is-intro');
    homePage?.classList.add('is-ready');
    scrollHomeToProjects(true);
    window.history.replaceState(null, '', '#projects');
  });
});

animateHomeTrack();
