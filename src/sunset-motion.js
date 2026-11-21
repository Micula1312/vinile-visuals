// SUNSET STUDIES — ten procedural, seamless, flat-ink motion scores.
// Coordinates are normalized to the canvas height; every animation is periodic.
const TAU=Math.PI*2;
const wrap=(x,n)=>((x%n)+n)%n;
const wave=(t,offset=0)=>Math.sin(TAU*t+offset);
const disc=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill()};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
const bandSun=(c,x,y,r,ink,cut)=>{disc(c,x,y,r,ink);c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();for(let k=0;k<5;k++)rect(c,x-r,y+r*(.12+k*.27),2*r,r*.065,cut);c.restore()};
export function renderSunset(c,w,h,phase,scene,params,P){
 const v=scene.variant, bg=scene.colors[0],fg=scene.colors[1],s=params.scale||1;
 const t=wrap(phase*(params.speed||1),1), a=TAU*t, unit=h, orange=P.orange,pink=P.highlight,red=P.orange,ivory=P.ivory,black=P.black;
 c.save();c.beginPath();c.rect(0,0,w,h);c.clip();rect(c,0,0,w,h,bg);
 switch(v){
 // 01: a solar arc from left to right; the return path stays below the horizon.
 case 0:{
  const r=h*.54*s;
  // One slow crossing per full loop. The sun starts and ends fully outside the frame.
  const x=-r*1.15+(w+r*2.3)*t;
  const y=h*(.9-.57*Math.sin(Math.PI*t));
  disc(c,x,y,r,fg);rect(c,0,h*.72,w,h*.28,black);
  for(let i=0;i<8;i++)rect(c,0,h*(.76+i*.031),w,h*.009,i%2?red:orange);
  break;
 }
 // 02: horizontal procession, repeated with exact wrap.
 case 1:{
  const step=h*.9,shift=.5*step*Math.sin(a);
  for(let i=-2;i<Math.ceil(w/step)+3;i++){
   const x=i*step+shift,y=h*(.42+.045*Math.sin(i*1.4)),r=h*(i%3===0?.31:.26)*s;
   bandSun(c,x,y,r,i%3===0?pink:fg,bg);
  }
  // A flat, screenprinted sea: layered wave contours travel slowly in opposite directions.
  // All offsets use whole-number cycles, so the 20-second loop closes seamlessly.
  const seaTop=h*.69;
  rect(c,0,seaTop,w,h-seaTop,black);
  for(let row=0;row<6;row++){
   const base=seaTop+h*(.025+row*.049);
   const amplitude=h*(.009+row*.002);
   const wavelength=h*(1.7+row*.38);
   const direction=row%2===0?1:-1;
   const ink=[fg,pink,orange,fg,pink,orange][row];
   c.beginPath();
   for(let x=0;x<=w+h*.03;x+=Math.max(3,h*.015)){
    const y=base+amplitude*Math.sin(TAU*(x/wavelength+direction*t)+row*.8);
    if(x===0)c.moveTo(x,y);else c.lineTo(x,y);
   }
   c.strokeStyle=ink;c.lineWidth=h*(row%3===0?.009:.006);c.stroke();
  }
  break;
 }
 // 03: repeated suns emerge from a single location and dissolve into a grid.
 case 2:{
  const bloom=(1-Math.cos(a))*.5,cols=13,rows=3;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const x=w*.5+(i-(cols-1)/2)*(w/(cols-1))*bloom;
   const y=h*.5+(j-1)*h*.29*bloom;
   const r=h*(.28-.18*bloom)*s;
   disc(c,x,y,r,(i+j)%3===0?pink:(i+j)%3===1?red:fg);
  }break;
 }
 // 04: slanting long shadows sweep across the LED, without a visible sun.
 case 3:{
  const step=h*.47,dx=h*(.7+.5*Math.sin(a)),shift=.5*step*Math.sin(a);
  for(let i=-4;i<Math.ceil(w/step)+5;i++){
   const x=i*step+shift,y=h*.38;
   c.fillStyle=black;c.beginPath();c.moveTo(x,y);c.lineTo(x+dx,y+h*.7);c.lineTo(x+dx+h*.14,y+h*.7);c.lineTo(x+h*.14,y);c.fill();
   rect(c,x,y,h*.14,h*.22,i%3===0?pink:fg);
  }break;
 }
 // 05: many horizontal light reflections sliding at different speeds.
 case 4:{
  rect(c,0,0,w,h*.23,red);
  for(let row=0;row<24;row++){
   const y=h*(.24+row*.032),step=h*(.29+(row%5)*.15),speed=(row%2?1:-1);
   for(let i=-2;i<Math.ceil(w/step)+3;i++){
    const x=i*step+speed*.5*step*Math.sin(a)+(row%4)*h*.12;
    rect(c,x,y,step*(.27+.28*Math.sin(row*2)**2),h*(.006+row*.0005),row%4===0?ivory:row%3===0?pink:fg);
   }
  }break;
 }
 // 06: heat haze, rippling flat color strips with travelling vertical waves.
 case 5:{
  const bands=[orange,red,pink,ivory,black];
  for(let j=0;j<11;j++){
   const y=j*h/11;
   c.beginPath();c.moveTo(0,y);
   for(let x=0;x<=w+w/170;x+=w/170)c.lineTo(x,y+h*.055*Math.sin(x/w*TAU*5+a+j*.65));
   c.lineTo(w,y+h/11+h*.1);c.lineTo(0,y+h/11+h*.1);c.closePath();c.fillStyle=bands[j%bands.length];c.fill();
  }break;
 }
 // 07: staggered rotating sunburst medallions across the entire panorama.
 case 6:{
  const step=h*1.18;
  for(let i=-1;i<Math.ceil(w/step)+2;i++){
   const x=i*step+step*.5,y=h*.5,r=h*.39*s;
   c.save();c.translate(x,y);c.rotate(a*(i%2?1:-1));
   for(let j=0;j<16;j++){
    const q=j*TAU/16;c.beginPath();c.moveTo(Math.cos(q)*r*.54,Math.sin(q)*r*.54);c.lineTo(Math.cos(q-.11)*r*1.14,Math.sin(q-.11)*r*1.14);c.lineTo(Math.cos(q+.11)*r*1.14,Math.sin(q+.11)*r*1.14);c.closePath();c.fillStyle=j%2?pink:fg;c.fill();
   }disc(c,0,0,r*.56,orange);c.restore();
  }break;
 }
 // 08: moving afterimages: a chain of overlapping silhouettes and offset echoes.
 case 7:{
  const step=h*.95;
  for(let i=-2;i<Math.ceil(w/step)+3;i++){
   const x=i*step+.5*step*Math.sin(a),y=h*(.52+.1*Math.sin(a+i)),r=h*.3*s;
   for(let j=5;j>=0;j--)disc(c,x-j*h*.065,y+j*h*.028,r*(1-j*.085),[red,pink,orange,red,pink,fg][j]);
  }break;
 }
 // 09: sliding curtains of warm color, revealing new stripes at different rates.
 case 8:{
  const colors=[orange,red,pink,ivory,black];
  const step=w/13;
  for(let i=-2;i<16;i++){
   const x=i*step+.5*step*Math.sin(a);
   rect(c,x,0,step+1,h,colors[wrap(i,5)]);
   const aperture=h*(.2+.55*(.5+.5*Math.sin(a+i*.85)));
   rect(c,x+step*.25,0,step*.48,aperture,bg);
   rect(c,x+step*.25,h-aperture*.55,step*.48,aperture*.55,fg);
  }break;
 }
 // 10: the last sliver of light travels as a moving broken horizontal signal.
 case 9:{
  const step=h*.35,shift=.5*step*Math.sin(a);
  for(let row=0;row<5;row++){
   const y=h*(.2+row*.15);
   for(let i=-2;i<Math.ceil(w/step)+3;i++){
    const x=i*step+shift*(row%2?1:-1);
    const len=step*(.2+.65*(.5+.5*Math.sin(i*1.5+row*2+a)));
    rect(c,x,y,len,h*(row===2?.035:.012),row===2?ivory:row%2?pink:fg);
   }
  }break;
 }
 }
 c.restore();
}
