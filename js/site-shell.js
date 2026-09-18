(function () {
  const pages = {
    news: 'blog.html',
    projects: 'projects.html',
    services: 'price-list.html',
    about: 'about.html'
  };

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
            <a class="site-logo" href="index.html" aria-label="Александр Гусев — главная"><img class="site-logo__image" src="img/icons/Logo.svg" width="198" height="51" alt="" decoding="sync" fetchpriority="high"></a>
            <button class="site-menu-button" type="button" aria-expanded="false" aria-controls="site-navigation">
              <span class="site-menu-button__label">Меню</span><span class="site-menu-button__icon" aria-hidden="true"></span>
            </button>
            <nav class="site-nav" id="site-navigation" aria-label="Разделы сайта">
              <a href="${pages.news}" ${active === pages.news ? 'aria-current="page"' : ''}>Новости</a>
              <a href="${pages.projects}" ${active === pages.projects ? 'aria-current="page"' : ''}>Работы</a>
              <a href="${pages.services}" ${active === pages.services ? 'aria-current="page"' : ''}>Услуги</a>
              <a href="${pages.about}" ${active === pages.about ? 'aria-current="page"' : ''}>Обо мне</a>
            </nav>
          </div>
        </header>`;

      const button = this.querySelector('.site-menu-button');
      const nav = this.querySelector('.site-nav');
      const close = () => {
        button.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      };
      button.addEventListener('click', () => {
        const opening = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(opening));
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
})();
