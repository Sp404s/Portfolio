(function () {
  const pages = {
    home: 'index.html',
    news: 'blog.html',
    projects: 'projects.html',
    services: 'price-list.html',
    about: 'about.html'
  };

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5v-6h-4v6h-5a1 1 0 0 1-1-1z"/></svg>',
    news: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h11a2 2 0 0 1 2 2v15H6a2 2 0 0 1-2-2v-14a1 1 0 0 1 1-1Z"/><path d="M8 8h6M8 12h6M8 16h4M18 7h2v11.5a2 2 0 0 1-2 2"/></svg>',
    projects: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
    services: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>',
    about: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4.2 3-6.5 7-6.5s6.5 2.3 7 6.5"/></svg>'
  };

  const navigation = [
    ['home', 'Главная'],
    ['news', 'Новости'],
    ['projects', 'Работы'],
    ['services', 'Услуги'],
    ['about', 'Обо мне']
  ];

  const currentFile = () => {
    const file = window.location.pathname.split('/').pop() || 'index.html';
    if (file.startsWith('project')) return 'projects.html';
    return file;
  };

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';
      const active = currentFile();
      this.innerHTML = `
        <a class="skip-link" href="#main-content">Перейти к содержанию</a>
        <header class="site-header" aria-label="Основная навигация">
          <div class="site-header__inner">
            <a class="site-logo" href="index.html" aria-label="Александр Гусев — главная"><img class="site-logo__image" src="img/icons/favicon.png" width="128" height="128" alt="" decoding="sync" fetchpriority="high"></a>
            <button class="site-menu-button" type="button" aria-expanded="false" aria-controls="site-navigation" aria-label="Открыть меню">
              <span class="site-menu-button__label">Меню</span><span class="site-menu-button__icon" aria-hidden="true"></span>
            </button>
            <nav class="site-nav" id="site-navigation" aria-label="Разделы сайта">
              ${navigation.map(([key, label]) => `<a href="${pages[key]}" ${active === pages[key] ? 'aria-current="page"' : ''} aria-label="${label}">${icons[key]}<span class="site-nav__label">${label}</span></a>`).join('')}
            </nav>
          </div>
        </header>`;

      const button = this.querySelector('.site-menu-button');
      const nav = this.querySelector('.site-nav');
      const close = () => {
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Открыть меню');
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      };
      button.addEventListener('click', () => {
        const opening = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(opening));
        button.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
        nav.classList.toggle('is-open', opening);
        document.body.classList.toggle('menu-open', opening);
      });
      nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768) close();
      });
    }
  }

  class SiteFooter extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';
      this.innerHTML = `
        <footer class="site-footer">
          <div class="site-footer__inner">
            <div class="site-footer__intro">
              <a class="site-logo" href="index.html" aria-label="Александр Гусев — главная"><img class="site-logo__image" src="img/icons/Logo.svg" width="198" height="51" alt="" loading="lazy" decoding="async"></a>
              <p>3D‑графика, визуализация и дизайн.<br>Работаю как самозанятый.</p>
            </div>
            <div class="site-footer__contacts">
              <span class="site-footer__title">Связаться</span>
              <a href="mailto:0Alex0G0@gmail.com">0Alex0G0@gmail.com</a>
              <a href="tel:+79818081622">+7 981 808-16-22</a>
              <div><a href="https://t.me/Alex_G8" target="_blank" rel="noopener noreferrer">Telegram</a> · <a href="https://vk.com/3funnydays" target="_blank" rel="noopener noreferrer">VK</a></div>
            </div>
            <div class="site-footer__legal">
              <span class="site-footer__title">Документы</span>
              <a href="privacy.html">Политика конфиденциальности</a>
              <a href="personal-data-consent.html">Обработка персональных данных</a>
              <a href="cookies.html">Файлы cookie</a>
              <a href="offer.html">Публичная оферта</a>
            </div>
          </div>
          <div class="site-footer__bottom"><span>© ${new Date().getFullYear()} Александр Гусев</span><span>ИНН 470520940158</span></div>
        </footer>`;
    }
  }

  if (!customElements.get('site-header')) customElements.define('site-header', SiteHeader);
  if (!customElements.get('site-footer')) customElements.define('site-footer', SiteFooter);

  const homePanels = Array.from(document.querySelectorAll('.portfolio-panel'));
  if (homePanels.length) {
    document.documentElement.classList.add('home-scroll-motion');
    if ('IntersectionObserver' in window) {
      const panelObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-in-view', entry.isIntersecting && entry.intersectionRatio >= 0.48);
        });
      }, { threshold: [0.2, 0.48, 0.72], rootMargin: '-72px 0px 0px 0px' });
      homePanels.forEach((panel) => panelObserver.observe(panel));
    } else {
      homePanels.forEach((panel) => panel.classList.add('is-in-view'));
    }
  }
})();
