(function () {
  const feed = document.querySelector('[data-news-feed]');
  if (!feed) return;

  const news = Array.isArray(window.SITE_NEWS) ? [...window.SITE_NEWS] : [];
  news.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (!news.length) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'Пока нет постов.';
    feed.append(empty);
    return;
  }

  news.forEach((item) => {
    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = item.url;

    const time = document.createElement('time');
    time.dateTime = item.date;
    time.textContent = item.displayDate;

    const copy = document.createElement('div');
    const title = document.createElement('h2');
    const text = document.createElement('p');
    title.textContent = item.title;
    text.textContent = item.text;
    copy.append(title, text);

    const status = document.createElement('span');
    status.className = 'news-card__status';
    status.textContent = item.status;
    card.append(time, copy, status);
    feed.append(card);
  });
})();
