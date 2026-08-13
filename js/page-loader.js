(() => {
  const loader = document.querySelector('[data-site-loader]');
  const loaderText = loader?.querySelector('[data-loader-text]');

  if (!loader) return;

  let isHidden = loader.classList.contains('is-hidden');
  let textTimer = 0;
  let failSafeTimer = 0;
  const initialRevealDelay = 120;
  const maximumLoaderTime = 1200;

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

  window.addEventListener('pageshow', () => {
    hideLoader();
  });

  showLoader();
  failSafeTimer = window.setTimeout(hideLoader, maximumLoaderTime);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealPage, { once: true });
  } else {
    revealPage();
  }
})();
