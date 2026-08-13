(() => {
  document.querySelectorAll("img").forEach((image) => {
    image.decoding = "async";
    if (!image.closest(".project-cover, .new-project-hero, .site-loader")) {
      image.loading = "lazy";
    }
  });

  const root = "img/icons/";
  const icons = {
    play: `${root}Play.svg`,
    pause: `${root}Pause.svg`,
    volume: `${root}volume.svg`,
    mute: `${root}mute.svg`,
  };

  const setIcon = (element, source) => {
    if (element) element.src = source;
  };

  document.querySelectorAll("video").forEach((video) => {
    if (!video.closest("[data-project-video]")) {
      video.controls = true;
      video.setAttribute("controls", "");
    }
  });

  document.querySelectorAll("[data-project-video]").forEach((player) => {
    const video = player.querySelector("video");
    if (!video) return;

    const togglePlayback = () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const syncVideoState = () => {
      const isPlaying = !video.paused && !video.ended;
      player.classList.toggle("is-playing", isPlaying);
      setIcon(
        player.querySelector("[data-video-toggle-icon]"),
        isPlaying ? icons.pause : icons.play,
      );
      setIcon(
        player.querySelector("[data-video-center-icon]"),
        isPlaying ? icons.pause : icons.play,
      );

      const progress = player.querySelector("[data-video-progress]");
      if (progress && Number.isFinite(video.duration) && video.duration > 0) {
        progress.value = String((video.currentTime / video.duration) * 1000);
      }

      const muteButton = player.querySelector("[data-video-mute]");
      if (muteButton) {
        muteButton.setAttribute(
          "aria-label",
          video.muted ? "Включить звук" : "Выключить звук",
        );
        muteButton.setAttribute(
          "title",
          video.muted ? "Включить звук" : "Выключить звук",
        );
      }
      setIcon(
        player.querySelector("[data-video-mute-icon]"),
        video.muted || video.volume === 0 ? icons.mute : icons.volume,
      );

      const toggleButton = player.querySelector("[data-video-toggle]");
      if (toggleButton) {
        const label = isPlaying ? "Поставить видео на паузу" : "Воспроизвести видео";
        toggleButton.setAttribute("aria-label", label);
        toggleButton.setAttribute("title", label);
      }
    };

    player.querySelectorAll("[data-video-play], [data-video-toggle]").forEach((button) => {
      button.addEventListener("click", togglePlayback);
    });

    video.addEventListener("click", togglePlayback);
    ["loadedmetadata", "play", "pause", "timeupdate", "volumechange", "ended"].forEach((eventName) => {
      video.addEventListener(eventName, syncVideoState);
    });

    player.querySelector("[data-video-back]")?.addEventListener("click", () => {
      video.currentTime = Math.max(0, video.currentTime - 5);
    });

    player.querySelector("[data-video-forward]")?.addEventListener("click", () => {
      video.currentTime = Math.min(video.duration || video.currentTime + 5, video.currentTime + 5);
    });

    player.querySelector("[data-video-progress]")?.addEventListener("input", (event) => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = (Number(event.currentTarget.value) / 1000) * video.duration;
      }
    });

    player.querySelector("[data-video-volume]")?.addEventListener("input", (event) => {
      const value = Number(event.currentTarget.value);
      video.volume = value;
      video.muted = value === 0;
      syncVideoState();
    });

    player.querySelector("[data-video-mute]")?.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) video.volume = 0.8;
      syncVideoState();
    });

    const fullscreenButton = player.querySelector("[data-video-fullscreen]");
    const updateFullscreenState = () => {
      const isFullscreen = document.fullscreenElement === player;
      player.classList.toggle("is-fullscreen", isFullscreen);
      if (!fullscreenButton) return;
      const label = isFullscreen ? "Выйти из полноэкранного режима" : "На весь экран";
      fullscreenButton.setAttribute("aria-label", label);
      fullscreenButton.setAttribute("title", label);
    };

    fullscreenButton?.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if (player.requestFullscreen) {
          await player.requestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } catch {
        // Fullscreen can be rejected by the browser or an embedded context.
      }
      updateFullscreenState();
    });

    document.addEventListener("fullscreenchange", updateFullscreenState);

    const volume = player.querySelector("[data-video-volume]");
    video.volume = volume ? Number(volume.value) : 0.8;
    updateFullscreenState();
    syncVideoState();
  });

  document.querySelectorAll("[data-project-slider]").forEach((slider) => {
    const track = slider.querySelector("[data-project-slider-track]");
    if (!track) return;

    let offset = 0;
    let pointerStart = 0;
    let offsetStart = 0;
    let dragging = false;
    let lastAutoplayTime = performance.now();
    let autoplayPausedUntil = 0;
    let autoplayVisible = true;
    const autoplaySpeed = 16;

    const getBounds = () => ({
      min: Math.min(0, slider.clientWidth - track.scrollWidth),
      max: 0,
    });

    const render = () => {
      const { min, max } = getBounds();
      offset = Math.min(max, Math.max(min, offset));
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    };

    const moveBy = (distance) => {
      offset += distance;
      render();
    };

    const pauseAutoplay = () => {
      autoplayPausedUntil = performance.now() + 1200;
    };

    const getLoopWidth = () => {
      const group = track.querySelector(".project-slider__group");
      return group ? group.getBoundingClientRect().width : 0;
    };

    const autoplay = (now) => {
      const elapsed = Math.min(50, Math.max(0, now - lastAutoplayTime));
      lastAutoplayTime = now;

      if (autoplayVisible && !document.hidden && !dragging && now >= autoplayPausedUntil) {
        const loopWidth = getLoopWidth();
        if (loopWidth > 0 && track.scrollWidth > slider.clientWidth) {
          offset -= (autoplaySpeed * elapsed) / 1000;
          if (offset <= -loopWidth) offset += loopWidth;
          render();
        }
      }

      window.requestAnimationFrame(autoplay);
    };

    slider.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      pauseAutoplay();
      dragging = true;
      pointerStart = event.clientX;
      offsetStart = offset;
      slider.classList.add("is-dragging");
      slider.setPointerCapture?.(event.pointerId);
    });

    slider.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      offset = offsetStart + event.clientX - pointerStart;
      render();
    });

    const stopDragging = (event) => {
      if (!dragging) return;
      dragging = false;
      slider.classList.remove("is-dragging");
      slider.releasePointerCapture?.(event.pointerId);
    };

    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);
    slider.addEventListener("pointerleave", (event) => {
      if (dragging && event.pointerType === "mouse") stopDragging(event);
    });

    slider.addEventListener("wheel", (event) => {
      pauseAutoplay();
      const distance = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const { min, max } = getBounds();
      const next = Math.min(max, Math.max(min, offset - distance));
      if (next === offset) return;
      event.preventDefault();
      offset = next;
      track.classList.add("is-wheel-moving");
      render();
      window.clearTimeout(slider._wheelTimer);
      slider._wheelTimer = window.setTimeout(() => track.classList.remove("is-wheel-moving"), 220);
    }, { passive: false });

    slider.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      pauseAutoplay();
      moveBy(event.key === "ArrowLeft" ? 120 : -120);
    });

    slider.setAttribute("tabindex", "0");
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        autoplayVisible = entry.isIntersecting;
        lastAutoplayTime = performance.now();
      }, { rootMargin: "200px" });
      observer.observe(slider);
    }
    window.addEventListener("resize", render);
    requestAnimationFrame(render);
    window.requestAnimationFrame(autoplay);
  });
})();
