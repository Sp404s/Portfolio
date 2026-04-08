// Page-specific behavior for Project detail
(() => {
  const handleBackspace = (event) => {
    if (event.key !== "Backspace") return;
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName.toLowerCase();
      const isEditable = target.isContentEditable || tag === "input" || tag === "textarea";
      if (isEditable) return;
    }
    event.preventDefault();
    window.location.href = "projects.html";
  };

  document.addEventListener("keydown", handleBackspace);

  const initVideoPlayers = () => {
    const players = Array.from(document.querySelectorAll("[data-video-player]"));
    if (!players.length) return;

    players.forEach((player) => {
      const video = player.querySelector("video");
      const playBtn = player.querySelector("[data-video-play]");
      const timeline = player.querySelector("[data-video-timeline]");
      const volume = player.querySelector("[data-video-volume]");
      const fullscreenBtn = player.querySelector("[data-video-fullscreen]");
      const overlay = player.querySelector("[data-video-overlay]");
      const loader = player.querySelector("[data-video-loader]");
      const frame = player.querySelector(".project-video__frame");

      if (!video || !playBtn || !timeline || !volume) return;

      const updatePlayLabel = () => {
        player.classList.toggle("is-playing", !video.paused);
        playBtn.setAttribute("aria-label", video.paused ? "Воспроизвести" : "Остановить");
      };

      const clampTime = (time) => Math.max(0, Math.min(time, video.duration || 0));
      let rafId = null;

      const updateTimeline = () => {
        const max = Number(timeline.max) || video.duration || 0;
        if (max > 0 && !timeline.matches(":active")) {
          timeline.value = String(video.currentTime || 0);
        }
        const percent = max ? (Number(timeline.value) / max) * 100 : 0;
        timeline.style.setProperty("--range-progress", `${percent}%`);
        if (!video.paused) {
          rafId = requestAnimationFrame(updateTimeline);
        }
      };

      playBtn.addEventListener("click", () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });

      const togglePlayback = () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      };

      if (overlay) {
        overlay.addEventListener("click", (event) => {
          event.stopPropagation();
          togglePlayback();
        });
      }


      if (frame) {
        frame.addEventListener("click", (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          if (target.closest(".project-video__controls")) return;
          if (target.closest(".project-video__volume")) return;
          if (target.closest("input")) return;
          togglePlayback();
        });
      }

      if (loader) {
        const hideLoader = () => {
          loader.classList.add("is-hidden");
          setTimeout(() => loader.remove(), 400);
        };
        video.addEventListener("loadeddata", hideLoader, { once: true });
        video.addEventListener("canplay", hideLoader, { once: true });
      }

      video.addEventListener("play", updatePlayLabel);
      video.addEventListener("pause", () => {
        updatePlayLabel();
        if (rafId) cancelAnimationFrame(rafId);
      });
      video.addEventListener("ended", () => {
        updatePlayLabel();
        if (rafId) cancelAnimationFrame(rafId);
      });

      video.addEventListener("loadedmetadata", () => {
        timeline.max = String(video.duration || 0);
      });

      video.addEventListener("timeupdate", updateTimeline);
      video.addEventListener("play", updateTimeline);

      timeline.addEventListener("input", () => {
        video.currentTime = clampTime(Number(timeline.value));
        const max = Number(timeline.max) || video.duration || 0;
        const percent = max ? (Number(timeline.value) / max) * 100 : 0;
        timeline.style.setProperty("--range-progress", `${percent}%`);
      });

      const setRangeFromPointer = (range, event) => {
        const rect = range.getBoundingClientRect();
        const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
        const min = Number(range.min) || 0;
        const max = Number(range.max) || 1;
        const value = min + ratio * (max - min);
        range.value = String(value);
        range.dispatchEvent(new Event("input", { bubbles: true }));
      };

      timeline.addEventListener("pointerdown", (event) => {
        setRangeFromPointer(timeline, event);
      });

      volume.addEventListener("input", () => {
        video.volume = Number(volume.value);
        volume.style.setProperty("--range-progress", `${Number(volume.value) * 100}%`);
      });

      volume.addEventListener("pointerdown", (event) => {
        setRangeFromPointer(volume, event);
      });

      if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
          const target = player;
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (target.requestFullscreen) {
            target.requestFullscreen();
          }
        });
      }

      const syncFullscreenCursor = () => {
        const cursor = document.getElementById("cursor-3d");
        const fsEl = document.fullscreenElement;
        if (!cursor) return;
        if (fsEl) {
          if (!fsEl.contains(cursor)) {
            fsEl.appendChild(cursor);
          }
        } else if (cursor.parentElement !== document.body) {
          document.body.appendChild(cursor);
        }
      };

      document.addEventListener("fullscreenchange", syncFullscreenCursor);
      syncFullscreenCursor();

      updatePlayLabel();
      timeline.style.setProperty("--range-progress", "0%");
      volume.style.setProperty("--range-progress", `${Number(volume.value) * 100}%`);
    });
  };

  const initGalleryModal = () => {
    const galleryImages = Array.from(document.querySelectorAll(".project-gallery img"));
    if (!galleryImages.length) return;

    const modal = document.createElement("div");
    modal.className = "gallery-modal";
    modal.setAttribute("aria-hidden", "true");

    const modalContent = document.createElement("div");
    modalContent.className = "gallery-modal__content";

    const modalImage = document.createElement("img");
    modalImage.className = "gallery-modal__image";
    modalImage.alt = "";

    const closeButton = document.createElement("button");
    closeButton.className = "gallery-modal__close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Закрыть");
    closeButton.textContent = "×";

    const prevButton = document.createElement("button");
    prevButton.className = "gallery-modal__nav gallery-modal__nav--prev";
    prevButton.type = "button";
    prevButton.setAttribute("aria-label", "Предыдущее изображение");
    prevButton.innerHTML = '<img src="assets/icons/Arrow.svg" alt="" />';

    const nextButton = document.createElement("button");
    nextButton.className = "gallery-modal__nav gallery-modal__nav--next";
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", "Следующее изображение");
    nextButton.innerHTML = '<img src="assets/icons/Arrow.svg" alt="" />';

    modalContent.appendChild(modalImage);
    modal.appendChild(closeButton);
    modal.appendChild(prevButton);
    modal.appendChild(nextButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    let currentIndex = 0;

    const setImage = (index) => {
      const total = galleryImages.length;
      currentIndex = (index + total) % total;
      const img = galleryImages[currentIndex];
      modalImage.src = img.src;
      modalImage.alt = img.alt || "";
    };

    const openModal = (index) => {
      setImage(index);
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    };

    const closeModal = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    galleryImages.forEach((img, index) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openModal(index));
    });

    const gallery = document.querySelector(".project-gallery");
    if (gallery) {
      gallery.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        let img = target.closest(".project-gallery img");
        if (!img) {
          const thumb = target.closest(".project-thumb");
          if (thumb) {
            img = thumb.querySelector("img");
          }
        }
        if (!img) return;
        const index = galleryImages.indexOf(img);
        if (index >= 0) {
          openModal(index);
        }
      });
    }

    prevButton.addEventListener("click", () => setImage(currentIndex - 1));
    nextButton.addEventListener("click", () => setImage(currentIndex + 1));
    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    window.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") {
        closeModal();
      }
      if (event.key === "ArrowLeft") {
        setImage(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        setImage(currentIndex + 1);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initVideoPlayers();
      initGalleryModal();
    }, { once: true });
  } else {
    initVideoPlayers();
    initGalleryModal();
  }
})();
