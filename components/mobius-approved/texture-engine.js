/* Deterministic, live image treatments. Source assets are never overwritten. */
(() => {
  const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
  const clamp = n => Math.max(0,Math.min(1,n));
  const noise = (x,y) => {let a=Math.imul(x+17,374761393)^Math.imul(y+31,668265263);a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;};
  function tone(luma,strength=1){return clamp((luma-.7)*(1.5+strength*.7)+.48);}
  function quantize(luma,x,y,levels=4,strength=1){const n=tone(luma,strength);return Math.round(clamp(n+(bayer[(y%4)*4+x%4]/16-.5)/(levels-1))*(levels-1));}
  function pixels(source,width,height,type,strength=1){
    const out=new Uint8ClampedArray(source.length),four=[45,115,185,250];
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=(y*width+x)*4,luma=(source[i]*.2126+source[i+1]*.7152+source[i+2]*.0722)/255;
      let rgb=[source[i],source[i+1],source[i+2]],n=noise(x,y),g=tone(luma,strength);
      if(type==='dither'){const v=four[quantize(luma,x,y,4,strength)];rgb=[v,v,v];}
      if(type==='ink'){const v=quantize(luma,x,y,2,strength)?250:40;rgb=[v,v,v];}
      if(type==='stipple'){const v=n>g?52:248;rgb=[v,v,v];}
      if(type==='riso'){rgb=n>g?(noise(x+71,y)<x/width?[206,111,80]:[72,91,168]):[247,241,225];}
      if(type==='grain'){const delta=(n-.5)*34*strength;rgb=rgb.map(v=>Math.max(0,Math.min(255,v+delta)));}
      if(type==='hatch'){const a=(x+y)%8<1,b=(x-y+width)%9<1;const v=((a&&g<.94)||(b&&g<.75))?80:Math.round(225+g*25);rgb=[v,v,Math.max(0,v-4)];}
      if(type==='scan'){const f=y%4===0?1-.15*strength:1;rgb=rgb.map(v=>Math.round(v*f));}
      out[i]=rgb[0];out[i+1]=rgb[1];out[i+2]=rgb[2];out[i+3]=255;
    }
    return out;
  }
  globalThis.MobiusTextures={quantize,pixels,tone,noise};
})();
