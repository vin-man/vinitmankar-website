import './hero-scroll.js';

// Existing case-study thumbnail animations stay local to their visible section.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const sequences=document.querySelectorAll('.motion-sequence');
const visibility=new Map();
function sync(){sequences.forEach(element=>element.classList.toggle('is-active',!reducedMotion.matches&&visibility.get(element)!==false));}
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>visibility.set(entry.target,entry.isIntersecting));sync();},{threshold:.18,rootMargin:'8% 0px 8% 0px'});
  sequences.forEach(element=>{visibility.set(element,false);observer.observe(element);});
}
reducedMotion.addEventListener('change',sync);
sync();
