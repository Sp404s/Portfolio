const videoPlayers = document.querySelectorAll('[data-project-video]');
const projectVideoSection = document.querySelector('.city-video');
const projectSlider = document.querySelector('[data-project-slider]');

if (projectVideoSection && projectSlider) {
  projectSlider.before(projectVideoSection);
}

videoPlayers.forEach((player) => {
  const video = player.querySelector('video');
  const centerPlay = player.querySelector('[data-video-play]');
  const toggleButton = player.querySelector('[data-video-toggle]');
  const muteButton = player.querySelector('[data-video-mute]');
  const progress = player.querySelector('[data-video-progress]');

  if (!video || !centerPlay || !toggleButton || !muteButton || !progress) return;

  const updateState = () => {
    const isPaused = video.paused;

    player.classList.toggle('is-playing', !isPaused);
    centerPlay.setAttribute('aria-label', isPaused ? 'Воспроизвести видео' : 'Поставить видео на паузу');
    toggleButton.textContent = isPaused ? 'Play' : 'Pause';
    toggleButton.setAttribute('aria-label', isPaused ? 'Воспроизвести видео' : 'Поставить видео на паузу');
    muteButton.textContent = video.muted ? 'Muted' : 'Sound';
    muteButton.setAttribute('aria-label', video.muted ? 'Включить звук' : 'Выключить звук');
  };

  const toggleVideo = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  centerPlay.addEventListener('click', toggleVideo);
  toggleButton.addEventListener('click', toggleVideo);
  video.addEventListener('click', toggleVideo);

  muteButton.addEventListener('click', () => {
    video.muted = !video.muted;
    updateState();
  });

  video.addEventListener('play', updateState);
  video.addEventListener('pause', updateState);

  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;

    progress.value = String((video.currentTime / video.duration) * 1000);
  });

  progress.addEventListener('input', () => {
    if (!video.duration) return;

    video.currentTime = (Number(progress.value) / 1000) * video.duration;
  });

  updateState();
});
