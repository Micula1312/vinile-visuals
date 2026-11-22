// SUNSET STUDIES — optional analog film finishing, applied after the original scene.
const film=document.createElement('canvas');
const grainTile=document.createElement('canvas');
grainTile.width=192;grainTile.height=192;
const g=grainTile.getContext('2d');
const noise=g.createImageData(192,192);
let seed=4312;
for(let i=0;i<noise.data.length;i+=4){
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 const n=seed>>>24;
 noise.data[i]=noise.data[i+1]=noise.data[i+2]=n;
 noise.data[i+3]=255;
}
g.putImageData(noise,0,0);
export function finishSunset(c,w,h,p,phase){
 const grain=Math.max(0,p.sunsetGrain||0),glow=Math.max(0,p.sunsetGlow||0),blur=Math.max(0,p.sunsetBlur||0);
 if(!grain&&!glow&&!blur)return;
 const scale=Math.min(1,1200/w),fw=Math.max(1,Math.round(w*scale)),fh=Math.max(1,Math.round(h*scale));
 if(film.width!==fw||film.height!==fh){film.width=fw;film.height=fh}
 const f=film.getContext('2d',{alpha:false});
 f.clearRect(0,0,fw,fh);f.drawImage(c.canvas,0,0,fw,fh);
 if(blur){
  c.save();c.filter='blur('+Math.round(blur*h*.06)+'px)';
  c.drawImage(film,0,0,w,h);c.restore();
 }
 if(glow){
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(.75,glow*.65);
  c.filter='blur('+Math.max(2,Math.round(glow*h*.075))+'px)';
  c.drawImage(film,0,0,w,h);c.restore();
 }
 if(grain){
  // Stable, tiled luminance grain: avoids per-frame random flicker and remains loopable.
  c.save();c.globalCompositeOperation='soft-light';c.globalAlpha=grain*.85;
  c.imageSmoothingEnabled=false;
  const size=Math.max(96,Math.round(h*.38));
  for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size)c.drawImage(grainTile,x,y,size,size);
  c.restore();
 }
}
