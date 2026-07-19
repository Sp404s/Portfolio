const homeTrack = document.querySelector('[data-home-track]');
const homePage = document.querySelector('.home-page');
const projectCards = Array.from(document.querySelectorAll('.home-project-card'));
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

const setProjectCardVisible = (card, isVisible) => {
  card.classList.toggle('is-visible', isVisible);
};

const updateProjectCardsVisibility = () => {
  if (!projectCards.length || !isHomeHorizontal()) return;

  projectCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const inRevealZone = rect.left < window.innerWidth * 0.9 && rect.right > window.innerWidth * 0.08;

    setProjectCardVisible(card, inRevealZone);
  });
};

const initProjectCardsReveal = () => {
  if (!projectCards.length) return;

  if (!('IntersectionObserver' in window)) {
    projectCards.forEach((card) => setProjectCardVisible(card, true));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      setProjectCardVisible(entry.target, entry.isIntersecting);
    });
  }, {
    root: null,
    threshold: 0.18,
    rootMargin: '0px 0px -8% 0px'
  });

  projectCards.forEach((card) => observer.observe(card));
};

const updateHomeLimits = () => {
  if (!homeTrack || !isHomeHorizontal()) {
    currentX = 0;
    targetX = 0;
    if (homeTrack) homeTrack.style.transform = 'translateX(0)';
    return;
  }

  maxX = Math.max(0, homeTrack.scrollWidth - window.innerWidth);
  currentX = Math.min(currentX, maxX);
  targetX = Math.min(targetX, maxX);
};

const scrollHomeTo = (nextX) => {
  if (!homeTrack || !isHomeHorizontal()) return;

  updateHomeLimits();
  targetX = Math.max(0, Math.min(nextX, maxX));
};

const scrollHomeToProjects = () => {
  const projectsSection = document.querySelector('#projects');

  if (!projectsSection) return;

  scrollHomeTo(projectsSection.offsetLeft);
};

const animateHomeTrack = () => {
  if (homeTrack && isHomeHorizontal()) {
    currentX += (targetX - currentX) * 0.12;

    if (Math.abs(targetX - currentX) < 0.1) {
      currentX = targetX;
    }

    homeTrack.style.transform = `translateX(${-currentX}px)`;
    updateProjectCardsVisibility();
  }

  requestAnimationFrame(animateHomeTrack);
};

window.addEventListener('load', () => {
  initBlurHeroText();
  initProjectCardsReveal();

  if (shouldOpenProjects) {
    resetNativeScroll();
  }

  window.setTimeout(() => {
    homePage?.classList.remove('is-intro');
    homePage?.classList.add('is-ready');
    updateHomeLimits();
    updateProjectCardsVisibility();

    if (shouldOpenProjects) {
      resetNativeScroll();
      scrollHomeToProjects();
    }
  }, 500);

  updateHomeLimits();
});

window.addEventListener('resize', updateHomeLimits);

window.addEventListener('wheel', (event) => {
  if (!isHomeHorizontal()) return;

  event.preventDefault();
  targetX += event.deltaY;
  targetX = Math.max(0, Math.min(targetX, maxX));
}, { passive: false });

document.querySelectorAll('[data-home-scroll="projects"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (!isHomeHorizontal()) return;

    event.preventDefault();
    resetNativeScroll();
    scrollHomeToProjects();
    window.history.replaceState(null, '', '#projects');
  });
});

updateHomeLimits();
animateHomeTrack();
