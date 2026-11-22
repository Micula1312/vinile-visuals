// RED FEVER — user GIFs decoded into deterministic frames for preview and export.
// Chrome/Edge ImageDecoder API. Assets remain local to this browser session.
const clips=new Map();
let sharedAsset=null;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function getRedAsset(id){return clips.get(id)||sharedAsset}
export function clearRedAssets(){for(const a of clips.values())for(const f of a.frames)f.image.close?.();clips.clear();sharedAsset=null}
export async function loadRedGif(file,id){
 if(!file||!(/image\/gif/i.test(file.type)||/\.gif$/i.test(file.name)))throw Error('Choose a .gif file');
 if(!('ImageDecoder' in window))throw Error('Animated GIF decoding needs Chrome or Edge with ImageDecoder support');
 const data=await file.arrayBuffer();
 const decoder=new ImageDecoder({data:new Uint8Array(data),type:'image/gif',preferAnimation:true});
 try{
  await decoder.tracks.ready;
  const track=decoder.tracks.selectedTrack;
  if(!track)throw Error('No GIF animation track found');
  const count=track.frameCount;
  if(!count||count>500)throw Error('GIF must have 1–500 frames');
  const frames=[];let total=0;
  for(let i=0;i<count;i++){
   const {image}=await decoder.decode({frameIndex:i,completeFramesOnly:true});
   const duration=clamp(image.duration||100000,20000,2000000);
   const bitmap=await createImageBitmap(image);image.close();
   frames.push({image:bitmap,start:total});total+=duration;
  }
  const previous=clips.get(id);if(previous)for(const f of previous.frames)f.image.close?.();
  clips.set(id,{name:file.name,frames,total,width:frames[0].image.width,height:frames[0].image.height});
  sharedAsset=clips.get(id);
  return sharedAsset;
 }finally{decoder.close()}
}
const scratch=document.createElement('canvas');
export function renderRed(c,w,h,phase,s,p,P){
 const asset=clips.get(s.id)||sharedAsset,bg=s.colors[0],red=s.colors[1],dark=bg,ivory=P.ivory;
 c.fillStyle=bg;c.fillRect(0,0,w,h);
 if(!asset){
  c.save();c.fillStyle=red;c.textAlign='center';c.font=Math.max(12,Math.round(h*.055))+'px monospace';
  c.fillText('RED FEVER / UPLOAD A GIF',w/2,h/2);c.restore();return;
 }
 const t=((phase*(p.speed||1))%1+1)%1;
 const ms=t*asset.total;
 let idx=asset.frames.length-1;
 for(let i=0;i<asset.frames.length;i++){if(asset.frames[i].start>ms){idx=i-1;break}}
 idx=Math.max(0,idx);
 const frame=asset.frames[idx].image;
 const pixel=Math.max(2,Math.round(p.pixelSize||8));
 const sw=Math.max(1,Math.min(480,Math.ceil(w/pixel))),sh=Math.max(1,Math.min(220,Math.ceil(h/pixel)));
 if(scratch.width!==sw||scratch.height!==sh){scratch.width=sw;scratch.height=sh}
 const g=scratch.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=true;
 const zoom=clamp(p.redZoom||1,1,8);
 const aspect=frame.width/frame.height,target=w/h;
 const cropW=target>aspect?frame.width:frame.height*target;
 const cropH=target>aspect?frame.width/target:frame.height;
 const srcW=cropW/zoom,srcH=cropH/zoom;
 const cx=frame.width/2+Math.sin(t*Math.PI*2)*frame.width*.06*(zoom-1)/7;
 const cy=frame.height/2;
 g.clearRect(0,0,sw,sh);
 g.drawImage(frame,clamp(cx-srcW/2,0,Math.max(0,frame.width-srcW)),clamp(cy-srcH/2,0,Math.max(0,frame.height-srcH)),Math.min(srcW,frame.width),Math.min(srcH,frame.height),0,0,sw,sh);
 const pixels=g.getImageData(0,0,sw,sh);
 const d=pixels.data,threshold=(p.threshold??.5)*255;
 const colorA=hexRGB(red),colorB=hexRGB(dark),colorC=hexRGB(ivory);
 for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){
  const k=(y*sw+x)*4;
  const lum=d[k]*.2126+d[k+1]*.7152+d[k+2]*.0722;
  const col=lum>=threshold?colorA:colorB;
  d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255;
  if((p.glitch||0)>0&&((y*13+Math.floor(t*12))%23)<(p.glitch||0)*7&&x%17===0){
   d[k]=colorC[0];d[k+1]=colorC[1];d[k+2]=colorC[2];
  }
 }
 g.putImageData(pixels,0,0);
 c.save();c.imageSmoothingEnabled=false;
 const v=s.variant,smear=p.smear||0,glitch=p.glitch||0;
 const TAU=Math.PI*2,cyclic=Math.sin(TAU*t),breath=.5-.5*Math.cos(TAU*t);
 const draw=(sx,sy,ww,hh,dx,dy,dw,dh)=>c.drawImage(scratch,sx,sy,ww,hh,dx,dy,dw,dh);
 const full=(x=0,y=0,width=w,height=h)=>draw(0,0,sw,sh,x,y,width,height);
 if(v===0){ // 01 / EYE CONTACT: the original red bitmap, with smear control.
  const strips=1+Math.round(smear*36);
  for(let j=0;j<strips;j++){
   const sy=Math.floor(j*sh/strips),ey=Math.floor((j+1)*sh/strips),rh=Math.max(1,ey-sy);
   const dx=smear*w*.35*Math.sin(j*2.7+cyclic*3);
   draw(0,sy,sw,rh,dx,sy*h/sh,w,rh*h/sh+.5);
  }
 }else if(v===1){ // 02 / FACE MELT: independent sliding horizontal slices.
  const bands=14+Math.round(smear*45);
  for(let j=0;j<bands;j++){
   const sy=Math.floor(j*sh/bands),ey=Math.floor((j+1)*sh/bands),rh=Math.max(1,ey-sy);
   const stagger=Math.sin(j*2.31+cyclic*2.6);
   const offset=(.08+smear*.55)*w*stagger*breath;
   draw(0,sy,sw,rh,offset,sy*h/sh,w,rh*h/sh+1);
  }
 }else if(v===2){ // 03 / KISS KISS — repeating animated mouth-height slices, pop-trash contact strip
  const rows=2+Math.round(glitch*5);
  const sliceY=Math.floor(sh*.43),sliceH=Math.max(1,Math.floor(sh*.24));
  for(let j=0;j<rows;j++){
   const y=j*h/rows,shift=Math.sin(TAU*t+j*1.6)*w*.07;
   draw(0,sliceY,sw,sliceH,shift,y,w,h/rows+1);
  }
  c.fillStyle=red;
  for(let j=0;j<rows;j++)c.fillRect(0,(j+1)*h/rows-h*.008,w,h*.008);
 }else if(v===3){ // 04 / BON APPÉTIT — editorial dinner-table contact sheet / cutlery-like vertical bars
  const cols=7;
  for(let j=0;j<cols;j++){
   const width=w/cols,scale=.65+.35*(.5+.5*Math.sin(TAU*t+j*.9));
   const inset=(1-scale)*h/2;
   draw(Math.floor(j*sw/cols),0,Math.max(1,Math.ceil(sw/cols)),sh,j*width,inset,width+1,h*scale);
  }
  c.fillStyle=red;
  for(let j=1;j<cols;j++)c.fillRect(j*w/cols-h*.006,0,h*.012,h);
 }else if(v===4){ // 05 / TOUCH ME — paired mirrored close-up gestures
  const count=4;
  for(let j=0;j<count;j++){
   const x=j*w/count,shift=Math.sin(TAU*t+j*Math.PI/2)*h*.15;
   c.save();c.translate(x+w/count/2+shift,h/2);
   if(j%2)c.scale(-1,1);
   draw(0,0,sw,sh,-w/count/2,-h/2,w/count,h);
   c.restore();
  }
 }else if(v===5){ // 06 / BODY LANGUAGE — silhouettes in staggered choreography
  const cols=6;
  for(let j=0;j<cols;j++){
   const width=w/cols,beat=Math.sin(TAU*t+j*1.1);
   const scale=.7+.3*(.5+.5*beat);
   const offset=beat*h*.14;
   draw(0,0,sw,sh,j*width,offset+(h-h*scale)/2,width+1,h*scale);
  }
 }else if(v===6){ // 07 / BAD RECEPTION — intermittent scan-line signal loss
  full();
  const bands=36+Math.round(smear*65);
  for(let j=0;j<bands;j++){
   if((j*7)%11>5)continue;
   const sy=Math.floor(j*sh/bands),rh=Math.max(1,Math.ceil(sh/bands));
   const offset=Math.sin(j*4.1+cyclic*3.5)*w*(.04+smear*.45);
   draw(0,sy,sw,rh,offset,sy*h/sh,w,rh*h/sh+1);
  }
 }else if(v===7){ // 08 / MIRROR FEVER: kaleidoscopic mirrored fragments.
  const n=4+Math.round(glitch*4);
  for(let j=0;j<n;j++){
   c.save();c.translate((j+.5)*w/n,h/2);
   if(j%2)c.scale(-1,1);
   c.rotate(Math.sin(TAU*t+j*.6)*.13);
   draw(0,0,sw,sh,-w/n/2,-h/2,w/n,h);
   c.restore();
  }
 }else if(v===8){ // 09 / TOO CLOSE — a single extreme crop, zooming out to full image
  const zoom=1+5*breath;
  const cw=Math.max(1,sw/zoom),ch=Math.max(1,sh/zoom);
  const sx=(sw-cw)/2+Math.sin(TAU*t)*sw*.05,sy=(sh-ch)/2;
  draw(clamp(sx,0,sw-cw),sy,cw,ch,0,0,w,h);
 }else{ // 10 / THE END? — red curtain opening and closing around the figure
  full();
  const opening=.08+.85*breath;
  c.fillStyle=red;
  c.fillRect(0,0,w*(1-opening)/2,h);
  c.fillRect(w*(1+opening)/2,0,w*(1-opening)/2,h);
  c.fillStyle=bg;
  c.fillRect(w*(1-opening)/2-h*.012,0,h*.012,h);
  c.fillRect(w*(1+opening)/2,0,h*.012,h);
 }
 c.restore();
}
function hexRGB(hex){const n=parseInt(hex.replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255]}
