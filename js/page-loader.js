const finishPageLoading = () => {
  window.setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  }, 450);
};

document.body.classList.add('is-loading');

if (document.readyState === 'complete') {
  finishPageLoading();
} else {
  window.addEventListener('load', finishPageLoading, { once: true });
}
