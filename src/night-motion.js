import * as THREE from 'three';
// NIGHT SHIFT — ten actual 3D environments. Deterministic 20-second spatial loops.
// Shared WebGL scene -> the existing Canvas2D preview/PNG/video pipeline.
const TAU=Math.PI*2;
let renderer,scene,camera,root,actors=[],key='',errorShown=false;
const seed=n=>{const x=Math.sin(n*127.1+78.233)*43758.5453;return x-Math.floor(x)};
function mat(hex,emissive=1,wire=false,opacity=1){
 return new THREE.MeshStandardMaterial({color:hex,emissive:hex,emissiveIntensity:emissive,metalness:.6,roughness:.24,wireframe:wire,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1});
}
function add(geo,m,x=0,y=0,z=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);actors.push(o);return o}
function line(points,color,opacity=.8){
 const g=new THREE.BufferGeometry().setFromPoints(points);
 const o=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity}));
 root.add(o);actors.push(o);return o;
}
function tube(points,r,color,opacity=1){
 return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(48,points.length*2),r,6,false),mat(color,.9,false,opacity));
}
function ring(r,z,color,thickness=.016){
 const o=add(new THREE.TorusGeometry(r,thickness,6,96),mat(color,1.3),0,0,z);return o;
}
function setup(){
 const canvas=document.createElement('canvas');
 renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'default'});
 renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(55,4.5,.05,180);
 scene.add(new THREE.AmbientLight(0xffffff,.18));
 const l=new THREE.DirectionalLight(0xffffff,3.2);l.position.set(-4,9,8);l.castShadow=true;l.shadow.mapSize.set(1024,1024);l.shadow.camera.left=-16;l.shadow.camera.right=16;l.shadow.camera.top=12;l.shadow.camera.bottom=-12;l.shadow.camera.near=.5;l.shadow.camera.far=55;l.shadow.bias=-.0003;scene.add(l);
 const rim=new THREE.PointLight(0xffffff,45,35);rim.position.set(7,2,-9);scene.add(rim);
 root=new THREE.Group();scene.add(root);
}
function clear(){
 scene.remove(root);
 root.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});
 root=new THREE.Group();scene.add(root);actors=[];
}
function build(v,fg,accent,bg,density){
 clear();
 const n=Math.max(1,density);
 const primary=mat(fg,1.2),secondary=mat(accent,1.5),dim=mat(fg,.35,true,.35);
 const floor=mat(fg,.2,true,.3);
 // 01 / CHROMATIC OBJECT FIELD — physical sculpture gallery inspired by batched 3D objects.
 if(v===0){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,95),new THREE.MeshStandardMaterial({color:bg,metalness:.12,roughness:.74}));
  ground.rotation.x=-Math.PI/2;ground.position.set(0,-2.3,-16);ground.receiveShadow=true;root.add(ground);actors.push(ground);
  const knot=new THREE.TorusKnotGeometry(.44,.16,96,12,2,3);
  const ball=new THREE.IcosahedronGeometry(.57,1);
  const block=new THREE.OctahedronGeometry(.62,0);
  const geometries=[knot,ball,block];
  const palette=[fg,accent,'#FF481C','#F5EFE5'];
  for(let shape=0;shape<3;shape++){
   const count=(shape===0?30:45)*n;
   const material=new THREE.MeshStandardMaterial({color:0xffffff,metalness:.72,roughness:.24});
   const batch=new THREE.InstancedMesh(geometries[shape],material,count);
   batch.castShadow=true;batch.receiveShadow=true;
   const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),pos=new THREE.Vector3(),scale=new THREE.Vector3();
   for(let i=0;i<count;i++){
    const idx=i+shape*400;
    const z=2-seed(idx+5)*35;
    const x=(seed(idx+17)-.5)*13;
    const y=-1.35+seed(idx+33)*4.8;
    pos.set(x,y,z);
    q.setFromEuler(new THREE.Euler(seed(idx+1)*TAU,seed(idx+2)*TAU,seed(idx+3)*TAU));
    const k=.45+seed(idx+7)*1.25;scale.setScalar(k);
    matrix.compose(pos,q,scale);batch.setMatrixAt(i,matrix);
    batch.setColorAt(i,new THREE.Color(palette[idx%palette.length]));
   }
   batch.instanceMatrix.needsUpdate=true;root.add(batch);actors.push(batch);
  }
  for(let i=0;i<11;i++){
   const z=1-i*3.5;
   const pedestal=add(new THREE.CylinderGeometry(.65,.85,.28,8),mat(i%2?fg:accent,.08),((i%3)-1)*3,-2.13,z);
   pedestal.castShadow=true;
  }
 }
 // 02 / QUANTUM PASSAGE — portal frames, luminous rails and depth fog.
 if(v===1){
  for(let k=0;k<34+n*7;k++){
   const z=-k*1.1;
   const s=1.5+.22*Math.sin(k*.5);
   const pts=[new THREE.Vector3(-s,-s*.6,z),new THREE.Vector3(-s,s*.6,z),new THREE.Vector3(s,s*.6,z),new THREE.Vector3(s,-s*.6,z),new THREE.Vector3(-s,-s*.6,z)];
   tube(pts,.018,k%5===0?accent:fg);
   if(k%3===0){ring(.35,z-.3,accent,.013)}
  }
  for(let x of [-1.6,1.6])tube([new THREE.Vector3(x,-1,3),new THREE.Vector3(x,-1,-42)],.023,accent);
 }
 // 03 / NEURAL GARDEN — branching luminous organic growth.
 if(v===2){
  for(let i=0;i<36+n*12;i++){
   const x=(seed(i+3)-.5)*12,z=-(seed(i+30)*18),height=.8+seed(i+80)*4;
   const pts=[];for(let j=0;j<12;j++){const t=j/11;pts.push(new THREE.Vector3(x+Math.sin(t*5+i)*t*.7,-2+t*height,z+Math.cos(t*4+i)*t*.6))}
   tube(pts,.018,i%4===0?accent:fg,.85);
   for(let k=0;k<3;k++){
    const p=pts[4+k*3],branch=[p,p.clone().add(new THREE.Vector3((seed(i+k*30)-.5)*1.8,.4,(seed(i+k*45)-.5)*1.5))];
    tube(branch,.009,accent,.7);
   }
  }
 }
 // 04 / SYNTHETIC OCEAN — actual undulating 3D mesh with deep horizon.
 if(v===3){
  const g=new THREE.PlaneGeometry(26,48,85,110);g.rotateX(-Math.PI/2);
  const o=add(g,mat(fg,.7,true,.75),0,-1,-13);o.userData.wave=true;
  const h=add(new THREE.SphereGeometry(1.2,24,12),mat(accent,1.2),0,.2,-31);h.scale.set(4,.2,.3);
  for(let i=0;i<16;i++)line([new THREE.Vector3(-13,-1,-i*3),new THREE.Vector3(13,-1,-i*3)],accent,.2);
 }
 // 05 / NEON MEGACITY — architectural skyline, lit window strips and fly-through.
 if(v===4){
  for(let i=0;i<120+n*30;i++){
   const side=i%2?-1:1,x=side*(1.7+seed(i+6)*6.5),z=3-i*.28;
   const height=1.2+seed(i+15)*8;
   const b=add(new THREE.BoxGeometry(.6+seed(i+4)*1.1,height,.7+seed(i+8)*1.5),mat(fg,.08,false,.5),x,-2+height/2,z);
   for(let j=0;j<Math.floor(height*2);j++){
    if(seed(i*20+j)>.35)add(new THREE.BoxGeometry(.06,.05,.035),j%3===0?secondary:primary,x-side*.35,-1.7+j*.46,z+.4);
   }
  }
  for(let side of [-1,1])tube([new THREE.Vector3(side*1.2,-1.95,4),new THREE.Vector3(side*1.2,-1.95,-38)],.018,accent);
 }
 // 06 / DATA CYCLONE — 3D particle helices around the camera axis.
 if(v===5){
  const pts=[],cols=[];
  for(let i=0;i<5000+n*1000;i++){
   const u=i/(5000+n*1000),a=i*2.399963+u*22,r=.5+seed(i+20)*3.8;
   pts.push(Math.cos(a)*r,Math.sin(a)*r,-u*40+2);
   const color=new THREE.Color(i%5===0?accent:fg);cols.push(color.r,color.g,color.b);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const o=new THREE.Points(g,new THREE.PointsMaterial({size:.045,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.9}));
  root.add(o);actors.push(o);
 }
 // 07 / SYNTHETIC VINES — sculptural looping strands suspended in depth.
 if(v===6){
  for(let i=0;i<15+n*5;i++){
   const pts=[];for(let j=0;j<90;j++){
    const u=j/89,a=u*TAU*(2+i%3);
    pts.push(new THREE.Vector3(Math.cos(a+i)*(.7+i*.12),Math.sin(a*1.5+i)*(.45+i*.055),-u*12-i*.23));
   }
   tube(pts,.014+i%3*.012,i%4===0?accent:fg,.7);
  }
 }
 // 08 / IMPOSSIBLE CITY — stacked floating architectural grids.
 if(v===7){
  for(let k=0;k<26+n*6;k++){
   const z=-k*1.25,angle=k*.17;
   const g=new THREE.Group();root.add(g);actors.push(g);g.position.z=z;g.rotation.z=angle;
   for(let x=-2;x<=2;x++){
    const o=new THREE.Mesh(new THREE.BoxGeometry(.025,3.8,.025),x===0?secondary:primary);o.position.x=x*.65;g.add(o);
   }
   for(let y=-2;y<=2;y++){
    const o=new THREE.Mesh(new THREE.BoxGeometry(3.8,.025,.025),y===0?secondary:primary);o.position.y=y*.65;g.add(o);
   }
  }
 }
 // 09 / PHOTON FOREST — volumetric fibre-optic trails.
 if(v===8){
  for(let i=0;i<85+n*25;i++){
   const x=(seed(i+2)-.5)*10,y=(seed(i+5)-.5)*4,z=-(seed(i+7)*32);
   const pts=[];for(let j=0;j<20;j++){const u=j/19;pts.push(new THREE.Vector3(x+Math.sin(u*6+i)*.5*u,y+u*1.5,z+Math.cos(u*4+i)*.4))}
   tube(pts,.008,i%5===0?accent:fg,.8);
  }
 }
 // 10 / EVENT HORIZON — layered accretion rings, nested depth.
 if(v===9){
  for(let i=0;i<65+n*12;i++){
   const z=-i*.22,r=.25+i*.045;
   const o=ring(r,z,i%5===0?accent:fg,.008+i%3*.004);
   o.rotation.x=Math.sin(i*.2)*.32;o.rotation.y=Math.cos(i*.27)*.22;
  }
  add(new THREE.SphereGeometry(.43,32,24),new THREE.MeshBasicMaterial({color:bg}),0,0,0);
 }
}
export function renderNight(c,w,h,phase,s,p,P){
 try{
  if(!renderer)setup();
  const rw=Math.max(2,Math.min(1400,Math.round(w))),rh=Math.max(2,Math.round(h*rw/w));
  renderer.setSize(rw,rh,false);camera.aspect=rw/rh;
  camera.fov=p.perspective??55;camera.updateProjectionMatrix();
  const density=Math.max(1,Math.round(p.geometryDensity||1));
  const nextKey=[s.variant,s.colors[0],s.colors[1],P.highlight,density].join('|');
  if(key!==nextKey){build(s.variant,s.colors[1],P.highlight,s.colors[0],density);key=nextKey}
  scene.background=new THREE.Color(s.colors[0]);
  scene.fog=new THREE.FogExp2(s.colors[0],.025);
  const t=TAU*((phase*(p.speed||1))%1),v=s.variant;
  root.scale.setScalar(p.scale||1);
  root.rotation.set((p.rotationX??.15)*.25+Math.sin(t)*.035,(p.rotationY??.25)*.25+Math.sin(t)*.045,0);
  const travel=(.5-.5*Math.cos(t))*2;
  if(v===3){const o=actors.find(x=>x.userData?.wave);if(o){const pos=o.geometry.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,.28*Math.sin(x*.9+Math.sin(t)*.4+z*.28)*Math.cos(z*.5+Math.cos(t)*.5))}pos.needsUpdate=true}}
  if(v===0){root.rotation.y=Math.sin(t)*.045;root.position.x=Math.sin(t)*.35;}
  if(v===5)root.rotation.z=Math.sin(t)*.25;
  if(v===9)root.rotation.z=Math.sin(t)*.15;
  const depth=p.cameraDepth||0;
  const camZ=v===3?4:5;
  camera.position.set(Math.sin(t)*.3, v===3?.25:0,camZ-depth-travel*.5);
  camera.lookAt(Math.sin(t)*.2,v===3?-.5:0,-7);
  renderer.render(scene,camera);
  c.drawImage(renderer.domElement,0,0,w,h);
 }catch(err){
  if(!errorShown){console.error('NIGHT SHIFT WebGL failure:',err);errorShown=true}
  // Visible error state rather than deceptively presenting fallback rings as a cyberworld.
  c.fillStyle='#0A0809';c.fillRect(0,0,w,h);
  c.fillStyle='#FF481C';c.font=Math.max(14,Math.round(h*.045))+'px monospace';
  c.fillText('NIGHT SHIFT / WEBGL ERROR — OPEN F12 CONSOLE',w*.04,h*.52);
 }
}
