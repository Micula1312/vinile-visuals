// SUNSET STUDIES — ten seamless, retro 1970s airbrush and screenprint motion scores.
// Coordinates are normalized to the canvas height; every animation is periodic.
const TAU=Math.PI*2;
const wrap=(x,n)=>((x%n)+n)%n;
const wave=(t,offset=0)=>Math.sin(TAU*t+offset);
const disc=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill()};
const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
const bandSun=(c,x,y,r,ink,cut)=>{disc(c,x,y,r,ink);c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();for(let k=0;k<4;k++){const yy=y+r*(.10+k*.29),thick=r*(.045+k*.018);rect(c,x-r,yy,2*r,thick,cut)}c.restore()};

// Shared airbrushed color language from SUNSET / TEXT: blush → red → burgundy.
// Native Canvas gradients, no external assets; no temporal noise or visible seams.
const airbrush=(c,y0,y1,red='#E60023')=>{
 const g=c.createLinearGradient(0,y0,0,y1);
 g.addColorStop(0,'#F5B7B3');g.addColorStop(.38,red);g.addColorStop(.72,'#B22C45');g.addColorStop(1,'#541229');
 return g;
};
const ambient=(c,w,h,red)=>{rect(c,0,0,w,h,airbrush(c,0,h,red))};
const gradientDisc=(c,x,y,r,red)=>{
 c.save();c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.clip();
 rect(c,x-r,y-r,2*r,2*r,airbrush(c,y-r,y+r,red));c.restore();
};
export function renderSunset(c,w,h,phase,scene,params,P){
 const v=scene.variant, bg=scene.colors[0],fg=scene.colors[1],s=params.scale||1;
 const mult=Math.max(1,Math.round(params.multiply||1));
 const t=wrap(phase*(params.speed||1),1), a=TAU*t, unit=h, orange=P.orange,pink=P.highlight,red=P.orange,ivory=P.ivory,black=P.black;
 c.save();c.beginPath();c.rect(0,0,w,h);c.clip();rect(c,0,0,w,h,bg);
 switch(v){
 // 01: a solar arc from left to right; the return path stays below the horizon.
 case 0:{
  ambient(c,w,h,pink);
  const r=h*.82*s,x=-r*1.15+(w+r*2.3)*t,y=h*(.9-.57*Math.sin(Math.PI*t));
  gradientDisc(c,x,y,r,pink);
  // A broad velvety horizon replaces the thin graphic stripes.
  rect(c,0,h*.76,w,h*.24,airbrush(c,h*.72,h*1.2,red));
  break;
 }
 // 02: horizontal procession, repeated with exact wrap.
 case 1:{
  ambient(c,w,h,pink);
  const step=h*.9/mult,shift=.5*step*Math.sin(a);
  for(let i=-2;i<Math.ceil(w/step)+3;i++){
   const x=i*step+shift,y=h*(.42+.045*Math.sin(i*1.4)),r=h*(i%3===0?.48:.41)*s;
   gradientDisc(c,x,y,r,i%3===0?pink:red);
  }
  // Smooth, continuous color field: no decorative horizontal rules.
  rect(c,0,h*.70,w,h*.30,airbrush(c,h*.68,h*1.15,pink));
  break;
 }
 // 03: repeated suns emerge from a single location and dissolve into a grid.
 case 2:{
  const bloom=(1-Math.cos(a))*.5,cols=7+6*mult,rows=3;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const x=w*.5+(i-(cols-1)/2)*(w/(cols-1))*bloom;
   const y=h*.5+(j-1)*h*.29*bloom;
   const r=h*(.46-.28*bloom)*s;
   disc(c,x,y,r,(i+j)%3===0?pink:(i+j)%3===1?red:fg);
  }break;
 }
 // 04: CONSTELLATION BURSTS — solid flat-ink circles only, no glows or trails.
 case 3:{
  const bursts=3+mult*2;
  const stars=24+mult*12;
  const inks=[fg,orange,pink,ivory];
  // Sparse constellations: every dot is a clean, fully opaque palette disc.
  for(let i=0;i<stars;i++){
   const u=(i*.61803398875+.13)%1,v=(i*.754877666+.37)%1;
   const x=(u*w+h*.028*Math.sin(a+i*.73)+w)%w;
   const y=v*h+h*.025*Math.cos(a+i*.51);
   const radius=h*(.005+.006*(.5+.5*Math.cos(a+i*1.71)))*s;
   disc(c,x,y,radius,inks[i%inks.length]);
  }
  // Firework rosettes: crisp circles, discrete color blocks, periodic motion.
  for(let k=0;k<bursts;k++){
   const cx=((k*.61803398875+.23)%1)*w+h*.045*Math.sin(a+k*1.3);
   const cy=(.2+((k*.41421356237+.16)%1)*.6)*h+h*.035*Math.cos(a+k*.87);
   const phaseOffset=k/bursts;
   const local=wrap(t+phaseOffset,1);
   const expansion=.5-.5*Math.cos(TAU*local);
   const spread=h*(.045+.18*expansion)*s;
   const rays=10+Math.min(12,mult*3);
   for(let j=0;j<rays;j++){
    const angle=j/rays*TAU+k*.9;
    const distance=spread*(.65+.35*Math.sin(j*2.399+k)**2);
    const radius=h*(.006+.009*(1-expansion*.55))*s;
    disc(c,cx+Math.cos(angle)*distance,cy+Math.sin(angle)*distance,radius,inks[(j+k)%inks.length]);
   }
   disc(c,cx,cy,h*.013*s,inks[k%inks.length]);
  }
  break;
 }
 // 05: many horizontal light reflections sliding at different speeds.
 case 4:{
  ambient(c,w,h,pink);
  // Wide blurred reflections instead of dozens of thin horizontal bars.
  const horizon=h*.43;
  for(let i=0;i<5*mult;i++){
   const y=horizon+(i+.4)*h*.55/(5*mult);
   const x=w*(.5+.2*Math.sin(a+i*.65));
   const width=w*(.22+.11*Math.sin(i*1.7)**2);
   const g=c.createLinearGradient(x-width,y,x+width,y);
   g.addColorStop(0,'rgba(245,183,179,0)');
   g.addColorStop(.5,i%2?'rgba(255,185,145,.42)':'rgba(255,224,202,.53)');
   g.addColorStop(1,'rgba(245,183,179,0)');
   c.fillStyle=g;c.fillRect(x-width,y-h*.022,width*2,h*.044);
  }
  break;
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
  ambient(c,w,h,pink);
  // Large translucent airbrushed swells, no fine vector ribbons.
  const swells=3+mult;
  for(let j=0;j<swells;j++){
   const base=h*(.10+(j+.5)*.8/swells),amplitude=h*(.045+.012*(j%3))*s;
   const wavelength=h*(2.2+j*.35),thickness=h*(.15+.025*(j%2))*s;
   const grad=airbrush(c,base-amplitude,base+thickness+amplitude,j%2?pink:red);
   c.beginPath();
   for(let x=0;x<=w+h*.02;x+=h*.02){
    const y=base+amplitude*Math.sin(TAU*x/wavelength+a*(j%2?-1:1)+j*.9);
    if(x===0)c.moveTo(x,y);else c.lineTo(x,y);
   }
   for(let x=w+h*.02;x>=0;x-=h*.02){
    const y=base+amplitude*Math.sin(TAU*x/wavelength+a*(j%2?-1:1)+j*.9)+thickness;
    c.lineTo(x,y);
   }
   c.closePath();c.fillStyle=grad;c.globalAlpha=.68;c.fill();c.globalAlpha=1;
  }
  break;
 }
 // 08: solar afterimage / eccentric circular optical illusion.
 // Layered rings drift on independent periodic orbits, creating a slow parallax.
 case 7:{
  ambient(c,w,h,pink);
  const count=2+mult;
  for(let i=0;i<count;i++){
   const seed=i*2.3999632297,cx=w*(i+.5)/count;
   const x=cx+h*.09*Math.sin(a*(1+i%3)+seed);
   const y=h*(.5+.09*Math.sin(seed))+h*.07*Math.cos(a*(1+i%2)+seed);
   const radius=h*(.24+.045*(i%3))*s;
   // A soft solar afterimage rather than sharp concentric optical rings.
   c.save();c.globalAlpha=.22;gradientDisc(c,x+h*.025,y+h*.025,radius*1.24,pink);c.restore();
   gradientDisc(c,x,y,radius,i%2?pink:red);
   c.save();c.globalAlpha=.18;gradientDisc(c,x-h*.025,y-h*.03,radius*.67,ivory);c.restore();
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
  const gap=h*(.12/(Math.sqrt(mult)))*s;
  const line=h*.035*s;
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
