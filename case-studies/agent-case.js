const progress = document.querySelector('.reading-progress i');
const motionButton = document.querySelector('.motion-toggle');
const heroVideo = document.querySelector('.hero-background-video');
const productScrollStages = document.querySelectorAll('.product-stage-scroll');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroVideoVisible = false;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
}

document.querySelectorAll('.reveal').forEach((element) => element.classList.add('in-view'));

if (heroVideo && 'IntersectionObserver' in window) {
  const heroVideoObserver = new IntersectionObserver(([entry]) => {
    heroVideoVisible = entry.isIntersecting;
    if (heroVideoVisible && !reduceMotion.matches && !document.body.classList.contains('motion-paused')) {
      heroVideo.play().catch(() => {});
    } else {
      heroVideo.pause();
    }
  }, { threshold: 0.12 });
  heroVideoObserver.observe(heroVideo);
}

document.addEventListener('visibilitychange', () => {
  if (!heroVideo) return;
  if (document.hidden) heroVideo.pause();
  else if (heroVideoVisible && !reduceMotion.matches && !document.body.classList.contains('motion-paused')) heroVideo.play().catch(() => {});
});

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

function sizeProductScrolls() {
  productScrollStages.forEach((stage) => {
    const track = stage.querySelector('.product-scroll-track');
    const image = track?.querySelector('img');
    if (!track || !image) return;

    const topInset = Number.parseFloat(getComputedStyle(track).top) || 0;
    const visibleHeight = Math.max(0, stage.clientHeight - (topInset * 2));
    const distance = Math.max(0, track.getBoundingClientRect().height - visibleHeight);
    track.style.setProperty('--scroll-distance', distance.toFixed(2));
    stage.classList.toggle('has-scroll-distance', distance > 2);
  });
}

productScrollStages.forEach((stage) => {
  const image = stage.querySelector('img');
  if (image?.complete) sizeProductScrolls();
  else image?.addEventListener('load', sizeProductScrolls, { once: true });
});

window.addEventListener('resize', sizeProductScrolls, { passive: true });
sizeProductScrolls();

if ('IntersectionObserver' in window) {
  const productMotionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting));
  }, { rootMargin: '120px 0px', threshold: 0.02 });
  productScrollStages.forEach((stage) => productMotionObserver.observe(stage));
}

motionButton.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  if (heroVideo) paused ? heroVideo.pause() : (heroVideoVisible && !reduceMotion.matches && heroVideo.play().catch(() => {}));
  motionButton.textContent = paused ? 'Play motion' : 'Pause motion';
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Play portfolio motion' : 'Pause portfolio motion');
});
