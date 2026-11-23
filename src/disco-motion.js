// DISCO / NIGHT SHIFT — eight distinct beat-synchronised, 30s seamless light studies.
// Canvas2D geometry + shared WebGL GLASS shader; no extra dependency.
const TAU=Math.PI*2;
const mod=(n,m)=>((n%m)+m)%m;
const rgba=(hex,a)=>{const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'};
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);c.fillStyle=color;c.fill()}
function glow(c,x,y,r,color,alpha=1){const g=c.createRadialGradient(x,y,0,x,y,Math.max(1,r));g.addColorStop(0,rgba(color,alpha));g.addColorStop(.25,rgba(color,alpha*.55));g.addColorStop(1,rgba(color,0));circle(c,x,y,r,g)}
function polygon(c,x,y,r,sides,rotation,fill){c.beginPath();for(let k=0;k<sides;k++){const a=rotation+k*TAU/sides;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;k?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.fillStyle=fill;c.fill()}
export function renderDisco(c,w,h,phase,scene,p,P){
 const v=scene.variant,accent=P.highlight||'#E60023',ivory=P.ivory||'#F5EFE5',bg=scene.colors[0],fg=scene.colors[1];
 // Even BPM values yield an integer number of beats in a 30s loop.
 const bpm=Math.max(60,Math.min(180,Math.round((Number(p.bpm)||120)/2)*2));
 const beats=bpm*.5,beat=TAU*phase*beats,cycle=TAU*phase;
 const pulse=.5-.5*Math.cos(beat),breath=.5+.5*Math.sin(cycle);
 c.save();c.fillStyle=bg;c.fillRect(0,0,w,h);c.beginPath();c.rect(0,0,w,h);c.clip();
 const unit=h,centerX=w*.5,centerY=h*.5;
 // 01 / MIRROR BALL: tessellated mirrored globe, shimmering on the beat.
 if(v===0){
  const count=Math.max(3,Math.ceil(w/(h*.95)));
  for(let k=0;k<count;k++){
   const x=(k+.5)*w/count+h*.06*Math.sin(cycle+k),y=centerY+h*.04*Math.cos(cycle+k);
   const r=h*(.32+.035*pulse)*(p.scale||1);
   glow(c,x,y,r*1.7,accent,.28+.18*pulse);
   c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();
   for(let row=-8;row<=8;row++)for(let col=-8;col<=8;col++){
    const xx=x+col*r*.145+Math.sin(cycle)*r*.06,yy=y+row*r*.145;
    const light=.2+.8*Math.pow(Math.max(0,Math.sin(col*.7+row*.9+cycle+beat*.12)),4);
    c.fillStyle=rgba((row+col)%4===0?accent:ivory,.12+light*.78);
    c.fillRect(xx,yy,r*.12,r*.12);
   }c.restore();
  }
 }
 // 02 / PRISM FAN: rotating refractive light blades.
 if(v===1){
  for(let k=0;k<4;k++){
   const x=w*(k+.5)/4,y=centerY;
   glow(c,x,y,h*.66,accent,.32);
   for(let j=0;j<16;j++){
    const a=j*TAU/16+cycle*(k%2?-1:1)+.09*Math.sin(beat);
    c.beginPath();c.moveTo(x,y);c.arc(x,y,h*(.38+.08*pulse),a,a+.14);c.closePath();
    c.fillStyle=rgba(j%3===0?ivory:accent,.13+.3*pulse);c.fill();
   }
   circle(c,x,y,h*.055,ivory);
  }
 }
 // 03 / LASER CORRIDOR: perspective portals expanding and contracting.
 if(v===2){
  const cx=centerX+h*.11*Math.sin(cycle),cy=centerY;
  for(let i=16;i>=0;i--){
   const depth=mod(i/17+breath*.16,1),r=h*(.12+depth*2.6);
   c.save();c.translate(cx,cy);c.rotate(.12*Math.sin(cycle)+i*.035);
   c.strokeStyle=rgba(i%4===0?ivory:accent,.12+.6*(1-depth));c.lineWidth=h*(.004+.01*pulse)*(1-depth*.6);
   c.strokeRect(-r*2.2,-r*.55,r*4.4,r*1.1);c.restore();
  }
  glow(c,cx,cy,h*.42,accent,.6);
 }
 // 04 / STROBE STARS: vintage 8-point stars with breathing halos.
 if(v===3){
  const cols=9,rows=3;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const x=(col+.5)*w/cols,y=(row+.5)*h/rows,seed=row*cols+col;
   const r=h*(.025+.065*(.5+.5*Math.sin(beat+seed*.91)))*(p.scale||1);
   glow(c,x,y,r*3,accent,.3);
   c.save();c.translate(x,y);c.rotate(.08*Math.sin(cycle+seed));
   for(let j=0;j<8;j++){const a=j*TAU/8;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-.14)*r*.3,Math.sin(a-.14)*r*.3);c.lineTo(Math.cos(a)*r*2,Math.sin(a)*r*2);c.lineTo(Math.cos(a+.14)*r*.3,Math.sin(a+.14)*r*.3);c.closePath();c.fillStyle=j%2?accent:ivory;c.globalAlpha=.5+.5*pulse;c.fill()}c.restore();
  }
 }
 // 05 / CHROME WAVES: liquid specular ribbons in independent phases.
 if(v===4){
  for(let j=0;j<7;j++){
   const base=h*(j+.5)/7,amp=h*(.07+.025*pulse);
   c.beginPath();
   for(let x=0;x<=w+10;x+=Math.max(5,h*.018)){
    const y=base+amp*Math.sin(x/h*(1.5+j*.12)+cycle*(j%2?-1:1)+j*.9);
    x?c.lineTo(x,y):c.moveTo(x,y);
   }
   c.strokeStyle=rgba(j%3===0?ivory:accent,.45+.4*pulse);c.lineWidth=h*(.012+.012*breath);c.shadowColor=accent;c.shadowBlur=h*.09;c.stroke();c.shadowBlur=0;
  }
 }
 // 06 / KALEIDOSCOPE: mirrored angular glass petals.
 if(v===5){
  const count=Math.max(2,Math.ceil(w/(h*1.2)));
  for(let k=0;k<count;k++){
   const x=w*(k+.5)/count,y=centerY;
   glow(c,x,y,h*.6,accent,.25);
   for(let j=0;j<12;j++){
    const a=j*TAU/12+.3*Math.sin(cycle);
    c.save();c.translate(x,y);c.rotate(a);
    c.beginPath();c.moveTo(h*.07,0);c.lineTo(h*(.3+.13*pulse),-h*.085);c.lineTo(h*(.46+.06*breath),0);c.lineTo(h*(.3+.13*pulse),h*.085);c.closePath();
    c.fillStyle=rgba(j%3===0?ivory:accent,.15+.42*(.5+.5*Math.sin(beat+j)));c.fill();c.restore();
   }
  }
 }
 // 07 / LIGHT SCANNER: moving optical bars with refraction-like glints.
 if(v===6){
  const bars=18;
  for(let i=0;i<bars;i++){
   const x=(i+.5)*w/bars+h*.09*Math.sin(cycle+i*.3);
   const height=h*(.18+.68*(.5+.5*Math.sin(beat+i*.7)));
   const g=c.createLinearGradient(x-w/bars*.3,0,x+w/bars*.3,0);
   g.addColorStop(0,rgba(accent,0));g.addColorStop(.45,rgba(i%4===0?ivory:accent,.65));g.addColorStop(1,rgba(accent,0));
   c.fillStyle=g;c.fillRect(x-w/bars*.3,(h-height)/2,w/bars*.6,height);
   glow(c,x,h*.5,h*.11,accent,.3);
  }
 }
 // 08 / REFRACTED ORBITS: luminous elliptical lens rings with distinct rotation.
 if(v===7){
  const count=3+Math.round(p.geometryDensity||1);
  for(let i=0;i<count;i++){
   const x=w*(i+.5)/count,y=h*(.5+.08*Math.sin(cycle+i));
   glow(c,x,y,h*.43,accent,.2+.2*pulse);
   for(let j=0;j<5;j++){
    c.save();c.translate(x,y);c.rotate(j*.58+cycle*(j%2?-1:1)*.28);
    c.beginPath();c.ellipse(0,0,h*(.12+j*.055)*(p.scale||1),h*(.29-j*.02)*(p.scale||1),0,0,TAU);
    c.strokeStyle=rgba(j%2?ivory:accent,.28+.55*pulse);c.lineWidth=h*(.005+.002*j);c.shadowColor=accent;c.shadowBlur=h*.04;c.stroke();c.restore();
   }
   circle(c,x,y,h*.035,ivory);
  }
 }
 c.restore();
}
