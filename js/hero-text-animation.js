(() => {
  const root = document.documentElement;
  const content = document.querySelector('.hero__content--redesign');

  if (!content) {
    root.classList.remove('hero-animation-pending');
    return;
  }

  const targets = [
    content.querySelector('.hero__label'),
    content.querySelector('h1'),
    content.querySelector('.hero__text'),
  ].filter(Boolean);
  const action = content.querySelector('.hero__action');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showImmediately = () => {
    root.classList.remove('hero-animation-pending', 'hero-animation-running');
    root.classList.add('hero-animation-complete');
  };

  if (!targets.length || reduceMotion) {
    showImmediately();
    return;
  }

  let nextLine = 0;

  const splitTarget = (target) => {
    const lines = [''];

    target.childNodes.forEach((node) => {
      if (node.nodeName === 'BR') {
        lines.push('');
      } else {
        lines[lines.length - 1] += node.textContent || '';
      }
    });

    const accessibleText = lines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ');

    target.setAttribute('aria-label', accessibleText);
    target.textContent = '';

    lines.forEach((sourceLine) => {
      const lineIndex = nextLine;
      const line = document.createElement('span');
      const words = sourceLine.trim().split(/\s+/).filter(Boolean);

      line.className = 'hero-animated-line';
      line.setAttribute('aria-hidden', 'true');
      line.dataset.line = String(lineIndex);

      words.forEach((sourceWord, wordIndex) => {
        const clip = document.createElement('span');
        const word = document.createElement('span');

        clip.className = 'hero-word-clip';
        word.className = 'hero-word';
        word.dataset.line = String(lineIndex);

        Array.from(sourceWord).forEach((character) => {
          const char = document.createElement('span');
          char.className = 'hero-char';
          char.dataset.line = String(lineIndex);
          char.textContent = character;
          char.style.opacity = '0';
          word.append(char);
        });

        clip.append(word);
        line.append(clip);

        if (wordIndex < words.length - 1) {
          line.append(document.createTextNode(' '));
        }
      });

      target.append(line);
      nextLine += 1;
    });
  };

  targets.forEach(splitTarget);

  const chars = Array.from(content.querySelectorAll('.hero-char'));
  const waitForAnimations = (animations) => Promise.all(
    animations.map((animation) => animation.finished.catch(() => undefined)),
  );

  const run = async () => {
    if (action) {
      action.style.opacity = '0';
      action.style.transform = 'translateY(18px)';
      action.style.pointerEvents = 'none';
    }

    const charStates = chars.map(() => ({
      y: Math.round(Math.random() * 90 - 45),
      rotation: Math.round(Math.random() * 30 - 15),
      delay: Math.round(Math.random() * 170),
      duration: Math.round(560 + Math.random() * 160),
    }));

    chars.forEach((char, index) => {
      const state = charStates[index];
      char.style.transform = `translateY(${state.y}px) rotate(${state.rotation}deg) scale(.86)`;
      char.style.filter = 'blur(5px)';
    });

    await new Promise((resolve) => window.setTimeout(resolve, 220));
    root.classList.remove('hero-animation-pending');
    root.classList.add('hero-animation-running');

    const charAnimations = chars.map((char, index) => char.animate([
      {
        opacity: 0,
        transform: char.style.transform,
        filter: 'blur(5px)',
      },
      {
        opacity: 1,
        transform: 'translateY(0)',
        filter: 'blur(0)',
      },
    ], {
      duration: charStates[index].duration,
      delay: charStates[index].delay,
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'forwards',
    }));

    await waitForAnimations(charAnimations);

    chars.forEach((char) => {
      char.style.opacity = '1';
      char.style.transform = 'translateY(0)';
      char.style.filter = 'none';
      char.style.willChange = 'auto';
    });

    if (action) {
      const actionAnimation = action.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 480,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'forwards',
      });

      await actionAnimation.finished.catch(() => undefined);
      action.style.opacity = '1';
      action.style.transform = 'translateY(0)';
      action.style.pointerEvents = '';
    }

    root.classList.remove('hero-animation-running');
    root.classList.add('hero-animation-complete');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
