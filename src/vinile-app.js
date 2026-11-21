import './vinile.css';

const COLORS=['#0A0809','#F5EFE5','#FF481C','#E60023','#EE69A7','#A3A0A0'];
const FAMILY=[
 {id:'sunset',name:'SUNSET STUDIES',base:'#FF481C',desc:'Horizons, eclipses, discs and shifting daylight.'},
 {id:'night',name:'NIGHT SHIFT',base:'#0A0809',desc:'Orbits, stars, records and nocturnal geometry.'},
 {id:'body',name:'BODY FRAGMENTS',base:'#E60023',desc:'Silhouettes, eyes, hands and halftone gestures.'},
 {id:'type',name:'AFTER HOURS',base:'#EE69A7',desc:'Kinetic typography: bold, playful, oversized.'},
 {id:'liquid',name:'LIQUID SIGNAL',base:'#A3A0A0',desc:'Flat fluid fields, ripples, waves and interference.'}
];
const TITLES=[
 ['SOLAR DISC','DOUBLE SUN','ECLIPSE','HORIZON CUT','RISING SUN','SUNDIAL','RED SKY','LAST LIGHT','HEAT HAZE','SUNSET STRIP'],
 ['VINYL ORBIT','STARMAP','MOON PHASE','NIGHT GRID','SATELLITE','SPIN CYCLE','BLACK HOLE','COMET TRAIL','CONSTELLATION','MIDNIGHT'],
 ['THE EYE','TWO HANDS','LIPS','PROFILE','HEARTBEAT','BODY TYPE','SHADOW PLAY','FINGERPRINT','BLINK','CUTOUT'],
 ['AFTER HOURS','DANCE UNTIL LATE','VINILE','ALL NIGHT','MOVE','STAY LATE','ONE MORE','NO SLEEP','TONIGHT','REPEAT'],
 ['WAVE FIELD','MORPH','RIPPLE','TIDAL','DRIFT','MELT','LIQUID TYPE','INTERFERENCE','FLOW','CURRENT']
];
const SCENES=FAMILY.flatMap((f,fi)=>TITLES[fi].map((name,i)=>({
 id:f.id+'-'+String(i+1).padStart(2,'0'),family:fi,variant:i,name,
 seed:fi*100+i*17+7,background:[COLORS[2],COLORS[0],COLORS[3],COLORS[4],COLORS[5]][fi],
 foreground:[COLORS[1],COLORS[1],COLORS[0],COLORS[0],COLORS[2]][fi],
 accent:COLORS[(i+fi+2)%COLORS.length],speed:1,scale:1,density:.5
})));
const TAU=Math.PI*2;
const state={index:0,playing:true,frame:0,fps:30,duration:30,width:3000,height:512,energy:1,custom:{},tab:'studio'};
const $=s=>document.querySelector(s);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const sin=(t,n=1,o=0)=>Math.sin(TAU*(t*n+o));
const cos=(t,n=1,o=0)=>Math.cos(TAU*(t*n+o));
function scene(){return {...SCENES[state.index],...state.custom[SCENES[state.index].id]};}
function paint(ctx,w,h,t,s){
 const {background:bg,foreground:fg,accent:ac,variant:v,family:f}=s;
 const u=t*s.speed*state.energy; // all frequency changes remain periodic for default integer speed
 const x=w*.5,y=h*.5,unit=h*s.scale;
 ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.save();
 const disk=(cx,cy,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(cx,cy,Math.max(0,r),0,TAU);ctx.fill()};
 const rect=(a,b,c,d,color)=>{ctx.fillStyle=color;ctx.fillRect(a,b,c,d)};
 const line=(a,b,c,d,color,th=2)=>{ctx.strokeStyle=color;ctx.lineWidth=th;ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.stroke()};
 const txt=(word,px,py,size,color,italic=false)=>{ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(italic?'italic ':'')+'900 '+size+'px Helvetica Neue,Arial,sans-serif';ctx.fillText(word,px,py)};
 const ring=(cx,cy,r,c,th)=>{ctx.strokeStyle=c;ctx.lineWidth=th;ctx.beginPath();ctx.arc(cx,cy,Math.max(1,r),0,TAU);ctx.stroke()};
 const stripe=(yy,count,th,color)=>{for(let j=0;j<count;j++)rect(0,yy+j*th*2,w,th,color)};
 const wave=(offset,amp,color,cycles=3)=>{ctx.beginPath();ctx.moveTo(0,h);for(let xx=0;xx<=w;xx+=8){let yy=y+offset+amp*Math.sin(TAU*(xx/w*cycles+u));ctx.lineTo(xx,yy)}ctx.lineTo(w,h);ctx.closePath();ctx.fillStyle=color;ctx.fill()};
 if(f===0){
  const r=unit*(.3+(v%4)*.12),cx=x+sin(u,1,v*.13)*w*.1,cy=y+cos(u,1,v*.11)*h*.18;
  if(v===0){disk(cx,cy,r,fg);rect(0,h*.69,w,h*.31,bg)}
  if(v===1){disk(x-w*.17+sin(u)*w*.06,y,r*.85,fg);disk(x+w*.17-sin(u)*w*.06,y,r*.85,ac)}
  if(v===2){disk(cx,cy,r,fg);disk(cx+sin(u)*r*.7,cy,r*.91,bg)}
  if(v===3){disk(x,y,r*1.3,fg);for(let j=0;j<9;j++)rect(0,h*.5+j*h*.058,w,h*.022,bg)}
  if(v===4){disk(x,y+cos(u)*h*.45,r,fg);rect(0,h*.65,w,h*.35,ac)}
  if(v===5){for(let j=0;j<15;j++){let a=j*TAU/15+TAU*u;line(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,x+Math.cos(a)*r*1.45,y+Math.sin(a)*r*1.45,fg,h*.018)}disk(x,y,r*.42,ac)}
  if(v===6){rect(0,h*.62,w,h*.38,ac);disk(cx,cy,r,fg);rect(0,h*.62,w,h*.38,ac)}
  if(v===7){for(let j=0;j<7;j++){let rr=r*(1.8-j*.2);disk(x+sin(u+j*.09)*h*.18,y,rr,j%2?bg:fg)}}
  if(v===8){disk(x,y,r,fg);for(let j=0;j<28;j++){let yy=j*h/28;line(0,yy,w,yy+sin(u+j*.07)*h*.03,bg,2+j%3)}}
  if(v===9){for(let j=0;j<9;j++){let xx=j*w/9;disk(xx+sin(u+j*.11)*w*.05,y+cos(u+j*.08)*h*.22,r*.46,j%2?fg:ac)}}
 }
 if(f===1){
  if(v===0){for(let j=1;j<8;j++)ring(x,y,unit*j*.12+sin(u+j*.1)*unit*.025,fg,unit*.018);disk(x,y,unit*.07,ac)}
  if(v===1){for(let j=0;j<95;j++){let xx=((j*7919)%997)/997*w,yy=((j*1733)%991)/991*h;disk(xx,yy,(j%4+1)*1.8*(1+sin(u,j%3+1,j*.13)*.2),j%7?fg:ac)}}
  if(v===2){for(let j=0;j<7;j++){disk(x+(j-3)*unit*.42,y,unit*.18,fg);disk(x+(j-3)*unit*.42+unit*(j-3)*.04+sin(u)*unit*.11,y,unit*.18,bg)}}
  if(v===3){for(let j=0;j<30;j++)line(j*w/30,0,j*w/30,h,fg,1);for(let j=0;j<8;j++)line(0,j*h/8,w,j*h/8,fg,1);disk(x+sin(u)*w*.3,y+cos(u)*h*.3,unit*.1,ac)}
  if(v===4){ring(x,y,unit*.48,fg,unit*.009);disk(x+cos(u)*unit*.48,y+sin(u)*unit*.48,unit*.12,ac);disk(x,y,unit*.2,fg)}
  if(v===5){for(let j=0;j<12;j++)ring(x,y,unit*(.13+j*.08),j%3?fg:ac,unit*.01);line(x,y,x+cos(u)*unit*1.1,y+sin(u)*unit*1.1,ac,unit*.03)}
  if(v===6){for(let j=0;j<8;j++)ring(x,y,unit*(.12+j*.09)+sin(u)*unit*.025,fg,unit*.017);disk(x,y,unit*.25,bg)}
  if(v===7){for(let j=0;j<18;j++){let xx=(j/18*w+u*w)%w;disk(xx,(j*73%100)/100*h,unit*(.018+j%3*.01),ac)}}
  if(v===8){for(let j=0;j<25;j++){let a=j*2.399+TAU*u;let r=unit*.06*Math.sqrt(j)*3;disk(x+Math.cos(a)*r,y+Math.sin(a)*r,unit*.025,fg)}}
  if(v===9){txt('00:00',x,y,unit*.85,fg);rect(0,h*.82,w,h*.03,ac);rect(0,h*.82,w*(.5+.5*sin(u)),h*.03,fg)}
 }
 if(f===2){
  if(v===0){disk(x,y,unit*.55,fg);disk(x,y,unit*.34,bg);disk(x+sin(u)*unit*.12,y,unit*.19,ac)}
  if(v===1){for(let j=0;j<2;j++){ctx.save();ctx.translate(x+(j-.5)*unit*.65,y);ctx.rotate(sin(u,1,j*.5)*.4);rect(-unit*.1,-unit*.4,unit*.2,unit*.8,fg);for(let k=0;k<4;k++)rect((k-1.5)*unit*.07,-unit*.6,unit*.055,unit*.3,fg);ctx.restore()}}
  if(v===2){ctx.beginPath();ctx.ellipse(x,y-unit*.12,unit*.7,unit*.22+unit*.08*sin(u),0,0,TAU);ctx.fillStyle=fg;ctx.fill();ctx.beginPath();ctx.ellipse(x,y+unit*.12,unit*.7,unit*.22-unit*.08*sin(u),0,0,TAU);ctx.fill()}
  if(v===3){disk(x,y,unit*.7,fg);rect(x,y-unit,w*.5,unit*2,bg);disk(x+unit*.17,y-unit*.04,unit*.13,ac)}
  if(v===4){for(let j=0;j<45;j++){let xx=j*w/44;let beat=Math.pow(Math.abs(sin(u,1)),8);let hh=unit*(.03+beat*(j%6===0?.5:.12));rect(xx,y-hh/2,w/75,hh,fg)}}
  if(v===5){txt('BODY',x,y,unit*.88,fg);rect(x-unit*.7,y-unit*.07,unit*1.4,unit*.14,ac)}
  if(v===6){for(let j=0;j<11;j++){let a=j*TAU/11+TAU*u;rect(x+Math.cos(a)*unit*.6-unit*.1,y+Math.sin(a)*unit*.3-unit*.2,unit*.2,unit*.4,j%2?fg:ac)}}
  if(v===7){for(let j=0;j<27;j++)ring(x,y,unit*(.1+j*.018),j%3?fg:ac,unit*.007);rect(x+sin(u)*unit*.25,y-unit*.6,unit*.05,unit*1.2,bg)}
  if(v===8){disk(x,y,unit*.55,fg);rect(x-unit*.65,y-unit*(.08+.48*(.5+.5*sin(u))),unit*1.3,unit*.8,bg)}
  if(v===9){for(let j=0;j<18;j++){let xx=x+(j-9)*unit*.15;rect(xx,y-unit*.3+sin(u,1,j*.07)*unit*.1,unit*.1,unit*.6,fg)}}
 }
 if(f===3){
  const word=s.name.toUpperCase();const size=word.length>13?unit*.58:word.length>8?unit*.75:unit*1.1;
  if(v===0)txt('AFTER HOURS',x+sin(u)*unit*.25,y,size,fg);
  if(v===1){txt('DANCE',x,y-unit*.22,unit*.76,fg);txt('UNTIL LATE',x,y+unit*.26,unit*.68,ac)}
  if(v===2){ctx.save();ctx.translate(x,y);ctx.rotate(sin(u)*.065);txt(word,0,0,unit*1.25,fg);ctx.restore()}
  if(v===3){for(let j=0;j<3;j++)txt(word,x+sin(u+j*.33)*unit*.12,y+(j-1)*unit*.38,unit*.48,j===1?fg:ac)}
  if(v===4){for(let j=0;j<5;j++)txt(word,x+(j-2)*unit*.75,y+sin(u+j*.1)*unit*.2,unit*.6,j%2?fg:ac)}
  if(v===5){txt(word,x,y,size,fg);rect(x-unit*1.6,y+sin(u)*unit*.35,unit*3.2,unit*.035,ac)}
  if(v===6){txt(word,x,y,size,fg);disk(x+cos(u)*unit*.95,y+sin(u)*unit*.42,unit*.13,ac)}
  if(v===7){txt(word,x,y,size,fg);for(let j=0;j<9;j++)rect(x-unit*1.5+j*unit*.35,y+unit*.45,unit*.19,unit*.06,ac)}
  if(v===8){txt(word,x,y,size,fg);rect(0,h*.08,w,h*.04,ac);rect(0,h*.88,w,h*.04,ac)}
  if(v===9){for(let j=0;j<3;j++)txt(word,x,y+(j-1)*unit*.43,unit*.65,j===1?fg:ac)}
 }
 if(f===4){
  if(v===0){for(let j=0;j<6;j++)wave((j-3)*unit*.14,unit*.1, j%2?fg:ac,2+j%3)}
  if(v===1){for(let j=0;j<7;j++){let xx=x+(j-3)*unit*.34+sin(u,1,j*.1)*unit*.12;disk(xx,y+cos(u,1,j*.13)*unit*.18,unit*(.15+j%3*.05),j%2?fg:ac)}}
  if(v===2){for(let j=0;j<14;j++)ring(x,y,unit*(.07+j*.06)+sin(u)*unit*.03,j%2?fg:ac,unit*.013)}
  if(v===3){for(let j=0;j<9;j++)wave((j-4)*unit*.13,unit*.06,j%2?fg:ac,1)}
  if(v===4){for(let j=0;j<18;j++){let xx=j*w/17;rect(xx,y+sin(u,1,j*.08)*unit*.3,unit*.11,unit*.18,j%2?fg:ac)}}
  if(v===5){for(let j=0;j<13;j++)disk(x+sin(u,1,j*.09)*unit*.55,y+cos(u,1,j*.11)*unit*.32,unit*(.08+j%3*.03),j%2?fg:ac)}
  if(v===6){txt('LIQUID',x,y,unit*.8,fg);wave(unit*.4,unit*.15,ac,4)}
  if(v===7){for(let j=0;j<30;j++){let xx=j*w/29;line(xx,0,xx+sin(u,1,j*.08)*unit*.35,h,j%2?fg:ac,unit*.01)}}
  if(v===8){for(let j=0;j<9;j++){let xx=x+(j-4)*unit*.25;disk(xx,y+sin(u,1,j*.12)*unit*.35,unit*.16,j%2?fg:ac)}}
  if(v===9){for(let j=0;j<8;j++){let yy=y+(j-4)*unit*.15;line(0,yy+sin(u,1,j*.1)*unit*.12,w,yy+cos(u,1,j*.1)*unit*.12,j%2?fg:ac,unit*.04)}}
 }
 ctx.restore();
}
function render(canvas,phase,s=scene(),w=state.width,h=state.height){
 const ctx=canvas.getContext('2d',{alpha:false});const W=canvas.width,H=canvas.height;
 ctx.save();ctx.setTransform(W/w,0,0,H/h,0,0);paint(ctx,w,h,phase,s);ctx.restore();
}
function framePhase(){return state.frame/(state.fps*state.duration)}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function savePreset(){const s=scene();download(new Blob([JSON.stringify({scene:s,output:{width:state.width,height:state.height,fps:state.fps,duration:state.duration}},null,2)],{type:'application/json'}),s.id+'.json')}
function savePng(){const c=document.createElement('canvas');c.width=state.width;c.height=state.height;render(c,framePhase());c.toBlob(b=>b&&download(b,scene().id+'-'+String(state.frame).padStart(4,'0')+'.png'))}
function field(label,key,min,max,step=0.05){let s=scene();return '<div class="field"><label>'+label+' <span id="val-'+key+'">'+s[key]+'</span></label><input type="range" data-param="'+key+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+s[key]+'"></div>'}
function colorField(label,key){let s=scene();return '<div class="field"><label>'+label+' <span id="val-'+key+'">'+s[key]+'</span></label><select data-param="'+key+'">'+COLORS.map(c=>'<option value="'+c+'" '+(c===s[key]?'selected':'')+'>'+c+'</option>').join('')+'</select></div>'}
function nav(){return '<header><strong>VINILE / VISUAL LAB <span style="color:#ff481c">●</span></strong><nav><button data-tab="project" class="'+(state.tab==='project'?'active':'')+'">PROJECT</button><button data-tab="studio" class="'+(state.tab==='studio'?'active':'')+'">STUDIO</button></nav></header>'}
function project(){
 return nav()+'<main class="wrap"><div class="hero"><span class="eyebrow" style="color:#25120c">VINILE ROMA / MOVING IDENTITY / 2026</span><h1>AFTER<br>HOURS.</h1><p>Analog feeling. Digital behaviour. Fifty seamless 2D motion studies for a panoramic LED canvas. An evolving visual language from aperitivo to club.</p></div><div class="eyebrow">01 / THE FIVE WORLDS — 10 UNIQUE LOOPS EACH</div><div class="families">'+FAMILY.map((f,i)=>'<div class="family" style="background:'+f.base+'"><span>0'+(i+1)+' / 10 CLIPS</span><b>'+f.name+'</b></div>').join('')+'</div><div class="eyebrow">02 / COLOR SYSTEM</div><div class="palette">'+COLORS.map(c=>'<div class="swatch" title="'+c+'" style="background:'+c+'"></div>').join('')+'</div><div class="project-grid"><article><div class="eyebrow">03 / TYPOGRAPHY</div><h2>Bold sans.<br>No extra tracking.</h2><p>Heavy editorial type, tightly composed. Typography becomes an animated subject, not a caption.</p></article><article><div class="eyebrow">04 / PROCESS</div><h2>Flat color.<br>Graphic motion.</h2><p>Canvas 2D, geometric cutouts, repeating shapes, optical rhythm, halftone-inspired graphic structures and deterministic loops.</p></article><article><div class="eyebrow">05 / RHYTHM</div><h2>From warm<br>to late.</h2><p>The visual intensity follows the progression of a night at Vinile. Each of the 50 clips has a distinct built-in animation preset.</p></article><article><div class="eyebrow">06 / OUTPUT</div><h2>3000 × 512.<br>30 seconds.</h2><p>Panoramic compositions designed to loop. The Studio controls scene parameters, preview timing and output size; video export is the next production stage.</p></article></div><div class="footer">VINILE / VISUAL LAB — GENERATIVE 2D MOTION SYSTEM</div></main>';
}
function studio(){
 let s=scene(),f=FAMILY[s.family];
 return nav()+'<main class="wrap"><div class="sectionhead"><div><div class="eyebrow">LIVE SCENE / '+s.id+'</div><h2>'+s.name+'</h2></div><span class="chip">2D / SEAMLESS / 30 SEC</span></div><p class="status">'+f.name+' — preset '+(s.variant+1)+'/10 · automatic motion</p><div class="studio"><div><div class="stage"><canvas id="preview" width="1500" height="256"></canvas><div class="toolbar"><button id="play">'+(state.playing?'PAUSE':'PLAY')+'</button><button id="restart">RESTART</button><input id="scrub" type="range" min="0" max="'+(state.fps*state.duration-1)+'" value="'+state.frame+'"><span id="time" class="status">00.00 / 30.00</span></div><p class="loop-note">Loop: frame 0 = virtual frame '+(state.fps*state.duration)+'. The last exported frame is intentionally not duplicated.</p></div><div class="sectionhead"><h2>CLIP LIBRARY</h2><span class="status">50 scenes / 5 families</span></div>'+FAMILY.map((fam,fi)=>'<div class="sectionhead"><div class="eyebrow">'+String(fi+1).padStart(2,'0')+' / '+fam.name+'</div></div><div class="scene-list">'+SCENES.map((it,i)=>it.family===fi?'<button data-scene="'+i+'" class="'+(state.index===i?'active':'')+'"><b>'+String(it.variant+1).padStart(2,'0')+' / '+it.name+'</b>'+it.id+'</button>':'').join('')+'</div>').join('')+'</div><aside class="panel"><h3>SCENE PARAMETERS</h3>'+field('Speed / periodic motion','speed',.25,4,.25)+field('Scale','scale',.3,2,.05)+field('Density','density',0,1,.05)+colorField('Background','background')+colorField('Foreground','foreground')+colorField('Accent','accent')+'<h3>GLOBAL OUTPUT</h3><div class="two"><div class="field"><label>Width</label><input id="width" type="number" min="320" max="7680" value="'+state.width+'"></div><div class="field"><label>Height</label><input id="height" type="number" min="128" max="4320" value="'+state.height+'"></div></div><div class="field"><label>FPS</label><select id="fps">'+[25,30,60].map(n=>'<option '+(n===state.fps?'selected':'')+'>'+n+'</option>').join('')+'</select></div><div class="field"><label>Energy <span id="energyVal">'+state.energy+'</span></label><input id="energy" type="range" min=".5" max="2" step=".5" value="'+state.energy+'"></div><div class="two"><button id="png">EXPORT PNG</button><button id="preset">SAVE JSON</button></div><p class="loop-note">Video/DXV export will be implemented in the next stage. PNG is full resolution.</p><p class="loop-note">Scene changes are kept in memory for this session; export JSON to save the preset.</p></aside></div><div class="footer">VINILE / VISUAL LAB — 50 DISTINCT 2D MOTION PRESETS</div></main>';
}
let last=performance.now(),elapsed=0;
function mount(){
 $('#app').innerHTML=state.tab==='project'?project():studio();
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;mount()});
 if(state.tab!=='studio')return;
 document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{state.index=Number(b.dataset.scene);state.frame=0;elapsed=0;mount()});
 document.querySelectorAll('[data-param]').forEach(el=>el.oninput=()=>{let key=el.dataset.param,s=scene();let value=el.tagName==='SELECT'?el.value:Number(el.value);state.custom[s.id]={...state.custom[s.id],[key]:value};$('#val-'+key).textContent=value;draw()});
 $('#play').onclick=()=>{state.playing=!state.playing;$('#play').textContent=state.playing?'PAUSE':'PLAY'};
 $('#restart').onclick=()=>{state.frame=0;elapsed=0;draw()};
 $('#scrub').oninput=e=>{state.frame=Number(e.target.value);elapsed=0;draw()};
 $('#width').onchange=e=>{state.width=clamp(Number(e.target.value)||3000,320,7680)};
 $('#height').onchange=e=>{state.height=clamp(Number(e.target.value)||512,128,4320)};
 $('#fps').onchange=e=>{state.fps=Number(e.target.value);state.frame=0;mount()};
 $('#energy').oninput=e=>{state.energy=Number(e.target.value);$('#energyVal').textContent=state.energy;draw()};
 $('#png').onclick=savePng;$('#preset').onclick=savePreset;
 draw();
}
function draw(){const c=$('#preview');if(!c)return;render(c,framePhase());$('#time').textContent=(state.frame/state.fps).toFixed(2)+' / '+state.duration.toFixed(2);$('#scrub').value=state.frame}
function tick(now){const dt=Math.min(100,now-last);last=now;if(state.playing&&state.tab==='studio'){elapsed+=dt;const step=1000/state.fps;if(elapsed>=step){const n=Math.floor(elapsed/step);elapsed-=n*step;state.frame=(state.frame+n)%(state.fps*state.duration);draw()}}requestAnimationFrame(tick)}
mount();requestAnimationFrame(tick);
