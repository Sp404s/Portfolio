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

})();
