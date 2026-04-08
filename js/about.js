// Page-specific behavior for About
(() => {
  const percents = Array.from(document.querySelectorAll(".skill-card__percent[data-percent]"));
  if (!percents.length) return;

  const animateValue = (el) => {
    const target = Number(el.dataset.percent || 0);
    const duration = 900;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(from + (target - from) * progress);
      el.textContent = `${value}%`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    percents.forEach((el) => animateValue(el));
  };

  if ("IntersectionObserver" in window) {
    const section = document.querySelector(".skills-section");
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(section);
  } else {
    startAnimation();
  }
})();
