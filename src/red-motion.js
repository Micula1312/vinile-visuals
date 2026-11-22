// RED FEVER — user GIFs decoded into deterministic frames for preview and export.
// Chrome/Edge ImageDecoder API. Assets remain local to this browser session.
const clips=new Map();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function getRedAsset(id){return clips.get(id)}
export function clearRedAssets(){for(const a of clips.values())for(const f of a.frames)f.image.close?.();clips.clear()}
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
  return clips.get(id);
 }finally{decoder.close()}
}
const scratch=document.createElement('canvas');
export function renderRed(c,w,h,phase,s,p,P){
 const asset=clips.get(s.id),bg=s.colors[0],red=s.colors[1],dark=P.black,ivory=P.ivory;
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
 const smear=p.smear||0,offset=Math.sin(t*Math.PI*2);
 const strips=1+Math.round(smear*36);
 for(let j=0;j<strips;j++){
  const sy=Math.floor(j*sh/strips),ey=Math.floor((j+1)*sh/strips),rh=Math.max(1,ey-sy);
  const dx=smear*w*.35*Math.sin(j*2.7+offset*3);
  c.drawImage(scratch,0,sy,sw,rh,dx,sy*h/sh,w,rh*h/sh+.5);
 }
 c.restore();
}
function hexRGB(hex){const n=parseInt(hex.replace('#',''),16);return[(n>>16)&255,(n>>8)&255,n&255]}
