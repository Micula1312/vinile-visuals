// RED PASSION / 02 — photo collage: deterministic monochrome image tiles and highlight grid.
let photo=null;
export function getRedPhoto(){return photo}
export function clearRedPhoto(){if(photo?.bitmap)photo.bitmap.close?.();photo=null}
export async function loadRedPhoto(file){
 if(!file||!file.type.startsWith('image/'))throw Error('Choose a photo (JPG, PNG, WebP)');
 const bitmap=await createImageBitmap(file);
 clearRedPhoto();photo={bitmap,name:file.name};return photo;
}
const TAU=Math.PI*2;
const fract=n=>n-Math.floor(n);
const hash=n=>fract(Math.sin(n*127.1+19.19)*43758.5453);
const mono=document.createElement('canvas');
let cached=null,cachedBitmap=null;
function grayscale(bitmap){
 if(cachedBitmap===bitmap&&cached)return cached;
 const max=1600,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
 mono.width=Math.max(1,Math.round(bitmap.width*scale));
 mono.height=Math.max(1,Math.round(bitmap.height*scale));
 const g=mono.getContext('2d',{willReadFrequently:true});g.drawImage(bitmap,0,0,mono.width,mono.height);
 const data=g.getImageData(0,0,mono.width,mono.height);
 for(let i=0;i<data.data.length;i+=4){
  const a=data.data,l=Math.round(.2126*data.data[i]+.7152*data.data[i+1]+.0722*data.data[i+2]);
  data.data[i]=data.data[i+1]=data.data[i+2]=Math.max(0,Math.min(255,(l-128)*1.22+128));
 }
 g.putImageData(data,0,0);cached=mono;cachedBitmap=bitmap;return cached;
}
export function renderRedPhoto(ctx,w,h,phase,s,p,highlight){
 const bg=s.colors[0],ink=highlight||s.colors[1],t=((phase%1)+1)%1;
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 if(!photo){
  ctx.fillStyle=ink;ctx.font=Math.max(12,Math.round(h*.055))+'px monospace';
  ctx.textAlign='center';ctx.fillText('RED PASSION / 02 — UPLOAD A PHOTO',w/2,h/2);return;
 }
 const src=grayscale(photo.bitmap),cols=10,rows=4,cw=w/cols,ch=h/rows;
 const zoom=1.05+Math.max(0,p.smear||0)*.65;
 const cover=Math.max(w/src.width,h/src.height)*zoom;
 const sourceW=w/cover,sourceH=h/cover;
 const drift=(p.glitch||0)*.18;
 const motion=.5-.5*Math.cos(TAU*t);
 const lineWidth=Math.max(1,h*.004);
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
 for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
  const id=row*cols+col,seed=hash(id+2);
  // Black cells alternate with visible image. A few shutter cells appear and disappear periodically.
  if(seed<.20 || (seed<.31&&Math.sin(TAU*t+id*1.8)>0.3))continue;
  const x=col*cw,y=row*ch;
  const phaseShift=Math.sin(TAU*t+(id%7)*.9);
  const offsetX=(hash(id+61)-.5)*sourceW*.19*motion + phaseShift*sourceW*drift;
  const offsetY=(hash(id+97)-.5)*sourceH*.20*motion;
  const sx=Math.max(0,Math.min(src.width-sourceW,src.width/2-sourceW/2+((col+.5)/cols-.5)*sourceW+offsetX));
  const sy=Math.max(0,Math.min(src.height-sourceH,src.height/2-sourceH/2+((row+.5)/rows-.5)*sourceH+offsetY));
  const sw=Math.max(1,sourceW/cols),sh=Math.max(1,sourceH/rows);
  const cx=Math.max(0,Math.min(src.width-sw,sx)),cy=Math.max(0,Math.min(src.height-sh,sy));
  const shiftX=Math.sin(TAU*t+id*1.4)*cw*.20*(p.smear||.35);
  ctx.drawImage(src,cx,cy,sw,sh,x+shiftX,y,cw+1,ch+1);
 }
 // Stable editorial grid above moving photograph.
 ctx.strokeStyle=ink;ctx.lineWidth=lineWidth;ctx.globalAlpha=.9;
 ctx.beginPath();
 for(let col=1;col<cols;col++){const x=Math.round(col*cw);ctx.moveTo(x,0);ctx.lineTo(x,h)}
 for(let row=1;row<rows;row++){const y=Math.round(row*ch);ctx.moveTo(0,y);ctx.lineTo(w,y)}
 ctx.stroke();
 // Sparse strong horizontal accent bars, phase-locked to 30-second loop.
 ctx.fillStyle=ink;ctx.globalAlpha=1;
 for(let i=0;i<3;i++){
  const row=Math.floor(hash(i+210)*rows),col=Math.floor(hash(i+330)*cols);
  const length=(1+Math.floor(hash(i+420)*3))*cw;
  ctx.fillRect(col*cw,row*ch+ch-lineWidth*1.25,Math.min(length,w-col*cw),lineWidth*1.25);
 }
 ctx.restore();
}
