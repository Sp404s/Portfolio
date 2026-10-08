(function () {
  const projects = [
    {
      id: 'lighthouse',
      title: 'Маяк',
      category: 'visual',
      categoryLabel: '3D / Визуализация',
      year: '2026',
      role: 'Концепция · Моделирование · Свет',
      cover: 'img/projects/Обои для телефона/маяк рендер 1.webp',
      coverPosition: '50% 50%',
      layout: 'featured',
      description: 'Атмосферная серия обоев для телефона. В проекте исследуются масштаб, туман, направленный свет и спокойная кинематографическая композиция.',
      gallery: [
        'img/projects/Обои для телефона/маяк рендер3 .webp',
        'img/projects/Обои для телефона/маяк рендер5 .webp',
        'img/projects/Обои для телефона/наработки по маяку.webp'
      ]
    },
    {
      id: 'cat455',
      title: 'Аудитория 455',
      category: 'interior',
      categoryLabel: '3D / Интерьер',
      year: '2026',
      role: 'Исследование · Планировка · Визуализация',
      cover: 'img/projects/Кафедра ЦАТ (ауд.455)/1.webp',
      coverPosition: '50% 54%',
      description: 'Концепция обновления учебной аудитории кафедры ЦАТ: функциональное зонирование, мебель, освещение и дневные и ночные сценарии пространства.',
      gallery: [
        'img/projects/Кафедра ЦАТ (ауд.455)/red1.webp',
        'img/projects/Кафедра ЦАТ (ауд.455)/6.webp',
        'img/projects/Кафедра ЦАТ (ауд.455)/5_ночь.webp'
      ]
    },
    {
      id: 'fujifilm',
      title: 'Fujifilm X-S10',
      category: '3d',
      categoryLabel: '3D / Предметная графика',
      year: '2026',
      role: 'Моделирование · Материалы · Рендер',
      cover: 'img/projects/Фотоаппарат Fujifilm/cover-render.webp',
      coverPosition: '50% 50%',
      description: 'Детальная предметная модель камеры Fujifilm X-S10. Проект включает моделирование корпуса, настройку материалов и серию студийных рендеров.',
      gallery: [
        'img/projects/Фотоаппарат Fujifilm/render-2.webp',
        'img/projects/Фотоаппарат Fujifilm/render-4.webp',
        'img/projects/Фотоаппарат Fujifilm/render-5.webp'
      ]
    },
    {
      id: 'monopoly',
      title: 'Город «Монополия»',
      category: 'motion',
      categoryLabel: '3D / Анимация',
      year: '2026',
      role: 'Арт-дирекшн · 3D · Анимация',
      cover: 'img/projects/Город монополия/из1.webp',
      coverPosition: '50% 50%',
      description: 'Стилизованный трёхмерный город, собранный на основе визуального языка настольной игры. Серия кадров объединена в короткий анимационный ролик.',
      gallery: [
        'img/projects/Город монополия/из2.webp',
        'img/projects/Город монополия/рен1.webp',
        'img/projects/Город монополия/рен3.webp'
      ]
    },
    {
      id: 'loft-table',
      title: 'Стол LOFT K#1',
      category: 'design',
      categoryLabel: 'Предметный дизайн',
      year: '2026',
      role: 'Концепция · Моделирование · Подача',
      cover: 'img/projects/table-loft/render-1.jpg',
      coverPosition: '50% 52%',
      description: 'Предметный проект журнального стола в индустриальной эстетике. Основное внимание уделено пропорциям, конструкции и выразительности материалов.',
      gallery: [
        'img/projects/table-loft/render-2.webp',
        'img/projects/table-loft/render-3.webp',
        'img/projects/table-loft/texturing-3.webp'
      ]
    },
    {
      id: 'keycap',
      title: 'Keycap-подставка',
      category: 'print',
      categoryLabel: '3D / Печать',
      year: '2026',
      role: 'Моделирование · Прототип · Печать',
      cover: 'img/projects/Keycap подставка/Пнг подставка.webp',
      coverPosition: '50% 50%',
      description: 'Компактная подставка, построенная вокруг формы клавиши. Модель подготовлена для FDM-печати и проверена на физическом прототипе.',
      gallery: ['img/projects/Keycap подставка/Пнг подставка.webp']
    },
    {
      id: 'camera-scifi',
      title: 'Камера SCI-FI',
      category: '3d',
      categoryLabel: '3D / Концепт',
      year: '2025',
      role: 'Дизайн · Hard Surface · Текстуры',
      cover: 'img/projects/Камера sci-fi/ren1.webp',
      coverPosition: '50% 50%',
      layout: 'wide',
      description: 'Фантастическая камера с выразительным силуэтом и функциональной детализацией. Проект прошёл путь от референсов и драфта до high-poly и текстур.',
      gallery: [
        'img/projects/Камера sci-fi/ren2.webp',
        'img/projects/Камера sci-fi/текстурирование6.webp',
        'img/projects/Камера sci-fi/low poly5.webp'
      ]
    },
    {
      id: 'table-scifi',
      title: 'Стол SCI-FI',
      category: '3d',
      categoryLabel: '3D / Industrial',
      year: '2025',
      role: 'Дизайн · Моделирование · Рендер',
      cover: 'img/projects/Стол sci-fi/render-1.webp',
      coverPosition: '50% 50%',
      description: 'Hard-surface объект с технологичным характером. Формообразование основано на сочетании крупных функциональных объёмов и точной деталировки.',
      gallery: [
        'img/projects/Стол sci-fi/render-2.webp',
        'img/projects/Стол sci-fi/texturing.webp',
        'img/projects/Стол sci-fi/details.webp'
      ]
    }
  ];

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5v-6h-4v6h-5a1 1 0 0 1-1-1z"/></svg>',
    works: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5a2 2 0 0 1 2-2h5l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/></svg>',
    about: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4.2 3-6.5 7-6.5s6.5 2.3 7 6.5"/></svg>',
    contacts: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/></svg>'
  };

  const onAboutPage = document.body.classList.contains('about-route');
  const navItems = [
    { key: 'home', label: 'Главная', href: onAboutPage ? 'index.html#hero' : '#hero' },
    { key: 'works', label: 'Работы', href: onAboutPage ? 'index.html#works' : '#works' },
    { key: 'about', label: 'Обо мне', href: 'about.html' },
    { key: 'contacts', label: 'Контакты', href: '#contacts' }
  ];

  class PortfolioSidebar extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <aside class="desktop-sidebar" aria-label="Основная навигация">
          <a class="desktop-sidebar__brand" href="index.html" aria-label="ALEX_G — главная"><img src="img/icons/new__logo.svg" alt="" width="31" height="40"></a>
          <nav class="desktop-sidebar__nav">
            ${navItems.map(item => `
              <a class="desktop-sidebar__link${onAboutPage && item.key === 'about' ? ' is-active' : ''}" href="${item.href}" data-nav="${item.key}" ${onAboutPage && item.key === 'about' ? 'aria-current="page"' : ''}>
                ${icons[item.key]}
                <span class="desktop-sidebar__tooltip">${item.label}</span>
              </a>`).join('')}
          </nav>
          <p class="desktop-sidebar__counter">ALEX_G · 2026</p>
        </aside>`;
    }
  }

  class MobilePortfolioMenu extends HTMLElement {
    connectedCallback() {
      const positions = [['0px', '-74px'], ['-24px', '-132px'], ['-52px', '-184px'], ['-30px', '-242px']];
      this.innerHTML = `
        <nav class="mobile-menu" aria-label="Мобильная навигация">
          <div class="mobile-menu__backdrop" data-menu-close></div>
          ${navItems.map((item, index) => `
            <a class="mobile-menu__link" href="${item.href}" style="--i:${index};--x:${positions[index][0]};--y:${positions[index][1]}" aria-label="${item.label}">
              ${icons[item.key]}<span class="mobile-menu__link-label">${item.label}</span>
            </a>`).join('')}
          <button class="mobile-menu__toggle" type="button" aria-expanded="false" aria-label="Открыть меню"><span></span></button>
        </nav>`;
    }
  }

  class PortfolioHero extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero__media" aria-hidden="true">
            <video class="hero__video" autoplay muted loop playsinline preload="metadata" poster="img/decor/загрузка1.webp">
              <source src="img/decor/Заставка2.webm" type="video/webm">
            </video>
          </div>
          <div class="hero__topline"><span class="hero__portfolio-label">Портфолио / 2026</span><img class="hero__mobile-logo" src="img/icons/new__logo.svg" alt="ALEX_G" width="24" height="32"><span>Санкт-Петербург</span></div>
          <div class="hero__content">
            <p class="hero__disciplines">3D &nbsp;/&nbsp; Graphic &nbsp;/&nbsp; Branding &nbsp;/&nbsp; Digital</p>
            <h1 id="hero-title">ALEX_G</h1>
            <div class="hero__bottom">
              <p class="hero__statement">Визуальные решения для реальных задач — от идеи до готового проекта.</p>
              <div class="hero__actions">
                <a class="outline-button" href="#contacts">Связаться со мной</a>
              </div>
            </div>
          </div>
        </section>`;
    }
  }

  class PortfolioBoard extends HTMLElement {
    connectedCallback() {
      const filters = [
        ['all', 'Все'], ['3d', '3D'], ['visual', 'Визуализация'], ['design', 'Дизайн'],
        ['motion', 'Анимация'], ['print', 'Печать'], ['interior', 'Интерьер']
      ];
      this.innerHTML = `
        <section class="portfolio-board" aria-labelledby="works-title">
          <div class="portfolio-board__header">
            <div class="section-heading"><h2 id="works-title">Работы</h2></div>
            <div class="project-filters" role="group" aria-label="Фильтр проектов">
              ${filters.map(([key, label], index) => `<button class="project-filter${index === 0 ? ' is-active' : ''}" type="button" data-filter="${key}" aria-pressed="${index === 0}">${label}</button>`).join('')}
            </div>
          </div>
          <div class="project-grid">
            ${projects.map((project, index) => `
              <button class="project-card${project.layout === 'featured' ? ' is-featured' : ''}${project.layout === 'wide' ? ' is-wide' : ''} reveal-card" type="button" data-project="${project.id}" data-category="${project.category}" style="--cover-position:${project.coverPosition};--delay:${Math.min(index * 45, 260)}ms" aria-label="Открыть проект ${project.title}">
                <img class="project-card__image" src="${project.cover}" alt="" loading="lazy" decoding="async">
                <span class="project-card__content">
                  <span class="project-card__index">${String(index + 1).padStart(2, '0')}</span>
                  <h3>${project.title}</h3>
                  <p>${project.categoryLabel}</p>
                </span>
              </button>`).join('')}
            <p class="portfolio-board__empty" data-empty hidden>В этой категории пока нет проектов.</p>
          </div>
        </section>`;
    }
  }

  class PortfolioFooter extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <footer class="portfolio-footer">
          <div class="portfolio-footer__lead">
            <div>
              <div class="section-heading"><h2>Контакты</h2></div>
              <h2>Создадим что-то ясное и сильное.</h2>
              <p>Расскажите о задаче — отвечу, задам необходимые вопросы и предложу следующий шаг.</p>
            </div>
            <div class="portfolio-footer__links">
              <a class="contact-link" href="mailto:0Alex0G0@gmail.com"><span>Email</span><strong>0Alex0G0@gmail.com</strong></a>
              <a class="contact-link" href="tel:+79818081622"><span>Телефон</span><strong>+7 981 808-16-22</strong></a>
              <a class="contact-link" href="https://t.me/Alex_G8" target="_blank" rel="noopener noreferrer"><span>Telegram</span><strong>@Alex_G8</strong></a>
              <a class="contact-link" href="https://vk.com/3funnydays" target="_blank" rel="noopener noreferrer"><span>VK</span><strong>3funnydays</strong></a>
            </div>
          </div>
          <div class="portfolio-footer__bottom">
            <span>ALEX_G · 3D / Graphic / Digital · © ${new Date().getFullYear()}</span>
            <div class="portfolio-footer__legal"><a href="privacy.html">Конфиденциальность</a><a href="offer.html">Оферта</a><span>Санкт-Петербург</span></div>
          </div>
        </footer>`;
    }
  }

  class ProjectModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" hidden>
          <div class="project-modal__panel" data-modal-panel>
            <button class="project-modal__close" type="button" aria-label="Закрыть проект" data-modal-close></button>
            <div data-modal-content></div>
          </div>
        </div>`;
    }
  }

  customElements.define('portfolio-sidebar', PortfolioSidebar);
  customElements.define('mobile-portfolio-menu', MobilePortfolioMenu);
  customElements.define('portfolio-hero', PortfolioHero);
  customElements.define('portfolio-board', PortfolioBoard);
  customElements.define('portfolio-footer', PortfolioFooter);
  customElements.define('project-modal', ProjectModal);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initFilters() {
    const filters = Array.from(document.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-project]'));
    const empty = document.querySelector('[data-empty]');
    if (!filters.length || !cards.length) return;

    filters.forEach(filter => filter.addEventListener('click', () => {
      const value = filter.dataset.filter;
      filters.forEach(item => {
        const active = item === filter;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      let visibleCount = 0;
      cards.forEach(card => {
        const visible = value === 'all' || card.dataset.category === value;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (empty) empty.hidden = visibleCount !== 0;
    }));
  }

  function initModal() {
    const modal = document.querySelector('.project-modal');
    const panel = modal?.querySelector('[data-modal-panel]');
    const content = modal?.querySelector('[data-modal-content]');
    const closeButton = modal?.querySelector('[data-modal-close]');
    if (!modal || !panel || !content || !closeButton) return;
    let trigger = null;

    const focusable = () => Array.from(modal.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')).filter(element => !element.hasAttribute('disabled'));

    const close = () => {
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-modal-open');
      content.innerHTML = '';
      trigger?.focus();
    };

    const open = project => {
      trigger = document.activeElement;
      content.innerHTML = `
        <img class="project-modal__hero" src="${project.cover}" alt="${project.title}" style="--modal-position:${project.coverPosition}">
        <div class="project-modal__body">
          <div class="project-modal__heading">
            <div>
              <span class="project-modal__eyebrow">${project.categoryLabel}</span>
              <h2 id="project-modal-title">${project.title}</h2>
              <p class="project-modal__description">${project.description}</p>
            </div>
            <dl class="project-modal__facts">
              <div><dt>Год</dt><dd>${project.year}</dd></div>
              <div><dt>Задачи</dt><dd>${project.role}</dd></div>
            </dl>
          </div>
          <div class="project-modal__gallery">
            ${project.gallery.map((image, index) => `<img src="${image}" alt="${project.title} — изображение ${index + 1}" loading="lazy" decoding="async">`).join('')}
          </div>
        </div>`;
      modal.hidden = false;
      modal.removeAttribute('aria-hidden');
      document.body.classList.add('is-modal-open');
      panel.scrollTop = 0;
      closeButton.focus();
    };

    document.addEventListener('click', event => {
      const card = event.target.closest('[data-project]');
      if (card) {
        const project = projects.find(item => item.id === card.dataset.project);
        if (project) open(project);
      }
    });

    closeButton.addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => {
      if (modal.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  function initMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const toggle = menu?.querySelector('.mobile-menu__toggle');
    if (!menu || !toggle) return;
    const setOpen = open => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('is-menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    menu.addEventListener('click', event => {
      if (event.target.closest('a') || event.target.closest('[data-menu-close]')) setOpen(false);
    });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setOpen(false); });
  }

  function initReveal() {
    const cards = document.querySelectorAll('.reveal-card');
    if (!cards.length || reduceMotion || !('IntersectionObserver' in window)) {
      cards.forEach(card => card.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    cards.forEach(card => observer.observe(card));
  }

  function initScrollSpy() {
    if (onAboutPage || !('IntersectionObserver' in window)) return;
    const links = Array.from(document.querySelectorAll('.desktop-sidebar__link[data-nav]'));
    const sections = ['hero', 'works', 'contacts'].map(id => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const active = visible.target.id === 'hero' ? 'home' : visible.target.id;
      links.forEach(link => link.classList.toggle('is-active', link.dataset.nav === active));
    }, { threshold: [.18, .4, .65], rootMargin: '-12% 0px -48% 0px' });
    sections.forEach(section => observer.observe(section));
  }

  initFilters();
  initModal();
  initMobileMenu();
  initReveal();
  initScrollSpy();
})();
