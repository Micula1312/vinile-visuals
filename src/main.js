import {mappingPage,closeMapping} from './mapping-lab.js';
import {butterControls,butterDefaults,butterAsset,loadButter,renderButter} from './butter-motion.js';
import {renderFamilyText} from './family-text.js';
import {applyGlassFX} from './glass-fx.js';
import {renderCollage,loadCollagePhotos,getCollagePhotos,clearCollagePhotos} from './red-collage.js';
import {finishSunset} from './sunset-finish.js';
import {renderRedPhoto,loadRedPhoto,getRedPhoto,clearRedPhoto} from './red-photo.js';
import { renderRed, loadRedGif, getRedAsset, clearRedAssets } from './red-motion.js';
import './style.css';
import { renderAfterHours } from './afterhours-motion.js';
import { renderSunset } from './sunset-motion.js';
import { renderOptical } from './optical-motion.js';
import { renderNight } from './night-motion.js';
import { renderDisco } from './disco-motion.js';
import {renderHydraDisco,setHydraPatch} from './hydra-disco.js';
import {openHydraEditor} from './hydra-editor.js';
import {redHydraStudies} from './hydra-red-studies.js';
import {cenaStudies} from './hydra-cena.js';
import {velvetLiveStudy} from './hydra-velvet-live.js';
import {monoHydraStudy} from './hydra-mono-collage.js';
const BURRO_PALETTE={butter:'#F4D98A',powderBlue:'#7896AE',cream:'#FFF8E9',red:'#E60023'};
const P={black:'#0A0809',ivory:'#F5EFE5',orange:'#FF481C',red:'#E60023',pink:'#EE69A7',violet:'#A58AFF',blue:'#235BFF',grey:'#A3A0A0'};
const families=[['sunset','SUNSET STUDIES','Golden-hour discs, horizons, optical afterglow'],['night','NIGHT SHIFT / HYDRA DISCO','Glitch, velvet, prisms and optical modulation'],['body','LIVE / CENA','Slow magma, fire, eclipses and solar studies'],['type','AFTER HOURS','Electric-blue editorial kinetic typography'],['optical','OPTICAL STUDIES','Hydra-inspired blurred light and interference'],['red','RED PASSION','Dinner, cabaret, pop-trash GIFs and bitmap distortion']];
const scenes=families.flatMap(([family,name],fi)=>Array.from({length:10},(_,i)=>({id:`${family}-${String(i+1).padStart(3,'0')}`,family,name:`${name} / ${String(i+1).padStart(2,'0')}`,variant:i,colors:[[P.black,P.ivory],[P.black,P.blue],[P.black,P.violet],[P.black,P.blue],[P.black,P.violet],[P.black,P.violet],[P.black,P.red]][fi]})));
for(const s of scenes.filter(s=>s.family==='body')){const study=cenaStudies[s.variant];s.name=study.name;s.colors=[P.black,P.red]}
scenes.push({id:'body-011',family:'body',name:cenaStudies[10].name,variant:10,colors:[P.black,P.red]});
const discoNames=['SUNSET AFTER DARK','TRIANGLE FEVER','GLITCH AFFAIR','VELVET','CELESTE','MALITZIN','EXAMPLE 09','RITCHSE','MARIANNE','TEXT GLITCH'];
for(const s of scenes.filter(s=>s.family==='night')){s.name='DISCO / '+String(s.variant+1).padStart(2,'0')+' — '+discoNames[s.variant];if(s.variant===9)s.isText=true}
for(const [i,study] of redHydraStudies.entries()){
 scenes.push({id:study.id,family:'night',name:'DISCO / '+String(11+i).padStart(2,'0')+' — '+study.name,variant:10+i,colors:[P.black,P.red]});
}
scenes.push({id:'night-016',family:'night',name:'DISCO / 16 — MONOCHROME COLLAPSE',variant:15,colors:[P.black,P.ivory]});
const monoCollageStudy=monoHydraStudy;
const velvetScene=scenes.find(s=>s.id==='night-004');if(velvetScene)velvetScene.name=velvetLiveStudy.name;
const hydraValuesByScene=new Map();
const redStudyForScene=id=>[...redHydraStudies,...cenaStudies,velvetLiveStudy,monoCollageStudy].find(study=>study.id===id);
const textFamilies=new Set(['sunset','red','type']);
for(const [family,name] of families.filter(([id])=>textFamilies.has(id))){const base=scenes.find(s=>s.family===family);scenes.push({id:family+'-011',family,name:name+' / 11 — TEXT',variant:10,isText:true,colors:[...base.colors]})}
try{for(const [id,script] of Object.entries(JSON.parse(localStorage.getItem('vinile-hydra-patches-v1')||'{}'))){if(scenes.some(s=>s.id===id&&(s.family==='night'||s.family==='body')))setHydraPatch(id,script)}}catch(e){console.warn('VINILE saved Hydra patches',e)}
const textByScene=Object.fromEntries(scenes.filter(s=>s.isText).map(s=>[s.id,'VINILE']));
const redTitles=['EYE CONTACT','FACE MELT','KISS KISS','BON APPÉTIT','TOUCH ME','BODY LANGUAGE','BAD RECEPTION','MIRROR MIRROR','TOO CLOSE','THE END?'];
for(const scene of scenes.filter(s=>s.family==='red'))scene.name='RED PASSION / '+String(scene.variant+1).padStart(2,'0')+' — '+redTitles[scene.variant];
families.push(['butter','BURRO / IL FUORI ORARIO','Burnt film, butter warmth and editorial typography']);
for(const [i,name] of ['BURNT FILM','BUTTER TYPE','AFTER MELT'].entries())scenes.push({id:'butter-00'+(i+1),family:'butter',name:'BURRO / '+name,variant:i,colors:['#160d08','#fff8e9']});
// Retired studies: preserve original variant indices for remaining algorithms.
const retiredScenes=new Set(["night-001","night-002","night-005","night-008","body-002","body-005","body-009","body-010","type-003"]);
for(let i=scenes.length-1;i>=0;i--)if(retiredScenes.has(scenes[i].id))scenes.splice(i,1);
const defaultHighlights={butter:BURRO_PALETTE.cream,sunset:P.red,night:P.red,body:P.red,type:P.red,optical:P.red,red:P.red};
const highlights={...defaultHighlights};
const originalSceneColors=new Map(scenes.map(s=>[s.id,[...s.colors]]));
const defaultParams={...butterDefaults,customText:'',bpm:120,hydraAmount:.5,hydraFrequency:8,hydraGlitch:.35,hydraBeat:.5,scale:1,speed:1,dither:0,blur:.08,distort:.55,frequency:1,multiply:1,copies:1,copiesY:1,pulse:0,drift:0,cameraDepth:0,rotationX:.15,rotationY:.25,perspective:48,geometryDensity:1,pixelSize:8,threshold:.5,smear:0,glitch:0,redZoom:1,sunsetGrain:.25,sunsetGlow:.42,sunsetBlur:.08,sunsetBlackLift:0,sunsetGradient:0,sunsetHalation:0,typeGrain:0,typeGlow:0,typeBlur:0,typeBlackLift:0,typeGradient:0,typeHalation:0,glassRefraction:0,glassBloom:0,glassSoftness:0,glassChromatic:0};
const defaultResolution={w:2304,h:512};
const app=document.querySelector('#app');let autoParams={},selected=scenes[0],playing=true,frame=0,last=0,params={...defaultParams},resolution={w:2304,h:512},duration=30,fps=30,quality=16,exporting=false;
// Persistent output canvas: popup video stays alive when Studio rerenders its preview.
const projectorCanvas=document.createElement('canvas');
projectorCanvas.width=resolution.w;projectorCanvas.height=resolution.h;
let projectorWindow=null,projectorStream=null;
function openProjector(){
 if(projectorWindow&&!projectorWindow.closed){projectorWindow.focus();return;}
 const popup=window.open('','vinile-projector','popup=yes,width=1200,height=600');
 if(!popup){alert('Consenti i popup per aprire PROJECTOR OUTPUT.');return;}
 projectorWindow=popup;
 popup.document.open();
 popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>VINILE / PROJECTOR OUTPUT</title>
 <style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden}
 video{width:100vw;height:100vh;object-fit:contain;display:block;background:#000}
 #fullscreen{position:fixed;right:18px;top:18px;background:#161616cc;color:#fff;border:1px solid #888;padding:12px 16px;font:12px monospace;cursor:pointer;opacity:.65}
 #fullscreen:hover{opacity:1}</style></head><body><video id="output" autoplay muted playsinline></video><button id="fullscreen">⛶ FULLSCREEN</button></body></html>`);
 popup.document.close();
 if(!projectorStream)projectorStream=projectorCanvas.captureStream(30);
 const video=popup.document.getElementById('output');
 video.srcObject=projectorStream;
 video.play().catch(()=>{});
 popup.document.getElementById('fullscreen').onclick=()=>{
  if(popup.document.fullscreenElement)popup.document.exitFullscreen();
  else popup.document.documentElement.requestFullscreen().catch(()=>{});
 };
}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const autoRanges={...Object.fromEntries(butterControls.map(([k,l,v,min,max])=>['butter_'+k,[min,max]])),hydraAmount:[0,1],hydraFrequency:[1,30],hydraGlitch:[0,1],hydraBeat:[0,1],glassRefraction:[0,1],glassBloom:[0,1],glassSoftness:[0,1],glassChromatic:[0,1],typeGrain:[0,1],typeGlow:[0,1],typeBlur:[0,1],typeBlackLift:[0,1],typeGradient:[0,1],typeHalation:[0,1],sunsetBlackLift:[0,1],sunsetGradient:[0,1],sunsetHalation:[0,1],sunsetGrain:[0,1],sunsetGlow:[0,1],sunsetBlur:[0,1],scale:[.3,1.8],speed:[1,24],dither:[0,1],copies:[1,8],copiesY:[1,8],pulse:[0,1],drift:[0,1],pixelSize:[2,40],threshold:[0,1],smear:[0,1],glitch:[0,1],redZoom:[1,8],blur:[.005,.35],distort:[0,2],frequency:[.2,4],cameraDepth:[-3,3],rotationX:[-3.14,3.14],rotationY:[-3.14,3.14],perspective:[20,100],geometryDensity:[1,5],multiply:[1,5]};
const discreteParams=new Set(['butter_pixel','speed','copies','copiesY','pixelSize','geometryDensity','multiply']);
function animatedParams(p,phase,flags=autoParams){
 if(!Object.values(flags).some(Boolean))return p;
 const out={...p};
 const wave=.5-.5*Math.cos(phase*Math.PI*2); // starts and ends at the original slider value
 for(const [key,enabled] of Object.entries(flags)){
  if(!enabled||!autoRanges[key])continue;
  const [lo,hi]=autoRanges[key],center=clamp(Number(p[key]??lo),lo,hi);
  const roomUp=hi-center,roomDown=center-lo;
  // Use the full available direction instead of becoming invisible at slider boundaries.
  const direction=roomUp>=roomDown?1:-1;
  const amplitude=(direction===1?roomUp:roomDown)*.8;
  const value=clamp(center+direction*amplitude*wave,lo,hi);
  out[key]=discreteParams.has(key)?Math.round(value):value;
 }
 return out;
}
const ellipse=(c,x,y,rx,ry,color)=>{c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);c.fillStyle=color;c.fill()};
function renderBase(c,w,h,phase,s=selected,p=params){if(s.family==='butter'){renderButter(c,w,h,phase,{...s,colors:[s.colors[0],highlights.butter]},p);return;}const palette={...P,highlight:highlights[s.family]};if(s.isText&&s.family==='night'){renderHydraDisco(c,w,h,phase,s,p,palette);return}if(s.isText){renderFamilyText(c,w,h,phase,s,p,palette);if(s.family==='sunset')finishSunset(c,w,h,p,phase);if(s.family==='type')finishSunset(c,w,h,{sunsetGrain:p.typeGrain,sunsetGlow:p.typeGlow,sunsetBlur:p.typeBlur,sunsetBlackLift:p.typeBlackLift,sunsetGradient:p.typeGradient,sunsetHalation:p.typeHalation},phase);if(s.family==='sunset'||s.family==='type'||s.family==='night')applyGlassFX(c,w,h,phase,p);return}const [bg,fg]=s.colors;const t=phase*Math.PI*2*p.speed;const v=s.variant; c.fillStyle=bg;c.fillRect(0,0,w,h);const unit=h/512;const S=p.scale;
if(s.family==='red'){if(s.variant===1)renderRedPhoto(c,w,h,phase,s,p,highlights.red);else if(s.variant===2)renderCollage(c,w,h,phase,s,p,highlights.red);else renderRed(c,w,h,phase,s,p,palette);}
if(s.family==='sunset'){renderSunset(c,w,h,phase,s,p,palette);finishSunset(c,w,h,p,phase)}
if(s.family==='optical')renderOptical(c,w,h,phase,s,p,palette);
if(s.family==='night'||s.family==='body')renderHydraDisco(c,w,h,phase,s,p,palette);
if(s.family==='body')return;
if(s.family==='type'){renderAfterHours(c,w,h,phase,s,p,palette);finishSunset(c,w,h,{sunsetGrain:p.typeGrain,sunsetGlow:p.typeGlow,sunsetBlur:p.typeBlur,sunsetBlackLift:p.typeBlackLift,sunsetGradient:p.typeGradient,sunsetHalation:p.typeHalation},phase)}

if(p.dither>0){c.save();c.globalAlpha=p.dither*.38;c.fillStyle=P.black;let step=Math.max(6,Math.round(h/64));for(let y=0;y<h;y+=step)for(let x=(Math.floor(y/step)%2)*step;x<w;x+=step*2)c.fillRect(x,y,Math.max(1,step*.18),Math.max(1,step*.18));c.restore()}
if(s.family==='sunset'||s.family==='type'||s.family==='night')applyGlassFX(c,w,h,phase,p);
}
// Universal composition layer: tile the entire procedural scene, with periodic pulse and drift.
// One copy is a strict pass-through; no change to existing presets or export rendering.
const compositionCanvas=document.createElement('canvas');
function render(c,w,h,phase,s=selected,p=params,flags=autoParams){
 p=animatedParams(p,phase,flags);
 const copies=Math.max(1,Math.round(p.copies||1)),copiesY=Math.max(1,Math.round(p.copiesY||1)),pulse=Math.max(0,p.pulse||0),drift=Math.max(0,p.drift||0);
 if(copies===1&&copiesY===1&&pulse===0&&drift===0){renderBase(c,w,h,phase,s,p);return}
 const source=compositionCanvas;
 const tileW=Math.max(1,Math.ceil(w/copies)),tileH=Math.max(1,Math.ceil(h/copiesY));
 if(source.width!==tileW||source.height!==tileH){source.width=tileW;source.height=tileH}
 const sourceCtx=source.getContext('2d',{alpha:false});
 renderBase(sourceCtx,tileW,tileH,phase,s,{...p,multiply:s.family==='sunset'?1:p.multiply});
 const a=phase*Math.PI*2*Math.max(1,Math.round(p.speed||1));
 const zoom=1+pulse*.28*(.5-.5*Math.cos(a));
 // Continuous left-to-right travel: at drift=1 the image moves one full canvas width per loop.
 // Repeated tiles wrap cleanly at the 30-second boundary without reversing direction.
 // Sunset drift moves back and forth smoothly, returning to its exact starting position.
 // Other families retain their existing scrolling behavior.
 const offset=s.family==='sunset'?drift*w*.24*Math.sin(phase*Math.PI*2):drift*w*(((phase%1)+1)%1);
 c.save();c.fillStyle=s.colors[0];c.fillRect(0,0,w,h);
 c.beginPath();c.rect(0,0,w,h);c.clip();
 for(let row=-1;row<=copiesY;row++)for(let col=-copies-2;col<copies+2;col++){
  const centerX=(col+.5)*w/copies+offset,centerY=(row+.5)*h/copiesY;
  const dw=w/copies*zoom,dh=h/copiesY*zoom;
  c.drawImage(source,centerX-dw/2,centerY-dh/2,dw,dh);
 }
 c.restore();
}
// Install export handler independently of Studio slider setup: a UI setup error must not disable downloads.
document.addEventListener('click',e=>{
 const target=e.target.closest?.('#video');
 if(!target)return;
 e.preventDefault();
 const status=document.querySelector('#export-status');
 if(status)status.textContent='EXPORT CLICK RECEIVED · starting…';
 exportVideo().catch(err=>{
  console.error('VINILE export fatal',err);
  if(status)status.textContent='EXPORT ERROR: '+(err?.message||String(err));
 });
});
window.addEventListener('error',e=>{
 const status=document.querySelector('#export-status');
 if(status&&location.hash==='#studio')status.textContent='STUDIO ERROR: '+e.message;
});
function shell(){app.innerHTML=`<header><a class="brand" href="#">APHIS<span>_</span> <small>PARASITIC PROJECTION ENGINE</small></a><nav><a href="#projects" id="nav-project">PROJECTS</a><a href="#studio" id="nav-studio">STUDIO</a><a href="#mapping">MAPPING</a></nav><span class="meta">ROMA / 2026</span></header><main id="page"></main>`;window.addEventListener('hashchange',route);route()}
const liveKey='aphis-live-v1';
let liveClips={};try{liveClips=JSON.parse(localStorage.getItem(liveKey)||'{}')}catch{}
const liveBus=new BroadcastChannel(liveKey);
liveBus.onmessage=e=>{if(e.data?.id&&e.data.patch)liveClips[e.data.id]=e.data.patch};
let lastLiveSignature='',lastLiveWrite=0;
function publishLive(now){
 const patch={params:{...params},flags:{...autoParams},colors:[...selected.colors],highlight:highlights[selected.family],duration};
 const signature=JSON.stringify([selected.id,patch]);if(signature===lastLiveSignature)return;
 lastLiveSignature=signature;liveClips[selected.id]=patch;liveBus.postMessage({id:selected.id,patch});
 if(now-lastLiveWrite>500){lastLiveWrite=now;try{localStorage.setItem(liveKey,JSON.stringify(liveClips))}catch{}}
}
window.addEventListener('pagehide',()=>{try{localStorage.setItem(liveKey,JSON.stringify(liveClips))}catch{}});
function route(){closeMapping();const output=location.hash==='#output',mapping=location.hash==='#mapping';document.querySelector('header').style.display=output?'none':'';document.body.style.margin=output?'0':'';if(output||mapping){mappingPage(document.querySelector('#page'),scenes,(ctx,w,h,phase,id,linked=true)=>{const s=scenes.find(x=>x.id===id);if(!s)return;const patch=linked?liveClips[id]:null;const old=highlights[s.family];try{if(patch?.highlight)highlights[s.family]=patch.highlight;render(ctx,w,h,phase,patch?{...s,colors:patch.colors}:s,{...defaultParams,...patch?.params},patch?.flags||{});}finally{highlights[s.family]=old}},output);return}let studio=location.hash!=='#project';if(location.hash==='#projects'||location.hash==='#library'){studioPage();return}document.querySelector('#nav-project').classList.toggle('active',!studio);document.querySelector('#nav-studio').classList.toggle('active',studio);studio?studioPage():projectPage()}
function projectPage(){document.querySelector('#page').innerHTML=`<section class="hero"><div class="eyebrow">01 / VISUAL IDENTITY — ART DIRECTION</div><h1>After <em>Hours.</em></h1><div class="herofoot">DANCE UNTIL LATE <span>ANALOG FEELING / DIGITAL BEHAVIOUR</span></div></section><section class="statement"><span class="eyebrow">THE CONCEPT</span><h2>VINILE.<br>A visual collection.</h2><p>Generative 30-second loops for dinner, soul live and disco. Flat colors, bitmap treatments, cinematic symbols and expressive editorial typography. A warm, graphic system that shifts from sunset to night, body, type and fluid abstraction.</p></section><section class="palette"><span class="eyebrow">THE PALETTE / THREE SHARED INKS + THREE ACCENTS</span><div class="swatches">${Object.entries(P).map(([k,v])=>`<div><div class="swatch" style="background:${v}"></div><small>${k.toUpperCase()}<br>${v}</small></div>`).join('')}</div></section><section><div class="eyebrow">VINILE / LIVE STUDIES</div><div class="worlds">${families.map(([id,name,desc],i)=>`<article class="world"><canvas data-scene="${id}" width="900" height="154"></canvas><div class="worldlabel"><strong>0${i+1} / ${name}</strong><span>${desc}</span></div></article>`).join('')}</div></section><section class="statement"><span class="eyebrow">THE METHOD</span><h2>Flat color. <em>Moving matter.</em></h2><p>All scenes are procedural and time-based. Each 30-second animation repeats continuously; a fixed seed and normalized timeline make every frame reproducible. Dither and halftone are adjustable, never a substitute for strong graphic composition.</p><a class="cta" href="#studio">OPEN THE STUDIO →</a></section>`}
let colonyFilter='all',previewQuality=localStorage.getItem('aphis-preview')||'medium';
const vinileFamilies=new Set(['night','body','red','butter']);
let sidebarScroll=0;
function studioPage(){const previousSidebar=document.querySelector('.studio aside');if(previousSidebar)sidebarScroll=previousSidebar.scrollTop;const previousY=window.scrollY;document.querySelector('#page').innerHTML=`<div class="studio"><aside><div class="eyebrow">APHIS / COLONY / ${scenes.length}</div><div id="aphis-archive"></div><div class="colony-switch"><button id="colony-all" class="${colonyFilter==='all'?'active':''}">ALL / COLONY</button><button id="colony-vinile" class="${colonyFilter==='vinile'?'active':''}">001 / VINILE</button></div>${families.filter(([id])=>colonyFilter==='all'||vinileFamilies.has(id)).map(([id,name],i)=>`<div class="family"><h3>0${i+1} / ${name}</h3><label class="highlight-picker">HIGHLIGHT <select data-highlight="${id}" title="Highlight color for ${name}">${Object.entries(id==='butter'?BURRO_PALETTE:P).map(([key,color])=>`<option value="${color}" ${highlights[id].toLowerCase()===color.toLowerCase()?'selected':''}>${key.toUpperCase()}</option>`).join('')}</select></label><div class="scenegrid">${scenes.filter(s=>s.family===id).map(s=>`<button class="scene ${selected.id===s.id?'sel':''}" data-id="${s.id}">${s.isText?'TEXT':String(s.variant+1).padStart(2,'0')}</button>`).join('')}</div></div>`).join('')}</aside><section class="workspace"><div class="toolbar"><span id="scene-name">${selected.name}</span><select id="preview-quality" aria-label="Preview quality">${["low","medium","high"].map(q=>`<option ${q===previewQuality?"selected":""}>${q}</option>`).join("")}</select><span id="loop-info">${duration} SEC / SEAMLESS</span><button id="projector-open" type="button">↗ PROJECTOR OUTPUT</button>${['night','body'].includes(selected.family)?'<button id="hydra-editor-open" type="button">⚡ HYDRA LIVE EDITOR</button>':''}</div><div class="screen"><canvas id="preview" width="${Math.round(resolution.w*Math.min(1,({low:640,medium:1200,high:2304}[previewQuality]||1200)/resolution.w))}" height="${Math.round(resolution.h*Math.min(1,({low:640,medium:1200,high:2304}[previewQuality]||1200)/resolution.w))}"></canvas></div><div class="transport"><button id="play">${playing?'PAUSE':'PLAY'}</button><input id="scrub" type="range" min="0" max="${duration*fps-1}" value="${Math.floor(frame)}"><output id="time">${(frame/fps).toFixed(2)} / ${duration.toFixed(2)}</output></div><div class="settings">${(selected.family==='type'||selected.isText)?`<div class="control"><label for="customText">YOUR TEXT / ${selected.isText?'FAMILY TEXT CLIP':'CABARET SIGN'}</label><input id="customText" type="text" maxlength="80" placeholder="e.g. VINILE" value="${String(params.customText||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}"></div>`:''}<div class="control"><label>SIZE <output id="scale-out">${params.scale.toFixed(2)}</output></label><input id="scale" type="range" min="0.3" max="1.8" step="0.01" value="${params.scale}"></div><div class="control"><label>MOTION CYCLES <output id="speed-out">${params.speed}</output></label><input id="speed" type="range" min="1" max="24" step="1" value="${params.speed}"></div>${selected.family==='sunset'?`<div class="control"><label>FILM GRAIN <output id="sunsetGrain-out">${params.sunsetGrain.toFixed(2)}</output></label><input id="sunsetGrain" type="range" min="0" max="1" step=".01" value="${params.sunsetGrain}"></div><div class="control"><label>GLOW <output id="sunsetGlow-out">${params.sunsetGlow.toFixed(2)}</output></label><input id="sunsetGlow" type="range" min="0" max="1" step=".01" value="${params.sunsetGlow}"></div><div class="control"><label>SOFT BLUR <output id="sunsetBlur-out">${params.sunsetBlur.toFixed(2)}</output></label><input id="sunsetBlur" type="range" min="0" max="1" step=".01" value="${params.sunsetBlur}"></div>`:''}${selected.family==='sunset'?`<div class="control"><label>BLACK LIFT <output id="sunsetBlackLift-out">${params.sunsetBlackLift.toFixed(2)}</output></label><input id="sunsetBlackLift" type="range" min="0" max="1" step=".01" value="${params.sunsetBlackLift}"></div><div class="control"><label>CHROMATIC GRADIENT <output id="sunsetGradient-out">${params.sunsetGradient.toFixed(2)}</output></label><input id="sunsetGradient" type="range" min="0" max="1" step=".01" value="${params.sunsetGradient}"></div><div class="control"><label>HALATION / LIGHT BLEED <output id="sunsetHalation-out">${params.sunsetHalation.toFixed(2)}</output></label><input id="sunsetHalation" type="range" min="0" max="1" step=".01" value="${params.sunsetHalation}"></div><button type="button" id="sunset-hazy">APPLY HAZY SUNSET PRESET</button><button type="button" id="sunset-flat">RESET ANALOG FINISH</button>`:''}${selected.family==='type'?`<div class="control"><label>FILM GRAIN <output id="typeGrain-out">${params.typeGrain.toFixed(2)}</output></label><input id="typeGrain" type="range" min="0" max="1" step=".01" value="${params.typeGrain}"></div><div class="control"><label>GLOW <output id="typeGlow-out">${params.typeGlow.toFixed(2)}</output></label><input id="typeGlow" type="range" min="0" max="1" step=".01" value="${params.typeGlow}"></div><div class="control"><label>SOFT FOCUS <output id="typeBlur-out">${params.typeBlur.toFixed(2)}</output></label><input id="typeBlur" type="range" min="0" max="1" step=".01" value="${params.typeBlur}"></div><div class="control"><label>BLACK LIFT <output id="typeBlackLift-out">${params.typeBlackLift.toFixed(2)}</output></label><input id="typeBlackLift" type="range" min="0" max="1" step=".01" value="${params.typeBlackLift}"></div><div class="control"><label>CHROMATIC GRADIENT <output id="typeGradient-out">${params.typeGradient.toFixed(2)}</output></label><input id="typeGradient" type="range" min="0" max="1" step=".01" value="${params.typeGradient}"></div><div class="control"><label>HALATION / LIGHT BLEED <output id="typeHalation-out">${params.typeHalation.toFixed(2)}</output></label><input id="typeHalation" type="range" min="0" max="1" step=".01" value="${params.typeHalation}"></div><button type="button" id="type-hazy">APPLY VINTAGE TYPE PRESET</button><button type="button" id="type-flat">RESET ANALOG FINISH</button>`:''}${['sunset','type','night'].includes(selected.family)?`<div class="control"><strong>GLASS / OPTICAL FX</strong></div><div class="control"><label>LIQUID REFRACTION <output id="glassRefraction-out">${params.glassRefraction.toFixed(2)}</output></label><input id="glassRefraction" type="range" min="0" max="1" step=".01" value="${params.glassRefraction}"></div><div class="control"><label>SOFT BLOOM <output id="glassBloom-out">${params.glassBloom.toFixed(2)}</output></label><input id="glassBloom" type="range" min="0" max="1" step=".01" value="${params.glassBloom}"></div><div class="control"><label>OPTICAL DEFOCUS <output id="glassSoftness-out">${params.glassSoftness.toFixed(2)}</output></label><input id="glassSoftness" type="range" min="0" max="1" step=".01" value="${params.glassSoftness}"></div><div class="control"><label>CHROMATIC SPLIT <output id="glassChromatic-out">${params.glassChromatic.toFixed(2)}</output></label><input id="glassChromatic" type="range" min="0" max="1" step=".01" value="${params.glassChromatic}"></div><button type="button" id="glass-molten">MOLTEN GLASS PRESET</button><button type="button" id="glass-clear">RESET GLASS FX</button>`:''}${selected.family==='sunset'?`<div class="control"><label>MULTIPLY ELEMENTS <output id="multiply-out">${params.multiply}</output></label><input id="multiply" type="range" min="1" max="5" step="1" value="${params.multiply}"></div>`:''}<div class="control"><label>REPEAT HORIZONTAL <output id="copies-out">${params.copies}</output></label><input id="copies" type="range" min="1" max="8" step="1" value="${params.copies}"></div><div class="control"><label>REPEAT VERTICAL <output id="copiesY-out">${params.copiesY}</output></label><input id="copiesY" type="range" min="1" max="8" step="1" value="${params.copiesY}"></div><div class="control"><label>PULSE <output id="pulse-out">${params.pulse.toFixed(2)}</output></label><input id="pulse" type="range" min="0" max="1" step="0.01" value="${params.pulse}"></div><div class="control"><label>HORIZONTAL SCROLL <output id="drift-out">${params.drift.toFixed(2)}</output></label><input id="drift" type="range" min="0" max="1" step="0.01" value="${params.drift}"></div>${selected.family==='night'?`<div class="control"><strong>HYDRA / LIVE PARAMETERS</strong></div><div class="control"><label>MODULATION <output id="hydraAmount-out">${params.hydraAmount.toFixed(2)}</output></label><input id="hydraAmount" type="range" min="0" max="1" step=".01" value="${params.hydraAmount}"></div><div class="control"><label>FREQUENCY <output id="hydraFrequency-out">${params.hydraFrequency.toFixed(2)}</output></label><input id="hydraFrequency" type="range" min="1" max="30" step=".1" value="${params.hydraFrequency}"></div><div class="control"><label>GLITCH <output id="hydraGlitch-out">${params.hydraGlitch.toFixed(2)}</output></label><input id="hydraGlitch" type="range" min="0" max="1" step=".01" value="${params.hydraGlitch}"></div><div class="control"><label>BEAT REACTIVITY <output id="hydraBeat-out">${params.hydraBeat.toFixed(2)}</output></label><input id="hydraBeat" type="range" min="0" max="1" step=".01" value="${params.hydraBeat}"></div><div class="control"><label>BASE BPM / 30s LOOP <output id="bpm-out">${params.bpm}</output></label><input id="bpm" type="range" min="60" max="180" step="2" value="${params.bpm}"></div><div class="control"><label>CAMERA DEPTH <output id="cameraDepth-out">${params.cameraDepth.toFixed(2)}</output></label><input id="cameraDepth" type="range" min="-3" max="3" step="0.05" value="${params.cameraDepth}"></div><div class="control"><label>ROTATION X <output id="rotationX-out">${params.rotationX.toFixed(2)}</output></label><input id="rotationX" type="range" min="-3.14" max="3.14" step="0.01" value="${params.rotationX}"></div><div class="control"><label>ROTATION Y <output id="rotationY-out">${params.rotationY.toFixed(2)}</output></label><input id="rotationY" type="range" min="-3.14" max="3.14" step="0.01" value="${params.rotationY}"></div><div class="control"><label>PERSPECTIVE <output id="perspective-out">${params.perspective.toFixed(2)}</output></label><input id="perspective" type="range" min="20" max="100" step="1" value="${params.perspective}"></div><div class="control"><label>GEOMETRY DENSITY <output id="geometryDensity-out">${params.geometryDensity}</output></label><input id="geometryDensity" type="range" min="1" max="5" step="1" value="${params.geometryDensity}"></div>`:''}${selected.family==='red'&&selected.variant===1?`<div class="control"><label>PHOTO SOURCE / BLACK & WHITE COLLAGE</label><input id="photo-upload" type="file" accept="image/png,image/jpeg,image/webp,image/avif"><small id="photo-status">${getRedPhoto()?.name||'Upload a photo · JPG / PNG / WebP'}</small></div>`:''}${selected.family==='red'&&selected.variant===2?`<div class="control"><label>PHOTO FOLDER / COLLAGE</label><input id="collage-upload" type="file" accept="image/*" webkitdirectory directory multiple><small id="collage-status">${getCollagePhotos().length?getCollagePhotos().length+' images loaded':'Select a folder of photographs'}</small></div>`:''}${selected.family==='red'&&selected.variant!==1&&selected.variant!==2?`<div class="control"><label>GIF SOURCE</label><input id="gif-upload" type="file" accept=".gif,image/gif"><small id="gif-status">${getRedAsset(selected.id)?.name||'No GIF loaded · local session'}</small></div><div class="control"><label>PIXEL SIZE <output id="pixelSize-out">${params.pixelSize.toFixed(2)}</output></label><input id="pixelSize" type="range" min="2" max="40" step="1" value="${params.pixelSize}"></div><div class="control"><label>THRESHOLD <output id="threshold-out">${params.threshold.toFixed(2)}</output></label><input id="threshold" type="range" min="0" max="1" step=".01" value="${params.threshold}"></div><div class="control"><label>SMEAR <output id="smear-out">${params.smear.toFixed(2)}</output></label><input id="smear" type="range" min="0" max="1" step=".01" value="${params.smear}"></div><div class="control"><label>GLITCH <output id="glitch-out">${params.glitch.toFixed(2)}</output></label><input id="glitch" type="range" min="0" max="1" step=".01" value="${params.glitch}"></div><div class="control"><label>RED ZOOM <output id="redZoom-out">${params.redZoom.toFixed(2)}</output></label><input id="redZoom" type="range" min="1" max="8" step=".05" value="${params.redZoom}"></div>`:''}<div class="control"><label>BITMAP <output id="dither-out">${params.dither.toFixed(2)}</output></label><input id="dither" type="range" min="0" max="1" step="0.01" value="${params.dither}"></div>${selected.family==='optical'?`<div class="control"><label>BLUR <output id="blur-out">${params.blur.toFixed(2)}</output></label><input id="blur" type="range" min="0.005" max="0.35" step="0.005" value="${params.blur}"></div><div class="control"><label>DISTORTION <output id="distort-out">${params.distort.toFixed(2)}</output></label><input id="distort" type="range" min="0" max="2" step="0.01" value="${params.distort}"></div><div class="control"><label>FREQUENCY <output id="frequency-out">${params.frequency.toFixed(2)}</output></label><input id="frequency" type="range" min="0.2" max="4" step="0.01" value="${params.frequency}"></div>`:''}<div class="control"><label>BACKGROUND</label><input id="bg-custom" type="color" value="${selected.colors[0]}"><select id="bg">${Object.entries(selected.family==='butter'?BURRO_PALETTE:P).map(([n,c])=>`<option value="${c}" ${selected.colors[0]===c?'selected':''}>${n.toUpperCase()}</option>`).join('')}</select></div><div class="control"><label>FOREGROUND</label><input id="fg-custom" type="color" value="${selected.colors[1]}"><select id="fg">${Object.entries({...P,highlight:highlights[selected.family]}).map(([n,c])=>`<option value="${c}" ${selected.colors[1]===c?'selected':''}>${n.toUpperCase()}</option>`).join('')}</select></div></div><div class="renderbar"><label>WIDTH <input id="width" type="number" min="320" max="7680" value="${resolution.w}"></label><label>HEIGHT <input id="height" type="number" min="100" max="4320" value="${resolution.h}"></label><label>SECONDS <input id="duration" type="number" min="1" max="180" step="1" value="${duration}"></label><label>FPS <select id="fps"><option value="24" ${fps===24?"selected":""}>24</option><option value="25" ${fps===25?"selected":""}>25</option><option value="30" ${fps===30?"selected":""}>30</option><option value="60" ${fps===60?"selected":""}>60</option></select></label><label>QUALITY <select id="quality"><option value="8" ${quality===8?"selected":""}>STANDARD / 8 Mbps</option><option value="16" ${quality===16?"selected":""}>HIGH / 16 Mbps</option><option value="30" ${quality===30?"selected":""}>MAX / 30 Mbps</option></select></label><button id="still">EXPORT PNG FRAME</button><button id="video">EXPORT VIDEO</button><button id="preset">SAVE PRESET JSON</button><button id="reset-scene" type="button">RESET CLIP</button><button id="reset-all" type="button">RESET ALL</button></div><p class="note" id="export-status" aria-live="polite">Ready to export · VP9 WebM preferred, MP4 fallback.</p><p class="note">Preview and exports use the same deterministic canvas renderer. PNG, JSON and browser video export work now; DXV3 conversion is done in Resolume Alley. Loop phase is normalized to your chosen duration and FPS. Real-time browser recording may drop frames under load.</p></section></div>`;
// AUTO flags beside each parameter; they affect preview and video exports identically.
if(selected.family==='sunset'||selected.family==='type'){
 const setFinish=values=>{Object.assign(params,values);for(const [key,value] of Object.entries(values)){const input=document.getElementById(key),output=document.getElementById(key+'-out');if(input)input.value=value;if(output)output.textContent=value.toFixed(2);autoParams[key]=false}studioPage()};
 document.getElementById('sunset-hazy')?.addEventListener('click',()=>setFinish({sunsetBlackLift:.30,sunsetGradient:.80,sunsetHalation:.65,sunsetGrain:.25,sunsetGlow:.42,sunsetBlur:.18}));
 document.getElementById('sunset-flat')?.addEventListener('click',()=>setFinish({sunsetBlackLift:0,sunsetGradient:0,sunsetHalation:0,sunsetGrain:0,sunsetGlow:0,sunsetBlur:0}));
 document.getElementById('type-hazy')?.addEventListener('click',()=>setFinish({typeBlackLift:.26,typeGradient:.32,typeHalation:.48,typeGrain:.24,typeGlow:.34,typeBlur:.09}));
 document.getElementById('type-flat')?.addEventListener('click',()=>setFinish({typeBlackLift:0,typeGradient:0,typeHalation:0,typeGrain:0,typeGlow:0,typeBlur:0}));
}
if(['sunset','type'].includes(selected.family)){
 const setGlass=values=>{Object.assign(params,values);for(const k of Object.keys(values))autoParams[k]=false;studioPage()};
 document.getElementById('glass-molten')?.addEventListener('click',()=>setGlass({glassRefraction:.42,glassBloom:.62,glassSoftness:.22,glassChromatic:.14}));
 document.getElementById('glass-clear')?.addEventListener('click',()=>setGlass({glassRefraction:0,glassBloom:0,glassSoftness:0,glassChromatic:0}));
}
// Compact controls: show only the parameters relevant to the selected visual family.
const visibleByFamily={
 butter:[],
 night:['customText','hydraAmount','hydraFrequency','hydraGlitch','hydraBeat','bpm','speed','bg','fg'],
 sunset:['customText','scale','speed','multiply','sunsetGrain','sunsetGlow','sunsetBlur','sunsetBlackLift','sunsetGradient','sunsetHalation','glassRefraction','glassBloom','glassSoftness','glassChromatic','bg','fg'],
 type:['customText','scale','speed','typeGrain','typeGlow','typeBlur','typeBlackLift','typeGradient','typeHalation','glassRefraction','glassBloom','glassSoftness','glassChromatic','bg','fg'],
 red:['scale','speed','pixelSize','threshold','smear','glitch','redZoom','bg','fg','photo-upload','collage-upload','gif-upload'],
 optical:['scale','speed','blur','distort','frequency','bg','fg'],
 body:['bg','fg']
};
if(['night','body'].includes(selected.family)){
 const study=redStudyForScene(selected.id);
 if(study?.params){
  const settings=document.querySelector('.settings');
  const section=document.createElement('div');section.className='hydra-study-controls';
  const title=document.createElement('strong');title.textContent='RED PATCH / LIVE FADERS';
  section.append(title);
  for(const [name,initial,min,max] of study.params){
   const label=document.createElement('label'),value=document.createElement('output'),input=document.createElement('input');
   label.textContent=name.toUpperCase();input.type='range';input.min=min;input.max=max;
   input.step=Number(max)-Number(min)>20?'0.1':'0.01';
   const key='patch_'+name;const sceneValues=hydraValuesByScene.get(selected.id)||{};input.value=sceneValues[key]??initial;params[key]=Number(input.value);value.textContent=input.value;
   input.oninput=()=>{params[key]=Number(input.value);value.textContent=input.value;const values=hydraValuesByScene.get(selected.id)||{};values[key]=params[key];hydraValuesByScene.set(selected.id,values)};
   label.append(value,input);section.append(label);
  }
  settings.prepend(section);
 }
}
if(selected.family==='butter'){
 const settings=document.querySelector('.settings');
 for(const el of settings.children)el.hidden=true;
 const section=document.createElement('div');section.className='hydra-study-controls';section.style.background='#302416';
 const title=document.createElement('strong');title.textContent='BURRO / ANALOG MEDIA LAB';section.append(title);
 const id=selected.id;
 const upload=document.createElement('input');upload.type='file';upload.accept='video/mp4,image/gif,video/webm,image/*';
 const status=document.createElement('small');status.textContent=butterAsset(id)?.name||'LOAD MP4 / GIF';
 upload.onchange=async()=>{if(!upload.files[0])return;try{await loadButter(id,upload.files[0]);status.textContent=upload.files[0].name}catch(e){status.textContent=e.message}};
 const media=document.createElement('label');media.textContent='MEDIA SOURCE';media.append(upload,status);section.append(media);
 const textLabel=document.createElement('label');textLabel.textContent='EDITORIAL TITLE';const input=document.createElement('input');input.type='text';input.value=params.butter_title??(selected.variant===1?'Burro':'Il Fuori Orario');params.butter_title=input.value;input.oninput=()=>params.butter_title=input.value;textLabel.append(input);section.append(textLabel);
 const colorLabel=document.createElement('label');colorLabel.textContent='TEXT COLOR';const color=document.createElement('input');color.type='color';color.value=params.butter_textColor||highlights.butter;const inherit=document.createElement('button');inherit.type='button';inherit.textContent='USE FAMILY HIGHLIGHT';inherit.onclick=()=>{delete params.butter_textColor;color.value=highlights.butter};color.oninput=()=>params.butter_textColor=color.value;colorLabel.append(color,inherit);section.append(colorLabel);
 const presetBar=document.createElement('div');presetBar.style.cssText='display:flex;gap:6px;flex-wrap:wrap';
 const presets={'SOFT BUTTER':{soft:.35,blur:.12,glow:.4,burn:.2,grain:.12,liquify:.08},'MELTED BUTTER':{soft:.25,blur:.12,liquify:.65,liquidScale:.35,liquidSpeed:1,meltY:.35,meltX:.12,motionBlur:.35},'BURNT BUTTER':{burn:.85,contrast:.55,warmth:.8,grain:.4,glow:.55,soft:.15}};
 for(const [name,values] of Object.entries(presets)){const btn=document.createElement('button');btn.type='button';btn.textContent=name;btn.onclick=()=>{for(const [k,label,initial] of butterControls){const key='butter_'+k;if(k==='titleSize'||k==='rate')continue;params[key]=values[k]??initial;autoParams[key]=false;const f=section.querySelector('[data-butter-key="'+key+'"]');if(f){f.value=params[key];f.dispatchEvent(new Event('input'));const check=f.parentElement.querySelector('input[type=checkbox]');if(check)check.checked=false}}};presetBar.append(btn)}section.append(presetBar);
 for(const [k,label,initial,min,max] of [...butterControls,['copies','REPEAT X',1,1,8],['copiesY','REPEAT Y',1,1,8]]){
 const l=document.createElement('label'),o=document.createElement('output'),f=document.createElement('input');l.textContent=label;f.type='range';f.min=min;f.max=max;const integer=['pixel','copies','copiesY'].includes(k);f.step=integer?1:.01;const key=k==='copies'||k==='copiesY'?k:'butter_'+k;f.dataset.butterKey=key;f.value=params[key]??initial;o.textContent=f.value;f.oninput=()=>{params[key]=Number(f.value);o.textContent=f.value};const auto=document.createElement('label');auto.className='auto-flag';const check=document.createElement('input');check.type='checkbox';check.checked=!!autoParams[key];check.onchange=()=>autoParams[key]=check.checked;auto.append(check,' AUTO');l.append(o,f,auto);section.append(l)}
 settings.prepend(section);
}
const essential=new Set([...(visibleByFamily[selected.family]||['scale','speed','bg','fg']),...(selected.family==='night'?[]:['copies','copiesY','pulse','drift','dither'])]);
document.querySelectorAll('.settings > .control').forEach(control=>{
 const ids=[...control.querySelectorAll('input[id],select[id]')].map(el=>el.id);
 if(ids.length && !ids.some(id=>essential.has(id)))control.hidden=true;
});
document.getElementById('projector-open')?.addEventListener('click',openProjector);
document.getElementById('hydra-editor-open')?.addEventListener('click',()=>openHydraEditor({scene:selected,params,preview:cv=>{const phase=frame/(duration*fps);render(cv.getContext('2d'),cv.width,cv.height,phase,selected,animatedParams(params,phase))}}));
document.querySelectorAll('.settings input[type="range"]').forEach(input=>{
 const key=input.id;if(!autoRanges[key])return;
 const control=input.closest('.control'),label=control?.querySelector('label');
 if(!label)return;
 const flag=document.createElement('label');
 flag.className='auto-flag';flag.title='Animate this parameter over the complete loop';
 const check=document.createElement('input');check.type='checkbox';check.checked=!!autoParams[key];
 check.onchange=()=>{autoParams[key]=check.checked;flag.classList.toggle('active',check.checked)};flag.classList.toggle('active',check.checked);
 flag.append(check,document.createTextNode(' AUTO'));
 control.insertBefore(flag,input);
});
const newSidebar=document.querySelector('.studio aside');newSidebar.scrollTop=sidebarScroll;window.scrollTo(0,previousY);mountArchive();document.querySelector('#colony-all').onclick=()=>{colonyFilter='all';studioPage()};document.querySelector('#colony-vinile').onclick=()=>{colonyFilter='vinile';if(!vinileFamilies.has(selected.family)){selected=scenes.find(s=>vinileFamilies.has(s.family));params={...defaultParams};autoParams={};frame=0;}studioPage()};document.querySelector('#preview-quality').onchange=e=>{previewQuality=e.target.value;localStorage.setItem('aphis-preview',previewQuality);studioPage()};
document.querySelectorAll('[data-highlight]').forEach(input=>input.onchange=e=>{const family=e.target.dataset.highlight;const old=highlights[family];const next=e.target.value;highlights[family]=next;if(family==='butter'&&selected.family==='butter'){delete params.butter_textColor;const color=document.querySelector('.hydra-study-controls input[type=color]');if(color)color.value=next;}for(const scene of scenes.filter(s=>s.family===family)){if(scene.colors[1].toLowerCase()===old.toLowerCase())scene.colors[1]=next}if(selected.family===family){const fg=document.querySelector('#fg');if(fg){let opt=Array.from(fg.options).find(o=>o.value.toLowerCase()===next.toLowerCase());if(!opt){opt=new Option('HIGHLIGHT',next);fg.add(opt)}fg.value=selected.colors[1]}}});if(selected.family==='red'&&selected.variant===1){document.querySelector('#photo-upload').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const status=document.querySelector('#photo-status');status.textContent='Loading photo…';try{const asset=await loadRedPhoto(file);status.textContent=asset.name+' · animated B&W collage';frame=0}catch(err){status.textContent='Photo error: '+err.message}};}if(selected.family==='red'&&selected.variant===2){document.querySelector('#collage-upload').onchange=async e=>{const files=e.target.files;if(!files?.length)return;const status=document.querySelector('#collage-status');status.textContent='Processing photographs…';try{const count=await loadCollagePhotos(files);status.textContent=count+' photos ready · 3-second loop';frame=0}catch(err){status.textContent='Collage error: '+err.message}};}if(selected.family==='red'&&!selected.isText&&selected.variant!==1&&selected.variant!==2){document.querySelector('#gif-upload').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;const status=document.querySelector('#gif-status');status.textContent='Decoding GIF…';try{const asset=await loadRedGif(file,selected.id);status.textContent=asset.name+' · '+asset.frames.length+' frames';frame=0}catch(err){status.textContent='GIF error: '+err.message}};}document.getElementById('customText')?.addEventListener('input',e=>{params.customText=e.target.value;if(selected.isText)textByScene[selected.id]=e.target.value});document.querySelectorAll('.scene').forEach(b=>b.onclick=()=>{selected=scenes.find(s=>s.id===b.dataset.id);params.customText=selected.isText?(textByScene[selected.id]||'VINILE'):'';studioPage()});document.querySelector('#play').onclick=()=>{playing=!playing;document.querySelector('#play').textContent=playing?'PAUSE':'PLAY'};document.querySelector('#scrub').oninput=e=>{frame=+e.target.value;playing=false;document.querySelector('#play').textContent='PLAY';updateTime()};for(let k of ['scale','speed','dither','copies','copiesY',...(selected.family==='red'?['pixelSize','threshold','smear','glitch','redZoom']:[]),'pulse','drift',...(selected.family==='sunset'?['multiply','sunsetGrain','sunsetGlow','sunsetBlur','sunsetBlackLift','sunsetGradient','sunsetHalation']:[]),...(selected.family==='type'?['typeGrain','typeGlow','typeBlur','typeBlackLift','typeGradient','typeHalation']:[]),...(['sunset','type','night'].includes(selected.family)?['glassRefraction','glassBloom','glassSoftness','glassChromatic']:[]),...(selected.family==='optical'?['blur','distort','frequency']:[]),...(selected.family==='night'?['hydraAmount','hydraFrequency','hydraGlitch','hydraBeat','bpm','cameraDepth','rotationX','rotationY','perspective','geometryDensity']:[])]){const input=document.getElementById(k);if(!input){console.warn('VINILE: missing optional slider',k,'in',selected.id);continue}input.oninput=e=>{params[k]=+e.target.value;const output=document.getElementById(k+'-out');if(output)output.textContent=params[k].toFixed((k==='bpm'||k==='speed'||k==='multiply'||k==='copies'||k==='copiesY'||k==='geometryDensity')?0:2)}};for(let [id,i] of [['bg',0],['fg',1]]){const picker=document.querySelector('#'+id+'-custom'),select=document.querySelector('#'+id);select.onchange=e=>{selected.colors[i]=e.target.value;picker.value=e.target.value};picker.oninput=e=>{selected.colors[i]=e.target.value;let option=Array.from(select.options).find(o=>o.value.toLowerCase()===e.target.value.toLowerCase());if(!option){option=Array.from(select.options).find(o=>o.dataset.custom==='true');if(!option){option=new Option('CUSTOM',e.target.value);option.dataset.custom='true';select.add(option)}option.value=e.target.value}select.value=e.target.value}};for(let [id,key] of [['width','w'],['height','h']])document.querySelector('#'+id).oninput=e=>{resolution[key]=clamp(+e.target.value||resolution[key],100,7680);const preview=document.querySelector('#preview');const factor=Math.min(1,({low:640,medium:1200,high:2304}[previewQuality]||1200)/resolution.w);preview.width=Math.max(1,Math.round(resolution.w*factor));preview.height=Math.max(1,Math.round(resolution.h*factor));preview.style.aspectRatio=resolution.w+' / '+resolution.h};document.querySelector('#still').onclick=()=>{const cv=document.createElement('canvas');cv.width=resolution.w;cv.height=resolution.h;render(cv.getContext('2d'),cv.width,cv.height,frame/(duration*fps));cv.toBlob(blob=>{let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=selected.id+'-'+frame+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)})};document.querySelector('#duration').onchange=e=>{duration=clamp(Math.round(+e.target.value||30),1,180);e.target.value=duration;frame=0;document.querySelector('#scrub').max=duration*fps-1;document.querySelector('#loop-info').textContent=duration+' SEC / SEAMLESS';updateTime()};document.querySelector('#fps').onchange=e=>{fps=+e.target.value;frame=0;document.querySelector('#scrub').max=duration*fps-1;updateTime()};document.querySelector('#quality').onchange=e=>{quality=+e.target.value};document.querySelector('#reset-scene').onclick=()=>{selected.colors=[...originalSceneColors.get(selected.id)];params={...defaultParams};autoParams={};frame=0;studioPage()};document.querySelector('#reset-all').onclick=()=>{for(const family of Object.keys(highlights))highlights[family]=defaultHighlights[family];for(const scene of scenes)scene.colors=[...originalSceneColors.get(scene.id)];clearRedAssets();clearRedPhoto();clearCollagePhotos();params={...defaultParams};if(selected.isText){textByScene[selected.id]='VINILE';params.customText='VINILE'}autoParams={};resolution={...defaultResolution};duration=30;fps=30;quality=16;frame=0;studioPage()};document.querySelector('#preset').onclick=()=>{let blob=new Blob([JSON.stringify({scene:selected,params,autoParams,resolution,duration,fps,textByScene},null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=selected.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}}
async function exportVideo(){
 const button=document.querySelector('#video'),status=document.querySelector('#export-status');
 if(!button||!status)throw Error('Export UI missing');
 status.textContent='EXPORT STARTED · checking browser support…';
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video export needs Chrome or Edge with canvas recording support.';return}
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4;codecs=avc1.42E01E','video/mp4'].find(x=>MediaRecorder.isTypeSupported(x));
 if(!mime){status.textContent='No supported video codec found.';return}
 status.textContent='Browser recorder available · preparing canvas…';
 const snapshot={scene:{...selected,colors:[...selected.colors]},params:{...params},autoParams:{...autoParams},width:resolution.w,height:resolution.h,duration,fps,quality};
 const cv=document.createElement('canvas');cv.width=snapshot.width;cv.height=snapshot.height;
 const ctx=cv.getContext('2d',{alpha:false});
 if(!ctx){status.textContent='Cannot create export canvas';return}
 let stream=null,recorder=null,chunks=[],wasPlaying=playing;
 button.disabled=true;button.textContent='RENDERING…';playing=false;exporting=true;status.textContent='Rendering first frame…';
 try{
  // Draw before recording: some browsers reject a zero-frame canvas stream.
  render(ctx,snapshot.width,snapshot.height,0,snapshot.scene,snapshot.params,snapshot.autoParams);
  status.textContent='First frame ready · opening video stream…';
  stream=cv.captureStream(0);
  let track=stream.getVideoTracks()[0];
  // Chrome may omit requestFrame on some GPU configurations. Fall back to a timed stream.
  const manual=!!track&&typeof track.requestFrame==='function';
  if(!manual){stream.getTracks().forEach(t=>t.stop());stream=cv.captureStream(snapshot.fps);track=stream.getVideoTracks()[0]}
  if(!track)throw Error('No video track available from canvas');
  recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:snapshot.quality*1000000});
  const completed=new Promise((resolve,reject)=>{
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   recorder.onerror=e=>reject(e.error||new Error('Encoder error'));
   recorder.onstop=resolve;
  });
  recorder.start(500);
  const total=snapshot.duration*snapshot.fps,delay=1000/snapshot.fps;
  let next=performance.now();
  for(let i=0;i<total;i++){
   if(recorder.state!=='recording')throw Error('Recorder stopped unexpectedly');
   render(ctx,snapshot.width,snapshot.height,i/total,snapshot.scene,snapshot.params,snapshot.autoParams);
   if(manual)track.requestFrame();
   // Yield to the encoder even if rendering takes longer than a frame interval.
   if(i%10===0)status.textContent='Encoding '+(i+1)+' / '+total+' frames ('+Math.round((i+1)/total*100)+'%)';
   next+=delay;
   await new Promise(resolve=>setTimeout(resolve,Math.max(1,next-performance.now())));
  }
  recorder.stop();await completed;
  const blob=new Blob(chunks,{type:mime});
  if(!blob.size)throw Error('Encoder returned an empty file');
  const ext=mime.startsWith('video/mp4')?'mp4':'webm';
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=snapshot.scene.id+'-'+snapshot.duration+'s-'+snapshot.fps+'fps-'+snapshot.width+'x'+snapshot.height+'.'+ext;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  status.textContent='Export complete: '+(blob.size/1048576).toFixed(1)+' MB · '+ext.toUpperCase()+'. Check playback before Resolume.';
 }catch(err){
  if(recorder?.state==='recording'){try{recorder.stop()}catch(_){}}
  console.error('VINILE video export failed',err);
  status.textContent='Export failed: '+(err?.message||String(err));
 }finally{
  stream?.getTracks().forEach(t=>t.stop());
  exporting=false;playing=wasPlaying;button.disabled=false;button.textContent='EXPORT VIDEO';
 }
}
function updateTime(){
 const effective=animatedParams(params,frame/(duration*fps));
 for(const [key,on] of Object.entries(autoParams)){
  if(!on)continue;
  const output=document.getElementById(key+'-out');
  if(output&&Number.isFinite(effective[key]))output.textContent=effective[key].toFixed(discreteParams.has(key)?0:2)+' ↻';
 }
 let o=document.querySelector('#time');if(o)o.textContent=(frame/fps).toFixed(2)+' / '+duration.toFixed(2);let s=document.querySelector('#scrub');if(s)s.value=frame}
