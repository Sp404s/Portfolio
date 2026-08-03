(() => {
  const page = document.querySelector('body.project-page');
  if (!page) return;

  page.classList.add('wallpaper-page');

  const containers = page.querySelectorAll(
    '.new-project-gallery figure'
  );

  containers.forEach((container) => {
    const image = container.querySelector('img');
    if (!image || container.querySelector('.project-image-download')) return;

    const download = document.createElement('a');
    const source = image.currentSrc || image.getAttribute('src');
    const filename = source.split('/').pop().replace(/%20/g, ' ');

    download.className = 'project-image-download';
    download.href = source;
    download.download = filename;
    download.textContent = 'Скачать';
    download.setAttribute('aria-label', `Скачать ${image.alt || 'изображение'}`);
    container.append(download);
  });
})();
