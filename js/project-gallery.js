(function () {
  class ProjectGallery extends HTMLElement {
    connectedCallback() {
      if (this.dataset.ready) return;
      this.dataset.ready = 'true';

      const images = Array.from(this.children).filter((node) => node.tagName === 'IMG');
      if (!images.length) return;

      const label = this.getAttribute('aria-label') || 'Галерея проекта';
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `
        <style>
          :host{display:block;color:#f8f6f3;font-family:Involve,Arial,sans-serif}
          *{box-sizing:border-box}
          .viewport{width:100%;height:clamp(292.5px,36vw,517.5px);overflow:hidden;border-radius:22px;background:transparent;cursor:grab;touch-action:pan-y;user-select:none}
          .viewport.is-dragging{cursor:grabbing}
          .track{display:flex;width:max-content;height:100%;gap:0;transform:translate3d(0,0,0);will-change:transform}
          .group{display:flex;height:100%;gap:0}
          .slide{position:relative;display:block;flex:0 0 auto;width:auto;height:100%;margin:0;padding:0;overflow:hidden;border:0;border-radius:0;background:transparent;color:inherit;cursor:pointer}
          .slide:focus-visible{outline:2px solid #ee7a3f;outline-offset:-4px}
          .slide img{display:block;width:100%;height:100%;max-width:none;object-position:center;pointer-events:none;-webkit-user-drag:none}
          .slide-image{object-fit:contain}
          dialog{width:100vw;height:100dvh;max-width:none;max-height:none;margin:auto;padding:24px;border:0;background:rgba(16,15,15,.97);overflow:hidden}
          dialog::backdrop{background:rgba(0,0,0,.78);backdrop-filter:blur(6px)}
          .modal-inner{display:grid;width:100%;height:100%;place-items:center}
          .modal-image{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain}
          .modal-close{position:fixed;z-index:2;top:18px;right:18px;width:46px;height:46px;padding:0;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:rgba(36,35,35,.9);color:#fff;font:400 28px/1 Arial,sans-serif;cursor:pointer}
          .modal-close:hover{border-color:#ee7a3f;background:#ee7a3f;color:#20150f}
          .modal-close:focus-visible{outline:2px solid #ee7a3f;outline-offset:3px}
          @media(max-width:768px){.viewport{height:calc(56.25vw - 36px);min-height:144px;border-radius:16px}dialog{padding:12px}.modal-close{top:12px;right:12px;width:42px;height:42px}}
        </style>
        <div class="viewport" tabindex="0" role="region">
          <div class="track">
            <div class="group"></div>
            <div class="group group--clone" aria-hidden="true"></div>
          </div>
        </div>
        <dialog aria-label="Просмотр изображения">
          <button class="modal-close" type="button" aria-label="Закрыть">×</button>
          <div class="modal-inner"><img class="modal-image" alt=""></div>
        </dialog>`;

      const viewport = root.querySelector('.viewport');
      const track = root.querySelector('.track');
      const group = root.querySelector('.group');
      const cloneGroup = root.querySelector('.group--clone');
      const dialog = root.querySelector('dialog');
      const modalImage = root.querySelector('.modal-image');
      viewport.setAttribute('aria-label', `${label}. Лента движется автоматически; её можно перетаскивать.`);

      const imageData = images.map((image) => ({
        src: image.getAttribute('data-full-src') || image.getAttribute('src'),
        alt: image.getAttribute('alt') || 'Изображение проекта'
      }));

      const createSlide = (image, imageIndex, isClone) => {
        image.loading = 'lazy';
        image.decoding = 'async';
        image.draggable = false;
        image.removeAttribute('data-caption');
        image.classList.add('slide-image');
        const slide = document.createElement('button');
        slide.className = 'slide';
        slide.type = 'button';
        slide.dataset.imageIndex = String(imageIndex);
        slide.setAttribute('aria-label', `Открыть изображение: ${imageData[imageIndex].alt}`);
        if (isClone) slide.tabIndex = -1;
        slide.append(image);
        return slide;
      };

      images.forEach((image, imageIndex) => {
        group.append(createSlide(image, imageIndex, false));
        cloneGroup.append(createSlide(image.cloneNode(true), imageIndex, true));
      });

      let offset = 0;
      let loopWidth = 0;
      let dragging = false;
      let dragged = false;
      let pointerStart = 0;
      let offsetStart = 0;
      let pauseUntil = 0;
      let visible = true;
      let previousTime = performance.now();
      const speed = 18;

      const sizeSlides = () => {
        const height = viewport.getBoundingClientRect().height;
        root.querySelectorAll('.slide').forEach((slide) => {
          const image = slide.querySelector('.slide-image');
          const ratio = image.naturalWidth && image.naturalHeight
            ? image.naturalWidth / image.naturalHeight
            : 16 / 9;
          const width = Math.max(1, height * ratio);
          const value = `${Math.round(width * 100) / 100}px`;
          if (slide.style.width === value) return;
          slide.style.width = value;
          slide.style.flexBasis = value;
        });
      };
      const measure = () => {
        sizeSlides();
        const gap = Number.parseFloat(getComputedStyle(track).gap) || 0;
        loopWidth = group.getBoundingClientRect().width + gap;
      };
      root.querySelectorAll('.slide-image').forEach((image) => {
        if (!image.complete) image.addEventListener('load', measure, { once: true });
      });
      const normalize = () => {
        if (!loopWidth) return;
        while (offset > 0) offset -= loopWidth;
        while (offset <= -loopWidth) offset += loopWidth;
      };
      const render = () => {
        track.style.transform = `translate3d(${offset}px,0,0)`;
      };
      const pause = (duration = 1100) => {
        pauseUntil = performance.now() + duration;
      };

      const animate = (time) => {
        const elapsed = Math.min(48, Math.max(0, time - previousTime));
        previousTime = time;
        if (!reducedMotion && visible && !dragging && !dialog.open && document.visibilityState === 'visible' && time >= pauseUntil) {
          offset -= (speed * elapsed) / 1000;
          normalize();
          render();
        }
        this._animationFrame = requestAnimationFrame(animate);
      };

      const finishDrag = (event) => {
        if (!dragging) return;
        dragging = false;
        viewport.classList.remove('is-dragging');
        viewport.releasePointerCapture?.(event.pointerId);
        normalize();
        render();
        pause();
      };

      viewport.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        dragging = true;
        dragged = false;
        pointerStart = event.clientX;
        offsetStart = offset;
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture?.(event.pointerId);
      });
      viewport.addEventListener('pointermove', (event) => {
        if (!dragging) return;
        const distance = event.clientX - pointerStart;
        if (Math.abs(distance) > 6) dragged = true;
        offset = offsetStart + distance;
        normalize();
        render();
      });
      viewport.addEventListener('pointerup', finishDrag);
      viewport.addEventListener('pointercancel', finishDrag);
      viewport.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        offset += event.key === 'ArrowLeft' ? 72 : -72;
        normalize();
        render();
        pause();
      });
      viewport.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        offset -= event.deltaX;
        normalize();
        render();
        pause();
      }, { passive: false });

      track.addEventListener('click', (event) => {
        const slide = event.target.closest('.slide');
        if (!slide) return;
        if (dragged) {
          dragged = false;
          event.preventDefault();
          return;
        }
        const data = imageData[Number(slide.dataset.imageIndex)];
        modalImage.src = data.src;
        modalImage.alt = data.alt;
        dialog.showModal();
      });
      root.querySelector('.modal-close').addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
      dialog.addEventListener('close', () => {
        modalImage.removeAttribute('src');
        pause(500);
      });

      const resizeObserver = new ResizeObserver(() => {
        measure();
        normalize();
        render();
      });
      resizeObserver.observe(group);
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          previousTime = performance.now();
        }, { rootMargin: '160px' });
        observer.observe(this);
      }

      requestAnimationFrame(() => {
        measure();
        render();
        this._animationFrame = requestAnimationFrame(animate);
      });
    }

    disconnectedCallback() {
      if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
    }
  }

  if (!customElements.get('project-gallery')) customElements.define('project-gallery', ProjectGallery);
})();
