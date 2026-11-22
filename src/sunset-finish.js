// SUNSET STUDIES — deterministic analog finishing. All effects are optional and loop-safe.
const film=document.createElement('canvas'),processed=document.createElement('canvas'),grainTile=document.createElement('canvas');
grainTile.width=192;grainTile.height=192;
const g=grainTile.getContext('2d'),noise=g.createImageData(192,192);
let seed=4312;
for(let i=0;i<noise.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=seed>>>24;noise.data[i]=noise.data[i+1]=noise.data[i+2]=n;noise.data[i+3]=255}
g.putImageData(noise,0,0);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export function finishSunset(c,w,h,p,phase){
 const grain=clamp(p.sunsetGrain||0),glow=clamp(p.sunsetGlow||0),blur=clamp(p.sunsetBlur||0);
 const lift=clamp(p.sunsetBlackLift||0),gradient=clamp(p.sunsetGradient||0),halation=clamp(p.sunsetHalation||0);
 if(!(grain||glow||blur||lift||gradient||halation))return;
 const scale=Math.min(1,1200/w),fw=Math.max(1,Math.round(w*scale)),fh=Math.max(1,Math.round(h*scale));
 if(film.width!==fw||film.height!==fh){film.width=fw;film.height=fh}
 if(processed.width!==fw||processed.height!==fh){processed.width=fw;processed.height=fh}
 const f=film.getContext('2d',{willReadFrequently:true}),out=processed.getContext('2d',{willReadFrequently:true});
 f.clearRect(0,0,fw,fh);f.drawImage(c.canvas,0,0,fw,fh);
 if(lift||gradient){
  const image=f.getImageData(0,0,fw,fh),d=image.data;
  for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
   const i=(y*fw+x)*4,r=d[i],gg=d[i+1],b=d[i+2];
   const hi=Math.max(r,gg,b),lo=Math.min(r,gg,b),lum=(r*.2126+gg*.7152+b*.0722)/255;
   // Raise only deep shadows, leaving them opaque and slightly olive/brown.
   const shadow=lift*Math.pow(1-lum,3);
   let nr=r*(1-shadow)+27*shadow,ng=gg*(1-shadow)+31*shadow,nb=b*(1-shadow)+24*shadow;
   // Tint the brighter discs, not the dark background or fine black stripes.
   const chroma=clamp((hi-lo)/110),mask=gradient*clamp((lum-.17)*2.3)*(.35+.65*chroma);
   const yy=y/Math.max(1,fh-1),xx=x/Math.max(1,fw-1);
   const v=clamp(.5+.5*Math.sin(yy*5.8+xx*1.5-.7));
   const tr=244*(1-v)+150*v,tg=117*(1-v)+132*v,tb=93*(1-v)+248*v;
   nr=nr*(1-mask)+tr*mask;ng=ng*(1-mask)+tg*mask;nb=nb*(1-mask)+tb*mask;
   d[i]=nr;d[i+1]=ng;d[i+2]=nb;
  }
  out.putImageData(image,0,0);
 }else{out.clearRect(0,0,fw,fh);out.drawImage(film,0,0)}
 // Replace the original image only when color finishing is requested.
 if(lift||gradient){c.save();c.globalCompositeOperation='copy';c.drawImage(processed,0,0,w,h);c.restore()}
 if(blur){c.save();c.globalAlpha=Math.min(.65,blur*.52);c.filter='blur('+Math.max(1,Math.round(blur*h*.042))+'px)';c.drawImage(processed,0,0,w,h);c.restore()}
 if(glow||halation){
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=Math.min(.65,glow*.35+halation*.28);
  c.filter='blur('+Math.max(2,Math.round((glow*.055+halation*.085)*h))+'px)';
  c.drawImage(processed,0,0,w,h);c.restore();
 }
 if(halation){
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=halation*.22;
  c.filter='blur('+Math.max(2,Math.round(halation*h*.024))+'px)';
  c.drawImage(processed,0,0,w,h);c.restore();
 }
 if(grain){
  c.save();c.globalCompositeOperation='soft-light';c.globalAlpha=grain*.85;c.imageSmoothingEnabled=false;
  const size=Math.max(96,Math.round(h*.38));
  for(let y=0;y<h;y+=size)for(let x=0;x<w;x+=size)c.drawImage(grainTile,x,y,size,size);
  c.restore();
 }
}
