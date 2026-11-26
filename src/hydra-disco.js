// VINILE / DISCO — Hydra-synth engine.
// Original, editable Hydra studies. The gallery references are NOT copied: their
// source code must be supplied before faithful ports can be made.
import Hydra from 'hydra-synth';
import {redHydraStudies} from './hydra-red-studies.js';
import {cenaStudies} from './hydra-cena.js';
import {velvetLiveStudy} from './hydra-velvet-live.js';
import {monoHydraStudy} from './hydra-mono-collage.js';
const TAU=Math.PI*2;
let hydra=null,canvas=null,key='',live={},textCanvas=null,solarCanvas=null;
const customPatches=new Map();
const builtInPatches=new Map([...redHydraStudies,...cenaStudies,velvetLiveStudy,monoHydraStudy].map(study=>[study.id,study.code]));
let patchError='';
export const getHydraPatch=id=>customPatches.get(id)||builtInPatches.get(id)||'';
export const getHydraError=()=>patchError;
export function setHydraPatch(id,code){if(typeof code!=='string'||code.length>40000)throw Error('Script must be shorter than 40 KB');if(code.trim())customPatches.set(id,code);else customPatches.delete(id);key='';patchError='';}

const hexRgb=h=>{const v=h.replace('#','');const n=parseInt(v.length===3?v.split('').map(x=>x+x).join(''):v,16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const color=(src,rgb)=>src.color(...rgb);
const val=(key,fallback)=>()=>Number(live[key]??fallback);
const beat=()=>{const bpm=Math.max(60,Math.min(180,Math.round((live.bpm||120)/2)*2));return Math.sin((live.phase||0)*TAU*bpm/2)};
const speed=()=>Math.max(.1,Number(live.speed)||1);
function build(v){
 const custom=getHydraPatch(live.sceneId);
 if(custom){
  const synth=hydra.synth;
  const names=['osc','shape','noise','voronoi','gradient','solid','src','o0','o1','o2','o3','s0','s1','s2','s3','render','hush'];
  const param=(name,initial=0,min=0,max=1)=>()=>Math.max(Number(min),Math.min(Number(max),Number(live['patch_'+name]??initial)));
  const readParam=(name,initial=0,min=0,max=1)=>param(name,initial,min,max)();
  // Explicit user-authored local scripts: JavaScript is powerful. Do not paste untrusted code.
  const run=new Function(...names,'param','bpm','palette','time', '"use strict";\n'+custom);
  run(...names.map(n=>synth[n]),param,()=>Number(live.bpm||120),{background:live.bg,foreground:live.fg,highlight:live.accent},()=>Number(live.phase||0)*30);
  return;
 }

 const h=hydra.synth;
 const {osc,shape,noise,voronoi,gradient,solid,src,o0,s0}=h;
 const ink=hexRgb(live.fg),accent=hexRgb(live.accent),bg=hexRgb(live.bg);
 const amount=val('hydraAmount',.5),frequency=val('hydraFrequency',8),glitch=val('hydraGlitch',.35);
 const rhythm=()=>Math.max(0,beat())*Number(live.hydraBeat??.5);
 const prism=()=>.03+amount()*.3+rhythm()*.09;
 // 03 / GLITCH AFFAIR — aggressive pixel displacement and interference.
 if(v===2)color(osc(frequency,()=>.02*speed(),.8).modulatePixelate(noise(3,.1),()=>16+glitch()*200,()=>4+glitch()*80).modulate(osc(15,.03),()=>glitch()*.12),accent).out(o0);
 // 04 / VELVET — low-frequency liquid modulation.
 else if(v===3)color(noise(2,()=>.06*speed()).modulate(noise(4,.04),prism()).contrast(1.5),accent).blend(color(osc(2,.02),ink),.4).out(o0);
 // 06 / MALITZIN — cellular interference.
 else if(v===5)color(voronoi(()=>3+frequency()*.5,.1,.3).modulate(osc(frequency,.03),prism()),accent).blend(color(noise(3,.05),ink),.25).out(o0);
 // 07 / EXAMPLE 09 — oscillator kaleidoscope.
 else if(v===6)color(osc(frequency,.02,.4).kaleid(5).modulateRotate(noise(2,.04),prism()),ink).add(color(osc(2,.03),accent),.25).out(o0);
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
  const next=[v,w,h,scene.id,scene.colors[0],scene.colors[1],palette.highlight].join('|');
  if(!textCanvas)textCanvas=document.createElement('canvas');
  const tw=Math.max(2,Math.min(1536,w)),th=Math.max(2,Math.round(h*tw/w));if(textCanvas.width!==tw||textCanvas.height!==th){textCanvas.width=tw;textCanvas.height=th}
  const tc=textCanvas.getContext('2d');
  tc.clearRect(0,0,textCanvas.width,textCanvas.height);
  const word=(p.customText||'VINILE').slice(0,100);
  tc.fillStyle=scene.colors[1];tc.textAlign='center';tc.textBaseline='middle';
  let size=textCanvas.height*.55;do{tc.font='italic 900 '+Math.round(size)+'px Georgia, serif';if(tc.measureText(word).width<textCanvas.width*.84)break;size*=.9}while(size>12);
  tc.fillText(word,textCanvas.width/2,textCanvas.height/2);
  live={...p,phase,sceneId:scene.id,fg:scene.colors[1],bg:scene.colors[0],accent:palette.highlight,textCanvas};
  if(!hydra||key!==next){
   if(hydra){try{hydra.hush()}catch(_){}}
   canvas=document.createElement('canvas');canvas.width=scene.id==='body-001'?Math.min(1024,textCanvas.height*2):textCanvas.width;canvas.height=scene.id==='body-001'?canvas.width:textCanvas.height;
   hydra=new Hydra({canvas,detectAudio:false,makeGlobal:false,autoLoop:false,numSources:4,numOutputs:4});
   key=next;build(v);
  }
  // Explicit time advance: same engine for preview and recording.
  if(typeof hydra.tick==='function')hydra.tick(1000/30);
  patchError='';
  if(scene.family==='body'){
   // Soft-focus diffusion on the finished image: applies consistently to all CENA studies.
   // Render a slightly enlarged source to prevent blurred black borders.
   const softness=Math.max(0,Math.min(1,Number(p.patch_softness??.65)));
   const blurPx=softness*h*.055;
   if(scene.id==='body-001'){
    // Square Hydra is only a texture source. Never display its square background.
    // Apply soft focus first, then a radial alpha mask, composited on pure black.
    const side=Math.max(2,Math.round(h*1.7));
    const tmp=solarCanvas||(solarCanvas=document.createElement('canvas'));if(tmp.width!==side||tmp.height!==side){tmp.width=side;tmp.height=side}tmp.getContext('2d').clearRect(0,0,side,side);
    const tc=tmp.getContext('2d');
    tc.filter=blurPx>.01?`blur(${(blurPx*side/h).toFixed(2)}px)`:'none';
    tc.drawImage(canvas,0,0,side,side);
    tc.filter='none';
    tc.globalCompositeOperation='destination-in';
    const mask=tc.createRadialGradient(side/2,side/2,side*.32,side/2,side/2,side*.49);
    mask.addColorStop(0,'rgba(0,0,0,1)');
    mask.addColorStop(1,'rgba(0,0,0,0)');
    tc.fillStyle=mask;tc.fillRect(0,0,side,side);
    tc.globalCompositeOperation='source-over';
    c.fillStyle='#000';c.fillRect(0,0,w,h);
    c.drawImage(tmp,(w-side)/2,(h-side)/2);
   }else{
    c.save();
    c.filter=blurPx>.01?`blur(${blurPx.toFixed(2)}px)`:'none';
    const overscan=blurPx*2;
    c.drawImage(canvas,-overscan,-overscan,w+overscan*2,h+overscan*2);
    c.restore();
   }
  }else c.drawImage(canvas,0,0,w,h);
 }catch(err){
  patchError=err?.message||String(err);console.error('VINILE HYDRA:',err);
  c.fillStyle=scene.colors[0];c.fillRect(0,0,w,h);
  c.fillStyle=palette.highlight;c.font=Math.max(14,h*.045)+'px monospace';
  c.fillText('HYDRA ERROR — SEE CONSOLE',w*.04,h*.5);
 }
}
