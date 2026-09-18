(function () {
  const search = document.querySelector('[data-project-search]');
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const cards = [...document.querySelectorAll('[data-project-card]')];
  const count = document.querySelector('[data-project-count]');
  const empty = document.querySelector('[data-project-empty]');
  if (!search || !cards.length) return;

  let category = 'all';
  const normalize = (value) => value.toLocaleLowerCase('ru-RU').trim();
  const update = () => {
    const query = normalize(search.value);
    let visible = 0;
    cards.forEach((card) => {
      const matchesText = !query || normalize(card.textContent).includes(query);
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const show = matchesText && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    });
    count.textContent = `${visible} ${visible === 1 ? 'проект' : visible > 1 && visible < 5 ? 'проекта' : 'проектов'}`;
    empty.hidden = visible !== 0;
  };

  filters.forEach((button) => button.addEventListener('click', () => {
    category = button.dataset.projectFilter;
    filters.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    update();
  }));
  search.addEventListener('input', update);
  update();
})();
