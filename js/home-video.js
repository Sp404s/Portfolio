const introVideo = document.querySelector('[data-intro-video]');
const loopVideo = document.querySelector('[data-loop-video]');

const syncMobileVideoRatio = (video) => {
  const background = document.querySelector('.hero__background');
  if (!background || !video.videoWidth || !video.videoHeight) return;

  if (window.matchMedia('(max-width: 768px)').matches) {
    background.style.setProperty(
      'aspect-ratio',
      `${video.videoWidth} / ${video.videoHeight}`,
      'important',
    );
  }
};

if (introVideo) introVideo.addEventListener('loadedmetadata', () => syncMobileVideoRatio(introVideo));
if (loopVideo) loopVideo.addEventListener('loadedmetadata', () => syncMobileVideoRatio(loopVideo));

if (introVideo && loopVideo) {
  let transitionStarted = false;

  const startLoopVideo = () => {
    if (transitionStarted) return;

    transitionStarted = true;

    loopVideo.currentTime = 0;

    const revealLoopVideo = () => {
      loopVideo.classList.add('is-active');
      introVideo.classList.add('is-faded');
    };

    loopVideo.play().then(() => {
      if ('requestVideoFrameCallback' in loopVideo) {
        loopVideo.requestVideoFrameCallback(revealLoopVideo);
        return;
      }

      window.requestAnimationFrame(revealLoopVideo);
    }).catch(() => {
      transitionStarted = false;
    });
  };

  introVideo.addEventListener('timeupdate', () => {
    if (introVideo.duration - introVideo.currentTime <= 0.1) {
      startLoopVideo();
    }
  });

  introVideo.addEventListener('ended', startLoopVideo);
}
