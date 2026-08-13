(() => {
  const desktopWorkspace = window.matchMedia('(min-width: 769px) and (pointer: fine)');
  const horizontal = document.querySelector('[data-home-horizontal]');
  const track = document.querySelector('[data-home-track]');
  const projects = document.querySelector('#projects');
  const cards = projects ? Array.from(projects.querySelectorAll('.home-project-card')) : [];
  const projectTitle = document.querySelector('.home-projects__title');
  const timeline = document.querySelector('[data-home-timeline]');
  const timelineThumb = document.querySelector('[data-timeline-thumb]');
  const timelineYear = document.querySelector('[data-timeline-year]');

  const initializeMobileTimeline = () => {
    if (desktopWorkspace.matches || !projects || !timeline || !timelineThumb || cards.length < 2) return;

    let frame = 0;
    let dragging = false;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const getVisibleCards = () => cards.filter((card) => !card.hidden);

    const syncMobileTimelineHeight = () => {
      const visibleCards = getVisibleCards();
      if (!visibleCards.length) return;
      const projectRect = projects.getBoundingClientRect();
      const firstCardRect = visibleCards[0].getBoundingClientRect();
      const lastCardRect = visibleCards[visibleCards.length - 1].getBoundingClientRect();
      const timelineTop = firstCardRect.top - projectRect.top;
      const targetHeight = Math.max(0, lastCardRect.bottom - firstCardRect.top);

      timeline.style.setProperty('top', `${timelineTop}px`, 'important');
      timeline.style.setProperty('bottom', 'auto', 'important');
      timeline.style.setProperty('height', `${targetHeight}px`, 'important');
      timeline.style.setProperty(
        '--mobile-timeline-line-height',
        `${targetHeight}px`,
      );
    };

    const getCardPageTop = (card) => card.getBoundingClientRect().top + window.scrollY;

    const getScrollRange = () => {
      const visibleCards = getVisibleCards();
      const firstTop = getCardPageTop(visibleCards[0]);
      const lastTop = getCardPageTop(visibleCards[visibleCards.length - 1]);
      const anchor = 120;

      return {
        start: firstTop - anchor,
        end: Math.max(firstTop - anchor, lastTop - anchor),
      };
    };

    const updateTimeline = () => {
      frame = 0;
      const visibleCards = getVisibleCards();
      if (!visibleCards.length) return;
      const range = getScrollRange();
      const progress = range.end === range.start
        ? 0
        : clamp((window.scrollY - range.start) / (range.end - range.start), 0, 1);
      const timelineHeight = timeline.clientHeight;
      const thumbTop = progress * timelineHeight;
      const index = Math.min(visibleCards.length - 1, Math.round(progress * (visibleCards.length - 1)));

      timelineThumb.style.top = `${thumbTop}px`;
      timelineYear?.style.setProperty('top', `${thumbTop}px`);
      timelineThumb.dataset.year = visibleCards[index]?.dataset.projectYear || '';
      if (timelineYear) timelineYear.textContent = visibleCards[index]?.dataset.projectYear || '';
    };

    const requestTimelineUpdate = () => {
      if (projects.classList.contains('has-single-project')) return;
      syncMobileTimelineHeight();
      if (!frame) frame = window.requestAnimationFrame(updateTimeline);
    };

    const scrollFromPointer = (clientY) => {
      const rect = timeline.getBoundingClientRect();
      const progress = clamp(
        (clientY - rect.top - (timelineThumb.offsetHeight / 2))
          / Math.max(1, rect.height - timelineThumb.offsetHeight),
        0,
        1,
      );
      const range = getScrollRange();
      window.scrollTo(0, range.start + ((range.end - range.start) * progress));
      updateTimeline();
    };

    timelineThumb.addEventListener('pointerdown', (event) => {
      dragging = true;
      timelineThumb.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      scrollFromPointer(event.clientY);
    });

    timelineThumb.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      event.preventDefault();
      scrollFromPointer(event.clientY);
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      timelineThumb.releasePointerCapture?.(event.pointerId);
    };

    timelineThumb.addEventListener('pointerup', stopDragging);
    timelineThumb.addEventListener('pointercancel', stopDragging);
    window.addEventListener('scroll', requestTimelineUpdate, { passive: true });
    window.addEventListener('resize', requestTimelineUpdate);
    window.addEventListener('load', requestTimelineUpdate, { once: true });
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(requestTimelineUpdate);
      observer.observe(projects);
    }
    requestTimelineUpdate();
  };

  if (!desktopWorkspace.matches || !horizontal || !track || !projects || cards.length < 2) {
    initializeMobileTimeline();
    return;
  }

  let activePanel = 'hero';
  let locked = false;
  let frame = 0;
  let timelineFrame = 0;
  let timelineCurrent = 0;
  let activeCardIndex = 0;

  const ease = (value) => value * value * (3 - (2 * value));

  const animateValue = (from, to, duration, update, done) => {
    cancelAnimationFrame(frame);
    const started = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      update(from + ((to - from) * ease(progress)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
        done?.();
      }
    };

    frame = requestAnimationFrame(tick);
  };

  const setPanel = (panel, animate = true) => {
    const target = panel === 'projects' ? -window.innerWidth : 0;
    const start = activePanel === 'projects' ? -window.innerWidth : 0;

    activePanel = panel;
    if (!animate) {
      track.style.setProperty('transform', `translate3d(${target}px, 0, 0)`, 'important');
      locked = false;
      return;
    }

    animateValue(start, target, 650, (value) => {
      track.style.setProperty('transform', `translate3d(${value}px, 0, 0)`, 'important');
    }, () => {
      track.style.setProperty('transform', `translate3d(${target}px, 0, 0)`, 'important');
      locked = false;
    });
  };

  const syncTimelineGeometry = () => {
    if (!timeline || cards.length < 2) return;

    const firstCard = cards[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const cardStep = cards[1].offsetLeft - cards[0].offsetLeft;
    const gap = Math.max(0, cardStep - cardWidth);
    const width = (cardWidth * cards.length) + (gap * (cards.length - 1));

    timeline.style.left = `${firstCard.offsetLeft}px`;
    timeline.style.right = 'auto';
    timeline.style.width = `${width}px`;
    timeline.style.setProperty('--timeline-inset', `${cardWidth / 2}px`);
  };

  const getTimelineLeft = (index, scrollLeft = projects.scrollLeft) => {
    if (!timeline) return 0;

    const currentScrollLeft = projects.scrollLeft;
    projects.scrollLeft = scrollLeft;
    const cardRect = cards[index].getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();
    projects.scrollLeft = currentScrollLeft;

    return cardRect.left - timelineRect.left + (cardRect.width / 2);
  };

  const setTimelinePosition = (target, animate = true) => {
    if (!timelineThumb) return;

    cancelAnimationFrame(timelineFrame);
    if (!animate) {
      timelineCurrent = target;
      timeline.style.setProperty('--timeline-left', `${target}px`);
      return;
    }

    const start = timelineCurrent;
    const started = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 350);
      timelineCurrent = start + ((target - start) * ease(progress));
      timeline.style.setProperty('--timeline-left', `${timelineCurrent}px`);

      if (progress < 1) {
        timelineFrame = requestAnimationFrame(tick);
      } else {
        timelineFrame = 0;
        timelineCurrent = target;
      }
    };

    timelineFrame = requestAnimationFrame(tick);
  };

  const updateYear = (index, timelineLeft, animate = true) => {
    if (!timelineThumb) return;
    activeCardIndex = index;
    const year = cards[index]?.dataset.projectYear || '';
    timelineThumb.dataset.year = year;
    if (timelineYear) timelineYear.textContent = year;
    setTimelinePosition(timelineLeft ?? getTimelineLeft(index), animate);
  };

  const animateCards = (from, to) => {
    animateValue(from, to, 420, (value) => {
      projects.scrollLeft = value;
    }, () => {
      projects.scrollLeft = to;
      locked = false;
    });
  };

  const moveCards = (direction) => {
    const step = (cards[0].getBoundingClientRect().width || 0) + 20;
    const visibleCards = Math.max(1, Math.floor((projects.clientWidth - 200 + 20) / step));
    const nextIndex = Math.max(0, Math.min(activeCardIndex + direction, cards.length - 1));

    if (nextIndex === activeCardIndex) return false;

    const shiftCards = Math.max(
      0,
      Math.min(nextIndex - (visibleCards - 1), cards.length - visibleCards),
    );
    const current = projects.scrollLeft;
    const maxScrollLeft = Math.max(0, projects.scrollWidth - projects.clientWidth);
    const target = Math.min(shiftCards * step, maxScrollLeft);

    syncTimelineGeometry();
    updateYear(nextIndex, getTimelineLeft(nextIndex, target));
    animateCards(current, target);
    return true;
  };

  const syncProjectTitle = () => {
    if (!projectTitle) return;
    projectTitle.style.transform = `translate3d(${projects.scrollLeft}px, 0, 0)`;
  };

  projects.addEventListener('scroll', syncProjectTitle, { passive: true });

  window.addEventListener('wheel', (event) => {
    if (!desktopWorkspace.matches || Math.abs(event.deltaY) <= Math.abs(event.deltaX) || locked) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    event.preventDefault();
    locked = true;

    if (activePanel === 'hero' && direction > 0) {
      setPanel('projects');
      return;
    }

    if (activePanel === 'projects') {
      if (direction < 0 && activeCardIndex === 0 && projects.scrollLeft <= 1) {
        setPanel('hero');
        return;
      }

      if (moveCards(direction)) return;
    }

    locked = false;
  }, { passive: false });

  syncTimelineGeometry();
  updateYear(0, getTimelineLeft(0), false);
  syncProjectTitle();
  track.style.setProperty('transform', 'translate3d(0, 0, 0)', 'important');

  window.addEventListener('resize', () => {
    syncTimelineGeometry();
    updateYear(activeCardIndex, getTimelineLeft(activeCardIndex), false);
    syncProjectTitle();
  });

  const projectsRequested = () => {
    const query = new URLSearchParams(window.location.search);
    return window.location.hash === '#projects' || query.get('section') === 'projects';
  };

  const openProjectsFromLocation = () => {
    if (!projectsRequested() || activePanel === 'projects') return;

    const resetHashScroll = () => {
      horizontal.scrollLeft = 0;
      projects.scrollLeft = 0;
      syncProjectTitle();
    };

    resetHashScroll();
    setPanel('projects', false);
    window.requestAnimationFrame(resetHashScroll);
    window.setTimeout(resetHashScroll, 80);
  };

  window.addEventListener('hashchange', openProjectsFromLocation);
  window.addEventListener('popstate', openProjectsFromLocation);
  openProjectsFromLocation();
})();
