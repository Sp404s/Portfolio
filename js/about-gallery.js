const aboutGallery = document.querySelector('[data-about-gallery]');

if (aboutGallery) {
  const galleryImages = Array.from(aboutGallery.querySelectorAll('img'));
  let activeIndex = galleryImages.findIndex((image) => image.classList.contains('is-active'));

  if (activeIndex < 0) activeIndex = 0;

  window.setInterval(() => {
    galleryImages[activeIndex].classList.remove('is-active');
    activeIndex = (activeIndex + 1) % galleryImages.length;
    galleryImages[activeIndex].classList.add('is-active');
  }, 3000);
}
