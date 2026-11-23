// Text-only clip for each VINILE visual family. Deterministic, seamless motion.
const TAU=Math.PI*2;
const fit=(ctx,label,size,max)=>{ctx.font=`italic 700 ${Math.round(size)}px Georgia, "Times New Roman", serif`;const width=ctx.measureText(label).width;return width>max?size*max/width:size};
export function renderFamilyText(ctx,w,h,phase,scene,params,palette){
 const label=(params.customText||'VINILE').trim()||'VINILE';
 const family=scene.family;
 const black=scene.colors[0],red=palette.highlight||'#E60023',ivory=palette.ivory||'#F5EFE5';
 const t=phase*TAU*Math.max(1,Math.round(params.speed||1));
 ctx.save();ctx.fillStyle=black;ctx.fillRect(0,0,w,h);
 ctx.textAlign='center';ctx.textBaseline='middle';
 const size=fit(ctx,label,h*.76*(params.scale||1),w*.84);
 ctx.font=`italic 700 ${Math.round(size)}px Georgia, "Times New Roman", serif`;
 const x=w/2,y=h/2;
 if(family==='sunset'){
  const g=ctx.createLinearGradient(0,y-size*.65,0,y+size*.65);
  g.addColorStop(0,'#f5b7b3');g.addColorStop(.44,red);g.addColorStop(1,'#7c1633');
  ctx.shadowColor=red;ctx.shadowBlur=h*.065;ctx.fillStyle=g;ctx.fillText(label,x,y);
  ctx.shadowBlur=0;ctx.globalAlpha=.18+.12*Math.cos(t);ctx.strokeStyle=ivory;ctx.lineWidth=h*.003;ctx.strokeText(label,x,y);
 }else if(family==='red'){
  const dx=Math.sin(t)*h*.014;
  ctx.globalAlpha=.35;ctx.fillStyle=red;ctx.fillText(label,x+dx+h*.023,y+h*.018);
  ctx.globalAlpha=1;ctx.fillStyle=ivory;ctx.fillText(label,x-dx,y);
  ctx.globalAlpha=.7;ctx.strokeStyle=red;ctx.lineWidth=h*.006;ctx.strokeText(label,x-dx,y);
 }else if(family==='type'){
  ctx.shadowColor=red;ctx.shadowBlur=h*.075;ctx.fillStyle=red;ctx.fillText(label,x,y);
  ctx.shadowBlur=0;const width=Math.min(w*.84,ctx.measureText(label).width);
  const light=x-width/2+width*(.5-.5*Math.cos(t));
  const grad=ctx.createLinearGradient(light-h*.24,0,light+h*.24,0);
  grad.addColorStop(0,'rgba(255,220,170,0)');grad.addColorStop(.5,'rgba(255,220,170,.9)');grad.addColorStop(1,'rgba(255,220,170,0)');
  ctx.globalAlpha=.55;ctx.fillStyle=grad;ctx.fillText(label,x,y);
 }else{
  // Disco / NIGHT SHIFT: crisp mirror-light sign, black ground.
  const offset=h*.014*Math.sin(t);
  ctx.shadowColor=red;ctx.shadowBlur=h*.05;ctx.fillStyle=red;ctx.fillText(label,x,y+offset);
  ctx.shadowBlur=0;ctx.globalAlpha=.22+.12*Math.cos(t);ctx.fillStyle=ivory;ctx.fillText(label,x,y-offset);
 }
 ctx.restore();
}
