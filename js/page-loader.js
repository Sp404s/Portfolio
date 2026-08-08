(() => {
  const loader = document.querySelector('[data-site-loader]');
  const loaderText = loader?.querySelector('[data-loader-text]');

  if (!loader) return;

  let isHidden = loader.classList.contains('is-hidden');
  let textTimer = 0;
  let failSafeTimer = 0;
  let isNavigating = false;
  const navigationTransitionTime = 340;
  const initialRevealDelay = 120;
  const maximumLoaderTime = 1800;

  const animateLoaderText = () => {
    if (!loaderText) return;

    const phrase = loaderText.dataset.text || '...кря?';
    let index = 0;

    const step = () => {
      if (isHidden) return;

      if (index < phrase.length) {
        loaderText.textContent = phrase.slice(0, index + 1);
        index += 1;
        textTimer = window.setTimeout(step, 150);
        return;
      }

      textTimer = window.setTimeout(() => {
        index = 0;
        loaderText.textContent = '';
        step();
      }, 650);
    };

    window.clearTimeout(textTimer);
    loaderText.textContent = '';
    step();
  };

  const showLoader = () => {
    isHidden = false;
    loader.classList.remove('is-hidden');
    animateLoaderText();
  };

  const hideLoader = () => {
    if (isHidden) return;

    isHidden = true;
    window.clearTimeout(textTimer);
    window.clearTimeout(failSafeTimer);
    loader.classList.add('is-hidden');
  };

  const revealPage = () => {
    window.requestAnimationFrame(() => {
      window.setTimeout(hideLoader, initialRevealDelay);
    });
  };

  const isInternalNavigation = (link) => {
    if (link.hasAttribute('download') || link.target === '_blank') return false;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;

    const target = new URL(link.href, window.location.href);
    return target.origin === window.location.origin
      && (target.pathname !== window.location.pathname || target.search !== window.location.search);
  };

  const navigateWithLoader = (link) => {
    if (isNavigating) return;

    isNavigating = true;
    showLoader();
    window.setTimeout(() => {
      window.location.href = link.href;
    }, navigationTransitionTime);
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = event.target.closest('a[href]');
    if (link && isInternalNavigation(link)) {
      event.preventDefault();
      navigateWithLoader(link);
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      showLoader();
      revealPage();
    }
  });

  showLoader();
  failSafeTimer = window.setTimeout(hideLoader, maximumLoaderTime);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealPage, { once: true });
  } else {
    revealPage();
  }
})();
