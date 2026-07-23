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
  const centerIcon = player.querySelector('[data-video-center-icon]');
  const toggleIcon = player.querySelector('[data-video-toggle-icon]');
  const backButton = player.querySelector('[data-video-back]');
  const forwardButton = player.querySelector('[data-video-forward]');
  const muteButton = player.querySelector('[data-video-mute]');
  const muteIcon = player.querySelector('[data-video-mute-icon]');
  const progress = player.querySelector('[data-video-progress]');
  const volume = player.querySelector('[data-video-volume]');

  if (!video || !centerPlay || !toggleButton || !centerIcon || !toggleIcon || !backButton || !forwardButton || !muteButton || !muteIcon || !progress || !volume) return;

  video.volume = Number(volume.value) || 0.8;

  const updateState = () => {
    const isPaused = video.paused;
    const isMuted = video.muted || video.volume === 0;

    player.classList.toggle('is-playing', !isPaused);
    const playIcon = isPaused ? 'Play.svg' : 'Pause.svg';
    centerIcon.src = `img/icons/${playIcon}`;
    toggleIcon.src = `img/icons/${playIcon}`;
    centerPlay.setAttribute('aria-label', isPaused ? 'Воспроизвести видео' : 'Поставить видео на паузу');
    toggleButton.classList.toggle('is-paused', isPaused);
    toggleButton.setAttribute('aria-label', isPaused ? 'Воспроизвести видео' : 'Поставить видео на паузу');
    toggleButton.title = isPaused ? 'Воспроизвести видео' : 'Поставить видео на паузу';
    muteButton.classList.toggle('is-muted', isMuted);
    muteIcon.src = `img/icons/${isMuted ? 'mute.svg' : 'volume.svg'}`;
    muteButton.setAttribute('aria-label', isMuted ? 'Включить звук' : 'Выключить звук');
    muteButton.title = isMuted ? 'Включить звук' : 'Выключить звук';
    volume.value = String(video.volume);
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

  backButton.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 5);
  });

  forwardButton.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 5);
  });

  muteButton.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      if (video.volume === 0) video.volume = 0.8;
    } else {
      video.muted = true;
    }
    updateState();
  });

  volume.addEventListener('input', () => {
    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
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
