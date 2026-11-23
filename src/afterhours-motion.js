// Original Studio: ten editorial / circus-inspired 2D AFTER HOURS motion presets.
// All animations are functions of normalized phase, with identical 0/1 boundaries.
const TAU=Math.PI*2;
const wrap=(x,m)=>((x%m)+m)%m;
const star=(c,x,y,r,color,points=5)=>{c.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*.43:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fillStyle=color;c.fill()};
export function renderAfterHours(c,w,h,phase,scene,params,palette){
 const v=scene.variant, [bg,fg]=scene.colors, t=phase*TAU*params.speed;
 const ivory=palette.ivory,orange=palette.orange,pink=palette.highlight,black=palette.black;
 const font=(size,italic=true)=>{c.font=(italic?'italic ':'')+'600 '+Math.round(size)+'px "Bodoni Moda",Georgia,serif';c.textAlign='center';c.textBaseline='middle'};
 const title=(typeof params.customText==='string'&&params.customText.trim()?params.customText.trim():['After Hours','Dance Until Late','VINILE','Amore.','Stay a Little Longer','Good Music','La Dolce Notte','Tonight Is Yours','Dance Dance Dance','Until the Morning'][v]);
 const size=h*(title.length>16?.52:title.length>11?.65:.9)*params.scale;
 const text=(label,x,y,color=fg,sz=size)=>{c.fillStyle=color;font(sz);c.fillText(label,x,y)};
 const dots=(y,dir,color)=>{for(let i=0;i<34;i++){let x=wrap((i/34+dir*phase*params.speed)*w,w);star(c,x,y,h*.024,color,5)}};
 c.fillStyle=bg;c.fillRect(0,0,w,h);
 c.save();
 switch(v){
 case 0: // opposing star parades
   dots(h*.16,1,orange);dots(h*.84,-1,pink);text(title,w/2,h*.53);break;
 case 1: // CABARET: a legible italic neon sign with a soft traveling spotlight
   {
    const label=title;
    const maxWidth=w*.78;
    let fontSize=h*.84*params.scale;
    c.textAlign='center';c.textBaseline='middle';
    const cabaretFont=s=>`italic 700 ${Math.round(s)}px Georgia, "Times New Roman", serif`;
    c.font=cabaretFont(fontSize);
    const measured=c.measureText(label).width;
    if(measured>maxWidth)fontSize*=maxWidth/measured;
    c.font=cabaretFont(fontSize);
    const y=h*.52;
    // Wide velvet-red shadow and warm red-orange neon, on true black.
    c.save();
    c.textAlign='center';c.textBaseline='middle';
    c.shadowColor=orange;c.shadowBlur=h*.095;c.globalAlpha=.48;
    c.fillStyle=orange;c.fillText(label,w/2,y);
    c.restore();
    c.save();
    c.textAlign='center';c.textBaseline='middle';
    c.shadowColor=orange;c.shadowBlur=h*.025;
    c.lineWidth=Math.max(1.5,h*.005);
    c.strokeStyle='#6B120B';c.strokeText(label,w/2,y);
    c.fillStyle=orange;c.fillText(label,w/2,y);
    // A smooth spotlight crosses the entire word; it never hides its letters.
    const textWidth=Math.min(maxWidth,c.measureText(label).width);
    const left=w/2-textWidth/2;
    const lightX=left+(Math.sin(phase*TAU-Math.PI/2)*.5+.5)*textWidth;
    const gradient=c.createLinearGradient(lightX-h*.30,0,lightX+h*.30,0);
    gradient.addColorStop(0,'rgba(255,235,185,0)');
    gradient.addColorStop(.5,'rgba(255,235,185,.92)');
    gradient.addColorStop(1,'rgba(255,235,185,0)');
    c.globalCompositeOperation='screen';c.globalAlpha=.5;
    c.fillStyle=gradient;c.fillText(label,w/2,y);
    c.restore();
    // Cabaret marquee bulbs, gently breathing rather than flashing.
    for(let i=0;i<12;i++){
      const x=w*.16+(i+.5)*w*.68/12;
      const a=.30+.28*(.5+.5*Math.cos(phase*TAU+i*.3));
      c.save();c.globalAlpha=a;star(c,x,h*.16,h*.012,orange,4);star(c,x,h*.88,h*.012,orange,4);c.restore();
    }
   }
   break;
 case 2: // optical rays and central type
   for(let i=0;i<26;i++){const a=i*TAU/26+Math.sin(t)*.06;c.strokeStyle=i%2?pink:orange;c.lineWidth=h*.014;c.beginPath();c.moveTo(w/2+Math.cos(a)*h*.7,h/2+Math.sin(a)*h*.7);c.lineTo(w/2+Math.cos(a)*w,h/2+Math.sin(a)*w);c.stroke()}
   text(title,w/2,h*.54,bg,h*.95*params.scale);break;
 case 3: // pink typographic curtain
   for(let i=0;i<12;i++){const x=i*w/12;c.fillStyle=i%2?orange:pink;c.fillRect(x,0,w/24,h*(.22+.08*Math.sin(t+i*.4)))}
   text(title,w/2,h*.58);break;
 case 4: // stars march around the headline
   for(let i=0;i<18;i++){const a=i*TAU/18+t;star(c,w/2+Math.cos(a)*w*.38,h/2+Math.sin(a)*h*.37,h*.03,i%2?pink:orange)}
   text(title,w/2,h*.53);break;
 case 5: // double echo / editorial
   text(title,w/2+h*.06*Math.sin(t),h*.43,pink,size);text(title,w/2-h*.06*Math.sin(t),h*.57,fg,size);break;
 case 6: // old LED sign, dot matrix border
   for(let i=0;i<64;i++){const x=i*w/64;star(c,x,h*.12,h*.012,i%4===Math.floor((1-Math.cos(t))*2)?orange:pink);star(c,x,h*.89,h*.012,i%4===Math.floor(phase*4)?orange:pink)}
   text(title,w/2,h*.52);break;
 case 7: // vertical wipes
   for(let i=0;i<10;i++){const x=i*w/10;c.fillStyle=i%2?orange:pink;c.fillRect(x,h*(.5+.5*Math.sin(t+i*.65)),w/10,h)}
   text(title,w/2,h*.5);break;
 case 8: // repetitive carnival type
   for(let i=0;i<4;i++)text(title,w/2,h*(.14+i*.24)+Math.sin(t+i)*h*.025,i%2?pink:fg,h*.32*params.scale);break;
 case 9: // starfield curtain and farewell
   for(let i=0;i<38;i++){let x=wrap(i*w/38+w*.025*Math.sin(t)*(i%2?1:-1),w);star(c,x,h*(.14+(i%5)*.17),h*(.014+i%3*.006),i%3?orange:pink)}
   text(title,w/2,h*.55,fg);break;
 }
 c.restore();
}
