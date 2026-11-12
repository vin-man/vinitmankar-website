(() => {
  const chapters = [...document.querySelectorAll('.chapter')];
  const frames = chapters.map(chapter => chapter.querySelector('.chapter-media'));
  const stage = document.querySelector('.visual-stage');
  const desktop = matchMedia('(min-width: 961px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const links = [...document.querySelectorAll('.chapter-track a')];
  const previous = document.querySelector('.previous');
  const next = document.querySelector('.next');
  const dialog = document.querySelector('.image-dialog');
  const dialogImage = dialog.querySelector('img');
  const dialogCanvas = dialog.querySelector('.dialog-canvas');
  const zoom = dialog.querySelector('.zoom-toggle');
  let current = -1, scheduled = false, opener;

  function activate(index) {
    if (index === current) return;
    current = index;
    frames.forEach((frame, i) => {
      frame.classList.toggle('is-active', i === index);
      frame.inert = desktop.matches && i !== index;
      if (desktop.matches && i !== index) frame.querySelector('video')?.pause();
    });
    chapters.forEach((chapter, i) => chapter.classList.toggle('is-current', i === index));
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'step') : link.removeAttribute('aria-current'));
    document.querySelector('.chapter-count').textContent = `${String(index + 1).padStart(2, '0')} / 08`;
    document.querySelector('.chapter-current').textContent = chapters[index].dataset.label;
    previous.disabled = index === 0;
    next.disabled = index === chapters.length - 1;
  }

  function update() {
    scheduled = false;
    const threshold = innerHeight * .43;
    let index = 0;
    chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top <= threshold) index = i; });
    activate(index);
    const distance = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--reading', Math.max(0, Math.min(1, scrollY / Math.max(1, distance))));
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function arrange() {
    frames.forEach((frame, i) => {
      (desktop.matches ? stage : chapters[i]).append(frame);
      frame.inert = desktop.matches && i !== current;
    });
    update();
  }
  function go(index) {
    const target = chapters[Math.max(0, Math.min(chapters.length - 1, index))];
    target.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  document.documentElement.classList.add('enhanced');
  arrange();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  desktop.addEventListener('change', arrange);
  previous.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  addEventListener('keydown', event => {
    if (dialog.open || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target.closest('button,input,textarea,select,video,[contenteditable]')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  });

  const notesToggle = document.querySelector('.notes-toggle');
  notesToggle.addEventListener('click', () => {
    const show = notesToggle.getAttribute('aria-pressed') !== 'true';
    const oldTop = chapters[current].getBoundingClientRect().top;
    notesToggle.setAttribute('aria-pressed', String(show));
    document.querySelectorAll('.design-note').forEach(note => note.hidden = !show);
    scrollBy({ top: chapters[current].getBoundingClientRect().top - oldTop, behavior: 'instant' });
    schedule();
  });

  document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
    const mobile = button.dataset.device === 'mobile';
    document.querySelector('.desktop-view').hidden = mobile;
    document.querySelector('.mobile-view').hidden = !mobile;
    document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('.device-caption').textContent = mobile ? 'Domain detail & recommendations · mobile designs' : 'Available domain · desktop design';
  }));

  document.querySelectorAll('.screen-button').forEach(button => button.addEventListener('click', () => {
    const source = button.querySelector('img');
    opener = button;
    dialogImage.src = source.src;
    dialogImage.alt = source.alt;
    document.querySelector('#image-title').textContent = button.closest('figure').dataset.caption;
    dialogCanvas.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Original size';
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  zoom.addEventListener('click', () => {
    const enlarged = dialogCanvas.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Fit to view' : 'Original size';
  });
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; opener?.focus({ preventScroll: true }); });
  const video = document.querySelector('video');
  if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) video.pause(); }, { threshold: .1 }).observe(video);
  document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });
})();
