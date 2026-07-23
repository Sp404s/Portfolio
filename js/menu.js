const menuToggle = document.querySelector('[data-menu-toggle]');
const siteHeader = document.querySelector('.header');

if (menuToggle && siteHeader) {
  const closeMenu = () => {
    siteHeader.classList.remove('is-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('is-menu-open');

    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  siteHeader.querySelectorAll('.nav a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.getAttribute('href')?.includes('#projects')
        && window.matchMedia('(max-width: 768px)').matches) {
        closeMenu();
        return;
      }

      closeMenu();
    });
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 901px)').matches) {
      closeMenu();
    }
  });
}
