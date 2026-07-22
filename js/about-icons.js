import { animate } from 'https://cdn.jsdelivr.net/npm/animejs/+esm';

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
});

const icons = document.querySelectorAll('.software-icon img');
const percentItems = document.querySelectorAll('[data-percent]');

if (icons.length) {
  icons.forEach((icon) => {
    icon.style.animation = 'none';

    const x = Math.round((Math.random() - 0.5) * 14);
    const y = -6 - Math.round(Math.random() * 12);
    const rotate = Math.round((Math.random() - 0.5) * 10);
    const scale = 1.03 + Math.random() * 0.08;
    const duration = 1800 + Math.round(Math.random() * 1400);
    const delay = Math.round(Math.random() * 900);

    animate(icon, {
      translateX: [0, x, -x * 0.45, 0],
      translateY: [0, y, y * 0.35, 0],
      scale: [1, scale, 0.98, 1],
      rotate: [0, rotate, -rotate * 0.7, 0],
      duration,
      delay,
      ease: 'inOutSine',
      loop: true,
    });
  });

  window.setInterval(() => {
    const icon = icons[Math.floor(Math.random() * icons.length)];

    animate(icon, {
      rotate: '+=360',
      duration: 900,
      ease: 'inOutQuad',
    });
  }, 5000);
}

if (percentItems.length) {
  const animatePercent = (item) => {
    if (item.dataset.percentAnimated === 'true') return;

    item.dataset.percentAnimated = 'true';
    const target = Number(item.dataset.percent);
    const duration = 1400;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);

      item.textContent = `${value}%`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      animatePercent(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -8% 0px',
  });

  percentItems.forEach((item) => observer.observe(item));
}
