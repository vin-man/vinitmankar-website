export const clamp01 = value => Math.max(0, Math.min(1, value));
const phase = (p,start,end) => clamp01((p-start)/(end-start));
const smooth = value => value*value*(3-2*value);
const ease = value => value<.5?4*value**3:1-((-2*value+2)**3)/2;

/** Pure, reversible scroll choreography. No wheel interception or forced scrolling. */
export function heroFrame(progress, viewportHeight, staticMode=false) {
  const p=staticMode?1:clamp01(progress);
  const copy=smooth(phase(p,.015,.24));
  const flight=ease(phase(p,.23,.68));
  const notes=smooth(phase(p,.68,.86));
  return {
    copyY:-viewportHeight*.29*copy,
    copyScale:1-.43*copy,
    subtitleOpacity:1-smooth(phase(p,.015,.16)),
    opacity:smooth(phase(p,.225,.29)),
    angle:360*(1-flight),
    lean:-19*(1-flight),
    y:-viewportHeight*.19*(1-flight),
    scale:.3+.78*flight,
    artNote:smooth(phase(p,.68,.77)),
    foldNote:smooth(phase(p,.72,.81)),
    logicNote:smooth(phase(p,.77,.86)),
    notesOffset:12*(1-notes),
    cue:smooth(phase(p,.84,.94)),
    arriving:p<.86,
  };
}
