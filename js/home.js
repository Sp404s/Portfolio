// Page-specific behavior for Home
const setProjectColumns = () => {
  const visibleCards = Array.from(document.querySelectorAll(".projects-grid > .project-card"));
  const hiddenCards = Array.from(document.querySelectorAll(".projects-hidden .project-card"));
  const allCards = [...visibleCards, ...hiddenCards];
  allCards.forEach((card, index) => {
    card.classList.remove("is-col-a", "is-col-b", "is-col-c", "is-col-d");
    const pos = index % 4;
    if (pos === 0) card.classList.add("is-col-a");
    if (pos === 1) card.classList.add("is-col-b");
    if (pos === 2) card.classList.add("is-col-c");
    if (pos === 3) card.classList.add("is-col-d");
  });
};

setProjectColumns();

const moreButton = document.querySelector(".projects-more");
if (moreButton) {
  moreButton.addEventListener("click", () => {
    const hiddenWrap = document.querySelector(".projects-hidden");
    if (hiddenWrap) {
      hiddenWrap.classList.add("is-open");
    }
    moreButton.remove();
  });
}
