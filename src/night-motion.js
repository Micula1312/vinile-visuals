import * as THREE from 'three';
// NIGHT SHIFT / ten deterministic spatial scores. One reusable WebGL renderer.
const TAU=Math.PI*2;
let renderer,canvas,scene,camera,group,objects=[],mode=-1,light,warned=false;
const material=(color,wire=false,opacity=1)=>new THREE.MeshBasicMaterial({color,wireframe:wire,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1});
const lineMaterial=color=>new THREE.LineBasicMaterial({color,transparent:true,opacity:.8});
function mesh(geometry,mat,x=0,y=0,z=0){const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);group.add(o);objects.push(o);return o}
function line(points,color){const g=new THREE.BufferGeometry().setFromPoints(points);const o=new THREE.LineLoop(g,lineMaterial(color));group.add(o);objects.push(o);return o}
function init(){
 canvas=document.createElement('canvas');
 renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(48,2.25,.1,150);
 group=new THREE.Group();scene.add(group);
}
function build(v,fg,accent,bg,density){
 if(group){scene.remove(group);group.traverse(o=>{o.geometry?.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}})}
 group=new THREE.Group();scene.add(group);objects=[];mode=v;
 const a=fg,b=accent;
 const torus=(r,t,x,y,z,color,wire=false)=>mesh(new THREE.TorusGeometry(r,t,10,96),material(color,wire),x,y,z);
 const box=(x,y,z,sx,sy,sz,color,wire=false)=>mesh(new THREE.BoxGeometry(sx,sy,sz),material(color,wire),x,y,z);
 if(v===0){for(let i=0;i<3+density;i++){let o=torus(1.15+i*.19,.035+i*.006,0,0,0,i%2?a:b);o.rotation.set(i*.5,i*.8,0);o.userData={i}}}
 if(v===1){for(let i=0;i<12+density*5;i++){let o=box(0,0,-i*.65,3.3,1.6,.02,i%3?b:a,true);o.userData={i}}}
 if(v===2){for(let i=0;i<6+density*3;i++){let o=mesh(new THREE.IcosahedronGeometry(.25+(i%3)*.12,2),material(i%3?a:b,true),Math.sin(i*2.4)*1.8,Math.cos(i*1.6)*.9,-(i%4)*.5);o.userData={i}}}
 if(v===3){const geo=new THREE.PlaneGeometry(9,5,65,35);geo.rotateX(-Math.PI/2);const o=mesh(geo,material(a,true));o.userData={terrain:true,base:Float32Array.from(geo.attributes.position.array)};o.rotation.x=.18;o.position.y=-.7}
 if(v===4){for(let i=0;i<5+density*3;i++){let o=box((i-(4+density*3)/2)*.52,0,-i*.22,.18,1.2+(i%4)*.45,.22,i%3?a:b);o.userData={i}}}
 if(v===5){const n=450+density*350;const p=new Float32Array(n*3);for(let i=0;i<n;i++){const r=.2+2.2*Math.sqrt(i/n),theta=i*2.39996;p[i*3]=r*Math.cos(theta);p[i*3+1]=r*Math.sin(theta)*.55;p[i*3+2]=Math.sin(i*.17)*1.1}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));const o=new THREE.Points(geo,new THREE.PointsMaterial({color:a,size:.035,sizeAttenuation:true}));group.add(o);objects.push(o)}
 if(v===6){for(let j=0;j<2+density;j++){const pts=[];for(let i=0;i<180;i++){const t=i/179*TAU*2;pts.push(new THREE.Vector3(Math.cos(t+j)*(.6+j*.24),Math.sin(t*1.5+j)*.65,t/TAU-1))}const curve=new THREE.CatmullRomCurve3(pts);let o=mesh(new THREE.TubeGeometry(curve,240,.055,8,false),material(j%2?a:b));o.userData={i:j}}}
 if(v===7){for(let z=0;z<7+density*3;z++)for(let x=-3;x<=3;x++){let o=box(x*.48,Math.sin(x+z)*.2,-z*.62,.37,.37,.37,(x+z)%3?a:b,true);o.userData={i:z+x}}}
 if(v===8){for(let i=0;i<8+density*3;i++){const pts=[];for(let j=0;j<120;j++){let t=j/119*TAU;pts.push(new THREE.Vector3(Math.cos(t+i*.6)*(1+i*.08),Math.sin(t+i*.6)*(.2+i*.06),Math.sin(t*3+i)*.4))}let o=line(pts,i%2?a:b);o.userData={i}}}
 if(v===9){for(let i=0;i<16+density*4;i++){let o=torus(.22+i*.095,.012,0,0,-i*.11,i%4?a:b);o.userData={i}}}
}
export function renderNight(c,w,h,phase,s,p,P){
 try{
  if(!renderer)init();
  const rw=Math.max(2,Math.min(w,1600)),rh=Math.max(2,Math.round(h*rw/w));
  camera.aspect=rw/rh;camera.updateProjectionMatrix();
  renderer.setSize(rw,rh,false);
  const density=Math.max(0,Math.round((p.geometryDensity??1)-1));
  const key=s.variant+'|'+s.colors[1]+'|'+P.highlight+'|'+density;
  if(mode!==key){build(s.variant,s.colors[1],P.highlight,s.colors[0],density);mode=key}
  scene.background=new THREE.Color(s.colors[0]);
  const t=TAU*((phase*(p.speed||1))%1),v=s.variant;
  const size=p.scale||1;group.scale.setScalar(size*1.55);
  const rotX=p.rotationX??.15,rotY=p.rotationY??.25;
  group.rotation.set(rotX+Math.sin(t)*.12,rotY+Math.sin(t)*.24,0);
  if(v===0)objects.forEach((o,i)=>{o.rotation.x=t*(i%2?1:-1)+i*.55;o.rotation.y=t*(i%3?1:-1)+i*.7});
  if(v===1)objects.forEach((o,i)=>{o.position.z=-i*.65+(Math.sin(t)*.4);o.rotation.z=Math.sin(t+i*.2)*.08});
  if(v===2)objects.forEach((o,i)=>{o.position.y=Math.cos(t+i*1.2)*.8;o.position.x=Math.sin(t+i*.7)*1.7;o.rotation.y=t});
  if(v===3){const o=objects[0],attr=o.geometry.attributes.position,base=o.userData.base;for(let i=0;i<attr.count;i++){const x=base[i*3],z=base[i*3+2];attr.setY(i,.25*Math.sin(x*1.5+t)*Math.cos(z*2-t))}attr.needsUpdate=true}
  if(v===4)objects.forEach((o,i)=>{o.scale.y=.7+.3*Math.sin(t+i*.5);o.position.y=Math.sin(t+i*.4)*.25});
  if(v===5)objects[0].rotation.z=t;
  if(v===6)objects.forEach((o,i)=>{o.rotation.z=t*(i%2?1:-1)*.4;o.rotation.y=Math.sin(t+i)*.4});
  if(v===7)objects.forEach((o,i)=>{o.rotation.x=t*.15;o.rotation.y=t*.12;o.position.y=Math.sin(t+i*.4)*.22});
  if(v===8)objects.forEach((o,i)=>{o.rotation.y=t*(i%2?1:-1)*.3;o.rotation.z=Math.sin(t+i)*.15});
  if(v===9)objects.forEach((o,i)=>{o.position.z=-i*.11+.15*Math.sin(t+i*.25);o.scale.setScalar(.9+.1*Math.sin(t+i*.4))});
  const depth=p.cameraDepth??0;camera.fov=p.perspective??48;camera.updateProjectionMatrix();
  camera.position.set(0,0,Math.max(2.5,4.5-depth));camera.lookAt(0,0,v===3?-1:0);
  renderer.render(scene,camera);
  // The output is copied to the 2D export canvas after each WebGL frame.
  c.drawImage(renderer.domElement,0,0,w,h);
 }catch(err){if(!warned){console.error('Night Shift 3D renderer failed; showing Canvas fallback:',err);warned=true}nightFallback(c,w,h,phase,s,p,P)}
}

function nightFallback(c,w,h,phase,s,p,P){
 const t=TAU*phase*(p.speed||1),v=s.variant;
 c.fillStyle=s.colors[0];c.fillRect(0,0,w,h);
 c.save();c.translate(w/2,h/2);
 const unit=h*.34*(p.scale||1),accent=P.highlight,fg=s.colors[1];
 c.lineWidth=Math.max(2,h*.007);
 // Visible diagnostic-grade fallback, still animated and scene-specific.
 const n=5+v*2;
 for(let i=0;i<n;i++){
  const a=t*(i%2?1:-1)*.2+i*TAU/n;
  const x=Math.cos(a)*(w*.12+i*w*.012),y=Math.sin(a)*h*.22;
  c.strokeStyle=i%3===0?accent:fg;
  c.beginPath();
  if(v%3===0)c.ellipse(x,y,unit*(.3+i*.12),unit*(.25+i*.09),a,0,TAU);
  else if(v%3===1)c.rect(x-unit*.4,y-unit*.4,unit*.8,unit*.8);
  else{c.moveTo(x,y);c.lineTo(x+Math.cos(a)*unit,y+Math.sin(a)*unit)}
  c.stroke();
 }
 c.restore();
}
