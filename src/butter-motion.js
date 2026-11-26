// BURRO / Il Fuori Orario — warm analogue media treatments.
const assets=new Map();
export const butterControls=[['burn','BURN / EXPOSURE',.45,0,1],['warmth','BUTTER WARMTH',.55,0,1],['contrast','CONTRAST',.25,0,1],['fade','FADE / BLACK LIFT',.12,0,1],['grain','FILM GRAIN',.18,0,1],['soft','SOFT FOCUS',.12,0,1],['glow','HALATION',.25,0,1],['pixel','PIXEL SIZE',1,1,40],['threshold','THRESHOLD MIX',0,0,1],['smear','SMEAR',0,0,1],['glitch','GLITCH',0,0,1],['zoom','ZOOM',1,1,3],['rate','PLAYBACK SPEED',1,.1,2],['blur','BLUR',0,0,1],['motionBlur','MOTION BLUR',0,0,1],['liquify','LIQUIFY',0,0,1],['liquidScale','LIQUID SCALE',.45,0,1],['liquidSpeed','LIQUID SPEED',1,0,4],['meltY','MELT Y',0,0,1],['meltX','MELT X',0,0,1],['titleSize','TITLE SIZE',.35,.1,.7]];
export const butterDefaults=Object.fromEntries(butterControls.map(([k,l,v])=>['butter_'+k,v]));
export const butterAsset=id=>assets.get(id);
export async function loadButter(id,file){
 const url=URL.createObjectURL(file),isVideo=file.type.startsWith('video/')||/\.mp4$/i.test(file.name);
 const media=isVideo?document.createElement('video'):new Image();
 try{
 await new Promise((resolve,reject)=>{
  media.onerror=()=>reject(Error('Media not supported'));
  if(isVideo){media.muted=true;media.loop=true;media.playsInline=true;media.preload='auto';media.onloadeddata=resolve;}else media.onload=resolve;
  media.src=url;
 });
 if(isVideo)await media.play();
 const old=assets.get(id);if(old){old.media.pause?.();URL.revokeObjectURL(old.url)}
 assets.set(id,{media,url,name:file.name,isVideo});
 }catch(e){URL.revokeObjectURL(url);throw e}
}
const liquid=document.createElement('canvas');
const work=document.createElement('canvas'),grainCanvas=document.createElement('canvas');
grainCanvas.width=128;grainCanvas.height=128;
const gc=grainCanvas.getContext('2d');const pixels=gc.createImageData(128,128);
for(let i=0;i<pixels.data.length;i+=4){const n=Math.random()*255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=255}gc.putImageData(pixels,0,0);
export function renderButter(c,w,h,phase,s,p){
 const v=k=>Number(p['butter_'+k]??butterDefaults['butter_'+k]);
 const a=assets.get(s.id);c.save();c.fillStyle='#160d08';c.fillRect(0,0,w,h);
 if(a){
 const m=a.media;if(a.isVideo){m.playbackRate=v('rate');if(m.paused)m.play().catch(()=>{});}
 const mw=m.videoWidth||m.naturalWidth,mh=m.videoHeight||m.naturalHeight;
 if(mw&&mh){
 const pix=v('pixel');work.width=Math.max(2,Math.round(w/pix));work.height=Math.max(2,Math.round(h/pix));
 const x=work.getContext('2d'),ww=work.width,hh=work.height;
 const z=Math.max(ww/mw,hh/mh)*v('zoom');
 x.filter='brightness('+(1+v('burn')*.65)+') contrast('+(1+v('contrast')*.9)+') sepia('+v('warmth')*.45+') saturate('+(1+v('warmth')*.5)+')';
 x.drawImage(m,(ww-mw*z)/2,(hh-mh*z)/2,mw*z,mh*z);
 // Two-pass strip displacement with wrapped edges, before typography.
 let source=work;
 if(v('liquify')>0||v('meltX')>0||v('meltY')>0){
 const tmp=document.createElement('canvas');tmp.width=ww;tmp.height=hh;
 const tx=tmp.getContext('2d');liquid.width=ww;liquid.height=hh;const lx=liquid.getContext('2d');
 const t=phase*Math.PI*2*Math.round(v('liquidSpeed')),freq=1+v('liquidScale')*5;
 const wrap=(n,d)=>((n%d)+d)%d;
 const step=Math.max(1,Math.floor(hh/100));
 for(let y=0;y<hh;y+=step){const n=Math.min(step,hh-y),dx=wrap(Math.round(ww*(v('liquify')*.045+v('meltX')*.12)*Math.sin(y/hh*freq*6.283+t)),ww);tx.drawImage(work,0,y,ww,n,dx,y,ww,n);if(dx)tx.drawImage(work,0,y,ww,n,dx-ww,y,ww,n)}
 const sx=Math.max(1,Math.floor(ww/160));
 for(let i=0;i<ww;i+=sx){const n=Math.min(sx,ww-i),dy=wrap(Math.round(hh*(v('liquify')*.12+v('meltY')*.28)*Math.sin(i/ww*freq*6.283-t)),hh);lx.drawImage(tmp,i,0,n,hh,i,dy,n,hh);if(dy)lx.drawImage(tmp,i,0,n,hh,i,dy-hh,n,hh)}
 source=liquid;
 }
 c.imageSmoothingEnabled=pix<2;c.filter='blur('+(v('soft')*.018+v('blur')*.08)*h+'px)';c.drawImage(source,0,0,w,h);c.filter='none';
 if(v('motionBlur')>0){c.globalAlpha=v('motionBlur')*.18;for(let i=1;i<=5;i++){const dx=Math.sin(phase*6.283)*i*h*.015*v('motionBlur');c.drawImage(source,dx,0,w,h)}c.globalAlpha=1}
 if(v('threshold')>0){c.globalAlpha=v('threshold')*.65;c.filter='grayscale(1) contrast(5)';c.drawImage(source,0,0,w,h);c.filter='none';c.globalAlpha=1}
 if(v('smear')>0){c.globalAlpha=v('smear')*.4;c.drawImage(source,w*.025,0,w,h);c.globalAlpha=1}
 if(v('glitch')>0){for(let i=0;i<5;i++){const y=((i*.21+phase)%1)*h;c.drawImage(source,0,y/h*hh,ww,hh*.035,Math.sin(i+phase*6.28)*w*.04*v('glitch'),y,w,h*.035)}}
 c.globalCompositeOperation='screen';c.globalAlpha=v('glow')*.35;c.filter='blur('+h*.035+'px)';c.drawImage(source,0,0,w,h);c.filter='none';c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
 }else{const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#7896ae');g.addColorStop(.5,'#e4cf88');g.addColorStop(1,'#fff0c1');c.fillStyle=g;c.fillRect(0,0,w,h)}
 c.fillStyle='rgba(255,215,145,'+v('fade')*.35+')';c.fillRect(0,0,w,h);
 c.globalCompositeOperation='soft-light';c.globalAlpha=v('grain')*.65;c.fillStyle=c.createPattern(grainCanvas,'repeat');c.fillRect(0,0,w,h);c.globalAlpha=1;c.globalCompositeOperation='source-over';
 const title=p.butter_title??(s.variant===0?'Il Fuori Orario':s.variant===1?'Burro':'Il Fuori Orario');
 if(title){c.fillStyle=p.butter_textColor||s.colors[1];c.font='italic '+Math.round(h*v('titleSize'))+'px "Bodoni MT", Didot, "Times New Roman", serif';c.textAlign='center';c.textBaseline='middle';c.fillText(title,w/2,h/2,w*.94)}
 c.restore();
}
