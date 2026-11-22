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
 const mult=Math.max(1,Math.round(params.multiply||1));
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
  const step=h*.9/mult,shift=.5*step*Math.sin(a);
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
  const bloom=(1-Math.cos(a))*.5,cols=7+6*mult,rows=3;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const x=w*.5+(i-(cols-1)/2)*(w/(cols-1))*bloom;
   const y=h*.5+(j-1)*h*.29*bloom;
   const r=h*(.28-.18*bloom)*s;
   disc(c,x,y,r,(i+j)%3===0?pink:(i+j)%3===1?red:fg);
  }break;
 }
 // 04: traveling constellation of dots, with staggered orbital drift and breathing scale.
 case 3:{
  const cols=Math.max(5,Math.round((w/h)*7*mult)),rows=3+Math.min(3,mult-1);
  for(let row=0;row<rows;row++)for(let i=0;i<cols;i++){
   const u=(i+.5+(row%2)*.5)/cols;
   const x=u*w+h*.055*Math.sin(a+row*.7+i*.34);
   const y=h*(.20+(row+.5)*.62/rows)+h*.07*Math.sin(a*(row%2?1:-1)+i*.42+row);
   const radius=h*(.018+.015*(.5+.5*Math.cos(a+i*.71+row)))*s;
   disc(c,x,y,radius,(i+row)%5===0?pink:(row%2?fg:orange));
   if((i+row)%4===0)disc(c,x+h*.045*Math.sin(a+i),y+h*.035*Math.cos(a+row),radius*.38,ivory);
  }
  break;
 }
 // 05: many horizontal light reflections sliding at different speeds.
 case 4:{
  rect(c,0,0,w,h*.23,red);
  for(let row=0;row<24*mult;row++){
   const y=h*(.24+row*.032/mult),step=h*(.29+(row%5)*.15),speed=(row%2?1:-1);
   for(let i=-2;i<Math.ceil(w/step)+3;i++){
    const x=i*step+speed*.5*step*Math.sin(a)+(row%4)*h*.12;
    rect(c,x,y,step*(.27+.28*Math.sin(row*2)**2),h*(.006+row*.0005),row%4===0?ivory:row%3===0?pink:fg);
   }
  }break;
 }
 // 06: PIXEL STEPS — animated mosaic staircase, no wave geometry.
 case 5:{
  const cols=Math.max(12,Math.round((26+mult*8)/Math.max(.55,s)));
  const cell=w/cols;
  const rows=Math.max(5,Math.ceil(h/cell));
  const cw=w/cols,ch=h/rows;
  const inks=[orange,red,pink,ivory,fg];
  // Quantized staircase silhouettes shift between columns over a seamless phase cycle.
  const shift=Math.sin(a)*2.5;
  for(let row=0;row<rows;row++){
   for(let col=0;col<cols;col++){
    const staircase=Math.floor((col+shift+Math.sin(row*.85+a)*2.4)/3);
    const diagonal=Math.floor((col+row*2+Math.cos(a+col*.18)*2)/5);
    const index=((staircase+diagonal+row)%inks.length+inks.length)%inks.length;
    const lit=((col+row*3+Math.floor(2*Math.sin(a+row*.45)))%11+11)%11;
    if(lit===0)continue;
    c.fillStyle=inks[index];
    c.fillRect(col*cw,row*ch,Math.ceil(cw+.25),Math.ceil(ch+.25));
   }
  }
  // Broad stepped terraces cut through the mosaic, with crisp pixel edges.
  c.fillStyle=bg;
  for(let k=0;k<3;k++){
   const base=Math.floor((rows*.2+k*rows*.27+Math.sin(a+k*1.8)*rows*.08));
   for(let col=0;col<cols;col++){
    const level=Math.floor((col+Math.sin(a+k)*2)/(3+k));
    const row=base+level;
    if(row>=0&&row<rows)c.fillRect(col*cw,row*ch,Math.ceil(cw+.25),Math.ceil(ch+.25));
   }
  }
  break;
 }
 // 07: flowing ribbons, not suns or circles; each ribbon undulates independently.
 case 6:{
  const ribbons=4+mult*2,step=h*.015;
  for(let j=0;j<ribbons;j++){
   const base=h*(.13+(j+.5)*.75/ribbons);
   const amplitude=h*(.035+.017*(j%3))*s;
   const wavelength=h*(1.4+(j%4)*.6);
   const thickness=h*(.018+.009*(j%3))*s;
   const direction=j%2?-1:1;
   c.beginPath();
   for(let x=0;x<=w+step;x+=step){
    const y=base+amplitude*Math.sin(TAU*x/wavelength+direction*a+j*.8)
      +amplitude*.42*Math.sin(TAU*x/(wavelength*.56)-direction*a+j);
    if(x===0)c.moveTo(x,y);else c.lineTo(x,y);
   }
   for(let x=w+step;x>=0;x-=step){
    const y=base+amplitude*Math.sin(TAU*x/wavelength+direction*a+j*.8)
      +amplitude*.42*Math.sin(TAU*x/(wavelength*.56)-direction*a+j)+thickness;
    c.lineTo(x,y);
   }
   c.closePath();c.fillStyle=j%4===0?pink:j%3===0?ivory:j%2?fg:orange;c.fill();
  }
  break;
 }
 // 08: solar afterimage / eccentric circular optical illusion.
 // Layered rings drift on independent periodic orbits, creating a slow parallax.
 case 7:{
  const count=2+mult;
  for(let i=0;i<count;i++){
   const seed=i*2.3999632297;
   const cx=w*(i+.5)/count;
   const cy=h*(.5+.09*Math.sin(seed));
   const x=cx+h*.09*Math.sin(a*(1+i%3)+seed);
   const y=cy+h*.07*Math.cos(a*(1+i%2)+seed);
   const outer=h*(.19+.045*(i%3))*s;
   // Concentric ink rings form a moire-like solar disc, with independent centers.
   for(let j=10;j>=0;j--){
    const radius=outer*(j+1)/11;
    const ox=h*.025*Math.sin(a*(1+j%3)+seed+j*.32);
    const oy=h*.025*Math.cos(a*(1+j%2)+seed-j*.25);
    disc(c,x+ox,y+oy,radius,j%4===0?pink:j%2===0?orange:fg);
   }
   disc(c,x+h*.018*Math.sin(a+seed),y+h*.018*Math.cos(a+seed),outer*.12,black);
  }
  break;
 }
 // 09: sliding curtains of warm color, revealing new stripes at different rates.
 case 8:{
  const colors=[orange,red,pink,ivory,black];
  const step=w/(13*mult);
  for(let i=-2;i<13*mult+3;i++){
   const x=i*step+.5*step*Math.sin(a);
   rect(c,x,0,step+1,h,colors[wrap(i,5)]);
   const aperture=h*s*(.2+.55*(.5+.5*Math.sin(a+i*.85)));
   rect(c,x+step*.25,0,step*.48,aperture,bg);
   rect(c,x+step*.25,h-aperture*.55,step*.48,aperture*.55,fg);
  }break;
 }
 // 10: optical sunset — interlaced concentric wavefronts create a moving moire.
 case 9:{
  const centers=2+mult;
  const maxR=Math.hypot(w,h);
  const gap=h*(.072/(Math.sqrt(mult)))*s;
  const line=h*.012*s;
  for(let i=0;i<centers;i++){
   const seed=i*1.9;
   const cx=w*(i+.5)/centers+h*.055*Math.sin(a*(1+i%2)+seed);
   const cy=h*(.48+.13*Math.sin(a+seed));
   const shift=h*.028*Math.sin(a*(1+i%3)+seed);
   const rings=Math.ceil(maxR/gap)+1;
   c.strokeStyle=i%3===0?pink:i%2===0?ivory:orange;
   c.lineWidth=line;
   for(let j=1;j<=rings;j++){
    const radius=j*gap+shift;
    if(radius<=0)continue;
    c.beginPath();c.arc(cx,cy,radius,0,TAU);c.stroke();
   }
  }
  // An opposing circular mask produces an eclipse/iris, never a hard jump.
  const iris=h*(.09+.045*Math.sin(a))*s;
  disc(c,w*.5+h*.12*Math.sin(a),h*.5,iris,black);
  c.strokeStyle=fg;c.lineWidth=h*.008*s;
  c.beginPath();c.arc(w*.5+h*.12*Math.sin(a),h*.5,iris+h*.015*s,0,TAU);c.stroke();
  break;
 }
 }
 c.restore();
}