let lastPreview=0;
function tick(now){
 requestAnimationFrame(tick);
 if(exporting){last=now;return}
 const preview=document.querySelector('#preview');
 const cards=preview?[]:document.querySelectorAll('canvas[data-scene]');
 if(!preview&&!cards.length){last=now;return}
 if(now-lastPreview<1000/(preview?30:12))return;
 lastPreview=now;
 const delta=last?Math.min(now-last,100):0;last=now;
 if(playing){frame=(frame+delta*fps/1000)%(duration*fps);if(preview)updateTime()}
 const phase=frame/(duration*fps);
 if(preview){
  publishLive(now);
  render(preview.getContext('2d'),preview.width,preview.height,phase);
  if(projectorWindow&&!projectorWindow.closed)projectorCanvas.getContext('2d').drawImage(preview,0,0,projectorCanvas.width,projectorCanvas.height);
 }else for(const cv of cards){
  const rect=cv.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)continue;
  const scene=scenes.find(s=>s.family===cv.dataset.scene);if(scene)render(cv.getContext('2d'),cv.width,cv.height,phase,scene,{...defaultParams},{});
 }
}


let archiveScope='',archiveCollection='',archiveCache=null;
async function archiveRequest(payload){const response=await fetch('./api/aphis',payload?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:undefined);const data=await response.json();if(!response.ok)throw Error(data.error||'Archive unavailable');archiveCache=data;return data}
async function mountArchive(){const host=document.querySelector('#aphis-archive');if(!host)return;if(!archiveCache)host.textContent='ARCHIVE / LOADING';try{const data=archiveCache||await archiveRequest();if(!host.isConnected)return;host.replaceChildren();
const button=(name,fn)=>{const b=document.createElement('button');b.textContent=name;b.onclick=async()=>{try{await fn()}catch(e){alert(e.message)}};host.append(b);return b};
const select=(items,value,fn)=>{const el=document.createElement('select');for(const [v,label] of items)el.add(new Option(label,v));el.value=value;el.onchange=()=>fn(el.value);host.append(el);return el};
select([['','LIBRARY'],...data.projects.map(p=>[p.name,p.name])],archiveScope,v=>{archiveScope=v;archiveCollection='';mountArchive()});
button('+ PROJECT',async()=>{const name=prompt('Project name');if(!name)return;await archiveRequest({action:'project',name});archiveScope=name;archiveCollection='';mountArchive()});
const collections=archiveScope?data.projects.find(p=>p.name===archiveScope)?.collections||[]:data.library;
if(!collections.some(c=>c.name===archiveCollection))archiveCollection=collections[0]?.name||'';
select([['','SELECT COLLECTION'],...collections.map(c=>[c.name,c.name])],archiveCollection,v=>{archiveCollection=v;mountArchive()});
button('+ COLLECTION',async()=>{const name=prompt('Collection name');if(!name)return;await archiveRequest({action:'collection',project:archiveScope,name});archiveCollection=name;mountArchive()});
button('+ CLIP / SAVE CURRENT',async()=>{if(!archiveCollection)throw Error('Create or select a collection first');const name=prompt('Clip name',selected.name);if(!name)return;const patch={sceneId:selected.id,params:{...params},autoParams:{...autoParams},colors:[...selected.colors],resolution:{...resolution},duration,fps,quality};await archiveRequest({action:'clip',project:archiveScope,collection:archiveCollection,name,patch});mountArchive()});
for(const clip of collections.find(c=>c.name===archiveCollection)?.clips||[])button('↳ '+clip.name,()=>{const s=scenes.find(s=>s.id===clip.sceneId);if(!s)throw Error('Source algorithm missing');selected=s;selected.colors=[...clip.colors];params={...defaultParams,...clip.params};autoParams={...clip.autoParams};resolution={...clip.resolution};duration=clip.duration;fps=clip.fps;quality=clip.quality;frame=0;studioPage()});
const aside=host.closest('aside');if(aside)aside.scrollTop=sidebarScroll;
}catch(e){host.textContent='ARCHIVE / LOCAL SERVER REQUIRED'}}

shell();requestAnimationFrame(tick);
