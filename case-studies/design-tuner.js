(() => {
  const STORAGE_KEY = 'vinit-domain-agent-design-v1';
  const editing = new URLSearchParams(window.location.search).get('edit') === '1';
  const root = document.documentElement;

  const defaults = {
    paper: '#ffffff', ink: '#141611', orange: '#f2532f', blue: '#143aaf',
    stageCream: '#e8e4d8', stageLilac: '#e5e4f1', stagePeach: '#f0e2d9',
    stageBlue: '#cfd8eb', stageYellow: '#eadfbf', mediaRadius: 18,
    imageRadius: 11, mediaPad: 62, mediaRatio: 1.6, scrollSpeed: 15,
    grainOpacity: 0.07, shellMax: 1400, shellGutter: 96
  };

  const globalProperties = {
    paper: ['--paper', ''], ink: ['--ink', ''], orange: ['--orange', ''], blue: ['--blue', ''],
    stageCream: ['--stage-cream', ''], stageLilac: ['--stage-lilac', ''],
    stagePeach: ['--stage-peach', ''], stageBlue: ['--stage-blue', ''],
    stageYellow: ['--stage-yellow', ''], mediaRadius: ['--media-radius', 'px'],
    imageRadius: ['--image-radius', 'px'], mediaPad: ['--media-pad', 'px'],
    mediaRatio: ['--media-ratio', ''], scrollSpeed: ['--scroll-speed', 's'],
    grainOpacity: ['--grain-opacity', ''], shellMax: ['--shell-max', 'px'],
    shellGutter: ['--shell-gutter', 'px']
  };

  let state;
  try {
    state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { global: {}, elements: {} };
  } catch {
    state = { global: {}, elements: {} };
  }
  state.global ||= {};
  state.elements ||= {};
  // Carry the previous beige canvas preference forward to the new white theme.
  if (['#f4f0df', '#f5f0da'].includes(String(state.global.paper).toLowerCase())) state.global.paper = '#ffffff';

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function applyGlobal() {
    Object.entries(state.global).forEach(([key, value]) => {
      const property = globalProperties[key];
      if (property) root.style.setProperty(property[0], `${value}${property[1]}`);
    });
  }

  const sections = Array.from(document.querySelectorAll('main > section'));
  sections.forEach((element, index) => {
    const name = Array.from(element.classList).find((item) => item !== 'shell') || `section-${index + 1}`;
    element.dataset.tuneId = `section-${name}`;
    element.dataset.tuneLabel = name.replaceAll('-', ' ');
  });

  const stages = Array.from(document.querySelectorAll('.product-stage,.mobile-product-stage'));
  stages.forEach((element, index) => {
    const caption = element.closest('figure')?.querySelector('figcaption span')?.textContent?.trim();
    const slug = (caption || `media-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    element.dataset.tuneId = `media-${slug}`;
    element.dataset.tuneLabel = caption || `Media ${index + 1}`;
  });

  function applyElement(element, values) {
    if (!element || !values) return;
    const isStage = element.matches('.product-stage,.mobile-product-stage');
    if (values.background) element.style.background = values.background;
    if (values.paddingTop !== undefined) element.style.paddingTop = `${values.paddingTop}px`;
    if (values.paddingBottom !== undefined) element.style.paddingBottom = `${values.paddingBottom}px`;
    if (values.columnSplit !== undefined) {
      element.dataset.tuneGrid = 'true';
      element.style.setProperty('--tune-grid-columns', `${values.columnSplit}fr ${100 - values.columnSplit}fr`);
    }
    element.classList.toggle('tune-reverse-columns', Boolean(values.reverseColumns));

    if (isStage) {
      if (values.radius !== undefined) element.style.borderRadius = `${values.radius}px`;
      if (values.padding !== undefined) element.style.setProperty('--stage-pad', `${values.padding}px`);
      if (values.ratio !== undefined) element.style.aspectRatio = String(values.ratio);
      if (values.imageScale !== undefined) element.style.setProperty('--image-scale', values.imageScale);
      if (values.imageX !== undefined) element.style.setProperty('--image-x', `${values.imageX}px`);
      if (values.imageY !== undefined) element.style.setProperty('--image-y', `${values.imageY}px`);
      if (values.scrollSpeed !== undefined) element.style.setProperty('--stage-scroll-speed', `${values.scrollSpeed}s`);
      if (values.imageSrc) {
        const image = element.querySelector('img');
        if (image && image.getAttribute('src') !== values.imageSrc) image.src = values.imageSrc;
      }
    }
  }

  applyGlobal();
  document.querySelectorAll('[data-tune-id]').forEach((element) => applyElement(element, state.elements[element.dataset.tuneId]));

  if (!editing) return;

  document.body.classList.add('design-editing', 'tuner-panel-open');
  const panel = document.createElement('aside');
  panel.className = 'design-tuner';
  panel.setAttribute('aria-label', 'Portfolio design controls');
  panel.innerHTML = `
    <div class="tuner-head">
      <div><strong>Design mode</strong><small>LOCAL · AUTOSAVED</small></div>
      <div class="tuner-head-actions">
        <button class="tuner-icon-button" data-tuner-exit type="button" title="Exit design mode">×</button>
        <button class="tuner-icon-button" data-tuner-collapse type="button" title="Collapse controls">−</button>
      </div>
    </div>
    <div class="tuner-scroll">
      <p class="tuner-note">Click any section or image stage to edit it. Your choices persist in this browser.</p>
      <section class="tuner-group"><h3>Page</h3><div data-global-colors></div></section>
      <section class="tuner-group"><h3>Image system</h3><div data-global-media></div></section>
      <section class="tuner-group"><h3>Selected element</h3><p class="tuner-selected-name" data-selected-name>Nothing selected</p><div data-selected-controls></div></section>
      <section class="tuner-group"><h3>Handoff</h3><div class="tuner-actions"><button class="tuner-button tuner-button-primary" data-copy type="button">Copy settings</button><button class="tuner-button" data-reset type="button">Reset all</button></div><p class="tuner-status" data-status></p></section>
    </div>`;
  document.body.append(panel);

  const globalColorHost = panel.querySelector('[data-global-colors]');
  const globalMediaHost = panel.querySelector('[data-global-media]');
  const selectedHost = panel.querySelector('[data-selected-controls]');
  const selectedName = panel.querySelector('[data-selected-name]');
  const status = panel.querySelector('[data-status]');
  let selected = null;
  let previewUrl = null;

  function announce(message) {
    status.textContent = message;
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => { status.textContent = ''; }, 2400);
  }

  function fieldShell(label) {
    const field = document.createElement('label');
    field.className = 'tuner-field';
    const text = document.createElement('span');
    text.textContent = label;
    field.append(text);
    return field;
  }

  function addColor(host, label, value, onChange) {
    const field = fieldShell(label);
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.addEventListener('input', () => onChange(input.value));
    field.append(input);
    host.append(field);
  }

  function addRange(host, label, value, min, max, step, suffix, onChange) {
    const field = fieldShell(label);
    const output = document.createElement('output');
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = value;
    const renderValue = () => { output.value = `${Number(input.value).toFixed(step < 1 ? 2 : 0)}${suffix}`; };
    renderValue();
    input.addEventListener('input', () => { renderValue(); onChange(Number(input.value)); });
    field.append(output, input);
    host.append(field);
  }

  function addCheck(host, label, checked, onChange) {
    const field = document.createElement('label');
    field.className = 'tuner-check';
    const input = document.createElement('input');
    input.type = 'checkbox'; input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    field.append(document.createTextNode(label), input);
    host.append(field);
  }

  function updateGlobal(key, value) {
    state.global[key] = value;
    const [property, unit] = globalProperties[key];
    root.style.setProperty(property, `${value}${unit}`);
    save();
    window.dispatchEvent(new Event('resize'));
  }

  [['Canvas', 'paper'], ['Text', 'ink'], ['Accent', 'orange'], ['Deep blue', 'blue'],
   ['Warm stage', 'stageCream'], ['Lilac stage', 'stageLilac'], ['Peach stage', 'stagePeach'],
   ['Blue stage', 'stageBlue'], ['Yellow stage', 'stageYellow']].forEach(([label, key]) =>
    addColor(globalColorHost, label, state.global[key] ?? defaults[key], (value) => updateGlobal(key, value))
  );

  addRange(globalMediaHost, 'Outer radius', state.global.mediaRadius ?? defaults.mediaRadius, 0, 42, 1, 'px', (value) => updateGlobal('mediaRadius', value));
  addRange(globalMediaHost, 'Image radius', state.global.imageRadius ?? defaults.imageRadius, 0, 30, 1, 'px', (value) => updateGlobal('imageRadius', value));
  addRange(globalMediaHost, 'Image padding', state.global.mediaPad ?? defaults.mediaPad, 0, 130, 1, 'px', (value) => updateGlobal('mediaPad', value));
  addRange(globalMediaHost, 'Frame ratio', state.global.mediaRatio ?? defaults.mediaRatio, 1, 2.1, .01, '', (value) => updateGlobal('mediaRatio', value));
  addRange(globalMediaHost, 'Auto-scroll', state.global.scrollSpeed ?? defaults.scrollSpeed, 6, 32, 1, 's', (value) => updateGlobal('scrollSpeed', value));
  addRange(globalMediaHost, 'Texture', state.global.grainOpacity ?? defaults.grainOpacity, 0, .18, .01, '', (value) => updateGlobal('grainOpacity', value));
  addRange(globalMediaHost, 'Content width', state.global.shellMax ?? defaults.shellMax, 980, 1600, 10, 'px', (value) => updateGlobal('shellMax', value));
  addRange(globalMediaHost, 'Page gutter', state.global.shellGutter ?? defaults.shellGutter, 36, 180, 2, 'px', (value) => updateGlobal('shellGutter', value));

  function rgbToHex(color) {
    if (color.startsWith('#')) return color.slice(0, 7);
    const parts = color.match(/[\d.]+/g)?.map(Number) || [];
    if (parts.length < 3 || (parts.length > 3 && parts[3] === 0)) return state.global.paper || defaults.paper;
    return `#${parts.slice(0, 3).map((part) => Math.round(part).toString(16).padStart(2, '0')).join('')}`;
  }

  function updateSelected(key, value) {
    if (!selected) return;
    const id = selected.dataset.tuneId;
    state.elements[id] ||= {};
    state.elements[id][key] = value;
    applyElement(selected, state.elements[id]);
    save();
    window.dispatchEvent(new Event('resize'));
  }

  function addSelectedActions(values) {
    const actions = document.createElement('div');
    actions.className = 'tuner-actions';
    const clear = document.createElement('button');
    clear.className = 'tuner-button'; clear.type = 'button'; clear.textContent = 'Clear overrides';
    clear.addEventListener('click', () => {
      delete state.elements[selected.dataset.tuneId];
      save(); window.location.reload();
    });
    actions.append(clear);
    selectedHost.append(actions);
  }

  function renderSelected() {
    selectedHost.replaceChildren();
    if (!selected) return;
    selectedName.textContent = selected.dataset.tuneLabel;
    const values = state.elements[selected.dataset.tuneId] || {};
    const style = getComputedStyle(selected);
    const isStage = selected.matches('.product-stage,.mobile-product-stage');

    addColor(selectedHost, 'Background', values.background || rgbToHex(style.backgroundColor), (value) => updateSelected('background', value));

    if (isStage) {
      const ratio = selected.clientWidth / selected.clientHeight;
      addRange(selectedHost, 'Radius', values.radius ?? (parseFloat(style.borderRadius) || 0), 0, 44, 1, 'px', (value) => updateSelected('radius', value));
      addRange(selectedHost, 'Padding', values.padding ?? (parseFloat(style.getPropertyValue('--stage-pad')) || 0), 0, 150, 1, 'px', (value) => updateSelected('padding', value));
      addRange(selectedHost, 'Frame ratio', values.ratio ?? ratio, .72, 2.2, .01, '', (value) => updateSelected('ratio', value));
      addRange(selectedHost, 'Image scale', values.imageScale ?? 1, .55, 1.45, .01, '×', (value) => updateSelected('imageScale', value));
      addRange(selectedHost, 'Image X', values.imageX ?? 0, -180, 180, 1, 'px', (value) => updateSelected('imageX', value));
      addRange(selectedHost, 'Image Y', values.imageY ?? 0, -180, 180, 1, 'px', (value) => updateSelected('imageY', value));
      if (selected.classList.contains('product-stage-scroll')) {
        addRange(selectedHost, 'Scroll speed', values.scrollSpeed ?? state.global.scrollSpeed ?? defaults.scrollSpeed, 6, 36, 1, 's', (value) => updateSelected('scrollSpeed', value));
      }

      const image = selected.querySelector('img');
      const sourceField = fieldShell('Image asset path');
      const source = document.createElement('input');
      source.type = 'text'; source.value = values.imageSrc || image?.getAttribute('src') || '';
      source.addEventListener('change', () => updateSelected('imageSrc', source.value.trim()));
      sourceField.append(source); selectedHost.append(sourceField);

      const fileButton = document.createElement('label');
      fileButton.className = 'tuner-button tuner-file';
      fileButton.textContent = 'Preview a local image';
      const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*';
      file.addEventListener('change', () => {
        if (!file.files?.[0] || !image) return;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(file.files[0]); image.src = previewUrl;
        announce('Preview only — add the export to assets to keep it.');
      });
      fileButton.append(file); selectedHost.append(fileButton);
    } else {
      addRange(selectedHost, 'Top spacing', values.paddingTop ?? (parseFloat(style.paddingTop) || 0), 0, 240, 2, 'px', (value) => updateSelected('paddingTop', value));
      addRange(selectedHost, 'Bottom spacing', values.paddingBottom ?? (parseFloat(style.paddingBottom) || 0), 0, 240, 2, 'px', (value) => updateSelected('paddingBottom', value));
      if (style.display === 'grid') {
        addRange(selectedHost, 'Column split', values.columnSplit ?? 50, 25, 75, 1, '%', (value) => updateSelected('columnSplit', value));
        addCheck(selectedHost, 'Reverse columns', values.reverseColumns ?? false, (value) => updateSelected('reverseColumns', value));
      }
    }
    addSelectedActions(values);
  }

  document.addEventListener('click', (event) => {
    if (event.target.closest('.design-tuner')) return;
    const target = event.target.closest('.product-stage,.mobile-product-stage') || event.target.closest('main > section');
    if (!target) return;
    selected?.removeAttribute('data-tune-selected');
    selected = target;
    selected.dataset.tuneSelected = 'true';
    renderSelected();
  }, true);

  panel.querySelector('[data-tuner-collapse]').addEventListener('click', () => {
    const collapsed = panel.classList.toggle('is-collapsed');
    document.body.classList.toggle('tuner-panel-open', !collapsed);
    panel.querySelector('[data-tuner-collapse]').textContent = collapsed ? '+' : '−';
  });

  panel.querySelector('[data-tuner-exit]').addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.location.href = `${url.pathname}${url.search}${url.hash}`;
  });

  panel.querySelector('[data-copy]').addEventListener('click', async () => {
    const payload = JSON.stringify(state, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      announce('Settings copied — paste them into Codex.');
    } catch {
      const temporary = document.createElement('textarea');
      temporary.value = payload; document.body.append(temporary); temporary.select();
      document.execCommand('copy'); temporary.remove();
      announce('Settings copied — paste them into Codex.');
    }
  });

  panel.querySelector('[data-reset]').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });
})();
