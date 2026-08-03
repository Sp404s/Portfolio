(() => {
  const page = document.querySelector('body.keycap-page');
  if (!page) return;

  const sections = page.querySelectorAll('.new-project-page > .new-project-section');
  const videoSection = sections[1];
  const resultSection = sections[2];
  const resultCopy = resultSection?.querySelector('.new-project-section__copy--right');

  if (!videoSection || !resultSection || !resultCopy) return;

  resultSection.remove();
  resultCopy.classList.add('keycap-result-copy');
  videoSection.append(resultCopy);
})();
