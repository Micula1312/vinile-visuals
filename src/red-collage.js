// RED PASSION / 03 — multi-photo black-and-white collage, seamless 3-second choreography.
const photos=[];
const processed=[];
const TAU=Math.PI*2;
const hash=n=>{const x=Math.sin(n*127.1+23.9)*43758.5453;return x-Math.floor(x)};
export function getCollagePhotos(){return photos}
export function clearCollagePhotos(){for(const p of photos)p.bitmap.close?.();photos.length=0;processed.length=0}
export async function loadCollagePhotos(files){
 const images=Array.from(files||[]).filter(f=>f.type.startsWith('image/')).sort((a,b)=>a.name.localeCompare(b.name));
 if(!images.length)throw Error('Choose a folder containing JPG, PNG or WebP photos');
 const loaded=[];
 try{
  for(const file of images.slice(0,100)){
   const bitmap=await createImageBitmap(file);
   const canvas=document.createElement('canvas');
   const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
   canvas.width=Math.max(1,Math.round(bitmap.width*scale));
   canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const c=canvas.getContext('2d',{willReadFrequently:true});
   c.drawImage(bitmap,0,0,canvas.width,canvas.height);
   const image=c.getImageData(0,0,canvas.width,canvas.height);
   for(let i=0;i<image.data.length;i+=4){
    const d=image.data,v=Math.max(0,Math.min(255,(d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722-128)*1.18+128));
    d[i]=d[i+1]=d[i+2]=v;
   }
   c.putImageData(image,0,0);
   loaded.push({bitmap,canvas,name:file.name});
  }
 }catch(err){for(const p of loaded)p.bitmap.close?.();throw err}
 clearCollagePhotos();
 for(const item of loaded){photos.push({bitmap:item.bitmap,name:item.name});processed.push(item.canvas)}
 return photos.length;
}
const smooth=x=>x*x*(3-2*x);
export function renderCollage(c,w,h,phase,scene,p,highlight){
 c.fillStyle=scene.colors[0];c.fillRect(0,0,w,h);
 const ink=highlight||scene.colors[1];
 c.save();
 // The reference's faint background grid stays static.
 c.strokeStyle=ink;c.globalAlpha=.16;c.lineWidth=Math.max(1,h*.0018);
 const step=h*.11;c.beginPath();
 for(let x=0;x<w;x+=step){c.moveTo(x,0);c.lineTo(x,h)}
 for(let y=0;y<h;y+=step){c.moveTo(0,y);c.lineTo(w,y)}
 c.stroke();c.globalAlpha=1;
 if(!processed.length){
  c.fillStyle=ink;c.textAlign='center';c.font=Math.max(12,Math.round(h*.055))+'px monospace';
  c.fillText('RED PASSION / 03 — UPLOAD PHOTO FOLDER',w/2,h/2);c.restore();return;
 }
 // One 3-second cycle, repeated ten times for a 30-second clip.
 const t=((phase*10)%1+1)%1;
 // Starts dispersed, converges to a dense central cluster, then returns.
 const gather=smooth(.5-.5*Math.cos(TAU*t));
 const n=Math.min(55,Math.max(20,processed.length*4));
 const intensity=.5+Math.min(1,p.smear||0)*1.2;
 c.beginPath();c.rect(0,0,w,h);c.clip();
 for(let i=0;i<n;i++){
  const src=processed[i%processed.length];
  const aspect=src.width/src.height;
  const tileH=h*(.17+hash(i+14)*.32)*intensity;
  const tileW=tileH*aspect;
  const row=hash(i+51),col=hash(i+73);
  const centerX=w*(.16+.68*col),centerY=h*(.1+.8*row);
  const outsideX=(hash(i+117)>.5?1:-1)*(w*.55+tileW+hash(i+203)*w*.3);
  const outsideY=(hash(i+225)-.5)*h*1.6;
  const x=outsideX*(1-gather)+centerX*gather-tileW/2;
  const y=outsideY*(1-gather)+centerY*gather-tileH/2;
  const scale=.65+.35*gather;
  const dw=tileW*scale,dh=tileH*scale;
  c.globalAlpha=Math.min(1,.45+gather*.55);
  c.drawImage(src,x,y,dw,dh);
 }
 c.restore();
}
