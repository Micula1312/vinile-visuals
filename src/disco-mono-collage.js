// DISCO 16 / MONOCHROME COLLAPSE
// Animated reinterpretation of the supplied monochrome geometric collage.
// Periodic motion (phase 0..1) for a 30-second seamless loop.
const TAU=Math.PI*2;
const fract=x=>x-Math.floor(x);
const rnd=(x,y,seed=0)=>fract(Math.sin(x*127.1+y*311.7+seed*73.17)*43758.5453);
export function renderMonoCollage(ctx,w,h,phase,p={}){
 const t=phase*TAU, motion=Number(p.patch_motion??.35), grain=Number(p.patch_grain??.5);
 const glitch=Number(p.patch_glitch??.35), depth=Number(p.patch_depth??.65);
 const scale=Math.min(w/1200,h/720),ox=(w-1200*scale)/2,oy=(h-720*scale)/2;
 ctx.save();ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
 ctx.translate(ox,oy);ctx.scale(scale,scale);
 const drift=(k,amount)=>Math.sin(t+k)*amount*motion;
 const rect=(x,y,a,b,shade)=>{ctx.fillStyle=`rgb(${shade},${shade},${shade})`;ctx.fillRect(x,y,a,b)};
 const circle=(x,y,r,shade,start=0,end=TAU)=>{ctx.beginPath();ctx.arc(x,y,r,start,end);ctx.fillStyle=`rgb(${shade},${shade},${shade})`;ctx.fill()};
 // Monolithic architectural panels.
 rect(0,0,1200,720,8);
 rect(0,0,230,190,2);
 rect(230+drift(1,24),0,670,195,115);
 rect(900,0,300,290,9);
 rect(0,195,390,140,185);
 rect(390,195,290,180,29);
 rect(680,195,220,135,167);
 rect(900,290,300,180,205);
 rect(0,335,620,385,7);
 rect(620,335,580,385,36);
 // Large half-hidden monochrome circles.
 ctx.save();ctx.beginPath();ctx.rect(670,95,245,235);ctx.clip();
 circle(800+drift(2,18),275,154,20);circle(780+drift(2.3,15),295,106,81);
 ctx.restore();
 ctx.save();ctx.beginPath();ctx.rect(790,460,410,260);ctx.clip();
 circle(1045+drift(3,14),603,220,110);circle(1070,620,145,40);
 ctx.restore();
 // Repeating architectural staircase: concentric nested displaced windows.
 const baseX=70+drift(4,24),baseY=345+drift(5,15);
 for(let i=0;i<17;i++){
   const k=i/17, ww=500*(1-k*.87),hh=345*(1-k*.84);
   const x=baseX+i*11+drift(i*.23,i*1.8),y=baseY+i*8;
   rect(x,y,ww,hh,i%3===0?198:i%2?33:130);
   rect(x+Math.max(4,ww*.045),y+Math.max(4,hh*.09),ww*.81,hh*.69,i%3===0?14:75);
 }
 // Moving horizontal scan interruptions.
 for(let i=0;i<12;i++){
  const y=330+i*25+drift(i,7),x=60+i*15;
  const jump=Math.sin(t*2+i*2.1)*glitch*24;
  rect(x+jump,y,220+Math.sin(i)*80,4+i%3*3,i%2?210:12);
 }
 // Rectangular displacement masks.
 const slide=drift(1.3,42);
 rect(220+slide,122,355,68,45);
 rect(575,190+drift(1.9,18),255,70,196);
 rect(835+drift(2.7,20),260,365,95,15);
 // Recursion fragments.
 for(let i=0;i<Math.round(8+depth*18);i++){
  const x=110+i*14,y=420+i*8;
  const len=(230-i*7)*Math.max(.1,depth);
  rect(x+drift(i*.3,8),y,len,4,i%3?218:17);
 }
 // Analog scan grain: seeded per spatial cell, cyclic changes over time.
 if(grain>0){
  const cell=3,cols=Math.ceil(1200/cell),rows=Math.ceil(720/cell);
  const frame=Math.floor(phase*60)%60;
  ctx.globalAlpha=grain*.27;
  for(let yy=0;yy<rows;yy+=2)for(let xx=0;xx<cols;xx+=2){
   const n=rnd(xx,yy,frame);
   if(n>.5){const v=Math.round(n*255);rect(xx*cell,yy*cell,cell*2,cell*2,v)}
  }
  ctx.globalAlpha=1;
 }
 // Fine scanlines.
 ctx.fillStyle='rgba(0,0,0,.16)';
 for(let y=0;y<720;y+=4)ctx.fillRect(0,y,1200,1);
 ctx.restore();
}
