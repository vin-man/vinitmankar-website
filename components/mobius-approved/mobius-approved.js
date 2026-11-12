import './texture-engine.js';

const root = new URL('.', import.meta.url);
let instance = 0;

/** Frozen approved artwork. Independent of the decision room and browser storage. */
class ApprovedMobius extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const id = `approved-mobius-${++instance}`;
    const white = new URL('source-white.png', root).href;
    const silhouette = new URL('silhouette-source.png', root).href;
    const shadow = this.attachShadow({mode:'open'});
    shadow.innerHTML = `
      <link rel="stylesheet" href="${new URL('mobius-approved.css',root)}">
      <figure aria-label="Creativity and logic, art and science: one continuous practice">
        <div class="hover-layer">
          <div class="arrival-layer">
            <svg class="surface" viewBox="-130 30 1514 1200" aria-hidden="true">
              <defs>
                <filter id="${id}-alpha" color-interpolation-filters="sRGB" x="-3%" y="-3%" width="106%" height="106%">
                  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -.2126 -.7152 -.0722 0 1"/>
                  <feComponentTransfer><feFuncA type="linear" slope="12" intercept="-1.2"/></feComponentTransfer>
                  <feMorphology operator="dilate" radius="8"/><feMorphology operator="erode" radius="8"/>
                </filter>
                <mask id="${id}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254" style="mask-type:alpha">
                  <image href="${silhouette}" width="1254" height="1254" filter="url(#${id}-alpha)"/>
                </mask>
              </defs>
              <g mask="url(#${id}-mask)" class="surface-color">
                <image class="ring-image" href="${white}" width="1254" height="1254"/>
                <rect class="surface-pulse" width="1254" height="1254" fill="#dae2f7"/>
              </g>
            </svg>
          </div>
          <svg class="annotations" viewBox="-130 30 1514 1200" role="img" aria-label="Art: Creativity. Imagine possibilities. Science: Logic. Test possibilities. Reframe, test, learn.">
            <g class="note art-note">
              <path class="leader" d="M234 239 Q240 291 323 358"/><circle class="anchor" cx="323" cy="358" r="5"/>
              <g transform="translate(30 130)"><text class="eyebrow" y="0">ART</text><text class="title" y="52">Creativity</text><text class="body" y="95">Imagine possibilities.</text></g>
            </g>
            <g class="note logic-note">
              <path class="leader" d="M932 987 Q978 929 942 844"/><circle class="anchor" cx="942" cy="844" r="5"/>
              <g transform="translate(845 1020)"><text class="eyebrow" y="0">SCIENCE</text><text class="title" y="52">Logic</text><text class="body" y="95">Test possibilities.</text></g>
            </g>
            <g class="note fold-note">
              <path class="leader" d="M957 241 Q879 263 814 343"/>
              <text x="921" y="213" class="fold-label">reframe → test → learn</text>
              <path class="research-mark" d="M799 328 l-9 -12 M822 322 l1 -15 M838 338 l14 -5"/>
            </g>
          </svg>
        </div>
      </figure>`;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    this.resize = new ResizeObserver(() => this.sizeLabels());
    this.resize.observe(this);
    this.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch' || reduced.matches || this.hasAttribute('paused') || this.hasAttribute('arriving')) return;
      const box = this.getBoundingClientRect();
      const x = (event.clientX-box.left)/box.width*2-1;
      const y = (event.clientY-box.top)/box.height*2-1;
      this.style.setProperty('--hover-x',`${-y*5*1.8}deg`);
      this.style.setProperty('--hover-y',`${x*7*1.8}deg`);
    });
    this.addEventListener('pointerleave', () => this.resetHover());
    reduced.addEventListener('change', () => this.resetHover());
    this.loadTexture(white);
  }

  async loadTexture(url) {
    try {
      const image = new Image(); image.src=url; await image.decode();
      const canvas=document.createElement('canvas');canvas.width=canvas.height=384;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,384,384);
      const original=ctx.getImageData(0,0,384,384);
      const pixels=globalThis.MobiusTextures.pixels(original.data,384,384,'dither',.55);
      ctx.putImageData(new ImageData(pixels,384,384),0,0);
      const data=canvas.toDataURL('image/png');
      this.shadowRoot.querySelector('.ring-image').setAttribute('href',data);
      this.dataset.ready='true';
      this.dispatchEvent(new CustomEvent('asset-ready',{bubbles:true}));
    } catch (error) {
      this.dataset.ready='fallback';
      this.dispatchEvent(new CustomEvent('asset-ready',{bubbles:true}));
      console.warn('Using the original Möbius surface as a fallback.',error);
    }
  }

  sizeLabels() {
    const svg=this.shadowRoot.querySelector('.annotations'), box=svg.getBoundingClientRect();
    const scale=Math.min(box.width/1514,box.height/1200); if(!scale)return;
    this.style.setProperty('--index-size',`${Math.max(18,11/scale)}px`);
    this.style.setProperty('--title-size',`${Math.max(32,20/scale)}px`);
    this.style.setProperty('--body-size',`${Math.max(22,12/scale)}px`);
    this.style.setProperty('--fold-size',`${Math.max(22,11/scale)}px`);
    const gap=Math.max(49,24/scale);
    this.shadowRoot.querySelectorAll('.title').forEach(e=>e.setAttribute('y',gap));
    this.shadowRoot.querySelectorAll('.body').forEach(e=>e.setAttribute('y',gap+Math.max(36,18/scale)));
  }

  resetHover() {
    this.style.setProperty('--hover-x','0deg');this.style.setProperty('--hover-y','0deg');
  }
}
if(!customElements.get('approved-mobius'))customElements.define('approved-mobius',ApprovedMobius);
