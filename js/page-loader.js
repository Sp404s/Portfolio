let loadingFinished = false;

const finishPageLoading = () => {
  if (loadingFinished) return;
  loadingFinished = true;

  window.setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-loaded');
  }, 220);
};

document.body.classList.add('is-loading');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', finishPageLoading, { once: true });
} else {
  finishPageLoading();
}
