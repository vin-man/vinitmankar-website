import './components/mobius-approved/mobius-approved.js';
import {heroFrame,clamp01} from './hero-timeline.js';

const scene=document.querySelector('.hero-journey');
if(scene){
  const art=scene.querySelector('approved-mobius');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const toggle=scene.querySelector('#hero-motion');
  let manualStatic=false,pending=false;
  function render(){
    pending=false;
    const staticMode=reduced.matches||manualStatic;
    scene.classList.toggle('motion-reduced',staticMode);
    const rect=scene.getBoundingClientRect();
    const viewport=scene.querySelector('.hero-pin').clientHeight;
    const progress=clamp01(-rect.top/Math.max(1,rect.height-viewport));
    const f=heroFrame(progress,viewport,staticMode);
    scene.style.setProperty('--copy-y',`${f.copyY}px`);
    scene.style.setProperty('--copy-scale',f.copyScale);
    scene.style.setProperty('--subtitle-opacity',f.subtitleOpacity);
    scene.style.setProperty('--work-cue-opacity',f.cue);
    for(const [name,value] of Object.entries({'arrival-opacity':f.opacity,'arrival-angle':`${f.angle}deg`,'arrival-lean':`${f.lean}deg`,'arrival-y':`${f.y}px`,'arrival-scale':f.scale,'art-note-opacity':f.artNote,'fold-note-opacity':f.foldNote,'logic-note-opacity':f.logicNote,'notes-offset':`${f.notesOffset}px`}))art.style.setProperty(`--${name}`,value);
    art.toggleAttribute('arriving',f.arriving&&!staticMode);
    art.toggleAttribute('paused',staticMode);
    if(f.arriving||staticMode)art.resetHover?.();
    scene.dataset.phase=staticMode?'static':progress<.23?'intro':progress<.68?'flip':progress<.86?'annotations':'settled';
    toggle.setAttribute('aria-pressed',String(staticMode));
    toggle.textContent=staticMode?'Motion off':'Motion on';
    toggle.disabled=reduced.matches;
    toggle.title=reduced.matches?'Following your reduced-motion preference':'Toggle the scroll introduction';
  }
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render);}}
  scene.dataset.enhanced='true';
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
  reduced.addEventListener('change',schedule);
  toggle.addEventListener('click',()=>{manualStatic=!manualStatic;render();});
  art.addEventListener('asset-ready',schedule);
  if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>art.toggleAttribute('inactive',!entry.isIntersecting)).observe(scene);
  render();
}
