(() => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const header = toggle?.closest('.header');

  if (!toggle || !header) return;

  const closeMenu = () => {
    header.classList.remove('is-menu-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
  };

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-menu-open');
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });

  header.querySelectorAll('.nav-static a:not(.logo)').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });

  const requestedSection = new URLSearchParams(window.location.search).get('section');
  if (requestedSection === 'projects' && window.matchMedia('(max-width: 768px)').matches) {
    const scrollToProjects = () => {
      document.querySelector('#projects')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', scrollToProjects, { once: true });
    } else {
      window.requestAnimationFrame(scrollToProjects);
    }
  }
})();

document.addEventListener('dragstart', (event) => {
  if (event.target instanceof HTMLImageElement) event.preventDefault();
});

(() => {
  const updateContactLinks = () => {
    const isHome = document.body.classList.contains('home-page');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const target = isHome && isMobile ? '#contacts' : 'about.html#contacts';

    document.querySelectorAll('.nav-static a, .home-nav-redesign a').forEach((link) => {
      if (link.textContent.trim().toUpperCase() === 'КОНТАКТЫ') {
        link.setAttribute('href', target);
      }
    });
  };

  updateContactLinks();
  window.addEventListener('resize', updateContactLinks);
})();
