(() => {
  const loader = document.querySelector('[data-site-loader]');
  const loaderText = loader?.querySelector('[data-loader-text]');

  if (!loader) return;

  let isHidden = false;
  let textTimer = 0;
  const startedAt = performance.now();
  const minimumVisibleTime = 1500;
  const maximumWaitingTime = 6000;
  const exitDuration = 1100;

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

    loaderText.textContent = '';
    step();
  };

  const hideLoader = () => {
    if (isHidden) return;

    isHidden = true;
    window.clearTimeout(textTimer);
    loader.classList.add('is-leaving');

    window.setTimeout(() => {
      loader.classList.add('is-hidden');
      loader.classList.remove('is-leaving');
      loader.setAttribute('aria-hidden', 'true');
    }, exitDuration);
  };

  const waitForWindowLoad = new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }
    window.addEventListener('load', resolve, { once: true });
  });

  const waitForFonts = document.fonts?.ready?.catch(() => undefined) || Promise.resolve();
  const waitForPage = Promise.all([waitForWindowLoad, waitForFonts]);
  const failSafe = new Promise((resolve) => window.setTimeout(resolve, maximumWaitingTime));

  const revealPage = async () => {
    await Promise.race([waitForPage, failSafe]);
    const remainingTime = Math.max(0, minimumVisibleTime - (performance.now() - startedAt));
    window.setTimeout(() => window.requestAnimationFrame(hideLoader), remainingTime);
  };

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) hideLoader();
  });

  loader.classList.remove('is-hidden', 'is-leaving');
  loader.removeAttribute('aria-hidden');
  animateLoaderText();
  revealPage();
})();
