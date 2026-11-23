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
  ambient(c,w,h,pink);
  const bloom=(1-Math.cos(a))*.5,cols=7+6*mult,rows=3;
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const x=w*.5+(i-(cols-1)/2)*(w/(cols-1))*bloom,y=h*.5+(j-1)*h*.29*bloom;
   c.save();c.globalAlpha=.78;gradientDisc(c,x,y,h*(.46-.28*bloom)*s,(i+j)%2?pink:red);c.restore();
  }break;
 }

 // 04: CONSTELLATION BURSTS — solid flat-ink circles only, no glows or trails.
 case 3:{
  ambient(c,w,h,pink);
  const bursts=3+mult*2;
  for(let k=0;k<bursts;k++){
   const seed=k*2.3999632297,x=((k*.61803398875+.23)%1)*w+h*.045*Math.sin(a+seed);
   const y=(.2+((k*.41421356237+.16)%1)*.6)*h+h*.035*Math.cos(a+seed);
   const radius=h*(.045+.16*(.5-.5*Math.cos(a+TAU*k/bursts)))*s;
   c.save();c.globalAlpha=.18;gradientDisc(c,x,y,radius*1.75,pink);c.restore();
   c.save();c.globalAlpha=.75;gradientDisc(c,x,y,radius,k%2?pink:red);c.restore();
   c.save();c.globalAlpha=.32;gradientDisc(c,x-radius*.12,y-radius*.15,radius*.45,ivory);c.restore();
  }break;
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
  ambient(c,w,h,pink);
  const cols=Math.max(7,Math.round((12+mult*3)/Math.max(.65,s))),rows=5+Math.min(4,mult),cw=w/cols,ch=h/rows;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const intensity=.5+.5*Math.sin(a+col*.47+row*.83);
   const step=Math.floor((col+row*.75+1.5*Math.sin(a+row*.6))/3);
   if((step+row)%4===0)continue;
   c.save();c.globalAlpha=.18+.55*intensity;c.fillStyle=airbrush(c,row*ch,(row+1)*ch,(col+row)%2?pink:red);
   c.fillRect(col*cw,row*ch,cw+1,ch+1);c.restore();
  }break;
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
  ambient(c,w,h,pink);
  const panels=5+Math.min(5,mult*2),step=w/panels;
  for(let i=-1;i<=panels;i++){
   const x=i*step+step*.2*Math.sin(a+i*.5);
   const g=c.createLinearGradient(x,0,x+step*1.15,0);
   g.addColorStop(0,'rgba(84,18,41,0)');
   g.addColorStop(.42,i%2?'rgba(245,183,179,.6)':'rgba(230,0,35,.5)');
   g.addColorStop(1,'rgba(84,18,41,0)');
   c.fillStyle=g;c.fillRect(x,0,step*1.15,h);
  }break;
 }

 // 10: optical sunset — interlaced concentric wavefronts create a moving moire.
 case 9:{
  ambient(c,w,h,pink);
  const centers=2+mult;
  for(let i=0;i<centers;i++){
   const seed=i*1.9,x=w*(i+.5)/centers+h*.055*Math.sin(a*(1+i%2)+seed);
   const y=h*(.48+.13*Math.sin(a+seed)),radius=h*(.24+.05*Math.cos(a+seed))*s;
   c.save();c.globalAlpha=.2;gradientDisc(c,x,y,radius*1.7,pink);c.restore();
   c.save();c.globalAlpha=.68;gradientDisc(c,x,y,radius,red);c.restore();
   c.save();c.globalAlpha=.34;gradientDisc(c,x-h*.025,y-h*.025,radius*.5,ivory);c.restore();
  }break;
 }

 }
 c.restore();
}
