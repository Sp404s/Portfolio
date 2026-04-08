// Page-specific behavior for Projects
const moreButton = document.querySelector(".projects-more");
if (moreButton) {
  moreButton.addEventListener("click", () => {
    const hiddenWrap = document.querySelector(".projects-hidden");
    if (hiddenWrap) {
      hiddenWrap.classList.add("is-open");
    }
    moreButton.classList.add("fade-out");
    setTimeout(() => {
      moreButton.remove();
    }, 800);
  });
}

const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const projectCards = Array.from(document.querySelectorAll(".project-preview"));
const hiddenWrap = document.querySelector(".projects-hidden");
const searchInput = document.querySelector(".projects-search__input");

const getActiveTags = () =>
  filterButtons
    .filter((btn) => btn.classList.contains("is-active"))
    .map((btn) => btn.textContent.trim().toLowerCase());

const applyFilters = (activeTags, query) => {
  const normalizedQuery = (query || "").trim().toLowerCase();
  const hasTags = activeTags.length > 0;
  const hasQuery = normalizedQuery.length > 0;

  if (!hasTags && !hasQuery) {
    projectCards.forEach((card) => {
      card.style.display = "";
    });
    if (hiddenWrap) hiddenWrap.classList.remove("is-open");
    if (moreButton) moreButton.style.display = "";
    return;
  }

  projectCards.forEach((card) => {
    const tags = (card.dataset.tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    const titleEl = card.querySelector(".project-preview__title");
    const titleText = titleEl ? titleEl.textContent.trim().toLowerCase() : "";
    const matchesTags = !hasTags || activeTags.some((tag) => tags.includes(tag));
    const matchesQuery = !hasQuery || titleText.includes(normalizedQuery);
    card.style.display = matchesTags && matchesQuery ? "" : "none";
  });

  if (hiddenWrap) hiddenWrap.classList.add("is-open");
  if (moreButton) moreButton.style.display = "none";
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
    applyFilters(getActiveTags(), searchInput ? searchInput.value : "");
  });
});

if (searchInput) {
  searchInput.addEventListener("input", () => {
    applyFilters(getActiveTags(), searchInput.value);
  });
}
