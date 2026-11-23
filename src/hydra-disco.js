// VINILE / DISCO — Hydra-synth engine.
// Original, editable Hydra studies. The gallery references are NOT copied: their
// source code must be supplied before faithful ports can be made.
import Hydra from 'hydra-synth';
const TAU=Math.PI*2;
let hydra=null,canvas=null,key='',live={};
const hexRgb=h=>{const v=h.replace('#','');const n=parseInt(v.length===3?v.split('').map(x=>x+x).join(''):v,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const color=(src,rgb)=>src.color(...rgb);
const val=(key,fallback)=>()=>Number(live[key]??fallback);
const beat=()=>{const bpm=Math.max(60,Math.min(180,Math.round((live.bpm||120)/2)*2));return Math.sin((live.phase||0)*TAU*bpm/2)};
const speed=()=>Math.max(.1,Number(live.speed)||1);
function build(v){
 const h=hydra.synth;
 const {osc,shape,noise,voronoi,gradient,solid,src,o0,s0}=h;
 const ink=hexRgb(live.fg),accent=hexRgb(live.accent),bg=hexRgb(live.bg);
 const amount=val('hydraAmount',.5),frequency=val('hydraFrequency',8),glitch=val('hydraGlitch',.35);
 const rhythm=()=>Math.max(0,beat())*Number(live.hydraBeat??.5);
 const prism=()=>.03+amount()*.3+rhythm()*.09;
 // 01 / SUNSET AFTER DARK — soft chromatic oscillations.
 if(v===0)color(osc(frequency,()=>.02*speed(),0).modulate(noise(2,.05),prism()),accent).blend(color(gradient(1),ink),.35).out(o0);
 // 02 / TRIANGLE FEVER — refracted three-sided geometry.
 else if(v===1)color(shape(3,()=>.23+rhythm()*.12,.008).repeat(3,2).modulateRotate(osc(3,.04),prism()),accent).add(color(osc(frequency,.02),ink),.2).out(o0);
 // 03 / GLITCH AFFAIR — aggressive pixel displacement and interference.
 else if(v===2)color(osc(frequency,()=>.02*speed(),.8).modulatePixelate(noise(3,.1),()=>16+glitch()*200,()=>4+glitch()*80).modulate(osc(15,.03),()=>glitch()*.12),accent).out(o0);
 // 04 / VELVET — low-frequency liquid modulation.
 else if(v===3)color(noise(2,()=>.06*speed()).modulate(noise(4,.04),prism()).contrast(1.5),accent).blend(color(osc(2,.02),ink),.4).out(o0);
 // 05 / CELESTE — interference and soft chromatic diffusion.
 else if(v===4)color(voronoi(5,()=>.06*speed(),.3).modulate(noise(3,.05),prism()).blend(osc(frequency,.02),.3),ink).add(color(osc(2,.01),accent),.25).out(o0);
 // 06 / MALITZIN — cellular interference.
 else if(v===5)color(voronoi(()=>3+frequency()*.5,.1,.3).modulate(osc(frequency,.03),prism()),accent).blend(color(noise(3,.05),ink),.25).out(o0);
 // 07 / EXAMPLE 09 — oscillator kaleidoscope.
 else if(v===6)color(osc(frequency,.02,.4).kaleid(5).modulateRotate(noise(2,.04),prism()),ink).add(color(osc(2,.03),accent),.25).out(o0);
 // 08 / RITCHSE — nested oscillation and modulation.
 else if(v===7)color(osc(frequency,.02,.5).modulateScale(osc(3,.03),prism()).kaleid(6),accent).blend(color(voronoi(3,.03),ink),.3).out(o0);
 // 09 / MARIANNE — fluid interference.
 else if(v===8)color(noise(3,.04).modulate(osc(frequency,.03),prism()).kaleid(4),ink).add(color(osc(2,.01),accent),.3).out(o0);
 // 10 / TEXT GLITCH — source canvas through Hydra pixel modulation.
 else if(v===9){
  s0.init({src:live.textCanvas});
  src(s0).modulatePixelate(noise(4,.1),()=>8+glitch()*100,()=>4+glitch()*55)
   .modulate(osc(12,.03),()=>glitch()*.13)
   .add(src(s0).scrollX(()=>.004*beat()).color(...accent),()=>.08+glitch()*.2).out(o0);
 }
 // Keep all palettes editable. Hydra outputs black by default; optional custom
 // backgrounds are composed in the main Canvas renderer behind the source.
}
export function renderHydraDisco(c,w,h,phase,scene,p,palette){
 try{
  const v=scene.isText?9:scene.variant;
  const next=[v,w,h,scene.colors[0],scene.colors[1],palette.highlight].join('|');
  const textCanvas=document.createElement('canvas');
  textCanvas.width=Math.max(2,Math.min(1536,w));textCanvas.height=Math.max(2,Math.round(h*textCanvas.width/w));
  const tc=textCanvas.getContext('2d');
  tc.clearRect(0,0,textCanvas.width,textCanvas.height);
  const word=(p.customText||'VINILE').slice(0,100);
  tc.fillStyle=scene.colors[1];tc.textAlign='center';tc.textBaseline='middle';
  let size=textCanvas.height*.55;do{tc.font='italic 900 '+Math.round(size)+'px Georgia, serif';if(tc.measureText(word).width<textCanvas.width*.84)break;size*=.9}while(size>12);
  tc.fillText(word,textCanvas.width/2,textCanvas.height/2);
  live={...p,phase,fg:scene.colors[1],bg:scene.colors[0],accent:palette.highlight,textCanvas};
  if(!hydra||key!==next){
   if(hydra){try{hydra.hush()}catch(_){}}
   canvas=document.createElement('canvas');canvas.width=textCanvas.width;canvas.height=textCanvas.height;
   hydra=new Hydra({canvas,detectAudio:false,makeGlobal:false,autoLoop:false,numSources:4,numOutputs:4});
   key=next;build(v);
  }
  // Explicit time advance: same engine for preview and recording.
  if(typeof hydra.tick==='function')hydra.tick(1000/30);
  c.drawImage(canvas,0,0,w,h);
 }catch(err){
  console.error('VINILE HYDRA:',err);
  c.fillStyle=scene.colors[0];c.fillRect(0,0,w,h);
  c.fillStyle=palette.highlight;c.font=Math.max(14,h*.045)+'px monospace';
  c.fillText('HYDRA ERROR — SEE CONSOLE',w*.04,h*.5);
 }
}
