import {getHydraPatch,setHydraPatch,getHydraError} from './hydra-disco.js';
const DEFAULT=`// VINILE / HYDRA LIVE
// Ctrl+Enter to run. Only paste code you trust.
osc(param('frequency',12,1,40),0.05,0.8)
  .kaleid(5)
  .modulate(noise(3,0.1),param('distortion',0.2,0,1))
  .out(o0);`;
export function openHydraEditor({scene,params,preview}){
 const id=scene.id,overlay=document.createElement('div');
 overlay.className='hydra-overlay';
 overlay.innerHTML=`<div class="hydra-panel" role="dialog" aria-modal="true" aria-label="Hydra live editor">
 <div class="hydra-editor-top"><strong>⚡ HYDRA / LIVE CODE — <span id="hydra-scene-title"></span></strong><button data-action="close">CLOSE ×</button></div>
 <div class="hydra-editor-layout">
 <section class="hydra-code-column"><textarea class="hydra-code" spellcheck="false" aria-label="Hydra JavaScript"></textarea>
 <div class="hydra-editor-actions"><button data-action="run">▶ RUN / CTRL+ENTER</button><button data-action="save">SAVE PATCH</button><button data-action="download">DOWNLOAD .JS</button><button data-action="revert">REVERT</button></div>
 <div class="hydra-patch-params"></div><p class="hydra-status" aria-live="polite">Ready to run</p><p class="hydra-help">Only paste JavaScript you trust. Patches run with this page's browser permissions. Saved locally in this browser.</p></section>
 <section class="hydra-preview-column"><strong>LIVE / VINILE PREVIEW</strong><canvas width="1152" height="256"></canvas><p class="hydra-render-error"></p></section></div></div>`;
 const q=s=>overlay.querySelector(s),editor=q('textarea');
 q('#hydra-scene-title').textContent=scene.name;
 editor.value=getHydraPatch(id)||DEFAULT;
 const status=q('.hydra-status'),sliders=q('.hydra-patch-params');
 function controls(){
  sliders.replaceChildren();
  const re=/param\(\s*['"]([\w-]+)['"]\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/g;
  let match;const found=new Set();
  while((match=re.exec(editor.value))){
   const [,name,initial,min,max]=match;if(found.has(name))continue;found.add(name);
   const label=document.createElement('label'),output=document.createElement('output'),input=document.createElement('input');
   label.textContent=name.toUpperCase()+' ';input.type='range';input.min=min;input.max=max;input.step=Number(max)-Number(min)>10?'0.1':'0.01';
   input.value=params['patch_'+name]??initial;output.textContent=input.value;
   input.oninput=()=>{params['patch_'+name]=Number(input.value);output.textContent=input.value};
   params['patch_'+name]=Number(input.value);label.append(output,input);sliders.append(label);
  }
 }
 function run(){
  try{setHydraPatch(id,editor.value);controls();status.textContent='PATCH APPLIED — LIVE';status.style.color='#EE69A7'}
  catch(e){status.textContent='ERROR: '+e.message;status.style.color='#ff7777'}
 }
 function save(){
  run();
  try{const all=JSON.parse(localStorage.getItem('vinile-hydra-patches-v1')||'{}');all[id]=editor.value;localStorage.setItem('vinile-hydra-patches-v1',JSON.stringify(all));status.textContent='SAVED LOCALLY — '+id}
  catch(e){status.textContent='SAVE ERROR: '+e.message}
 }
 function download(){
  const blob=new Blob([editor.value],{type:'text/javascript;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=id+'-hydra.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='SCRIPT DOWNLOADED — '+id;
 }
 function revert(){
  setHydraPatch(id,'');editor.value=DEFAULT;sliders.replaceChildren();
  try{const all=JSON.parse(localStorage.getItem('vinile-hydra-patches-v1')||'{}');delete all[id];localStorage.setItem('vinile-hydra-patches-v1',JSON.stringify(all))}catch{}
  status.textContent='ORIGINAL VINILE PATCH RESTORED';
 }
 q('[data-action="run"]').onclick=run;q('[data-action="save"]').onclick=save;q('[data-action="download"]').onclick=download;q('[data-action="revert"]').onclick=revert;
 function close(){overlay.remove()}
 q('[data-action="close"]').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
 editor.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}};
 document.body.append(overlay);controls();
 const cv=q('canvas'),err=q('.hydra-render-error');
 let count=0;
 function tick(){if(!overlay.isConnected)return;if(count++%2===0){try{preview(cv);err.textContent=getHydraError()}catch(e){err.textContent=e.message}}requestAnimationFrame(tick)}
 tick();
}
